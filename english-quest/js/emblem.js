/* =====================================================================
   Six cute versions of the 土城國小 school badge — one for each GAME.
   The real school emblem (assets/img/tucheng-emblem.svg, traced from the
   school's own emblem) always sits in the middle, whole and unchanged
   (nothing is ever drawn over it); only the decoration around it changes.
   The design follows the gate's game `key` in js/content.js, wherever the
   teacher puts that game:
     rescue  — Classroom Rescue : a lifebuoy ring with a smiling siren on top,
               a ringing bell, a hero shield with a star, a first-aid heart
     talk    — Ollie Talk Show  : a TV-studio marquee ring of light bulbs, an
               "ON AIR" sign, a smiling microphone, speech bubbles
     tpr     — Ollie Says       : a gold PE medal on mint straps with a
               sweatband clasp, a smiling whistle, sneakers, speed lines
     monster — Sound Monsters   : a fuzzy monster eating the badge — horns, big
               eyes peeking over the top, little teeth and claws, letters A b c
     chant   — Classroom Beat   : big DJ headphones on a vinyl record, music notes
     story   — Storybook Day    : a pop-up paper rosette rising from an open
               storybook — bookmark ribbon, pop-up tree, house and star, sparkles
   An unknown game key gets a plain gold ring in that gate's own colour.
   Every version carries a ribbon that says 土城國小 and the game's title.
   TC.badgeSVG(gate) → inline <svg> markup (inline, so the emblem image loads)
   TC.badgeEl(gate, cls) → a <div class="tc-badge ..."> holding it
   ===================================================================== */
(function () {
  "use strict";
  const TC = (window.TC = window.TC || {});
  const EMB = (window.TC_SCHOOL && window.TC_SCHOOL.emblem) || "assets/img/tucheng-emblem.svg";
  const FONT = "'Noto Sans TC','Microsoft JhengHei','PingFang TC','Heiti TC',sans-serif";
  const LATIN = "Fredoka,'Arial Rounded MT Bold','Trebuchet MS',sans-serif";
  let uid = 0;

  // ribbon colours (c1 → c2), text outline (ink) and the title used when content.js is not there
  const THEME = {
    rescue: { c1: "#ffa53d", c2: "#d95f0a", sub: "CLASSROOM RESCUE" },
    talk: { c1: "#4cc9ff", c2: "#1a6fd6", sub: "OLLIE TALK SHOW" },
    tpr: { c1: "#35e0a8", c2: "#0f9a74", sub: "OLLIE SAYS" },
    monster: { c1: "#a77bff", c2: "#6a3fd0", sub: "SOUND MONSTERS" },
    chant: { c1: "#ff6fb0", c2: "#c02a78", sub: "CLASSROOM BEAT" },
    story: { c1: "#ffc83d", c2: "#e58a00", ink: "#a85c00", sub: "STORYBOOK DAY" }
  };
  const ORDER = ["rescue", "talk", "tpr", "monster", "chant", "story"]; // only used when content.js is missing
  const n1 = (v) => Math.round(v * 10) / 10;
  const rad = (d) => (d * Math.PI) / 180;
  const mix = (hex, to, t) => { // blend #rrggbb towards another colour
    if (!/^#[0-9a-f]{6}$/i.test(hex || "")) return to;
    const p = (h, i) => parseInt(h.slice(i, i + 2), 16);
    return "#" + [1, 3, 5].map((i) => Math.round(p(hex, i) + (p(to, i) - p(hex, i)) * t).toString(16).padStart(2, "0")).join("");
  };

  /* ---------- the designs: each one fills k.defs / k.back (behind the emblem) / k.front (around it, never over it) ---------- */
  const DRAW = {
    /* ===== Classroom Rescue: a lifebuoy with a siren ===== */
    rescue(k) {
      k.cy = 214;
      const { cx, cy, g, rg, u, pt, arc, face, sparkle, star, heart } = k, ri = 133, ro = 167, rm = 150, w = ro - ri, ol = "#a8480a";
      k.defs += g("bw", [[0, "#ffffff"], [1, "#d9e3f7"]]) + g("bo", [[0, "#ffb648"], [0.5, "#ff7a1f"], [1, "#e0480c"]]) + rg("sir", [[0, "#ffe1d2"], [0.45, "#ff5a3c"], [1, "#c9200e"]], 0.38, 0.3) +
        g("sirb", [[0, "#8494bb"], [1, "#2a3350"]]) + g("gold", [[0, "#fff3b0"], [0.45, "#ffd23d"], [1, "#e09200"]]) + g("shd", [[0, "#86c9ff"], [0.5, "#2f7fe6"], [1, "#1746a8"]]) +
        rg("glow", [[0, "#fff6b0", 0.9], [1, "#ffd23d", 0]], 0.5, 0.5, 0.5);
      let b = `<circle cx="${cx}" cy="${cy + 8}" r="${ro + 2}" fill="#000" opacity=".22"/>`;
      // the grab rope on both sides
      [[150, 210, 180], [-30, 30, 0]].forEach(([a0, a1, am]) => {
        const p0 = pt(a0, ro - 4), p1 = pt(a1, ro - 4), c = pt(am, ro + 50), d = `M${p0}Q${c} ${p1}`;
        b += `<path d="${d}" stroke="#a86a1e" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#ffe7b3" stroke-width="6" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#e3a851" stroke-width="6" fill="none" stroke-dasharray="3 7"/>`;
      });
      b += `<circle cx="${cx}" cy="${cy}" r="${rm}" fill="none" stroke="${u("bw")}" stroke-width="${w}"/>`;
      [45, 135, 225, 315].forEach((a) => {
        b += `<path d="${arc(rm, a - 17, a + 17)}" stroke="${u("bo")}" stroke-width="${w}" fill="none"/>`;
        [a - 17, a + 17].forEach((e) => (b += `<path d="M${pt(e, ri)}L${pt(e, ro)}" stroke="${ol}" stroke-width="3"/>`));
      });
      b += `<circle cx="${cx}" cy="${cy}" r="${ro}" fill="none" stroke="${ol}" stroke-width="4.5"/><circle cx="${cx}" cy="${cy}" r="${ri}" fill="none" stroke="${ol}" stroke-width="3.5"/>`;
      b += `<path d="${arc(ro - 8, 190, 262)}" stroke="#fff" stroke-width="5" opacity=".6" fill="none" stroke-linecap="round"/><path d="${arc(ri + 7, 15, 80)}" stroke="#7a2a00" stroke-width="6" opacity=".13" fill="none" stroke-linecap="round"/>`;
      // the siren (with a face) on top
      b += `<circle cx="200" cy="12" r="46" fill="${u("glow")}" class="tcb-a"/>`;
      b += `<g stroke="#ffe066" stroke-width="6" stroke-linecap="round" class="tcb-a"><path d="M160 22L141 18"/><path d="M165 2L149 -8"/><path d="M240 22L259 18"/><path d="M235 2L251 -8"/></g>`;
      b += `<rect x="165" y="32" width="70" height="24" rx="9" fill="${u("sirb")}" stroke="#1b2338" stroke-width="4"/><path d="M176 39h28" stroke="#fff" stroke-width="4" opacity=".4" stroke-linecap="round"/>`;
      b += `<path d="M174 34V16Q174 -10 200 -10Q226 -10 226 16V34Z" fill="${u("sir")}" stroke="#9c1a0a" stroke-width="4" stroke-linejoin="round"/><path d="M183 12Q185 -1 196 -3" stroke="#fff" stroke-width="5" opacity=".75" fill="none" stroke-linecap="round"/>` + face(200, 15, 0.52, "#ffd0c0");
      k.back += b;
      // a ringing bell, a hero shield, a first-aid heart
      let f = `<g transform="translate(50 86) rotate(-20)"><path d="M-31 -12Q-38 2 -31 16M31 -12Q38 2 31 16" stroke="#ffe066" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="0" cy="-27" r="6" fill="none" stroke="#b36b00" stroke-width="5"/><circle cx="0" cy="23" r="7.5" fill="#ff7a1f" stroke="${ol}" stroke-width="3"/><path d="M-23 17Q-17 8 -17 -4Q-17 -22 0 -22Q17 -22 17 -4Q17 8 23 17Q23 22 18 22H-18Q-23 22 -23 17Z" fill="${u("gold")}" stroke="#b36b00" stroke-width="4" stroke-linejoin="round"/><path d="M-9 -13Q-11 -3 -12 8" stroke="#fff" stroke-width="5" opacity=".75" stroke-linecap="round" fill="none"/></g>`;
      f += `<g transform="translate(350 86) rotate(14)"><path d="M0 -31L26 -22V2Q26 23 0 34Q-26 23 -26 2V-22Z" fill="${u("shd")}" stroke="#0f2c78" stroke-width="4.5" stroke-linejoin="round"/><path d="M0 -23L19 -16.5V2Q19 17 0 26Q-19 17 -19 2V-16.5Z" fill="none" stroke="#fff" stroke-width="2.5" opacity=".55" stroke-linejoin="round"/>${star(0, 2, 13.5, u("gold"), "#b36b00", 3)}</g>`;
      f += heart(36, 314, 24, "#ff5252") + `<path d="M36 320v15M28.5 327.5h15" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/>` + sparkle(108, 28, 10, "#fff") + sparkle(292, 30, 8, "#ffe58a") + sparkle(374, 322, 11, "#fff");
      k.front += f;
    },

    /* ===== Ollie Talk Show: a TV-studio marquee ===== */
    talk(k) {
      k.cy = 214;
      const { cx, cy, g, rg, u, pt, arc, face, sparkle } = k, ri = 133, ro = 167, rm = 150;
      k.defs += g("ring", [[0, "#2f5fd6"], [0.5, "#17358f"], [1, "#0c1d5c"]]) + rg("bulb", [[0, "#ffffff"], [0.45, "#fff3a8"], [1, "#ffb92e"]], 0.4, 0.35) + g("air", [[0, "#ff7d7d"], [1, "#e0202c"]]) +
        rg("mic", [[0, "#ffffff"], [0.5, "#cbd6f0"], [1, "#7c8bb5"]], 0.35, 0.3) + g("mich", [[0, "#51629a"], [1, "#151d3d"]], 1, 0) + g("bub", [[0, "#ffffff"], [1, "#d8f0ff"]]) + g("bub2", [[0, "#8fe0ff"], [1, "#1a8fe6"]]) +
        rg("halo", [[0, "#fff3a8", 0.75], [1, "#ffd23d", 0]], 0.5, 0.5, 0.5);
      let b = `<circle cx="${cx}" cy="${cy + 8}" r="${ro + 2}" fill="#000" opacity=".25"/><circle cx="${cx}" cy="${cy}" r="${rm}" fill="none" stroke="${u("ring")}" stroke-width="${ro - ri}"/>`;
      b += `<circle cx="${cx}" cy="${cy}" r="${ro}" fill="none" stroke="#4cc9ff" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="${ri}" fill="none" stroke="#7fdcff" stroke-width="3"/>`;
      const n = 20;
      for (let i = 0; i < n; i++) {
        const a = -90 + ((i + 0.5) * 360) / n, [x, y] = pt(a, rm);
        b += `<g class="${i % 2 ? "tcb-b" : "tcb-a"}"><circle cx="${x}" cy="${y}" r="15" fill="${u("halo")}"/><circle cx="${x}" cy="${y}" r="9.5" fill="${u("bulb")}" stroke="#c98600" stroke-width="2"/><circle cx="${n1(x - 3)}" cy="${n1(y - 3.2)}" r="2.6" fill="#fff"/></g>`;
      }
      k.back += b;
      // ON AIR
      let f = `<rect x="132" y="4" width="136" height="58" rx="17" fill="#0c1d5c" stroke="#4cc9ff" stroke-width="4.5"/><rect x="141" y="13" width="118" height="40" rx="10" fill="${u("air")}"/><rect x="147" y="16.5" width="106" height="9" rx="4.5" fill="#fff" opacity=".28"/>`;
      f += `<text x="200" y="43.5" text-anchor="middle" font-family="${LATIN}" font-weight="700" font-size="28" fill="#fff" textLength="98" lengthAdjust="spacingAndGlyphs">ON AIR</text>`;
      // speech bubbles
      f += `<path d="M42 58H72Q92 58 92 78V84Q92 100 78 103L90 123L62 104H42Q22 104 22 84V78Q22 58 42 58Z" fill="${u("bub2")}" stroke="#0f4fa8" stroke-width="4.5" stroke-linejoin="round"/><circle cx="41" cy="81" r="5.5" fill="#fff"/><circle cx="57" cy="81" r="5.5" fill="#fff"/><circle cx="73" cy="81" r="5.5" fill="#fff"/>`;
      f += `<path d="M324 52H364Q386 52 386 74V82Q386 104 364 104H342L310 124L321 103Q302 100 302 82V74Q302 52 324 52Z" fill="${u("bub")}" stroke="#1a6fd6" stroke-width="4.5" stroke-linejoin="round"/><text x="344" y="89" text-anchor="middle" font-family="${LATIN}" font-weight="700" font-size="30" fill="#e8303c">Hi!</text>`;
      // the microphone (with a face)
      f += `<g transform="translate(52 300) rotate(-135)" stroke="#7fdcff" stroke-width="5" fill="none" stroke-linecap="round"><path d="M34 -11Q40 0 34 11"/><path d="M45 -17Q54 0 45 17"/></g>`;
      f += `<g transform="translate(52 300) rotate(30)"><path d="M-10 20L-7 78Q0 85 7 78L10 20Z" fill="${u("mich")}" stroke="#0a1233" stroke-width="4" stroke-linejoin="round"/><rect x="-15" y="17" width="30" height="12" rx="5" fill="#4cc9ff" stroke="#0f4fa8" stroke-width="3.5"/><circle r="25" fill="${u("mic")}" stroke="#34447a" stroke-width="4.5"/><path d="M-23.5 8Q0 17 23.5 8" stroke="#8a98c0" stroke-width="2.5" fill="none" opacity=".8"/><path d="M-17 -10Q-12 -19 -3 -21" stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none"/>${face(0, -2, 0.6)}</g>`;
      f += sparkle(106, 26, 10, "#ffe58a") + sparkle(296, 22, 8, "#fff") + sparkle(372, 318, 12, "#ffe58a");
      k.front += f;
    },

    /* ===== Ollie Says: a PE medal ===== */
    tpr(k) {
      k.cy = 214;
      const { cx, cy, g, gu, u, arc, face, sparkle, bumpy } = k, ri = 133;
      k.defs += gu("gold", [[0, "#fff8c8"], [0.3, "#ffdb52"], [0.7, "#f2ad1c"], [1, "#c98200"]], cx - 140, cy - 160, cx + 140, cy + 160) + g("strap", [[0, "#74f7d2"], [1, "#12b488"]]) +
        g("wh", [[0, "#ffe680"], [0.55, "#ffb030"], [1, "#e87a0c"]]) + g("shoe", [[0, "#6df5cb"], [1, "#11a57e"]]) + g("sole", [[0, "#ffffff"], [1, "#d3e0ee"]]) + g("band", [[0, "#ffffff"], [1, "#dcebe6"]]);
      // the straps
      let b = "";
      ["", ` transform="translate(400 0) scale(-1 1)"`].forEach((t) => (b += `<g${t}><path d="M86 -14H152L226 74L178 98Z" fill="${u("strap")}" stroke="#0b7a5c" stroke-width="4" stroke-linejoin="round"/><path d="M111 -14H127L207 82L193 89Z" fill="#fff" opacity=".7"/></g>`));
      // speed lines
      b += `<g stroke-linecap="round" stroke-width="9"><path d="M2 128H40" stroke="#5ff0c4"/><path d="M-2 152H26" stroke="#fff"/><path d="M6 176H26" stroke="#5ff0c4"/></g>`;
      b += `<circle cx="${cx}" cy="${cy + 8}" r="168" fill="#000" opacity=".22"/>` + bumpy(156, 26, 12, u("gold"), "#9c6400", 4.5);
      b += `<circle cx="${cx}" cy="${cy}" r="147" fill="none" stroke="#fffbe0" stroke-width="3.6" stroke-dasharray="0.1 9.14" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="${ri + 1}" fill="none" stroke="#b87a00" stroke-width="4"/>`;
      b += `<path d="${arc(159, 196, 250)}" stroke="#fff" stroke-width="6" opacity=".6" fill="none" stroke-linecap="round"/>`;
      k.back += b;
      // the sweatband clasp
      let f = `<rect x="162" y="27" width="76" height="34" rx="13" fill="${u("band")}" stroke="#0b7a5c" stroke-width="4"/><path d="M168 39H232" stroke="#2ee6b6" stroke-width="6"/><path d="M168 49H232" stroke="#ff9a2e" stroke-width="6"/><path d="M172 32.5H228M172 55.5H228" stroke="#b9d6cc" stroke-width="2" stroke-dasharray="2 4" stroke-linecap="round"/>`;
      // the whistle (with a face)
      f += `<path d="M362 80Q370 34 286 22" stroke="#0f9a74" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
      f += `<g transform="translate(344 102) rotate(14)"><circle cx="17" cy="-17" r="6.5" fill="none" stroke="#a85a00" stroke-width="4.5"/><path d="M-44 -21H0A21 21 0 1 1 -19.4 -8H-44Z" fill="${u("wh")}" stroke="#a85a00" stroke-width="4.5" stroke-linejoin="round"/><rect x="-21" y="-18.5" width="13" height="6" rx="2.5" fill="#8a4200" opacity=".7"/><path d="M-39 -16.5H-26" stroke="#fff" stroke-width="3.5" opacity=".7" stroke-linecap="round"/>${face(1, 2, 0.56, "#ff8a5a")}<g stroke="#ffe066" stroke-width="4.5" stroke-linecap="round"><path d="M-22 -29L-27 -40"/><path d="M-12 -30L-10 -42"/><path d="M-32 -27L-42 -34"/></g></g>`;
      // the sneakers
      const shoe = `<path d="M-41 3V8Q-41 18 -31 18H29Q41 18 41 7V3Z" fill="${u("sole")}" stroke="#0b6b52" stroke-width="4" stroke-linejoin="round"/><path d="M-39 4V-19Q-39 -27 -31 -27H-19Q-12 -27 -9 -21Q-3 -9 10 -7Q31 -5 38 4Z" fill="${u("shoe")}" stroke="#0b6b52" stroke-width="4" stroke-linejoin="round"/><path d="M19 -5.5Q32 -3 37 3H14Q13 -3 19 -5.5Z" fill="#fff" opacity=".92"/><path d="M-8 -15L-1 -20M-1 -9.5L6 -14.5M7 -5L13 -10" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/><path d="M-26 0L-19 -14M-16 0L-10 -11" stroke="#ffd23d" stroke-width="5" stroke-linecap="round"/><rect x="-39.5" y="-25" width="7" height="11" rx="3" fill="#ff9a2e"/><path d="M-35 12H35" stroke="#b5c5d6" stroke-width="2.2" stroke-linecap="round"/>`;
      f += `<g transform="translate(62 296) rotate(-34) scale(.8)">${shoe}</g><g transform="translate(44 330) rotate(-10)">${shoe}</g>`;
      f += `<path d="M-2 318h-2M0 334h-4" stroke="#5ff0c4" stroke-width="5" stroke-linecap="round"/>` + sparkle(388, 252, 9, "#fff") + sparkle(60, 60, 11, "#fff6c8") + sparkle(372, 322, 11, "#ffe58a");
      k.front += f;
    },

    /* ===== Sound Monsters: a fuzzy monster eating the badge ===== */
    monster(k) {
      k.cy = 216;
      const { cx, cy, g, rg, rgu, u, pt, sparkle, bumpy } = k, ol = "#3f2291", rmouth = 148;
      k.defs += rgu("fur", [[0, "#d9c6ff"], [0.45, "#a77bff"], [1, "#6f42dc"]], cx - 50, cy - 90, 260) + rgu("mouth", [[0, "#6a3396"], [0.8, "#2c114d"], [1, "#1c0a33"]], cx, cy, rmouth) +
        g("horn", [[0, "#fff6bc"], [1, "#ffb22e"]]) + rg("eye", [[0, "#ffffff"], [0.75, "#ffffff"], [1, "#d6ccf2"]], 0.42, 0.38) + g("paw", [[0, "#efe4ff"], [1, "#b99dff"]]);
      // horns (behind the head)
      let b = "";
      ["", ` transform="translate(400 0) scale(-1 1)"`].forEach((t) => (b += `<g${t}><path d="M92 86Q58 52 66 6Q100 28 124 66Z" fill="${u("horn")}" stroke="#b36b00" stroke-width="4.5" stroke-linejoin="round"/><path d="M71 33Q83 31 91 41M77 56Q92 51 104 62" stroke="#e08a00" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/></g>`));
      b += `<circle cx="${cx}" cy="${cy + 8}" r="178" fill="#000" opacity=".22"/>`;
      // the fuzzy body + two eye bumps
      b += `<g fill="${ol}" stroke="${ol}" stroke-width="9"><circle cx="160" cy="52" r="37"/><circle cx="240" cy="52" r="37"/></g>` + bumpy(166, 30, 13.5, u("fur"), ol, 4.5, 6) + `<g fill="${u("fur")}"><circle cx="160" cy="52" r="37"/><circle cx="240" cy="52" r="37"/></g>`;
      [[157, 6], [168, 4.5], [147, 4], [23, 6], [12, 4.5], [33, 4], [200, 5], [340, 5], [211, 3.5], [329, 3.5]].forEach(([a, r]) => { const [x, y] = pt(a, 164); b += `<circle cx="${x}" cy="${y}" r="${r}" fill="#5a34c4" opacity=".45"/>`; });
      b += `<ellipse cx="78" cy="118" rx="12" ry="7.5" transform="rotate(-52 78 118)" fill="#ff9ed0" opacity=".85"/><ellipse cx="322" cy="118" rx="12" ry="7.5" transform="rotate(52 322 118)" fill="#ff9ed0" opacity=".85"/>`;
      // the open mouth around the badge, with little teeth
      b += `<circle cx="${cx}" cy="${cy}" r="${rmouth}" fill="${u("mouth")}" stroke="${ol}" stroke-width="4.5"/>`;
      let teeth = "";
      const tooth = (a, i) => { teeth += `<path d="M${pt(a - 4.2, rmouth - 1)}L${pt(a, i % 2 ? 138 : 135)}L${pt(a + 4.2, rmouth - 1)}Z"/>`; };
      for (let i = 0; i < 12; i++) { tooth(207 + i * 11.45, i); tooth(27 + i * 11.45, i + 1); }
      b += `<g fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round">${teeth}</g>`;
      k.back += b;
      // paws with claws, gripping the rim
      let f = "";
      ["", ` transform="translate(400 0) scale(-1 1)"`].forEach((t) => (f += `<g${t}><g fill="#fff" stroke="${ol}" stroke-width="2.5" stroke-linejoin="round"><path d="M50 203L67 209L50 215Z"/><path d="M51 217L68 224L51 231Z"/><path d="M50 233L67 239L50 245Z"/></g><ellipse cx="38" cy="224" rx="19" ry="29" fill="${u("paw")}" stroke="${ol}" stroke-width="4.5"/><path d="M28 206Q31 199 37 198" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".8"/></g>`));
      // big eyes peeking over the top
      [[160, 1], [240, -1]].forEach(([x, s]) => (f += `<g class="tc-blink" style="transform-origin:${x}px 52px"><circle cx="${x}" cy="52" r="31" fill="${u("eye")}" stroke="${ol}" stroke-width="4.5"/><circle cx="${x + 6 * s}" cy="61" r="15.5" fill="#1b1b2e"/><circle cx="${x + 6 * s - 5}" cy="55" r="5.6" fill="#fff"/><circle cx="${x + 6 * s + 5}" cy="67" r="2.6" fill="#fff" opacity=".85"/></g>`));
      // letters around
      const letter = (ch, x, y, s, c, r) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="${LATIN}" font-weight="700" font-size="${s}" fill="${c}" stroke="${ol}" stroke-width="7" stroke-linejoin="round" paint-order="stroke" transform="rotate(${r} ${x} ${y})">${ch}</text>`;
      f += letter("A", 30, 62, 50, "#ffd23d", -14) + letter("b", 374, 64, 50, "#2ee6b6", 12) + letter("c", 30, 344, 46, "#ff7ac0", -10) + sparkle(378, 322, 10, "#fff") + sparkle(200, 2, 7, "#fff");
      k.front += f;
    },

    /* ===== Classroom Beat: DJ headphones on a vinyl record ===== */
    chant(k) {
      k.cy = 212;
      const { cx, cy, g, rgu, u, pt, arc, face, sparkle } = k, ro = 160;
      k.defs += rgu("vinyl", [[0, "#40345f"], [0.82, "#241b3d"], [1, "#120c22"]], cx, cy, ro) + g("band", [[0, "#ffa6d2"], [1, "#e2408a"]]) + g("cup", [[0, "#ff9acb"], [0.5, "#e8458f"], [1, "#a01c5c"]], 1, 1) + g("pad", [[0, "#ffe3f0"], [1, "#ffb3d6"]]);
      let b = `<circle cx="${cx}" cy="${cy + 8}" r="${ro + 2}" fill="#000" opacity=".25"/><circle cx="${cx}" cy="${cy}" r="${ro}" fill="${u("vinyl")}" stroke="#ff8fc4" stroke-width="4"/>`;
      for (let r = 137; r <= 155; r += 4.5) b += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#5a4a86" stroke-width="1.5" opacity=".85"/>`;
      [[-62, -30], [118, 150]].forEach(([a0, a1]) => (b += `<path d="M${pt(a0, 134)}L${pt(a0, ro - 3)}A${ro - 3} ${ro - 3} 0 0 1 ${pt(a1, ro - 3)}L${pt(a1, 134)}A134 134 0 0 0 ${pt(a0, 134)}Z" fill="#fff" opacity=".13"/>`));
      b += `<circle cx="${cx}" cy="${cy}" r="133" fill="none" stroke="#ff6fb0" stroke-width="3"/>`;
      k.back += b;
      // the headphones
      const band = "M36 180Q26 22 200 18Q374 22 364 180";
      let f = `<path d="${band}" stroke="#8a1650" stroke-width="33" fill="none" stroke-linecap="round"/><path d="${band}" stroke="${u("band")}" stroke-width="24" fill="none" stroke-linecap="round"/>`;
      f += `<path d="M132 27Q200 12 268 27" stroke="#8a1650" stroke-width="40" fill="none" stroke-linecap="round"/><path d="M132 27Q200 12 268 27" stroke="${u("pad")}" stroke-width="31" fill="none" stroke-linecap="round"/><path d="M136 27Q200 13 264 27" stroke="#ff8fc4" stroke-width="2.5" fill="none" stroke-dasharray="5 6" stroke-linecap="round"/>`;
      f += `<path d="M52 128Q66 60 112 40" stroke="#fff" stroke-width="5.5" opacity=".5" fill="none" stroke-linecap="round"/>`;
      [[4, 35, 0.9], [334, 365, 1]].forEach(([x, m, wink]) => {
        f += `<rect x="${x}" y="158" width="62" height="110" rx="28" fill="${u("cup")}" stroke="#7a1446" stroke-width="5"/><rect x="${x + 8}" y="170" width="46" height="86" rx="21" fill="${u("pad")}" stroke="#c9357e" stroke-width="2.5"/><path d="M${x + 14} 192Q${x + 14} 180 ${x + 25} 177" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>` + face(m, 214, 0.6 * wink / wink, "#ff8fb1");
      });
      const note = (x, y, c, r = 0, two = 0) => `<g transform="translate(${x} ${y}) rotate(${r})" stroke-linecap="round" stroke-linejoin="round"><g stroke="#2a1040" stroke-width="9" fill="#2a1040"><ellipse rx="10" ry="7.5" transform="rotate(-20)"/><path d="M9 -2V-38${two ? "L35 -44V-8" : "L25 -31"}" fill="none"/>${two ? `<ellipse cx="26" cy="-6" rx="10" ry="7.5" transform="rotate(-20 26 -6)"/>` : ""}</g><g stroke="${c}" stroke-width="5" fill="${c}"><ellipse rx="10" ry="7.5" transform="rotate(-20)"/><path d="M9 -2V-38${two ? "L35 -44V-8" : "L25 -31"}" fill="none"/>${two ? `<ellipse cx="26" cy="-6" rx="10" ry="7.5" transform="rotate(-20 26 -6)"/>` : ""}</g></g>`;
      f += note(14, 106, "#4cc9ff", -10) + note(378, 112, "#ffd23d", 8) + note(22, 338, "#ffd23d", -8, 1) + note(356, 320, "#2ee6b6", 6) + sparkle(84, 14, 11, "#ffe58a") + sparkle(318, 12, 9, "#fff") + sparkle(392, 300, 8, "#fff");
      k.front += f;
    },

    /* ===== Storybook Day: a pop-up book ===== */
    story(k) {
      k.cy = 182; k.ribY = 404; k.ribW = 138;
      const { cx, cy, g, u, pt, face, sparkle, star } = k, ol = "#c98600";
      k.defs += g("pgl", [[0, "#fffdf3"], [0.7, "#f8eccb"], [1, "#e3d3a8"]], 1, 0) + g("pgr", [[0, "#e3d3a8"], [0.3, "#f8eccb"], [1, "#fffdf3"]], 1, 0) + g("cover", [[0, "#7686ff"], [1, "#3038b0"]]) + g("bm", [[0, "#ff8494"], [1, "#e0304f"]]) + g("gold", [[0, "#fff3b0"], [0.5, "#ffd23d"], [1, "#f0a000"]]);
      // the open book
      let b = `<path d="M200 318Q110 274 4 292V378Q110 362 200 402Q290 362 396 378V292Q290 274 200 318Z" fill="#000" opacity=".22"/>`;
      b += `<path d="M200 312Q110 268 4 286V372Q110 356 200 396Q290 356 396 372V286Q290 268 200 312Z" fill="${u("cover")}" stroke="#1f2580" stroke-width="4.5" stroke-linejoin="round"/>`;
      b += `<path d="M14 359Q112 343 200 383Q288 343 386 359V367Q288 351 200 391Q112 351 14 367Z" fill="#efe2bd" stroke="#bfae82" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 363Q112 347 200 387Q288 347 386 363" stroke="#bfae82" stroke-width="1.4" fill="none"/>`;
      b += `<path d="M200 306Q112 262 14 280V360Q112 344 200 384Z" fill="${u("pgl")}" stroke="#bfae82" stroke-width="3" stroke-linejoin="round"/><path d="M200 306Q288 262 386 280V360Q288 344 200 384Z" fill="${u("pgr")}" stroke="#bfae82" stroke-width="3" stroke-linejoin="round"/>`;
      b += `<g stroke="#c9b582" stroke-width="3.4" fill="none" stroke-linecap="round"><path d="M54 318Q104 311 150 326"/><path d="M54 332Q104 325 160 342"/><path d="M54 346Q104 339 166 357"/><path d="M346 318Q296 311 250 326"/><path d="M346 332Q296 325 240 342"/></g>`;
      // the paper rosette that pops up behind the emblem
      const n = 22; let zig = "", pleats = "";
      for (let i = 0; i < n * 2; i++) {
        const a = -90 + (i * 180) / n, a2 = a + 180 / n, r = i % 2 ? 153 : 163, r2 = i % 2 ? 163 : 153;
        zig += (i ? "L" : "M") + pt(a, r);
        pleats += `<path d="M${pt(a, 120)}L${pt(a, r)}L${pt(a2, r2)}L${pt(a2, 120)}Z" fill="${i % 2 ? "#ffd65a" : "#ffe993"}"/>`;
      }
      b += `<path d="${zig}Z" transform="translate(0 7)" fill="#000" opacity=".2"/>` + pleats + `<path d="${zig}Z" fill="none" stroke="${ol}" stroke-width="4" stroke-linejoin="round"/><circle cx="${cx}" cy="${cy}" r="136" fill="none" stroke="#e59a00" stroke-width="8" opacity=".3"/>`;
      k.back += b;
      // bookmark ribbon
      let f = `<path d="M22 274H40V384L31 373L22 384Z" fill="${u("bm")}" stroke="#a81c3a" stroke-width="3.5" stroke-linejoin="round"/><path d="M27.5 280V362" stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round"/>`;
      // tiny pop-up cut-outs: a tree and a house on the left page, a smiling star on the right
      f += `<path d="M46 300L52 292H104L98 300Z" fill="#fff" stroke="#cdbb8d" stroke-width="2" stroke-linejoin="round"/>`;
      f += `<g stroke="#fff" stroke-width="6" stroke-linejoin="round" paint-order="stroke"><rect x="58.5" y="282" width="7" height="14" fill="#b9793a"/><path d="M62 236L77 261H70L82 284H42L54 261H47Z" fill="#43c987"/><rect x="82" y="274" width="20" height="20" fill="#fff0cf"/><path d="M78 276L92 261L106 276Z" fill="#ff6b5a"/></g><rect x="89" y="282" width="7" height="12" rx="1.5" fill="#7a5cff"/><path d="M55 262L62 250L69 262" stroke="#8fe8b8" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      f += `<path d="M338 304L345 280H355L362 304Z" fill="#fff" stroke="#cdbb8d" stroke-width="2" stroke-linejoin="round"/><path d="M350 281V303" stroke="#cdbb8d" stroke-width="1.6"/>` + star(350, 262, 27, "#fff", "#fff", 7) + star(350, 262, 25, u("gold"), ol, 3) + face(350, 263, 0.5, "#ff9a5a");
      f += sparkle(44, 62, 15, "#fff6c8") + sparkle(356, 54, 13, "#fff") + sparkle(16, 150, 9, "#ffe58a") + sparkle(386, 168, 10, "#fff6c8") + sparkle(112, 10, 8, "#fff") + sparkle(290, 6, 9, "#ffe58a") + sparkle(22, 220, 6, "#fff") + sparkle(200, -4, 6, "#fff");
      k.front += f;
    },

    /* ===== an unknown game: a plain gold ring with stars ===== */
    plain(k) {
      const { cx, cy, gu, u, pt, arc, sparkle, star } = k;
      k.defs += gu("gold", [[0, "#fff8c8"], [0.35, "#ffdb52"], [0.7, "#f2ad1c"], [1, "#c98200"]], cx - 140, cy - 160, cx + 140, cy + 160);
      let b = `<circle cx="${cx}" cy="${cy + 8}" r="160" fill="#000" opacity=".22"/><circle cx="${cx}" cy="${cy}" r="146" fill="none" stroke="#9c6400" stroke-width="35"/><circle cx="${cx}" cy="${cy}" r="146" fill="none" stroke="${u("gold")}" stroke-width="26"/>`;
      b += `<path d="${arc(151, 196, 250)}" stroke="#fff" stroke-width="5" opacity=".6" fill="none" stroke-linecap="round"/>`;
      for (let i = 0; i < 12; i++) { const [x, y] = pt(i * 30 - 75, 146); b += star(x, y, 7, "#fff6c8", "#c98200", 1.5, i * 30 + 15); }
      k.back += b;
      k.front += sparkle(46, 70, 15, "#ffe58a") + sparkle(358, 76, 12, "#fff") + sparkle(28, 300, 10, "#fff") + sparkle(372, 318, 12, "#ffe58a");
    }
  };

  function make(gateNo) {
    const GC = window.TC_CONTENT && window.TC_CONTENT.gates && window.TC_CONTENT.gates[gateNo];
    const key = GC ? (DRAW.hasOwnProperty(GC.key) ? GC.key : "plain") : ORDER[gateNo - 1] || "plain"; // the design follows the gate's GAME
    const col = (GC && GC.color) || "#4cc9ff";
    const T = THEME[key] || { c1: mix(col, "#ffffff", 0.1), c2: mix(col, "#000000", 0.38), sub: "ENGLISH DAY" };
    const id = "tb" + uid++ + "_";
    const stops = (s) => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a == null ? "" : ` stop-opacity="${a}"`}/>`).join("");
    const k = {
      cx: 200, cy: 205, R: 122, ribY: 396, ribW: 150, defs: "", back: "", front: "", // cx, cy, R = the school emblem
      g: (name, s, x2 = 0, y2 = 1) => `<linearGradient id="${id}${name}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`,
      gu: (name, s, x1, y1, x2, y2) => `<linearGradient id="${id}${name}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`,
      rg: (name, s, x = 0.35, y = 0.3, r = 0.8) => `<radialGradient id="${id}${name}" cx="${x}" cy="${y}" r="${r}">${stops(s)}</radialGradient>`,
      rgu: (name, s, x, y, r) => `<radialGradient id="${id}${name}" gradientUnits="userSpaceOnUse" cx="${x}" cy="${y}" r="${r}">${stops(s)}</radialGradient>`,
      u: (name) => `url(#${id}${name})`,
      pt: (deg, r) => [n1(k.cx + Math.cos(rad(deg)) * r), n1(k.cy + Math.sin(rad(deg)) * r)], // a point around the emblem (0° = right, 90° = down); prints as "x,y"
      arc: (r, a0, a1) => `M${k.pt(a0, r)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${k.pt(a1, r)}`,
      sparkle: (x, y, s, c = "#fff") => `<path d="M${x} ${y - s}Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y}Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s}Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y}Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z" fill="${c}"/>`,
      heart: (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s / 20})" d="M0 6C-4-6-20-4-18 8-16 18 0 24 0 28 0 24 16 18 18 8 20-4 4-6 0 6Z" fill="${c}"/>`,
      face: (x, y, s = 1, cheek = "#ff8fb1") => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="-11" cy="0" rx="4.6" ry="6" fill="#1b1b2e"/><ellipse cx="11" cy="0" rx="4.6" ry="6" fill="#1b1b2e"/><circle cx="-9.6" cy="-2" r="1.7" fill="#fff"/><circle cx="12.4" cy="-2" r="1.7" fill="#fff"/><path d="M-5 8Q0 13 5 8" stroke="#1b1b2e" stroke-width="2.6" fill="none" stroke-linecap="round"/><ellipse cx="-19" cy="8" rx="6" ry="3.6" fill="${cheek}" opacity=".75"/><ellipse cx="19" cy="8" rx="6" ry="3.6" fill="${cheek}" opacity=".75"/></g>`,
      star: (x, y, r, fill, stroke = "none", sw = 0, rot = 0) => {
        let d = "";
        for (let i = 0; i < 10; i++) { const a = rad(-90 + i * 36 + rot), q = i % 2 ? r * 0.52 : r; d += (i ? "L" : "M") + n1(x + Math.cos(a) * q) + " " + n1(y + Math.sin(a) * q); }
        return `<path d="${d}Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      },
      bumpy: (r, n, br, fill, stroke, sw, a0 = 0) => { // a disc with a scalloped / fuzzy edge
        let c = `<circle cx="${k.cx}" cy="${k.cy}" r="${r}"/>`;
        for (let i = 0; i < n; i++) { const [x, y] = k.pt(a0 + (i * 360) / n, r); c += `<circle cx="${x}" cy="${y}" r="${br}"/>`; }
        return `<g fill="${stroke}" stroke="${stroke}" stroke-width="${sw * 2}">${c}</g><g fill="${fill}">${c}</g>`;
      }
    };
    DRAW[key](k);
    const { cx, cy, R, ribY, ribW } = k, E = R * 1.065; // E = the emblem's own rim
    const defs = k.defs + k.g("rib", [[0, T.c1], [1, T.c2]]) + k.rgu("es", [[0, "#000", 0.5], [0.9, "#000", 0.42], [1, "#000", 0]], cx, cy + 7, E + 9);
    // ---------- the school emblem (always whole) + 土城國小 ribbon ----------
    const emb = `<circle cx="${cx}" cy="${cy + 7}" r="${n1(E + 9)}" fill="${k.u("es")}"/><image href="${EMB}" x="${n1(cx - R * 1.1)}" y="${n1(cy - R * 1.1)}" width="${n1(R * 2.2)}" height="${n1(R * 2.2)}"/>`;
    const sub = (GC && GC.title ? GC.title : T.sub).toUpperCase(), ink = T.ink || T.c2;
    const rib = `<g transform="translate(200 ${ribY})"><path d="M${-ribW} -24Q0 -38 ${ribW} -24L${ribW} 40Q0 26 ${-ribW} 40Z" fill="#000" opacity=".22"/><path d="M${-ribW - 34} -6L${-ribW + 6} -6L${-ribW + 6} 46L${-ribW - 34} 46L${-ribW - 18} 20Z" fill="${T.c2}"/><path d="M${ribW + 34} -6L${ribW - 6} -6L${ribW - 6} 46L${ribW + 34} 46L${ribW + 18} 20Z" fill="${T.c2}"/><path d="M${-ribW + 6} 34L${-ribW + 6} 46L${-ribW - 6} 34Z M${ribW - 6} 34L${ribW - 6} 46L${ribW + 6} 34Z" fill="#000" opacity=".35"/>
      <path d="M${-ribW} -30Q0 -44 ${ribW} -30L${ribW} 34Q0 20 ${-ribW} 34Z" fill="${k.u("rib")}" stroke="#fff" stroke-width="4"/><path d="M${-ribW + 10} -24Q0 -37 ${ribW - 10} -24" stroke="#fff" stroke-width="3" opacity=".4" fill="none" stroke-linecap="round"/>
      <text x="0" y="4" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="38" fill="#fff" stroke="${ink}" stroke-width="7" stroke-linejoin="round" paint-order="stroke" letter-spacing="4">土城國小</text>
      <text x="0" y="25" text-anchor="middle" font-family="${LATIN}" font-weight="700" font-size="16" fill="#fff" stroke="${ink}" stroke-width="3" stroke-linejoin="round" paint-order="stroke" letter-spacing="2.2"${sub.length > 18 ? ` textLength="${2 * ribW - 36}" lengthAdjust="spacingAndGlyphs"` : ""}>${sub.replace(/[<&]/g, "")}</text></g>`;
    return `<svg class="tc-badge-svg tc-badge-${key}" viewBox="-6 -14 412 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="土城國小校徽 · Gate ${gateNo}"><defs>${defs}</defs>${k.back}${emb}${k.front}${rib}</svg>`;
  }

  TC.badgeSVG = make;
  TC.badgeEl = function (gate, cls = "") {
    const d = document.createElement("div");
    d.className = "tc-badge " + cls;
    d.innerHTML = make(gate);
    return d;
  };
  const css = `.tc-badge{display:inline-block;line-height:0}.tc-badge svg{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 .6rem 1rem rgba(0,0,0,.4))}
  .tc-badge.bob svg{animation:tcBob 3.2s ease-in-out infinite;transform-origin:50% 80%}
  @keyframes tcBob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-3%) rotate(2deg)}}
  @media (prefers-reduced-motion:reduce){.tc-badge.bob svg{animation:none}}`;
  const st = document.createElement("style"); st.textContent = css; (document.head || document.documentElement).append(st);
})();
