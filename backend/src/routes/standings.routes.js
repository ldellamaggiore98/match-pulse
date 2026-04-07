import { Router } from "express";
import { getStandings, getAllStandings } from "../../../scraper/src/scrapers/standings.scraper.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

const VALID_TYPES = ["apertura", "anual", "promedios"];

// GET /standings/update?type=apertura|anual|promedios|all
router.get("/update", async (req, res) => {
  const type = req.query.type ?? "all";
  try {
    let data;
    if (type === "all") {
      console.log("[standings] Scraping all tables...");
      data = await getAllStandings();
      await prisma.standing.deleteMany();
    } else if (VALID_TYPES.includes(type)) {
      console.log(`[standings] Scraping ${type}...`);
      data = await getStandings(type);
      await prisma.standing.deleteMany({ where: { tableType: type } });
    } else {
      return res.status(400).json({ error: `Invalid type. Use: ${VALID_TYPES.join(", ")}, all` });
    }

    await prisma.standing.createMany({ data });
    res.json({ message: "Standings updated successfully", count: data.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating standings" });
  }
});

// GET /standings?type=apertura|anual|promedios
router.get("/", async (req, res) => {
  const type = req.query.type ?? "apertura";
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `Invalid type. Use: ${VALID_TYPES.join(", ")}` });
  }

  try {
    const data = await prisma.standing.findMany({ where: { tableType: type } });

    const groupA   = data.filter((t) => t.group === "A" || t.group === "general");
    const groupB   = data.filter((t) => t.group === "B");
    const hasGroups = data.some((t) => t.group === "A" || t.group === "B");

    res.json({ groupA, groupB, hasGroups, tableType: type });
  } catch (error) {
    res.status(500).json({ error: "Error fetching standings" });
  }
});

// GET /standings/logos — returns { teamName: logoUrl } map from stored standings
router.get("/logos", async (req, res) => {
  try {
    const rows = await prisma.standing.findMany({
      where: { tableType: "apertura" },
      select: { team: true, logo: true },
    });
    const logos = Object.fromEntries(rows.map((r) => [r.team, r.logo]));
    res.json(logos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching logos" });
  }
});

export default router;
