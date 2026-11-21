/* =====================================================================
   Gates 7 and 8 — picture quiz (the teacher, 2026-11-21: international education)
   Gate 7 "Holiday Party": a picture of a holiday → tap its name (Chinese + English).
   Gate 8 "Hello, America!": an easy question about American culture and stories, in Chinese with 注音 →
   tap the right picture.
   Super easy on purpose: 2 answers at 低年級, 3 at 中／高年級; a wrong tap only wobbles and the child taps again
   (nobody gets stuck: the teacher's Enter key or ⏭ shows the answer).  After the right tap the CHILD says the
   English word first; Ollie models it only when the teacher presses 🔊 聽示範.
   Content: js/content.js gates with key "quiz".  Pictures: js/art-world.js.  注音: TC.zhuyin([text, syllables]).
   ===================================================================== */
(function () {
  "use strict";
  const { h, sleep } = TC;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* 注音 beside every Chinese character, the way Taiwanese schoolbooks print it: the symbols stand in a column on the
     right of the character, the tone mark to the right of the column, and the light tone "˙" on top of it.
     pair = [text, "one syllable per Chinese character"]; punctuation and Latin letters take no syllable. */
  TC.zhuyin = function (pair) {
    if (!pair) return "";
    if (typeof pair === "string") return esc(pair);
    const syl = String(pair[1] || "").trim().split(/\s+/).filter(Boolean); let k = 0, out = "", latin = "";
    const flush = () => { if (latin) { out += `<span class="zy-l">${esc(latin)}</span>`; latin = ""; } };
    for (const ch of String(pair[0])) {
      if (/[一-鿿]/.test(ch)) {
        flush(); let z = syl[k++] || "", tone = "", light = false;
        if (z[0] === "˙") { light = true; z = z.slice(1); }
        if (/[ˊˇˋ]$/.test(z)) { tone = z.slice(-1); z = z.slice(0, -1); }
        out += `<span class="zy"><b>${ch}</b><i class="n${[...z].length}">${light ? "<u class=\"lt\">˙</u>" : ""}${[...z].map((c) => `<u>${c}</u>`).join("")}</i><s>${tone}</s></span>`;
      } else if (/[，。？！、「」：；]/.test(ch)) { flush(); out += `<span class="zy-p">${ch}</span>`; }
      else latin += ch;
    }
    flush();
    return `<span class="zy-line" lang="zh-Hant">${out}</span>`;
  };

  const css = `
  .qz{position:absolute;inset:0;overflow:hidden;font-family:inherit;color:#fff;--c:var(--gate,#ff6b6b)}
  .qz .bg{position:absolute;inset:0;background:radial-gradient(90% 70% at 50% 18%,color-mix(in srgb,var(--c) 55%,#fff 8%),color-mix(in srgb,var(--c) 38%,#0b1440) 58%,#0b1440)}
  .qz .bg i{position:absolute;border-radius:50%;background:rgba(255,255,255,.1);animation:qzFloat var(--d,9s) ease-in-out infinite alternate}
  .qz .bunt{position:absolute;left:0;right:0;top:12.5vh;height:7vh;opacity:.95;pointer-events:none}
  @keyframes qzFloat{from{transform:translateY(0) scale(1)}to{transform:translateY(-5vh) scale(1.15)}}
  .qz .main{position:absolute;left:16vw;right:16vw;top:25.5vh;bottom:1.6vh;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:1.2vh;transition:bottom .35s}
  .qz.say .main{bottom:31.5vh}
  .qz .qline{background:#fff;color:#1b2a66;border-radius:3vh;padding:1vh 3vh 1.2vh;box-shadow:0 .8vh 0 rgba(0,0,0,.22);font-weight:900;font-size:4.8vh;line-height:1.2;text-align:center;max-width:100%;border:.5vh solid color-mix(in srgb,var(--c) 70%,#fff)}
  .qz .qline .tag{display:inline-block;vertical-align:middle;margin-right:1.2vh;background:var(--c);color:#fff;border-radius:2vh;font-size:2.6vh;padding:.3vh 1.4vh}
  .qz .qen{display:inline-block;margin-left:2vh;vertical-align:middle;font-size:3.4vh;color:#5a6aa8;font-weight:800}
  .qz .pic{flex:1 1 0;min-height:0;display:flex;align-items:center;justify-content:center;perspective:120vh}
  .qz .pic img{height:100%;max-height:40vh;max-width:60vw;filter:drop-shadow(0 1.6vh 1.4vh rgba(0,0,0,.35));animation:qzPic 5.5s ease-in-out infinite}
  @keyframes qzPic{0%,100%{transform:rotateY(-14deg) rotateZ(-1.5deg)}50%{transform:rotateY(14deg) rotateZ(1.5deg) translateY(-1vh)}}
  .qz .pic img.spin{animation:qzSpin 1s cubic-bezier(.3,.8,.3,1)}
  @keyframes qzSpin{from{transform:rotateY(0) scale(.7)}to{transform:rotateY(360deg) scale(1)}}
  .qz .opts{display:flex;gap:2.4vw;justify-content:center;align-items:stretch;width:100%;flex:none}
  .qz .qz-opt{flex:1 1 0;max-width:27vw;min-width:0;background:linear-gradient(#fff,#e9efff);color:#1b2a66;border:.6vh solid #fff;border-radius:3.2vh;box-shadow:0 1.1vh 0 rgba(10,20,70,.45),0 2vh 3vh rgba(0,0,0,.25);
    padding:1.2vh 1vw 1.4vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4vh;cursor:pointer;font:inherit;transition:transform .12s;touch-action:manipulation;animation:qzIn .5s cubic-bezier(.2,1.4,.4,1) backwards;animation-delay:calc(var(--i) * .09s)}
  @keyframes qzIn{from{transform:translateY(8vh) scale(.6);opacity:0}}
  .qz .qz-opt:active{transform:translateY(.7vh)}
  .qz .qz-opt img{height:19vh;max-width:100%;pointer-events:none;animation:qzPic 4.5s ease-in-out infinite;animation-delay:calc(var(--i) * -1.3s)}
  .qz.haspic .qz-opt img{height:11vh}.qz.haspic .qz-opt .big{font-size:6.5vh}.qz.haspic .qz-opt .big.txt{font-size:4vh}.qz.haspic .qz-opt .zhl{font-size:4.4vh}
  .qz .qz-opt .big{font-size:9vh;font-weight:900;line-height:1.05;color:var(--c);text-shadow:0 .4vh 0 rgba(0,0,0,.12)}
  .qz .qz-opt .big.txt{font-size:4.6vh;color:#2d46b9}
  .qz .qz-opt .zhl{font-size:5vh;font-weight:900;line-height:1.2}
  .qz .qz-opt .enl{font-size:3.6vh;font-weight:800;color:#2d46b9;line-height:1.1}
  .qz .qz-opt.bad{animation:qzNo .45s;filter:grayscale(.7);opacity:.55}
  @keyframes qzNo{20%{transform:translateX(-1.2vw) rotate(-3deg)}50%{transform:translateX(1.2vw) rotate(3deg)}80%{transform:translateX(-.6vw)}}
  .qz .qz-opt.ok{border-color:#2ee6b6;background:linear-gradient(#f2fff9,#c9ffe9);transform:scale(1.06);box-shadow:0 0 0 .8vh rgba(46,230,182,.55),0 1.1vh 0 rgba(10,20,70,.45)}
  .qz .tip{font-size:3vh;font-weight:800;opacity:.95;flex:none;text-shadow:0 .3vh 0 rgba(0,0,0,.3)}
  .qz .win{flex:1 1 0;min-height:0;width:100%;display:flex;align-items:center;justify-content:center;gap:3vw}
  .qz .win .wp{height:100%;max-height:30vh;display:flex;align-items:center;perspective:120vh}
  .qz .win .wp img{height:100%;max-width:30vw;animation:qzSpin 1s cubic-bezier(.3,.8,.3,1),qzPic 5s ease-in-out 1s infinite;filter:drop-shadow(0 1.6vh 1.4vh rgba(0,0,0,.35))}
  .qz .win .wp .big{font-size:20vh;font-weight:900;color:#ffe45c;text-shadow:0 .8vh 0 rgba(0,0,0,.25)}
  .qz .win .wt{display:flex;flex-direction:column;align-items:flex-start;gap:1vh;min-width:0}
  .qz .win .en{font-size:8.5vh;font-weight:900;line-height:1;color:#ffe45c;text-shadow:0 .6vh 0 rgba(0,0,0,.28);animation:qzIn .5s cubic-bezier(.2,1.4,.4,1)}
  .qz .win .en.long{font-size:6.6vh}
  .qz .win .zh1{font-size:5vh;font-weight:900}
  .qz .win .fact{background:rgba(255,255,255,.94);color:#1b2a66;border-radius:2.4vh;padding:.6vh 2vh .8vh;font-size:3.6vh;font-weight:800;line-height:1.25}
  .qz .win .fact:before{content:"💡 ";font-size:.8em}
  .qz .next{position:absolute;right:1.4vw;top:27vh;font-size:2.2vh;padding:.8vh 1.4vh;border-radius:1.6vh;border:0;background:rgba(255,255,255,.2);color:#fff;font-weight:800;cursor:pointer;z-index:3}
  .qz:not(.playing) .main,.qz:not(.playing) .next{display:none}
  /* 注音 */
  .zy-line{display:inline;white-space:normal}
  .zy{display:inline-flex;align-items:center;white-space:nowrap;margin:0 .04em;vertical-align:middle}
  .zy b{font-weight:inherit}
  .zy i{display:inline-flex;flex-direction:column;justify-content:center;align-items:center;font-style:normal;font-size:.31em;line-height:1;margin-left:.1em;width:1em;height:3.3em;font-weight:800}
  .zy i u{text-decoration:none;display:block;height:1em}
  .zy i u.lt{height:.55em;line-height:.6}
  .zy s{text-decoration:none;font-size:.34em;line-height:1;width:.55em;margin-left:-.05em;font-weight:700;align-self:center;transform:translateY(-.2em)}
  .zy-p{display:inline-block;vertical-align:middle}
  .zy-l{vertical-align:middle;margin:0 .15em}
  @media (max-aspect-ratio:3/2){.qz .main{left:3vw;right:3vw;top:24vh}.qz .qz-opt{max-width:31vw}.qz .qline{font-size:4.2vh}.qz .pic img{max-height:34vh}.qz .win .en{font-size:7.5vh}.qz .win .en.long{font-size:5.4vh}.qz .win .fact{font-size:3.3vh}.qz .qz-opt img{height:16vh}.qz .next{top:15vh}}
  `;

  let root = null, main = null, apiRef = null, pending = null;
  const bunting = () => { const cols = ["#ffd21f", "#ff5fa2", "#4cc9ff", "#2ee6b6", "#ff9a2e", "#9b6bff"]; let s = `<svg class="bunt" viewBox="0 0 1000 70" preserveAspectRatio="none"><path d="M0 6 Q500 40 1000 6" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>`;
    for (let i = 0; i < 20; i++) { const x = 25 + i * 50, y = 6 + 34 * (1 - Math.pow((x - 500) / 500, 2)) * 0.5 + 0; s += `<path d="M${x - 17} ${y.toFixed(1)} L${x + 17} ${y.toFixed(1)} L${x} ${(y + 34).toFixed(1)}Z" fill="${cols[i % cols.length]}"/>`; } return s + "</svg>"; };
  function mount(api) {
    apiRef = api; api.stage.append(h("style", {}, css));
    root = h("div", { class: "qz" });
    let dots = ""; for (let i = 0; i < 9; i++) dots += `<i style="left:${(i * 37 + 5) % 96}%;top:${(i * 53 + 20) % 80}%;width:${6 + (i % 4) * 4}vh;height:${6 + (i % 4) * 4}vh;--d:${7 + (i % 5)}s"></i>`;
    root.innerHTML = `<div class="bg">${dots}</div>${bunting()}`;
    main = h("div", { class: "main" });
    root.append(main, h("button", { class: "next zh", title: "老師：直接看答案 (Enter)", onpointerdown: (e) => { e.stopPropagation(); reveal(); } }, "⏭ 看答案"));
    api.stage.append(root);
  }
  function reveal() { if (pending) pending(); }
  function onKey(e) { if (e.repeat) return; if ((e.key === "Enter" || e.key === "n" || e.key === "N" || e.key === "ArrowRight") && pending) { e.preventDefault(); e.stopPropagation(); reveal(); } }
  const pic = (name, cls) => (TC.ART && TC.ART[name] ? TC.artImg(name, cls || "") : h("span", { class: "big" }, "?"));

  /** one question: returns false when the game was stopped */
  async function oneItem(api, G, item, pool) {
    const n = api.level === 1 ? 2 : 3;
    // gate 7: the answers are the holidays themselves (the right one + others of the list); gate 8: the item's own answers
    let opts = item.opts ? item.opts.map((o, i) => Object.assign({ ok: i === 0 }, o))
      : [{ ok: true, zh: item.zh, en: item.say }].concat(shuffle(pool.filter((x) => x !== item)).map((x) => ({ ok: false, zh: x.zh, en: x.say })));
    opts = shuffle([opts[0]].concat(shuffle(opts.slice(1)).slice(0, n - 1)));
    const q = item.q || G.q;
    root.classList.remove("say"); root.classList.toggle("haspic", !!item.pic);
    main.innerHTML = "";
    const qline = h("div", { class: "qline zh", html: (item.story ? `<span class="tag">美國故事 Story</span>` : "") + TC.zhuyin(q) + (G.askFirst ? `<span class="qen">${esc(G.teacher)}</span>` : "") });
    const picBox = item.pic ? h("div", { class: "pic" }, pic(item.pic, "spin")) : null;
    const row = h("div", { class: "opts", role: "group", "aria-label": "選答案" });
    const tip = h("div", { class: "tip zh" }, "👆 點點看！Tap the answer!");
    main.append(qline); if (picBox) main.append(picBox); main.append(row, tip);
    if (picBox) setTimeout(() => { const im = picBox.querySelector("img"); if (im) im.classList.remove("spin"); }, 1100);
    let done = null; const wait = new Promise((r) => (done = r));
    opts.forEach((o, i) => {
      const b = h("button", { type: "button", class: "qz-opt", "data-ok": o.ok ? "1" : "0", style: `--i:${i}` });
      if (o.pic) b.append(pic(o.pic)); else if (o.big) b.append(h("span", { class: "big" + (/[a-z]/i.test(o.big) ? " txt" : "") }, o.big));
      b.append(h("span", { class: "zhl zh", html: TC.zhuyin(o.zh) })); if (o.en) b.append(h("span", { class: "enl" }, o.en));
      b.addEventListener("click", (e) => { e.stopPropagation(); TC.ac();
        if (o.ok) { if (b.classList.contains("ok")) return; b.classList.add("ok"); TC.sfx("coin"); done(o); }
        else { b.classList.remove("bad"); void b.offsetWidth; b.classList.add("bad"); TC.sfx("wrong"); } });
      row.append(b);
    });
    pending = () => { const b = row.querySelector('.qz-opt[data-ok="1"]'); if (b) b.click(); };
    if (G.askFirst) TC.speak(G.teacher); // gate 7: Ollie asks "What holiday is it?" (gate 8's questions are read by the host)
    const right = await wait; pending = null;
    if (api.aborted) return false;
    TC.confetti(50); await sleep(650); if (api.aborted) return false;
    // the answer card: the picture turns a full circle, the English word, the Chinese with 注音, one thing to learn
    root.classList.add("say"); main.innerHTML = "";
    const wp = h("div", { class: "wp" }); if (item.pic || right.pic) wp.append(pic(right.pic || item.pic)); else if (right.big && !/[a-z]/i.test(right.big)) wp.append(h("span", { class: "big" }, right.big));
    const wt = h("div", { class: "wt" }, h("div", { class: "en" + (item.say.length > 12 ? " long" : "") }, item.say), h("div", { class: "zh1 zh", html: TC.zhuyin(right.zh) }));
    if (item.fact) wt.append(h("div", { class: "fact zh", html: TC.zhuyin(item.fact) }));
    main.append(h("div", { class: "win" }, ...(wp.firstChild ? [wp] : []), wt));
    // the CHILD says the English first; Ollie models it only when the teacher presses 🔊
    const r = await api.ask({ teacher: G.teacher, tzh: G.tzh, silentTeacher: !!G.askFirst, say: item.say, zh: right.zh[0], keys: [[item.w]], word: item.w, noAbc: true, pick: false });
    if (api.aborted || (r && r.cancelled)) return false;
    TC.hideTalk();
    if (r && r.ok) { TC.confetti(70); await TC.praise(); }
    await sleep(250);
    return !api.aborted;
  }

  function cleanup() { pending = null; document.removeEventListener("keydown", onKey, true); if (root) { root.classList.remove("playing", "say"); if (main) main.innerHTML = ""; } }
  const START_ART = { 7: ["hol-christmas", "hol-halloween", "hol-moon", "hol-newyear", "hol-easter", "hol-dragonboat", "star", "gift"], 8: ["usa-flag", "bus-yellow", "usa-eagle", "tree-apple", "usa-liberty", "food-turkey", "star", "trophy"] };
  TC.games.quiz = {
    get startArt() { return START_ART[TC.gate] || ["star", "gift", "trophy"]; },
    mount,
    idle(api) { if (!root) mount(api); cleanup(); },
    async play(api) {
      if (!root) mount(api);
      apiRef = api; cleanup();
      document.addEventListener("keydown", onKey, true);
      root.classList.add("playing");
      try {
        const G = api.G, n = TC.rounds(G.pick || 6), list = shuffle(G.items).slice(0, n);
        for (let i = 0; i < list.length; i++) { api.progress(i, n); if (!(await oneItem(api, G, list[i], G.items))) return; }
        api.progress(n, n);
        await TC.clapBanner(); if (api.aborted) return;
        return { ok: true };
      } finally { cleanup(); }
    }
  };
})();
