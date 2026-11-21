/* =====================================================================
   Gate 2 · Ollie Talk Show 歐力脫口秀  (game key "talk", theme: DIALOGUE)
   A glossy TV talk-show studio.  Host Ollie asks, the child is the "guest of honour" and answers with ONE word,
   the audience (the parents in the room) claps.  Each round a prop picture appears on the stage screen,
   Ollie's question is in a big speech bubble, a right answer fills the applause meter and the audience cheers.
   Wow moment: the meter is full -> ON AIR turns gold, confetti cannons fire, spotlights spin.
   Parent moment: the finale question, then TC.clapBanner() ("Give him a big hand!").
   Pictures (drawn in code, registered in TC.ART): talk-done, talk-welcome, talk-door, talk-help, talk-fan, talk-bye,
   talk-hand, talk-tv, talk-chair, talk-kid, talk-kid-up, talk-mic, talk-mug.
   The school's mark 土城 is the channel logo of this studio and is always part of the thing it is on: the lit roundel of the
   desk, the corner "bug" of the big screen, the cube of the desk microphone, the print on the mug, the crest embroidered on
   the headrests and on the guest's shirt, the hub caps of the confetti cannons - and on every prop picture where such a
   mark belongs (a stamp, an envelope seal, a door plate, a toolbox sticker, the fan's hub cap, a wristband).
   Nothing here listens to a microphone: the applause meter only moves when the host presses the tick (or N).
   ===================================================================== */
(function () {
  "use strict";
  const TC = window.TC;
  TC.games = TC.games || {};
  const h = TC.h, esc = TC.esc;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------------------------------------------------------------------
     1. Pictures
     --------------------------------------------------------------------- */
  const f1 = (v) => +v.toFixed(1);
  const INK = "#1b1d33", SKIN = "#ffd3a8", SKIN2 = "#f0a878";
  const A = TC.ART;
  /** a glossy ellipse, optional outline and highlight */
  const blob = (c, cx, cy, rx, ry, col, rot, line, hl) => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${c.g(col)}" transform="rotate(${rot || 0} ${f1(cx)} ${f1(cy)})"${line ? ` stroke="${line}" stroke-width="2.4"` : ""}/>`
    + (hl === 0 ? "" : c.hl(cx - rx * 0.3, cy - ry * 0.38, rx * 0.4, ry * 0.2, (rot || 0) - 20, hl || 0.5));
  const st = (d, col, w, extra) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${extra || ""}/>`;
  const sparkle = (x, y, r, col) => { const k = f1(r * 0.2); return `<path d="M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r}Z" fill="${col || "#ffd21f"}" stroke="#ff9a2e" stroke-width="1.4" stroke-linejoin="round"/><circle cx="${x}" cy="${y}" r="${f1(r * 0.2)}" fill="#fff"/>`; };
  /** a cartoon hand, fingers up, palm centred on (cx, cy) */
  function hand(c, cx, cy, col, line, k) {
    k = k || 1;
    const E = (x, y, rx, ry, rot) => blob(c, cx + x * k, cy + y * k, rx * k, ry * k, col, rot, line, 0.4);
    return E(-40, -4, 11, 21, -62) + E(-23, -40, 10.5, 25, -12) + E(-7, -48, 10.5, 29, -3) + E(9, -46, 10.5, 28, 5) + E(24, -37, 9.5, 21, 14) + E(0, 0, 37, 33, 0);
  }
  const cuff = (c, x, y, w, hgt, col) => `<rect x="${x}" y="${y}" width="${w}" height="${hgt}" rx="9" fill="${c.g(col)}"/><rect x="${x}" y="${y}" width="${w}" height="5" rx="2.5" fill="#fff" opacity=".35"/>`;

  /* done: a checked homework sheet */
  A["talk-done"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 192, 76, 8);
    s += `<g transform="rotate(-5 100 100)"><rect x="38" y="12" width="126" height="170" rx="10" fill="${c.v("#ffffff", "#e3eaf9")}" stroke="#aebbe3" stroke-width="2.5"/>`;
    s += `<path d="M54 12 V182" stroke="#ff9aa8" stroke-width="2"/>` + [30, 48, 66].map((y) => `<circle cx="46" cy="${y + 20}" r="3.6" fill="#c3cce8"/>`).join("");
    s += `<rect x="64" y="26" width="52" height="9" rx="4.5" fill="#6f82c9"/>`;
    for (let i = 0; i < 5; i++) s += `<rect x="64" y="${52 + i * 19}" width="${i % 2 ? 74 : 86}" height="5.5" rx="2.7" fill="#c7d2f1"/><path d="M64 ${62 + i * 19} H150" stroke="#e1e8fa" stroke-width="1.5"/>`;
    s += `<circle cx="138" cy="34" r="19" fill="none" stroke="#e8283e" stroke-width="3.4" transform="rotate(-8 138 34)"/><text x="138" y="41" text-anchor="middle" font-family="Fredoka,Arial Rounded MT Bold,Arial Black,Arial" font-weight="900" font-size="19" fill="#e8283e" transform="rotate(-8 138 34)">100</text>`;
    s += st("M66 110 L92 140 L146 70", "#fff", 21) + st("M66 110 L92 140 L146 70", "#e8283e", 13) + c.hl(100, 106, 30, 4, -40, 0.6);
    s += TC.seal(82, 163, 10.5, -10, "print"); // the school's stamp at the foot of the sheet
    s += `</g>`;
    s += `<g transform="rotate(34 150 150) translate(-14 -14) scale(.9)"><rect x="150" y="96" width="17" height="86" rx="4" fill="${c.v("#ffe066", "#f0a81a")}"/><rect x="150" y="86" width="17" height="14" rx="5" fill="#ff8aa8"/><rect x="150" y="98" width="17" height="6" fill="#b9c4d6"/><path d="M150 182 L158.5 202 L167 182Z" fill="#f4d3a4"/><path d="M155 195 L158.5 202 L162 195Z" fill="#3a2a2a"/></g>`;
    s += sparkle(30, 40, 10) + sparkle(176, 30, 7) + sparkle(24, 150, 7);
    return c.out(s);
  };

  /* welcome: a thank-you card with a heart and its envelope (the flap is closed with the school's seal) */
  A["talk-welcome"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(106, 193, 80, 8);
    s += `<g transform="rotate(-5 90 96)"><rect x="30" y="14" width="112" height="150" rx="12" fill="${c.v("#fffafc", "#ffe3ec")}" stroke="#ffb3c8" stroke-width="3"/>`;
    s += `<rect x="40" y="24" width="92" height="130" rx="8" fill="none" stroke="#ff8fb0" stroke-width="2.2" stroke-dasharray="2 6" stroke-linecap="round"/>`;
    s += `<text x="86" y="53" text-anchor="middle" font-family="Fredoka,Arial Rounded MT Bold,Arial Black,Arial" font-weight="900" font-size="17" fill="#d6336c">Thank You!</text>`;
    s += `<g transform="translate(86 96) scale(.8) translate(-94 -92)"><path d="M94 128 C48 98 52 56 78 56 C88 56 94 63 94 69 C94 63 100 56 110 56 C136 56 140 98 94 128Z" fill="${c.g("#ff3d6e", 35, 25)}" stroke="#d6204f" stroke-width="2.8" stroke-linejoin="round"/>` + c.hl(74, 70, 13, 7, -30, 0.85) + `</g>`;
    s += `</g>`;
    s += `<g transform="rotate(7 140 156)"><rect x="94" y="126" width="92" height="60" rx="7" fill="${c.v("#ffffff", "#f6dfe8")}" stroke="#e79ab5" stroke-width="2.6"/>`;
    s += `<path d="M97 183 L131 157 M183 183 L149 157" stroke="#e9b3c6" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M95 128 L140 163 L185 128Z" fill="${c.v("#fff3f7", "#ffd3e0")}" stroke="#e79ab5" stroke-width="2.6" stroke-linejoin="round"/>`;
    s += TC.seal(140, 160, 9.5, 0, "sticker") + `</g>`; // the seal that closes the flap
    s += `<path d="M168 30 C156 20 148 30 156 38 L168 48 L180 38 C188 30 180 20 168 30Z" fill="${c.g("#ff6b94")}"/>` + `<path d="M15 150 C8 143 3 150 8 155 L15 162 L22 155 C27 150 22 143 15 150Z" fill="${c.g("#ff6b94")}"/>`;
    s += sparkle(180, 96, 8) + sparkle(13, 62, 7);
    return c.out(s);
  };

  /* door: an open door with the bright room beyond */
  A["talk-door"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 194, 70, 8);
    s += `<rect x="34" y="14" width="132" height="176" rx="8" fill="${c.v("#b0702f", "#6a3c16")}"/>`;
    s += `<rect x="48" y="26" width="104" height="164" fill="${c.v("#fffbe0", "#ffe08a")}"/>`;
    s += `<path d="M48 150 H152 V190 H48Z" fill="${c.v("#f6cf8a", "#cf9a52")}"/><path d="M70 150 L56 190 M100 150 V190 M130 150 L144 190" stroke="#b9843f" stroke-width="2" opacity=".5"/>`;
    s += `<rect x="108" y="60" width="30" height="40" rx="3" fill="${c.v("#bfe6ff", "#7ab8f0")}" stroke="#fff" stroke-width="3"/><path d="M123 60 V100 M108 80 H138" stroke="#fff" stroke-width="2.4"/>`;
    s += `<path d="M48 26 L106 8 L106 196 L48 188Z" fill="${c.v("#f1b469", "#b4743a")}" stroke="#6a3c16" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<path d="M60 126 L94 124 V172 L60 166Z" fill="${c.v("#e09b52", "#a8672f")}" stroke="#7a4a1e" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<g transform="translate(77 65) skewY(-11)">${TC.seal(0, 0, 10.5, 0, "plate")}</g>`; // brass door plate, in the door's perspective
    s += `<path d="M106 8 L120 14 L120 190 L106 196Z" fill="#8a5424" stroke="#6a3c16" stroke-width="2"/>`;
    s += c.sphere(94, 112, 8, "#ffd24a") + `<rect x="89" y="112" width="11" height="3" rx="1.5" fill="#b98300"/>`;
    s += c.hl(72, 40, 14, 5, -20, 0.5);
    s += sparkle(160, 36, 8) + sparkle(30, 70, 6);
    return c.out(s);
  };

  /* help: a helper hand holding a toolbox */
  A["talk-help"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 194, 72, 8);
    s += st("M66 108 Q66 62 100 62 Q134 62 134 108", "#8d9bbf", 11) + st("M66 108 Q66 62 100 62 Q134 62 134 108", "#d7dff5", 6);
    s += `<rect x="34" y="104" width="132" height="76" rx="14" fill="${c.g("#e8453c")}"/><rect x="34" y="104" width="132" height="22" rx="11" fill="${c.g("#ff6a52")}"/>`;
    s += `<rect x="86" y="118" width="28" height="22" rx="5" fill="${c.g("#ffd24a")}"/><circle cx="100" cy="129" r="3.4" fill="#b98300"/>`;
    s += c.hl(64, 113, 26, 4, 0, 0.55) + TC.seal(64, 152, 11.5, -8, "sticker"); // a sticker on the front of the toolbox
    s += `<g transform="translate(150 150) rotate(-35)"><rect x="-4" y="-24" width="8" height="30" rx="3" fill="${c.v("#e6ecfa", "#8a97bb")}"/><circle cx="0" cy="-26" r="9" fill="${c.g("#cbd5ee")}"/><rect x="-3" y="-34" width="6" height="12" fill="#fff"/></g>`;
    s += blob(c, 100, 50, 30, 21, "#ffffff", 0, "#9aa8d0", 0.5);
    s += [78, 92, 106, 120].map((x, i) => blob(c, x, 72 + (i === 0 || i === 3 ? 1 : 0), 7.6, 15, "#ffffff", 0, "#9aa8d0", 0.4)).join("");
    s += blob(c, 71, 60, 8.5, 15, "#ffffff", 18, "#9aa8d0", 0.3);
    s += cuff(c, 74, 14, 52, 22, "#3d8bff");
    s += sparkle(24, 60, 9) + sparkle(178, 76, 7) + sparkle(168, 22, 6);
    return c.out(s);
  };

  /* fan: a spinning desk fan (the blades turn inside the picture) */
  A["talk-fan"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 194, 56, 7);
    s += `<ellipse cx="100" cy="182" rx="46" ry="11" fill="${c.g("#3b4670")}"/><rect x="93" y="124" width="14" height="60" rx="5" fill="${c.g("#9aa6c8")}"/>`;
    s += `<circle cx="100" cy="84" r="62" fill="rgba(190,225,255,.22)" stroke="#8f9cc6" stroke-width="5"/>`;
    s += `<g transform="translate(100 84)"><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur=".55s" repeatCount="indefinite"/>`
      + [0, 120, 240].map((a) => `<g transform="rotate(${a})"><path d="M0 0 C-22 -12 -26 -46 -6 -54 C10 -58 22 -34 0 0Z" fill="${c.g("#3dc2ff")}" stroke="#1f8fd6" stroke-width="2"/></g>`).join("")
      + `<circle r="50" fill="none" stroke="#bfeaff" stroke-width="10" opacity=".25"/></g></g>`;
    s += `<g stroke="#8f9cc6" stroke-width="2.4" fill="none"><circle cx="100" cy="84" r="40"/><circle cx="100" cy="84" r="20"/>` + [0, 30, 60, 90, 120, 150].map((a) => `<path d="M${f1(100 + 62 * Math.cos(a * Math.PI / 180))} ${f1(84 + 62 * Math.sin(a * Math.PI / 180))} L${f1(100 - 62 * Math.cos(a * Math.PI / 180))} ${f1(84 - 62 * Math.sin(a * Math.PI / 180))}"/>`).join("") + `</g>`;
    s += TC.seal(100, 84, 10.5) + `<rect x="84" y="136" width="32" height="16" rx="8" fill="${c.g("#35e07a")}"/>`;
    s += st("M168 62 q14 -6 22 2 M170 84 q18 -4 24 4 M168 106 q14 -4 20 4", "#bfeaff", 4.5);
    return c.out(s);
  };

  /* bye: a waving hand with a "Bye!" bubble (the hand waves) */
  A["talk-bye"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 196, 56, 7);
    s += `<g><animateTransform attributeName="transform" type="rotate" values="-13 100 190;13 100 190;-13 100 190" dur=".9s" repeatCount="indefinite"/>`;
    s += cuff(c, 66, 162, 68, 38, "#ff8a3d");
    s += hand(c, 100, 134, SKIN, "#d98f5c", 1);
    s += TC.seal(100, 183, 9.5, 0, "patch") + `</g>`; // a sweatband with the school's patch: it waves with the hand
    s += `<g transform="translate(136 38) rotate(8) scale(.82)"><path d="M-38 -26 H38 Q50 -26 50 -14 V12 Q50 24 38 24 H14 L24 42 L-4 24 H-38 Q-50 24 -50 12 V-14 Q-50 -26 -38 -26Z" fill="${c.v("#ffffff", "#dfe8ff")}" stroke="#7b8ee0" stroke-width="3" stroke-linejoin="round"/><text x="0" y="9" text-anchor="middle" font-family="Fredoka,Arial Rounded MT Bold,Arial Black,Arial" font-weight="900" font-size="26" fill="#2d46b9">Bye!</text></g>`;
    s += st("M24 100 q-12 18 -2 40 M10 92 q-20 28 -4 62", "#ffb347", 5);
    s += sparkle(30, 40, 8);
    return c.out(s);
  };

  /* hand: the finale, a thumbs-up glove in a ring of stars ("Could you give me a hand?" -> "Of course.") */
  A["talk-hand"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 196, 60, 7);
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; s += sparkle(f1(100 + Math.cos(a) * 88), f1(104 + Math.sin(a) * 84), i % 2 ? 6 : 9, i % 3 === 0 ? "#fff6c2" : "#ffd21f"); }
    s += cuff(c, 56, 160, 94, 38, "#3d8bff") + `<g transform="translate(0 -8)">`;
    s += `<rect x="52" y="98" width="102" height="76" rx="32" fill="${c.g(SKIN, 35, 25)}" stroke="#d98f5c" stroke-width="2.4"/>`;
    s += blob(c, 82, 66, 15, 38, SKIN, -5, "#d98f5c", 0.5);
    s += [0, 1, 2, 3].map((i) => `<rect x="${68 + i * 1.5}" y="${108 + i * 15}" width="${86 - i * 2}" height="15.5" rx="7.7" fill="${c.g(SKIN, 40, 20)}" stroke="#d98f5c" stroke-width="2"/>`).join("");
    s += c.hl(100, 112, 30, 5, -5, 0.5) + `</g>` + TC.seal(103, 181, 10, 0, "patch"); // the wristband carries the school's patch
    return c.out(s);
  };

  /* tv: a retro TV (start screen) */
  A["talk-tv"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 188, 70, 8);
    s += st("M80 36 L56 8 M120 36 L146 8", "#9aa6c8", 5) + c.sphere(56, 8, 6, "#ffd24a") + c.sphere(146, 8, 6, "#ffd24a");
    s += `<rect x="18" y="34" width="164" height="132" rx="26" fill="${c.g("#ff7a45", 30, 20)}"/>`;
    s += `<rect x="32" y="46" width="108" height="108" rx="18" fill="${c.v("#bfe6ff", "#3d6be8")}" stroke="#7a3314" stroke-width="5"/>`;
    s += TC.seal(86, 100, 17, 0, "print") + `<path d="M44 58 Q70 54 96 58" stroke="#fff" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>`; // the channel ident is on
    s += c.sphere(160, 76, 13, "#ffd24a") + c.sphere(160, 112, 13, "#35e07a") + `<path d="M150 136 h20 M150 144 h20" stroke="#7a3314" stroke-width="3" stroke-linecap="round"/>`;
    s += `<rect x="54" y="164" width="14" height="18" rx="4" fill="#7a3314"/><rect x="132" y="164" width="14" height="18" rx="4" fill="#7a3314"/>`;
    s += c.hl(60, 56, 40, 8, -20, 0.5);
    return c.out(s);
  };

  /* the red velvet armchair of the studio; the school's crest is embroidered on the headrest (above the sitter's head) */
  A["talk-chair"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 194, 86, 8);
    s += `<rect x="30" y="172" width="14" height="22" rx="4" fill="#5a3a12"/><rect x="156" y="172" width="14" height="22" rx="4" fill="#5a3a12"/>`;
    s += `<path d="M30 176 L30 56 Q30 6 100 6 Q170 6 170 56 L170 176Z" fill="${c.g("#c4283f", 40, 18)}" stroke="#ffc83d" stroke-width="3"/>`;
    s += `<path d="M48 160 L48 58 Q48 26 100 26 Q152 26 152 58 L152 160Z" fill="${c.v("#e8506c", "#a31a3d")}"/>`;
    s += [[74, 54], [126, 54], [68, 84], [100, 80], [132, 84], [70, 118], [100, 116], [130, 118]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#ffc83d"/>`).join("");
    s += `<path d="M74 54 L100 80 L126 54 M68 84 L100 116 L132 84" stroke="#8a1230" stroke-width="1.6" opacity=".4" fill="none"/>`;
    s += `<rect x="6" y="100" width="40" height="80" rx="18" fill="${c.g("#c4283f")}" stroke="#ffc83d" stroke-width="2.4"/><rect x="154" y="100" width="40" height="80" rx="18" fill="${c.g("#c4283f")}" stroke="#ffc83d" stroke-width="2.4"/>`;
    s += `<rect x="30" y="146" width="140" height="36" rx="14" fill="${c.g("#d6354e", 40, 20)}" stroke="#ffc83d" stroke-width="2.4"/>`;
    s += `<rect x="59" y="-16" width="82" height="47" rx="21" fill="${c.g("#d6354e", 40, 22)}" stroke="#ffc83d" stroke-width="2.4"/>` + c.hl(80, -7, 16, 4, -8, 0.45);
    s += TC.seal(100, 7.5, 10.5, 0, "patch"); // embroidered crest
    s += c.hl(56, 60, 10, 22, 8, 0.35);
    return c.out(s, "0 -20 200 220");
  };

  /* the guest of honour: a cute generic kid (hands in the lap / arms up) */
  function kid(up) {
    const c = TC.ArtCtx(), SH = "#ffa530", HAIR = "#4a2a12"; let s = c.shadow(100, 226, 60, 8);
    if (up) s += st("M60 176 L26 112", SH, 24) + st("M140 176 L174 112", SH, 24) + c.sphere(24, 100, 14, SKIN, 0.5) + c.sphere(176, 100, 14, SKIN, 0.5);
    s += `<path d="M40 230 Q36 170 74 152 L126 152 Q164 170 160 230Z" fill="${c.g(SH)}"/>`;
    if (!up) s += st("M56 172 Q42 202 62 214", SH, 22) + st("M144 172 Q158 202 138 214", SH, 22) + c.sphere(66, 216, 11, SKIN, 0.5) + c.sphere(134, 216, 11, SKIN, 0.5);
    s += `<path d="M84 152 Q100 168 116 152" fill="#fff" stroke="#e08a1c" stroke-width="2.4"/>`;
    s += TC.seal(119, 189, 9, -4, "patch"); // the school crest on the shirt, where a uniform has it
    s += `<rect x="88" y="132" width="24" height="26" rx="8" fill="${SKIN2}"/>`;
    s += c.sphere(48, 100, 10, SKIN, 0.4) + c.sphere(152, 100, 10, SKIN, 0.4) + c.sphere(100, 94, 52, SKIN, 0.6);
    s += c.path("M46 92 Q42 38 100 36 Q158 38 154 92 Q140 62 116 58 Q102 76 80 62 Q58 66 46 92Z", HAIR) + c.path("M120 40 Q138 24 152 40 Q138 36 128 46Z", HAIR);
    s += `<path d="M62 50 l4 -9 l9 -2 l-5 8z" fill="#ffd21f" stroke="#e8a21a" stroke-width="1.5"/>`;
    s += c.eyes(100, 102, 21, 9.5) + c.blush(100, 118, 35);
    s += up ? `<path d="M82 124 Q100 148 118 124Z" fill="#7a1a2c" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M90 136 Q100 128 110 136 Q100 144 90 136Z" fill="#ff7a9a"/>` : c.smile(100, 124, 11);
    return c.out(s, "0 0 200 232");
  }
  A["talk-kid"] = () => kid(false);
  A["talk-kid-up"] = () => kid(true);

  /* the host's desk microphone: the channel cube (mic flag) carries the school's mark */
  A["talk-mic"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 191, 52, 7);
    s += `<ellipse cx="100" cy="184" rx="44" ry="10" fill="${c.g("#2b3152")}"/><ellipse cx="100" cy="181" rx="30" ry="5" fill="#4a5380" opacity=".7"/>`;
    s += `<rect x="94" y="120" width="12" height="64" rx="5" fill="${c.v("#5a6390", "#1c2140")}"/>`;
    s += c.sphere(100, 34, 30, "#c8d0e6", 0.6);
    s += `<g stroke="#7d87ab" stroke-width="2" fill="none" opacity=".8"><path d="M73 24 Q100 14 127 24 M70 36 Q100 28 130 36 M73 48 Q100 42 127 48 M88 7 Q80 34 88 61 M112 7 Q120 34 112 61"/></g>`;
    s += `<rect x="84" y="58" width="32" height="12" rx="5" fill="${c.g("#3a4266")}"/>`;
    s += `<path d="M58 78 L70 66 H154 L142 78Z" fill="#a9daff"/><path d="M142 78 L154 66 V120 L142 132Z" fill="#2377c8"/>`;
    s += `<rect x="58" y="78" width="84" height="54" rx="6" fill="${c.v("#63bcff", "#2f8fe6")}" stroke="#1f6fc4" stroke-width="2"/>`;
    s += TC.seal(100, 105, 16, 0, "print") + c.hl(76, 85, 14, 3.5, 0, 0.5);
    return c.out(s);
  };

  /* the host's mug, printed with the school's mark */
  A["talk-mug"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(92, 190, 64, 7);
    s += `<path d="M146 80 H158 Q184 80 184 108 Q184 136 158 136 H146" fill="none" stroke="#f0789c" stroke-width="15" stroke-linecap="round"/>`;
    s += `<path d="M24 44 H150 V150 Q150 186 114 186 H60 Q24 186 24 150Z" fill="${c.g("#fff1f5", 32, 24)}" stroke="#f0a3ba" stroke-width="2.4"/>`;
    s += `<ellipse cx="87" cy="44" rx="63" ry="12" fill="#fff" stroke="#f0a3ba" stroke-width="2.4"/><ellipse cx="87" cy="46" rx="54" ry="8" fill="#7a4424"/>`;
    s += TC.seal(87, 120, 26, 0, "print") + c.hl(42, 104, 7, 34, 0, 0.6);
    s += st("M68 28 q-8 -9 0 -17 M100 26 q-8 -10 0 -20", "#ffffff", 4, 'opacity=".55"');
    return c.out(s);
  };

  // every picture above draws its own 土城 mark where it belongs, so the engine must not add a pin
  ["talk-done", "talk-welcome", "talk-door", "talk-help", "talk-fan", "talk-bye", "talk-hand", "talk-tv", "talk-chair", "talk-kid", "talk-kid-up", "talk-mic", "talk-mug"]
    .forEach((n) => { TC.SEAL[n] = "none"; try { TC.art(n); } catch (e) { console.error(n, e); } });


  /* ---------------------------------------------------------------------
     2. Look of the studio (all sizes in rem, the 16:9 screen is ~110rem x 62rem; the talk bar covers the lower part
        while a question is on, so the stage picture, bubble and meter all live between y = 8rem and y = 38rem)
     --------------------------------------------------------------------- */
  const css = `
.tk{position:absolute;inset:0;overflow:hidden;background:#070a26;font-family:var(--font)}
.tk *{box-sizing:border-box}
.tk .wall{position:absolute;left:0;right:0;top:0;height:46rem;background:radial-gradient(70% 80% at 42% 34%,#5368dc 0%,#2c3da6 36%,#16206a 70%,#0b1038 100%)}
.tk .wall:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 .25rem,transparent .25rem 6rem)}
.tk .sky{position:absolute;left:0;top:19rem;width:100%;height:20rem;opacity:.7}
.tk .beams{position:absolute;inset:0;pointer-events:none;z-index:1}
.tk .bm{position:absolute;top:-3rem;width:24rem;height:56rem;margin-left:-12rem;transform-origin:50% 0;mix-blend-mode:screen;clip-path:polygon(47% 0,53% 0,100% 100%,0 100%);
  background:linear-gradient(rgba(255,244,205,.5),rgba(255,244,205,0) 88%);animation:tkSweepA 6s ease-in-out infinite}
.tk .bm.b1{left:24%}.tk .bm.b2{left:52%;animation-name:tkSweepB;animation-duration:7.4s;background:linear-gradient(rgba(255,190,225,.42),rgba(255,190,225,0) 88%)}
.tk .bm.b3{left:78%;animation-duration:5.4s;animation-delay:-2s;background:linear-gradient(rgba(170,235,255,.42),rgba(170,235,255,0) 88%)}
.tk .beams.spin .bm{animation:tkSpin 1.9s ease-in-out infinite alternate}
.tk .beams.spin .b1{background:linear-gradient(rgba(255,214,90,.7),rgba(255,214,90,0) 88%)}
.tk .beams.spin .b2{animation-delay:-.6s;background:linear-gradient(rgba(255,120,190,.65),rgba(255,120,190,0) 88%)}
.tk .beams.spin .b3{animation-delay:-1.2s;background:linear-gradient(rgba(110,220,255,.65),rgba(110,220,255,0) 88%)}
@keyframes tkSweepA{0%,100%{transform:rotate(-26deg)}50%{transform:rotate(18deg)}}
@keyframes tkSweepB{0%,100%{transform:rotate(22deg)}50%{transform:rotate(-20deg)}}
@keyframes tkSpin{0%{transform:rotate(-62deg)}100%{transform:rotate(62deg)}}
.tk .floor{position:absolute;left:0;right:0;top:36.5rem;height:8.4rem;z-index:2;background:linear-gradient(#4a35a0,#2a1a70 58%,#170e44);overflow:hidden}
.tk .floor:before{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 28%,rgba(255,255,255,.17) 44%,transparent 60%),repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 .2rem,transparent .2rem 9rem)}
.tk .floor:after{content:"";position:absolute;left:0;right:0;bottom:0;height:.7rem;background:linear-gradient(90deg,#ff5fa2,#4cc9ff,#ffc83d,#ff5fa2);box-shadow:0 0 2.4rem #4cc9ff}
.tk .pit{position:absolute;left:0;right:0;top:44.9rem;bottom:0;z-index:2;background:linear-gradient(#0c0a2c,#04051a)}
.tk .cur{position:absolute;top:0;bottom:15rem;width:6.4rem;z-index:3;background:repeating-linear-gradient(90deg,#7a0f2c 0 1.1rem,#c9304f 1.1rem 2.3rem,#8a1230 2.3rem 3.4rem);box-shadow:inset 0 0 2.4rem rgba(0,0,0,.55)}
.tk .cur.l{left:0;clip-path:polygon(0 0,100% 0,100% 28%,62% 58%,100% 100%,0 100%)}
.tk .cur.r{right:0;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,38% 58%,0 28%)}
.tk .val{position:absolute;left:0;right:0;top:0;height:6.4rem;z-index:3;
  background:radial-gradient(circle at 50% 0,#d83b5a 0 3rem,transparent 3.1rem) 0 3rem/6.2rem 3.4rem repeat-x,linear-gradient(#ffd96b,#c98a10) 0 2.9rem/100% .5rem no-repeat,linear-gradient(#6c0a26,#a31a3d) 0 0/100% 3.2rem no-repeat;filter:drop-shadow(0 .5rem .6rem rgba(0,0,0,.45))}
.tk .tv{position:absolute;left:calc(50% - 11.5rem);top:8.6rem;width:32.5rem;height:24.4rem;z-index:5;border-radius:2.6rem;padding:1.1rem;
  background:linear-gradient(160deg,#5b6aa6,#1e2650 55%,#0e1330);box-shadow:0 .8rem 0 #0a0e2a,0 2rem 4rem rgba(0,0,0,.55),inset 0 .25rem .4rem rgba(255,255,255,.4)}
.tk .scr{position:relative;width:100%;height:100%;border-radius:1.8rem;overflow:hidden;background:radial-gradient(90% 90% at 50% 30%,#a8dcff,#5a8bf0 46%,#2c35a6);box-shadow:inset 0 0 3rem rgba(0,0,50,.6)}
.tk .scr:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:4;background:linear-gradient(115deg,rgba(255,255,255,.3),rgba(255,255,255,0) 34%),repeating-linear-gradient(0deg,rgba(0,0,40,.07) 0 .15rem,transparent .15rem .5rem)}
.tk .bug{position:absolute;left:1rem;top:.9rem;width:3.1rem;height:3.1rem;z-index:3;filter:drop-shadow(0 .15rem .3rem rgba(0,0,50,.5))}
.tk .bug svg,.tk .desk .logo svg{width:100%;height:100%;display:block}
.tk .live{position:absolute;left:.62rem;top:4.3rem;z-index:3;display:flex;align-items:center;gap:.3rem;font-weight:700;font-size:.95rem;letter-spacing:.05em;color:#fff;background:rgba(10,15,60,.6);padding:.12rem .55rem .12rem .42rem;border-radius:1rem}
.tk .live i{width:.62rem;height:.62rem;border-radius:50%;background:#ff3b4e;animation:tkBlink 1.4s ease-in-out infinite}
@keyframes tkBlink{50%{opacity:.25}}
.tk .idle{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.2rem;color:#fff;text-shadow:0 .3rem 0 rgba(10,20,90,.55)}
.tk .idle img{width:10rem;height:10rem;animation:tkFloat 3s ease-in-out infinite}
.tk .idle b{font-size:3rem;line-height:1}.tk .idle span{font-size:1.8rem}
.tk .pw{position:absolute;inset:.5rem;display:none;animation:tkFloat 3.2s ease-in-out infinite}
.tk .prop{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 .9rem .8rem rgba(0,0,50,.42))}
.tk .prop.in{animation:tkPropIn .65s cubic-bezier(.2,1.5,.4,1)}
.tk .stat{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.55) 0 .25rem,rgba(0,0,0,.3) .25rem .55rem)}
.tk .stat.go{animation:tkStatic .38s ease-out}
@keyframes tkStatic{0%{opacity:.85}100%{opacity:0}}
@keyframes tkPropIn{0%{transform:scale(.25) rotate(-14deg);opacity:0}100%{transform:none;opacity:1}}
@keyframes tkFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-.7rem)}}
.tk .seat{position:absolute;z-index:6}
.tk .seat.host{left:calc(50% - 36.4rem);top:17.5rem;width:19rem;height:20.9rem}
.tk .seat.guest{left:calc(50% + 22.4rem);top:18.3rem;width:17rem;height:18.7rem}
.tk .chair{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 1rem 1rem rgba(0,0,0,.4))}
.tk .ow{position:absolute;left:3.3rem;top:4.5rem;width:12.4rem;height:14.4rem;cursor:pointer}
.tk .kid{position:absolute;left:2.2rem;top:3.3rem;width:12.6rem;height:14.5rem;transform-origin:50% 100%;cursor:pointer}
.tk .kid.up{animation:tkKidJump .5s ease-in-out infinite alternate}
@keyframes tkKidJump{from{transform:translateY(0)}to{transform:translateY(-1.2rem)}}
.tk .gsign{position:absolute;left:calc(50% + 22.4rem);top:8.6rem;width:17rem;z-index:7;text-align:center;padding:.6rem .4rem .8rem;border-radius:1.4rem;color:#4a1a00;font-weight:700;font-size:1.7rem;line-height:1.05;
  background:linear-gradient(#fff3b0,#ffc83d);box-shadow:0 .4rem 0 #a86a00,0 .8rem 1.4rem rgba(0,0,0,.4);transition:opacity .25s,transform .3s}
.tk .gsign .zh{display:block;font-size:1.5rem;color:#8a3a00}
.tk .gsign:before,.tk .gsign:after{content:"";position:absolute;bottom:100%;width:.25rem;height:2.8rem;background:linear-gradient(#a8741a,#e8c06a)}
.tk .gsign:before{left:2rem}.tk .gsign:after{right:2rem}
.tk:has(.gbub.on) .gsign{opacity:0;transform:translateY(-.8rem) scale(.94)}
.tk .hbub,.tk .gbub{position:absolute;z-index:12;text-align:center;border-radius:2.4rem;opacity:0;transform:scale(.5);transition:opacity .2s,transform .35s cubic-bezier(.2,1.5,.4,1);pointer-events:none}
.tk .hbub.on,.tk .gbub.on{opacity:1;transform:none}
.tk .hbub{left:calc(50% - 37.2rem);top:8rem;width:25rem;padding:.55rem 1.3rem .65rem;font-size:2.7rem;background:linear-gradient(#fff,#e6ecff);color:#14215a;transform-origin:38% 100%;box-shadow:0 .6rem 0 #8fa2ff,0 1.4rem 2.4rem rgba(0,0,0,.45)}
.tk .hbub b{display:block;font-size:1em;line-height:1.1}
.tk .hbub .zh{display:block;font-size:1.45rem;line-height:1.25;color:#5a6aa8;margin-top:.15rem}
.tk .hbub.nozh .zh{display:none}
.tk .hbub:after{content:"";position:absolute;left:9rem;top:100%;border:1.3rem solid transparent;border-top:1.7rem solid #e6ecff;border-bottom:0;filter:drop-shadow(0 .4rem 0 #8fa2ff)}
.tk .gbub{left:calc(50% + 21.6rem);top:8.4rem;width:18.4rem;padding:1rem 1rem 1.1rem;background:linear-gradient(#fff9d6,#ffe27a);color:#4a2a00;transform-origin:70% 100%;box-shadow:0 .5rem 0 #d99a10,0 1.2rem 2rem rgba(0,0,0,.45)}
.tk .gbub b{display:block;font-size:2.6rem;line-height:1.1}.tk .gbub b em{font-style:normal;color:#e0245e}
.tk .gbub .zh{display:block;font-size:1.5rem;color:#8a5a10;margin-top:.3rem}
.tk .gbub:after{content:"";position:absolute;left:50%;top:100%;margin-left:-1.2rem;border:1.3rem solid transparent;border-top:2rem solid #ffe27a;border-bottom:0}
.tk .desk{position:absolute;left:calc(50% - 13.45rem);top:33.4rem;width:36.4rem;height:8rem;z-index:8}
.tk .desk .top{position:absolute;left:0;right:0;top:0;height:2.3rem;border-radius:1.2rem 1.2rem .3rem .3rem;background:linear-gradient(#ffe6b4,#e0a55a);box-shadow:0 .5rem 1.4rem rgba(0,0,0,.4),inset 0 .2rem 0 #fff4d6}
.tk .desk .front{position:absolute;left:.8rem;right:.8rem;top:2.3rem;height:6.4rem;border-radius:0 0 1.4rem 1.4rem;background:linear-gradient(#2e40a0,#141d5a);border:.3rem solid #4c5fd0;border-top:0;display:flex;align-items:center;justify-content:center;gap:1.3rem;box-shadow:0 1rem 1.6rem rgba(0,0,0,.5),inset 0 -.3rem .1rem -.1rem rgba(76,201,255,.6)}
.tk .desk .front b{font-size:2.5rem;letter-spacing:.1em;color:#fff;text-shadow:0 0 .8rem #4cc9ff,0 0 2rem #4cc9ff}
/* the school's mark is the lit logo roundel of the desk: a round light box with a glowing ring */
.tk .desk .logo{width:4.8rem;height:4.8rem;flex:none;border-radius:50%;padding:.3rem;background:radial-gradient(circle at 50% 32%,#fff,#d6efff 55%,#8cc9ff);box-shadow:0 0 0 .2rem #0b1244,0 0 0 .42rem #9fe0ff,0 0 1.3rem .25rem rgba(76,201,255,.85),0 0 3rem rgba(76,201,255,.55);animation:tkLogo 2.8s ease-in-out infinite}
@keyframes tkLogo{50%{box-shadow:0 0 0 .2rem #0b1244,0 0 0 .42rem #e6f7ff,0 0 2rem .45rem rgba(130,225,255,1),0 0 4.4rem rgba(76,201,255,.8)}}
.tk .desk .mic{position:absolute;left:-.9rem;top:-9.1rem;width:9.6rem;height:9.6rem;filter:drop-shadow(0 .4rem .5rem rgba(0,0,0,.35))}
.tk .desk .plate{position:absolute;left:9.4rem;top:-1.5rem;padding:.2rem 1rem;border-radius:.6rem;background:linear-gradient(#fff,#dfe6ff);color:#14215a;font-weight:700;font-size:1.3rem;box-shadow:0 .25rem 0 #8fa2ff}
.tk .desk .mug{position:absolute;right:.7rem;top:-5.3rem;width:5.6rem;height:5.6rem;filter:drop-shadow(0 .3rem .4rem rgba(0,0,0,.35))}
/* ON AIR: a real light box (metal housing, lit red lens, white letters) hanging on two rods; the applause meter hangs under it */
.tk .onair{position:absolute;left:calc(50% + 39.8rem);top:8.4rem;width:10.3rem;height:4.9rem;z-index:10;border-radius:1rem;padding:.42rem;background:linear-gradient(#4a5070,#161a30);box-shadow:0 .45rem 0 #06081a,0 1rem 1.6rem rgba(0,0,0,.5),inset 0 .15rem 0 rgba(255,255,255,.35)}
.tk .onair:before,.tk .onair:after{content:"";position:absolute;bottom:100%;width:.4rem;height:2.8rem;background:linear-gradient(90deg,#8a93b8,#2a2f4a)}
.tk .onair:before{left:1.7rem}.tk .onair:after{right:1.7rem}
.tk .onair .lens{width:100%;height:100%;border-radius:.65rem;display:flex;align-items:center;justify-content:center;gap:.45rem;color:#fff;font-weight:700;font-size:2.05rem;letter-spacing:.05em;white-space:nowrap;background:radial-gradient(120% 150% at 50% 35%,#ff6b78,#d8142f 55%,#8a0a1e);animation:tkOnAir 1.8s ease-in-out infinite}
.tk .onair .lens i{width:.85rem;height:.85rem;border-radius:50%;background:#fff;box-shadow:0 0 .7rem #fff}
@keyframes tkOnAir{0%,100%{box-shadow:inset 0 0 1rem rgba(60,0,10,.55),0 0 1.2rem rgba(255,50,70,.45);text-shadow:0 0 .3rem rgba(255,255,255,.5);filter:brightness(.86)}50%{box-shadow:inset 0 0 .6rem rgba(60,0,10,.3),0 0 3.4rem rgba(255,60,80,.95);text-shadow:0 0 .7rem #fff,0 0 1.6rem #ffd0d5;filter:brightness(1.08)}}
.tk .onair.gold .lens{background:radial-gradient(120% 150% at 50% 35%,#fff7c8,#ffc83d 55%,#b87a00);color:#5a2d00;text-shadow:none;animation:tkGold 1.1s ease-in-out infinite alternate}
.tk .onair.gold .lens i{background:#5a2d00;box-shadow:none}
@keyframes tkGold{from{box-shadow:0 0 1.6rem rgba(255,200,60,.6)}to{box-shadow:0 0 5rem rgba(255,215,90,1);filter:brightness(1.12)}}
.tk .meter{position:absolute;left:calc(50% + 40.45rem);top:14.6rem;width:9rem;height:18.8rem;z-index:10;border-radius:1.2rem;padding:.7rem .75rem .8rem;display:flex;flex-direction:column;gap:.55rem;
  background:linear-gradient(100deg,#4a5174,#22273f 26%,#12152a 70%,#30365a);box-shadow:0 .5rem 0 #06081a,0 1.2rem 2.2rem rgba(0,0,0,.5),inset 0 .15rem 0 rgba(255,255,255,.3),inset 0 0 0 .12rem rgba(255,255,255,.08)}
.tk .meter:before,.tk .meter:after{content:"";position:absolute;bottom:100%;width:.3rem;height:1.6rem;background:linear-gradient(90deg,#8a93b8,#2a2f4a)}
.tk .meter:before{left:2rem}.tk .meter:after{right:2rem}
.tk .ml{flex:none;text-align:center;color:#eaf0ff;font-weight:700;font-size:1.1rem;line-height:1.1;letter-spacing:.06em;padding:.28rem 0 .3rem;border-radius:.45rem;background:linear-gradient(#0a0d20,#151a36);box-shadow:inset 0 .12rem .3rem rgba(0,0,0,.8),0 .08rem 0 rgba(255,255,255,.18)}
.tk .ml small{display:block;font-size:1.2rem;color:#ffd96b;letter-spacing:.2em;text-indent:.2em}
.tk .segs{position:relative;flex:1;display:flex;flex-direction:column-reverse;gap:.38rem;padding:.48rem;border-radius:.7rem;background:#05060f;box-shadow:inset 0 .2rem .6rem #000,0 .08rem 0 rgba(255,255,255,.2)}
.tk .segs:after{content:"";position:absolute;inset:0;border-radius:.7rem;pointer-events:none;background:linear-gradient(105deg,rgba(255,255,255,.16),rgba(255,255,255,0) 32%)}
.tk .seg{flex:1;width:100%;display:block;border-radius:.4rem;background:color-mix(in srgb,var(--c) 20%,#0b0d1c);box-shadow:inset 0 0 0 .08rem rgba(255,255,255,.07);transition:background .25s,box-shadow .25s}
.tk .seg.on{background:linear-gradient(color-mix(in srgb,var(--c) 45%,#fff),var(--c) 60%);box-shadow:0 0 1.1rem var(--c),inset 0 .22rem 0 rgba(255,255,255,.6)}
.tk .seg.pop{animation:tkSegPop .55s cubic-bezier(.2,1.6,.4,1)}
@keyframes tkSegPop{0%{transform:scale(.6)}60%{transform:scale(1.18)}100%{transform:none}}
.tk .seg:nth-child(1){--c:#35e07a}.tk .seg:nth-child(2){--c:#7ee34a}.tk .seg:nth-child(3){--c:#d4e03a}.tk .seg:nth-child(4){--c:#ffc83d}.tk .seg:nth-child(5){--c:#ff8a2e}.tk .seg:nth-child(6){--c:#ff3d6e}
.tk .cannon{position:absolute;top:33.8rem;width:8.4rem;height:8.4rem;z-index:11;pointer-events:none}
.tk .cannon.l{left:calc(50% - 54rem)}.tk .cannon.r{left:calc(50% + 45.6rem);transform:scaleX(-1)}
.tk .cannon svg{width:100%;height:100%;overflow:visible}
.tk .cannon.fire svg{animation:tkRecoil .5s ease-out}
@keyframes tkRecoil{0%{transform:translate(-1.4rem,.7rem) scale(1.1)}100%{transform:none}}
.tk .aud{position:absolute;left:0;right:0;bottom:0;height:17rem;z-index:14}
.tk .p{position:absolute;transform-origin:50% 100%}
.tk .p svg{width:100%;height:100%;display:block;overflow:visible}
.tk .p.b{width:7.4rem;height:11.2rem;bottom:5.6rem}.tk .p.f{width:10.4rem;height:15.8rem;bottom:-6.2rem}
.tk .p .arm{transform-box:fill-box;transform-origin:50% 100%;opacity:0}
.tk .p.up .arm,.tk .aud.cheer .p .arm{opacity:1}
.tk .aud.cheer .p{animation:tkBounce .45s ease-in-out infinite alternate;animation-delay:var(--d)}
.tk .aud.cheer .p .arm.l{animation:tkWaveL .32s ease-in-out infinite alternate}
.tk .aud.cheer .p .arm.r{animation:tkWaveR .32s ease-in-out infinite alternate .1s}
@keyframes tkBounce{from{transform:translateY(0)}to{transform:translateY(-1.1rem)}}
@keyframes tkWaveL{from{transform:rotate(-16deg)}to{transform:rotate(14deg)}}
@keyframes tkWaveR{from{transform:rotate(16deg)}to{transform:rotate(-14deg)}}
.tk .fl{position:absolute;width:6rem;height:6rem;margin:-3rem 0 0 -3rem;z-index:15;pointer-events:none;border-radius:50%;background:radial-gradient(circle,#fff 0 14%,rgba(255,250,215,.75) 26%,rgba(255,250,215,0) 68%);animation:tkFlash .42s ease-out forwards}
.tk .fl:before,.tk .fl:after{content:"";position:absolute;left:50%;top:50%;width:150%;height:.3rem;margin:-.15rem 0 0 -75%;background:linear-gradient(90deg,transparent,#fff,transparent)}
.tk .fl:after{transform:rotate(90deg)}
@keyframes tkFlash{0%{transform:scale(.2);opacity:1}35%{opacity:1}100%{transform:scale(1.5);opacity:0}}
.tk .conf{position:absolute;inset:0;width:100%;height:100%;z-index:16;pointer-events:none}
.tk .banner{position:absolute;left:50%;top:44.4rem;z-index:17;transform:translate(-50%,0) scale(0) rotate(-4deg);padding:.5rem 4.4rem 1.1rem;border-radius:5rem;white-space:nowrap;text-align:center;pointer-events:none;
  background:linear-gradient(#fff3b0,#ffc83d 55%,#e89a10);color:#7a1a00;font-weight:700;box-shadow:0 .8rem 0 #a86a00,0 0 5rem rgba(255,200,60,.8);transition:transform .5s cubic-bezier(.2,1.6,.4,1)}
.tk .banner.on{transform:translate(-50%,0) scale(1) rotate(-3deg)}
.tk .banner b{display:block;font-size:6rem;line-height:1.05;letter-spacing:.05em}.tk .banner span{display:block;font-size:2.2rem;letter-spacing:.14em;margin-top:-.2rem}
/* Ollie's subtitle ("電腦語音" label included) sits above Ollie while the show runs, so it never covers the stage picture */
body.tk-on #cap{display:block;left:calc(50% - 24.7rem);top:8rem;width:25rem;max-width:25rem;padding:.6rem 1.3rem .7rem;font-size:2.2rem;line-height:1.14;text-align:center;border-radius:2.4rem;background:linear-gradient(#fff,#e6ecff);color:#14215a;box-shadow:0 .6rem 0 #8fa2ff,0 1.4rem 2.4rem rgba(0,0,0,.45)}
body.tk-on #cap:after{content:"";position:absolute;left:9rem;top:100%;border:1.3rem solid transparent;border-top:1.7rem solid #e6ecff;border-bottom:0;filter:drop-shadow(0 .4rem 0 #8fa2ff)}
body.tk-on:has(.clap-banner) #cap{opacity:0}
body.tk-on .clap-banner{width:max-content;max-width:94vw}
body.tk-on #cap img{display:none}
body.tk-on:has(#cap.show) .tk .hbub{opacity:0}
@media (prefers-reduced-motion:reduce){.tk .bm,.tk .p,.tk .prop,.tk .pw{animation:none!important}}
`;

  /* ---------------------------------------------------------------------
     3. Studio parts built once
     --------------------------------------------------------------------- */
  let api = null, built = false;
  const el = {};
  let timers = new Set(), raf = 0, parts = [], cw = 0, ch = 0, flashLog = [], cheerT = 0, lastTap = 0;

  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); try { fn(); } catch (e) { console.error(e); } }, ms); timers.add(id); return id; };
  const clearTimers = () => { timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); timers.clear(); };
  /** wait ms, but wake up at once when the teacher pressed Esc */
  const wait = (ms) => new Promise((res) => { const t0 = Date.now(); const id = setInterval(() => { if (!api || api.aborted || Date.now() - t0 >= ms) { clearInterval(id); timers.delete(id); res(); } }, 40); timers.add(id); });
  /** await something (speech, banner, ...) but never longer than Esc */
  const guard = (p) => { let id; const ab = new Promise((res) => { id = setInterval(() => { if (!api || api.aborted) res(); }, 80); timers.add(id); }); return Promise.race([Promise.resolve(p).catch(() => {}), ab]).then(() => { clearInterval(id); timers.delete(id); }); };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

  function skyline() {
    let s = "", x = 0;
    while (x < 300) { const w = rnd(7, 15), hh = rnd(14, 52); s += `<rect x="${f1(x)}" y="${f1(64 - hh)}" width="${f1(w)}" height="${f1(hh)}" fill="#18236e"/>`;
      for (let wy = 64 - hh + 4; wy < 60; wy += 6) for (let wx = x + 2; wx < x + w - 3; wx += 4.5) if (Math.random() < 0.38) s += `<rect x="${f1(wx)}" y="${f1(wy)}" width="2.2" height="2.6" fill="${Math.random() < 0.5 ? "#ffe9a0" : "#9fe6ff"}" opacity=".85"/>`;
      x += w + rnd(0, 2.5); }
    return `<svg class="sky" viewBox="0 0 300 64" preserveAspectRatio="none">${s}</svg>`;
  }
  function person(row, x, d, up, phone) {
    const col = row === "f" ? "#04061a" : "#0f1647", rim = row === "f" ? "#2a3a98" : "#3a50b8";
    const arm = (side) => { const sx = side === "l" ? 13 : 47, hx = side === "l" ? 4 : 56;
      return `<g class="arm ${side}"><path d="M${sx} 72 L${hx} 14" stroke="${col}" stroke-width="9.5" stroke-linecap="round" fill="none"/><circle cx="${hx}" cy="8" r="6.8" fill="${col}" stroke="${rim}" stroke-width="1"/>${phone && side === "r" ? `<rect x="49" y="-9" width="10" height="16" rx="2" fill="#bfe9ff" stroke="#0b1030" stroke-width="1.6" transform="rotate(8 54 0)"/>` : ""}</g>`; };
    return h("div", { class: "p " + row + (up ? " up" : ""), style: `left:calc(${x}% - ${row === "f" ? 5.2 : 3.7}rem);--d:${d}s`, html: `<svg viewBox="0 0 60 92">${arm("l")}${arm("r")}<g fill="${col}" stroke="${rim}" stroke-width="1.2"><path d="M2 92 Q2 54 30 50 Q58 54 58 92Z"/><circle cx="30" cy="28" r="14"/></g></svg>` });
  }
  /** a confetti cannon; the hub cap of its wheel carries the school's mark (mirror = the right-hand cannon, which is flipped by CSS:
      its mark is flipped back so that 土城 reads the right way round) */
  function cannonSVG(mirror) {
    return `<svg viewBox="0 0 90 90"><defs><linearGradient id="tkcn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset=".5" stop-color="#e8a21a"/><stop offset="1" stop-color="#8a5a00"/></linearGradient></defs>`
      + `<g transform="rotate(-48 34 60)"><rect x="6" y="46" width="62" height="28" rx="8" fill="url(#tkcn)" stroke="#6a3c00" stroke-width="2"/><rect x="56" y="40" width="18" height="40" rx="6" fill="#ff5fa2" stroke="#8a1c4a" stroke-width="2"/>`
      + `<path d="M20 46 V74 M32 46 V74 M44 46 V74" stroke="#6a3c00" stroke-width="2" opacity=".5"/></g>`
      + `<circle cx="30" cy="72" r="16" fill="#3a2a1a" stroke="#1a1008" stroke-width="2"/><circle cx="30" cy="72" r="13" fill="#7a5426"/>`
      + `<g${mirror ? ` transform="translate(60 0) scale(-1 1)"` : ""}>${TC.seal(30, 72, 8.6)}</g></svg>`;
  }

  function mount(a) {
    api = a;
    if (built) return;
    built = true;
    a.stage.append(h("style", {}, css));
    const root = h("div", { class: "tk" });
    root.innerHTML = `<div class="wall"></div>${skyline()}
<div class="beams"><i class="bm b1"></i><i class="bm b2"></i><i class="bm b3"></i></div>
<div class="floor"></div><div class="pit"></div><div class="cur l"></div><div class="cur r"></div><div class="val"></div>
<div class="tv"><div class="scr"><div class="bug"><svg viewBox="-20 -20 40 40">${TC.seal(0, 0, 14.6, 0, "print")}</svg></div><div class="live"><i></i>LIVE</div>
  <div class="idle"><img src="${TC.art("talk-tv")}" alt=""><b>Ollie Talk Show</b><span class="zh">歐力脫口秀</span></div>
  <div class="pw"><img class="prop" alt=""></div><div class="stat"></div></div></div>
<div class="seat host"><img class="chair" src="${TC.art("talk-chair")}" alt=""><div class="ow"></div></div>
<div class="seat guest"><img class="chair" src="${TC.art("talk-chair")}" alt=""><img class="kid" src="${TC.art("talk-kid")}" alt=""></div>
<div class="gsign">GUEST OF HONOUR<span class="zh">今日貴賓</span></div>
<div class="hbub"></div><div class="gbub"></div>
<div class="desk"><div class="top"></div><div class="front"><b>OLLIE</b><span class="logo"><svg viewBox="-20 -20 40 40">${TC.seal(0, 0, 14.6, 0, "print")}</svg></span><b>SHOW</b></div><img class="mic" src="${TC.art("talk-mic")}" alt=""><div class="plate">OLLIE 歐力</div><img class="mug" src="${TC.art("talk-mug")}" alt=""></div>
<div class="onair"><div class="lens"><i></i><b>ON AIR</b></div></div>
<div class="meter"><div class="ml">APPLAUSE<small class="zh">掌聲</small></div><div class="segs">${"<i class=\"seg\"></i>".repeat(6)}</div></div>
<div class="cannon l">${cannonSVG(false)}</div><div class="cannon r">${cannonSVG(true)}</div>
<div class="aud"></div><canvas class="conf"></canvas><div class="banner"><b>全場滿堂彩！</b><span>APPLAUSE FULL!</span></div>`;
    a.stage.append(root);
    el.root = root;
    ["beams", "tv", "idle", "pw", "prop", "stat", "ow", "kid", "hbub", "gbub", "onair", "aud", "conf", "banner"].forEach((k) => { el[k] = root.querySelector(k === "tv" ? ".tv" : "." + k); });
    el.segs = [...root.querySelectorAll(".seg")];
    el.cannons = [...root.querySelectorAll(".cannon")];
    el.ow.innerHTML = TC.ollieSVG();
    // the audience: two rows of dark silhouettes, some with raised hands and phones
    const N = 14;
    for (let i = 0; i < N; i++) el.aud.append(person("b", ((i + 0.5) / N) * 100 + rnd(-1, 1), (i % 5) * 0.07, Math.random() < 0.5, Math.random() < 0.18));
    const M = 10;
    for (let i = 0; i < M; i++) el.aud.append(person("f", ((i + 0.5) / M) * 100 + rnd(-1.5, 1.5), (i % 4) * 0.09, Math.random() < 0.4, Math.random() < 0.25));
    // touch: the screen is alive (tap the audience, Ollie or the prop)
    el.aud.addEventListener("pointerdown", () => { TC.ac(); if (Date.now() - lastTap < 900) return; lastTap = Date.now(); crowd(1.1, 0.5); cheer(1200); flash(); });
    el.ow.addEventListener("pointerdown", () => { TC.ac(); TC.sfx("pop"); el.ow.animate([{ transform: "translateY(0)" }, { transform: "translateY(-1.6rem) rotate(-5deg)" }, { transform: "none" }], { duration: 420, easing: "ease-out" }); });
    el.kid.addEventListener("pointerdown", () => { TC.ac(); TC.sfx("pop"); el.kid.animate([{ transform: "scale(1)" }, { transform: "scale(1.08,.94)" }, { transform: "scale(1)" }], { duration: 300 }); });
    el.prop.addEventListener("pointerdown", () => { TC.ac(); TC.sfx("pop"); el.prop.animate([{ transform: "rotate(0)" }, { transform: "rotate(-6deg) scale(1.06)" }, { transform: "rotate(5deg)" }, { transform: "none" }], { duration: 420 }); });
  }

  /* ---------------------------------------------------------------------
     4. Effects
     --------------------------------------------------------------------- */
  let clapBuf = null;
  /** a crowd: a swell of filtered noise + many little claps (WebAudio, no files) */
  function crowd(sec, vol) {
    const c = TC.ac(); if (!c) return;
    const v = (TC.cfg.volume == null ? 0.9 : TC.cfg.volume) * (vol == null ? 1 : vol), t = c.currentTime;
    const master = c.createGain(); master.gain.value = 1; master.connect(c.destination);
    const len = Math.floor(c.sampleRate * sec), nb = c.createBuffer(1, len, c.sampleRate), d = nb.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
    src.buffer = nb; bp.type = "bandpass"; bp.frequency.value = 950; bp.Q.value = 0.5;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.1 * v, t + sec * 0.3); g.gain.linearRampToValueAtTime(0.0001, t + sec);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t);
    if (!clapBuf || clapBuf.sampleRate !== c.sampleRate) {
      const cl = Math.floor(c.sampleRate * 0.07); clapBuf = c.createBuffer(1, cl, c.sampleRate); const cd = clapBuf.getChannelData(0);
      for (let i = 0; i < cl; i++) cd[i] = (Math.random() * 2 - 1) * Math.exp((-i / cl) * 8);
    }
    const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1400; hp.connect(master);
    const n = Math.round(sec * 38);
    for (let i = 0; i < n; i++) {
      const pos = Math.random(), s = c.createBufferSource(), gg = c.createGain();
      s.buffer = clapBuf; s.playbackRate.value = rnd(0.8, 1.4);
      gg.gain.value = rnd(0.05, 0.2) * v * (0.25 + Math.sin(Math.PI * Math.min(1, pos * 0.96 + 0.03)));
      s.connect(gg); gg.connect(hp); s.start(t + pos * sec);
    }
    if (vol > 0.9) for (let k = 0; k < 3; k++) { // a few "whoo!" voices
      const o = c.createOscillator(), og = c.createGain(), at = t + rnd(0.1, sec * 0.7);
      o.type = "triangle"; o.frequency.setValueAtTime(rnd(420, 560), at); o.frequency.exponentialRampToValueAtTime(rnd(760, 980), at + 0.28); o.frequency.exponentialRampToValueAtTime(rnd(560, 700), at + 0.55);
      og.gain.setValueAtTime(0.0001, at); og.gain.linearRampToValueAtTime(0.045 * v, at + 0.08); og.gain.linearRampToValueAtTime(0.0001, at + 0.6);
      o.connect(og); og.connect(master); o.start(at); o.stop(at + 0.65);
    }
  }
  /** the audience jumps and waves for ms */
  function cheer(ms) {
    if (!el.aud) return;
    el.aud.classList.add("cheer"); clearTimeout(cheerT); timers.delete(cheerT);
    cheerT = later(() => el.aud.classList.remove("cheer"), ms);
  }
  /** one camera-flash sparkle somewhere in the audience, never more than 3 per second */
  function flash() {
    if (!el.root) return;
    const now = performance.now(); flashLog = flashLog.filter((t) => now - t < 1000);
    if (flashLog.length >= 3) return;
    flashLog.push(now);
    const f = h("i", { class: "fl", style: `left:${rnd(6, 94).toFixed(1)}%;top:${rnd(45, 56).toFixed(1)}rem` });
    el.root.append(f); later(() => f.remove(), 460);
  }
  function setKid(up) { if (el.kid) { el.kid.src = TC.art(up ? "talk-kid-up" : "talk-kid"); el.kid.classList.toggle("up", !!up); } }
  function ollieCheer(ms) { TC.ollie("cheer"); later(() => TC.ollie("idle"), ms); }
  /** applause: crowd sound + audience cheer + guest arms up + camera flashes */
  function applause(sec, vol, flashes) {
    crowd(sec, vol); cheer(sec * 1000); setKid(true); later(() => setKid(false), sec * 1000);
    for (let i = 0; i < flashes; i++) later(flash, 120 + i * 420);
  }
  function setMeter(k) {
    k = Math.max(0, Math.min(6, k));
    el.segs.forEach((s, i) => {
      if (i < k) { if (!s.classList.contains("on")) { s.classList.add("on", "pop"); later(() => s.classList.remove("pop"), 600); } } else s.classList.remove("on", "pop");
    });
  }
  function say(t, zh) {
    const b = el.hbub; b.classList.remove("on", "nozh"); void b.offsetWidth;
    if (!t) return;
    b.innerHTML = `<b>${esc(t)}</b><span class="zh">${esc(zh || "")}</span>`;
    // the bubble must end above the crest on Ollie's headrest: shrink the type until it fits; a very long line drops its
    // Chinese (the talk bar shows it too) rather than become too small to read
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16, max = 8.4 * rem;
    const fits = () => [2.7, 2.5, 2.3, 2.1, 1.9].some((f) => { b.style.fontSize = f + "rem"; return b.offsetHeight <= max; });
    if (!fits()) { b.classList.add("nozh"); fits(); }
    b.classList.add("on");
  }
  function guestSay(x, tryIt) {
    const g = el.gbub; g.classList.remove("on", "try"); void g.offsetWidth;
    const txt = esc(x.say).replace(new RegExp("(" + String(x.w).replace(/[^a-z]/gi, "") + ")", "i"), "<em>$1</em>");
    g.innerHTML = `<b>${txt}</b><span class="zh">${tryIt ? "跟著歐力唸一次！" : esc(x.zh)}</span>`;
    // the answer stays on one line ("You're welcome."), so the bubble never reaches down to the crest on the guest's headrest
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16, bb = g.firstChild;
    [2.6, 2.4, 2.2, 2, 1.8].some((f) => { bb.style.fontSize = f + "rem"; return g.offsetHeight <= 7.6 * rem; });
    g.classList.add("on");
  }
  function showProp(img, alt) {
    el.idle.style.display = "none"; el.pw.style.display = "block";
    el.prop.src = TC.art(img); el.prop.alt = alt || img;
    el.prop.classList.remove("in"); el.stat.classList.remove("go"); void el.prop.offsetWidth;
    el.prop.classList.add("in"); el.stat.classList.add("go"); TC.sfx("pop");
  }
  function cannons() {
    const cv = el.conf, r = cv.getBoundingClientRect();
    cw = cv.width = Math.max(320, r.width | 0); ch = cv.height = Math.max(200, r.height | 0);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 12, sc = ch / 768;
    const cols = ["#ffc83d", "#ff5fa2", "#2ee6b6", "#4cc9ff", "#9b6bff", "#ffffff", "#ff7a45"];
    el.cannons.forEach((c) => { c.classList.remove("fire"); void c.offsetWidth; c.classList.add("fire"); });
    TC.sfx("snare"); TC.sfx("whoosh"); later(() => TC.sfx("snare"), 160);
    [-1, 1].forEach((side) => {
      const x0 = cw / 2 + side * 48.3 * rem, y0 = 36.6 * rem; // the mouths of the two cannons
      for (let i = 0; i < 90 && parts.length < 420; i++) {
        const th = rnd(50, 82) * Math.PI / 180, sp = rnd(15, 33) * sc, streamer = i % 5 === 0;
        parts.push({ x: x0, y: y0, vx: -side * Math.cos(th) * sp, vy: -Math.sin(th) * sp, w: streamer ? 4 * sc : rnd(7, 13) * sc, h: streamer ? rnd(22, 38) * sc : rnd(5, 9) * sc, c: cols[i % cols.length], a: rnd(0, 6), va: rnd(-0.3, 0.3), life: 1 });
      }
    });
    if (!raf) raf = requestAnimationFrame(confLoop);
  }
  function confLoop() {
    const ctx = el.conf.getContext("2d"); ctx.clearRect(0, 0, cw, ch);
    const sc = ch / 768;
    parts.forEach((p) => { p.vy += 0.5 * sc; p.vx *= 0.986; p.vy *= 0.992; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life -= 0.0042;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6)); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
    parts = parts.filter((p) => p.y < ch + 40 && p.life > 0);
    if (parts.length) raf = requestAnimationFrame(confLoop); else { raf = 0; ctx.clearRect(0, 0, cw, ch); }
  }
  /** back to the quiet studio (called between players and after Esc) */
  function resetScene() {
    clearTimers(); if (raf) cancelAnimationFrame(raf); raf = 0; parts = []; flashLog = [];
    document.body.classList.remove("tk-on");
    if (!built) return;
    try { el.conf.getContext("2d").clearRect(0, 0, el.conf.width, el.conf.height); } catch (e) {}
    el.root.querySelectorAll(".fl").forEach((n) => n.remove());
    el.aud.classList.remove("cheer"); el.onair.classList.remove("gold"); el.beams.classList.remove("spin"); el.banner.classList.remove("on");
    el.cannons.forEach((c) => c.classList.remove("fire"));
    el.hbub.classList.remove("on"); el.gbub.classList.remove("on");
    el.pw.style.display = "none"; el.idle.style.display = "";
    setMeter(0); setKid(false);
    TC.ollie && TC.ollie("idle");
  }

  /* ---------------------------------------------------------------------
     5. The game
     --------------------------------------------------------------------- */
  /** one question: Ollie asks (bubble + prop), the child answers; returns false when Esc was pressed */
  async function turn(x, seg) {
    el.gbub.classList.remove("on");
    if (api.level === 1) say(""); else say(x.t, x.tzh); // 低年級: no booklet question — the bar asks for a letter, then an action
    showProp(x.img, x.w);
    const r = await api.ask({ teacher: x.t, tzh: x.tzh, say: x.say, zh: x.zh, keys: x.keys, word: x.w, hideKey: true });
    if (api.aborted) return false;
    if (r.ok) {
      setMeter(seg); TC.hideTalk(); guestSay(x);
      applause(1.8, 1, 2); ollieCheer(1300);
      await guard(TC.praise());
      await wait(450);
    } else {
      // nobody fails in public: Ollie models the answer, the child says it after him, the audience still claps kindly
      guestSay(x, true);
      await guard(TC.model(x.say, x.w));
      if (api.aborted) return false;
      await guard(TC.waitAction(3500));
      if (api.aborted) return false;
      setMeter(seg); TC.hideTalk(); guestSay(x);
      applause(1.3, 0.55, 1);
      await wait(900);
    }
    return !api.aborted;
  }
  /** the wow moment: the meter is full, ON AIR turns gold, confetti cannons fire, spotlights spin */
  async function wow() {
    TC.hideTalk(); el.hbub.classList.remove("on"); el.gbub.classList.remove("on");
    setMeter(6); TC.sfx("levelup");
    el.onair.classList.add("gold"); el.beams.classList.add("spin");
    showProp("trophy", "trophy");
    el.banner.classList.add("on");
    later(cannons, 350); later(() => TC.sfx("fanfare"), 350);
    applause(3.4, 1.3, 4); ollieCheer(3200); TC.confetti(110);
    for (let i = 1; i < 8; i++) later(flash, i * 380);
    await wait(3600);
    el.banner.classList.remove("on");
    await wait(450);
  }

  TC.games.talk = {
    startArt: ["talk-welcome", "talk-bye", "talk-mic", "talk-done", "talk-tv", "talk-fan", "talk-mug", "talk-help", "talk-door", "talk-hand", "talk-chair"],
    mount,
    idle(a) { api = a; if (!built) mount(a); resetScene(); },
    async play(a) {
      api = a;
      if (!built) mount(a);
      resetScene();
      document.body.classList.add("tk-on");
      const G = a.G, n = TC.rounds(5);
      try {
        const order = shuffle(G.qa.slice()).slice(0, n);
        // curtain up: the audience welcomes the guest of honour
        TC.sfx("whoosh"); applause(1.4, 0.6, 2);
        await wait(1500);
        for (let i = 0; i < n; i++) {
          if (a.aborted) return;
          a.progress(i, n);
          if (!(await turn(order[i], Math.round((5 * (i + 1)) / n)))) return;
        }
        if (a.aborted) return;
        a.progress(n, n);
        await wow();
        if (a.aborted) return;
        // finale: "Could you give me a hand?" -> "Of course."  then everybody claps
        if (!(await turn(Object.assign({}, G.finale), 6))) return;
        applause(3.6, 1.2, 3); ollieCheer(3400);
        await guard(TC.clapBanner(3400));
        if (a.aborted) return;
        await wait(300);
        return { ok: true };
      } finally {
        document.body.classList.remove("tk-on");
        if (a.aborted) {
          resetScene();
          document.querySelectorAll(".clap-banner").forEach((n) => n.remove());
          try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {}
        }
      }
    }
  };
})();
