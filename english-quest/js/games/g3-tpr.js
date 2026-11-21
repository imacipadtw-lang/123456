/* Gate 3 · Ollie Says (歐力說) — TPR actions.
   The child DOES the action together with a huge glossy 3D Ollie-bot (no speaking, nobody can fail):
   wash · clean · brush · mask · close the door · hurry · walk · break.  Every action is a 6 second, 3 × 4-beat loop
   with a pulsing beat ring.  Level 2 adds "Ollie didn't say!" freeze rounds.  FINALE: quiet time (dim room, moon, lullaby,
   everybody freezes with closed eyes) → ONE flash, a loud alarm and "Wake up, everyone!".
   Everything is drawn in code (SVG, animated by one requestAnimationFrame loop); no images, fonts or network. */
(function () {
  "use strict";
  const TC = (window.TC = window.TC || {});
  TC.games = TC.games || {};
  const h = TC.h;
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const seg = (u, a, b) => clamp((u - a) / (b - a));
  const easeIO = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
  const backOut = (k) => 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2);
  const f1 = (n) => Math.round(n * 10) / 10;
  const esc = (s) => TC.esc ? TC.esc(s) : String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- colour helpers ---------- */
  const hex = (c) => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const rgb = (r, g, b) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const lite = (c, f) => { const [a, b, d] = hex(c); return rgb(a + (255 - a) * f, b + (255 - b) * f, d + (255 - d) * f); };
  const dim = (c, f) => { const [a, b, d] = hex(c); return rgb(a * (1 - f), b * (1 - f), d * (1 - f)); };
  /** glossy radial gradient (light top-left, dark bottom-right) */
  const rg = (id, col, cx = 35, cy = 28, r = 80) => `<radialGradient id="${id}" cx="${cx}%" cy="${cy}%" r="${r}%"><stop offset="0" stop-color="${lite(col, 0.55)}"/><stop offset=".45" stop-color="${col}"/><stop offset="1" stop-color="${dim(col, 0.42)}"/></radialGradient>`;
  const lg = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const STAR4 = "M0 -1 L.26 -.26 L1 0 L.26 .26 L0 1 L-.26 .26 L-1 0 L-.26 -.26Z";
  const burstPts = (n, r1, r2) => { let s = ""; for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * TAU, r = i % 2 ? r2 : r1; s += `${f1(Math.cos(a) * r)},${f1(Math.sin(a) * r)} `; } return s; };

  /* ---------- registered pictures (start screen + props) ---------- */
  function regArt() {
    if (!TC.ART || !TC.ArtCtx || TC.ART["tpr-brush"]) return;
    const A = TC.ART, S = TC.SEAL || {};
    // toothbrush: a chunky children's handle — the school's mark is printed on the grip pad
    A["tpr-brush"] = () => { const c = TC.ArtCtx(); let s = c.shadow(150, 86, 120, 5);
      s += c.path("M100 40 L150 38 Q176 25 206 27 Q232 29 250 37 Q282 38 294 45 Q297 47 294 50 Q282 55 250 55 Q232 64 206 65 Q176 66 150 53 L100 52Z", "#35c8ff");
      s += c.ell(60, 52, 50, 15, "#2a8fe0", 0, 0.4);
      for (let i = 0; i < 9; i++) s += `<rect x="${22 + i * 10}" y="12" width="8" height="40" rx="4" fill="${i % 2 ? "#ffffff" : "#ff9ac2"}"/><rect x="${22 + i * 10}" y="12" width="3" height="40" rx="1.5" fill="#fff" opacity=".6"/>`;
      s += c.ell(60, 12, 42, 11, "#ffffff", 0, 0.5) + `<path d="M26 13 Q60 4 94 13" stroke="#4cc9ff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M30 17 Q60 9 90 17" stroke="#ff5fa2" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      s += c.hl(170, 33, 26, 4, -6, 0.8) + `<path d="M262 41 V51 M270 42 V51 M278 43 V50" stroke="#1f8fc4" stroke-width="3" stroke-linecap="round"/>`;
      return c.out(s, "0 0 300 90"); };
    S["tpr-brush"] = [203, 46, 10.5, -2, "print"];
    // mask: the mark is the small print in its lower corner
    A["tpr-mask"] = () => { const c = TC.ArtCtx(); let s = "";
      s += `<ellipse cx="24" cy="62" rx="20" ry="26" fill="none" stroke="#ffffff" stroke-width="6"/><ellipse cx="236" cy="62" rx="20" ry="26" fill="none" stroke="#ffffff" stroke-width="6"/>`;
      s += c.path("M50 30 Q130 14 210 30 Q226 60 210 92 Q130 108 50 92 Q34 60 50 30Z", "#7fd0ff", `stroke="#fff" stroke-width="4"`);
      s += `<path d="M58 48 Q130 38 202 48" stroke="#4aa6e8" stroke-width="3.5" fill="none"/><path d="M54 64 Q130 56 206 64" stroke="#4aa6e8" stroke-width="3.5" fill="none"/><path d="M58 80 Q130 74 202 80" stroke="#4aa6e8" stroke-width="3.5" fill="none"/>`;
      s += c.hl(96, 40, 40, 10, -8, 0.7);
      return c.out(s, "0 0 260 120"); };
    S["tpr-mask"] = [178, 78, 11, -5, "print"];
    // juice box: a white label on the front carries the mark, the orange is printed below it
    A["tpr-juice"] = () => { const c = TC.ArtCtx(); let s = c.shadow(60, 184, 46, 6);
      s += c.path("M94 64 L112 54 L112 160 L94 172Z", "#d9700a");
      s += c.path("M24 64 L94 64 L112 54 L44 54Z", "#ffd98a");
      s += c.path("M24 64 H94 V172 Q94 176 88 176 H30 Q24 176 24 170Z", "#ffa52e");
      s += `<path d="M58 62 L58 22 Q58 8 40 8 L16 8" stroke="#e0272b" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M58 52 L58 36 M58 24 Q56 12 44 10 M32 8 L24 8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="6 6"/>`;
      s += `<rect x="31" y="70" width="56" height="44" rx="10" fill="#fff"/><rect x="31" y="70" width="56" height="44" rx="10" fill="none" stroke="#e58a12" stroke-width="2" opacity=".55"/>`;
      s += c.sphere(59, 146, 21, "#ff8a00") + `<path d="M59 146 L59 126 M59 146 L78 153 M59 146 L43 159 M59 146 L40 139" stroke="#ffd18a" stroke-width="3"/>` + `<path d="M62 124 Q75 115 85 122 Q73 131 62 124Z" fill="#46c35a"/>`;
      s += c.hl(38, 140, 6, 26, 0, 0.45);
      return c.out(s, "0 0 120 190"); };
    S["tpr-juice"] = [59, 92, 12, 0, "print"];
    // cleaning cloth: an embroidered patch in the corner
    A["tpr-cloth"] = () => { const c = TC.ArtCtx(); let s = c.shadow(75, 88, 58, 5);
      s += c.path("M14 26 Q40 12 76 20 Q112 12 138 28 Q146 52 136 76 Q116 86 98 76 Q80 88 56 78 Q32 86 14 74 Q6 50 14 26Z", "#2ee6b6");
      s += `<path d="M26 40 Q76 28 128 42" stroke="#12b48c" stroke-width="5" fill="none"/><path d="M24 58 Q76 46 130 60" stroke="#12b48c" stroke-width="5" fill="none"/>`;
      s += c.hl(52, 34, 30, 9, -10, 0.7);
      return c.out(s, "0 0 150 100"); };
    S["tpr-cloth"] = [116, 57, 10.5, 8, "patch"];
    // hand soap: a pump bottle whose label is the school's mark
    A["tpr-soap"] = () => { const c = TC.ArtCtx(); let s = c.shadow(80, 190, 54, 7);
      s += c.path("M58 14 Q40 14 34 30 L34 38 L45 38 Q47 27 58 27Z", "#f4f8ff");
      s += `<rect x="74" y="28" width="12" height="30" fill="${c.v("#e6ecf7", "#a9b6cf")}"/><rect x="56" y="11" width="50" height="19" rx="8" fill="${c.g("#f4f8ff")}"/><rect x="56" y="54" width="48" height="22" rx="8" fill="${c.g("#f4f8ff")}"/>`;
      s += c.path("M40 98 Q40 74 62 72 L98 72 Q120 74 120 98 L120 172 Q120 188 104 188 L56 188 Q40 188 40 172Z", "#ff8fc0");
      s += `<rect x="50" y="104" width="60" height="62" rx="13" fill="#fff"/>` + c.hl(50, 90, 7, 13, 0, 0.7) + c.hl(114, 150, 4, 30, 0, 0.35);
      [[134, 44, 13], [148, 80, 8], [20, 66, 10]].forEach(([x, y, r]) => { s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#bfeaff" fill-opacity=".45" stroke="#fff" stroke-width="3"/><ellipse cx="${x - r * 0.35}" cy="${y - r * 0.4}" rx="${r * 0.28}" ry="${r * 0.14}" fill="#fff" transform="rotate(-35 ${x - r * 0.35} ${y - r * 0.4})"/>`; });
      return c.out(s, "0 0 160 200"); };
    S["tpr-soap"] = [80, 135, 14, 0, "print"];
  }
  regArt();

  /* ---------- CSS ---------- */
  const css = `
  .tpr{position:absolute;inset:0;overflow:hidden;font-family:var(--font);touch-action:manipulation}
  .tpr .bg{position:absolute;inset:0;width:100%;height:100%;display:block}
  .tpr .dim{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity 1.4s;background:radial-gradient(90% 80% at 50% 45%,rgba(18,26,86,.78),rgba(3,6,28,.94))}
  .tpr.night .dim{opacity:1}
  .tpr .scene{position:absolute;left:0;top:9.2rem;z-index:3;width:100%;height:calc(100% - 9.2rem - 21.5vh);display:block;overflow:visible;transition:filter 1.2s,height .35s}
  /* 中／高年級 give the orders with the teacher bar on screen: the scene shrinks so Ollie stands clear above the bar */
  body:has(#talk.show) .tpr .scene{height:calc(100% - 9.2rem - 34vh)}
  .tpr.night .scene{filter:brightness(.78) saturate(.8) hue-rotate(-10deg)}
  .tpr.sizzle .scene,.tpr.sizzle .dim{transition:none}
  .tpr .rays2{position:absolute;left:50%;top:42%;width:150vmin;height:150vmin;margin:-75vmin 0 0 -75vmin;z-index:2;border-radius:50%;pointer-events:none;opacity:0;transition:opacity .6s;
    background:repeating-conic-gradient(from 0deg,rgba(255,236,150,.8) 0 9deg,rgba(255,255,255,.1) 9deg 18deg);-webkit-mask:radial-gradient(circle,#000 0,#000 30%,transparent 70%);mask:radial-gradient(circle,#000 0,#000 30%,transparent 70%);
    animation:tprSpin 10s linear infinite;animation-play-state:paused}
  .tpr.wakeup .rays2{opacity:1;transition:opacity .2s;animation-play-state:running}
  @keyframes tprSpin{to{transform:rotate(360deg)}}
  .tpr .sky{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;transition:opacity 1.6s}
  .tpr.night .sky{opacity:1}
  .tpr .sky svg{width:100%;height:100%;display:block}
  .tpr .star{transform-box:fill-box;transform-origin:50% 50%;animation:tprTw 2.4s ease-in-out infinite}
  .tpr .moon{transform-box:fill-box;transform-origin:50% 50%;animation:tprMoon 6s ease-in-out infinite}
  @keyframes tprTw{50%{opacity:.25;transform:scale(.55)}}
  @keyframes tprMoon{50%{transform:translateY(-1.2%) rotate(2deg)}}
  .tpr .pop{transform-box:fill-box;transform-origin:50% 50%;animation:tprPop 1.1s cubic-bezier(.2,1.5,.4,1) forwards}
  @keyframes tprPop{0%{transform:scale(.2) rotate(-14deg);opacity:0}25%{transform:scale(1.15) rotate(4deg);opacity:1}70%{transform:scale(1) rotate(0);opacity:1}100%{transform:scale(1.05) translateY(-12px);opacity:0}}

  .tpr .ban{position:absolute;left:50%;bottom:1.3vh;transform:translateX(-50%) scale(.6);opacity:0;z-index:7;min-width:50vw;max-width:88vw;text-align:center;padding:.45rem 3.2rem .6rem;border-radius:2.4rem;
    background:linear-gradient(180deg,#27409a 0%,#0f1d52 100%);color:#fff;border:.45rem solid var(--gate);box-shadow:0 .6rem 0 rgba(0,0,0,.35),0 1.6rem 3rem rgba(0,0,0,.4),inset 0 .35rem 0 rgba(255,255,255,.18);white-space:nowrap}
  .tpr .ban.show{opacity:1;transform:translateX(-50%) scale(1);transition:transform .5s cubic-bezier(.2,1.5,.4,1),opacity .25s}
  .tpr .ban .chips{display:flex;justify-content:space-between;align-items:center;gap:1.4rem;font-size:1.7rem;font-weight:700;line-height:1;margin-bottom:.15rem}
  .tpr .ban .chip{padding:.35rem 1.1rem;border-radius:2rem;background:linear-gradient(180deg,#ffe58a,#ffc83d);color:#3a2300;box-shadow:0 .2rem 0 #b5850c}
  .tpr .ban .chip.no{background:linear-gradient(180deg,#ff7a7a,#e0292d);color:#fff;box-shadow:0 .2rem 0 #8a1014;animation:tprWob .5s ease-in-out infinite alternate}
  .tpr .ban .chip.ref{background:rgba(255,255,255,.16);color:#d6e2ff;box-shadow:none}
  .tpr .ban .en{font-size:4.6rem;font-weight:700;line-height:1.08;text-shadow:0 .3rem 0 rgba(0,0,0,.3)}
  .tpr .ban .en.two{font-size:4.1rem}
  .tpr .ban .en .sm{display:block;font-size:2.6rem;color:#cfe0ff;line-height:1.1}
  .tpr .ban .en b.k{background:linear-gradient(180deg,#ffe58a,#ffc83d);color:#3a2300;border-radius:1rem;padding:0 .7rem;margin:0 .1rem;text-shadow:none;box-shadow:0 .25rem 0 #b5850c;display:inline-block;transform:rotate(-2deg)}
  .tpr .ban>.zh{font-size:2.4rem;color:#9fe9ff;font-family:"Microsoft JhengHei","PingFang TC","Noto Sans TC",var(--font);font-weight:600}
  .tpr .ban.muted .en{color:#b8c3ea}
  @keyframes tprWob{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}

  .tpr .ring{position:absolute;left:1.6rem;top:20.4rem;width:15.6rem;z-index:6;text-align:center;padding:2.1rem .6rem .9rem;border-radius:2.4rem;background:linear-gradient(180deg,#27409a 0%,#0f1d52 100%);border:.45rem solid var(--gate);
    box-shadow:0 .6rem 0 rgba(0,0,0,.35),0 1.6rem 3rem rgba(0,0,0,.4),inset 0 .35rem 0 rgba(255,255,255,.18);opacity:0;transform:scale(.6);transform-origin:50% 30%;transition:transform .4s cubic-bezier(.2,1.5,.4,1),opacity .25s;pointer-events:none}
  .tpr .ring.show{opacity:1;transform:scale(1)}
  .tpr .ring .rchip{position:absolute;left:50%;top:0;transform:translate(-50%,-58%);white-space:nowrap;font-size:1.45rem;font-weight:700;line-height:1;padding:.45rem 1rem .5rem;border-radius:2rem;background:linear-gradient(180deg,#ffe58a,#ffc83d);color:#3a2300;box-shadow:0 .2rem 0 #b5850c}
  .tpr .ring.stop .rchip{background:linear-gradient(180deg,#ff7a7a,#e0292d);color:#fff;box-shadow:0 .2rem 0 #8a1014}
  .tpr .ring svg{width:10.6rem;display:block;margin:0 auto}
  .tpr .ring .tr{fill:rgba(6,12,44,.55);stroke:rgba(255,255,255,.22);stroke-width:14}
  .tpr .ring .pr{fill:none;stroke:var(--gate);stroke-width:14;stroke-linecap:round;stroke-dasharray:540.35;stroke-dashoffset:540.35}
  .tpr .ring .pl{fill:#ffc83d;transform-origin:100px 100px}
  .tpr .ring .num{font:700 78px var(--font);fill:#fff;paint-order:stroke;stroke:#0a1633;stroke-width:8px}
  .tpr .ring .dots{display:flex;justify-content:center;gap:.7rem;margin-top:.4rem}
  .tpr .ring .dots i{width:1.7rem;height:1.7rem;border-radius:50%;background:rgba(6,12,44,.6);border:.22rem solid #fff;transition:background .2s,transform .2s}
  .tpr .ring .dots i.on{background:#ffc83d;transform:scale(1.15)}
  .tpr .ring .lbl{margin-top:.45rem;font-size:2.1rem;font-weight:700;line-height:1.15;color:#9fe9ff}
  .tpr .ring.stop .pl{fill:#e0292d}
  .tpr .ring.big{border-color:#9ec5ff}
  .tpr .ring.big svg{width:12.4rem}
  .tpr .ring.big .pr{stroke:#9ec5ff}
  .tpr .ring.big .pl{fill:#3b57c4}
  .tpr .ring.big .num{font-size:96px}

  .tpr .nosay{position:absolute;right:5vw;top:11.5rem;z-index:6;padding:1rem 2.2rem 1.2rem;text-align:center;border-radius:2.4rem;color:#fff;background:linear-gradient(180deg,#ff6a6a,#cf1f27);border:.5rem solid #fff;
    box-shadow:0 .6rem 0 #7e0c12,0 1.4rem 2.4rem rgba(0,0,0,.4);transform-origin:50% 0;animation:tprSwing 1s ease-in-out infinite alternate;opacity:0;transition:opacity .3s}
  .tpr .nosay.show{opacity:1}
  .tpr .nosay b{display:block;font-size:3.6rem;line-height:1.05;text-shadow:0 .25rem 0 rgba(0,0,0,.3)}
  .tpr .nosay span{display:block;font-size:2.3rem;font-weight:700;margin-top:.2rem}
  @keyframes tprSwing{from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}

  .tpr .title{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);z-index:8;text-align:center;width:max-content;max-width:98vw;pointer-events:none;animation:tprTitle 2.4s cubic-bezier(.2,1.4,.4,1) forwards}
  .tpr .title .t1{font-size:10rem;font-weight:700;line-height:1;color:#fff;-webkit-text-stroke:.6rem #0a1633;paint-order:stroke fill;text-shadow:0 .8rem 0 #0a1633,0 1.6rem 3rem rgba(0,0,0,.45);background:none}
  .tpr .title .t1 span{color:#ffc83d}
  .tpr .title .t2{font-size:4.6rem;font-weight:700;color:#fff;margin-top:.5rem;text-shadow:0 .3rem 0 #0a1633,0 0 2rem #0a1633;font-family:"Microsoft JhengHei","PingFang TC","Noto Sans TC",var(--font)}
  .tpr .title .t3{display:table;margin:1.2rem auto 0;white-space:nowrap;padding:.6rem 2.4rem;border-radius:3rem;background:linear-gradient(180deg,#2a8fe0,#14529a);border:.35rem solid #fff;font-size:2.9rem;font-weight:700;color:#fff;box-shadow:0 .4rem 0 rgba(0,0,0,.35)}
  .tpr .title .t4{display:table;margin:1rem auto 0;white-space:nowrap;padding:.5rem 2rem;border-radius:3rem;background:linear-gradient(180deg,#ff6a6a,#cf1f27);border:.3rem solid #fff;font-size:2.4rem;font-weight:700;color:#fff}
  @keyframes tprTitle{0%{transform:translate(-50%,-50%) scale(.2) rotate(-8deg);opacity:0}22%{transform:translate(-50%,-50%) scale(1.06);opacity:1}80%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(1.1);opacity:0}}

  .tpr .next{position:absolute;right:1.6rem;bottom:1.6vh;z-index:8;border-radius:2rem;padding:.8rem 1.6rem;font-size:1.8rem;font-weight:700;background:rgba(10,22,51,.7);color:#d6e2ff;border:.2rem solid rgba(255,255,255,.3);opacity:0;pointer-events:none;transition:opacity .3s}
  .tpr.playing .next{opacity:.85;pointer-events:auto}
  .tpr.night .next{opacity:0;pointer-events:none}
  .tpr-flash{position:fixed;inset:0;z-index:70;background:#fff;pointer-events:none;animation:tprFlash .9s ease-out forwards}
  @keyframes tprFlash{0%{opacity:1}30%{opacity:1}100%{opacity:0}}
  `;

  /* ---------- the gym (static background) ---------- */
  function bgSVG() {
    const def = [lg("tbWall", "#52c4ff", "#fff0c8"), lg("tbFloor", "#ffd770", "#ef9a33"), lg("tbMat", "#ffffff", "#c9d6ff"),
      rg("tbPf", "#ff5fa2"), rg("tbBall", "#ffffff"), rg("tbBall2", "#ff7a3d"), rg("tbBeach", "#4cc9ff"), rg("tbCone", "#ff8a1f"), lg("tbPen", "#3552c8", "#16286e"),
      `<radialGradient id="tbSpot" cx="50%" cy="58%" r="55%"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
      lg("tbWood", "#e6b66e", "#b9803a")].join("");
    let s = `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${def}</defs>`;
    s += `<rect width="1600" height="900" fill="url(#tbWall)"/>`;
    // sunburst rays behind Ollie
    for (let i = 0; i < 18; i++) { const a0 = (i / 18) * TAU, a1 = a0 + TAU / 36; s += `<path d="M800 470 L${f1(800 + Math.cos(a0) * 1700)} ${f1(470 + Math.sin(a0) * 1700)} L${f1(800 + Math.cos(a1) * 1700)} ${f1(470 + Math.sin(a1) * 1700)}Z" fill="#fff" opacity=".13"/>`; }
    s += `<rect width="1600" height="900" fill="url(#tbSpot)"/>`;
    // windows with light
    for (let i = 0; i < 6; i++) { const x = 80 + i * 270; s += `<rect x="${x}" y="74" width="170" height="140" rx="14" fill="#8fdcff" stroke="#fff" stroke-width="9"/><path d="M${x + 85} 74 V214 M${x} 144 H${x + 170}" stroke="#fff" stroke-width="6"/><path d="M${x + 14} 90 L${x + 60} 90 L${x + 20} 200Z" fill="#fff" opacity=".5"/>`; }
    // wall padding: colourful gym mats
    const mc = ["#ff5fa2", "#ffc83d", "#4cc9ff", "#9b6bff", "#2ee6b6", "#ff8a3d"];
    for (let i = 0; i < 16; i++) s += `<rect x="${i * 100}" y="440" width="100" height="104" rx="10" fill="${mc[i % 6]}" stroke="#fff" stroke-width="4" opacity=".95"/><rect x="${i * 100 + 10}" y="448" width="80" height="14" rx="7" fill="#fff" opacity=".35"/>`;
    // the school's felt pennant on the wall and the hoop: the gym carries the mark twice, as a stitched patch and as the backboard's centre logo
    s += `<g transform="translate(300 236) rotate(-4)"><path d="M7 9 L257 59 L7 113Z" fill="#000" opacity=".14"/><path d="M0 0 L250 52 L0 104Z" fill="url(#tbPen)" stroke="#ffd23d" stroke-width="5" stroke-linejoin="round"/><path d="M0 0 V104" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`
      + [126, 156, 182].map((x, i) => `<path transform="translate(${x} 52) scale(${10 - i * 2.5})" d="${STAR4}" fill="#ffe58a"/>`).join("") + TC.seal(58, 52, 24, 0, "patch")
      + `<circle cx="0" cy="6" r="6" fill="#ffd23d" stroke="#b9820f" stroke-width="2"/><circle cx="0" cy="98" r="6" fill="#ffd23d" stroke="#b9820f" stroke-width="2"/></g>`;
    s += `<rect x="1326" y="180" width="190" height="130" rx="10" fill="#fff" stroke="#4a5a99" stroke-width="7"/><rect x="1373" y="218" width="96" height="76" rx="4" fill="none" stroke="#e0272b" stroke-width="6"/>` + TC.seal(1421, 256, 21, 0, "print")
      + `<ellipse cx="1421" cy="318" rx="50" ry="12" fill="none" stroke="#ff7a1a" stroke-width="9"/><path d="M1374 320 L1395 374 M1397 322 L1410 376 M1421 324 L1421 378 M1445 322 L1432 376 M1468 320 L1447 374" stroke="#fff" stroke-width="4" opacity=".9"/>`;
    // bunting
    const cols = ["#ff5fa2", "#ffc83d", "#4cc9ff", "#9b6bff", "#2ee6b6", "#ff8a3d"];
    s += `<path d="M-20 26 Q800 150 1620 26" stroke="#fff" stroke-width="4" fill="none"/>`;
    for (let i = 0; i < 26; i++) { const t = (i + 0.5) / 26, x = (1 - t) * (1 - t) * -20 + 2 * (1 - t) * t * 800 + t * t * 1620, y = (1 - t) * (1 - t) * 26 + 2 * (1 - t) * t * 150 + t * t * 26; s += `<path d="M${f1(x - 26)} ${f1(y)} L${f1(x + 26)} ${f1(y)} L${f1(x)} ${f1(y + 58)}Z" fill="${cols[i % 6]}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`; }
    // floor + perspective grid
    s += `<rect y="540" width="1600" height="360" fill="url(#tbFloor)"/><rect y="536" width="1600" height="12" fill="#b9803a"/>`;
    for (let x = -1600; x <= 3200; x += 200) s += `<path d="M${f1(800 + (x - 800) * 0.1)} 548 L${x} 900" stroke="#fff" stroke-width="3" opacity=".38"/>`;
    for (let i = 1; i <= 9; i++) { const y = 548 + 352 * Math.pow(i / 9, 1.7); s += `<path d="M0 ${f1(y)} H1600" stroke="#fff" stroke-width="3" opacity=".3"/>`; }
    // Ollie's glossy podium
    s += `<ellipse cx="800" cy="772" rx="360" ry="70" fill="#8a1d57"/><rect x="440" y="728" width="720" height="44" fill="#a82468"/><ellipse cx="800" cy="728" rx="360" ry="70" fill="url(#tbPf)"/><ellipse cx="800" cy="728" rx="318" ry="56" fill="none" stroke="#fff" stroke-width="6" opacity=".75"/>`
      + `<ellipse cx="800" cy="700" rx="230" ry="26" fill="#fff" opacity=".13"/>`;
    for (let i = 0; i < 5; i++) { const x = 560 + i * 120; s += `<path transform="translate(${x} 788) scale(15)" d="${STAR4}" fill="#ffe58a" opacity=".9"/>`; }
    // toys on the floor
    s += `<ellipse cx="250" cy="778" rx="52" ry="11" fill="#000" opacity=".2"/><circle cx="250" cy="736" r="44" fill="url(#tbBall)"/><path d="M250 714 l18 13 -7 21 h-22 l-7 -21z" fill="#2a2f5a"/>`;
    s += `<ellipse cx="1370" cy="808" rx="60" ry="12" fill="#000" opacity=".2"/><path d="M1330 806 L1370 706 L1410 806Z" fill="url(#tbCone)"/><path d="M1344 770 H1396 M1352 748 H1388" stroke="#fff" stroke-width="9"/>`;
    s += `<ellipse cx="1500" cy="788" rx="56" ry="11" fill="#000" opacity=".2"/><circle cx="1500" cy="742" r="50" fill="url(#tbBeach)"/><path d="M1500 692 Q1530 742 1500 792 M1500 692 Q1470 742 1500 792" stroke="#fff" stroke-width="9" fill="none"/>`;
    s += `<ellipse cx="150" cy="836" rx="50" ry="10" fill="#000" opacity=".2"/><circle cx="150" cy="800" r="38" fill="url(#tbBall2)"/><path d="M112 800 H188 M150 762 V838" stroke="#7a3410" stroke-width="3"/>`;
    return s + `</svg>`;
  }

  /* ---------- Ollie: the school's own 3D model (js/ollie3d.js), turning through 360° on his stand ---------- */
  const sceneHTML = () => `<div class="scene o3host"></div>`;

  /* ---------- state ---------- */
  let root = null, host = null, ring = null, ban = null, nosay = null, nextBtn = null, sky = null, apiRef = null;
  let raf = 0, T0 = 0, mode = "idle", lastBeat = -1;
  let talking = false, active = false, cdStart = 0, cdBig = false;
  const temp = [];
  let bangAt = 0;
  let audio = null;


  /* ---------- Ollie's moves (TC.O3) + the beat ring ---------- */
  let o3 = null, turned2 = false, ACTION_IDS = [];
  const MODE3 = { idle: "idle", ready: "idle", title: "wave", cheer: "cheer", freeze: "freeze", laugh: "cheer", sleep: "sleep", wake: "wake" };
  function setMode(name) {
    mode = name; T0 = performance.now(); lastBeat = -1; bangAt = 0; turned2 = false;
    const isAct = ACTION_IDS.includes(name);
    // every action begins with a full 360° turn, so the children see it from all sides
    if (o3) o3.play(MODE3[name] || name, { restart: true, turn: isAct || name === "title" || name === "wake" ? 1.5 : 0 });
    if (host) host.style.transform = "";
  }
  function pulseRing(strong) { const pl = ring.querySelector(".pl"); if (pl) { pl.style.transition = "none"; pl.style.transform = `scale(${strong ? 1.5 : 1.25})`; requestAnimationFrame(() => { pl.style.transition = "transform .35s ease-out"; pl.style.transform = "scale(1)"; }); } }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!root || !root.isConnected) return;
    const t = (now - T0) / 1000, isAct = ACTION_IDS.includes(mode);
    // screen shake after the wake-up bang
    if (bangAt && host) { const a = (now - bangAt) / 1000; host.style.transform = a < 0.35 ? `translate(${f1(Math.sin(a * 90) * 9 * (1 - a / 0.35))}px,${f1(Math.cos(a * 70) * 6 * (1 - a / 0.35))}px)` : ""; if (a > 0.4) bangAt = 0; }
    if (isAct && active) {
      if (!turned2 && t > 3.3 && o3) { turned2 = true; o3.turn(1.7); } // a second turn half-way through
      const bi = Math.floor(t / 0.5);
      if (bi !== lastBeat && bi < 12) { lastBeat = bi; TC.sfx(bi % 4 === 0 ? "kick" : "tick"); pulseRing(bi % 4 === 0); }
      const num = ring.querySelector(".num"); if (num) num.textContent = String((bi % 4) + 1 > 4 ? 4 : (bi % 4) + 1);
      ring.querySelector(".pr").style.strokeDashoffset = (540.35 * (1 - clamp(t / 6))).toFixed(1);
      ring.querySelectorAll(".dots i").forEach((d, i) => d.classList.toggle("on", Math.floor(Math.min(t, 5.99) / 2) >= i));
    } else if (mode === "freeze" && active) {
      ring.querySelector(".pr").style.strokeDashoffset = (540.35 * (1 - clamp(t / 4.2))).toFixed(1);
    } else if (cdBig && cdStart) {
      const el = (now - cdStart) / 1000, left = Math.max(1, Math.ceil(6 - el));
      ring.querySelector(".num").textContent = el < 6.2 ? String(left) : "";
      ring.querySelector(".pr").style.strokeDashoffset = (540.35 * clamp(el / 6)).toFixed(1);
    }
  }

  function ensureLoop() { if (!raf) raf = requestAnimationFrame(frame); }

  /* ---------- audio: lullaby + alarm (own WebAudio nodes, silenced by cleanup) ---------- */
  function stopAudio() { if (audio) { try { audio.disconnect(); } catch (e) {} audio = null; } }
  function lullaby() {
    const c = TC.ac && TC.ac(); if (!c) return; stopAudio();
    const g = c.createGain(); g.gain.value = 1; g.connect(c.destination); audio = g;
    const vol = 0.07 * (TC.cfg.volume || 0.9), t0 = c.currentTime + 0.1;
    const N = [659, 784, 659, 523, 587, 659, 587, 440, 523, 587, 659, 587, 523, 440, 392, 523];
    N.forEach((f, i) => {
      const t = t0 + i * 0.5, dur = 1.4;
      [[f, 1], [f * 2.01, 0.22], [f * 3, 0.06]].forEach(([ff, a]) => { const o = c.createOscillator(), ge = c.createGain(); o.type = "sine"; o.frequency.value = ff; ge.gain.setValueAtTime(0.0001, t); ge.gain.exponentialRampToValueAtTime(vol * a, t + 0.02); ge.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(ge).connect(g); o.start(t); o.stop(t + dur + 0.05); });
    });
    // soft pad underneath
    [262, 330].forEach((f) => { const o = c.createOscillator(), ge = c.createGain(); o.type = "sine"; o.frequency.value = f; ge.gain.setValueAtTime(0.0001, t0); ge.gain.linearRampToValueAtTime(vol * 0.35, t0 + 1.5); ge.gain.linearRampToValueAtTime(0.0001, t0 + 7.6); o.connect(ge).connect(g); o.start(t0); o.stop(t0 + 7.7); });
  }
  function alarm() {
    const c = TC.ac && TC.ac(); if (!c) return; stopAudio();
    const g = c.createGain(); g.gain.value = 1; g.connect(c.destination); audio = g;
    const v = 0.42 * (TC.cfg.volume || 0.9), t0 = c.currentTime + 0.01;
    for (let i = 0; i < 10; i++) {
      const t = t0 + i * 0.13, f = i % 2 ? 1180 : 880;
      [["square", f, v], ["triangle", f * 2, v * 0.5]].forEach(([ty, ff, a]) => { const o = c.createOscillator(), ge = c.createGain(); o.type = ty; o.frequency.value = ff; ge.gain.setValueAtTime(a, t); ge.gain.setValueAtTime(a, t + 0.09); ge.gain.exponentialRampToValueAtTime(0.0001, t + 0.125); o.connect(ge).connect(g); o.start(t); o.stop(t + 0.13); });
    }
    const o = c.createOscillator(), ge = c.createGain(); o.type = "sine"; o.frequency.setValueAtTime(140, t0); o.frequency.exponentialRampToValueAtTime(40, t0 + 0.5); ge.gain.setValueAtTime(v * 1.6, t0); ge.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55); o.connect(ge).connect(g); o.start(t0); o.stop(t0 + 0.6);
    const len = Math.floor(c.sampleRate * 0.4), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(), ng = c.createGain(); s.buffer = b; ng.gain.value = v * 0.9; s.connect(ng).connect(g); s.start(t0);
  }

  /* ---------- screen bits ---------- */
  function skyHTML() {
    let s = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs>${rg("tkMoon", "#fff3b0", 35, 30)}</defs>`;
    for (let i = 0; i < 46; i++) { const x = (i * 337) % 1500 + 40, y = 20 + ((i * 211) % 520), sz = 7 + (i % 5) * 4; s += `<g transform="translate(${x} ${y}) scale(${sz})"><path class="star" style="animation-delay:${((i * 0.37) % 2.4).toFixed(2)}s" d="${STAR4}" fill="${i % 3 ? "#fff" : "#ffe58a"}"/></g>`; }
    s += `<g class="moon"><circle cx="1330" cy="280" r="120" fill="#fff6c0" opacity=".18"/><circle cx="1330" cy="280" r="96" fill="url(#tkMoon)"/><circle cx="1366" cy="262" r="86" fill="#0f1a52" opacity=".0"/>`
      + `<circle cx="1296" cy="262" r="12" fill="#e8d98a" opacity=".7"/><circle cx="1358" cy="320" r="16" fill="#e8d98a" opacity=".6"/><circle cx="1380" cy="244" r="8" fill="#e8d98a" opacity=".6"/>`
      + `<path d="M1300 286 Q1316 300 1332 286 M1340 286 Q1356 300 1372 286" stroke="#7a6a2a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M1318 306 Q1336 324 1354 306" stroke="#7a6a2a" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="1292" cy="302" rx="12" ry="7" fill="#ff9ac2" opacity=".5"/><ellipse cx="1376" cy="302" rx="12" ry="7" fill="#ff9ac2" opacity=".5"/></g></svg>`;
    return s;
  }
  function bannerHTML(x, kind) {
    const w = x.w ? new RegExp("\\b(" + String(x.w).replace(/[^a-z]/gi, "") + ")\\b", "i") : null;
    const hi = (txt) => { const e = esc(txt); return w ? e.replace(w, '<b class="k">$1</b>') : e; };
    let chip = `<span class="chip">Ollie says <span class="zh">歐力說</span></span>`;
    if (kind === "nosay") chip = `<span class="chip no">Ollie didn't say! <span class="zh">歐力沒有說！</span></span>`;
    if (kind === "quiet") chip = `<span class="chip">Shhh... <span class="zh">安靜</span></span>`;
    if (kind === "you") chip = `<span class="chip">You said! <span class="zh">你下的指令</span></span>`;
    if (kind === "wake") chip = `<span class="chip no">Ollie shouts! <span class="zh">歐力大喊</span></span>`;
    let en = hi(x.say), cls = "en";
    if (kind === "quiet") { const parts = x.say.split(/(?<=\.)\s+/); if (parts.length > 1) { en = `<span class="sm">${esc(parts[0])}</span>` + hi(parts.slice(1).join(" ")); cls = "en"; } }
    return `<div class="chips">${chip}</div><div class="${cls}">${en}</div><div class="zh">${esc(x.zh || "")}</div>`;
  }
  function showBanner(x, kind) {
    ban.classList.remove("show", "muted"); void ban.offsetWidth;
    ban.innerHTML = bannerHTML(x, kind); if (kind === "nosay") ban.classList.add("muted");
    requestAnimationFrame(() => ban.classList.add("show"));
  }
  const hideBanner = () => ban && ban.classList.remove("show");
  function setRing(kind, en, zh) {
    ring.classList.toggle("big", kind === "big"); ring.classList.toggle("stop", kind === "freeze");
    ring.querySelector(".rchip").textContent = en || ""; ring.querySelector(".lbl").innerHTML = zh || "";
    ring.querySelector(".dots").style.display = kind === "act" ? "" : "none";
    ring.querySelector(".pr").style.strokeDashoffset = kind === "big" ? "0" : "540.35";
    ring.querySelector(".num").textContent = kind === "act" ? "1" : kind === "freeze" ? "STOP" : "";
    ring.querySelector(".num").style.fontSize = kind === "freeze" ? "46px" : "";
    ring.classList.add("show");
  }
  const hideRing = () => ring && ring.classList.remove("show");

  /* ---------- flow helpers ---------- */
  /** wait for a promise but let Enter / ✓ / N skip ahead (Esc releases TC.pending too) */
  async function raceSkip(p) {
    const skip = TC.waitAction(120000);
    await Promise.race([Promise.resolve(p).catch(() => {}), skip]);
    if (TC.pending) { const q = TC.pending; TC.pending = null; q(); }
  }
  const skipNow = () => { if (TC.pending) { const q = TC.pending; TC.pending = null; q(); } };
  function onKey(e) { const k = e.key; if ((k === "n" || k === "N" || k === "ArrowRight") && !e.repeat) { try { skipNow(); } catch (err) {} } }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }

  async function titleCard(api) {
    const boss = api.level >= 2; // 115.11.21: 跟著做動作 is only for 低年級 — 中／高年級 give the orders and Ollie does them
    const el = h("div", { class: "title", html: boss
      ? `<div class="t1">You <span>Say</span></div><div class="t2">你是老師</div><div><span class="t3">Tell Ollie what to do!　用英文下指令，歐力照著做！</span></div>`
      : `<div class="t1">Ollie <span>Says</span></div><div class="t2">歐力說</div><div><span class="t3">Do what Ollie does!　跟著歐力一起做動作！</span></div>` });
    root.append(el); temp.push(el);
    setMode("title"); TC.sfx("fanfare");
    await TC.waitAction(2300);
    el.remove();
  }

  async function bossRound(api, x) {
    setMode("ready"); hideRing(); hideBanner();
    const r = await api.ask({ teacher: "Tell Ollie!", tzh: "用英文叫歐力做這個動作！", say: x.say, zh: x.zh, keys: x.keys || [[x.w]], word: x.w, hideKey: true });
    TC.hideTalk();
    if (api.aborted) return false;
    showBanner(x, "you"); setMode(x.id); TC.sfx("pop");
    TC.floatText("Ollie does it! 歐力照做！", 50, 22, "#ffd23d");
    await TC.waitAction(r && r.skipped ? 2600 : 3600);
    if (api.aborted) return false;
    setMode("cheer"); hideRing(); TC.countTurn(3); TC.confetti(90); TC.sfx("ding");
    await raceSkip(TC.praise());
    if (api.aborted) return false;
    hideBanner(); await TC.waitAction(350);
    return !api.aborted;
  }

  async function oneRound(api, x, twist) {
    if (api.level >= 2) return bossRound(api, x);
    setMode("ready"); showBanner(x, twist ? "nosay" : "says"); hideRing();
    if (twist) nosay.classList.add("show");
    talking = true; await raceSkip(TC.teacherLine(x.say)); talking = false;
    if (api.aborted) return false;
    if (twist) {
      setMode("freeze"); active = true; setRing("freeze", "Freeze!", "定住不要動");
      await TC.waitAction(4200); active = false;
      if (api.aborted) return false;
      nosay.classList.remove("show");
      setMode("laugh"); hideRing(); TC.sfx("fanfare"); TC.confetti(70);
      await TC.waitAction(1800);
      if (api.aborted) return false;
    } else {
      setMode(x.id); active = true; setRing("act", "Do it with Ollie!", "跟歐力一起做");
      await TC.waitAction(6000); active = false;
      if (api.aborted) return false;
    }
    setMode("cheer"); hideRing(); TC.countTurn(3); TC.confetti(90); TC.sfx("ding");
    await raceSkip(TC.praise());
    if (api.aborted) return false;
    hideBanner(); nosay.classList.remove("show");
    await TC.waitAction(450);
    return !api.aborted;
  }

  async function finale(api) {
    const Qt = api.G.quiet, Wk = api.G.wake;
    // quiet time: the room dims, moon and stars come out, soft lullaby, Ollie falls asleep
    hideBanner(); await TC.waitAction(250); if (api.aborted) return false;
    setMode("sleep"); root.classList.add("night"); lullaby();
    showBanner(Qt, "quiet");
    talking = false; await raceSkip(TC.teacherLine(Qt.say));
    if (api.aborted) return false;
    if (api.level >= 2) {
      // 中／高年級: nobody has to freeze — Ollie snores until the child shouts him awake
      await TC.waitAction(1200); if (api.aborted) return false;
      hideBanner();
      await api.ask({ teacher: "Ollie is sleeping! Wake him up!", tzh: "歐力睡著了！用英文把他叫醒！", say: Wk.say, zh: Wk.zh, keys: Wk.keys || [[Wk.w]], word: Wk.w, hideKey: true });
      TC.hideTalk();
    } else {
      setRing("big", "Eyes closed!", "閉上眼睛<br>不要動"); cdBig = true; cdStart = performance.now();
      await TC.waitAction(6000); cdBig = false; cdStart = 0;
    }
    if (api.aborted) return false;
    // BANG: ONE flash, a loud alarm, Ollie springs up
    stopAudio(); hideRing();
    const fl = h("div", { class: "tpr-flash" }); document.body.append(fl); temp.push(fl); fl.addEventListener("animationend", () => fl.remove());
    alarm(); root.classList.add("sizzle", "wakeup"); root.classList.remove("night"); void root.offsetWidth;
    setMode("wake"); bangAt = performance.now(); showBanner(Wk, "wake"); TC.confetti(260); TC.confetti(120, ["#ffd23d", "#fff", "#ff5fa2"]);
    if (api.level < 2) await raceSkip(TC.speak(Wk.say)); else await TC.waitAction(1600);
    root.classList.remove("sizzle");
    if (api.aborted) return false;
    TC.confetti(120); await TC.waitAction(1500);
    return !api.aborted;
  }

  function cleanup() {
    stopAudio(); cdBig = false; cdStart = 0; active = false; talking = false;
    temp.splice(0).forEach((n) => n.remove());
    document.removeEventListener("keydown", onKey, true);
    if (root) {
      root.classList.remove("night", "sizzle", "wakeup", "playing");
      if (ban) { ban.classList.remove("show", "muted"); } if (ring) { ring.classList.remove("show", "big", "stop"); } if (nosay) nosay.classList.remove("show");
      setMode("idle");
    }
  }

  /* ---------- registration ---------- */
  TC.games.tpr = {
    startArt: ["tpr-soap", "tpr-brush", "tpr-mask", "tpr-juice", "tpr-cloth", "star"],
    mount(api) {
      apiRef = api; regArt();
      api.stage.append(h("style", {}, css));
      root = h("div", { class: "tpr" });
      root.innerHTML = bgSVG() + `<div class="dim"></div><div class="rays2"></div>` + sceneHTML() + `<div class="sky">${skyHTML()}</div>`;
      ring = h("div", { class: "ring", html: `<div class="rchip"></div><svg viewBox="0 0 200 200"><circle class="tr" cx="100" cy="100" r="86"/><circle class="pl" cx="100" cy="100" r="58"/><circle class="pr" cx="100" cy="100" r="86" transform="rotate(-90 100 100)"/><text class="num" x="100" y="128" text-anchor="middle">1</text></svg><div class="dots"><i></i><i></i><i></i></div><div class="lbl zh"></div>` });
      ban = h("div", { class: "ban" });
      nosay = h("div", { class: "nosay", html: `<b>Ollie didn't say!</b><span class="zh">歐力沒有說！不要動！</span>` });
      nextBtn = h("button", { class: "next zh", onpointerdown: (e) => { e.stopPropagation(); skipNow(); } }, "⏭ 下一步");
      root.append(ring, ban, nosay, nextBtn);
      api.stage.append(root);
      host = root.querySelector(".o3host");
      ACTION_IDS = (api.G.actions || []).map((x) => x.id);
      o3 = TC.O3 ? TC.O3.mount(host, { action: "idle", spin: "intro", label: "立體的歐力：用手指左右滑可以轉 360 度" }) : null;
      setMode("idle"); ensureLoop();
    },
    idle(api) {
      if (!root) this.mount(api);
      cleanup(); ensureLoop();
    },
    async play(api) {
      if (!root) this.mount(api);
      apiRef = api; cleanup(); ensureLoop();
      document.addEventListener("keydown", onKey, true);
      root.classList.add("playing");
      try {
        const n = TC.rounds(5), list = shuffle(api.G.actions).slice(0, n);
        // level 2 only: a few rounds where Ollie "didn't say" — everyone freezes (never judged)
        const twist = new Set();
        if (false && n >= 3) { const c = shuffle([1, 2, 3, 4].filter((i) => i < n)); twist.add(c[0]); const o = c.find((i) => Math.abs(i - c[0]) > 1); if (o != null && n >= 5) twist.add(o); }
        api.progress(0, n);
        await titleCard(api); if (api.aborted) return;
        for (let i = 0; i < list.length; i++) {
          api.progress(i, n);
          if (!(await oneRound(api, list[i], twist.has(i)))) return;
        }
        api.progress(n, n);
        if (!(await finale(api))) return;
        await TC.clapBanner(); if (api.aborted) return;
        return { ok: true };
      } finally { cleanup(); }
    }
  };
})();
