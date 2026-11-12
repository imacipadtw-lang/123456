/* End-to-end check: a guest plays a gate from the scan screen to the stamp (teacher presses ✓ for every answer).
   usage: node tools/tests/e2e.js [baseUrl] [gates e.g. 1,2,3] [levels e.g. 1,2]   (needs a static server on english-quest/) */
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:8767", gates = (process.argv[3] || "1,2,3,4,5,6").split(",").map(Number), levels = (process.argv[4] || "1,2").split(",").map(Number);
(async () => {
  const b = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"] });
  let fail = 0;
  for (const g of gates) for (const L of levels) {
    const p = await b.newPage({ viewport: { width: 1366, height: 768 } }); const errs = [], asked = [];
    p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && !/favicon|ERR_|Failed to load resource/.test(m.text()) && errs.push("console: " + m.text().slice(0, 120)));
    await p.goto(`${base}/station.html?gate=${g}`); await p.waitForTimeout(900);
    await p.click("#vipBtn"); await p.waitForTimeout(700);
    await p.click(`#lvlBtns button[data-l="${L}"]`).catch(() => {});
    const t0 = Date.now(); let done = false, scratch = false, last = "";
    while (Date.now() - t0 < 170000) {
      const st = await p.evaluate(() => ({ stamp: !!document.querySelector(".overlay .stamp"), sc: !!document.querySelector(".sc-ov"), k: (document.querySelector("#talk.show #kLine") || {}).innerText || "", t: (document.querySelector("#talk.show #tLine") || {}).innerText || "" }));
      if (st.stamp) { done = true; break; }
      if (st.sc) scratch = true;
      if (st.k && st.t + "→" + st.k !== last) { last = st.t + "→" + st.k; asked.push(last.replace(/\s+/g, " ").slice(0, 70)); }
      await p.keyboard.press("Enter"); await p.waitForTimeout(350);
    }
    const pts = done ? await p.locator(".pts-chip b").innerText().catch(() => "?") : "-";
    const ok = done && scratch && !errs.length; if (!ok) fail++;
    console.log(`${ok ? "PASS" : "FAIL"} gate ${g} level ${L}: ${Math.round((Date.now() - t0) / 1000)}s, ${asked.length} questions, scratch ${scratch}, points ${pts}${errs.length ? " | " + errs.slice(0, 3).join(" | ") : ""}`);
    if (process.env.VERBOSE) asked.forEach((a) => console.log("     " + a));
    await p.close();
  }
  await b.close(); process.exit(fail ? 1 : 0);
})();
