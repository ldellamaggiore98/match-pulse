import { Router } from "express";
import { getStandings } from "../../../scraper/src/scrapers/standings.scraper.js";

const router = Router();

let cache = null;
let lastFetch = 0;
const CACHE_TIME = 1000 * 60 * 5;

router.get("/", async (req, res) => {
  try {
    const now = Date.now();

    // 🧠 usar cache si es válido
    if (cache && now - lastFetch < CACHE_TIME) {
      console.log("⚡ Serving from cache");
      return res.json(cache);
    }

    console.log("🐢 Fetching new data...");

    const data = await getStandings();

    const groupA = data
      .filter((t) => t.group === "A")
      .map(({ group, ...rest }) => rest);

    const groupB = data
      .filter((t) => t.group === "B")
      .map(({ group, ...rest }) => rest);

    const formatted = { groupA, groupB };

    // 💾 guardar en cache
    cache = formatted;
    lastFetch = now;

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Error fetching standings" });
  }
});

export default router;