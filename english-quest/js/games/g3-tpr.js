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
    A["tpr-brush"] = () => { const c = TC.ArtCtx(); let s = c.shadow(150, 86, 120, 5);
      s += c.path("M106 40 L232 30 Q294 30 296 46 Q294 62 232 58 L106 52Z", "#35c8ff");
      s += c.ell(60, 52, 50, 15, "#2a8fe0", 0, 0.4);
      for (let i = 0; i < 9; i++) s += `<rect x="${22 + i * 10}" y="12" width="8" height="40" rx="4" fill="${i % 2 ? "#ffffff" : "#ff9ac2"}"/><rect x="${22 + i * 10}" y="12" width="3" height="40" rx="1.5" fill="#fff" opacity=".6"/>`;
      s += c.ell(60, 12, 42, 11, "#ffffff", 0, 0.5) + `<path d="M26 13 Q60 4 94 13" stroke="#4cc9ff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M30 17 Q60 9 90 17" stroke="#ff5fa2" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      s += c.hl(180, 38, 60, 6, -2, 0.8);
      return c.out(s, "0 0 300 90"); };
    S["tpr-brush"] = [226, 44, 11, 0];
    A["tpr-mask"] = () => { const c = TC.ArtCtx(); let s = "";
      s += `<ellipse cx="24" cy="62" rx="20" ry="26" fill="none" stroke="#ffffff" stroke-width="6"/><ellipse cx="236" cy="62" rx="20" ry="26" fill="none" stroke="#ffffff" stroke-width="6"/>`;
      s += c.path("M50 30 Q130 14 210 30 Q226 60 210 92 Q130 108 50 92 Q34 60 50 30Z", "#7fd0ff", `stroke="#fff" stroke-width="4"`);
      s += `<path d="M58 48 Q130 38 202 48" stroke="#4aa6e8" stroke-width="3.5" fill="none"/><path d="M54 64 Q130 56 206 64" stroke="#4aa6e8" stroke-width="3.5" fill="none"/><path d="M58 80 Q130 74 202 80" stroke="#4aa6e8" stroke-width="3.5" fill="none"/>`;
      s += c.hl(96, 40, 40, 10, -8, 0.7);
      return c.out(s, "0 0 260 120"); };
    S["tpr-mask"] = [186, 74, 12, 0];
    A["tpr-juice"] = () => { const c = TC.ArtCtx(); let s = c.shadow(60, 184, 46, 6);
      s += c.path("M94 64 L112 54 L112 160 L94 172Z", "#d9700a");
      s += c.path("M24 64 L94 64 L112 54 L44 54Z", "#ffd98a");
      s += c.path("M24 64 H94 V172 Q94 176 88 176 H30 Q24 176 24 170Z", "#ffa52e");
      s += `<path d="M58 62 L58 22 Q58 8 40 8 L16 8" stroke="#e0272b" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M58 52 L58 36 M58 24 Q56 12 44 10 M32 8 L24 8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="6 6"/>`;
      s += c.sphere(59, 104, 25, "#ff8a00") + `<path d="M59 104 L59 80 M59 104 L81 112 M59 104 L40 120 M59 104 L37 96" stroke="#ffd18a" stroke-width="3"/>` + `<path d="M62 78 Q78 66 90 74 Q76 86 62 78Z" fill="#46c35a"/>`;
      s += c.hl(40, 80, 12, 30, 0, 0.5);
      return c.out(s, "0 0 120 190"); };
    S["tpr-juice"] = [59, 152, 11, 0];
    A["tpr-cloth"] = () => { const c = TC.ArtCtx(); let s = c.shadow(75, 88, 58, 5);
      s += c.path("M14 26 Q40 12 76 20 Q112 12 138 28 Q146 52 136 76 Q116 86 98 76 Q80 88 56 78 Q32 86 14 74 Q6 50 14 26Z", "#ffd23d");
      s += `<path d="M26 40 Q76 28 128 42" stroke="#ff9a2e" stroke-width="5" fill="none"/><path d="M24 58 Q76 46 130 60" stroke="#ff9a2e" stroke-width="5" fill="none"/>`;
      s += c.hl(52, 34, 30, 9, -10, 0.7);
      return c.out(s, "0 0 150 100"); };
    S["tpr-cloth"] = [112, 54, 11, 0];
    A["tpr-soap"] = () => { const c = TC.ArtCtx(); let s = c.shadow(100, 140, 70, 7);
      s += c.path("M36 92 Q36 66 66 64 L134 64 Q166 66 166 92 Q166 120 134 124 L66 124 Q36 120 36 92Z", "#ff8fc0");
      s += c.hl(80, 76, 34, 9, -8, 0.7);
      [[62, 40, 22], [112, 28, 18], [150, 48, 24], [92, 52, 12], [178, 22, 12]].forEach(([x, y, r]) => { s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#bfeaff" fill-opacity=".45" stroke="#fff" stroke-width="3"/><ellipse cx="${x - r * 0.35}" cy="${y - r * 0.4}" rx="${r * 0.28}" ry="${r * 0.14}" fill="#fff" transform="rotate(-35 ${x - r * 0.35} ${y - r * 0.4})"/>`; });
      return c.out(s, "0 0 200 160"); };
    S["tpr-soap"] = [101, 104, 14, 0];
  }
  regArt();

  /* ---------- CSS ---------- */
  const css = `
  .tpr{position:absolute;inset:0;overflow:hidden;font-family:var(--font);touch-action:manipulation}
  .tpr .bg{position:absolute;inset:0;width:100%;height:100%;display:block}
  .tpr .dim{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity 1.4s;background:radial-gradient(90% 80% at 50% 45%,rgba(18,26,86,.78),rgba(3,6,28,.94))}
  .tpr.night .dim{opacity:1}
  .tpr .scene{position:absolute;left:0;top:9.2rem;z-index:3;width:100%;height:calc(100% - 9.2rem - 21.5vh);display:block;overflow:visible;transition:filter 1.2s}
  .tpr.night .scene{filter:brightness(.78) saturate(.8) hue-rotate(-10deg)}
  .tpr.sizzle .scene{transition:none}
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

  .tpr .ring{position:absolute;left:2.6vw;top:30vh;width:21vh;z-index:6;text-align:center;opacity:0;transform:scale(.6);transition:transform .4s cubic-bezier(.2,1.5,.4,1),opacity .25s;pointer-events:none}
  .tpr .ring.show{opacity:1;transform:scale(1)}
  .tpr .ring svg{width:100%;display:block;filter:drop-shadow(0 .5rem .8rem rgba(0,0,0,.35))}
  .tpr .ring .tr{fill:rgba(10,22,51,.62);stroke:rgba(255,255,255,.25);stroke-width:14}
  .tpr .ring .pr{fill:none;stroke:var(--gate);stroke-width:14;stroke-linecap:round;stroke-dasharray:540.35;stroke-dashoffset:540.35}
  .tpr .ring .pl{fill:#ffc83d;opacity:.9;transform-origin:100px 100px}
  .tpr .ring .num{font:700 78px var(--font);fill:#fff;paint-order:stroke;stroke:#0a1633;stroke-width:8px}
  .tpr .ring .dots{display:flex;justify-content:center;gap:.7rem;margin-top:.5rem}
  .tpr .ring .dots i{width:2rem;height:2rem;border-radius:50%;background:rgba(10,22,51,.6);border:.25rem solid #fff;transition:background .2s,transform .2s}
  .tpr .ring .dots i.on{background:#ffc83d;transform:scale(1.15)}
  .tpr .ring .lbl{margin-top:.5rem;font-size:2rem;font-weight:700;line-height:1.15;color:#fff;text-shadow:0 .2rem 0 #0a1633,0 0 1rem #0a1633}
  .tpr .ring.big{width:27vh;top:27vh}
  .tpr .ring.big .tr{fill:rgba(8,14,60,.7);stroke:rgba(190,210,255,.35)}
  .tpr .ring.big .pr{stroke:#9ec5ff}
  .tpr .ring.big .pl{fill:#7fa8ff;opacity:.35}
  .tpr .ring.big .num{font-size:96px}

  .tpr .nosay{position:absolute;right:5vw;top:11.5rem;z-index:6;padding:1rem 2.2rem 1.2rem;text-align:center;border-radius:2.4rem;color:#fff;background:linear-gradient(180deg,#ff6a6a,#cf1f27);border:.5rem solid #fff;
    box-shadow:0 .6rem 0 #7e0c12,0 1.4rem 2.4rem rgba(0,0,0,.4);transform-origin:50% 0;animation:tprSwing 1s ease-in-out infinite alternate;opacity:0;transition:opacity .3s}
  .tpr .nosay.show{opacity:1}
  .tpr .nosay b{display:block;font-size:3.6rem;line-height:1.05;text-shadow:0 .25rem 0 rgba(0,0,0,.3)}
  .tpr .nosay span{display:block;font-size:2.3rem;font-weight:700;margin-top:.2rem}
  @keyframes tprSwing{from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}

  .tpr .title{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);z-index:8;text-align:center;pointer-events:none;animation:tprTitle 2.4s cubic-bezier(.2,1.4,.4,1) forwards}
  .tpr .title .t1{font-size:10rem;font-weight:700;line-height:1;color:#fff;-webkit-text-stroke:.6rem #0a1633;paint-order:stroke fill;text-shadow:0 .8rem 0 #0a1633,0 1.6rem 3rem rgba(0,0,0,.45);background:none}
  .tpr .title .t1 span{color:#ffc83d}
  .tpr .title .t2{font-size:4.6rem;font-weight:700;color:#fff;margin-top:.5rem;text-shadow:0 .3rem 0 #0a1633,0 0 2rem #0a1633;font-family:"Microsoft JhengHei","PingFang TC","Noto Sans TC",var(--font)}
  .tpr .title .t3{display:inline-block;margin-top:1.2rem;padding:.6rem 2.4rem;border-radius:3rem;background:linear-gradient(180deg,#2a8fe0,#14529a);border:.35rem solid #fff;font-size:2.9rem;font-weight:700;color:#fff;box-shadow:0 .4rem 0 rgba(0,0,0,.35)}
  .tpr .title .t4{display:inline-block;margin:1rem 0 0 1.2rem;padding:.5rem 2rem;border-radius:3rem;background:linear-gradient(180deg,#ff6a6a,#cf1f27);border:.3rem solid #fff;font-size:2.4rem;font-weight:700;color:#fff}
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
      rg("tbPf", "#ff5fa2"), rg("tbBall", "#ffffff"), rg("tbBall2", "#ff7a3d"), rg("tbBeach", "#4cc9ff"), rg("tbCone", "#ff8a1f"),
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
    // wall bars (left) and hoop (right)
    s += `<rect x="40" y="230" width="22" height="315" rx="8" fill="url(#tbWood)"/><rect x="230" y="230" width="22" height="315" rx="8" fill="url(#tbWood)"/>`;
    for (let i = 0; i < 10; i++) s += `<rect x="62" y="${248 + i * 30}" width="168" height="11" rx="5" fill="url(#tbWood)"/>`;
    s += `<rect x="1350" y="190" width="170" height="120" rx="10" fill="#fff" stroke="#4a5a99" stroke-width="7"/><rect x="1394" y="236" width="82" height="58" fill="none" stroke="#e0272b" stroke-width="6"/>`
      + `<ellipse cx="1435" cy="318" rx="48" ry="12" fill="none" stroke="#ff7a1a" stroke-width="9"/><path d="M1390 320 L1410 372 M1412 322 L1424 374 M1435 324 L1435 376 M1458 322 L1446 374 M1480 320 L1460 372" stroke="#fff" stroke-width="4" opacity=".9"/>` + TC.seal(1435, 262, 11, 0);
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
    s += TC.seal(560, 740, 12, -8) + TC.seal(1040, 740, 12, 8);
    // toys on the floor
    s += `<ellipse cx="250" cy="778" rx="52" ry="11" fill="#000" opacity=".2"/><circle cx="250" cy="736" r="44" fill="url(#tbBall)"/><path d="M250 714 l18 13 -7 21 h-22 l-7 -21z" fill="#2a2f5a"/>` + TC.seal(250, 740, 9, 0);
    s += `<ellipse cx="1370" cy="808" rx="60" ry="12" fill="#000" opacity=".2"/><path d="M1330 806 L1370 706 L1410 806Z" fill="url(#tbCone)"/><path d="M1344 770 H1396 M1352 748 H1388" stroke="#fff" stroke-width="9"/>` + TC.seal(1370, 790, 9, 0);
    s += `<ellipse cx="1180" cy="838" rx="56" ry="11" fill="#000" opacity=".2"/><circle cx="1180" cy="792" r="50" fill="url(#tbBeach)"/><path d="M1180 742 Q1210 792 1180 842 M1180 742 Q1150 792 1180 842" stroke="#fff" stroke-width="9" fill="none"/>`;
    s += `<ellipse cx="420" cy="838" rx="50" ry="10" fill="#000" opacity=".2"/><circle cx="420" cy="802" r="38" fill="url(#tbBall2)"/><path d="M382 802 H458 M420 764 V840" stroke="#7a3410" stroke-width="3"/>`;
    return s + `</svg>`;
  }

  /* ---------- Ollie (drawn in scene units: viewBox 0 0 900 560, centre x = 450, feet y = 512) ---------- */
  function sceneSVG() {
    const def = [rg("tpBody", "#8fa2ff"), rg("tpHead", "#98aaff"), rg("tpBelly", "#e6ecff", 40, 30), rg("tpGold", "#ffc83d"), rg("tpOr", "#ffb020"), rg("tpWh", "#ffffff", 38, 30),
      rg("tpPup", "#2a3a8a"), rg("tpRed", "#ff5a5a"), rg("tpMetal", "#cfd8e8", 30, 25), lg("tpMetalS", "#f4f8ff", "#8ea0bd"), rg("tpFoam", "#ffffff", 40, 30), rg("tpBub", "#cfeeff", 40, 35, 70),
      lg("tpWater", "#9be4ff", "#3fb4e8"), rg("tpBag", "#9b6bff"), rg("tpPorc", "#f2faff", 40, 25), lg("tpWoodT", "#f3c987", "#c98a42"), lg("tpWoodF", "#a8672b", "#6b3d17"),
      lg("tpDoor", "#c47a3a", "#8a4e1c", 1, 0), lg("tpRoom", "#fff6c9", "#ffd77a"), lg("tpArm", "#8fa2ff", "#5a6ad8", 1, 0), rg("tpPink", "#ff9ac2", 40, 30),
      `<radialGradient id="tpShade" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`].join("");
    const eye = (cx) => `<circle cx="${cx}" cy="238" r="52" fill="url(#tpWh)" data-r="wh"/>`;
    const pup = (cx) => `<g transform="translate(${cx} 238)"><circle r="26" fill="url(#tpPup)" data-r="pu"/><circle cx="-9" cy="-10" r="9" fill="#fff"/><circle cx="8" cy="8" r="4" fill="#fff" opacity=".85"/></g>`;
    const arm = (k) => `<path data-r="a${k}b" fill="none" stroke="#4452b8" stroke-width="50" stroke-linecap="round"/><path data-r="a${k}m" fill="none" stroke="url(#tpArm)" stroke-width="43" stroke-linecap="round"/><path data-r="a${k}h" fill="none" stroke="#c9d3ff" stroke-width="11" stroke-linecap="round" opacity=".75"/>`;
    const mitt = (k, th) => `<g data-r="m${k}"><circle r="31" fill="#b9820f" cy="3"/><circle r="30" fill="url(#tpGold)"/><circle cx="${th * 19}" cy="-16" r="13" fill="url(#tpGold)"/><ellipse cx="-8" cy="-12" rx="12" ry="7" fill="#fff" opacity=".6" transform="rotate(-25 -8 -12)"/><path d="M${-th * 12} 12 Q0 22 ${th * 12} 12" stroke="#b9820f" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/></g>`;
    let s = `<svg class="scene" viewBox="0 0 900 560" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs>${def}</defs>`;
    s += `<ellipse data-r="shadow" cx="450" cy="522" rx="150" ry="22" fill="url(#tpShade)"/>`;
    s += `<g data-r="back"></g>`;
    // body parts (legs, wheel, body, head)
    s += `<g data-r="body">`;
    s += `<g data-r="legs"><path data-r="lgL" d="M415 492 L405 506" stroke="#e08f0a" stroke-width="20" stroke-linecap="round" fill="none"/><path data-r="lgR" d="M485 492 L495 506" stroke="#e08f0a" stroke-width="20" stroke-linecap="round" fill="none"/>`
      + `<g data-r="fL"><ellipse rx="46" ry="22" fill="url(#tpOr)"/><ellipse cx="-12" cy="-8" rx="20" ry="6" fill="#fff" opacity=".5"/></g><g data-r="fR"><ellipse rx="46" ry="22" fill="url(#tpOr)"/><ellipse cx="-12" cy="-8" rx="20" ry="6" fill="#fff" opacity=".5"/></g></g>`;
    s += `<g data-r="wheel" style="display:none"><circle r="52" fill="#ffb020" opacity=".3"/>`;
    for (let i = 0; i < 6; i++) s += `<g transform="rotate(${i * 60}) translate(0 -38)"><ellipse rx="24" ry="13" fill="url(#tpOr)"/></g>`;
    s += `<circle r="46" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="30 22" opacity=".6"/></g>`;
    s += `<path d="M450 292 C358 292 316 358 320 430 C324 486 380 512 450 512 C520 512 576 486 580 430 C584 358 542 292 450 292Z" fill="url(#tpBody)"/>`
      + `<ellipse cx="450" cy="438" rx="92" ry="64" fill="url(#tpBelly)" opacity=".95"/><ellipse cx="386" cy="372" rx="46" ry="14" fill="#fff" opacity=".35" transform="rotate(-22 386 372)"/>`;
    s += TC.seal(450, 436, 22, 0);
    // head
    s += `<g data-r="head">`;
    s += `<g data-r="ant"><line x1="450" y1="116" x2="450" y2="66" stroke="#c9d6ff" stroke-width="8" stroke-linecap="round"/><path transform="translate(450 52) scale(24)" d="M0 -1 L.3 -.3 L1 -.2 L.45 .25 L.6 1 L0 .6 L-.6 1 L-.45 .25 L-1 -.2 L-.3 -.3Z" fill="url(#tpGold)" stroke="#b9820f" stroke-width=".08"/></g>`;
    s += `<path d="M322 150 L306 84 L394 124Z" fill="url(#tpHead)"/><path d="M578 150 L594 84 L506 124Z" fill="url(#tpHead)"/><path d="M328 138 L318 100 L370 126Z" fill="#ff9ac2" opacity=".8"/><path d="M572 138 L582 100 L530 126Z" fill="#ff9ac2" opacity=".8"/>`;
    s += `<path d="M450 108 C350 108 288 152 284 236 C280 320 350 354 450 354 C550 354 620 320 616 236 C612 152 550 108 450 108Z" fill="url(#tpHead)"/>`
      + `<ellipse cx="450" cy="240" rx="150" ry="98" fill="#dfe6ff" opacity=".55"/><ellipse cx="380" cy="148" rx="62" ry="16" fill="#fff" opacity=".5" transform="rotate(-14 380 148)"/>`;
    s += `<g data-r="eOpen">${eye(395)}${eye(505)}<g data-r="pupils">${pup(395)}${pup(505)}</g></g>`;
    s += `<g data-r="eHappy" style="display:none"><path d="M352 250 Q395 196 438 250" stroke="#1b1d33" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M462 250 Q505 196 548 250" stroke="#1b1d33" stroke-width="13" fill="none" stroke-linecap="round"/></g>`;
    s += `<g data-r="eClosed" style="display:none"><path d="M352 232 Q395 268 438 232" stroke="#1b1d33" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M462 232 Q505 268 548 232" stroke="#1b1d33" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M356 246 l-12 8 M434 246 l12 8 M466 246 l-12 8 M544 246 l12 8" stroke="#1b1d33" stroke-width="5" stroke-linecap="round"/></g>`;
    s += `<g data-r="browL" style="display:none"><path d="M355 172 L435 172" stroke="#2a3a8a" stroke-width="13" stroke-linecap="round"/></g><g data-r="browR" style="display:none"><path d="M465 172 L545 172" stroke="#2a3a8a" stroke-width="13" stroke-linecap="round"/></g>`;
    s += `<ellipse cx="338" cy="298" rx="22" ry="12" fill="#ff7aa8" opacity=".55"/><ellipse cx="562" cy="298" rx="22" ry="12" fill="#ff7aa8" opacity=".55"/>`;
    s += `<path d="M426 274 Q450 262 474 274 L450 312Z" fill="url(#tpOr)"/><path d="M436 274 Q450 268 462 274" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>`;
    s += `<g data-r="mSmile"><path d="M418 322 Q450 346 482 322" stroke="#1b1d33" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
    s += `<g data-r="mOpen" style="display:none"><ellipse cx="450" cy="326" rx="42" ry="28" fill="#3a1030"/><ellipse cx="450" cy="342" rx="26" ry="12" fill="#ff7aa8"/><path d="M414 316 Q450 330 486 316 L486 310 L414 310Z" fill="#fff"/></g>`;
    s += `<g data-r="mO" style="display:none"><ellipse cx="450" cy="328" rx="14" ry="18" fill="#3a1030"/><ellipse cx="450" cy="336" rx="8" ry="7" fill="#ff7aa8"/></g>`;
    s += `<g data-r="mGrim" style="display:none"><path d="M416 330 q9 -12 17 0 t17 0 t17 0 t15 0" stroke="#1b1d33" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
    s += `<g data-r="mTeeth" style="display:none"><rect x="404" y="308" width="92" height="38" rx="16" fill="#fff" stroke="#2a2f5a" stroke-width="6"/><path d="M419 311 V343 M435 311 V343 M450 311 V343 M465 311 V343 M481 311 V343 M406 327 H494" stroke="#b9c2e6" stroke-width="3"/></g>`;
    s += `<circle data-r="snore" cx="492" cy="300" r="0" fill="#cfeeff" fill-opacity=".55" stroke="#fff" stroke-width="4"/>`;
    s += `<g data-r="shades" style="display:none"><rect x="338" y="206" width="104" height="66" rx="24" fill="#10132c"/><rect x="458" y="206" width="104" height="66" rx="24" fill="#10132c"/><path d="M440 226 H460" stroke="#10132c" stroke-width="9"/><path d="M350 218 l36 0 -22 22z M470 218 l36 0 -22 22z" fill="#fff" opacity=".45"/></g>`;
    s += `<g data-r="hat" style="display:none"><path d="M296 160 C300 72 420 34 520 62 C600 86 650 150 664 228 C628 172 600 150 590 150 C530 124 372 124 296 160Z" fill="url(#tpRed)"/><path d="M290 166 Q450 96 610 160 L600 188 Q450 126 300 192Z" fill="#fff"/><circle cx="664" cy="236" r="26" fill="url(#tpWh)"/></g>`;
    s += `</g></g>`; // head, body
    s += `<g data-r="front"></g>`;
    // arms layer (arms, held props, mitts)
    s += `<g data-r="arms">${arm("L")}${arm("R")}<g data-r="held"></g>${mitt("L", -1)}${mitt("R", 1)}</g>`;
    s += `<g data-r="fx"></g></svg>`;
    return s;
  }

  /* ---------- state ---------- */
  let root = null, E = {}, ring = null, ban = null, nosay = null, nextBtn = null, sky = null, apiRef = null;
  let raf = 0, T0 = 0, MODE = null, mode = "idle", lastBeat = -1, loopsDone = 0;
  let talking = false, active = false, cdStart = 0, cdBig = false, dirt = [];
  const temp = [];
  let lastLoop = -1, bangAt = 0;
  let audio = null;

  const Q = (r) => root.querySelector(`[data-r="${r}"]`);
  const show = (el, on) => { if (el) el.style.display = on ? "" : "none"; };
  const setT = (el, x, y, rot = 0, sc = 1, sy) => { if (el) el.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${sc.toFixed(3)} ${(sy == null ? sc : sy).toFixed(3)})`); };
  function refsOf(layer) { const m = {}; layer.querySelectorAll("[data-r]").forEach((e) => { m[e.dataset.r] = e; }); m.all = (p) => Object.keys(m).filter((k) => k.startsWith(p) && /^\d+$/.test(k.slice(p.length))).sort((a, b) => +a.slice(p.length) - +b.slice(p.length)).map((k) => m[k]); return m; }

  /* ---------- the pose of Ollie, one frame ---------- */
  function basePose(tt) {
    const br = Math.sin(tt * TAU * 0.45), m = tt % 3.6;
    return { ox: 0, oy: br * 2.5, tilt: 0, sx: 1 + br * 0.006, sy: 1 - br * 0.01, head: Math.sin(tt * 1.3) * 1.5, hdy: 0,
      eyes: "open", wr: 52, pr: 26, look: [0, 0], brow: null, mouth: "smile", mo: 1, L: [316, 480], R: [584, 480], bowL: 30, bowR: 30,
      fl: [405, 512], fr: [495, 512], feet: true, wheel: null, hat: false, hatT: [0, 0, 0], shades: false, ant: Math.sin(tt * 2.4) * 7,
      blink: m < 0.16 ? Math.sin((m / 0.16) * Math.PI) : 0, bubble: 0, shadow: 1 };
  }
  function setArm(k, S, H, bow) {
    const dx = H[0] - S[0], dy = H[1] - S[1], len = Math.hypot(dx, dy) || 1, sg = k === "L" ? -1 : 1;
    let nx = -dy / len, ny = dx / len; if (nx * sg < 0) { nx = -nx; ny = -ny; }
    const b = bow * clamp(1.25 - len / 260, 0.15, 1), cx = (S[0] + H[0]) / 2 + nx * b, cy = (S[1] + H[1]) / 2 + ny * b;
    const d = `M${f1(S[0])} ${f1(S[1])} Q${f1(cx)} ${f1(cy)} ${f1(H[0])} ${f1(H[1])}`;
    E["a" + k + "b"].setAttribute("d", d); E["a" + k + "m"].setAttribute("d", d);
    E["a" + k + "h"].setAttribute("d", `M${f1(S[0] - 7)} ${f1(S[1] - 9)} Q${f1(cx - 7)} ${f1(cy - 9)} ${f1(H[0] - 7)} ${f1(H[1] - 9)}`);
    setT(E["m" + k], H[0], H[1]);
  }
  function apply(P) {
    const tf = `translate(${f1(P.ox)} ${f1(P.oy)}) translate(450 510) rotate(${f1(P.tilt)}) scale(${P.sx.toFixed(3)} ${P.sy.toFixed(3)}) translate(-450 -510)`;
    E.body.setAttribute("transform", tf); E.arms.setAttribute("transform", tf);
    E.head.setAttribute("transform", `translate(0 ${f1(P.hdy)}) rotate(${f1(P.head)} 450 340)`);
    E.ant.setAttribute("transform", `rotate(${f1(P.ant)} 450 116)`);
    const op = P.eyes === "open" || P.eyes === "wide";
    show(E.eOpen, op); show(E.eHappy, P.eyes === "happy"); show(E.eClosed, P.eyes === "closed");
    if (op) {
      E.eOpen.setAttribute("transform", `translate(0 238) scale(1 ${(1 - 0.92 * P.blink).toFixed(3)}) translate(0 -238)`);
      E.pupils.setAttribute("transform", `translate(${f1(P.look[0])} ${f1(P.look[1])})`);
      E.whAll.forEach((c) => c.setAttribute("r", P.eyes === "wide" ? 58 : P.wr)); E.puAll.forEach((c) => c.setAttribute("r", P.eyes === "wide" ? 21 : P.pr));
    }
    if (P.brow == null) { show(E.browL, false); show(E.browR, false); } else {
      show(E.browL, true); show(E.browR, true);
      E.browL.setAttribute("transform", `rotate(${f1(P.brow)} 395 172)`); E.browR.setAttribute("transform", `rotate(${f1(-P.brow)} 505 172)`);
    }
    ["Smile", "Open", "O", "Grim", "Teeth"].forEach((n) => show(E["m" + n], P.mouth === n.toLowerCase()));
    if (P.mouth === "open") E.mOpen.setAttribute("transform", `translate(450 312) scale(1 ${clamp(P.mo, 0.12, 1.15).toFixed(3)}) translate(-450 -312)`);
    if (P.mouth === "o") E.mO.setAttribute("transform", `translate(450 318) scale(${(0.7 + 0.4 * P.mo).toFixed(3)}) translate(-450 -318)`);
    E.snore.setAttribute("r", f1(P.bubble)); show(E.snore, P.bubble > 0.5);
    show(E.shades, P.shades); show(E.hat, P.hat);
    if (P.hat) E.hat.setAttribute("transform", `translate(${f1(P.hatT[0])} ${f1(P.hatT[1])}) rotate(${f1(P.hatT[2])} 450 150)`);
    // feet / wheel
    show(E.legs, P.feet); show(E.wheel, P.wheel != null);
    if (P.wheel != null) E.wheel.setAttribute("transform", `translate(450 498) rotate(${f1(P.wheel)})`);
    if (P.feet) {
      setT(E.fL, P.fl[0], P.fl[1]); setT(E.fR, P.fr[0], P.fr[1]);
      E.lgL.setAttribute("d", `M415 490 L${f1(P.fl[0] + 8)} ${f1(P.fl[1] - 8)}`); E.lgR.setAttribute("d", `M485 490 L${f1(P.fr[0] - 8)} ${f1(P.fr[1] - 8)}`);
    }
    setArm("L", [338, 392], P.L, P.bowL); setArm("R", [562, 392], P.R, P.bowR);
    E.shadow.setAttribute("cx", f1(450 + P.ox)); E.shadow.setAttribute("rx", f1(150 * clamp(1 + P.oy / 420, 0.5, 1.2) * P.shadow)); E.shadow.setAttribute("cy", 522);
  }

  /* ---------- modes (idle, ready, cheer, freeze, laugh, sleep, wake and the 8 actions) ---------- */
  const MODES = {};
  MODES.idle = { frame(t, P) { P.R = [622 + 8 * Math.sin(t * 6), 300 + 22 * Math.cos(t * 6)]; P.bowR = 22; P.tilt = 2.5 * Math.sin(t * 1.8); P.oy -= 4 * Math.abs(Math.sin(t * 2.2)); P.eyes = "open"; P.look = [6 * Math.sin(t * 0.7), 0]; } };
  MODES.ready = { frame(t, P) { P.head += 6 * Math.sin(t * 2); P.oy -= 3 * Math.abs(Math.sin(t * 3)); P.mouth = talking ? "open" : "smile"; P.mo = talking ? 0.35 + 0.3 * Math.abs(Math.sin(t * 15)) : 1; P.L = [310, 470]; P.R = [590, 470]; P.eyes = "open"; } };
  MODES.title = { frame(t, P) { P.R = [630, 270 + 30 * Math.sin(t * 9)]; P.L = [300, 470]; P.oy -= 22 * Math.abs(Math.sin(t * 5)); P.eyes = "happy"; P.mouth = "open"; P.mo = 0.8; P.head += 6 * Math.sin(t * 5); P.tilt = 4 * Math.sin(t * 5); } };
  MODES.cheer = { frame(t, P) {
    const j = Math.abs(Math.sin(t * 9)); P.oy -= 40 * j; P.sy = 1 + 0.06 * (1 - j); P.sx = 1 - 0.04 * (1 - j);
    P.L = [280 - 10 * Math.sin(t * 12), 190]; P.R = [620 + 10 * Math.sin(t * 12), 190]; P.bowL = P.bowR = 20; P.eyes = "happy"; P.mouth = "open"; P.mo = 0.9; P.ant = 24 * Math.sin(t * 14); P.head = 5 * Math.sin(t * 9);
    P.fl = [405, 512 - 18 * (1 - j)]; P.fr = [495, 512 - 18 * (1 - j)]; P.shadow = 1 - 0.3 * j; } };
  MODES.freeze = {
    build() { let s = ""; for (let i = 0; i < 4; i++) s += `<g data-r="sw${i}"><path d="M0 -16 C9 -2 12 6 0 14 C-12 6 -9 -2 0 -16Z" fill="#7fd8ff" stroke="#fff" stroke-width="3"/></g>`; return { fx: s + `<g data-r="ex" transform="translate(640 150)"><text text-anchor="middle" font-size="90" font-weight="700" font-family="Fredoka,sans-serif" fill="#ffd23d" stroke="#0a1633" stroke-width="8" paint-order="stroke">!</text></g>` }; },
    frame(t, P, R) {
      const wob = 3.4 * Math.sin(t * 21) * (0.55 + 0.45 * Math.sin(t * 3.3)); P.tilt = wob; P.ox = 2.5 * Math.sin(t * 17);
      P.L = [262, 318]; P.R = [636, 432]; P.bowL = 22; P.bowR = 18; P.fl = [405, 482]; P.eyes = "wide"; P.look = [10 * Math.sin(t * 5), 5 * Math.sin(t * 3.3)];
      P.brow = -18; P.mouth = "grim"; P.head = wob * 1.4; P.oy = -4;
      for (let i = 0; i < 4; i++) { const ph = (t * 0.9 + i / 4) % 1; setT(R["sw" + i], 330 + (i % 2) * 240 + ph * (i % 2 ? 60 : -60), 220 + ph * 120, 0, 1 + 0.3 * (1 - ph)); R["sw" + i].style.opacity = (1 - ph).toFixed(2); }
      setT(R.ex, 640, 150 + 8 * Math.sin(t * 8), 10 * Math.sin(t * 6), 1);
    } };
  MODES.laugh = {
    build() { return { fx: `<g data-r="ha" transform="translate(450 70)"><text text-anchor="middle" font-size="84" font-weight="700" font-family="Fredoka,sans-serif" fill="#fff" stroke="#e0272b" stroke-width="9" paint-order="stroke">Ha ha ha!</text></g>` }; },
    frame(t, P, R) { const j = Math.abs(Math.sin(t * 13)); P.oy -= 14 * j; P.head = -9 + 3 * Math.sin(t * 13); P.eyes = "happy"; P.mouth = "open"; P.mo = 0.7 + 0.3 * j; P.L = [408, 452]; P.R = [492, 452]; P.bowL = P.bowR = 34; P.tilt = 3 * Math.sin(t * 13);
      setT(R.ha, 450 + 6 * Math.sin(t * 12), 62 - 6 * j, 3 * Math.sin(t * 9), 1 + 0.06 * j); } };

  /* --- 1 wash --- */
  MODES.wash = {
    build() {
      const basin = `<path d="M170 506 Q170 560 450 566 Q730 560 730 506Z" fill="#c4def0"/><ellipse cx="450" cy="508" rx="285" ry="50" fill="url(#tpPorc)" stroke="#fff" stroke-width="5"/><ellipse cx="450" cy="512" rx="246" ry="33" fill="url(#tpWater)"/><path d="M300 510 q40 -10 80 0 M520 516 q40 -10 80 0" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>`;
      const tap = `<rect x="640" y="300" width="48" height="214" rx="20" fill="url(#tpMetal)"/><path d="M664 316 Q664 252 604 252 L548 252 Q516 252 516 284 L516 346" stroke="url(#tpMetalS)" stroke-width="40" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
        + `<rect x="494" y="342" width="44" height="22" rx="9" fill="url(#tpMetal)"/><g data-r="knob" transform="translate(664 252)"><rect x="-8" y="-34" width="16" height="36" rx="6" fill="#c9d3e6"/><circle cy="-40" r="24" fill="url(#tpRed)"/><ellipse cx="-7" cy="-48" rx="9" ry="5" fill="#fff" opacity=".6"/></g>` + TC.seal(664, 440, 12, 0);
      const water = `<path data-r="water" d="M516 364 L516 496" stroke="#8fdcff" stroke-width="22" stroke-linecap="round" stroke-dasharray="30 12" fill="none"/><path d="M510 366 L510 494" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
      let bub = "", drops = "";
      for (let i = 0; i < 16; i++) bub += `<g data-r="bub${i}"><circle r="1" fill="url(#tpBub)" stroke="#fff" stroke-width="2.5" vector-effect="non-scaling-stroke"/><ellipse cx="-.36" cy="-.42" rx=".28" ry=".14" fill="#fff" transform="rotate(-35 -.36 -.42)"/><circle cx=".3" cy=".3" r=".1" fill="#ff9ac2" opacity=".7"/></g>`;
      for (let i = 0; i < 5; i++) drops += `<circle data-r="dr${i}" r="6" fill="#8fdcff" stroke="#fff" stroke-width="2"/>`;
      const foam = `<g data-r="foam">` + [[-44, 2, 26], [-16, -16, 30], [18, -12, 33], [46, 4, 26], [0, 14, 30], [-26, 18, 20], [30, 20, 22]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#tpFoam)"/>`).join("") + `</g>`;
      return { front: basin + water + tap, fx: foam + bub + drops };
    },
    frame(t, P, R) {
      const rub = Math.sin(t * TAU * 2.2);
      P.L = [412 + 10 * rub, 486 - 5 * rub]; P.R = [488 - 10 * rub, 486 + 5 * rub]; P.bowL = P.bowR = 14; P.eyes = "happy"; P.mouth = "open"; P.mo = 0.45 + 0.25 * Math.sin(t * TAU * 2); P.head += 5 * Math.sin(t * TAU); P.tilt = 2.5 * Math.sin(t * TAU * 1.1);
      setT(R.foam, 450, 486, 0, 1 + 0.07 * Math.sin(t * 20));
      R.all("bub").forEach((g, i) => { const ph = (t * 0.42 + i / 16) % 1, x = 450 + (((i * 53) % 150) - 75) * (0.6 + ph) + 26 * Math.sin(ph * TAU * 2 + i), y = 450 - ph * 330, r = (10 + ((i * 7) % 15)) * (0.7 + 0.5 * ph);
        setT(g, x, y, 0, r); g.style.opacity = (ph < 0.1 ? ph / 0.1 : ph > 0.8 ? (1 - ph) / 0.2 : 1).toFixed(2); });
      R.water.style.strokeDashoffset = (-t * 240).toFixed(1);
      R.all("dr").forEach((d, i) => { const ph = (t * 1.6 + i / 5) % 1; d.setAttribute("cx", f1(516 + (i - 2) * 16 * ph * 2)); d.setAttribute("cy", f1(498 - 46 * Math.sin(ph * Math.PI))); d.style.opacity = (1 - ph).toFixed(2); });
      R.knob.setAttribute("transform", `translate(664 252) rotate(${f1(18 * Math.sin(t * 4))})`);
    },
    beats: { 1: "pop", 3: "pop" } };

  /* --- 2 clean --- */
  MODES.clean = {
    build() {
      const table = `<path d="M196 480 L704 480 L790 566 L110 566Z" fill="url(#tpWoodT)" stroke="#8a5a26" stroke-width="5" stroke-linejoin="round"/><path d="M230 500 H690 M190 520 H712 M150 543 H752" stroke="#a8672b" stroke-width="3" opacity=".35"/><path d="M196 480 L704 480" stroke="#fff" stroke-width="6" opacity=".6"/>`;
      let dirt = "", spk = "";
      for (let i = 0; i < 6; i++) { dirt += `<g data-r="dirt${i}"><ellipse rx="30" ry="9" fill="#6b4a2a" opacity=".75"/><circle cx="-12" cy="-4" r="5" fill="#4a3018"/><circle cx="10" cy="-2" r="6" fill="#4a3018"/><circle cx="2" cy="3" r="4" fill="#4a3018"/></g>`; spk += `<path data-r="spk${i}" d="${STAR4}" fill="#fff" stroke="#ffd23d" stroke-width=".12" transform="translate(0 0) scale(0)"/>`; }
      return { front: table + dirt + spk, held: `<g data-r="cloth"><image href="${TC.art("tpr-cloth")}" x="-75" y="-55" width="150" height="100"/></g>`,
        fx: `<path data-r="shine" d="M0 0 L30 0 L10 70 L-20 70Z" fill="#fff" opacity=".0"/>` };
    },
    init(R) { R._c = [null, null, null, null, null, null]; R._xs = [300, 372, 440, 508, 572, 630]; },
    frame(t, P, R) {
      const cx = 450 + 175 * Math.sin(t * TAU * 1), sw = Math.cos(t * TAU * 1);
      P.ox = (cx - 450) * 0.2; P.tilt = 5 * Math.sin(t * TAU * 1); P.head += 6 * Math.sin(t * TAU) ; P.eyes = "happy"; P.mouth = "smile"; P.look = [8 * Math.sin(t * TAU), 4];
      const hx = cx - P.ox, hy = 508;
      P.R = [hx, hy]; P.L = [352, 504 + 2 * Math.sin(t * 9)]; P.bowR = 20; P.bowL = 14;
      setT(R.cloth, hx, hy - 6, 8 * sw, 1);
      for (let i = 0; i < 6; i++) {
        const x = R._xs[i], y = 512 + (i % 2 ? 8 : -2);
        if (R._c[i] == null && t > 0.45 + i * 0.4 && Math.abs(cx - x) < 38) { R._c[i] = t; TC.sfx("sparkle"); }
        setT(R["dirt" + i], x, y, 0, 1); R["dirt" + i].style.opacity = R._c[i] == null ? 1 : Math.max(0, 1 - (t - R._c[i]) * 5);
        const sp = R["spk" + i];
        if (R._c[i] != null) { const a = t - R._c[i], sc = a < 0.3 ? backOut(a / 0.3) : 1; setT(sp, x, y - 18 - 8 * Math.sin(t * 6 + i), t * 40 + i * 20, (22 + 5 * Math.sin(t * 9 + i)) * sc); } else setT(sp, x, y, 0, 0);
      }
    }, beats: {} };

  /* --- 3 brush --- */
  MODES.brush = {
    build() {
      let foam = ""; for (let i = 0; i < 12; i++) foam += `<g data-r="foam${i}"><circle r="1" fill="url(#tpFoam)" stroke="#dff3ff" stroke-width="1.5" vector-effect="non-scaling-stroke"/></g>`;
      return { held: `<g data-r="brush"><image href="${TC.art("tpr-brush")}" x="-60" y="-45" width="300" height="90"/></g>`, fx: foam + `<path data-r="glint" d="${STAR4}" fill="#fff" stroke="#8fdcff" stroke-width=".1" transform="scale(0)"/><path data-r="glint2" d="${STAR4}" fill="#fff" stroke="#ffd23d" stroke-width=".1" transform="scale(0)"/>` };
    },
    frame(t, P, R) {
      const sc = Math.sin(t * TAU * 4), p = clamp(t / 5);
      P.mouth = "teeth"; P.eyes = "happy"; P.head += 4 * sc; P.tilt = 1.5 * sc;
      const bx = 452 + 22 * sc, by = 328, ang = -12 + 3 * sc;
      setT(R.brush, bx, by, ang, 1);
      const gx = bx + 172 * Math.cos(ang * Math.PI / 180), gy = by + 172 * Math.sin(ang * Math.PI / 180);
      P.R = [gx, gy]; P.bowR = 16;
      P.L = [346 + 8 * Math.sin(t * TAU * 2), 438 - 22 * Math.abs(Math.sin(t * TAU * 2))]; P.bowL = 26;
      R.all("foam").forEach((g, i) => { const a = (i / 12) * TAU + 0.3, rr = (7 + ((i * 5) % 11)) * (0.35 + 0.95 * Math.min(1, p * 1.5)) * (1 + 0.07 * Math.sin(t * 9 + i)), ex = 450 + Math.cos(a) * (54 + (i % 3) * 9), ey = 330 + Math.sin(a) * (22 + (i % 2) * 8); setT(g, ex, ey, 0, rr); });
      const g1 = clamp((t - 4.4) / 0.4), g2 = clamp((t - 4.8) / 0.4);
      setT(R.glint, 432, 318, t * 90, 20 * g1 * (0.8 + 0.2 * Math.sin(t * 14))); setT(R.glint2, 478, 336, -t * 80, 14 * g2 * (0.8 + 0.2 * Math.sin(t * 12)));
    }, beats: {} };

  /* --- 4 mask --- */
  MODES.mask = {
    build() { return { held: `<g data-r="mask"><image href="${TC.art("tpr-mask")}" x="-130" y="-60" width="260" height="120"/></g>`,
      fx: `<g data-r="pop" opacity="0"><polygon points="${burstPts(10, 78, 50)}" fill="#ffd23d" stroke="#fff" stroke-width="6"/><text y="14" text-anchor="middle" font-size="44" font-weight="700" font-family="Fredoka,sans-serif" fill="#e0272b" stroke="#fff" stroke-width="3" paint-order="stroke">POP!</text></g><path data-r="s0" d="${STAR4}" fill="#fff" stroke="#8fdcff" stroke-width=".1"/><path data-r="s1" d="${STAR4}" fill="#fff" stroke="#ffd23d" stroke-width=".1"/><path data-r="s2" d="${STAR4}" fill="#fff" stroke="#ff9ac2" stroke-width=".1"/>` }; },
    frame(t, P, R) {
      const u = (t % 2) / 2, k = easeIO(seg(u, 0, 0.25)) - easeIO(seg(u, 0.75, 1)), on = seg(u, 0.25, 0.75) > 0 && u < 0.75;
      const pop = u > 0.25 && u < 0.45 ? Math.sin(seg(u, 0.25, 0.45) * Math.PI) * 0.2 : 0;
      const my = lerp(440, 304, k), sc = lerp(0.72, 1, k) * (1 + pop);
      setT(R.mask, 450, my, 3 * Math.sin(t * 8) * (1 - k), sc);
      const out = easeIO(seg(u, 0.3, 0.42)) - easeIO(seg(u, 0.68, 0.78)), spread = lerp(82, 98, k) + 78 * out, wig = 9 * Math.sin(t * 16) * out;
      P.L = [450 - spread, my + 14 - 30 * out + wig]; P.R = [450 + spread, my + 14 - 30 * out - wig]; P.bowL = P.bowR = 22;
      P.eyes = k > 0.5 ? "happy" : "open"; P.mouth = "o"; P.mo = 0.6; P.head += on ? 5 * Math.sin(t * TAU * 2) : 0;
      const pp = seg(u, 0.25, 0.34), po = 1 - seg(u, 0.42, 0.52);
      R.pop.setAttribute("opacity", (u > 0.25 && u < 0.52 ? po : 0).toFixed(2)); setT(R.pop, 450, 196, -6, 0.9 * backOut(pp) + 0.1);
      [[372, 262], [530, 252], [450, 222]].forEach(([x, y], i) => { const s = on ? (14 + 8 * Math.sin(t * 9 + i * 2)) * seg(u, 0.3 + i * 0.04, 0.4 + i * 0.04) : 0; setT(R["s" + i], x, y, t * 50, s); });
      if (R._lp !== Math.floor(t / 2) && u < 0.1) { R._lp = Math.floor(t / 2); }
      if (R._pk !== Math.floor((t - 0.5) / 2) && u > 0.25 && u < 0.5) { R._pk = Math.floor((t - 0.5) / 2); TC.sfx("pop"); }
    }, beats: {} };

  /* --- 5 close the door --- */
  MODES.door = {
    build() {
      const frame = `<rect x="574" y="146" width="232" height="396" rx="10" fill="#6b3d17"/><rect x="592" y="164" width="196" height="362" fill="url(#tpRoom)"/><path d="M592 470 L788 470" stroke="#d9a548" stroke-width="5"/><rect x="620" y="300" width="60" height="74" fill="#8fdcff" opacity=".55" stroke="#fff" stroke-width="4"/>`;
      let dust = ""; for (let i = 0; i < 5; i++) dust += `<circle data-r="du${i}" r="20" fill="#fff" opacity="0"/>`;
      return { back: frame + `<polygon data-r="leaf" fill="url(#tpDoor)" stroke="#5a300f" stroke-width="5" stroke-linejoin="round"/><polygon data-r="pn0" fill="#a8672b" stroke="#6b3d17" stroke-width="3"/><polygon data-r="pn1" fill="#a8672b" stroke="#6b3d17" stroke-width="3"/><circle data-r="knobD" r="10" fill="url(#tpGold)" stroke="#8a5a0a" stroke-width="2"/><g data-r="dpin">${TC.seal(0, 0, 11, 0)}</g>`,
        fx: dust + `<g data-r="bang" opacity="0"><polygon points="${burstPts(11, 92, 58)}" fill="#ffd23d" stroke="#fff" stroke-width="6"/><text y="16" text-anchor="middle" font-size="52" font-weight="700" font-family="Fredoka,sans-serif" fill="#e0272b" stroke="#fff" stroke-width="3" paint-order="stroke">BANG!</text></g>` };
    },
    frame(t, P, R, c) {
      const u = (t % 2) / 2;
      let s; if (u < 0.14) s = 0.28; else if (u < 0.46) s = lerp(0.28, 1, Math.pow(seg(u, 0.14, 0.46), 2.2)); else if (u < 0.74) s = 1; else s = lerp(1, 0.28, easeIO(seg(u, 0.74, 1)));
      const o = 1 - (s - 0.28) / 0.72, HX = 780, W = 188, TOP = 166, BOT = 526, ex = HX - W * s, dy = 30 * o;
      const pt = (f, g) => { const x = lerp(HX, ex, f), top = TOP - dy * f, bot = BOT + dy * f; return `${f1(x)},${f1(lerp(top, bot, g))}`; };
      R.leaf.setAttribute("points", `${pt(0, 0)} ${pt(1, 0)} ${pt(1, 1)} ${pt(0, 1)}`);
      R.pn0.setAttribute("points", `${pt(0.14, 0.07)} ${pt(0.86, 0.07)} ${pt(0.86, 0.45)} ${pt(0.14, 0.45)}`);
      R.pn1.setAttribute("points", `${pt(0.14, 0.55)} ${pt(0.86, 0.55)} ${pt(0.86, 0.93)} ${pt(0.14, 0.93)}`);
      const kn = pt(0.88, 0.54).split(","); setT(R.knobD, +kn[0], +kn[1], 0, 0.4 + 0.6 * s);
      const pn = pt(0.5, 0.26).split(","); setT(R.dpin, +pn[0], +pn[1], 0, 1, 1); R.dpin.setAttribute("transform", `translate(${pn[0]} ${pn[1]}) scale(${(s).toFixed(3)} 1)`);
      const pushW = easeIO(seg(u, 0.1, 0.18)) - easeIO(seg(u, 0.46, 0.56));
      P.ox = -84; P.tilt = 5 * pushW * (u < 0.46 ? 1 : 0) - 4 * seg(u, 0.46, 0.52) * (1 - seg(u, 0.52, 0.64)) + 2 * Math.sin(t * 2);
      const handW = [ex - 6, 352], rest = [584 + P.ox, 466];
      P.R = [lerp(rest[0], handW[0], pushW) - P.ox, lerp(rest[1], handW[1], pushW)]; P.bowR = 20; P.L = [350, 448 + 6 * Math.sin(t * 3)]; P.bowL = 28;
      P.look = [12 * clamp(1 - pushW * 0.6), 0]; P.head += 6 * pushW;
      if (u < 0.14) { P.eyes = "wide"; P.mouth = "o"; P.brow = -10; } else if (u < 0.46) { P.eyes = "open"; P.mouth = "grim"; P.brow = 14; } else if (u < 0.74) { P.eyes = "happy"; P.mouth = "smile"; } else { P.eyes = "wide"; P.mouth = "o"; P.brow = -14; }
      // BANG
      const bu = seg(u, 0.46, 0.64);
      R.bang.setAttribute("opacity", (u >= 0.46 && u < 0.64 ? 1 - seg(u, 0.54, 0.64) : 0).toFixed(2)); setT(R.bang, 640, 150, 8, 0.2 + 0.9 * backOut(clamp(bu * 3)));
      R.all("du").forEach((d, i) => { const a = u >= 0.46 && u < 0.7 ? seg(u, 0.46, 0.7) : 0; d.setAttribute("cx", f1(700 - 80 + i * 40 - (i - 2) * a * 30)); d.setAttribute("cy", f1(520 - a * 30 - (i % 2) * 14)); d.setAttribute("r", f1(10 + a * 34)); d.setAttribute("opacity", (a ? 0.75 * (1 - a) : 0).toFixed(2)); });
      if (R._lp !== Math.floor(t / 2) && u >= 0.46) { R._lp = Math.floor(t / 2); bangAt = performance.now(); TC.sfx("stamp"); }
    }, beats: {} };

  /* --- 6 hurry --- */
  MODES.hurry = {
    build() {
      let lines = "", ds = "", sw = ""; for (let i = 0; i < 10; i++) lines += `<line data-r="ln${i}" stroke="#fff" stroke-width="${6 + (i % 3) * 2}" stroke-linecap="round" opacity=".8"/>`;
      for (let i = 0; i < 6; i++) ds += `<circle data-r="ds${i}" fill="#fff" opacity="0"/>`;
      for (let i = 0; i < 3; i++) sw += `<g data-r="sw${i}"><path d="M0 -14 C8 -2 10 5 0 12 C-10 5 -8 -2 0 -14Z" fill="#7fd8ff" stroke="#fff" stroke-width="3"/></g>`;
      const clock = `<g data-r="clock"><circle cx="-34" cy="-70" r="22" fill="url(#tpRed)"/><circle cx="34" cy="-70" r="22" fill="url(#tpRed)"/><circle r="66" fill="#fff" stroke="#e0272b" stroke-width="14"/><circle r="66" fill="url(#tpBelly)" opacity=".5"/>`
        + `<g data-r="ch1" stroke="#1b1d33" stroke-width="7" stroke-linecap="round"><line y2="-40"/></g><g data-r="ch0" stroke="#1b1d33" stroke-width="9" stroke-linecap="round"><line y2="-26"/></g><circle r="7" fill="#1b1d33"/>`
        + [0, 90, 180, 270].map((a) => `<line x1="0" y1="-56" x2="0" y2="-48" stroke="#1b1d33" stroke-width="5" transform="rotate(${a})"/>`).join("") + `<g transform="translate(0 30)">${TC.seal(0, 0, 8, 0)}</g></g>`;
      return { back: clock, fx: lines + ds + sw };
    },
    init(R) { R._y = []; for (let i = 0; i < 10; i++) R._y.push(110 + ((i * 97) % 400)); },
    frame(t, P, R) {
      const w = t * 26, u = (t % 2) / 2;
      P.tilt = 9 + 2 * Math.sin(w * 0.5); P.ox = 4 * Math.sin(w * 0.9) + 40 * Math.sin(t * 1.6); P.oy = -8 - 8 * Math.abs(Math.sin(w * 0.5)); P.sx = 1.03; P.feet = false; P.wheel = (t * 1500) % 360;
      P.L = [326 + 28 * Math.sin(w), 436 + 40 * Math.cos(w)]; P.R = [574 - 28 * Math.sin(w), 436 - 40 * Math.cos(w)]; P.bowL = P.bowR = 18;
      P.eyes = "wide"; P.brow = 14; P.mouth = "open"; P.mo = 0.5 + 0.4 * Math.abs(Math.sin(w * 0.8)); P.look = [14, 0]; P.shadow = 0.9;
      R.all("ln").forEach((l, i) => { const sp = 1500 + (i % 4) * 400, x = 960 - ((t * sp + i * 137) % 1300), len = 110 + (i % 3) * 60; l.setAttribute("x1", f1(x)); l.setAttribute("x2", f1(x + len)); l.setAttribute("y1", R._y[i]); l.setAttribute("y2", R._y[i]); });
      R.all("ds").forEach((d, i) => { const ph = (t * 1.8 + i / 6) % 1; d.setAttribute("cx", f1(400 - ph * 280 + P.ox)); d.setAttribute("cy", f1(500 - ph * 26)); d.setAttribute("r", f1(14 + 40 * ph)); d.setAttribute("opacity", (0.8 * (1 - ph)).toFixed(2)); });
      R.all("sw").forEach((d, i) => { const ph = (t * 2.2 + i / 3) % 1; setT(d, 330 - ph * 60 + P.ox, 180 - ph * 80 + i * 22, 0, 1 - ph * 0.4); d.style.opacity = (1 - ph).toFixed(2); });
      setT(R.clock, 770, 170, 7 * Math.sin(w * 0.7), 1 + 0.04 * Math.sin(w));
      R.ch1.setAttribute("transform", `rotate(${f1(t * 1100)})`); R.ch0.setAttribute("transform", `rotate(${f1(t * 92)})`);
      if (R._lp !== Math.floor(t / 2)) { R._lp = Math.floor(t / 2); TC.sfx("whoosh"); }
    }, beats: {} };

  /* --- 7 walk (slow-motion tip-toe, "No running!") --- */
  MODES.walk = {
    build() {
      const person = `<g fill="#1b1d33" stroke="#1b1d33"><circle cx="8" cy="-34" r="9"/><path d="M4 -22 L-8 6 M4 -22 L24 -10 L34 -26 M4 -22 L-12 -10 L-26 -16 M-8 6 L-28 16 L-34 38 M-8 6 L10 22 L22 46" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
      const sign = `<g data-r="sign"><circle r="78" fill="#fff" stroke="#e0272b" stroke-width="16"/>${person}<line x1="-54" y1="-54" x2="54" y2="54" stroke="#e0272b" stroke-width="16" stroke-linecap="round"/><g transform="translate(0 100)">${TC.seal(0, 0, 8, 0)}</g></g>`;
      return { back: sign, held: `<g data-r="shh"><path d="M-86 -44 Q-86 -66 -60 -66 L58 -66 Q86 -66 86 -44 L86 -4 Q86 16 60 16 L20 16 L-6 44 L-8 16 L-60 16 Q-86 16 -86 -4Z" fill="#fff" stroke="#2a2f5a" stroke-width="6" stroke-linejoin="round"/><text y="-8" text-anchor="middle" font-size="46" font-weight="700" font-family="Fredoka,sans-serif" fill="#2a2f5a">shhh...</text></g>`, fx: `<text data-r="slow" text-anchor="middle" font-size="50" font-weight="700" font-family="Fredoka,sans-serif" fill="#fff" stroke="#14529a" stroke-width="8" paint-order="stroke">sloooow...</text>` };
    },
    frame(t, P, R) {
      const ph = t / 1.0, si = Math.floor(ph), f = ph - si, left = si % 2 === 0, lift = Math.sin(Math.PI * f);
      P.ox = -150 + 300 * clamp(t / 6); P.oy = -12 * lift; P.tilt = (left ? -1 : 1) * 4.5 * lift;
      if (left) P.fl = [405 + 22 * lift, 512 - 40 * lift]; else P.fr = [495 + 22 * lift, 512 - 40 * lift];
      P.R = [470, 336 + 3 * Math.sin(t * 5)]; P.bowR = 20; P.L = [258, 410 + 22 * Math.sin(Math.PI * ph)]; P.bowL = 26;
      P.look = [12 * Math.sin(t * 2.5), 0]; P.brow = -7; P.mouth = "o"; P.mo = 0.2; P.head += 4 * (left ? -1 : 1) * lift;
      setT(R.sign, 760, 150, 6 * Math.sin(t * 3), 1 + 0.04 * Math.sin(t * 5)); setT(R.shh, 628, 166, 4 * Math.sin(t * 4), 0.56 + 0.04 * Math.sin(t * 7));
      setT(R.slow, 450 + P.ox, 40, 3 * Math.sin(t * 2), 1);
    }, beats: {} };

  /* --- 8 break (beanbag + juice box) --- */
  MODES.break = {
    build() {
      const bag = `<path d="M232 552 C226 500 316 484 450 484 C584 484 674 500 668 552 C664 590 560 600 450 600 C340 600 236 590 232 552Z" fill="url(#tpBag)"/><path d="M290 506 Q450 488 610 506" stroke="#fff" stroke-width="5" fill="none" opacity=".35" stroke-linecap="round"/><path d="M300 560 Q450 580 600 560" stroke="#6a3fcf" stroke-width="4" fill="none" stroke-dasharray="14 10"/>` + TC.seal(600, 540, 13, 8);
      const foot = (k, x) => `<g data-r="bf${k}"><ellipse rx="48" ry="23" fill="url(#tpOr)"/><ellipse cx="-12" cy="-8" rx="20" ry="6" fill="#fff" opacity=".5"/></g>`;
      let nt = ""; for (let i = 0; i < 4; i++) nt += `<text data-r="nt${i}" text-anchor="middle" font-size="64" font-weight="700" fill="${["#ff5fa2", "#fff", "#ffd23d", "#8fdcff"][i]}" stroke="#0a1633" stroke-width="5" paint-order="stroke">♪</text>`;
      return { front: bag + foot(0) + foot(1), held: `<g data-r="juice"><image href="${TC.art("tpr-juice")}" x="-50" y="-110" width="108" height="171"/></g>`, fx: nt };
    },
    frame(t, P, R) {
      const u = (t % 2) / 2, sip = 0.5 - 0.5 * Math.cos(u * TAU * 2), tap = Math.sin(t * TAU * 2);
      P.oy = 16; P.feet = false; P.shades = true; P.tilt = 2 * Math.sin(t * TAU * 0.5);
      P.R = [lerp(584, 528, sip), lerp(450, 398, sip)]; P.bowR = 24; P.L = [330 + 4 * tap, 470]; P.bowL = 30;
      setT(R.juice, P.R[0], P.R[1], lerp(8, -14, sip), 1);
      P.mouth = sip > 0.7 ? "o" : "smile"; P.mo = 0.3; P.eyes = "happy"; P.head += 5 * Math.sin(t * TAU * 0.5) - 4 * sip;
      setT(R.bf0, 398, 552, 8 * tap, 1); setT(R.bf1, 502, 552, -8 * tap, 1);
      R.all("nt").forEach((n, i) => { const ph = (t * 0.45 + i / 4) % 1; setT(n, 650 + (i % 2) * 70 + 22 * Math.sin(ph * TAU * 1.5), 330 - ph * 230, 12 * Math.sin(ph * 9), 0.7 + 0.5 * (1 - ph)); n.style.opacity = (ph < 0.15 ? ph / 0.15 : 1 - Math.max(0, ph - 0.7) / 0.3).toFixed(2); });
    }, beats: {} };

  /* --- finale: quiet time (sleep) and the BANG (wake) --- */
  MODES.sleep = {
    build() { let z = ""; [60, 46, 34].forEach((sz, i) => { z += `<text data-r="z${i}" font-size="${sz}" font-weight="700" font-family="Fredoka,sans-serif" fill="#e3efff" stroke="#3a56b8" stroke-width="6" paint-order="stroke" text-anchor="middle">${i === 0 ? "Z" : "z"}</text>`; }); return { fx: z }; },
    frame(t, P, R) {
      const br = Math.sin(t * TAU * 0.28);
      P.eyes = "closed"; P.hat = true; P.hatT = [0, 0, 0]; P.head = 13 + 2.5 * br; P.hdy = 8; P.tilt = 2.5 * Math.sin(t * TAU * 0.18); P.oy = 2 + 3 * br; P.sy = 1 + 0.018 * br;
      P.mouth = "o"; P.mo = 0.4 + 0.3 * (0.5 + 0.5 * br); P.bubble = 6 + 24 * (0.5 + 0.5 * br); P.L = [412, 452]; P.R = [488, 456]; P.bowL = P.bowR = 36; P.ant = 6 * Math.sin(t * 0.8) + 12;
      R.all("z").forEach((z, i) => { const ph = (t * 0.32 + i / 3) % 1; setT(z, 560 + ph * 90 + 10 * Math.sin(ph * 8), 190 - ph * 140, 0, 0.6 + 0.6 * ph); z.style.opacity = (ph < 0.2 ? ph / 0.2 : 1 - Math.max(0, ph - 0.65) / 0.35).toFixed(2); });
    } };
  MODES.wake = {
    build() { let r = ""; for (let i = 0; i < 12; i++) r += `<line data-r="ry${i}" stroke="${i % 2 ? "#ffd23d" : "#fff"}" stroke-width="10" stroke-linecap="round"/>`; return { back: "", fx: r + `<g data-r="wk" opacity="0"><polygon points="${burstPts(14, 120, 76)}" fill="#ffd23d" stroke="#fff" stroke-width="7"/><text y="18" text-anchor="middle" font-size="62" font-weight="700" font-family="Fredoka,sans-serif" fill="#e0272b" stroke="#fff" stroke-width="4" paint-order="stroke">WAKE UP!</text></g>` }; },
    frame(t, P, R) {
      const sq = t < 0.22 ? easeIO(t / 0.22) : 0, jt = clamp((t - 0.22) / 0.9), jump = Math.sin(Math.PI * jt) * 190, land = t > 1.15 ? Math.abs(Math.sin((t - 1.15) * 9)) * 30 * Math.exp(-(t - 1.15) * 0.7) : 0;
      P.sy = 1 - 0.2 * sq + (jt > 0 && jt < 1 ? 0.1 : 0); P.sx = 1 + 0.14 * sq - (jt > 0 && jt < 1 ? 0.05 : 0); P.oy = -jump - land; P.L = [286, 184]; P.R = [614, 184]; P.bowL = P.bowR = 14;
      P.eyes = "wide"; P.look = [0, -4]; P.mouth = "open"; P.mo = 1; P.brow = 12; P.ant = 30 * Math.sin(t * 20); P.head = 5 * Math.sin(t * 16); P.tilt = 3 * Math.sin(t * 13);
      P.hat = t < 1.6; P.hatT = [t * 90, -t * 520 + 700 * t * t * 0.55, t * 360]; P.fl = [405, 512 - (jt > 0 && jt < 1 ? 26 : 0)]; P.fr = [495, 512 - (jt > 0 && jt < 1 ? 26 : 0)]; P.shadow = 1 - 0.4 * (jump / 190);
      R.all("ry").forEach((l, i) => { const a = (i / 12) * TAU + 0.2, p = (t * 3 + i * 0.13) % 1, r0 = 130 + 30 * p, r1 = r0 + 40 + 26 * (1 - p), cx = 450, cy = 250 + P.oy; l.setAttribute("x1", f1(cx + Math.cos(a) * r0 * 1.15)); l.setAttribute("y1", f1(cy + Math.sin(a) * r0)); l.setAttribute("x2", f1(cx + Math.cos(a) * r1 * 1.15)); l.setAttribute("y2", f1(cy + Math.sin(a) * r1)); l.style.opacity = (t < 3.2 ? 0.95 * (1 - p * 0.6) : 0).toFixed(2); });
      R.wk.setAttribute("opacity", (t > 0.1 && t < 1.7 ? 1 - seg(t, 1.3, 1.7) : 0).toFixed(2)); setT(R.wk, 450, 58, -4 * Math.sin(t * 10), 0.3 + 0.9 * backOut(clamp((t - 0.1) / 0.45)));
    } };

  /* ---------- the animation loop ---------- */
  let layersEl = null, cur = null, R = {};
  function clearProps() { ["back", "front", "held", "fx"].forEach((k) => { if (E[k]) E[k].innerHTML = ""; }); R = {}; cur = null; }
  function setMode(name) {
    clearProps(); mode = name; MODE = MODES[name]; T0 = performance.now(); lastBeat = -1; lastLoop = -1; bangAt = 0;
    if (MODE.build) { const b = MODE.build(); ["back", "front", "held", "fx"].forEach((k) => { if (b[k]) E[k].innerHTML = b[k]; }); R = Object.assign({}, refsOf(E.back), refsOf(E.front), refsOf(E.held), refsOf(E.fx)); R.all = (p) => Object.keys(R).filter((k) => k.startsWith(p) && /^\d+$/.test(k.slice(p.length))).sort((a, b) => +a.slice(p.length) - +b.slice(p.length)).map((k) => R[k]); if (MODE.init) MODE.init(R); }
    E.svg.style.transform = "";
  }
  function pulseRing(strong) { const pl = ring.querySelector(".pl"); if (pl) { pl.style.transition = "none"; pl.style.transform = `scale(${strong ? 1.5 : 1.25})`; requestAnimationFrame(() => { pl.style.transition = "transform .35s ease-out"; pl.style.transform = "scale(1)"; }); } }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!root || !root.isConnected) return;
    const t = (now - T0) / 1000, P = basePose(now / 1000);
    if (MODE && MODE.frame) MODE.frame(ACTION_IDS.includes(mode) ? Math.min(t, 6.05) : t, P, R);
    apply(P);
    // screen shake after the door bang
    if (bangAt) { const a = (now - bangAt) / 1000; E.svg.style.transform = a < 0.35 ? `translate(${f1(Math.sin(a * 90) * 9 * (1 - a / 0.35))}px,${f1(Math.cos(a * 70) * 6 * (1 - a / 0.35))}px)` : ""; if (a > 0.4) bangAt = 0; }
    if (ACTION_IDS.includes(mode) && active) {
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
  const ACTION_IDS = ["wash", "clean", "brush", "mask", "door", "hurry", "walk", "break"];
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
    for (let i = 0; i < 46; i++) { const x = (i * 337) % 1500 + 40, y = 20 + ((i * 211) % 520), sz = 7 + (i % 5) * 4; s += `<path class="star" style="animation-delay:${((i * 0.37) % 2.4).toFixed(2)}s" transform="translate(${x} ${y}) scale(${sz})" d="${STAR4}" fill="${i % 3 ? "#fff" : "#ffe58a"}"/>`; }
    s += `<g class="moon"><circle cx="1330" cy="280" r="120" fill="#fff6c0" opacity=".18"/><circle cx="1330" cy="280" r="96" fill="url(#tkMoon)"/><circle cx="1366" cy="262" r="86" fill="#0f1a52" opacity=".0"/>`
      + `<circle cx="1296" cy="262" r="12" fill="#e8d98a" opacity=".7"/><circle cx="1358" cy="320" r="16" fill="#e8d98a" opacity=".6"/><circle cx="1380" cy="244" r="8" fill="#e8d98a" opacity=".6"/>`
      + `<path d="M1300 286 Q1316 300 1332 286 M1340 286 Q1356 300 1372 286" stroke="#7a6a2a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M1318 306 Q1336 324 1354 306" stroke="#7a6a2a" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="1292" cy="302" rx="12" ry="7" fill="#ff9ac2" opacity=".5"/><ellipse cx="1376" cy="302" rx="12" ry="7" fill="#ff9ac2" opacity=".5"/>` + TC.seal(1330, 358, 11, 0) + `</g></svg>`;
    return s;
  }
  function bannerHTML(x, kind) {
    const w = x.w ? new RegExp("\\b(" + String(x.w).replace(/[^a-z]/gi, "") + ")\\b", "i") : null;
    const hi = (txt) => { const e = esc(txt); return w ? e.replace(w, '<b class="k">$1</b>') : e; };
    let chip = `<span class="chip">Ollie says <span class="zh">歐力說</span></span>`;
    if (kind === "nosay") chip = `<span class="chip no">Ollie didn't say! <span class="zh">歐力沒有說！</span></span>`;
    if (kind === "quiet") chip = `<span class="chip">Shhh... <span class="zh">安靜</span></span>`;
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
  function setRing(kind, label) {
    ring.classList.toggle("big", kind === "big");
    ring.querySelector(".lbl").innerHTML = label || "";
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
    const lv2 = api.level >= 2;
    const el = h("div", { class: "title", html: `<div class="t1">Ollie <span>Says</span></div><div class="t2">歐力說</div><div><span class="t3">Do what Ollie does!　跟著歐力一起做動作！</span>${lv2 ? `<span class="t4">If Ollie doesn't say it, FREEZE! 歐力沒說就定住！</span>` : ""}</div>` });
    root.append(el); temp.push(el);
    setMode("title"); TC.sfx("fanfare");
    await TC.waitAction(2300);
    el.remove();
  }

  async function oneRound(api, x, twist) {
    setMode("ready"); showBanner(x, twist ? "nosay" : "says"); hideRing();
    if (twist) nosay.classList.add("show");
    talking = true; await raceSkip(TC.teacherLine(x.say)); talking = false;
    if (api.aborted) return false;
    if (twist) {
      setMode("freeze"); active = true; setRing("freeze", "Freeze!<br><span class='zh'>定住不要動</span>");
      await TC.waitAction(4200); active = false;
      if (api.aborted) return false;
      nosay.classList.remove("show");
      setMode("laugh"); hideRing(); TC.sfx("fanfare"); TC.confetti(70);
      await TC.waitAction(1800);
    } else {
      setMode(x.id); active = true; setRing("act", "Do it with Ollie!<br><span class='zh'>跟歐力一起做</span>");
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
    setRing("big", "Eyes closed!<br><span class='zh'>閉上眼睛，不要動</span>"); cdBig = true; cdStart = performance.now();
    await TC.waitAction(6000); cdBig = false; cdStart = 0;
    if (api.aborted) return false;
    // BANG: ONE flash, a loud alarm, Ollie springs up
    stopAudio(); hideRing();
    const fl = h("div", { class: "tpr-flash" }); document.body.append(fl); temp.push(fl); fl.addEventListener("animationend", () => fl.remove());
    alarm(); root.classList.add("sizzle"); root.classList.remove("night"); void root.offsetWidth;
    setMode("wake"); showBanner(Wk, "wake"); TC.confetti(260); TC.confetti(120, ["#ffd23d", "#fff", "#ff5fa2"]);
    await raceSkip(TC.speak(Wk.say));
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
      root.classList.remove("night", "sizzle", "playing");
      if (ban) { ban.classList.remove("show", "muted"); } if (ring) { ring.classList.remove("show", "big"); } if (nosay) nosay.classList.remove("show");
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
      root.innerHTML = bgSVG() + `<div class="dim"></div>` + sceneSVG() + `<div class="sky">${skyHTML()}</div>`;
      ring = h("div", { class: "ring", html: `<svg viewBox="0 0 200 200"><circle class="tr" cx="100" cy="100" r="86"/><circle class="pl" cx="100" cy="100" r="58"/><circle class="pr" cx="100" cy="100" r="86" transform="rotate(-90 100 100)"/><text class="num" x="100" y="128" text-anchor="middle">1</text></svg><div class="dots"><i></i><i></i><i></i></div><div class="lbl zh"></div>` });
      ban = h("div", { class: "ban" });
      nosay = h("div", { class: "nosay", html: `<b>Ollie didn't say!</b><span class="zh">歐力沒有說！不要動！</span>` });
      nextBtn = h("button", { class: "next zh", onpointerdown: (e) => { e.stopPropagation(); skipNow(); } }, "⏭ 下一步");
      root.append(ring, ban, nosay, nextBtn);
      api.stage.append(root);
      // cache Ollie's moving parts
      const names = ["svg", "shadow", "back", "front", "held", "fx", "body", "arms", "head", "ant", "eOpen", "eHappy", "eClosed", "pupils", "browL", "browR", "mSmile", "mOpen", "mO", "mGrim", "mTeeth", "snore", "shades", "hat", "legs", "wheel", "fL", "fR", "lgL", "lgR", "aLb", "aLm", "aLh", "aRb", "aRm", "aRh", "mL", "mR"];
      E = {}; E.svg = root.querySelector("svg.scene"); names.forEach((n) => { if (n !== "svg") E[n] = Q(n); });
      E.whAll = [...root.querySelectorAll('[data-r="wh"]')]; E.puAll = [...root.querySelectorAll('[data-r="pu"]')];
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
        if (api.level === 3 && n >= 3) { const c = shuffle([1, 2, 3, 4].filter((i) => i < n)); twist.add(c[0]); const o = c.find((i) => Math.abs(i - c[0]) > 1); if (o != null && n >= 5) twist.add(o); }
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
