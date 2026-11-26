/* Classroom edition (tools/build_classroom.py): every file must run by itself from the disk with the network off,
   and every screen must fit on ONE page of the big screen — nothing to scroll, no button outside the screen.
   For each gate file and each screen size: open it as file://, choose a level on the START screen, play to the stamp
   (the teacher's ✓ for every answer) and check at every step:
     - the page asked for no other file (one self-contained file),
     - the page cannot scroll, and every visible button lies inside the screen,
     - no line was read by a computer voice, no page error.
   The Final Gate and opening-show files are opened and checked for size and errors.
   usage: node tools/tests/room-fit.js <dir with the built files> [sizes e.g. 1920x1080,1366x768] [levels e.g. 2,3,1] */
const { chromium } = require("playwright"), fs = require("fs"), path = require("path");
const dir = path.resolve(process.argv[2] || "classroom");
const sizes = (process.argv[3] || "1920x1080,1366x768,1280x720,1024x768").split(",").map((s) => s.split("x").map(Number));
const levels = (process.argv[4] || "2,3,1").split(",").map(Number);
const fit = () => {
  const vw = innerWidth, vh = innerHeight, bad = [];
  const se = document.scrollingElement || document.documentElement;
  if (se.scrollHeight > vh + 1 || se.scrollWidth > vw + 1) bad.push(`page scrolls ${se.scrollWidth}x${se.scrollHeight} in ${vw}x${vh}`);
  for (const b of document.querySelectorAll("button, .pick-btn, .abc-btn, #startBtn")) {
    const q = b.getBoundingClientRect(), cs = getComputedStyle(b);
    if (!q.width || !q.height || cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0 || cs.pointerEvents === "none") continue;
    let hid = false; for (let e = b; e && e !== document.body; e = e.parentElement) { const c = getComputedStyle(e); if (c.display === "none" || c.visibility === "hidden" || +c.opacity === 0) { hid = true; break; } }
    if (hid || b.closest("#talk:not(.show)")) continue; // the teacher bar waits below the screen until a question is asked
    if (q.left < -2 || q.top < -2 || q.right > vw + 2 || q.bottom > vh + 2) bad.push(`${b.id || b.className || b.tagName} at ${Math.round(q.left)},${Math.round(q.top)}–${Math.round(q.right)},${Math.round(q.bottom)}`);
  }
  return bad;
};
(async () => {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html")).sort();
  const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  let fail = 0, n = 0;
  for (const f of files) {
    const gate = /^gate(\d)/.test(f) ? +f.match(/^gate(\d)/)[1] : 0;
    for (let si = 0; si < sizes.length; si++) {
      const [w, h] = sizes[si], L = levels[(n++) % levels.length];
      const ctx = await b.newContext({ viewport: { width: w, height: h }, offline: true }); const p = await ctx.newPage();
      const errs = [], other = [], bad = new Set();
      p.on("pageerror", (e) => errs.push(e.message));
      p.on("request", (r) => { const u = r.url(); if (!/^data:|^blob:/.test(u) && !u.endsWith(encodeURI(f)) && !u.endsWith(f)) other.push(u.slice(-60)); });
      await p.addInitScript(() => { window.__tts = []; const v = [{ name: "Fake US English", lang: "en-US", localService: true }];
        window.speechSynthesis = { getVoices: () => v, speak: (u) => { window.__tts.push(u.text); setTimeout(() => u.onend && u.onend(), 50); }, cancel() {}, onvoiceschanged: null }; window.SpeechSynthesisUtterance = function (t) { this.text = t; }; });
      await p.goto("file://" + path.join(dir, f)); await p.waitForTimeout(1200);
      const add = async (where) => { for (const x of await p.evaluate(fit)) bad.add(where + ": " + x); };
      await add("first screen");
      let done = !gate, lv = "-";
      if (gate) {
        const btns = await p.$$(".lvl-room .lr-b"); if (btns.length !== 3) bad.add("START screen: the three level buttons are missing");
        else { await btns[L - 1].click(); lv = await p.evaluate(() => (document.querySelector(".lvl-room .lr-b.on b") || {}).textContent || "?"); }
        await p.click("#startBtn", { force: true }); await p.waitForTimeout(700);
        const t0 = Date.now(); let last = "";
        while (Date.now() - t0 < 170000) {
          const st = await p.evaluate(() => ({ stamp: !!document.querySelector(".overlay .stamp"), k: (document.querySelector("#talk.show #kLine") || {}).innerText || "", ab: !!document.querySelector(".ab"), sc: !!document.querySelector(".sc-ov") }));
          const where = st.stamp ? "stamp" : st.sc ? "scratch card" : st.ab ? "action" : st.k ? "question" : "game";
          if (where !== last || where === "question") { await p.waitForTimeout(where === "game" ? 0 : 1600); await add(where); last = where; } // let the bar or card finish sliding in before measuring
          if (st.stamp) { done = true; break; }
          await p.keyboard.press("Enter"); await p.waitForTimeout(350);
        }
      } else { await p.waitForTimeout(1500); await p.mouse.click(w / 2, h / 2).catch(() => {}); await p.waitForTimeout(1500); await add("after a tap"); }
      const said = await p.evaluate(() => [...new Set(window.__tts || [])]);
      const ok = done && !errs.length && !other.length && !bad.size && !said.length; if (!ok) fail++;
      console.log(`${ok ? "PASS" : "FAIL"} ${f} ${w}x${h}${gate ? " " + lv : ""}${done ? "" : " | did not reach the stamp"}${bad.size ? " | " + [...bad].slice(0, 4).join(" ; ") : ""}${other.length ? " | asked for other files: " + [...new Set(other)].slice(0, 3).join(", ") : ""}${said.length ? " | computer voice: " + said.slice(0, 3).join(" / ") : ""}${errs.length ? " | " + errs.slice(0, 2).join(" | ") : ""}`);
      await ctx.close();
    }
  }
  await b.close(); process.exit(fail ? 1 : 0);
})();
