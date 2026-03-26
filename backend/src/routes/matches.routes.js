import { Router } from "express";
import { getMatches } from "../../../scraper/src/scrapers/matches.scraper.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /matches/update — scrapes latest matches and upserts them into the DB
router.get("/update", async (req, res) => {
  try {
    console.log("Scraping matches...");

    const data = await getMatches();

    if (data.length === 0) {
      return res.json({ message: "No matches found", count: 0 });
    }

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

    res.json({ message: "Matches updated successfully", count: data.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating matches" });
  }
});

// GET /matches — returns all matches from DB grouped by status
router.get("/", async (req, res) => {
  try {
    const data = await prisma.match.findMany({
      orderBy: { matchDate: "asc" },
    });

    res.json({
      live: data.filter((m) => m.status === "LIVE"),
      upcoming: data.filter((m) => m.status === "NS"),
      finished: data.filter((m) => m.status === "FT"),
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching matches" });
  }
});

export default router;
