/* =====================================================================
   Toys — things in the background of every gate that a finger can play with (the teacher, 2026-11-21:
   「每一個畫面後面都可以操作，如投籃之類的；盡量都要能 360 度的物品；讓小孩想去按跟互動」).

   Two kinds:
   1. SCENE things: what the game already drew (the fan, the bell, the confetti cannons, the speakers, the hoop …)
      answers a tap — it rings, spins, fires, thumps.  Found by selector; the game files are not changed.
   2. TOYS: a few original 3D-looking objects that turn a full 360° by themselves and that a finger can flick round:
      globe, basketball, beach ball, balloon, star, gift box, paper plane, drum.  Each has several reactions, picked
      at random.  In the gym (Ollie Says) the basketball flies into the hoop and the baskets are counted.

   Rules kept here:
   - a toy never takes a tap from the game: toys sit under the teacher bar, the HUD, the home badge and every overlay;
     a toy that would lie over a button (or over the main picture of the scene) hides itself; taps on scene things are
     only watched, never stopped;
   - no speech at all (sound effects only) — nothing here can start a computer voice;
   - no prize meaning: the basket counter is only for fun, it is not the gate's 10 / 20 / 30 points;
   - everything is drawn in this file (SVG / CSS); no picture or library is loaded, so the single-file classroom
     edition works with the network off;
   - no frame loop while nobody touches anything (CSS animations only; a short loop runs while a toy spins down).

   API:  TC.Toys.mount(gameKey[, host])  — build the toys for a game ("rescue","talk","tpr","monster","chant","story",
                                            anything else = the quiz set).  Called automatically once station.js is up.
         TC.Toys.unmount()  ·  TC.Toys.tidy()  (re-check what must hide)  ·  TC.Toys.count  (taps so far)
         An element with the attribute  data-toys-clear  is never covered by a toy.
   ===================================================================== */
(function () {
  "use strict";
  const TC = (window.TC = window.TC || {});
  if (TC.Toys) return;
  const rnd = (a, b) => a + Math.random() * (b - a), pick = (a) => a[(Math.random() * a.length) | 0];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const sfx = (n) => { try { TC.sfx && TC.sfx(n); } catch (e) {} };
  const anim = (node, kf, opt) => { try { return node.animate(kf, opt); } catch (e) { return null; } };
  const svgURI = (s) => "url(\"data:image/svg+xml," + encodeURIComponent(s) + "\")";
  const COLS = ["#ff5fa2", "#ffc83d", "#4cc9ff", "#9b6bff", "#2ee6b6", "#ff8a3d"];

  /* ---------- CSS ---------- */
  const css = `
#toyLayer{position:fixed;inset:0;z-index:20;pointer-events:none;overflow:hidden;--ts:min(8.4vw,13vh)}
body:not(.playing) #toyLayer{z-index:41}
#toyFx{position:fixed;inset:0;z-index:48;pointer-events:none;overflow:hidden}
.toy{position:absolute;width:var(--ts);height:var(--ts);margin:calc(var(--ts)/-2) 0 0 calc(var(--ts)/-2);pointer-events:auto;cursor:grab;touch-action:none;
  -webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;transition:opacity .3s,visibility .3s}
.toy.off{opacity:0;visibility:hidden;pointer-events:none}
body.playing .toy[data-when=start],body:not(.playing) .toy[data-when=play]{display:none}
.toy .ty-b{position:absolute;inset:0;animation:toyBob 3.2s ease-in-out infinite;animation-delay:var(--bd,0s)}
.toy .ty-j{position:absolute;inset:0;transform-origin:50% 92%}
.toy .ty-sh{position:absolute;left:14%;right:14%;bottom:-9%;height:12%;border-radius:50%;background:rgba(0,0,20,.32);filter:blur(.5vh);animation:toyShade 3.2s ease-in-out infinite;animation-delay:var(--bd,0s)}
@keyframes toyBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7%)}}
@keyframes toyShade{0%,100%{transform:scale(1)}50%{transform:scale(.84)}}
/* a ball: a picture slides round behind a round window, light on top — it turns 360° */
.toy .ty-ball{position:absolute;inset:4%;border-radius:50%;overflow:hidden;box-shadow:0 .5vh 1.2vh rgba(0,0,20,.35);transform:translateZ(0)}
.toy .ty-off{position:absolute;left:0;top:0;height:100%;width:600%}
.toy .ty-strip{position:absolute;inset:0;background-repeat:repeat-x;background-size:33.3334% 100%;animation:toyRoll var(--rs,7s) linear infinite}
@keyframes toyRoll{to{transform:translateX(-33.3334%)}}
.toy .ty-ball::after{content:"";position:absolute;inset:0;border-radius:50%;
  background:radial-gradient(circle at 33% 26%,rgba(255,255,255,.85) 0,rgba(255,255,255,.28) 17%,rgba(255,255,255,0) 38%,rgba(0,0,40,.16) 68%,rgba(0,0,40,.5) 100%);box-shadow:inset 0 0 1vh rgba(0,0,40,.35)}
.toy[data-toy=balloon] .ty-ball{inset:0 9% 16% 9%;border-radius:50% 50% 50% 50%/46% 46% 54% 54%}
.toy[data-toy=balloon] .ty-knot{position:absolute;left:50%;bottom:9%;width:12%;height:9%;margin-left:-6%;background:var(--bc,#ff5fa2);clip-path:polygon(50% 0,100% 100%,0 100%)}
.toy[data-toy=balloon] .ty-str{position:absolute;left:50%;bottom:-22%;width:2px;height:32%;background:rgba(255,255,255,.8);transform-origin:top;animation:toySway 2.6s ease-in-out infinite}
@keyframes toySway{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}}
/* a flat thing with thickness (a stack of the same drawing): it turns 360° round its own axis */
.toy .ty-p{position:absolute;inset:0;perspective:60vh}
.toy .ty-rot,.toy .ty-spin{position:absolute;inset:0;transform-style:preserve-3d}
.toy .ty-spin{animation:toyTurn var(--rs,6s) linear infinite}
@keyframes toyTurn{to{transform:rotateY(360deg)}}
.toy .ty-l{position:absolute;inset:6%;background-size:contain;background-repeat:no-repeat;background-position:center;backface-visibility:visible}
.toy .ty-l.mid{filter:brightness(.62) saturate(1.2)}
/* a real box: six faces */
.toy .ty-cube{position:absolute;left:50%;top:54%;width:0;height:0;transform-style:preserve-3d;transform:rotateX(-20deg)}
.toy .ty-cube .ty-spin{inset:auto;left:0;top:0;width:0;height:0}
.toy .ty-f{position:absolute;width:calc(var(--ts)*.56);height:calc(var(--ts)*.56);left:calc(var(--ts)*-.28);top:calc(var(--ts)*-.28);border-radius:8%;
  background:linear-gradient(90deg,transparent 40%,#ffd23d 40%,#ffd23d 60%,transparent 60%),linear-gradient(0deg,transparent 40%,#ffd23d 40%,#ffd23d 60%,transparent 60%),linear-gradient(135deg,#ff6fae,#e02f7c);box-shadow:inset 0 0 0 .25vh rgba(255,255,255,.35)}
.toy .ty-f.f1{transform:translateZ(calc(var(--ts)*.28))}.toy .ty-f.f2{transform:rotateY(90deg) translateZ(calc(var(--ts)*.28));filter:brightness(.86)}
.toy .ty-f.f3{transform:rotateY(180deg) translateZ(calc(var(--ts)*.28))}.toy .ty-f.f4{transform:rotateY(-90deg) translateZ(calc(var(--ts)*.28));filter:brightness(.86)}
.toy .ty-f.f5{transform:rotateX(90deg) translateZ(calc(var(--ts)*.28));filter:brightness(1.12)}.toy .ty-f.f6{transform:rotateX(-90deg) translateZ(calc(var(--ts)*.28));filter:brightness(.6)}
.toy .ty-bow{position:absolute;width:calc(var(--ts)*.36);height:calc(var(--ts)*.2);left:calc(var(--ts)*-.18);top:calc(var(--ts)*-.47);background-size:contain;background-repeat:no-repeat;background-position:center bottom}
.toy .ty-bow.b2{transform:rotateY(90deg)}
/* little things that fly off a toy */
.toy-bit{position:absolute;left:0;top:0;pointer-events:none;will-change:transform,opacity}
.toy-bit.dot{border-radius:50%}
.toy-bit.pic{width:calc(min(8.4vw,13vh)*.9);height:calc(min(8.4vw,13vh)*.9);margin:calc(min(8.4vw,13vh)*-.45) 0 0 calc(min(8.4vw,13vh)*-.45);object-fit:contain;filter:drop-shadow(0 .5vh .8vh rgba(0,0,30,.4))}
.toy-score{position:fixed;z-index:21;pointer-events:none;transform:translate(-50%,-100%);display:flex;align-items:center;gap:.4em;padding:.25em .8em;border-radius:99em;background:rgba(16,22,60,.86);
  border:.2vh solid #ffd23d;color:#fff;font:800 min(2.6vh,1.9vw)/1.2 "Baloo 2","Fredoka",system-ui,sans-serif;white-space:nowrap;opacity:0;transition:opacity .35s}
.toy-score.on{opacity:1}.toy-score i{display:inline-block;width:1.1em;height:1.1em;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffb35c,#f26a1b 70%,#b94a0b)}
.toy-score small{font-size:.62em;opacity:.8;font-weight:600}
@media (prefers-reduced-motion:reduce){.toy .ty-b,.toy .ty-sh{animation:none}}
`;
  function addCSS() { if (document.getElementById("toyCSS")) return; const s = el("style"); s.id = "toyCSS"; s.textContent = css; document.head.append(s); }

  /* ---------- drawings (all original) ---------- */
  const STAR5 = "M50 6 L61.8 36.6 L94.5 38.2 L68.9 58.7 L77.6 90.3 L50 72.4 L22.4 90.3 L31.1 58.7 L5.5 38.2 L38.2 36.6Z";
  const TEX = {
    globe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="none"><rect width="200" height="100" fill="#2f8fe6"/><rect width="200" height="9" fill="#f3fbff"/><rect y="92" width="200" height="8" fill="#f3fbff"/>
<g fill="#3fc36b" stroke="#2a9a50" stroke-width="1.2"><path d="M14 22 Q30 14 46 22 Q52 34 42 44 Q38 58 30 62 Q22 50 18 40 Q8 32 14 22Z"/><path d="M36 60 Q46 62 44 74 Q40 86 34 84 Q30 72 36 60Z"/>
<path d="M92 18 Q110 12 124 22 Q128 32 118 36 Q108 34 104 44 Q112 56 106 70 Q98 76 96 62 Q88 50 90 40 Q84 28 92 18Z"/><path d="M128 20 Q150 12 172 22 Q184 34 172 44 Q160 42 152 52 Q142 46 134 40 Q126 32 128 20Z"/>
<path d="M160 64 Q174 60 180 70 Q176 80 164 78 Q156 72 160 64Z"/><path d="M62 30 q5 -4 9 1 q-2 6 -8 5Z"/></g></svg>`,
    bball: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="none"><rect width="200" height="100" fill="#f47a1f"/><g fill="none" stroke="#3a1c08" stroke-width="3.2"><path d="M0 50 H200"/><path d="M50 0 V100 M150 0 V100"/>
<path d="M0 14 Q25 44 50 50 Q75 44 100 14 Q125 44 150 50 Q175 44 200 14"/><path d="M0 86 Q25 56 50 50 Q75 56 100 86 Q125 56 150 50 Q175 56 200 86"/></g><g fill="#c85a10" opacity=".5">${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 37) % 200}" cy="${(i * 23) % 100}" r="1"/>`).join("")}</g></svg>`,
    beach: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="none">${["#ff4f6d", "#fff", "#ffc83d", "#fff", "#3aa7ff", "#fff", "#2ed3a0", "#fff"].map((c, i) => `<rect x="${i * 25}" width="25.5" height="100" fill="${c}"/>`).join("")}</svg>`,
    balloon: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="none"><rect width="200" height="100" fill="${c}"/><g fill="#fff" opacity=".55">${[[20, 30, .22], [70, 62, .3], [118, 26, .2], [160, 58, .28], [96, 80, .16], [44, 84, .14]].map(([x, y, s]) => `<path transform="translate(${x - 50 * s} ${y - 50 * s}) scale(${s})" d="${STAR5}"/>`).join("")}</g></svg>`
  };
  const FLAT = {
    star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a6"/><stop offset=".55" stop-color="#ffc83d"/><stop offset="1" stop-color="#f08a12"/></linearGradient></defs>
<path d="${STAR5}" fill="url(#g)" stroke="#c8780a" stroke-width="4" stroke-linejoin="round"/><circle cx="40" cy="50" r="4.4" fill="#402400"/><circle cx="60" cy="50" r="4.4" fill="#402400"/><circle cx="41.4" cy="48.6" r="1.4" fill="#fff"/><circle cx="61.4" cy="48.6" r="1.4" fill="#fff"/>
<path d="M43 60 Q50 67 57 60" fill="none" stroke="#402400" stroke-width="3" stroke-linecap="round"/><ellipse cx="33" cy="57" rx="4" ry="2.4" fill="#ff8fb0" opacity=".8"/><ellipse cx="67" cy="57" rx="4" ry="2.4" fill="#ff8fb0" opacity=".8"/></svg>`,
    drum: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c81e4a"/><stop offset=".5" stop-color="#ff5f86"/><stop offset="1" stop-color="#c81e4a"/></linearGradient></defs>
<path d="M12 40 V74 Q50 94 88 74 V40Z" fill="url(#d)" stroke="#7d0f2c" stroke-width="3"/><path d="M12 46 L31 78 L50 52 L69 78 L88 46" fill="none" stroke="#ffe58a" stroke-width="3.4" stroke-linejoin="round"/>
<path d="M12 72 Q50 92 88 72" fill="none" stroke="#ffd23d" stroke-width="6"/><ellipse cx="50" cy="40" rx="38" ry="12" fill="#fff8e6" stroke="#ffd23d" stroke-width="6"/>
<path d="M22 8 L46 36" stroke="#b9772a" stroke-width="5" stroke-linecap="round"/><circle cx="22" cy="8" r="6" fill="#ffe2a8" stroke="#b9772a" stroke-width="2"/><path d="M78 8 L56 36" stroke="#b9772a" stroke-width="5" stroke-linecap="round"/><circle cx="78" cy="8" r="6" fill="#ffe2a8" stroke="#b9772a" stroke-width="2"/></svg>`,
    plane: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M6 46 L94 14 L60 86 L46 60Z" fill="#fff" stroke="#6b7fc7" stroke-width="3" stroke-linejoin="round"/><path d="M94 14 L46 60 L44 82 L56 68" fill="#cfe0ff" stroke="#6b7fc7" stroke-width="3" stroke-linejoin="round"/>
<path d="M6 46 L46 60 L94 14" fill="none" stroke="#6b7fc7" stroke-width="3" stroke-linejoin="round"/><path d="M20 78 q8 -2 10 6 M10 88 q6 -1 7 5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg>`,
    bow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 56"><path d="M50 44 Q20 0 6 20 Q0 40 50 44Z M50 44 Q80 0 94 20 Q100 40 50 44Z" fill="#ffd23d" stroke="#d99a0b" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="44" r="9" fill="#ffe58a" stroke="#d99a0b" stroke-width="3"/></svg>`,
    bit: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${STAR5}" fill="${c}" stroke="#fff" stroke-width="5" stroke-linejoin="round"/></svg>`,
    note: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M38 20 L82 10 V66 A14 12 0 1 1 72 55 V30 L48 36 V76 A14 12 0 1 1 38 65Z" fill="${c}" stroke="#fff" stroke-width="5" stroke-linejoin="round"/></svg>`,
    heart: (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 86 C10 58 6 30 26 20 C40 14 48 24 50 32 C52 24 60 14 74 20 C94 30 90 58 50 86Z" fill="${c}" stroke="#fff" stroke-width="5" stroke-linejoin="round"/></svg>`
  };

  /* ---------- layers, bits that fly ---------- */
  let layer = null, fx = null, toys = [], curKey = null, mo = null, tidyT = 0, lastTidy = 0, alive = false;
  const T = { count: 0, baskets: 0 };
  function fxLayer() { if (!fx || !fx.isConnected) { fx = el("div"); fx.id = "toyFx"; document.body.append(fx); } return fx; }
  function burst(x, y, opt) {
    opt = opt || {}; const n = opt.n || 10, L = fxLayer(), u = Math.min(innerWidth, innerHeight * 1.5) / 100;
    for (let i = 0; i < n; i++) {
      const kind = opt.kind || pick(["star", "dot", "dot"]), c = pick(opt.cols || COLS), s = rnd(1.6, 3.4) * u * (opt.size || 1);
      const b = el("div", "toy-bit" + (kind === "dot" ? " dot" : "")); b.style.width = b.style.height = s + "px";
      if (kind === "dot") b.style.background = c; else { b.style.backgroundImage = svgURI((FLAT[kind === "star" ? "bit" : kind] || FLAT.bit)(c)); b.style.backgroundSize = "contain"; }
      L.append(b);
      const a = opt.up ? rnd(-2.4, -0.75) : rnd(0, 6.283), d = rnd(7, 17) * u * (opt.reach || 1), dx = Math.cos(a) * d, dy = Math.sin(a) * d;
      const an = anim(b, [{ transform: `translate(${x - s / 2}px,${y - s / 2}px) scale(.3) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${x - s / 2 + dx}px,${y - s / 2 + dy}px) scale(1) rotate(${rnd(-200, 200)}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${x - s / 2 + dx * 1.15}px,${y - s / 2 + dy * 1.15 + 6 * u}px) scale(.6) rotate(${rnd(-360, 360)}deg)`, opacity: 0 }],
      { duration: rnd(650, 1100), easing: "cubic-bezier(.2,.7,.3,1)" });
      if (an) an.onfinish = () => b.remove(); else setTimeout(() => b.remove(), 900);
    }
  }
  const centre = (node) => { const r = node.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  function bump() {                       // every few taps something bigger happens, so it stays fresh
    T.count++; TC.Toys.count = T.count;
    if (T.count % 8 === 0) { sfx("sparkle"); toys.forEach((t, i) => setTimeout(() => t.isConnected && !t.classList.contains("off") && react(t, "jump", true), i * 110)); try { TC.confetti && TC.confetti(40); } catch (e) {} }
  }

  /* ---------- reactions of a toy ---------- */
  const J = (t) => t.querySelector(".ty-j");
  const MOVES = {
    jump: (t) => anim(J(t), [{ transform: "translateY(0) scale(1,1)" }, { transform: "translateY(4%) scale(1.14,.82)", offset: 0.14 }, { transform: "translateY(-78%) scale(.92,1.1)", offset: 0.5 }, { transform: "translateY(0) scale(1.12,.86)", offset: 0.84 }, { transform: "translateY(0) scale(1,1)" }], { duration: 760, easing: "ease-out" }),
    hop2: (t) => anim(J(t), [{ transform: "translateY(0)" }, { transform: "translateY(-52%)", offset: 0.22 }, { transform: "translateY(0) scale(1.1,.88)", offset: 0.45 }, { transform: "translateY(-30%)", offset: 0.66 }, { transform: "translateY(0) scale(1.06,.92)", offset: 0.88 }, { transform: "translateY(0)" }], { duration: 900, easing: "ease-out" }),
    wob: (t) => anim(J(t), [{ transform: "rotate(0)" }, { transform: "rotate(-18deg)" }, { transform: "rotate(15deg)" }, { transform: "rotate(-9deg)" }, { transform: "rotate(5deg)" }, { transform: "rotate(0)" }], { duration: 700, easing: "ease-in-out" }),
    grow: (t) => anim(J(t), [{ transform: "scale(1)" }, { transform: "scale(1.5)", offset: 0.4 }, { transform: "scale(.9)", offset: 0.75 }, { transform: "scale(1)" }], { duration: 620, easing: "ease-out" }),
    flip: (t) => anim(J(t), [{ transform: "translateY(0) rotate(0)" }, { transform: "translateY(-70%) rotate(180deg)", offset: 0.5 }, { transform: "translateY(0) rotate(360deg)" }], { duration: 820, easing: "ease-in-out" })
  };
  function react(t, how, quiet) {
    const [x, y] = centre(t), kind = t.dataset.toy;
    if (!quiet) bump();
    if (how) { MOVES[how](t); return; }
    if (t._busy) return;
    const special = SPECIAL[kind] && SPECIAL[kind](t, x, y);
    if (special) return;
    const m = pick(["jump", "hop2", "wob", "grow", "flip", "spin"]);
    if (m === "spin") { t._v = pick([-1, 1]) * rnd(34, 52); spinLoop(t); sfx("whoosh"); } else { MOVES[m](t); sfx(pick(["pop", "click", "catch"])); }
    burst(x, y, { n: 7 });
  }
  const SPECIAL = {
    balloon(t, x, y) {                   // 2 times in 3 it pops and a new one in another colour grows back
      if (Math.random() < 0.34) return false;
      t._busy = true; sfx("pop"); burst(x, y - t.offsetHeight * 0.1, { n: 16, cols: [t._col, "#fff", t._col], reach: 1.2 });
      const j = J(t); j.style.visibility = "hidden";
      setTimeout(() => { if (!t.isConnected) return; paintBalloon(t, pick(COLS.filter((c) => c !== t._col))); j.style.visibility = "";
        const a = anim(j, [{ transform: "scale(.05)" }, { transform: "scale(1.15)", offset: 0.7 }, { transform: "scale(1)" }], { duration: 700, easing: "ease-out" }); sfx("catch");
        const done = () => { t._busy = false; }; if (a) a.onfinish = done; else done(); }, 1100);
      return true;
    },
    star(t, x, y) { if (Math.random() < 0.5) return false; MOVES.grow(t); sfx("sparkle"); burst(x, y, { n: 14, kind: "star", cols: ["#ffe066", "#ffc83d", "#fff3a6"], reach: 1.3 }); return true; },
    drum(t, x, y) { MOVES[pick(["wob", "grow"])](t); sfx(pick(["drum", "kick", "snare", "kick"])); burst(x, y - t.offsetHeight * 0.3, { n: 5, kind: "note", up: true, size: 1.2 }); return true; },
    gift(t, x, y) {                      // something different jumps out of the box every time
      MOVES.jump(t); sfx("pop");
      const names = TC.ART ? Object.keys(TC.ART).filter((n) => !/^(sit-|talk-|ollie|mystegg|gift)/.test(n) && typeof TC.ART[n] === "function") : [];
      if (!names.length || !TC.art) { burst(x, y, { n: 12, kind: pick(["heart", "star"]), up: true }); return true; }
      let src = ""; try { src = TC.art(pick(names.slice(0, 48))); } catch (e) {}
      if (!src) { burst(x, y, { n: 12, kind: "heart", up: true }); return true; }
      const im = new Image(); im.src = src; im.className = "toy-bit pic"; im.draggable = false; fxLayer().append(im);
      const u = Math.min(innerWidth, innerHeight * 1.5) / 100, sx = rnd(-10, 10) * u;
      const a = anim(im, [{ transform: `translate(${x}px,${y}px) scale(.1) rotateY(0deg)`, opacity: 1 }, { transform: `translate(${x + sx * 0.5}px,${y - 16 * u}px) scale(1.15) rotateY(360deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${x + sx * 0.8}px,${y - 17 * u}px) scale(1) rotateY(720deg)`, opacity: 1, offset: 0.8 }, { transform: `translate(${x + sx}px,${y - 20 * u}px) scale(.6) rotateY(900deg)`, opacity: 0 }], { duration: 1700, easing: "ease-out" });
      if (a) a.onfinish = () => im.remove(); else setTimeout(() => im.remove(), 1700);
      setTimeout(() => sfx("sparkle"), 350); return true;
    },
    plane(t) {                           // loops the loop, or flies across the room and comes back
      t._busy = true; sfx("whoosh"); const j = J(t), u = t.offsetWidth, kf = [];
      if (Math.random() < 0.5) { for (let i = 0; i <= 16; i++) { const a = (i / 16) * 6.283; kf.push({ transform: `translate(${Math.sin(a) * u * 1.1}px,${(Math.cos(a) - 1) * u * 1.1}px) rotate(${-a}rad)` }); } }
      else { const r = t.getBoundingClientRect(), d = (r.left + r.width / 2 < innerWidth / 2 ? 1 : -1) * Math.min(innerWidth * 0.3, u * 4);
        for (let i = 0; i <= 12; i++) { const k = i / 12, a = k * 6.283; kf.push({ transform: `translate(${Math.sin(a / 2) * d}px,${-Math.sin(a) * u * 0.7 - Math.sin(a / 2) * u * 0.5}px) rotate(${Math.cos(a) * -18 * (d > 0 ? 1 : -1)}deg) scaleX(${k > 0.5 ? -1 : 1})` }); } }
      const a = anim(j, kf, { duration: 1500, easing: "ease-in-out" }); const done = () => { t._busy = false; }; if (a) a.onfinish = done; else done(); return true;
    },
    bball(t) { if (curKey !== "tpr" || t.dataset.when !== "play") return false; return shoot(t); },
    globe(t, x, y) { if (Math.random() < 0.5) return false; t._v = pick([-1, 1]) * rnd(46, 64); spinLoop(t); MOVES.jump(t); sfx("whoosh"); burst(x, y, { n: 8, kind: "heart", cols: ["#ff5fa2", "#ff8a3d", "#fff"] }); return true; }
  };

  /* ---------- turning with a finger ---------- */
  function applySpin(t) {
    if (t._ball) { const w = t._ball.offsetWidth * 2 || 1; let o = t._a % w; if (o > 0) o -= w; t._off.style.transform = `translateX(${o}px)`; }
    else if (t._rot) t._rot.style.transform = `rotateY(${t._a}deg)`;
  }
  function spinLoop(t) {
    if (t._raf) return;
    const step = () => { t._raf = 0; if (!t.isConnected) return; t._a += t._v * (t._ball ? t._ball.offsetWidth / 90 : 1); t._v *= 0.955; applySpin(t); if (Math.abs(t._v) > 0.25) t._raf = requestAnimationFrame(step); };
    t._raf = requestAnimationFrame(step);
  }
  const HOT = "button,a,input,select,textarea,label,.pick-btn,.abc-btn,[role=button],[onclick],.lr-b,.home-link";
  function wire(t) {
    let down = null;
    t.addEventListener("pointerdown", (e) => {
      // a button of the game under the toy always wins: hide the toy and pass the tap on
      const under = document.elementsFromPoint(e.clientX, e.clientY).find((n) => !n.closest("#toyLayer") && n.closest(HOT));
      if (under) { t.classList.add("off"); const b = under.closest(HOT); setTimeout(() => { try { b.click(); } catch (er) {} }, 0); e.stopPropagation(); return; }
      e.stopPropagation(); e.preventDefault(); try { TC.ac && TC.ac(); } catch (er) {}
      try { t.setPointerCapture(e.pointerId); } catch (er) {}
      down = { x: e.clientX, y: e.clientY, lx: e.clientX, t: Date.now(), moved: 0, v: 0 }; t._v = 0; t.style.cursor = "grabbing";
    });
    t.addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - down.lx; down.lx = e.clientX; down.moved += Math.abs(dx); down.v = dx; t._a += t._ball ? dx : dx * 1.4; applySpin(t); });
    const up = (e) => { if (!down) return; const d = down; down = null; t.style.cursor = "";
      if (d.moved < 12 && Date.now() - d.t < 600) { react(t); return; }
      t._v = Math.max(-60, Math.min(60, d.v * (t._ball ? 1 : 1.4))); spinLoop(t);
      if (Math.abs(t._v) > 9) { sfx("whoosh"); const [x, y] = centre(t); burst(x, y, { n: 6 }); bump(); } };
    t.addEventListener("pointerup", up); t.addEventListener("pointercancel", up);
    ["click", "mousedown", "touchstart"].forEach((n) => t.addEventListener(n, (e) => e.stopPropagation(), { passive: true }));
  }

  /* ---------- building a toy ---------- */
  function paintBalloon(t, c) { t._col = c; t.style.setProperty("--bc", c); t.querySelector(".ty-strip").style.backgroundImage = svgURI(TEX.balloon(c)); }
  function make(kind, when) {
    const t = el("div", "toy"); t.dataset.toy = kind; t.dataset.when = when; t.setAttribute("aria-hidden", "true"); t._a = 0; t._v = 0;
    t.style.setProperty("--bd", (-rnd(0, 3)).toFixed(2) + "s"); t.style.setProperty("--rs", rnd(5.5, 8.5).toFixed(1) + "s");
    let inner = "";
    if (kind === "globe" || kind === "bball" || kind === "beach" || kind === "balloon")
      inner = `<div class="ty-ball"><div class="ty-off"><div class="ty-strip"></div></div></div>` + (kind === "balloon" ? `<i class="ty-knot"></i><i class="ty-str"></i>` : "");
    else if (kind === "gift")
      inner = `<div class="ty-p"><div class="ty-cube"><div class="ty-rot"><div class="ty-spin">${[1, 2, 3, 4, 5, 6].map((i) => `<i class="ty-f f${i}"></i>`).join("")}<i class="ty-bow"></i><i class="ty-bow b2"></i></div></div></div></div>`;
    else { const n = kind === "plane" ? 3 : 7, th = kind === "plane" ? 0.012 : 0.02;
      inner = `<div class="ty-p"><div class="ty-rot"><div class="ty-spin">${Array.from({ length: n }, (_, i) => `<i class="ty-l${i > 0 && i < n - 1 ? " mid" : ""}" style="transform:translateZ(calc(var(--ts)*${((i - (n - 1) / 2) * th).toFixed(3)}))"></i>`).join("")}</div></div></div>`; }
    t.innerHTML = `<i class="ty-sh"></i><div class="ty-b"><div class="ty-j">${inner}</div></div>`;
    t._ball = t.querySelector(".ty-ball"); t._off = t.querySelector(".ty-off"); t._rot = t.querySelector(".ty-rot");
    if (kind === "balloon") { paintBalloon(t, pick(COLS)); t.querySelector(".ty-sh").style.display = "none"; }
    else if (t._ball) t.querySelector(".ty-strip").style.backgroundImage = svgURI(TEX[kind]);
    else if (kind === "gift") t.querySelectorAll(".ty-bow").forEach((b) => (b.style.backgroundImage = svgURI(FLAT.bow)));
    else t.querySelectorAll(".ty-l").forEach((l) => (l.style.backgroundImage = svgURI(FLAT[kind])));
    wire(t); return t;
  }

  /* ---------- where the toys stand: [toy, x%, y%] for a wide screen, then for a 4:3 screen ---------- */
  const SETS = {
    rescue: { wide: [["plane", 61, 56.5, 0.8]], tall: [["plane", 90, 60]], clear: ".rq .card.show,.rq .ollie,.rq .bub.show,.rq .board,.rq .clk,.rq .desk,.rq .fan,.rq .win" },
    talk: { wide: [["balloon", 10.5, 44]], tall: [["balloon", 30, 66]], clear: ".tk .seat,.tk .tv,.tk .desk,.tk .meter,.tk .onair,.tk .gsign,.tk .cannon" },
    tpr: { wide: [["bball", 88, 59], ["beach", 15, 59], ["star", 7.5, 43]], tall: [["bball", 88, 60], ["beach", 14, 60], ["star", 7, 50]], clear: ".tpr .nosay,.tpr .ring,.tpr .next" },
    monster: { wide: [["gift", 8, 49], ["balloon", 90, 40], ["globe", 91, 20]], tall: [["gift", 8, 44], ["balloon", 91, 44], ["globe", 91, 24]], clear: ".g4 .mon,.g4 .cards .slot" },
    chant: { wide: [["drum", 7.5, 42], ["star", 92.5, 40]], tall: [["drum", 8, 38], ["star", 92, 38]], clear: ".g5 .decks,.g5 .spk" },
    story: { wide: [["plane", 6.5, 61], ["star", 93.5, 61], ["globe", 93.5, 20]], tall: [["plane", 7, 66], ["star", 93, 66], ["globe", 93, 52]], clear: ".g6>img.prop" },
    quiz: { wide: [["globe", 7.5, 46], ["balloon", 92.5, 30], ["gift", 92.5, 54], ["star", 7.5, 63]], tall: [["globe", 8, 40], ["balloon", 92, 30], ["gift", 92, 52], ["star", 8, 58]], clear: "" },
    start: { wide: [["globe", 31, 21], ["beach", 31, 88], ["balloon", 93, 21.5]], tall: [["globe", 36, 19], ["beach", 33, 90], ["balloon", 93, 24]],
      clear: "#scan h1,#startBtn,#scan .lvl-now,#scan .school-row,#scan .genre,#scan .sub,#scan .scan-badge,#scan .scan-o3,#scan .scan-top" }
  };
  function place() {
    const tall = innerWidth / innerHeight < 1.55;
    toys.forEach((t) => { const s = (tall ? t._slot.tall : t._slot.wide) || t._slot.wide; t.style.left = s[1] + "%"; t.style.top = s[2] + "%"; if (s[3]) t.style.setProperty("--ts", `calc(min(8.4vw,13vh)*${s[3]})`); else t.style.removeProperty("--ts"); });
  }
  const hit = (a, b, pad) => !(a.right + pad < b.left || a.left - pad > b.right || a.bottom + pad < b.top || a.top - pad > b.bottom);
  const shown = (n) => { const r = n.getBoundingClientRect(); if (!r.width || !r.height) return null; const cs = getComputedStyle(n); if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) return null; return r; };
  /* hide every toy that would lie over a button, the teacher bar, the HUD, the home badge or the main picture of the scene */
  function tidy() {
    if (!layer || !layer.isConnected) return; lastTidy = Date.now();
    const playing = document.body.classList.contains("playing"), set = SETS[playing ? curKey : "start"] || SETS.quiz;
    const sel = HOT + ",#hud>*,.big-emb,[data-toys-clear],#talk.show" + (set.clear ? "," + set.clear : "") + (playing ? "" : "," + SETS.start.clear);
    const rects = []; document.querySelectorAll(sel).forEach((n) => { if (n.closest("#toyLayer,#toyFx")) return; if (n.offsetParent === null && getComputedStyle(n).position !== "fixed") return; const r = shown(n); if (r && r.width * r.height < innerWidth * innerHeight * 0.8) rects.push(r); });
    const talk = document.querySelector("#talk"); let floor = innerHeight;
    if (playing && talk) floor = innerHeight - talk.offsetHeight - parseFloat(getComputedStyle(talk).bottom || 0);   // the place the teacher bar slides into is always kept free
    const pad = Math.min(innerWidth, innerHeight) * 0.008;
    toys.forEach((t) => {
      if (t.dataset.when !== (playing ? "play" : "start")) return;
      const w = t.offsetWidth, r0 = t._box || (t._box = {}); const x = parseFloat(t.style.left) / 100 * innerWidth, y = parseFloat(t.style.top) / 100 * innerHeight;
      r0.left = x - w / 2; r0.right = x + w / 2; r0.top = y - w / 2; r0.bottom = y + w * 0.52;
      const bad = r0.bottom > floor || r0.left < 0 || r0.right > innerWidth || rects.some((r) => hit(r0, r, pad));
      if (!t._busy) t.classList.toggle("off", bad);
    });
  }
  function tidySoon() { if (tidyT) return; tidyT = setTimeout(() => { tidyT = 0; tidy(); }, Math.max(60, 350 - (Date.now() - lastTidy))); }

  /* ---------- the gym: the ball flies into the hoop ---------- */
  const HOOP = { rim: [1421, 318], board: [1421, 250], top: [1421, 172], box: [1306, 168, 1536, 388] }, PENNANT = [292, 222, 566, 356];   // in the units of the gym drawing (g3-tpr.js)
  const gymSVG = () => document.querySelector("#stage .tpr svg.bg");
  function gymPt(p) { const s = gymSVG(); if (!s || !s.getScreenCTM) return null; const m = s.getScreenCTM(); if (!m) return null; return [m.a * p[0] + m.c * p[1] + m.e, m.b * p[0] + m.d * p[1] + m.f]; }
  let scoreEl = null, scoreT = 0;
  function showScore() {
    const p = gymPt(HOOP.top); if (!p) return;
    if (!scoreEl || !scoreEl.isConnected) { scoreEl = el("div", "toy-score zh"); document.body.append(scoreEl); }
    scoreEl.innerHTML = `<i></i><b>× ${T.baskets}</b><small>好玩用 just for fun</small>`; scoreEl.style.left = p[0] + "px"; scoreEl.style.top = Math.max(p[1] - 4, innerHeight * 0.13) + "px";
    scoreEl.classList.add("on"); clearTimeout(scoreT); scoreT = setTimeout(() => scoreEl && scoreEl.classList.remove("on"), 2600);
  }
  function shoot(t) {
    const rim = gymPt(HOOP.rim), board = gymPt(HOOP.board); if (!rim) return false;
    const r = t.getBoundingClientRect(), x0 = r.left + r.width / 2, y0 = r.top + r.height / 2, dx = rim[0] - x0, dy = rim[1] - y0, u = r.width;
    t._busy = true; t._v = -40; spinLoop(t); sfx("whoosh");
    const way = pick(["swish", "swish", "bank", "roll", "high"]), kf = [], H = (way === "high" ? 3.2 : 1.7) * u + Math.max(0, -dy) * 0.25, S = 0.5;
    const arc = (n, tx, ty) => { for (let i = 0; i <= n; i++) { const k = i / n; kf.push({ transform: `translate(${tx * k}px,${ty * k - H * 4 * k * (1 - k)}px) scale(${1 - (1 - S) * k})` }); } };
    if (way === "bank" && board) { arc(10, board[0] - x0 + u * 0.1, board[1] - y0); kf.push({ transform: `translate(${dx}px,${dy - u * 0.12}px) scale(${S})` }); }
    else if (way === "roll") { arc(10, dx - u * 0.2, dy - u * 0.14); for (let i = 1; i <= 8; i++) { const a = (i / 8) * 9.42; kf.push({ transform: `translate(${dx + Math.cos(a) * u * 0.2 * (1 - i / 9)}px,${dy - u * 0.14 + Math.sin(a) * u * 0.04}px) scale(${S})` }); } }
    else arc(12, dx, dy - u * 0.12);
    const inAt = kf.length;
    kf.push({ transform: `translate(${dx}px,${dy + u * 0.34}px) scale(${S * 0.94})` }, { transform: `translate(${dx}px,${dy + u * 0.8}px) scale(${S * 0.9})`, opacity: 1 }, { transform: `translate(${dx}px,${dy + u * 1.5}px) scale(${S * 0.86})`, opacity: 0 });
    const dur = way === "roll" ? 1700 : way === "high" ? 1500 : 1250, j = J(t), sh = t.querySelector(".ty-sh"); if (sh) sh.style.opacity = "0";
    t.querySelector(".ty-b").style.animationPlayState = "paused";
    const a = anim(j, kf, { duration: dur, easing: "linear", fill: "forwards" });
    setTimeout(() => {                    // through the net
      T.baskets++; sfx(T.baskets % 5 === 0 ? "fanfare" : pick(["coin", "ding", "catch"])); burst(rim[0], rim[1] + u * 0.2, { n: T.baskets % 5 === 0 ? 22 : 10, kind: "star", cols: ["#ffe066", "#fff", "#ff8a3d"] });
      if (T.baskets % 5 === 0) { try { TC.confetti && TC.confetti(70); } catch (e) {} }
      const s = gymSVG(), net = s && s.querySelector('path[d^="M1374 320"]');
      if (net) { net.style.transformOrigin = "1421px 320px"; anim(net, [{ transform: "scale(1,1)" }, { transform: "scale(.86,1.32)" }, { transform: "scale(1.08,.9) skewX(6deg)" }, { transform: "scale(.96,1.1) skewX(-4deg)" }, { transform: "scale(1,1)" }], { duration: 620, easing: "ease-out" }); }
      showScore();
    }, dur * (inAt / (kf.length - 1)));
    const back = () => { if (a) a.cancel(); if (sh) sh.style.opacity = ""; t.querySelector(".ty-b").style.animationPlayState = "";
      const b = anim(j, [{ transform: "translateY(-160%) scale(.9)", opacity: 0 }, { transform: "translateY(0) scale(1.1,.86)", opacity: 1, offset: 0.5 }, { transform: "translateY(-34%)", offset: 0.72 }, { transform: "translateY(0) scale(1.05,.92)", offset: 0.9 }, { transform: "translateY(0)" }], { duration: 760, easing: "ease-out" });
      setTimeout(() => sfx("kick"), 380); const done = () => { t._busy = false; tidySoon(); }; if (b) b.onfinish = done; else done(); };
    if (a) a.onfinish = () => setTimeout(back, 120); else setTimeout(back, dur);
    return true;
  }

  /* ---------- things the scene already has: they answer a tap ---------- */
  const add = (node, kf, opt) => anim(node, kf, Object.assign({ duration: 700, easing: "ease-out", composite: "add" }, opt || {}));
  const R = {
    spinz: (n) => { add(n, [{ transform: "rotate(0deg)" }, { transform: `rotate(${pick([720, -720, 1080])}deg)` }], { duration: 1300, easing: "cubic-bezier(.2,.7,.2,1)" }); sfx("whoosh"); },
    spiny: (n) => { add(n, [{ transform: "rotateY(0deg) scale(1)" }, { transform: "rotateY(360deg) scale(1.18)", offset: 0.5 }, { transform: "rotateY(720deg) scale(1)" }], { duration: 1100 }); sfx(pick(["pop", "catch"])); },
    jump: (n) => { add(n, [{ transform: "translateY(0)" }, { transform: "translateY(-16%)", offset: 0.35 }, { transform: "translateY(0)", offset: 0.7 }, { transform: "translateY(-5%)", offset: 0.85 }, { transform: "translateY(0)" }], { duration: 620 }); sfx("pop"); },
    wob: (n) => { add(n, [{ transform: "rotate(0)" }, { transform: "rotate(-9deg)" }, { transform: "rotate(8deg)" }, { transform: "rotate(-5deg)" }, { transform: "rotate(0)" }], { duration: 650, easing: "ease-in-out" }); sfx("click"); },
    ring: (n) => { n.style.transformOrigin = n.style.transformOrigin || "50% 8%"; add(n, [{ transform: "rotate(0)" }, { transform: "rotate(22deg)" }, { transform: "rotate(-20deg)" }, { transform: "rotate(14deg)" }, { transform: "rotate(-9deg)" }, { transform: "rotate(0)" }], { duration: 900, easing: "ease-in-out" }); sfx("ding"); },
    flash: (n) => { anim(n, [{ filter: "brightness(1)" }, { filter: "brightness(1.9) saturate(1.5)" }, { filter: "brightness(1)" }, { filter: "brightness(1.9) saturate(1.5)" }, { filter: "brightness(1)" }], { duration: 800 }); add(n, [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 400 }); sfx(pick(["boost", "tick", "sparkle"])); },
    thump: (n) => { add(n, [{ transform: "scale(1)" }, { transform: "scale(1.13)" }, { transform: "scale(.97)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 420 }); sfx(pick(["kick", "kick", "snare", "drum"])); const [x, y] = centre(n); burst(x, y, { n: 4, kind: "note", up: true, size: 1.2 }); },
    knock: (n) => { add(n, [{ transform: "translateX(0)" }, { transform: "translateX(-1.2%)" }, { transform: "translateX(1%)" }, { transform: "translateX(-.6%)" }, { transform: "translateX(0)" }], { duration: 380 }); sfx("tick"); setTimeout(() => sfx("tick"), 160); },
    sway: (n) => { add(n, [{ transform: "skewX(0)" }, { transform: "skewX(-5deg)" }, { transform: "skewX(4deg)" }, { transform: "skewX(-2deg)" }, { transform: "skewX(0)" }], { duration: 900, easing: "ease-in-out" }); sfx("whoosh"); },
    fire: (n) => { const r = n.getBoundingClientRect(), left = r.left + r.width / 2 < innerWidth / 2; add(n, [{ transform: "translate(0,0)" }, { transform: "translate(-6%,7%)" }, { transform: "translate(0,0)" }], { duration: 300 });
      sfx("pop"); setTimeout(() => sfx("sparkle"), 120); burst(left ? r.right - r.width * 0.15 : r.left + r.width * 0.15, r.top + r.height * 0.2, { n: 22, up: true, reach: 2.2 }); },
    hands: (n) => { n.querySelectorAll("i").forEach((i) => add(i, [{ transform: "rotate(0deg)" }, { transform: "rotate(720deg)" }], { duration: 1400, easing: "ease-in-out" })); R.wob(n); sfx("tick"); },
    float: (n) => { add(n, [{ transform: "scale(1) rotateY(0deg)" }, { transform: "scale(1.5) rotateY(360deg)", offset: 0.5 }, { transform: "scale(1) rotateY(720deg)" }], { duration: 1000 }); sfx("pop"); }
  };
  // [selector, reactions…] — the smallest thing under the finger answers
  const SCENE = {
    rescue: [[".rq .fan", "spinz"], [".rq .bellw", "ring"], [".rq .siren", "flash"], [".rq .clk", "hands"], [".rq .win", "wob", "jump"], [".rq .desk", "jump", "wob"], [".rq .doorbg", "knock"], [".rq .ceil .lamp", "flash"]],
    talk: [[".tk .cannon", "fire"], [".tk .mic", "wob", "jump"], [".tk .mug", "jump", "spiny"], [".tk .onair", "flash"], [".tk .gsign", "ring"], [".tk .cur", "sway"], [".tk .aud .p", "jump"], [".tk .bug", "spiny"]],
    tpr: [],
    monster: [[".g4 .bgl", "spiny", "spinz", "jump"]],
    chant: [[".g5 .spk", "thump"], [".g5 .decks", "thump"], [".g5 .ballw", "spiny"], [".g5 .eq i", "jump"]],
    story: [[".g6>img.prop", "spiny", "jump", "wob"], [".g6 .idle-cast", "jump", "spiny"], [".g6 .g6-rib", "ring"]],
    quiz: [["[data-toy-tap]", "spiny", "jump", "wob"]],
    start: [["#scan .floaty img", "float"]]
  };
  function sceneTap(e) {
    if (!alive || e.button > 0) return;
    const tg = e.target; if (!tg || !tg.closest) return;
    const playing = document.body.classList.contains("playing"), x = e.clientX, y = e.clientY;
    if (playing ? !tg.closest("#stage") : !tg.closest("#scan")) return;
    if (tg.closest(HOT) || tg.closest(".g4 .cards .slot,.sc-ov,.overlay,.settings")) return;      // the game's own buttons and cards: nothing extra
    if (playing && curKey === "tpr") {
      const a = gymPt([HOOP.box[0], HOOP.box[1]]), b = gymPt([HOOP.box[2], HOOP.box[3]]);
      if (a && x >= a[0] && x <= b[0] && y >= a[1] && y <= b[1]) { const ball = toys.find((t) => t.dataset.toy === "bball" && t.dataset.when === "play" && !t.classList.contains("off")); if (ball && !ball._busy) { bump(); shoot(ball); } return; }
      const c = gymPt([PENNANT[0], PENNANT[1]]), d = gymPt([PENNANT[2], PENNANT[3]]), s = gymSVG(), pen = s && s.querySelector('g[transform^="translate(300 236)"]');
      if (c && pen && x >= c[0] && x <= d[0] && y >= c[1] && y <= d[1]) { const B = "translate(300px,236px) rotate(-4deg) ";
        anim(pen, [{ transform: B }, { transform: B + "rotate(9deg) scaleX(.9)" }, { transform: B + "rotate(-7deg) scaleX(1.04)" }, { transform: B + "rotate(5deg) scaleX(.95)" }, { transform: B + "rotate(-3deg)" }, { transform: B }], { duration: 1000, easing: "ease-in-out" });
        sfx("whoosh"); bump(); burst(x, y, { n: 6, kind: "star", cols: ["#ffe066", "#fff"] }); }
      return;
    }
    const list = SCENE[playing ? curKey : "start"] || SCENE.quiz; let best = null, bestA = Infinity, how = null;
    for (const [sel, ...ways] of list) document.querySelectorAll(sel).forEach((n) => { const r = shown(n); if (!r || x < r.left || x > r.right || y < r.top || y > r.bottom) return; const A = r.width * r.height; if (A < bestA) { best = n; bestA = A; how = ways; } });
    if (!best || best._toyAt > Date.now() - 350) return;
    best._toyAt = Date.now(); try { TC.ac && TC.ac(); } catch (er) {}
    R[pick(how)](best); bump(); if (!/fire|thump/.test(how[0])) burst(x, y, { n: 6 });
  }

  /* ---------- mount ---------- */
  function mount(key, host) {
    addCSS(); unmount(true);
    curKey = SETS[key] ? key : "quiz";
    layer = el("div"); layer.id = "toyLayer"; (host || document.body).append(layer);
    const build = (set, when) => (set.wide || []).forEach((s, i) => { const t = make(s[0], when); t._slot = { wide: s, tall: (set.tall || [])[i] }; layer.append(t); toys.push(t); });
    build(SETS[curKey], "play"); build(SETS.start, "start");
    place(); alive = true;
    if (window.MutationObserver) { mo = new MutationObserver(tidySoon); const st = document.querySelector("#stage"), tk = document.querySelector("#talk");
      if (st) mo.observe(st, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] }); if (tk) mo.observe(tk, { attributes: true, attributeFilter: ["class"] });
      mo.observe(document.body, { attributes: true, attributeFilter: ["class"] }); }
    tidy(); setTimeout(tidy, 700); setTimeout(tidy, 1800);
    return layer;
  }
  function unmount(keep) { if (mo) { mo.disconnect(); mo = null; } if (layer) layer.remove(); layer = null; toys = []; if (scoreEl) { scoreEl.remove(); scoreEl = null; } if (!keep) alive = false; }
  addEventListener("resize", () => { if (!layer) return; place(); tidySoon(); });
  setInterval(() => { if (layer && !document.hidden && Date.now() - lastTidy > 1400) tidy(); }, 1500);
  document.addEventListener("pointerdown", sceneTap, true);

  TC.Toys = { mount, unmount, tidy, count: 0, get baskets() { return T.baskets; }, get key() { return curKey; } };

  /* start by itself as soon as the gate screen (station.js) is up — whether this file was loaded before or after it */
  function boot() {
    let n = 0; const iv = setInterval(() => {
      if (layer) return clearInterval(iv);
      if (TC.api && TC.api.G && document.querySelector("#stage")) { clearInterval(iv); mount(TC.api.G.key); }
      else if (++n > 80) clearInterval(iv);
    }, 250);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
