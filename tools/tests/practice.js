/* 運動會英語練習本 (practice.html): every English line it can play has an AI-voice clip (never the computer voice),
   every level × chapter × mode renders without errors, every 🔊 button plays clips (a fake Audio records them, so the test
   is quick), the word-order puzzles, the letter tasks, the blanks and the spelling work, and nothing scrolls sideways on a
   phone or a laptop.   usage: node tools/tests/practice.js [baseUrl]   (static server on english-quest/) */
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:8767";
(async () => {
  const b = await chromium.launch(); let fail = 0;
  for (const [w, h] of [[1366, 768], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
    p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && !/favicon|fonts\.g/.test(m.text()) && errs.push("console: " + m.text().slice(0, 120)));
    await p.addInitScript(() => {
      window.__played = []; window.__tts = [];
      window.Audio = function (src) { const a = { src, volume: 1, onended: null, onerror: null, currentTime: 0, pause() {}, play() { window.__played.push(String(src).split("/assets/audio/")[1] || "data"); setTimeout(() => a.onended && a.onended(), 5); return Promise.resolve(); }, addEventListener(t, f) { if (t === "ended") a.onended = f; } }; return a; };
      window.speechSynthesis = { getVoices: () => [{ name: "Fake", lang: "en-US" }], speak: (u) => { window.__tts.push(u.text); setTimeout(() => u.onend && u.onend(), 5); }, cancel() {} }; window.SpeechSynthesisUtterance = function (t) { this.text = t; };
      try { localStorage.clear(); } catch (e) {}
    });
    await p.goto(base + "/practice.html"); await p.waitForTimeout(800);
    const missing = await p.evaluate(() => window.TC_PRACTICE.missing()), lines = await p.evaluate(() => window.TC_PRACTICE.lines().length);
    const res = { lines, missing, cards: {}, buttons: 0, silent: [], sideways: [] };
    for (const lv of [1, 2, 3]) {
      await p.click(`[data-lv="${lv}"]`);
      const chs = await p.$$eval("#tabs button", (bs) => bs.map((x) => x.dataset.ch));
      for (const ch of chs) {
        await p.click(`[data-ch="${ch}"]`); await p.waitForTimeout(60);
        res.cards[lv + ":" + ch] = await p.$$eval(".card", (x) => x.length);
        // every sound button plays something, and only clips
        const n = await p.$$eval(".card [data-say]", (x) => x.length);
        for (let i = 0; i < n; i++) { const btn = (await p.$$(".card [data-say]"))[i]; await p.evaluate(() => (window.__played.length = 0)); await btn.evaluate((x) => x.click()); await p.waitForTimeout(80);
          for (let k = 0; k < 20 && await p.evaluate(() => document.querySelector(".btn.playing") != null); k++) await p.waitForTimeout(50);
          const got = await p.evaluate(() => window.__played.length); res.buttons++; if (!got) res.silent.push(lv + ":" + ch + " " + await btn.getAttribute("data-say")); }
        // the interactions: right letter, right word, word order, spelling, "I can do it"
        await p.evaluate(() => {
          document.querySelectorAll('[data-lt="1"], [data-pick="1"]').forEach((x) => x.click());
          document.querySelectorAll(".tiles.answer[data-order]").forEach((ans) => { const art = ans.closest(".card"), want = ans.dataset.order.split(" ");
            want.forEach((wd) => { const t = [...art.querySelectorAll(".tiles:not(.answer) [data-tile]")].find((x) => x.textContent === wd); t && t.click(); }); });
          document.querySelectorAll(".tiles.answer[data-spell]").forEach((ans) => { const art = ans.closest(".card");
            ans.dataset.spell.split("").forEach((L) => { const t = [...art.querySelectorAll("[data-letter]:not([disabled])")].find((x) => x.dataset.letter === L && x.parentElement !== ans); t && t.click(); }); });
          document.querySelectorAll("[data-cover]").forEach((x) => x.click()); document.querySelectorAll("[data-uncover]").forEach((x) => x.click());
          document.querySelectorAll("[data-done]").forEach((x) => x.click());
        });
        const after = await p.evaluate(() => ({ covered: document.querySelectorAll(".covered, [data-step3].hide").length, act: [...document.querySelectorAll(".act")].filter((x) => !x.classList.contains("on")).length, blanks: document.querySelectorAll(".blank:not(.on)").length, notDone: document.querySelectorAll(".card:not(.done)").length }));
        if (after.covered || after.act || after.blanks || after.notDone) res.silent.push(`${lv}:${ch} interactions left undone ${JSON.stringify(after)}`);
        const sw = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1); if (sw) res.sideways.push(lv + ":" + ch);
        // the listening check: answer all five
        await p.click('[data-mode="quiz"]'); await p.waitForTimeout(60);
        for (let k = 0; k < 6; k++) { const o = await p.$('.opt[data-opt="1"]'); if (!o) break; await o.click(); await p.waitForTimeout(800); const nx = await p.$('[data-next]'); if (nx) { await nx.click(); await p.waitForTimeout(100); } }
        const score = await p.evaluate(() => (document.querySelector(".score") || {}).textContent || "");
        if (!/答對/.test(score) && !/太少/.test(await p.evaluate(() => document.body.innerText))) res.silent.push(lv + ":" + ch + " quiz did not finish");
        await p.click('[data-mode="cards"]');
      }
    }
    const tts = await p.evaluate(() => window.__tts), parent = await p.evaluate(() => document.querySelector("#parent h2").textContent);
    if (w === 390) await p.screenshot({ path: process.argv[3] || "/dev/null" }).catch(() => {});
    const ok = !missing.length && !errs.length && !tts.length && !res.silent.length && !res.sideways.length;
    if (!ok) fail++;
    console.log(`${ok ? "PASS" : "FAIL"} ${w}x${h}: ${lines} lines, ${missing.length} without a clip${missing.length ? " (" + missing.join(" | ") + ")" : ""}; ${res.buttons} sound buttons pressed; computer voice ${tts.length}; ${parent.trim()}`
      + (res.silent.length ? " | " + res.silent.slice(0, 6).join(" ; ") : "") + (res.sideways.length ? " | scrolls sideways: " + res.sideways.join(",") : "") + (errs.length ? " | " + errs.slice(0, 3).join(" | ") : ""));
    if (w === 1366) console.log("     cards per level:chapter " + JSON.stringify(res.cards));
    await p.close();
  }
  await b.close(); process.exit(fail ? 1 : 0);
})();
