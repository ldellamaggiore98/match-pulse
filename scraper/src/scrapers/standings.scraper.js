import puppeteer from "puppeteer";

export const getStandings = async () => {
  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();

  await page.goto(
    "https://www.flashscore.com.ar/futbol/argentina/liga-profesional/clasificacion/KYiWfJVg/clasificacion/general/",
    { waitUntil: "networkidle2" }
  );

  await page.waitForSelector(".ui-table");
  await new Promise((res) => setTimeout(res, 3000));

  const debug = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".ui-table")).map((table) =>
      table.querySelector('.ui-table__headerCell[title^="Grupo"]')?.innerText
    );
  });

  console.log("DEBUG GROUPS:", debug);

  const data = await page.evaluate(() => {
    const tables = document.querySelectorAll(".ui-table");
    const result = [];

    tables.forEach((table) => {
      const groupText = table.querySelector(
        '.ui-table__headerCell[title^="Grupo"]',
      )?.innerText;

      let group = "UNKNOWN";

      const normalized = groupText?.toUpperCase();

      if (normalized?.includes("GRUPO A")) group = "A";
      if (normalized?.includes("GRUPO B")) group = "B";

      const rows = table.querySelectorAll(".ui-table__body .ui-table__row");

      rows.forEach((row) => {
        const team = row.querySelector(
          ".tableCellParticipant__name",
        )?.innerText;
        const points = row.querySelector(".table__cell--points")?.innerText;

        if (!team) return;

        result.push({
          team,
          points,
          group,
        });
      });
    });

    return result;
  });

  await browser.close();

  return data;
};