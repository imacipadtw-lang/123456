/* =====================================================================
   Touch puzzles (touch + speaking), shared by every gate
   1. TC.mysteryBox(gate)     → tap one of three gift boxes, it opens to a sentence → child says it
   2. TC.sentencePuzzle(s, zh)   → tap word tiles into order, then read it aloud
   ===================================================================== */
(function () {
  "use strict";
  const { h, sleep } = TC;
  const css = `
  .pz{position:fixed;left:50%;top:8.4rem;transform:translateX(-50%);z-index:30;width:min(110rem,94vw);background:rgba(10,22,51,.9);backdrop-filter:blur(10px);
      border:3px solid var(--gate);border-radius:2.2rem;padding:1.6rem 2rem 2rem;text-align:center;box-shadow:0 1.6rem 4rem rgba(0,0,0,.5);animation:pzIn .5s cubic-bezier(.2,1.4,.4,1)}
  @keyframes pzIn{from{transform:translate(-50%,-30%) scale(.8);opacity:0}}
  .pz h3{margin:0;font-size:3rem;display:flex;align-items:center;justify-content:center;gap:1rem}
  .pz .sub{font-size:1.7rem;color:var(--ink2);margin:.3rem 0 1rem}
  .pz .num{display:inline-flex;align-items:center;gap:1.4rem;font-size:3rem;font-weight:700;background:#fff;color:#0a1633;border-radius:1.6rem;padding:.6rem 2.2rem;box-shadow:0 .5rem 0 #c9d6ff}
  .pz .num b{font-size:7rem;line-height:1;color:#d6337a}
  .pz .book{width:9rem;height:7rem;position:relative;perspective:40rem}
  .pz .book i{position:absolute;inset:0;border-radius:.8rem;background:linear-gradient(135deg,#3d8bff,#152a63);box-shadow:inset 0 0 0 .4rem #ffc83d}
  .pz .book i:nth-child(2){background:#fff;transform-origin:0 50%;animation:flip 1.2s ease-in-out infinite;box-shadow:none;inset:.5rem .5rem .5rem 50%}
  @keyframes flip{50%{transform:rotateY(-160deg)}}
  .pz .ans{margin-top:1.2rem;font-size:3.4rem;font-weight:700;min-height:4rem}
  .pz .ans .first{display:inline-grid;place-items:center;width:6rem;height:7rem;background:var(--sun);color:#0a1633;border-radius:1rem;font-size:5.4rem;margin-right:.4rem;animation:pop .5s}
  .pz .slots{display:flex;flex-wrap:wrap;justify-content:center;gap:1rem;min-height:7rem;padding:1rem;border-radius:1.4rem;background:rgba(255,255,255,.06);border:2px dashed rgba(255,255,255,.25)}
  .pz .bank{display:flex;flex-wrap:wrap;justify-content:center;gap:1.1rem;margin-top:1.4rem;min-height:7rem}
  .pz .tile{font-size:3.2rem;font-weight:700;padding:.7rem 1.6rem;border-radius:1.2rem;color:#0a1633;cursor:pointer;touch-action:manipulation;
      background:linear-gradient(180deg,#fff,#dfe7ff);box-shadow:0 .55rem 0 #8fa2ff,0 .9rem 1.4rem rgba(0,0,0,.35);transition:transform .12s}
  .pz .tile:active{transform:translateY(.4rem);box-shadow:0 .15rem 0 #8fa2ff}
  .pz .slots .tile{background:linear-gradient(180deg,#fff7d6,#ffd96b);box-shadow:0 .55rem 0 #e0a21a,0 .9rem 1.4rem rgba(0,0,0,.35)}
  .pz.ok .slots .tile{background:linear-gradient(180deg,#d6fff0,#2ee6b6);box-shadow:0 .55rem 0 #17a884}
  .pz .slots.bad{animation:shake .45s}
  .pz .zh2{font-size:1.8rem;color:var(--ink2);margin-top:.8rem}
  .pz .mb-row{display:flex;justify-content:center;gap:4rem;margin:1.6rem 0 .6rem}
  .pz .mb-box{position:relative;width:18rem;height:18rem;border:0;border-radius:2.4rem;cursor:pointer;touch-action:manipulation;background:radial-gradient(circle at 50% 40%,color-mix(in srgb,var(--c) 45%,transparent),rgba(255,255,255,.04) 70%);
      box-shadow:inset 0 0 0 .4rem var(--c);animation:mbWob 1.6s ease-in-out infinite}
  .pz .mb-box .mb-gift{width:84%;height:84%;object-fit:contain;pointer-events:none}
  .pz .mb-box b{position:absolute;right:.8rem;top:.6rem;font-size:2.6rem;color:#fff;background:var(--c);border-radius:50%;width:4rem;height:4rem;display:grid;place-items:center}
  .pz .mb-box:active{transform:scale(.94)}
  .pz .mb-box.open{animation:mbOpen .6s forwards}.pz .mb-box.away{animation:mbAway .5s forwards}
  @keyframes mbWob{0%,100%{rotate:-4deg}50%{rotate:4deg}}
  @keyframes mbOpen{40%{transform:scale(1.25)}100%{transform:scale(1.6) translateY(-2rem);opacity:0}}
  @keyframes mbAway{to{transform:scale(.6);opacity:.2}}
  .pz .mb-pop{font-size:7rem;animation:pop .5s}
  @media (prefers-reduced-motion:reduce){.pz .mb-box{animation:none}}`;
  document.head.append(h("style", {}, css));

  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const cap = (w) => w[0].toUpperCase() + w.slice(1);

  /** Mystery Box 神秘禮物盒 (no passport needed): three wobbling gift boxes — the child taps one, it bursts open
      and shows a sentence from this gate; the child says it (the key word) for a bonus. Touch only, no timing. */
  TC.mysteryBox = async function (gate, api) {
    const H = TC_CONTENT.hunt[gate]; if (!H) return;
    const pool = [{ text: H.text, zh: H.zh, w: H.w, keys: H.keys }].concat((TC_CONTENT.sentences[gate] || []).map((x) => ({ text: x.s, zh: x.zh, w: x.keys[0][0], keys: x.keys })));
    const picks = shuffle(pool).slice(0, 3);
    while (picks.length < 3) picks.push(picks[0]);
    const COL = ["#ff5fa2", "#4cc9ff", "#2ee6b6"];
    const ans = h("div", { class: "ans" }, "");
    const row = h("div", { class: "mb-row" });
    const box = h("div", { class: "pz" },
      h("h3", {}, "🎁 Mystery Box", h("span", { class: "zh" }, "神秘禮物盒")),
      h("div", { class: "sub zh" }, "選一個禮物盒，點一下打開！裡面藏著一句英文"), row, ans);
    let chosen, picked = false; const open = new Promise((r) => (chosen = r));
    picks.forEach((p, k) => {
      const b = h("button", { class: "mb-box", style: `--c:${COL[k]};animation-delay:${-k * 0.4}s`, "aria-label": "禮物盒 " + (k + 1), onclick: () => { if (picked) return; picked = true; TC.ac(); chosen(k); } },
        TC.artImg("gift", "mb-gift"), h("b", {}, String(k + 1)));
      row.append(b);
    });
    document.body.append(box); TC.sfx("levelup");
    TC.pending = () => { if (!picked) { picked = true; chosen((Math.random() * 3) | 0); } }; // teacher Enter = open one for the child
    await TC.speak("Open a box!");
    const k = await Promise.race([open, new Promise((r) => { const t = setInterval(() => { if (api && api.aborted) { clearInterval(t); r(-1); } }, 300); open.then(() => clearInterval(t)); })]);
    TC.pending = null;
    if (k < 0 || (api && api.aborted)) { box.remove(); return; }
    const e = picks[k];
    row.querySelectorAll(".mb-box").forEach((b, i) => b.classList.add(i === k ? "open" : "away"));
    TC.sfx("pop"); TC.confetti(120); await sleep(650);
    row.remove();
    ans.append(h("div", { class: "mb-pop" }, "🎁✨"), h("div", { style: "font-size:4.4rem" }, e.text));
    const r = await TC.ask({ teacher: "What's in the box?", tzh: "盒子裡是哪一句？說說看！", say: e.text, zh: e.zh, keys: e.keys, word: e.w, hideKey: true, guideKid: "把盒子裡的句子念出來", guideTeacher: "說對 → ✓（Enter）· 不會 → 🔊 聽示範" });
    if (api && api.aborted) { box.remove(); return; }
    TC.hideTalk();
    ans.innerHTML = ""; ans.append(h("span", { class: "zh", style: "font-size:2.2rem;display:block;margin-bottom:.4rem" }, e.zh), e.text);
    TC.sfx("coin"); await TC.speak(e.text, { human: e.w });
    await sleep(700); box.remove();
    TC.log({ type: "code", say: e.w, heard: r.heard || "", by: r.by || "" });
  };
  TC.bookletHunt = TC.mysteryBox; // old name kept for any caller

  /** Sentence Builder: tap tiles in order, then read the sentence aloud. */
  TC.sentencePuzzle = async function (sentence, zh, keys, api) {
    const words = sentence.split(/\s+/);
    let order = shuffle(words.map((w, i) => ({ w, i })));
    if (order.every((t, k) => t.i === k)) order.reverse();
    const slots = h("div", { class: "slots" }), bank = h("div", { class: "bank" });
    const box = h("div", { class: "pz" },
      h("h3", {}, "🧩 Sentence Builder", h("span", { class: "zh" }, "句子拼拼看")),
      h("div", { class: "sub zh" }, "依順序點單字，排出這一句英文！"), slots, bank, h("div", { class: "zh2 zh" }, zh || ""));
    document.body.append(box);
    let done;
    const finished = new Promise((r) => (done = r));
    const placed = [];
    function render() {
      slots.innerHTML = ""; bank.innerHTML = "";
      placed.forEach((t, k) => slots.append(h("div", { class: "tile", onclick: () => { placed.splice(k, 1); TC.sfx("click"); render(); } }, t.w)));
      order.filter((t) => !placed.includes(t)).forEach((t) => bank.append(h("div", { class: "tile", onclick: () => { placed.push(t); TC.sfx("pop"); render(); check(); } }, t.w)));
    }
    function check() {
      if (placed.length !== words.length) return;
      if (placed.every((t, k) => t.w === words[k])) { box.classList.add("ok"); TC.sfx("levelup"); TC.confetti(80); setTimeout(done, 700); }
      else {
        slots.classList.remove("bad"); void slots.offsetWidth; slots.classList.add("bad"); TC.sfx("wrong");
        setTimeout(() => { let k = 0; while (k < placed.length && placed[k].w === words[k]) k++; placed.splice(k); render(); }, 600);
      }
    }
    render();
    TC.pending = () => { placed.length = 0; words.forEach((w) => placed.push(order.find((t) => t.w === w && !placed.includes(t)))); render(); check(); }; // teacher Enter = solve
    await TC.speak("Go!");
    await Promise.race([finished, new Promise((r) => { const t = setInterval(() => { if (api && api.aborted) { clearInterval(t); r(); } }, 300); finished.then(() => clearInterval(t)); })]);
    TC.pending = null;
    if (api && api.aborted) { box.remove(); return; }
    const r = await TC.ask({ teacher: "Say it!", tzh: "把句子唸出來！", say: sentence, zh: zh || "", keys, word: (keys && keys[0] && keys[0][0]) || "" });
    box.remove(); TC.hideTalk();
    return r;
  };
})();
