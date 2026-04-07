import cron from "node-cron";
import { getAllStandings } from "../../scraper/src/scrapers/standings.scraper.js";
import { getMatches } from "../../scraper/src/scrapers/matches.scraper.js";
import { prisma } from "./lib/prisma.js";
import { io } from "./server.js";

let livePollingInterval = null;

// ─── Scraping logic ───────────────────────────────────────────────────────────

async function updateStandings() {
  try {
    console.log("[scheduler] Updating all standings tables...");
    const data = await getAllStandings();
    await prisma.standing.deleteMany();
    await prisma.standing.createMany({ data });
    console.log(`[scheduler] Standings updated (${data.length} rows).`);
  } catch (error) {
    console.error("[scheduler] Failed to update standings:", error.message);
  }
}

async function updateMatches() {
  try {
    const data = await getMatches();
    if (data.length === 0) return;

    await prisma.$transaction(
      data.map((match) =>
        prisma.match.upsert({
          where: { flashscoreId: match.flashscoreId },
          update: {
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            status: match.status,
            minute: match.minute,
            matchDate: match.matchDate,
          },
          create: match,
        })
      )
    );

    // Push updated matches to all connected clients
    const updated = await prisma.match.findMany({ orderBy: { matchDate: "asc" } });
    io.emit("matches:updated", {
      live: updated.filter((m) => m.status === "LIVE"),
      upcoming: updated.filter((m) => m.status === "NS"),
      finished: updated.filter((m) => m.status === "FT"),
    });
  } catch (error) {
    console.error("[scheduler] Failed to update matches:", error.message);
  }
}

// ─── Live polling ─────────────────────────────────────────────────────────────

function startLivePolling() {
  if (livePollingInterval) return;

  console.log("[scheduler] Starting live polling (every 60s).");

  livePollingInterval = setInterval(async () => {
    await updateMatches();

    const matches = await prisma.match.findMany({ where: { competition: "Liga Profesional" } });
    const todayMatches = getTodayMatches(matches);
    const allFinished = todayMatches.length > 0 && todayMatches.every((m) => m.status === "FT");

    if (allFinished) {
      console.log("[scheduler] All matches finished. Stopping live polling.");
      stopLivePolling();
    }
  }, 60_000);
}

function stopLivePolling() {
  if (livePollingInterval) {
    clearInterval(livePollingInterval);
    livePollingInterval = null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ART_OFFSET_MS = 3 * 60 * 60 * 1000; // UTC-3

function toARTDateString(date) {
  return new Date(date.getTime() - ART_OFFSET_MS).toISOString().slice(0, 10);
}

function getTodayMatches(matches) {
  const todayART = toARTDateString(new Date());
  return matches.filter((m) => toARTDateString(new Date(m.matchDate)) === todayART);
}

function getNextKickoff(todayMatches) {
  const upcoming = todayMatches
    .filter((m) => m.status === "NS")
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));

  return upcoming.length > 0 ? new Date(upcoming[0].matchDate) : null;
}

// ─── Director ─────────────────────────────────────────────────────────────────

// Evaluates the current match situation and decides what to do.
async function assess() {
  const matches = await prisma.match.findMany({ where: { competition: "Liga Profesional" } });
  const todayMatches = getTodayMatches(matches);

  if (todayMatches.length === 0) {
    console.log("[scheduler] No matches today.");
    return;
  }

  // If there's already a live match, start polling immediately
  const hasLive = todayMatches.some((m) => m.status === "LIVE");
  if (hasLive) {
    startLivePolling();
    return;
  }

  // If all finished, nothing to do
  const allFinished = todayMatches.every((m) => m.status === "FT");
  if (allFinished) {
    console.log("[scheduler] All matches already finished today.");
    return;
  }

  // Schedule polling to start 5 minutes before the next kickoff
  const nextKickoff = getNextKickoff(todayMatches);
  if (!nextKickoff) return;

  const startAt = new Date(nextKickoff.getTime() - 5 * 60_000);
  const msUntilStart = startAt.getTime() - Date.now();

  if (msUntilStart <= 0) {
    // Kickoff is imminent or already passed, start now
    startLivePolling();
  } else {
    const minutesUntil = Math.round(msUntilStart / 60_000);
    console.log(`[scheduler] Next match at ${nextKickoff.toISOString()}. Live polling starts in ${minutesUntil} min.`);

    setTimeout(() => {
      console.log("[scheduler] Kickoff window reached. Starting live polling.");
      startLivePolling();
    }, msUntilStart);
  }
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function startScheduler() {
  // Populate DB on first boot if empty
  const matchCount = await prisma.match.count();
  const standingCount = await prisma.standing.count();
  if (matchCount === 0 || standingCount === 0) {
    console.log("[scheduler] Empty DB detected, running initial data load...");
    await updateStandings();
    await updateMatches();
  }

  // Every day at 06:00 ART (09:00 UTC) — refresh standings and fixture
  cron.schedule("0 9 * * *", async () => {
    await updateStandings();
    await updateMatches();
    await assess();
  }, { timezone: "UTC" });

  // Re-assess every hour in case match times changed or DB was updated manually
  cron.schedule("0 * * * *", assess, { timezone: "UTC" });

  // Initial assessment on startup
  await assess();

  console.log("[scheduler] Started.");
}
