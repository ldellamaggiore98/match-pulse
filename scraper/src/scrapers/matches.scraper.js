import puppeteer from "puppeteer";

// Parses the time string from Flashscore's .event__time element.
// Formats: "21:00" (today) or "25.03. 19:00" (other day)
// Returns a UTC ISO string. Flashscore displays times in ART (UTC-3).
function parseMatchDate(timeText) {
  const now = new Date();
  const ART_OFFSET_MS = 3 * 60 * 60 * 1000;

  const todayMatch = timeText.match(/^(\d{2}):(\d{2})$/);
  if (todayMatch) {
    const [, hours, minutes] = todayMatch;
    const local = new Date(now.getFullYear(), now.getMonth(), now.getDate(), +hours, +minutes);
    return new Date(local.getTime() + ART_OFFSET_MS).toISOString();
  }

  const fullMatch = timeText.match(/^(\d{2})\.(\d{2})\.\s+(\d{2}):(\d{2})$/);
  if (fullMatch) {
    const [, day, month, hours, minutes] = fullMatch;
    const local = new Date(now.getFullYear(), +month - 1, +day, +hours, +minutes);
    return new Date(local.getTime() + ART_OFFSET_MS).toISOString();
  }

  return new Date().toISOString();
}

// Derives a normalized status string from the match row class list.
function parseStatus(classList) {
  if (classList.includes("event__match--live")) return "LIVE";
  if (classList.includes("event__match--scheduled")) return "NS";
  return "FT";
}

export const getMatches = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image", "font", "stylesheet", "media"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(
    "https://www.flashscore.com.ar/futbol/argentina/liga-profesional/",
    { waitUntil: "domcontentloaded" }
  );

  try {
    await page.waitForSelector(".event__match", { timeout: 15000 });
  } catch {
    await browser.close();
    return [];
  }

  const rawMatches = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".event__match")).map((row) => {
      const idParts = row.id?.split("_");
      const flashscoreId = idParts?.length >= 3 ? idParts[2] : null;

      const homeTeam = row.querySelector(".event__homeParticipant")?.innerText?.trim() ?? null;
      const awayTeam = row.querySelector(".event__awayParticipant")?.innerText?.trim() ?? null;
      const timeText = row.querySelector(".event__time")?.innerText?.trim() ?? null;
      const minute = row.querySelector(".event__stage")?.innerText?.trim() ?? null;

      const homeScoreText = row.querySelector(".event__score--home")?.innerText?.trim();
      const awayScoreText = row.querySelector(".event__score--away")?.innerText?.trim();

      return {
        flashscoreId,
        homeTeam,
        awayTeam,
        homeScore: homeScoreText !== undefined && homeScoreText !== "" ? parseInt(homeScoreText, 10) : null,
        awayScore: awayScoreText !== undefined && awayScoreText !== "" ? parseInt(awayScoreText, 10) : null,
        classList: row.className,
        timeText,
        minute: minute || null,
      };
    });
  });

  await browser.close();

  return rawMatches
    .filter((m) => m.flashscoreId && m.homeTeam && m.awayTeam)
    .map((m) => ({
      flashscoreId: m.flashscoreId,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeScore: isNaN(m.homeScore) ? null : m.homeScore,
      awayScore: isNaN(m.awayScore) ? null : m.awayScore,
      status: parseStatus(m.classList),
      minute: m.minute,
      matchDate: parseMatchDate(m.timeText ?? ""),
      competition: "Liga Profesional",
    }));
};
