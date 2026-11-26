/* The opening show: click through every slide, list any line the computer voice had to read (there must be none —
   every line is an ElevenLabs clip) and any page error.   usage: node tools/tests/opening.js [baseUrl] [screenshot.png] */
const { chromium } = require("playwright");
(async () => {
  const base = process.argv[2] || "http://localhost:8767", shot = process.argv[3];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 0.5 });
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.addInitScript(() => {
    window.__tts = [];
    const v = [{ name: "Fake US English", lang: "en-US", localService: true }];
    window.speechSynthesis = { getVoices: () => v, speak: (u) => { window.__tts.push(u.text); setTimeout(() => u.onend && u.onend(), 50); }, cancel() {}, onvoiceschanged: null };
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  });
  await p.goto(base + "/opening.html"); await p.waitForTimeout(900);
  let slides = 0;
  for (let i = 0; i < 12; i++) {
    await p.click("#next", { force: true }); slides++;
    await p.waitForTimeout(3600);
    if (i === 0 && shot) await p.screenshot({ path: shot });
  }
  const said = await p.evaluate(() => [...new Set(window.__tts || [])]);
  const ok = !errs.length && !said.length;
  console.log(`${ok ? "PASS" : "FAIL"} opening show: ${slides} clicks, computer voice read ${said.length} lines${said.length ? ": " + said.join(" | ") : ""}${errs.length ? " | errors: " + errs.join(" | ") : ""}`);
  await b.close(); process.exit(ok ? 0 : 1);
})();
