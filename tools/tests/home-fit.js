/* The home page must show all eight tiles (opening, six gates, Final Gate) on ONE screen with nothing cut off or
   shortened, at every screen shape.   usage: node tools/tests/home-fit.js [url of index.html] [screenshot prefix] */
const { chromium } = require("playwright");
(async () => {
  const url = process.argv[2] || "http://localhost:8767/index.html";
  const sizes = [[1920, 1080], [1366, 768], [1280, 720], [3840, 2160], [1024, 768], [2560, 1080], [390, 844], [412, 915], [768, 1024], [844, 390], [1180, 820]];
  const b = await chromium.launch();
  let bad = 0;
  for (const [w, h] of sizes) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    await p.goto(url);
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => {
      const tiles = Array.from(document.querySelectorAll("a.gate"));
      const vw = innerWidth, vh = innerHeight;
      let cut = 0, clipped = 0, minFont = 99;
      for (const t of tiles) {
        const q = t.getBoundingClientRect();
        if (q.left < -0.5 || q.top < -0.5 || q.right > vw + 0.5 || q.bottom > vh + 0.5) cut++;
        // nothing inside a tile may stick out of it
        for (const c of t.querySelectorAll("h2,.zh,.go,.top,.bdg")) { const cq = c.getBoundingClientRect(); if (cq.bottom > q.bottom + 1 || cq.right > q.right + 1 || cq.top < q.top - 1) clipped++; }
        const fs = parseFloat(getComputedStyle(t.querySelector("h2")).fontSize); if (fs < minFont) minFont = fs;
      }
      const lv = Array.from(document.querySelectorAll("#lvHome button")).some((x) => { const q = x.getBoundingClientRect(); return q.right > vw + 0.5 || q.bottom > vh + 0.5; });
      // every piece of text must be fully inside the screen and not shortened with "…"
      let textCut = 0;
      for (const el of document.querySelectorAll(".hero h1, .hero h1 span, .hero .sch, #lvHome b, #lvHome i, a.gate .th, a.gate h2, a.gate .zh")) { const q = el.getBoundingClientRect(); if (q.right > vw + 0.5 || q.bottom > vh + 0.5 || el.scrollWidth > el.clientWidth + 1) textCut++; }
      const hero = document.querySelector(".hero").getBoundingClientRect();
      return { tiles: tiles.length, cut, clipped, minFont: Math.round(minFont), scroll: document.documentElement.scrollHeight > vh + 1 || document.documentElement.scrollWidth > vw + 1, lvCut: lv, heroCut: hero.right > vw + 0.5, textCut };
    });
    const ok = r.tiles === 8 && !r.cut && !r.clipped && !r.scroll && !r.lvCut && !r.heroCut && !r.textCut && !errs.length;
    if (!ok) bad++;
    console.log((ok ? "ok   " : "FAIL ") + w + "x" + h + " " + JSON.stringify(r) + (errs.length ? " " + errs[0] : ""));
    if (process.argv[3] && (w === 1920 || w === 390 || w === 1366)) await p.screenshot({ path: process.argv[3] + "-" + w + ".png" });
    await p.close();
  }
  await b.close();
  process.exit(bad ? 1 : 0);
})();
