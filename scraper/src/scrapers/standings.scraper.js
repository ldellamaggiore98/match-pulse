import puppeteer from "puppeteer";

export const getStandings = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.emulateTimezone("America/Argentina/Buenos_Aires");
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
    "https://www.flashscore.com.ar/futbol/argentina/liga-profesional/clasificacion/KYiWfJVg/clasificacion/general/",
    { waitUntil: "networkidle2", timeout: 30000 }
  );

  await page.waitForSelector(".ui-table");

  const data = await page.evaluate(() => {
    const tables = document.querySelectorAll(".ui-table");
    const result = [];

    tables.forEach((table) => {
      const groupText = table.querySelector('.ui-table__headerCell[title^="Grupo"]')?.innerText;
      let group = "UNKNOWN";
      const normalized = groupText?.toUpperCase();
      if (normalized?.includes("GRUPO A")) group = "A";
      if (normalized?.includes("GRUPO B")) group = "B";

      const rows = table.querySelectorAll(".ui-table__body .ui-table__row");

      rows.forEach((row) => {
        const team = row.querySelector(".tableCellParticipant__name")?.innerText?.trim();
        if (!team) return;

        // Numeric cells appear in order: P, V, E, D, GF, GC, Pts
        const cells = Array.from(row.querySelectorAll(".table__cell--value"));
        const toInt = (el) => parseInt(el?.innerText?.trim() ?? "0", 10) || 0;

        const played = toInt(cells[0]);
        const won    = toInt(cells[1]);
        const drawn  = toInt(cells[2]);
        const lost   = toInt(cells[3]);

        // cells[4] has format "14:9" (GF:GA) — parse each side
        const goalsText = cells[4]?.innerText?.trim() ?? "0:0";
        const [goalsFor, goalsAgainst] = goalsText.includes(":")
          ? goalsText.split(":").map(Number)
          : [toInt(cells[4]), 0];

        const points = toInt(cells[6]);

        // Form: each .tableCellFormIcon contains a div with data-testid indicating result
        const formIcons = Array.from(row.querySelectorAll(".tableCellFormIcon"));
        const form = formIcons.map((icon) => {
          const testId = icon.querySelector("[data-testid]")?.getAttribute("data-testid") ?? "";
          if (testId.includes("win"))  return "V";
          if (testId.includes("draw")) return "E";
          if (testId.includes("lose")) return "L";
          return null; // TBD / unknown
        }).filter(Boolean).join(",");

        result.push({ team, group, played, won, drawn, lost, goalsFor, goalsAgainst, points, form });
      });
    });

    return result;
  });

  await browser.close();
  return data;
};

