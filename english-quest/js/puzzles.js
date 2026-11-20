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

/* =====================================================================
   Action Buddy (115.11.21, 低年級): after the child taps the right letter, a big cute 3D Ollie spins
   all the way round (360°) and does the action of the word — the child copies it. Touch only, no timing:
   it closes by itself after a few seconds, or when the child / teacher taps "做好了".
   Ollie is the original drawing from art.js, extruded into a thick 3D figure with stacked layers.
   ===================================================================== */
(function () {
  "use strict";
  const { h, sleep } = TC;
  const css = `
  .ab{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:radial-gradient(70% 60% at 50% 45%,#2a5bb8,#0a1633 75%);animation:abIn .35s ease-out}
  @keyframes abIn{from{opacity:0}}
  .ab .stage{position:relative;width:min(46vh,40vw);height:min(52vh,46vw);perspective:120vh;margin-top:-6vh}
  .ab .floor{position:absolute;left:10%;right:10%;bottom:-3%;height:12%;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.55),transparent);animation:abShadow var(--sp,1s) ease-in-out infinite}
  .ab .spin{position:absolute;inset:0;transform-style:preserve-3d;animation:abSpin 6.4s cubic-bezier(.45,0,.2,1) both}
  .ab .act{position:absolute;inset:0;transform-style:preserve-3d;animation:var(--anim) var(--sp,1s) ease-in-out infinite}
  .ab .lay{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;clip-path:inset(0 0 5% 0);backface-visibility:visible;pointer-events:none}
  @keyframes abSpin{0%{transform:rotateY(-360deg) scale(.4) translateY(30%)}26%{transform:rotateY(-40deg) scale(1.05)}36%{transform:rotateY(12deg) scale(1)}42%,62%{transform:rotateY(0) scale(1)}86%{transform:rotateY(360deg) scale(1.06)}92%,100%{transform:rotateY(360deg) scale(1)}}
  @keyframes abShadow{50%{transform:scale(.8);opacity:.6}}
  /* the actions */
  @keyframes abScrub{0%,100%{transform:rotateZ(-7deg) rotateY(-22deg)}50%{transform:rotateZ(7deg) rotateY(22deg)}}
  @keyframes abHop{0%,100%{transform:translateY(0) scaleY(1)}12%{transform:translateY(2%) scaleY(.9)}45%{transform:translateY(-18%) scaleY(1.05) rotateY(25deg)}80%{transform:translateY(0) scaleY(.94)}}
  @keyframes abStretch{0%,100%{transform:scaleY(.92) scaleX(1.05)}50%{transform:scaleY(1.12) scaleX(.94) translateY(-6%)}}
  @keyframes abClap{0%,100%{transform:scale(1) rotateY(0)}25%{transform:scale(1.08) rotateY(-30deg)}50%{transform:scale(.96)}75%{transform:scale(1.08) rotateY(30deg)}}
  @keyframes abNod{0%,100%{transform:rotateX(0) rotateY(-15deg)}50%{transform:rotateX(18deg) rotateY(15deg) translateY(4%)}}
  @keyframes abTwirl{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}
  @keyframes abWipe{0%,100%{transform:translateX(-9%) rotateZ(-5deg) rotateX(14deg)}50%{transform:translateX(9%) rotateZ(5deg) rotateX(14deg)}}
  @keyframes abBrush{0%,100%{transform:translateX(-4%) rotateY(-12deg)}25%{transform:translateX(4%) rotateY(12deg)}50%{transform:translateX(-4%) rotateY(-12deg) translateY(-2%)}75%{transform:translateX(4%) rotateY(12deg)}}
  @keyframes abKnock{0%,40%,100%{transform:rotateX(0) translateZ(0)}12%,28%{transform:rotateX(-14deg) translateZ(6vh)}20%{transform:rotateX(0) translateZ(0)}}
  @keyframes abWalkIn{0%{transform:translateZ(-14vh) scale(.8) translateY(2%)}25%{transform:translateZ(-8vh) scale(.86) translateY(-3%)}50%{transform:translateZ(-2vh) scale(.94) translateY(2%)}75%{transform:translateZ(3vh) scale(1) translateY(-3%)}100%{transform:translateZ(6vh) scale(1.04)}}
  @keyframes abRun{0%,100%{transform:translateY(0) rotateZ(-6deg) rotateX(10deg)}25%{transform:translateY(-9%) rotateZ(0) rotateX(10deg)}50%{transform:translateY(0) rotateZ(6deg) rotateX(10deg)}75%{transform:translateY(-9%) rotateZ(0) rotateX(10deg)}}
  @keyframes abWalk{0%,100%{transform:translateX(-6%) rotateZ(-4deg) rotateY(-20deg)}50%{transform:translateX(6%) rotateZ(4deg) rotateY(20deg) translateY(-3%)}}
  @keyframes abDrink{0%,100%{transform:rotateX(0) translateY(0)}40%,70%{transform:rotateX(-24deg) translateY(-4%) rotateZ(-6deg)}}
  @keyframes abEat{0%,100%{transform:scaleY(1) scaleX(1)}20%{transform:scaleY(.86) scaleX(1.08)}40%{transform:scaleY(1.04) scaleX(.97)}60%{transform:scaleY(.86) scaleX(1.08)}80%{transform:scaleY(1.02)}}
  @keyframes abOuch{0%,100%{transform:rotateZ(0) translateY(0)}10%{transform:rotateZ(-9deg) translateY(-6%)}20%{transform:rotateZ(9deg)}30%{transform:rotateZ(-6deg)}40%,80%{transform:rotateZ(0) rotateX(20deg) translateY(5%) scaleY(.92)}}
  @keyframes abOpen{0%,100%{transform:scaleX(.9) rotateY(0)}50%{transform:scaleX(1.16) rotateY(0) translateY(-3%)}}
  @keyframes abFlick{0%,60%,100%{transform:rotateZ(0) translateY(0);filter:brightness(1)}20%{transform:rotateZ(12deg) translateY(-6%)}35%{transform:rotateZ(0);filter:brightness(1.6)}}
  @keyframes abRead{0%,100%{transform:rotateX(16deg) rotateY(-14deg) translateY(3%)}50%{transform:rotateX(16deg) rotateY(14deg) translateY(3%)}}
  @keyframes abIdea{0%,55%,100%{transform:translateY(0) scale(1)}20%{transform:translateY(-14%) scale(1.08) rotateZ(-6deg)}35%{transform:translateY(-14%) scale(1.1) rotateZ(6deg)}}
  @keyframes abListen{0%,100%{transform:rotateZ(0) rotateY(0)}30%,70%{transform:rotateZ(-14deg) rotateY(-30deg) translateX(-4%)}}
  @keyframes abThumb{0%,100%{transform:scale(1) rotateY(0)}30%{transform:scale(1.14) rotateY(-20deg) translateY(-5%)}60%{transform:scale(1.14) rotateY(20deg) translateY(-5%)}}
  @keyframes abBow{0%,100%{transform:rotateX(0) translateY(0)}35%,65%{transform:rotateX(34deg) translateY(8%)}}
  @keyframes abHug{0%,100%{transform:scaleX(1) scaleY(1)}40%{transform:scaleX(1.18) scaleY(.94) translateY(2%)}70%{transform:scaleX(.92) scaleY(1.04)}}
  @keyframes abWave{0%,100%{transform:rotateZ(-10deg) rotateY(-10deg)}50%{transform:rotateZ(10deg) rotateY(10deg)}}
  @keyframes abSleep{0%,100%{transform:rotateZ(-10deg) translateY(4%)}50%{transform:rotateZ(10deg) translateY(4%)}}
  .ab .hold{position:absolute;left:63%;top:47%;font-style:normal;font-size:min(10vh,8.5vw);line-height:1;pointer-events:none;filter:drop-shadow(0 .5rem .5rem rgba(0,0,0,.4))}
  .ab .hold span{display:inline-block;animation:abHold .9s ease-in-out infinite;transform-origin:30% 90%}
  @keyframes abHold{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(14deg) translateY(-8%)}}
  .ab .props{position:absolute;inset:-10%;pointer-events:none}
  .ab .props i{position:absolute;font-style:normal;font-size:min(9vh,8vw);animation:abFloat 2.4s ease-in-out infinite;filter:drop-shadow(0 .6rem .6rem rgba(0,0,0,.35))}
  @keyframes abFloat{0%,100%{transform:translateY(0) rotate(-8deg)}50%{transform:translateY(-14%) rotate(8deg)}}
  .ab .txt{position:absolute;left:0;right:0;bottom:7vh;text-align:center}
  .ab .w{font-size:min(11vh,9vw);font-weight:700;color:#fff;text-shadow:0 .5rem 0 #0a1633,0 0 3rem rgba(76,201,255,.8)}
  .ab .w b{color:var(--sun)}
  .ab .zh{font-size:min(4.4vh,3.6vw);color:var(--mint);font-weight:700;margin-top:.4rem}
  .ab .done{position:absolute;right:4vw;bottom:5vh;font-size:min(4.4vh,3.6vw);padding:1rem 2.4rem;border-radius:2rem;border:0;cursor:pointer;touch-action:manipulation;color:#063a2c;font-weight:700;
     background:linear-gradient(180deg,#7dffd8,#2ee6b6 55%,#14b88d);box-shadow:0 .6rem 0 #0b7a5c}
  .ab .done:active{transform:translateY(.4rem);box-shadow:0 .2rem 0 #0b7a5c}
  @media (prefers-reduced-motion:reduce){.ab .spin,.ab .act,.ab .props i,.ab .floor,.ab .hold span{animation:none}}`;
  document.head.append(h("style", {}, css));

  // which action Ollie does for a word (the child copies it), and a few floating props
  // 115.11.21 (管理者要求): 低年級 actions must show the word itself, and the word must be easy.
  // answer word → [easy word shown to the child, Ollie's move, props, what to do (中文)]
  const ACT = {
    wash: ["wash", "abScrub", ["🫧", "🧼", "🫧"], "搓搓手，洗洗手！"],
    hands: ["hands", "abScrub", ["🫧", "🙌", "🫧"], "伸出雙手，搓一搓！"],
    soap: ["wash", "abScrub", ["🫧", "🧼", "🫧"], "搓搓手，洗洗手！"],
    clean: ["clean", "abWipe", ["🧽", "✨", "🧽"], "拿抹布，擦擦桌子！"],
    table: ["table", "abWipe", ["🧽", "🍽️", "✨"], "手放平，擦擦桌子！"],
    brush: ["brush", "abBrush", ["🪥", "🦷", "✨"], "拿牙刷，刷刷牙！"],
    teeth: ["teeth", "abBrush", ["🦷", "🪥", "✨"], "張開嘴，刷刷牙齒！"],
    mask: ["mask", "abNod", ["😷", "✨", "😷"], "雙手遮住嘴巴，戴口罩！"],
    door: ["door", "abKnock", ["🚪", "✊", "🚪"], "叩叩叩，敲敲門！"],
    close: ["close", "abKnock", ["🚪", "✋", "🚪"], "伸手把門推上，關門！"],
    in: ["in", "abWalkIn", ["🚪", "👣", "🏫"], "敲敲門，走進來！"],
    late: ["late", "abRun", ["⏰", "💨", "🏃"], "看手錶，原地快跑！"],
    hurry: ["hurry", "abRun", ["💨", "🏃", "💨"], "原地快快跑！"],
    run: ["run", "abRun", ["💨", "🏃", "💨"], "原地快快跑！"],
    walk: ["walk", "abWalk", ["👣", "🚶", "👣"], "慢慢走，不要跑！"],
    go: ["go", "abWalk", ["🚻", "👣", "✋"], "舉手，再慢慢走出去！"],
    restroom: ["go", "abWalk", ["🚻", "👣", "✋"], "舉手，再慢慢走出去！"],
    water: ["water", "abDrink", ["💧", "🥤", "💧"], "拿杯子，咕嚕咕嚕喝水！"],
    drink: ["drink", "abDrink", ["🥤", "💧", "🥤"], "拿杯子，咕嚕咕嚕喝！"],
    lunchbox: ["lunch", "abEat", ["🍱", "🥢", "🍱"], "打開便當，大口吃飯！"],
    lunch: ["lunch", "abEat", ["🍱", "🥢", "🍱"], "打開便當，大口吃飯！"],
    eat: ["eat", "abEat", ["🍱", "🥢", "🍙"], "大口吃，嚼嚼嚼！"],
    hurt: ["hurt", "abOuch", ["🩹", "💥", "🩹"], "摸摸膝蓋：好痛喔！"],
    nurse: ["nurse", "abOuch", ["🩹", "👩‍⚕️", "🩹"], "貼 OK 繃，護理師幫你！"],
    rest: ["rest", "abSleep", ["💤", "🌙", "💤"], "趴下來，閉上眼睛休息！"],
    break: ["break", "abSleep", ["💤", "☕", "💤"], "伸伸懶腰，休息一下！"],
    sleep: ["sleep", "abSleep", ["💤", "🌙", "💤"], "雙手合起放臉旁，睡覺！"],
    quiet: ["quiet", "abSleep", ["🤫", "🌙", "🤫"], "手指放嘴上：噓～"],
    wake: ["wake", "abStretch", ["☀️", "⏰", "☀️"], "張開眼睛，伸個大懶腰！"],
    everyone: ["wake", "abStretch", ["☀️", "⏰", "☀️"], "張開眼睛，伸個大懶腰！"],
    window: ["window", "abOpen", ["🪟", "🌤️", "🪟"], "雙手往旁邊推，打開窗戶！"],
    open: ["open", "abOpen", ["🪟", "✨", "🚪"], "雙手往旁邊推開！"],
    light: ["light", "abFlick", ["💡", "✨", "💡"], "伸手按開關，開燈！"],
    fan: ["fan", "abTwirl", ["🌀", "💨", "🌀"], "手臂轉圈圈，像電風扇！"],
    book: ["book", "abRead", ["📖", "✨", "📚"], "雙手打開書本，看書！"],
    idea: ["idea", "abIdea", ["💡", "✨", "💡"], "手指頭頂，叮！想到了！"],
    listen: ["listen", "abListen", ["👂", "🎵", "👂"], "手放耳朵旁，仔細聽！"],
    listening: ["listen", "abListen", ["👂", "🎵", "👂"], "手放耳朵旁，仔細聽！"],
    done: ["done", "abThumb", ["👍", "✅", "👍"], "比一個讚：我做好了！"],
    okay: ["okay", "abThumb", ["👌", "✨", "👌"], "比 OK 的手勢！"],
    sure: ["sure", "abNod", ["👍", "😊", "👍"], "用力點點頭：好呀！"],
    good: ["good", "abThumb", ["👍", "🌟", "👍"], "比兩個讚：好棒！"],
    please: ["please", "abBow", ["🙏", "💖", "🙏"], "雙手合十：拜託～"],
    welcome: ["welcome", "abHug", ["🤗", "💖", "🤗"], "張開雙手，歡迎你！"],
    goodbye: ["goodbye", "abWave", ["👋", "💖", "👋"], "揮揮手，說再見！"],
    bye: ["goodbye", "abWave", ["👋", "💖", "👋"], "揮揮手，說再見！"],
    hello: ["hello", "abWave", ["👋", "😊", "👋"], "揮揮手，打招呼！"],
    hi: ["hi", "abWave", ["👋", "😊", "👋"], "揮揮手，打招呼！"],
    sorry: ["sorry", "abBow", ["🙇", "💖", "🙇"], "鞠個躬：對不起！"],
    thank: ["thank you", "abBow", ["🙏", "💖", "🙏"], "鞠個躬：謝謝！"],
    help: ["help", "abHug", ["🤝", "💖", "🤝"], "伸出手，幫幫忙！"],
    come: ["in", "abWalkIn", ["🚪", "👣", "🏫"], "敲敲門，走進來！"],
    course: ["sure", "abNod", ["👍", "😊", "👍"], "用力點點頭：好呀！"],
    class: ["goodbye", "abWave", ["👋", "🔔", "👋"], "下課了！揮揮手說再見！"],
    see: ["goodbye", "abWave", ["👋", "💖", "👋"], "揮揮手，下次見！"],
    nice: ["happy", "abClap", ["😊", "☀️", "😊"], "笑一個，拍拍手！"],
    happy: ["happy", "abClap", ["😊", "👏", "😊"], "笑一個，拍拍手！"],
    job: ["good", "abThumb", ["👍", "🌟", "👍"], "比兩個讚：好棒！"],
    thanks: ["thank you", "abBow", ["🙏", "💖", "🙏"], "鞠個躬：謝謝！"]
  };
  const DEF = ["happy", "abClap", ["👏", "⭐", "👏"], "拍拍手！"];
  /** 低年級: the easy word + action for an answer word (unknown words fall back to the word + clapping) */
  TC.lowAction = function (word) {
    const k = String(word || "").toLowerCase().trim();
    const a = ACT[k] || ACT[k.replace(/s$/, "")] || null;
    return a ? { w: a[0], anim: a[1], props: a[2], zh: a[3] } : { w: k, anim: DEF[1], props: DEF[2], zh: DEF[3] };
  };
  TC.lowActionKnown = (word) => !!ACT[String(word || "").toLowerCase().trim()];

  TC.actionBuddy = function (word, opt = {}) {
    return new Promise((resolve) => {
      if (!TC.art) { resolve(); return; }
      const A = TC.lowAction(word), anim = A.anim, props = A.props; word = A.w;
      const src = TC.art("ollie"), N = 26, act = h("div", { class: "act", style: `--anim:${anim};--sp:${anim === "abTwirl" ? "2.4s" : anim === "abSleep" || anim === "abWalkIn" ? "1.8s" : anim === "abRun" || anim === "abBrush" ? ".7s" : anim === "abKnock" || anim === "abBow" || anim === "abOuch" ? "1.6s" : "1.1s"}` });
      // a thick, solid-looking 3D Ollie: layers stacked in depth, the inner ones darker (the sides)
      for (let i = 0; i < N; i++) {
        const z = (i - (N - 1) / 2) * 0.32, edge = i === 0 || i === N - 1;
        const im = h("img", { class: "lay", src, alt: edge ? "Ollie" : "", draggable: "false" });
        im.style.transform = `translateZ(${z}vh)` + (i === 0 ? " rotateY(180deg)" : "");
        if (!edge) im.style.filter = `brightness(${0.55 + 0.25 * Math.sin((i / N) * Math.PI)}) saturate(1.2)`;
        act.append(im);
      }
      // the thing Ollie holds for this word (cup, toothbrush, waving hand…), in front of him so it turns with him
      act.append(h("i", { class: "hold", "aria-hidden": "true", style: "transform:translateZ(4.6vh)" }, h("span", {}, props[0])));
      const spin = h("div", { class: "spin" }, act);
      const P = h("div", { class: "props" }, ...props.map((p, i) => h("i", { style: `left:${[2, 44, 86][i]}%;top:${[12, -6, 18][i]}%;animation-delay:${-i * 0.6}s` }, p)));
      const W = String(word || "");
      const done = h("button", { class: "done zh", type: "button" }, "做好了 ✓");
      const ov = h("div", { class: "ab", role: "dialog", "aria-label": "跟著歐力做動作" },
        h("div", { class: "stage" }, h("div", { class: "floor" }), spin, P),
        h("div", { class: "txt" }, h("div", { class: "w" }, h("b", {}, W.slice(0, 1).toUpperCase()), W.slice(1) + "!"), h("div", { class: "zh" }, "🙌 " + (opt.zh || A.zh))),
        done);
      let closed = false;
      const key = (e) => { if (e.key === "Enter" || e.key === " " || e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); close(); } };
      const close = () => { if (closed) return; closed = true; clearTimeout(t); window.removeEventListener("keydown", key, true); ov.remove(); resolve(); };
      window.addEventListener("keydown", key, true); // Enter / Space = 做好了 (the game underneath waits)
      done.onclick = () => { TC.ac(); TC.sfx && TC.sfx("pop"); close(); };
      ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
      document.body.append(ov);
      TC.sfx && TC.sfx("levelup"); TC.confetti && TC.confetti(90);
      if (TC.speak) TC.speak(W.charAt(0).toUpperCase() + W.slice(1) + "!", { human: W.toLowerCase() }).catch(() => {});
      const t = setTimeout(close, opt.ms || 8000);
    });
  };
})();
