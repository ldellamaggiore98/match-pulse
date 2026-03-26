import { Router } from "express";
import { getStandings } from "../../../scraper/src/scrapers/standings.scraper.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /standings/update — scrapes latest standings and replaces all existing records
router.get("/update", async (req, res) => {
  try {
    console.log("Scraping standings...");

    const data = await getStandings();

    // Replace stale records with fresh scraped data
    await prisma.standing.deleteMany();
    await prisma.standing.createMany({ data });

    res.json({ message: "Standings updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating standings" });
  }
});

// GET /standings — returns cached standings from DB, split by group
router.get("/", async (req, res) => {
  try {
    const data = await prisma.standing.findMany();

    const groupA = data
      .filter((t) => t.group === "A")
      .map(({ group, ...rest }) => rest);

    const groupB = data
      .filter((t) => t.group === "B")
      .map(({ group, ...rest }) => rest);

    res.json({ groupA, groupB });
  } catch (error) {
    res.status(500).json({ error: "Error fetching standings" });
  }
});

export default router;
