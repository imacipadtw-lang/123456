/* Two voices: in gates 1, 3, 5 Ollie's own lines come from the woman's clips and the 🔊 model answer from the man's
   (assets/audio/m/…); in gates 2, 4, 6 the other way round. The test plays the first questions of a gate and records
   which file every spoken clip came from.   usage: node tools/tests/voices.js [baseUrl] [gates e.g. 1,2] */
const { chromium } = require("playwright");
(async () => {
  const base = process.argv[2] || "http://localhost:8767", gates = (process.argv[3] || "1,2").split(",").map(Number);
  const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  let fail = 0;
  for (const g of gates) {
    const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
    const errs = []; p.on("pageerror", (e) => errs.push(e.message));
    await p.addInitScript(() => {
      window.__played = []; const A = window.Audio;
      window.Audio = function (src) { const a = new A(src); const play = a.play.bind(a); a.play = () => { window.__played.push(a.src.startsWith("data:") ? "data" : a.src.split("/assets/audio/")[1]); return play(); }; return a; };
      window.__tts = []; const v = [{ name: "Fake US English", lang: "en-US", localService: true }];
      window.speechSynthesis = { getVoices: () => v, speak: (u) => { window.__tts.push(u.text); setTimeout(() => u.onend && u.onend(), 50); }, cancel() {}, onvoiceschanged: null }; window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    });
    await p.goto(`${base}/station.html?gate=${g}&lv=2`); await p.waitForTimeout(1200);
    await p.click("#startBtn", { force: true });
    const host = [], model = []; let asked = 0; const t0 = Date.now();
    while (Date.now() - t0 < 90000 && asked < 3) {
      await p.waitForTimeout(400);
      const q = await p.evaluate(() => !!document.querySelector("#talk.show #kLine .w"));
      if (!q) { await p.keyboard.press("Enter"); continue; }
      await p.waitForTimeout(2600);                                   // Ollie asks the question
      host.push(...await p.evaluate(() => window.__played.splice(0)));
      await p.keyboard.press("h"); await p.waitForTimeout(3200);      // the teacher presses 🔊: the model answer
      model.push(...await p.evaluate(() => window.__played.splice(0)));
      await p.keyboard.press("Enter"); await p.waitForTimeout(2600); asked++;
      await p.evaluate(() => window.__played.splice(0));              // praise: either voice
    }
    const isM = (f) => /^m\//.test(f), odd = g % 2 === 1, said = await p.evaluate(() => window.__tts);
    const hostOk = host.length > 0 && host.every((f) => isM(f) !== odd), modelOk = model.length > 0 && model.every((f) => isM(f) === odd);
    const ok = hostOk && modelOk && !errs.length && !said.length; if (!ok) fail++;
    console.log(`${ok ? "PASS" : "FAIL"} gate ${g}: Ollie's lines ${odd ? "woman" : "man"} → ${[...new Set(host)].slice(0, 4).join(", ")} | model ${odd ? "man" : "woman"} → ${[...new Set(model)].slice(0, 4).join(", ")}${said.length ? " | computer voice: " + said.join(" / ") : ""}${errs.length ? " | " + errs[0] : ""}`);
    await p.close();
  }
  await b.close(); process.exit(fail ? 1 : 0);
})();
