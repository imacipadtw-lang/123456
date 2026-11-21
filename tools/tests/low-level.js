/* 低年級 (1–2 年級): the question bar must show a big/small-letter task (never a booklet sentence), a wrong letter must
   not move on, the right letter must open "do the action with Ollie", and the gate must reach its stamp.
   usage: node tools/tests/low-level.js [baseUrl] [gates e.g. 1,6] */
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:8767", gates = (process.argv[3] || "1,2,4,5,6").split(",").map(Number);
(async () => {
  const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  let fail = 0;
  for (const g of gates) {
    const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    await p.goto(`${base}/station.html?gate=${g}&lv=1`);
    await p.waitForTimeout(900);
    await p.click("#startBtn", { force: true });
    const t0 = Date.now(), seen = [], problems = [];
    let done = false, actions = 0, lastKey = "";
    while (Date.now() - t0 < 170000) {
      const st = await p.evaluate(() => {
        const talk = document.querySelector("#talk.show"), big = talk && talk.querySelector(".abc-big"), ab = document.querySelector(".ab");
        return {
          stamp: !!document.querySelector(".overlay .stamp"), ab: !!ab, abWord: ab ? (ab.querySelector(".txt .w") || {}).innerText || "" : "",
          letter: big ? big.textContent.trim() : "", opts: talk ? Array.from(talk.querySelectorAll(".abc-btn")).map((x) => [x.textContent.trim(), x.dataset.c, x.classList.contains("ok")]) : [],
          teacher: talk ? (talk.querySelector("#tLine") || {}).innerText || "" : "", k: talk ? (talk.querySelector("#kLine") || {}).innerText || "" : "",
        };
      });
      if (st.stamp) { done = true; break; }
      if (st.ab) { actions++; await p.waitForTimeout(500); await p.click(".ab .done").catch(() => {}); await p.waitForTimeout(400); continue; }
      if (st.letter && st.opts.length === 3 && !st.opts.some((o) => o[2])) {
        const key = st.letter + "|" + st.opts.map((o) => o[0]).join("");
        if (key !== lastKey) {
          lastKey = key;
          const upper = st.letter === st.letter.toUpperCase() && st.letter !== st.letter.toLowerCase();
          // the choices are in the OTHER case, and exactly one of them is the partner of the letter shown
          const otherCase = st.opts.every((o) => (upper ? o[0] === o[0].toLowerCase() : o[0] === o[0].toUpperCase()));
          const partners = st.opts.filter((o) => o[1] === st.letter.toUpperCase());
          const wantLine = upper ? "Find the small letter!" : "Find the big letter!";
          if (!otherCase) problems.push(`choices not in the other case: ${key}`);
          if (partners.length !== 1) problems.push(`no single right choice: ${key}`);
          if (!st.teacher.startsWith(wantLine)) problems.push(`host line is "${st.teacher.slice(0, 40)}" for ${key}`);
          if (/[a-z]{2,}\s+[a-z]{2,}/i.test(st.k.split("\n")[0].replace(/[^\x00-\x7f]/g, ""))) problems.push(`a sentence in the question bar: ${st.k.slice(0, 40)}`);
          seen.push(st.letter + "→" + (partners[0] || ["?"])[0]);
          // a wrong letter first: nothing may happen
          const wrong = st.opts.find((o) => o[1] !== st.letter.toUpperCase());
          await p.click(`#talk .abc-btn[data-c="${wrong[1]}"]`);
          await p.waitForTimeout(500);
          if (await p.evaluate(() => !!document.querySelector(".ab"))) problems.push(`a wrong letter opened the action: ${key}`);
        }
        await p.click(`#talk .abc-btn[data-c="${st.letter.toUpperCase()}"]`).catch(() => {});
        await p.waitForTimeout(900);
        continue;
      }
      await p.keyboard.press("Enter");
      await p.waitForTimeout(350);
    }
    const ok = done && seen.length >= 2 && actions >= seen.length && !problems.length && !errs.length;
    if (!ok) fail++;
    console.log(`${ok ? "PASS" : "FAIL"} gate ${g} 低年級: ${Math.round((Date.now() - t0) / 1000)}s, ${seen.length} letter tasks (${seen.join(" ")}), ${actions} actions, stamp ${done}${problems.length ? " | " + [...new Set(problems)].slice(0, 3).join(" | ") : ""}${errs.length ? " | " + errs[0] : ""}`);
    await p.close();
  }
  await b.close();
  process.exit(fail ? 1 : 0);
})();
