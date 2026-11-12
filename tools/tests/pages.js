/* Loads every page and reports page errors / missing files; checks the gate host cards print on 6 A4 pages.
   usage: node tools/tests/pages.js [baseUrl] */
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:8767";
(async () => {
  const b = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] }); let bad = 0;
  const pages = ["index.html", ...[1, 2, 3, 4, 5, 6].map((g) => `station.html?gate=${g}`), "station.html#gate-4", "control.html", "opening.html", "cards.html", "phone.html", "teacher-cards.html", "guide.html", "credits.html", "links.html"];
  for (const u of pages) {
    const p = await b.newPage({ viewport: { width: 1366, height: 768 } }); const errs = [];
    p.on("pageerror", (e) => errs.push(e.message)); p.on("response", (r) => { if (r.status() >= 400) errs.push(r.status() + " " + r.url().split("/").slice(-2).join("/")); });
    await p.goto(`${base}/${u}`, { waitUntil: "networkidle" }); await p.waitForTimeout(700);
    let extra = "";
    if (u === "teacher-cards.html") {
      extra = " fit=" + (await p.evaluate(() => [...document.querySelectorAll(".page")].map((pg) => Math.round([...pg.querySelectorAll("*")].reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom), 0) - pg.getBoundingClientRect().top) + "/" + Math.round(pg.getBoundingClientRect().height)).join(" ")));
      await p.emulateMedia({ media: "print" }); const pdf = await p.pdf({ format: "A4", preferCSSPageSize: true }); const n = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
      extra += " pdfPages=" + n; if (n !== 6) errs.push("host cards are not 6 pages");
    }
    if (u === "credits.html") extra = " rows=" + (await p.locator("#rows tr").count());
    console.log((errs.length ? "FAIL " : "ok   ") + u + extra + (errs.length ? "  " + errs.slice(0, 4).join(" | ") : "")); bad += errs.length; await p.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
