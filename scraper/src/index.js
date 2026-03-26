import { getStandings } from "./scrapers/standings.scraper.js";

(async () => {
  const data = await getStandings();
  console.log(data);
})();