import puppeteer from "puppeteer";
import { STANDINGS_HASHES, STANDINGS_TAB_LABELS } from "../config.js";

const BASE_URL = "https://www.flashscore.com.ar/futbol/argentina/liga-profesional/clasificacion/";

async function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

function buildFallbackUrl(tableType) {
  const hash = STANDINGS_HASHES[tableType];
  return `${BASE_URL}${hash}/clasificacion/`;
}

// Scrapes a standings table by navigating dynamically to the correct tab.
// Falls back to the hardcoded hash URL if the tab is not found.
async function scrapeTable(tableType) {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  await page.emulateTimezone("America/Argentina/Buenos_Aires");
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image", "font", "stylesheet", "media"].includes(type)) req.abort();
    else req.continue();
  });

  // Try dynamic navigation first: find the tab by its label text
  try {
    await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 30000 });

    const tabLabel = STANDINGS_TAB_LABELS[tableType];
    const tabHref = await page.evaluate((label) => {
      const links = Array.from(document.querySelectorAll("a, button, [role='tab']"));
      const match = links.find((el) =>
        el.innerText?.trim().toUpperCase() === label.toUpperCase()
      );
      return match?.href ?? null;
    }, tabLabel);

    if (tabHref) {
      await page.goto(tabHref, { waitUntil: "networkidle2", timeout: 30000 });
    } else {
      // Tab not found by text — use fallback hash URL
      console.warn(`[standings] Tab "${tabLabel}" not found dynamically, using fallback URL.`);
      await page.goto(buildFallbackUrl(tableType), { waitUntil: "networkidle2", timeout: 30000 });
    }
  } catch {
    // Any navigation error — try fallback
    console.warn(`[standings] Dynamic navigation failed for "${tableType}", using fallback URL.`);
    await page.goto(buildFallbackUrl(tableType), { waitUntil: "networkidle2", timeout: 30000 });
  }

  await page.waitForSelector(".ui-table", { timeout: 15000 });

  const rows = await page.evaluate((tableType) => {
    const tables = document.querySelectorAll(".ui-table");
    const result = [];

    tables.forEach((table) => {
      const groupText = table.querySelector('.ui-table__headerCell[title^="Grupo"]')?.innerText;
      let group = "general";
      const normalized = groupText?.toUpperCase();
      if (normalized?.includes("GRUPO A")) group = "A";
      if (normalized?.includes("GRUPO B")) group = "B";

      const tableRows = table.querySelectorAll(".ui-table__body .ui-table__row");
      const toInt = (el) => parseInt(el?.innerText?.trim() ?? "0", 10) || 0;

      tableRows.forEach((row) => {
        const team = row.querySelector(".tableCellParticipant__name")?.innerText?.trim();
        const logo = row.querySelector(".participant__image")?.src ?? "";
        if (!team) return;

        const cells = Array.from(row.querySelectorAll(".table__cell--value"));

        const played = toInt(cells[0]);
        const won    = toInt(cells[1]);
        const drawn  = toInt(cells[2]);
        const lost   = toInt(cells[3]);

        const goalsText = cells[4]?.innerText?.trim() ?? "0:0";
        const [goalsFor, goalsAgainst] = goalsText.includes(":")
          ? goalsText.split(":").map(Number)
          : [toInt(cells[4]), 0];

        const points = toInt(cells[6]);

        const formIcons = Array.from(row.querySelectorAll(".tableCellFormIcon"));
        const form = formIcons.map((icon) => {
          const testId = icon.querySelector("[data-testid]")?.getAttribute("data-testid") ?? "";
          if (testId.includes("win"))  return "V";
          if (testId.includes("draw")) return "E";
          if (testId.includes("lose")) return "L";
          return null;
        }).filter(Boolean).join(",");

        result.push({ team, group, logo, played, won, drawn, lost, goalsFor, goalsAgainst, points, form });
      });
    });

    return result;
  }, tableType);

  await browser.close();

  return rows.map((r) => ({ ...r, tableType }));
}

export const getStandings = (tableType = "apertura") => scrapeTable(tableType);

export const getAllStandings = async () => {
  const [apertura, anual, promedios] = await Promise.all([
    scrapeTable("apertura"),
    scrapeTable("anual"),
    scrapeTable("promedios"),
  ]);
  return [...apertura, ...anual, ...promedios];
};
