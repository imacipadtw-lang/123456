/* Gate 4 · Sound Monsters 音節怪獸 — phonics (letters & first sounds)
   A hungry, glossy 3D monster with a giant letter on its belly eats ONLY the pictures whose word starts with that letter sound.
   Tap the cards (a wrong tap is never punished), then "What is it?" with the last picture eaten, then the monster burps a rainbow.
   Finale: every monster lines up, grows and dances while the letters rain down.  (passport (4)-(7) words) */
(function () {
  "use strict";
  const TC = window.TC;
  TC.games = TC.games || {};
  const h = TC.h;

  /* =====================================================================
     1 · twelve-and-two original pictures (the 14 passport things), drawn in code
     ===================================================================== */
  const A = TC.ART, SEAL = TC.SEAL;
  const star4 = (x, y, r, col) => { const k = +(r * 0.22).toFixed(1); return `<path d="M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r}Z" fill="${col || "#fff6a8"}" stroke="#ffb020" stroke-width="1.4" stroke-linejoin="round"/>`; };

  // water — a drinking glass with a happy drop falling in
  A["p-water"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 192, 58, 8);
    s += c.path("M100 4 C113 22 123 32 123 45 C123 57 113 64 100 64 C87 64 77 57 77 45 C77 32 87 22 100 4Z", "#46bfff");
    s += c.hl(90, 40, 7, 13, 15, 0.9) + c.eyes(102, 47, 9, 4.2) + c.smile(102, 54, 5);
    s += `<path d="M46 80 L154 80 L140 178 Q138 190 126 190 L74 190 Q62 190 60 178Z" fill="${c.v("#f6fcff", "#cdeaf8")}" stroke="#9fd0ea" stroke-width="4" stroke-linejoin="round"/>`;
    s += `<path d="M51 114 Q75 104 100 114 T149 114 L140 178 Q138 190 126 190 L74 190 Q62 190 60 178Z" fill="${c.v("#86dcff", "#2a86e0")}"/>`;
    s += `<path d="M51 114 Q75 104 100 114 T149 114" stroke="#e2f7ff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    s += `<ellipse cx="100" cy="80" rx="54" ry="9" fill="#eefaff" stroke="#9fd0ea" stroke-width="4"/>`;
    s += `<g fill="#fff" opacity=".6"><circle cx="76" cy="146" r="5"/><circle cx="118" cy="132" r="4"/><circle cx="90" cy="170" r="3.5"/><circle cx="124" cy="164" r="5"/></g>`;
    s += `<path d="M58 92 L66 172" stroke="#fff" stroke-width="7" opacity=".7" stroke-linecap="round"/>`;
    s += `<path d="M30 52 q6 9 6 13 a6 6 0 0 1 -12 0 q0 -4 6 -13z M172 48 q5 8 5 12 a5 5 0 0 1 -10 0 q0 -4 5 -12z" fill="#6fd0ff" stroke="#2a86e0" stroke-width="1.5"/>`;
    return c.out(s);
  };
  SEAL["p-water"] = [100, 152, 14];

  // window — wooden frame, sun, cloud, green hills, a sill
  A["p-window"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 194, 74, 6);
    s += `<rect x="22" y="8" width="156" height="166" rx="14" fill="${c.g("#d79a58")}"/>`;
    const pane = (x, y) => `<rect x="${x}" y="${y}" width="64" height="70" rx="6" fill="${c.v("#c9efff", "#62b8ee")}"/>`;
    s += pane(32, 18) + pane(104, 18) + pane(32, 96) + pane(104, 96);
    let rays = ""; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; rays += `M${(58 + Math.cos(a) * 19).toFixed(1)} ${(44 + Math.sin(a) * 19).toFixed(1)} L${(58 + Math.cos(a) * 25).toFixed(1)} ${(44 + Math.sin(a) * 25).toFixed(1)} `; }
    s += `<path d="${rays}" stroke="#ffb020" stroke-width="4" stroke-linecap="round"/>` + c.sphere(58, 44, 14, "#ffd21f");
    s += c.sphere(126, 56, 10, "#fff", 0.3) + c.sphere(141, 49, 13, "#fff", 0.3) + c.sphere(155, 57, 9, "#fff", 0.3) + `<rect x="120" y="56" width="42" height="10" rx="5" fill="#f4f8ff"/>`;
    s += `<path d="M32 166 L32 142 Q60 116 96 140 L96 166Z" fill="${c.v("#7fe07a", "#3fae4a")}"/><path d="M104 166 L104 138 Q140 112 168 142 L168 166Z" fill="${c.v("#7fe07a", "#3fae4a")}"/>`;
    s += `<path d="M38 24 L58 24 L38 62Z M110 24 L130 24 L110 62Z M38 102 L58 102 L38 140Z M110 102 L130 102 L110 140Z" fill="#fff" opacity=".35"/>`;
    s += c.hl(80, 14, 44, 5, 0, 0.7);
    s += `<rect x="10" y="170" width="180" height="22" rx="9" fill="${c.g("#ecb97d")}"/><rect x="10" y="184" width="180" height="8" rx="4" fill="#b9803f" opacity=".35"/>`;
    return c.out(s);
  };
  SEAL["p-window"] = [50, 181, 11];

  // table — a wooden classroom table seen from the front-top
  A["p-table"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 194, 86, 8);
    const leg = (x, y, w, hh) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="5" fill="${c.v("#a86a36", "#6a3f1c")}"/>`;
    s += leg(48, 90, 12, 80) + leg(140, 90, 12, 80) + leg(20, 126, 17, 62) + leg(163, 126, 17, 62);
    s += `<path d="M14 118 L186 118 L186 136 Q186 142 180 142 L20 142 Q14 142 14 136Z" fill="${c.g("#c98a4f")}"/>`;
    s += `<path d="M50 62 L150 62 Q158 62 162 70 L186 118 L14 118 L38 70 Q42 62 50 62Z" fill="${c.g("#f6cf92")}"/>`;
    s += `<g fill="none" stroke="#d9a55c" stroke-width="2.4" stroke-linecap="round" opacity=".8"><path d="M44 84 Q100 76 156 84"/><path d="M30 102 Q100 92 170 102"/><path d="M70 72 Q100 68 130 72"/></g>`;
    s += c.hl(86, 76, 46, 8, -6, 0.75) + `<rect x="14" y="116" width="172" height="5" fill="#fff" opacity=".35"/>`;
    return c.out(s);
  };
  SEAL["p-table"] = [100, 94, 12];

  // teeth — a big clean smile, every tooth shining
  A["p-teeth"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 186, 72, 7);
    s += `<path d="M8 104 Q36 50 100 54 Q164 50 192 104 Q168 162 100 162 Q32 162 8 104Z" fill="${c.g("#ff5470")}"/>`;
    s += `<path d="M30 100 Q100 76 170 100 Q154 148 100 150 Q46 148 30 100Z" fill="${c.v("#7a1530", "#450a1a")}"/>`;
    const tooth = (x, y, w, hh) => `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${hh}" rx="7" fill="${c.v("#ffffff", "#dde8f6")}" stroke="#bccce2" stroke-width="1.6"/><rect x="${(x + 3).toFixed(1)}" y="${(y + 3).toFixed(1)}" width="3.4" height="${hh - 9}" rx="1.7" fill="#fff" opacity=".85"/>`;
    for (let i = 0; i < 6; i++) { const t = (i - 2.5) / 2.5; s += tooth(42 + i * 19.5, 88 + 10 * t * t, 18, 26); }
    for (let i = 0; i < 5; i++) { const t = (i - 2) / 2; s += tooth(51.5 + i * 19.5, 120 + 5 * t * t, 17, 24); }
    s += c.hl(66, 68, 40, 9, -12, 0.85) + star4(162, 70, 11) + star4(38, 78, 7);
    return c.out(s);
  };
  SEAL["p-teeth"] = [174, 116, 11];

  // lunchbox — a bento box with two clasps and a cheerful face
  A["p-lunchbox"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 192, 74, 8);
    s += `<path d="M62 62 L62 40 Q62 26 76 26 L124 26 Q138 26 138 40 L138 62" stroke="#7a8397" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M68 60 L68 42 Q68 32 78 32 L122 32" stroke="#c9d3e8" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    s += `<rect x="20" y="56" width="160" height="126" rx="24" fill="${c.g("#ff6fa5")}"/>`;
    s += `<path d="M20 82 Q20 56 46 56 L154 56 Q180 56 180 82 L180 102 L20 102Z" fill="${c.g("#ffa3c8")}"/><rect x="20" y="100" width="160" height="6" fill="#b8265f" opacity=".45"/>`;
    s += `<rect x="46" y="90" width="28" height="28" rx="8" fill="${c.g("#ffd21f")}"/><rect x="126" y="90" width="28" height="28" rx="8" fill="${c.g("#ffd21f")}"/><circle cx="60" cy="104" r="4" fill="#b8740a"/><circle cx="140" cy="104" r="4" fill="#b8740a"/>`;
    s += c.eyes(100, 134, 21, 8.5) + c.smile(100, 151, 9) + c.blush(100, 148, 36);
    s += c.hl(66, 70, 40, 7, 0, 0.8) + c.hl(40, 150, 6, 20, 0, 0.5);
    return c.out(s);
  };
  SEAL["p-lunchbox"] = [158, 164, 11];

  // light — a glowing bulb with a face and a screw base
  A["p-light"] = () => {
    const c = TC.ArtCtx(); let s = "";
    s += `<defs><radialGradient id="bulbglow"><stop offset="0" stop-color="#fff59a" stop-opacity=".95"/><stop offset=".55" stop-color="#ffe45c" stop-opacity=".38"/><stop offset="1" stop-color="#ffe45c" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="78" r="98" fill="url(#bulbglow)"/>`;
    let rays = ""; for (let i = 0; i < 11; i++) { const a = (-200 + i * 22) * Math.PI / 180; rays += `M${(100 + Math.cos(a) * 66).toFixed(1)} ${(76 + Math.sin(a) * 66).toFixed(1)} L${(100 + Math.cos(a) * 84).toFixed(1)} ${(76 + Math.sin(a) * 84).toFixed(1)} `; }
    s += `<path d="${rays}" stroke="#ffb41f" stroke-width="6" stroke-linecap="round"/>`;
    s += c.path("M70 126 Q46 102 46 74 A54 54 0 0 1 154 74 Q154 102 130 126 L130 136 L70 136Z", "#ffe96b");
    s += `<path d="M88 136 L90 114 Q94 102 100 114 Q106 102 110 114 L112 136" stroke="#c97a10" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += c.eyes(100, 68, 20, 7.5) + c.smile(100, 84, 8) + c.blush(100, 82, 34, "#ff9a4a") + c.hl(74, 48, 16, 26, 25, 0.9);
    const ridge = (x, y, w, hh) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="6" fill="${c.v("#f1f5fc", "#8892b4")}"/>`;
    s += ridge(66, 134, 68, 14) + ridge(68, 148, 64, 14) + ridge(72, 162, 56, 14) + `<path d="M88 176 L112 176 L106 190 L94 190Z" fill="#3a3f5c"/>`;
    return c.out(s);
  };
  SEAL["p-light"] = [100, 155, 10];

  // door — a wooden classroom door with a window and a golden knob
  A["p-door"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 195, 64, 6);
    s += `<rect x="32" y="6" width="136" height="188" rx="10" fill="${c.g("#8a5a32")}"/><rect x="42" y="14" width="116" height="180" rx="6" fill="${c.g("#e8a860")}"/>`;
    s += `<rect x="54" y="26" width="92" height="74" rx="8" fill="${c.v("#c9efff", "#62b8ee")}" stroke="#b9803f" stroke-width="5"/><path d="M100 26 V100 M54 63 H146" stroke="#b9803f" stroke-width="5"/>`;
    s += `<path d="M60 32 L80 32 L60 66Z" fill="#fff" opacity=".4"/>` + c.sphere(122, 44, 8, "#ffd21f");
    s += `<rect x="54" y="114" width="92" height="68" rx="8" fill="${c.g("#f2bd78")}" stroke="#b9803f" stroke-width="5"/>`;
    s += `<rect x="36" y="34" width="9" height="22" rx="3" fill="#8a94b8"/><rect x="36" y="150" width="9" height="22" rx="3" fill="#8a94b8"/>`;
    s += `<rect x="144" y="98" width="12" height="28" rx="6" fill="${c.g("#ffd21f")}"/>` + c.sphere(137, 108, 9, "#ffc01f");
    s += c.hl(66, 20, 30, 4, 0, 0.6);
    return c.out(s);
  };
  SEAL["p-door"] = [100, 148, 15];

  // drink — a cup of orange juice with a lid and a striped straw
  A["p-drink"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 194, 54, 7);
    const straw = "M104 66 L118 20 Q121 10 131 10 L164 10";
    s += `<path d="${straw}" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${straw}" stroke="#ff4b55" stroke-width="12" fill="none" stroke-dasharray="9 9" stroke-linejoin="round"/>`;
    s += `<path d="M50 86 L150 86 L136 182 Q135 192 124 192 L76 192 Q65 192 64 182Z" fill="${c.v("#ffb347", "#ff7a1a")}"/>`;
    s += c.eyes(100, 110, 19, 7) + c.smile(100, 123, 8) + c.blush(100, 122, 32);
    s += `<path d="M58 138 L142 138 L140 154 L60 154Z" fill="#fff" opacity=".92"/><g fill="#ff4b55"><path d="M64 138 L74 138 L69 154 L59 154Z M86 138 L96 138 L91 154 L81 154Z M108 138 L118 138 L113 154 L103 154Z M130 138 L140 138 L135 154 L125 154Z"/></g>`;
    s += `<path d="M58 90 L66 180" stroke="#fff" stroke-width="6" opacity=".55" stroke-linecap="round"/>`;
    s += `<path d="M54 80 Q54 54 100 52 Q146 54 146 80Z" fill="#e8f6ff" opacity=".9" stroke="#bfe0f2" stroke-width="3"/><rect x="44" y="76" width="112" height="14" rx="7" fill="${c.g("#ffffff")}"/>`;
    return c.out(s);
  };
  SEAL["p-drink"] = [100, 172, 10];

  // book — a thick blue storybook with a star label and a red ribbon
  A["p-book"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 194, 76, 8);
    s += `<rect x="40" y="22" width="138" height="160" rx="10" fill="#fdf3d8" stroke="#e6d4a0" stroke-width="3"/><g stroke="#e6d4a0" stroke-width="2"><path d="M166 40 V170 M171 40 V170"/></g>`;
    s += `<rect x="22" y="10" width="140" height="164" rx="12" fill="${c.g("#3d8bff")}"/><rect x="22" y="10" width="26" height="164" rx="12" fill="${c.g("#2a63d0")}"/>`;
    s += `<g stroke="#9fc4ff" stroke-width="2.4" stroke-dasharray="6 6"><path d="M52 18 V166"/></g>`;
    s += `<rect x="60" y="30" width="88" height="58" rx="12" fill="#fff6d0" stroke="#e8b84a" stroke-width="3"/>` + `<path d="M104 38 l7 15 l16 2 l-12 11 l3 16 l-14 -8 l-14 8 l3 -16 l-12 -11 l16 -2z" fill="#ffc83d" stroke="#e8a21a" stroke-width="2" stroke-linejoin="round"/>`;
    s += c.eyes(106, 114, 18, 7.5) + c.smile(106, 128, 8) + c.blush(106, 126, 34);
    s += `<path d="M122 170 L122 196 L131 187 L140 196 L140 170Z" fill="#ff4b55"/>` + c.hl(84, 22, 44, 5, 0, 0.7);
    return c.out(s);
  };
  SEAL["p-book"] = [132, 152, 12];

  // brush — a toothbrush with colourful bristles, toothpaste and bubbles
  A["p-brush"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 194, 66, 6);
    let g = `<rect x="10" y="88" width="126" height="26" rx="13" fill="${c.g("#ff5fa2")}"/><rect x="30" y="95" width="56" height="12" rx="6" fill="#c93a7a" opacity=".55"/>`;
    g += `<path d="M130 94 L150 98 L150 104 L130 108Z" fill="#e0508f"/><rect x="146" y="82" width="46" height="34" rx="12" fill="${c.g("#8fdcff")}"/>`;
    for (let i = 0; i < 5; i++) g += `<rect x="${152 + i * 8.5}" y="56" width="6.6" height="28" rx="3.3" fill="${i % 2 ? "#4cc9ff" : "#ffffff"}" stroke="#9fc4e8" stroke-width="1"/>`;
    g += `<path d="M148 62 Q152 42 164 52 Q170 38 182 50 Q194 46 192 62 Q182 72 170 62 Q160 74 148 62Z" fill="#ffffff" stroke="#bfe0ff" stroke-width="2"/><path d="M156 58 Q168 48 184 56" stroke="#ff5a5a" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    s += `<g transform="rotate(-32 100 100)">${g}</g>`;
    s += c.sphere(52, 40, 11, "#bfe9ff", 0.9) + c.sphere(30, 70, 7, "#bfe9ff", 0.9) + c.sphere(78, 22, 7, "#bfe9ff", 0.9) + c.sphere(22, 112, 5, "#bfe9ff", 0.9);
    return c.out(s);
  };
  SEAL["p-brush"] = [68, 121, 12, -32];

  // fan — a pedestal fan with a cage and three coloured blades
  A["p-fan"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 194, 56, 7);
    s += `<ellipse cx="100" cy="182" rx="52" ry="12" fill="${c.g("#5a6aa8")}"/><rect x="92" y="140" width="16" height="46" rx="6" fill="${c.g("#8a94c8")}"/>`;
    s += `<circle cx="100" cy="84" r="66" fill="#eaf6ff" opacity=".4"/>`;
    ["#ff6fa5", "#4cc9ff", "#ffd21f"].forEach((col, i) => { s += `<g transform="rotate(${i * 120} 100 84)"><path d="M100 84 C82 62 80 30 100 20 C120 30 118 62 100 84Z" fill="${c.g(col)}"/></g>`; });
    let sp = ""; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; sp += `M${(100 + Math.cos(a) * 20).toFixed(1)} ${(84 + Math.sin(a) * 20).toFixed(1)} L${(100 + Math.cos(a) * 66).toFixed(1)} ${(84 + Math.sin(a) * 66).toFixed(1)} `; }
    s += `<g fill="none" stroke="#7a86b8" stroke-width="3" stroke-linecap="round"><path d="${sp}" stroke-width="2.4" opacity=".8"/><circle cx="100" cy="84" r="66" stroke-width="5"/><circle cx="100" cy="84" r="46"/><circle cx="100" cy="84" r="27"/></g>`;
    s += c.sphere(100, 84, 17, "#ffd21f") + c.hl(70, 40, 20, 8, -30, 0.5);
    return c.out(s);
  };
  SEAL["p-fan"] = [100, 84, 10];

  // hands — two soapy hands being washed, with sleeves and bubbles
  A["p-hands"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 196, 70, 6), sk = "#ffd3a8";
    s += `<path d="M34 138 L96 138 L100 200 L28 200Z" fill="${c.g("#4cc9ff")}"/><path d="M104 138 L166 138 L172 200 L100 200Z" fill="${c.g("#4cc9ff")}"/>`;
    s += `<path d="M34 138 L96 138 L97 150 L33 150Z M104 138 L166 138 L167 150 L103 150Z" fill="#fff" opacity=".9"/>`;
    const hand = (x, y, rot, flip) => {
      let g = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${flip ? -1 : 1} 1)">`;
      [[-22, -38, 9, 24, -8], [-8, -48, 9, 28, -3], [7, -48, 9, 28, 3], [21, -38, 8.5, 24, 8]].forEach((f) => { g += c.ell(f[0], f[1], f[2], f[3], sk, f[4], 0.5); });
      g += c.ell(-33, -2, 9, 20, sk, -48, 0.5) + c.ell(0, 0, 28, 30, sk, 0, 0.6);
      return g + `</g>`;
    };
    s += hand(64, 112, -10, false) + hand(136, 112, 10, true);
    [[64, 98, 16], [44, 82, 11], [86, 84, 10], [136, 98, 16], [156, 80, 11], [116, 86, 9], [100, 66, 12], [100, 122, 9]].forEach(([x, y, r]) => { s += c.sphere(x, y, r, "#ffffff", 0.85); });
    s += c.sphere(28, 40, 7, "#bfe9ff", 0.9) + c.sphere(174, 44, 8, "#bfe9ff", 0.9) + c.sphere(100, 26, 10, "#bfe9ff", 0.9);
    return c.out(s);
  };
  SEAL["p-hands"] = [64, 178, 12];

  // mask — a blue face mask with pleats and ear loops
  A["p-mask"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 186, 72, 7);
    s += `<path d="M38 80 C6 72 6 148 38 140" stroke="#e9f2fa" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M162 80 C194 72 194 148 162 140" stroke="#e9f2fa" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    const body = "M34 70 Q100 48 166 70 Q178 118 162 150 Q100 176 38 150 Q22 118 34 70Z";
    s += `<defs><clipPath id="maskclip"><path d="${body}"/></clipPath></defs><path d="${body}" fill="${c.g("#8ad0f2")}"/>`;
    s += `<g clip-path="url(#maskclip)" fill="none">`;
    [94, 116, 138].forEach((y) => { s += `<path d="M20 ${y} Q100 ${y - 18} 180 ${y}" stroke="#4f9fd0" stroke-width="3.4"/><path d="M20 ${y + 4} Q100 ${y - 14} 180 ${y + 4}" stroke="#e2f6ff" stroke-width="3.4" opacity=".9"/>`; });
    s += `</g><path d="M50 66 Q100 53 150 66" stroke="#fff" stroke-width="6" opacity=".85" fill="none" stroke-linecap="round"/>`;
    s += c.hl(72, 86, 38, 9, -10, 0.75) + star4(176, 50, 10) + star4(26, 40, 7);
    return c.out(s);
  };
  SEAL["p-mask"] = [100, 118, 14];

  // nurse — a smiling nurse in mint scrubs with a red-cross cap and a stethoscope
  A["p-nurse"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 198, 62, 7);
    s += `<rect x="88" y="124" width="24" height="26" rx="8" fill="#f0a878"/>`;
    s += c.path("M26 202 Q28 146 100 140 Q172 146 174 202Z", "#5ed6c0");
    s += `<path d="M78 142 L100 172 L122 142Z" fill="#ffffff"/><path d="M74 146 Q66 188 100 188 Q134 188 126 146" stroke="#3a3f5c" stroke-width="5" fill="none" stroke-linecap="round"/>` + c.sphere(100, 190, 8, "#c9d6ff");
    s += c.sphere(100, 86, 54, "#7a4a22", 0.3) + c.sphere(100, 96, 44, "#ffd3a8", 0.6);
    s += c.path("M58 84 Q60 54 100 52 Q140 54 142 84 Q124 68 100 72 Q76 68 58 84Z", "#7a4a22");
    s += c.path("M50 64 Q52 28 100 26 Q148 28 150 64 Q100 50 50 64Z", "#ffffff") + `<g fill="#e8343e"><rect x="95" y="34" width="10" height="19" rx="2"/><rect x="90" y="39" width="20" height="10" rx="2"/></g>`;
    s += c.eyes(100, 100, 17, 7) + c.blush(100, 112, 31) + c.smile(100, 112, 8);
    return c.out(s);
  };
  SEAL["p-nurse"] = [140, 168, 12];

  /* =====================================================================
     2 · the monsters
     ===================================================================== */
  const hex2 = (x) => { const n = parseInt(x.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const toHex = (r, g, b) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const lighten = (x, f) => { const [r, g, b] = hex2(x); return toHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f); };
  const darken = (x, f) => { const [r, g, b] = hex2(x); return toHex(r * (1 - f), g * (1 - f), b * (1 - f)); };
  // one personality per letter: colour, head gear, voice pitch
  const MON = {
    w: { col: "#9b6bff", belly: "#eadfff", deco: "horns", pitch: 1.0 },
    t: { col: "#2ec27e", belly: "#d9ffea", deco: "antenna", pitch: 1.28 },
    l: { col: "#ff9a2e", belly: "#fff1d6", deco: "cyclops", pitch: 0.78 },
    d: { col: "#ff5fa2", belly: "#ffe3ef", deco: "ears", pitch: 1.42 },
    b: { col: "#3d9bff", belly: "#e0f0ff", deco: "fins", pitch: 0.9 }
  };
  const SPARE = ["w", "t", "l", "d", "b"];
  const monOf = (L) => MON[L] || MON[SPARE[(L.charCodeAt(0) || 0) % SPARE.length]];
  const BODY = "M62 302 C16 238 24 120 88 66 C130 30 170 30 212 66 C276 120 284 238 238 302 C220 328 80 328 62 302Z";

  /** the monster as inline SVG; every id is made unique so several monsters can stand side by side */
  function monsterSVG(L, uid) {
    const M = monOf(L), col = M.col, dk = darken(col, 0.35), c = TC.ArtCtx(); let s = c.shadow(150, 331, 110, 12);
    s += c.ell(106, 322, 32, 14, darken(col, 0.2), 0, 0.3) + c.ell(194, 322, 32, 14, darken(col, 0.2), 0, 0.3);
    // head gear behind the body
    if (M.deco === "horns") s += c.path("M82 84 Q42 54 54 6 Q98 22 120 68Z", "#ffe58a") + c.path("M218 84 Q258 54 246 6 Q202 22 180 68Z", "#ffe58a");
    if (M.deco === "antenna") s += c.sphere(56, 104, 24, col) + c.sphere(244, 104, 24, col) + `<circle cx="56" cy="104" r="12" fill="${lighten(col, 0.55)}"/><circle cx="244" cy="104" r="12" fill="${lighten(col, 0.55)}"/><path d="M150 52 Q146 24 170 10" stroke="${dk}" stroke-width="7" fill="none" stroke-linecap="round"/>` + c.sphere(172, 11, 15, "#fff17a");
    if (M.deco === "cyclops") s += c.path("M92 60 L104 12 L124 46 L138 4 L152 44 L172 8 L182 48 L204 18 L208 64Z", "#e8481c");
    if (M.deco === "ears") s += c.path("M64 98 L56 14 L124 56Z", col) + c.flat("M74 82 L72 38 L106 58Z", "#ffc2d9") + c.path("M236 98 L244 14 L176 56Z", col) + c.flat("M226 82 L228 38 L194 58Z", "#ffc2d9");
    if (M.deco === "fins") s += c.path("M122 56 Q136 0 172 -2 Q160 26 180 56Z", dk) + c.path("M84 76 Q66 36 92 22 Q94 50 112 64Z", dk) + c.path("M216 76 Q234 36 208 22 Q206 50 188 64Z", dk) + c.path("M42 168 Q4 160 8 206 Q30 204 46 214Z", dk) + c.path("M258 168 Q296 160 292 206 Q270 204 254 214Z", dk);
    // body
    s += c.path(BODY, col) + `<g fill="#fff" opacity=".22"><circle cx="92" cy="118" r="10"/><circle cx="214" cy="104" r="8"/><circle cx="58" cy="216" r="12"/><circle cx="244" cy="206" r="9"/><circle cx="76" cy="164" r="6"/><circle cx="226" cy="156" r="6"/></g>` + c.hl(104, 90, 54, 26, -28, 0.8);
    // belly + giant letter
    s += `<ellipse class="bglow" cx="150" cy="268" rx="98" ry="62" fill="#fff36b" opacity="0"/>` + c.ell(150, 268, 90, 54, M.belly, 0, 0.55);
    const f = `font-family="Fredoka,'Baloo 2','Arial Rounded MT Bold','Trebuchet MS',Arial,sans-serif" font-weight="700" font-size="84" text-anchor="middle"`;
    s += `<g class="bellyL"><text x="153" y="297" ${f} fill="${darken(col, 0.55)}">${L.toUpperCase()} ${L}</text><text x="150" y="292" ${f} fill="${col}" stroke="#fff" stroke-width="6" paint-order="stroke" stroke-linejoin="round">${L.toUpperCase()} ${L}</text></g>`;
    // tiny arms
    s += `<g class="arm armL">${c.ell(50, 222, 15, 27, darken(col, 0.06), 16, 0.4)}${c.sphere(40, 246, 11, lighten(col, 0.15), 0.5)}</g><g class="arm armR">${c.ell(250, 222, 15, 27, darken(col, 0.06), -16, 0.4)}${c.sphere(260, 246, 11, lighten(col, 0.15), 0.5)}</g>`;
    // face
    s += `<g class="face"><ellipse cx="64" cy="152" rx="15" ry="10" fill="#ff7aa8" opacity=".5"/><ellipse cx="236" cy="152" rx="15" ry="10" fill="#ff7aa8" opacity=".5"/>`;
    const pupil = (x, y, r) => `<g class="pupil"><circle cx="${x}" cy="${y}" r="${r}" fill="#241a4a"/><circle cx="${x - r * 0.36}" cy="${y - r * 0.4}" r="${r * 0.38}" fill="#fff"/><circle cx="${x + r * 0.38}" cy="${y + r * 0.42}" r="${r * 0.18}" fill="#fff" opacity=".8"/></g>`;
    if (M.deco === "cyclops") s += `<g class="eyes">${c.sphere(150, 104, 46, "#ffffff", 0.5)}${pupil(150, 108, 22)}</g><path class="brow" d="M108 56 Q150 38 192 56" stroke="#241a4a" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    else s += `<g class="eyes">${c.sphere(112, 108, 30, "#ffffff", 0.5)}${c.sphere(188, 108, 30, "#ffffff", 0.5)}${pupil(112, 112, 14)}${pupil(188, 112, 14)}</g><path class="brow" d="M84 72 Q108 62 134 76 M166 76 Q192 62 216 72" stroke="#241a4a" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    s += `<path class="smile" d="M90 168 Q150 214 210 168" stroke="#2b1448" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    s += `<defs><clipPath id="mc0"><ellipse cx="150" cy="178" rx="68" ry="44"/></clipPath></defs><g class="mouthg" clip-path="url(#mc0)"><ellipse cx="150" cy="178" rx="68" ry="44" fill="${c.v("#6a1236", "#2e0719")}"/>`;
    s += `<g class="tongue"><ellipse cx="150" cy="212" rx="42" ry="19" fill="#ff7a9a"/><path d="M150 200 V216" stroke="#e0587c" stroke-width="3" stroke-linecap="round"/></g>`;
    [110, 130, 150, 170, 190].forEach((x) => { const t = 178 - 44 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 150) / 68, 2))); s += `<path d="M${x - 10} ${t - 2} L${x + 10} ${t - 2} L${x} ${t + 24}Z" fill="#fffdf4" stroke="#d9d2bd" stroke-width="1.6" stroke-linejoin="round"/>`; });
    s += `<path d="M118 228 L134 228 L126 204Z M166 228 L182 228 L174 204Z" fill="#fffdf4" stroke="#d9d2bd" stroke-width="1.6" stroke-linejoin="round"/></g>`;
    s += `<circle class="mcenter" cx="150" cy="182" r="3" fill="none"/></g>`;
    s += TC.seal(60, 190, 10, -10);
    let svg = c.out(s, "0 0 300 340").replace("<svg ", `<svg class="msvg" overflow="visible" `);
    return svg.replace(/(id="|url\(#)([a-z]+\d+)/g, `$1m${uid}_$2`);
  }
  let monUid = 0;
  function makeMonster(L) {
    const el = h("div", { class: "mon", "data-l": L, html: `<div class="mgrow"><div class="mfig">${monsterSVG(L, ++monUid)}</div></div>` });
    el.style.setProperty("--bl", (-Math.random() * 4).toFixed(2) + "s");
    return el;
  }
  const mouth = (mon, st) => { mon.classList.remove("half", "open", "wide"); if (st) mon.classList.add(st); };
  const pt = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  const mouthPt = (mon) => pt(mon.querySelector(".mcenter"));
  /** pupils follow a point on the screen */
  function look(mon, x, y) {
    const e = mon.querySelector(".eyes"); if (!e) return;
    const p = pt(e), vx = x - p.x, vy = y - p.y, d = Math.hypot(vx, vy) || 1, k = Math.min(1, d / 260);
    mon.querySelectorAll(".pupil").forEach((q) => { q.style.transform = `translate(${(vx / d * 9 * k).toFixed(1)}px,${(vy / d * 8 * k).toFixed(1)}px)`; });
  }

  /* =====================================================================
     3 · little helpers: timers that can be cancelled, sounds
     ===================================================================== */
  let sleepers = new Set(), timers = new Set(), live = new Set(), gen = 0, curApi = null, finishTap = null, tapSkip = null, myPending = null, origSkip = null;
  const dead = (my) => !curApi || curApi.aborted || (my != null && my !== gen);
  const wait = (ms) => new Promise((res) => { const s = { res }; s.t = setTimeout(() => { sleepers.delete(s); res(); }, ms); sleepers.add(s); });
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
  const every = (fn, ms) => { const t = setInterval(fn, ms); timers.add(t); return t; };
  function anim(el, kf, opt) {
    if (!el || !el.animate) return Promise.resolve();
    const a = el.animate(kf, opt); live.add(a);
    return a.finished.catch(() => {}).then(() => { live.delete(a); });
  }
  function killAll() {
    sleepers.forEach((s) => { clearTimeout(s.t); s.res(); }); sleepers.clear();
    timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); timers.clear();
    live.forEach((a) => { try { a.cancel(); } catch (e) {} }); live.clear();
    if (finishTap) finishTap();
  }
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);

  function tone(f, t0, dur, type, vol, f2) {
    const c = TC.ac(); if (!c) return;
    const t = c.currentTime + t0, v = Math.max(0.0003, vol * (TC.cfg.volume == null ? 0.9 : TC.cfg.volume));
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  const SND = {
    chomp(p) { TC.sfx("kick"); tone(280 * p, 0, 0.07, "square", 0.14, 110); tone(210 * p, 0.14, 0.07, "square", 0.12, 90); },
    giggle(p) { [1, 1.26, 1.06, 1.33, 1.12, 1.4].forEach((k, i) => tone(500 * p * k, i * 0.085, 0.07, "triangle", 0.22)); },
    yuck(p) { tone(300 * p, 0, 0.38, "sawtooth", 0.13, 120 * p); tone(190 * p, 0.1, 0.3, "square", 0.07, 90 * p); },
    burp(p) { tone(130 * p, 0, 0.6, "sawtooth", 0.2, 55 * p); tone(136 * p, 0, 0.6, "square", 0.07, 58 * p); TC.sfx("sparkle"); },
    grow(p) { tone(260 * p, 0, 0.32, "sine", 0.2, 700 * p); }
  };

  /* =====================================================================
     4 · the stage
     ===================================================================== */
  const css = `
  .g4{position:absolute;inset:0;overflow:hidden;color:#fff;touch-action:manipulation;
    background:radial-gradient(110% 80% at 30% 0%,#8d6bff 0%,#5538c8 42%,#2a1c7a 100%)}
  .g4 .halo{position:absolute;left:6%;top:4%;width:62%;height:72%;background:radial-gradient(closest-side,rgba(255,255,255,.2),transparent);pointer-events:none}
  .g4 .bgl{position:absolute;font-weight:700;line-height:1;color:rgba(255,255,255,.085);pointer-events:none;animation:g4drift var(--d,9s) ease-in-out infinite alternate}
  .g4 .floor{position:absolute;left:0;right:0;top:58%;bottom:0;overflow:hidden;
    background:linear-gradient(180deg,#6d4ee6,#45299f 55%,#341f84);box-shadow:inset 0 .5rem 0 rgba(255,255,255,.25),0 -1.6rem 3rem rgba(20,10,70,.45)}
  .g4 .floor:before{content:"";position:absolute;left:-40%;right:-40%;top:0;bottom:-90%;opacity:.85;transform:perspective(46rem) rotateX(64deg);transform-origin:50% 0;
    background:repeating-conic-gradient(rgba(255,255,255,.11) 0 25%,rgba(255,255,255,0) 0 50%) 0 0/13rem 13rem}
  .g4 .spot{position:absolute;left:calc(33% - 17rem);top:55%;width:34rem;height:9rem;border-radius:50%;background:radial-gradient(closest-side,rgba(255,230,120,.5),transparent);pointer-events:none}
  .g4 .layer{position:absolute;inset:0;pointer-events:none}

  /* the monster: .mon places it, .mgrow grows it, .mfig breathes */
  .g4 .mon{position:absolute;left:calc(33% - 11rem);top:11rem;width:22rem;height:25rem;z-index:6;pointer-events:none}
  .g4 .mgrow{position:absolute;inset:0;transform:scale(var(--s,1));transform-origin:50% 100%;transition:transform .6s cubic-bezier(.3,1.9,.5,1)}
  .g4 .mfig{position:absolute;inset:0;transform-origin:50% 100%;animation:g4breath 2.6s ease-in-out infinite}
  .g4 .mon svg{width:100%;height:100%;display:block;overflow:visible;filter:drop-shadow(0 .8rem 1rem rgba(10,0,50,.35))}
  .g4 .msvg .eyes{transform-origin:150px 106px;animation:g4blink 4.6s infinite;animation-delay:var(--bl,0s)}
  .g4 .msvg .pupil{transition:transform .16s ease-out}
  .g4 .msvg .smile{transition:opacity .08s}
  .g4 .msvg .mouthg{transform-origin:150px 134px;transform:scaleY(.2);opacity:0;transition:transform .13s ease-out,opacity .08s}
  .g4 .mon.half .mouthg{transform:scaleY(.62);opacity:1}
  .g4 .mon.open .mouthg{transform:scaleY(1);opacity:1}
  .g4 .mon.wide .mouthg{transform:scale(1.12,1.2);opacity:1}
  .g4 .mon.half .smile,.g4 .mon.open .smile,.g4 .mon.wide .smile{opacity:0}
  .g4 .msvg .tongue{animation:g4tongue .9s ease-in-out infinite}
  .g4 .msvg .arm{transition:transform .2s}
  .g4 .msvg .armL{transform-origin:62px 198px}
  .g4 .msvg .armR{transform-origin:238px 198px}
  .g4 .msvg .face{transform-origin:150px 170px}
  .g4 .msvg .bellyL{transform-origin:150px 270px}
  .g4 .msvg .bglow{transition:opacity .3s}
  .g4 .mon.hint .bglow{opacity:.95;animation:g4glow .7s ease-in-out infinite alternate}
  .g4 .mon.hint .bellyL{animation:g4pulse .7s ease-in-out infinite alternate}
  .g4 .mon.giggle .mfig{animation:g4giggle .75s}
  .g4 .mon.giggle .armL{animation:g4wave .16s ease-in-out 6 alternate}
  .g4 .mon.giggle .armR{animation:g4wave .16s ease-in-out 6 alternate-reverse}
  .g4 .mon.no .face{animation:g4no .7s}
  .g4 .mon.sing .mouthg{opacity:1;animation:g4sing .42s ease-in-out infinite alternate}
  .g4 .mon.sing .smile{opacity:0}
  .g4 .mon.dance0 .mfig{animation:g4dance0 .84s ease-in-out infinite}
  .g4 .mon.dance1 .mfig{animation:g4dance1 .84s ease-in-out infinite}
  .g4 .mon.dance0 .armL,.g4 .mon.dance1 .armR{animation:g4wave .28s ease-in-out infinite alternate}
  .g4 .mon.dance0 .armR,.g4 .mon.dance1 .armL{animation:g4wave .28s ease-in-out infinite alternate-reverse}

  /* bubbles of speech */
  .g4 .bubble{position:absolute;left:55%;top:9rem;width:46rem;padding:1.2rem 2rem 1.3rem;border-radius:4.2rem;text-align:center;color:#2a1d77;z-index:4;
    background:linear-gradient(180deg,#fff,#f1ecff);box-shadow:0 .6rem 0 rgba(0,0,0,.18),0 1.6rem 3rem rgba(10,0,60,.4),inset 0 -.8rem 1.4rem rgba(155,107,255,.2)}
  .g4 .bubble .b1{font-size:2.5rem;font-weight:700;line-height:1.15}
  .g4 .bubble .b2{font-size:6.4rem;font-weight:700;line-height:1;color:var(--mc);-webkit-text-stroke:.28rem #fff;paint-order:stroke fill;text-shadow:0 .4rem 0 rgba(42,29,119,.25),0 0 1.6rem var(--mc)}
  .g4 .bubble .b3{font-size:1.9rem;font-weight:700;color:#5a46b8;margin-top:.1rem}
  .g4 .bubble i{position:absolute;border-radius:50%;background:linear-gradient(180deg,#fff,#efe8ff);box-shadow:0 .4rem 0 rgba(0,0,0,.14)}
  .g4 .bubble .t1{left:-2.6rem;top:62%;width:2.8rem;height:2.8rem}
  .g4 .bubble .t2{left:-5.2rem;top:84%;width:1.7rem;height:1.7rem}
  .g4 .say{position:absolute;left:46%;top:25.5rem;z-index:12;font-size:4.6rem;font-weight:700;padding:.5rem 2rem .6rem;border-radius:3rem;white-space:nowrap;opacity:0;pointer-events:none;
    box-shadow:0 .5rem 0 rgba(0,0,0,.25),0 1rem 2rem rgba(0,0,0,.3)}
  .g4 .say.no{background:#ff4b6e}.g4 .say.yes{background:#2ee6b6;color:#05402f}
  .g4 .say.on{animation:g4say 1.15s}
  .g4 .slots{position:absolute;left:58%;top:26rem;display:flex;gap:2rem;align-items:center;z-index:4}
  .g4 .sl{width:7.6rem;height:7.6rem;border-radius:50%;border:.45rem dashed rgba(255,255,255,.65);background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center}
  .g4 .sl.full{border-style:solid;border-color:#ffd23d;background:#fff;animation:g4in .45s cubic-bezier(.2,1.8,.4,1)}
  .g4 .sl img{width:86%;height:86%}
  .g4 .slots b{font-size:2.6rem;margin-left:.6rem;text-shadow:0 .3rem 0 rgba(0,0,0,.3)}

  /* picture cards: they drop from the top and bob on the floor */
  .g4 .cards{position:absolute;left:0;right:0;bottom:2.2rem;height:20rem;display:flex;justify-content:center;align-items:flex-end;gap:2.6rem;z-index:8;pointer-events:none}
  .g4 .slot{position:relative;width:15.5rem;height:19rem;pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent}
  .g4 .card{position:absolute;inset:0;border-radius:2.2rem;background:linear-gradient(180deg,#fff,#e9efff);border:.5rem solid var(--rim);display:flex;align-items:center;justify-content:center;
    box-shadow:0 .7rem 0 rgba(0,0,0,.28),0 1.4rem 2rem rgba(10,0,60,.35),inset 0 -1rem 1.4rem rgba(120,140,220,.28);animation:g4bob 2.3s ease-in-out infinite;animation-delay:var(--bd,0s)}
  .g4 .card img{width:94%;height:94%;display:block;pointer-events:none}
  .g4 .slot:active .card{filter:brightness(1.08)}
  .g4 .card.glowc{box-shadow:0 0 0 .5rem #ffd23d,0 0 3.4rem #ffd23d,0 .7rem 0 rgba(0,0,0,.28)}
  .g4 .lab{position:absolute;left:50%;bottom:-1.3rem;transform:translateX(-50%) scale(.4);opacity:0;background:#ffd23d;color:#2a1d77;font-weight:700;font-size:2.5rem;line-height:1.1;
    padding:.35rem 1.5rem .4rem;border-radius:2rem;white-space:nowrap;box-shadow:0 .35rem 0 rgba(0,0,0,.3);transition:transform .2s cubic-bezier(.2,1.8,.4,1),opacity .15s;z-index:3}
  .g4 .lab small{font-size:1.6rem;margin-left:.5rem;color:#5a46b8}
  .g4 .lab.on{opacity:1;transform:translateX(-50%) scale(1)}

  /* the picture that is asked about */
  .g4 .big{position:absolute;left:59%;top:12.5rem;width:23rem;height:23rem;z-index:6;display:flex;align-items:center;justify-content:center;pointer-events:none}
  .g4 .big .rays{position:absolute;inset:-26%;border-radius:50%;background:repeating-conic-gradient(rgba(255,238,150,.4) 0 9deg,transparent 9deg 20deg);
    -webkit-mask:radial-gradient(circle,#000 24%,transparent 66%);mask:radial-gradient(circle,#000 24%,transparent 66%);animation:g4spin 14s linear infinite}
  .g4 .big .plate{position:relative;width:21rem;height:21rem;border-radius:3.6rem;background:linear-gradient(180deg,#fff,#e9efff);border:.6rem solid #ffd23d;display:flex;align-items:center;justify-content:center;
    box-shadow:0 .8rem 0 rgba(0,0,0,.25),0 1.6rem 3rem rgba(10,0,60,.45);animation:g4float 2.4s ease-in-out infinite}
  .g4 .big img{width:92%;height:92%;display:block}

  /* finale */
  .g4 .fin{position:absolute;inset:0;z-index:7;pointer-events:none}
  .g4 .fin .mon{top:24rem;z-index:7}
  .g4 .fin .mon.dance0,.g4 .fin .mon.dance1{--s:1.3}
  .g4 .popL{position:absolute;top:8.4rem;z-index:20;font-size:8.5rem;font-weight:700;line-height:1;white-space:nowrap;color:var(--lc);-webkit-text-stroke:.5rem #fff;paint-order:stroke fill;
    text-shadow:0 .5rem 0 rgba(0,0,0,.3),0 0 2.4rem var(--lc);transform:translateX(-50%)}
  .g4 .rain{position:absolute;top:-14rem;z-index:30;font-weight:700;line-height:1;color:var(--lc);-webkit-text-stroke:.35rem #fff;paint-order:stroke fill;text-shadow:0 .4rem 0 rgba(0,0,0,.3);pointer-events:none}
  .g4 .bub{position:absolute;z-index:11;width:6rem;height:6rem;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:3.4rem;color:var(--lc);pointer-events:none;
    background:radial-gradient(circle at 32% 28%,#fff 0,rgba(255,255,255,.7) 18%,rgba(190,225,255,.35) 55%,rgba(255,170,230,.4) 100%);box-shadow:inset 0 0 1rem rgba(255,255,255,.7),0 0 1rem rgba(160,210,255,.6)}
  .g4 .rainbow{position:absolute;z-index:10;pointer-events:none;overflow:visible}
  .g4 .rainbow path{fill:none;stroke-width:15;stroke-linecap:round}

  @keyframes g4drift{from{transform:translateY(0) rotate(-6deg)}to{transform:translateY(-4vh) rotate(6deg)}}
  @keyframes g4breath{0%,100%{transform:scale(1,1)}50%{transform:scale(1.018,.972)}}
  @keyframes g4blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}
  @keyframes g4tongue{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
  @keyframes g4giggle{0%,100%{transform:rotate(0)}15%{transform:rotate(-4deg) translateY(-2%)}30%{transform:rotate(4deg)}45%{transform:rotate(-3.5deg) translateY(-3%)}60%{transform:rotate(3deg)}80%{transform:rotate(-1deg)}}
  @keyframes g4wave{from{transform:rotate(-14deg)}to{transform:rotate(30deg)}}
  @keyframes g4no{0%,100%{transform:translateX(0) rotate(0)}18%{transform:translateX(-16px) rotate(-4deg)}38%{transform:translateX(16px) rotate(4deg)}58%{transform:translateX(-12px) rotate(-3deg)}78%{transform:translateX(10px) rotate(2deg)}}
  @keyframes g4glow{from{opacity:.35}to{opacity:1}}
  @keyframes g4pulse{from{transform:scale(1)}to{transform:scale(1.16)}}
  @keyframes g4sing{from{transform:scaleY(.4)}to{transform:scaleY(1.05)}}
  @keyframes g4dance0{0%,100%{transform:translateY(0) rotate(-6deg) scale(1,1)}25%{transform:translateY(-7%) rotate(0) scale(.96,1.05)}50%{transform:translateY(0) rotate(6deg) scale(1.05,.95)}75%{transform:translateY(-7%) rotate(0) scale(.96,1.05)}}
  @keyframes g4dance1{0%,100%{transform:translateY(0) rotate(6deg) scale(1,1)}25%{transform:translateY(-9%) rotate(0) scale(.96,1.05)}50%{transform:translateY(0) rotate(-6deg) scale(1.05,.95)}75%{transform:translateY(-9%) rotate(0) scale(.96,1.05)}}
  @keyframes g4bob{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-1.1rem) rotate(calc(var(--r,0deg) * -1))}}
  @keyframes g4say{0%{opacity:0;transform:rotate(-8deg) scale(.2)}15%{opacity:1;transform:rotate(-6deg) scale(1.15)}30%{transform:rotate(-5deg) scale(1)}80%{opacity:1}100%{opacity:0;transform:rotate(-5deg) translateY(-1rem) scale(.95)}}
  @keyframes g4in{from{transform:scale(.2)}}
  @keyframes g4spin{to{transform:rotate(360deg)}}
  @keyframes g4float{50%{transform:translateY(-1rem) rotate(1deg)}}
  `;

  let root = null, built = false, mons = [];

  function build(api) {
    if (built && root && root.isConnected) return;
    api.stage.append(h("style", {}, css));
    root = h("div", { class: "g4" });
    root.append(h("div", { class: "halo" }));
    const letters = "abcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < 16; i++) {
      const L = letters[(i * 7 + 3) % 26], big = i % 3 === 0;
      root.append(h("div", { class: "bgl", style: `left:${(i * 29) % 94}%;top:${3 + ((i * 41) % 52)}%;font-size:${big ? 16 : 10}rem;--d:${7 + (i % 5) * 1.5}s;animation-delay:${-i * 0.7}s` }, (i % 2 ? L.toUpperCase() : L)));
    }
    root.append(h("div", { class: "floor" }), h("div", { class: "spot" }));
    api.stage.append(root);
    built = true;
  }
  /** remove everything of a round / finale, keep the backdrop */
  function clearScene() {
    if (!root) return;
    root.querySelectorAll(".mon,.layer,.fin,.say,.bub,.rainbow,.rain,.popL").forEach((e) => e.remove());
    mons = [];
  }
  function eligibleLetters(G) {
    const n = {}; G.words.forEach((w) => { n[w.L] = (n[w.L] || 0) + 1; });
    return Object.keys(n).filter((k) => n[k] >= 2);
  }

  /* =====================================================================
     5 · a round
     ===================================================================== */
  const RIMS = ["#ff5fa2", "#3d9bff", "#ffb020", "#2ec27e", "#9b6bff"];

  async function hopIn(el, from, ms) {
    const kf = []; const N = 26;
    for (let i = 0; i <= N; i++) { const t = i / N, e = 1 - Math.pow(1 - t, 2.2); kf.push({ transform: `translate(${(from * (1 - e)).toFixed(2)}vw,${(-Math.abs(Math.sin(t * Math.PI * 3)) * 7 * (1 - t)).toFixed(2)}vh) rotate(${((1 - t) * -8 * Math.sin(t * 20)).toFixed(1)}deg)` }); }
    await anim(el, kf, { duration: ms, easing: "linear", fill: "backwards" });
  }

  async function playRound(api, my, letter, idx, n, prev) {
    const G = api.G, M = monOf(letter);
    const words = G.words, right = shuffle(words.filter((w) => w.L === letter)).slice(0, 2);
    const others = shuffle(words.filter((w) => w.L !== letter)), dis = [], seen = new Set();
    others.forEach((w) => { if (dis.length < 3 && !seen.has(w.L)) { dis.push(w); seen.add(w.L); } });
    others.forEach((w) => { if (dis.length < 3 && dis.indexOf(w) < 0) dis.push(w); });
    const deck = shuffle(right.map((w) => ({ w, ok: true })).concat(dis.map((w) => ({ w, ok: false }))));

    api.progress(idx, n);
    root.style.setProperty("--mc", M.col);
    const layer = h("div", { class: "layer" }); root.append(layer);
    const mon = makeMonster(letter); root.append(mon); mons.push(mon);
    // the previous monster waddles off to the left while the new one hops in
    if (prev) { anim(prev, [{ transform: "translate(0,0)" }, { transform: "translate(-90vw,-4vh) rotate(-12deg)" }], { duration: 900, easing: "ease-in", fill: "forwards" }).then(() => prev.remove()); }
    mouth(mon, "half"); TC.sfx("whoosh");
    const hop = hopIn(mon, 100, 1150);

    // thought bubble + the empty eating slots (they pop up when the monster has landed)
    const bubble = h("div", { class: "bubble", style: `--mc:${M.col};opacity:0` },
      h("div", { class: "b1" }, "I only eat things that start with"), h("div", { class: "b2" }, "/" + letter + "/"),
      h("div", { class: "b3 zh" }, `我只吃 /${letter}/ 開頭的東西！　請點牠愛吃的圖片`), h("i", { class: "t1" }), h("i", { class: "t2" }));
    const sl = [h("div", { class: "sl" }), h("div", { class: "sl" })], count = h("b", {}, "0 / 2");
    const slots = h("div", { class: "slots", style: "opacity:0" }, sl[0], sl[1], count);
    layer.append(bubble, slots);

    // five cards drop in from the top (each can be tapped as soon as it has landed)
    const cardsEl = h("div", { class: "cards" }); layer.append(cardsEl);
    deck.forEach((d, i) => {
      d.slot = h("div", { class: "slot", style: `--rim:${RIMS[i % RIMS.length]};--r:${(i % 2 ? 1 : -1) * (1.2 + (i % 3) * 0.9)}deg;--bd:${(-i * 0.37).toFixed(2)}s` },
        h("div", { class: "card" }, h("img", { src: TC.art(d.w.img), alt: d.w.w, draggable: "false" })),
        h("div", { class: "lab" }, d.w.w, h("small", { class: "zh" }, d.w.zh)));
      cardsEl.append(d.slot);
      anim(d.slot, [{ transform: "translateY(-85vh) rotate(-24deg)", opacity: 0 }, { transform: "translateY(1.6rem) rotate(5deg)", opacity: 1, offset: 0.62 }, { transform: "translateY(-1.2rem) rotate(-2deg)", offset: 0.8 }, { transform: "none" }], { duration: 950, delay: 700 + i * 140, easing: "ease-in", fill: "backwards" });
      later(() => TC.sfx("pop"), 700 + i * 140 + 560);
      later(() => { d.ready = true; }, 700 + i * 140 + 950);
    });

    await hop; if (dead(my)) return null;
    SND.grow(M.pitch); anim(mon.querySelector(".mfig"), [{ transform: "scale(1.1,.86)" }, { transform: "scale(.94,1.08)" }, { transform: "scale(1)" }], { duration: 420 });
    bubble.style.opacity = ""; slots.style.opacity = ""; TC.sfx("pop");
    anim(bubble, [{ transform: "scale(.2)", opacity: 0, transformOrigin: "0 80%" }, { transform: "scale(1.06)", opacity: 1, offset: 0.7, transformOrigin: "0 80%" }, { transform: "scale(1)", transformOrigin: "0 80%" }], { duration: 520, easing: "ease-out" });

    /* ---- the tapping ---- */
    const st = { eaten: [], wrong: 0, locked: false, over: false, skip: false, lastTap: Date.now() };
    const sayEl = h("div", { class: "say" }); layer.append(sayEl);
    const say = (txt, kind) => { sayEl.className = "say " + kind; sayEl.textContent = txt; void sayEl.offsetWidth; sayEl.classList.add("on"); };
    const lookAt = (el) => { const p = pt(el); look(mon, p.x, p.y); };
    const labelOn = (d, ms) => { const l = d.slot.querySelector(".lab"); l.classList.add("on"); later(() => l.classList.remove("on"), ms); };
    const hintBelly = () => mon.classList.add("hint");

    const eat = async (d) => {
      d.busy = true; st.locked = true; st.lastTap = Date.now();
      const mp = mouthPt(mon), sr = d.slot.getBoundingClientRect(), dx = mp.x - (sr.left + sr.width / 2), dy = mp.y - (sr.top + sr.height / 2);
      d.slot.style.zIndex = 20; lookAt(d.slot); mouth(mon, "wide"); TC.sfx("whoosh");
      await anim(d.slot, [{ transform: "translate(0,0) scale(1) rotate(0deg)" }, { transform: `translate(${dx * 0.3}px,${dy * 0.3 - 70}px) scale(1.14) rotate(-10deg)`, offset: 0.35 }, { transform: `translate(${dx}px,${dy}px) scale(.14) rotate(22deg)` }], { duration: 560, easing: "cubic-bezier(.45,0,.7,1)", fill: "forwards" });
      if (dead(my)) return;
      d.slot.style.visibility = "hidden"; d.gone = true; st.eaten.push(d);
      // chomp chomp
      for (let k = 0; k < 2; k++) {
        mouth(mon, null); SND.chomp(M.pitch);
        anim(mon.querySelector(".mfig"), [{ transform: "scale(1.07,.9)" }, { transform: "scale(.96,1.05)" }, { transform: "scale(1)" }], { duration: 210 });
        await wait(160); if (dead(my)) return;
        mouth(mon, k ? null : "open"); await wait(130); if (dead(my)) return;
      }
      mouth(mon, null);
      // the monster grows and giggles; Ollie says the word
      mon.style.setProperty("--s", (1 + st.eaten.length * 0.075).toFixed(3)); SND.grow(M.pitch);
      mon.classList.remove("hint", "giggle"); void mon.offsetWidth; mon.classList.add("giggle"); SND.giggle(M.pitch); say(st.eaten.length === 1 ? "Yum!" : "Yum yum!", "yes");
      const box = sl[st.eaten.length - 1]; box.classList.add("full"); box.append(h("img", { src: TC.art(d.w.img), alt: "" })); count.textContent = st.eaten.length + " / 2";
      TC.confetti(26, [M.col, "#ffd23d", "#fff"]);
      const sp = TC.speak(cap(d.w.w) + "!");
      await wait(850); if (dead(my)) return;
      await sp; if (dead(my)) return;
      mon.classList.remove("giggle"); mouth(mon, "half");
    };
    const reject = async (d) => {
      d.busy = true; st.wrong++; st.lastTap = Date.now();
      const mp = mouthPt(mon), sr = d.slot.getBoundingClientRect(), dx = (mp.x - (sr.left + sr.width / 2)) * 0.62, dy = (mp.y - (sr.top + sr.height / 2)) * 0.62;
      d.slot.style.zIndex = 15; lookAt(d.slot); mouth(mon, "open"); TC.sfx("whoosh");
      await anim(d.slot, [{ transform: "none" }, { transform: `translate(${dx}px,${dy}px) scale(.82) rotate(-8deg)` }], { duration: 300, easing: "ease-out", fill: "forwards" });
      if (dead(my)) return;
      // "Yuck!" — the monster shakes its head and spits the card back
      mouth(mon, "wide"); SND.yuck(M.pitch); say("Yuck!", "no"); mon.classList.remove("no"); void mon.offsetWidth; mon.classList.add("no"); labelOn(d, 1700);
      d.slot.getAnimations().forEach((a) => { try { a.cancel(); } catch (e) {} });
      await anim(d.slot, [{ transform: `translate(${dx}px,${dy}px) scale(.82) rotate(-8deg)` }, { transform: `translate(${dx * 0.1}px,${dy * 0.1 + 40}px) scale(1.1) rotate(14deg)`, offset: 0.55 }, { transform: "translate(0,-1rem) scale(.97) rotate(-5deg)", offset: 0.78 }, { transform: "none" }], { duration: 760, easing: "cubic-bezier(.3,1.4,.5,1)" });
      if (dead(my)) return;
      d.slot.style.zIndex = ""; d.busy = false; mon.classList.remove("no"); mouth(mon, "half");
      if (st.wrong >= 2) hintBelly();
      if (st.wrong >= 4) deck.forEach((x) => { if (x.ok && !x.gone) x.slot.firstChild.classList.add("glowc"); });
    };
    const tap = (d) => {
      if (dead(my) || st.over || st.locked || d.busy || d.gone || !d.ready) return;
      TC.ac(); st.lastTap = Date.now();
      if (d.ok) eat(d).then(afterEat); else reject(d);
    };
    const afterEat = () => {
      st.locked = false;
      if (dead(my) || st.over) return;
      if (st.eaten.length >= 2 || st.skip) finish();
    };
    const finish = () => {
      if (st.over) return; st.over = true;
      // the teacher pressed N: the rest is eaten for the child (no animation)
      deck.forEach((d) => { if (d.ok && !d.gone) { d.gone = true; d.slot.style.visibility = "hidden"; st.eaten.push(d); } });
      if (TC.pending === myPending) TC.pending = null;
      clearInterval(hintTimer); timers.delete(hintTimer);
      tapSkip = null; finishTap = null; done();
    };
    let done = () => {}, hintTimer = null;
    const armPending = () => { myPending = () => { if (dead(my)) { finish(); return; } armPending(); if (st.locked || st.over) return; const d = deck.find((x) => x.ok && !x.gone && !x.busy && x.ready); if (d) tap(d); }; TC.pending = myPending; };

    await new Promise((resolve) => {
      done = resolve; finishTap = finish;
      deck.forEach((d) => d.slot.addEventListener("pointerdown", (e) => { e.preventDefault(); tap(d); }));
      armPending();
      tapSkip = () => { if (st.over) return; st.skip = true; if (!st.locked) finish(); };
      // no tap for a while: the belly letter glows, later the right cards too
      hintTimer = every(() => { const idle = Date.now() - st.lastTap; if (idle > 14000) hintBelly(); if (idle > 28000) deck.forEach((x) => { if (x.ok && !x.gone) x.slot.firstChild.classList.add("glowc"); }); }, 1000);
    });
    if (TC.pending === myPending) TC.pending = null; tapSkip = null; finishTap = null;
    if (dead(my)) return null;
    mon.classList.remove("hint", "no"); mouth(mon, null);
    await wait(250); if (dead(my)) return null;

    /* ---- "What is it?" with the last picture eaten ---- */
    const last = st.eaten[st.eaten.length - 1], w = last.w;
    deck.forEach((d, i) => { if (!d.gone) anim(d.slot, [{ transform: "none", opacity: 1 }, { transform: "translateY(70vh) rotate(26deg)", opacity: 0 }], { duration: 650, delay: i * 70, easing: "ease-in", fill: "forwards" }); });
    anim(bubble, [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(.2)", opacity: 0, transformOrigin: "0 80%" }], { duration: 380, fill: "forwards" }); anim(slots, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
    TC.sfx("whoosh");
    const big = h("div", { class: "big" }, h("div", { class: "rays" }), h("div", { class: "plate" }, h("img", { src: TC.art(w.img), alt: w.w })));
    layer.append(big);
    const br = big.getBoundingClientRect(), mp = mouthPt(mon);
    mouth(mon, "open"); look(mon, br.left + br.width / 2, br.top + br.height / 2);
    await anim(big, [{ transform: `translate(${mp.x - (br.left + br.width / 2)}px,${mp.y - (br.top + br.height / 2)}px) scale(.1) rotate(-30deg)`, opacity: 0 }, { transform: "translate(0,0) scale(1.14) rotate(5deg)", opacity: 1, offset: 0.72 }, { transform: "none" }], { duration: 760, easing: "cubic-bezier(.3,1.1,.5,1)", fill: "backwards" });
    if (dead(my)) return null;
    mouth(mon, null); SND.giggle(M.pitch);

    const plural = /^(teeth|hands)$/.test(w.w);
    const sentence = plural ? "They're " + w.w + "." : "It's " + (/^[aeiou]/.test(w.w) ? "an " : "a ") + w.w + ".";
    const r = await api.ask({ teacher: plural ? "What are they?" : G.teacher, tzh: plural ? "這些是什麼？" : G.tzh, say: sentence, zh: w.zh, keys: [[w.w]], word: w.w, hideKey: true });
    TC.hideTalk(); if (dead(my)) return null;
    if (r && r.ok) { TC.confetti(50, [M.col, "#ffd23d", "#fff", "#2ee6b6"]); await TC.praise(); }
    else { // no answer: Ollie models it, the child repeats, and the game moves on
      await TC.model(sentence, w.w); if (dead(my)) return null;
      TC.floatText("跟著說 Say it!", 70, 30, "#ffd23d"); await TC.waitAction(5000);
    }
    if (dead(my)) return null;

    /* ---- burp: a rainbow and letter bubbles ---- */
    mouth(mon, "wide"); SND.burp(M.pitch);
    anim(mon.querySelector(".mfig"), [{ transform: "scale(1,1)" }, { transform: "scale(1.1,.92)" }, { transform: "scale(.96,1.05)" }, { transform: "scale(1)" }], { duration: 520 });
    anim(big, [{ transform: "none", opacity: 1 }, { transform: "scale(1.15) rotate(4deg)", opacity: 1, offset: 0.3 }, { transform: "scale(.1) rotate(-30deg)", opacity: 0 }], { duration: 700, delay: 600, easing: "ease-in", fill: "forwards" });
    const m2 = mouthPt(mon), rw = 40, rh = 17;
    const rb = h("div", { class: "rainbow", style: `left:${m2.x}px;top:${m2.y}px;width:${rw}rem;height:${rh}rem;transform:translateY(-94%)`, html: `<svg viewBox="0 0 400 170" width="100%" height="100%" overflow="visible"></svg>` });
    const svg = rb.firstChild;
    ["#ff4b55", "#ff9a2e", "#ffd21f", "#35d35a", "#3d8bff", "#9b5cff"].forEach((col, i) => { const rad = 150 - i * 15; const p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.setAttribute("d", `M${10 + i * 15} 160 A${rad} ${rad} 0 0 1 ${390 - i * 15} 160`); p.setAttribute("stroke", col); p.setAttribute("stroke-width", "15"); p.setAttribute("fill", "none"); p.setAttribute("stroke-linecap", "round"); p.style.strokeDasharray = "700"; p.style.strokeDashoffset = "700"; svg.append(p); });
    root.append(rb);
    svg.querySelectorAll("path").forEach((p, i) => anim(p, [{ strokeDashoffset: 700 }, { strokeDashoffset: 0 }], { duration: 800, delay: i * 60, easing: "ease-out", fill: "forwards" }));
    for (let i = 0; i < 9; i++) {
      const b = h("div", { class: "bub", style: `--lc:${M.col};left:${m2.x - 30}px;top:${m2.y - 30}px` }, i % 2 ? letter.toUpperCase() : letter);
      root.append(b);
      anim(b, [{ transform: "translate(0,0) scale(.2)", opacity: 0 }, { transform: `translate(${(8 + Math.random() * 40) * (i / 9 + 0.3)}vw,${-8 - Math.random() * 22}vh) scale(${0.8 + Math.random() * 0.7})`, opacity: 1, offset: 0.6 }, { transform: `translate(${(14 + Math.random() * 46) * (i / 9 + 0.3)}vw,${-14 - Math.random() * 30}vh) scale(1.2)`, opacity: 0 }], { duration: 1500 + Math.random() * 700, delay: 150 + i * 120, easing: "ease-out", fill: "forwards" }).then(() => b.remove());
    }
    TC.confetti(70, [M.col, "#ffd23d", "#ff5fa2", "#2ee6b6", "#4cc9ff"]);
    await wait(2300); if (dead(my)) return null;
    anim(rb, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" }).then(() => rb.remove());
    mouth(mon, null); layer.remove();
    return mon;
  }

  /* =====================================================================
     6 · finale: every monster lines up, grows and dances; the letters rain
     ===================================================================== */
  async function finale(api, my, letters, prev) {
    const n = letters.length, fin = h("div", { class: "fin" }); root.append(fin);
    if (prev) { anim(prev, [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(.1) rotate(60deg)", opacity: 0 }], { duration: 400, fill: "forwards" }).then(() => prev.remove()); }
    const cols = letters.map((L) => monOf(L).col), mlist = [];
    letters.forEach((L, i) => {
      const m = makeMonster(L), cx = (i + 1) / (n + 1) * 100;
      m.style.left = `calc(${cx}% - 11rem)`; m.style.transform = "translateY(-90vh)"; mouth(m, "half"); fin.append(m); mlist.push(m);
    });
    TC.sfx("fanfare");
    // they drop in one after the other and land in a row
    for (let i = 0; i < n; i++) {
      later(() => { if (dead(my)) return; mlist[i].style.transform = ""; anim(mlist[i], [{ transform: "translateY(-90vh)" }, { transform: "translateY(2vh)", offset: 0.62 }, { transform: "translateY(-5vh)", offset: 0.8 }, { transform: "none" }], { duration: 800, easing: "ease-in" }); later(() => TC.sfx("kick"), 600); }, i * 330);
    }
    await wait(n * 330 + 800); if (dead(my)) return;
    // grow!
    mlist.forEach((m, i) => { later(() => { m.style.setProperty("--s", "1.3"); SND.grow(monOf(letters[i]).pitch); }, i * 180); });
    await wait(n * 180 + 400); if (dead(my)) return;
    TC.sfx("levelup"); TC.confetti(220, cols.concat(["#ffd23d", "#fff"]));
    // dance and sing, each monster shows its letter
    mlist.forEach((m, i) => { m.classList.add("dance" + (i % 2), "sing"); });
    const beat = every(() => { TC.sfx("kick"); later(() => TC.sfx("hat"), 210); later(() => TC.sfx("snare"), 420); later(() => TC.sfx("hat"), 630); }, 840);
    letters.forEach((L, i) => {
      later(() => {
        if (dead(my)) return;
        const cx = (i + 1) / (n + 1) * 100, pl = h("div", { class: "popL", style: `left:${cx}%;--lc:${cols[i]}` }, L.toUpperCase() + " " + L); fin.append(pl);
        tone(520 * (1 + i * 0.25), 0, 0.5, "triangle", 0.22); TC.sfx("ding");
        anim(pl, [{ transform: "translateX(-50%) scale(.1)", opacity: 0 }, { transform: "translateX(-50%) scale(1.25)", opacity: 1, offset: 0.6 }, { transform: "translateX(-50%) scale(1)" }], { duration: 520, easing: "ease-out" });
      }, 500 + i * 700);
    });
    // letters rain down
    const abc = letters.concat(letters.map((l) => l.toUpperCase()));
    let k = 0;
    every(() => {
      if (dead(my)) return;
      const L = abc[(Math.random() * abc.length) | 0], size = 5 + Math.random() * 7, ci = (Math.random() * cols.length) | 0, x = Math.random() * 96;
      const d = h("div", { class: "rain", style: `left:${x}%;font-size:${size.toFixed(1)}rem;--lc:${cols[ci]}` }, L); fin.append(d); k++;
      anim(d, [{ transform: "translateY(0) rotate(0deg)" }, { transform: `translateY(${60 + Math.random() * 40}vh) translateX(${(Math.random() - 0.5) * 10}vw) rotate(${(Math.random() - 0.5) * 540}deg)` }], { duration: 2200 + Math.random() * 1800, easing: "cubic-bezier(.3,.1,.6,1)", fill: "forwards" }).then(() => d.remove());
    }, 110);
    later(() => TC.confetti(160, cols.concat(["#ffd23d", "#fff"])), 1800);
    await wait(500 + n * 700 + 2200);
    void beat; void k;
  }

  /* =====================================================================
     7 · registration
     ===================================================================== */
  function cleanup(wasMine) {
    killAll();
    if (TC.pending === myPending) TC.pending = null; myPending = null; tapSkip = null; finishTap = null;
    if (wasMine && TC.skipTurn && origSkip && TC.skipTurn.__g4) TC.skipTurn = origSkip;
    clearScene();
  }

  TC.games.monster = {
    startArt: ["p-water", "p-light", "p-book", "p-drink", "p-brush", "p-lunchbox", "p-fan", "p-window"],
    mount(api) { build(api); },
    idle(api) {
      build(api); cleanup(false);
      // attract scene: a monster wiggling beside two bobbing pictures
      const letter = SPARE[(Math.random() * SPARE.length) | 0], mon = makeMonster(letter); mouth(mon, "half"); root.append(mon); mons.push(mon);
      const layer = h("div", { class: "layer" }), cardsEl = h("div", { class: "cards" }); layer.append(cardsEl);
      shuffle(api.G.words).slice(0, 4).forEach((w, i) => cardsEl.append(h("div", { class: "slot", style: `--rim:${RIMS[i % RIMS.length]};--r:${(i % 2 ? 1 : -1) * 2}deg;--bd:${-i * 0.4}s` }, h("div", { class: "card" }, h("img", { src: TC.art(w.img), alt: "" })))));
      root.append(layer);
    },
    async play(api) {
      build(api); cleanup(false);
      curApi = api; const my = ++gen;
      origSkip = TC.skipTurn;
      const wrapper = function () { if (dead(my)) killAll(); else if (tapSkip) tapSkip(); return origSkip && origSkip.apply(TC, arguments); };
      wrapper.__g4 = true; TC.skipTurn = wrapper;
      let prev = null, res = { ok: false };
      try {
        const eligible = shuffle(eligibleLetters(api.G)), n = Math.max(1, Math.min(TC.rounds(3), eligible.length)), letters = eligible.slice(0, n);
        TC.preloadClips && TC.preloadClips(api.G.words.map((w) => w.w));
        for (let i = 0; i < n; i++) {
          prev = await playRound(api, my, letters[i], i, n, prev);
          if (dead(my) || !prev) return res;
        }
        api.progress(n, n);
        await finale(api, my, letters, prev);
        if (dead(my)) return res;
        await TC.clapBanner();
        if (dead(my)) return res;
        res = { ok: true };
      } finally { cleanup(true); curApi = null; }
      return res;
    }
  };
})();
