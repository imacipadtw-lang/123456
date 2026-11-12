/* Stress check: random taps, keys and scans at every gate for a while; there must be no page error and the gate
   must still start a new player afterwards.   usage: node tools/tests/chaos.js [baseUrl] [seconds per gate] */
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:8767", secs = +(process.argv[3] || 25);
(async () => {
  const b = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] }); let fail = 0;
  for (let g = 1; g <= 6; g++) {
    const p = await b.newPage({ viewport: { width: 1366, height: 768 }, hasTouch: true }); const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    await p.goto(`${base}/station.html?gate=${g}`); await p.waitForTimeout(800);
    await p.click("#vipBtn"); const t0 = Date.now(); let n = 0;
    const keys = ["Enter", "Enter", "Enter", " ", "n", "h", "Escape", "c", "m", "s", "g", "ArrowLeft", "ArrowRight"];
    while (Date.now() - t0 < secs * 1000) {
      const r = Math.random();
      if (r < 0.45) await p.mouse.click(20 + Math.random() * 1320, 80 + Math.random() * 660).catch(() => {});
      else if (r < 0.9) await p.keyboard.press(keys[(Math.random() * keys.length) | 0]).catch(() => {});
      else { await p.keyboard.type("TCES-0" + ((Math.random() * 9) | 0) + "-3-Kid", { delay: 5 }); await p.keyboard.press("Enter"); }
      n++; await p.waitForTimeout(60 + Math.random() * 120);
    }
    // recover: back to the scan screen, then a fresh guest must be able to start
    for (let i = 0; i < 6; i++) { // close any teacher dialog that the random keys opened (settings, script card), then Esc
      const dlg = p.locator(".settings #sClose, .settings .save"); if (await dlg.count()) await dlg.first().click().catch(() => {});
      await p.keyboard.press("Escape"); await p.waitForTimeout(300);
    }
    await p.waitForTimeout(500);
    const scan = await p.evaluate(() => { const s = document.querySelector("#scan"); return !!s && getComputedStyle(s).display !== "none" && !s.classList.contains("hidden"); });
    let restarted = false;
    if (scan) { await p.click("#vipBtn").catch(() => {}); await p.waitForTimeout(2500); for (let i = 0; i < 12 && !restarted; i++) { restarted = await p.evaluate(() => !!document.querySelector("#talk.show")); await p.keyboard.press("Enter"); await p.waitForTimeout(500); } }
    const ok = !errs.length && scan && restarted; if (!ok) fail++;
    console.log(`${ok ? "PASS" : "FAIL"} gate ${g}: ${n} random actions, back to scan ${scan}, new player starts ${restarted}${errs.length ? " | " + [...new Set(errs)].slice(0, 3).join(" | ") : ""}`);
    await p.close();
  }
  await b.close(); process.exit(fail ? 1 : 0);
})();
