/* =====================================================================
   Six cute versions of the 土城國小 school badge — one for each gate.
   The real school emblem (assets/img/tucheng-emblem.svg, traced from the
   school's own emblem) always sits in the middle, whole and unchanged;
   only the decoration around it changes:
     1 kart   — the badge is a racing kart (wheels, checkered ring, flag)
     2 craft  — a ring of glossy pixel blocks with a pixel crown
     3 hatch  — a chick in an eggshell hat (wings, feet)
     4 beat   — big DJ headphones on a vinyl record, music notes
     5 box    — a gift box with a big bow
     6 obby   — a gold medal with ribbons and a laurel wreath
   Every version carries a ribbon that says 土城國小.
   TC.badgeSVG(gate) → inline <svg> markup (inline, so the emblem image loads)
   TC.badgeEl(gate, cls) → a <div class="tc-badge ..."> holding it
   ===================================================================== */
(function () {
  "use strict";
  const TC = (window.TC = window.TC || {});
  const EMB = (window.TC_SCHOOL && window.TC_SCHOOL.emblem) || "assets/img/tucheng-emblem.svg";
  let uid = 0;
  const FONT = "'Noto Sans TC','Microsoft JhengHei','PingFang TC','Heiti TC',sans-serif";

  function make(gate) {
    const id = "tb" + uid++ + "_";
    const g = (name, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}${name}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
    const rg = (name, stops, cx = 0.35, cy = 0.3) => `<radialGradient id="${id}${name}" cx="${cx}" cy="${cy}" r=".8">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</radialGradient>`;
    const u = (name) => `url(#${id}${name})`;
    const sparkle = (x, y, s, c = "#fff") => `<path d="M${x} ${y - s}Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y}Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s}Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y}Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z" fill="${c}"/>`;
    const heart = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s / 20})" d="M0 6C-4-6-20-4-18 8-16 18 0 24 0 28 0 24 16 18 18 8 20-4 4-6 0 6Z" fill="${c}"/>`;
    const face = (x, y, s = 1, cheek = "#ff8fb1") => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="-11" cy="0" rx="4.6" ry="6" fill="#1b1b2e"/><ellipse cx="11" cy="0" rx="4.6" ry="6" fill="#1b1b2e"/><circle cx="-9.6" cy="-2" r="1.7" fill="#fff"/><circle cx="12.4" cy="-2" r="1.7" fill="#fff"/><path d="M-5 8Q0 13 5 8" stroke="#1b1b2e" stroke-width="2.6" fill="none" stroke-linecap="round"/><ellipse cx="-19" cy="8" rx="6" ry="3.6" fill="${cheek}" opacity=".75"/><ellipse cx="19" cy="8" rx="6" ry="3.6" fill="${cheek}" opacity=".75"/></g>`;
    const T = {
      1: { c1: "#4cc9ff", c2: "#1a6fd6", sub: "TURBO KART" }, 2: { c1: "#35e0a8", c2: "#0f9a74", sub: "PIXEL CRAFT" }, 3: { c1: "#ffd23d", c2: "#e09a00", sub: "PET HATCH" },
      4: { c1: "#ff6fb0", c2: "#c02a78", sub: "BEAT PARTY" }, 5: { c1: "#a77bff", c2: "#6a3fd0", sub: "MYSTERY BOX" }, 6: { c1: "#ffa13d", c2: "#d4600a", sub: "SPORTS DAY" }
    }[gate] || { c1: "#4cc9ff", c2: "#1a6fd6", sub: "ENGLISH DAY" };
    let cx = 200, cy = 205, R = 122; // the school emblem
    let defs = g("rib", [[0, T.c1], [1, T.c2]]) + g("ribd", [[0, T.c2], [1, "#000"]]) + rg("glow", [[0, "#fff"], [0.5, T.c1], [1, T.c1]], 0.5, 0.5);
    let back = "", front = "", ribW = 150, ribY = 388;

    if (gate === 1) { // ---------- racing kart ----------
      defs += g("body", [[0, "#7fdcff"], [0.5, "#2f8fff"], [1, "#1452b8"]]) + rg("tyre", [[0, "#5a5f73"], [0.6, "#23263a"], [1, "#0c0e18"]]) + g("rim", [[0, "#ffffff"], [1, "#aab4cc"]]);
      back += `<g opacity=".9" stroke="${T.c1}" stroke-width="9" stroke-linecap="round"><path d="M8 150h46"/><path d="M0 190h40"/><path d="M14 230h34"/></g>`;
      back += `<path d="M22 300Q20 236 80 226L320 226Q380 236 378 300L378 330Q378 350 356 350L44 350Q22 350 22 330Z" fill="${u("body")}" stroke="#0d3a86" stroke-width="5"/>`;
      back += `<path d="M40 250Q60 236 100 236" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".6" fill="none"/>`;
      [70, 330].forEach((x) => (back += `<circle cx="${x}" cy="352" r="42" fill="${u("tyre")}"/><circle cx="${x}" cy="352" r="19" fill="${u("rim")}"/><circle cx="${x}" cy="352" r="7" fill="#7a8399"/><path d="M${x - 26} ${330}Q${x} ${314} ${x + 26} ${330}" stroke="#fff" stroke-width="4" opacity=".35" fill="none" stroke-linecap="round"/>`));
      back += `<circle cx="${cx}" cy="${cy}" r="${R + 15}" fill="#fff"/><circle cx="${cx}" cy="${cy}" r="${R + 8.5}" fill="none" stroke="#14141e" stroke-width="13" stroke-dasharray="14 14"/>`;
      back += `<path d="M318 40L318 128" stroke="#5a5f73" stroke-width="7" stroke-linecap="round"/><path d="M321 42Q350 30 382 46L382 94Q350 80 321 92Z" fill="#fff" stroke="#14141e" stroke-width="3"/>`;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if ((r + c) % 2) back += `<rect x="${323 + c * 14.5}" y="${44 + r * 12.5 + c * 1.2}" width="14.5" height="12.5" fill="#14141e"/>`;
      front += face(56, 286, 0.8) + `<circle cx="344" cy="282" r="13" fill="#fff8b0" stroke="#e0a21a" stroke-width="4"/>` + sparkle(60, 70, 16, "#ffe58a") + sparkle(28, 112, 9, "#fff");
      ribY = 402; ribW = 128;
    }
    if (gate === 2) { // ---------- pixel blocks ----------
      const cols = ["#ff4b4b", "#ff9a2e", "#ffd23d", "#35d35a", "#3d8bff", "#9b5cff", "#ff7ac0"];
      const n = 22;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2, x = cx + Math.cos(a) * (R + 30), y = cy + Math.sin(a) * (R + 30), col = cols[i % cols.length];
        back += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((a * 180) / Math.PI + 90).toFixed(1)})"><rect x="-17" y="-17" width="34" height="34" rx="5" fill="${col}"/><rect x="-17" y="-17" width="34" height="12" rx="5" fill="#fff" opacity=".35"/><rect x="-17" y="9" width="34" height="8" rx="3" fill="#000" opacity=".18"/></g>`;
      }
      back += `<circle cx="${cx}" cy="${cy}" r="${R + 8}" fill="#fff"/>`;
      // pixel crown
      const px = (x, y, c) => `<rect x="${x}" y="${y}" width="18" height="18" fill="${c}"/><rect x="${x}" y="${y}" width="18" height="6" fill="#fff" opacity=".35"/>`;
      [[155, 30], [227, 30], [191, 12], [155, 48], [173, 48], [191, 48], [209, 48], [227, 48], [191, 30]].forEach(([x, y], i) => (front += px(x, y - 8, i === 2 ? "#ff4b4b" : "#ffd23d")));
      front += heart(52, 58, 22, "#ff7ac0") + heart(350, 64, 16, "#9b5cff") + sparkle(366, 330, 14, "#ffe58a") + sparkle(34, 330, 10, "#fff");
      // a little block buddy
      front += `<g transform="translate(356 286)"><rect x="-30" y="-30" width="60" height="60" rx="9" fill="#35d35a" stroke="#0f7a4a" stroke-width="4"/><rect x="-30" y="-30" width="60" height="18" rx="8" fill="#fff" opacity=".3"/>${face(0, 2, 0.9)}</g>`;
    }
    if (gate === 3) { // ---------- chick in an eggshell hat ----------
      defs += rg("chick", [[0, "#fff6a8"], [0.55, "#ffd23d"], [1, "#f0a800"]]) + g("shell", [[0, "#ffffff"], [1, "#e9e2cf"]]);
      back += `<path d="M58 214Q4 190 22 140Q46 176 84 182Z" fill="${u("chick")}" stroke="#d68f00" stroke-width="4"/><path d="M342 214Q396 190 378 140Q354 176 316 182Z" fill="${u("chick")}" stroke="#d68f00" stroke-width="4"/>`;
      back += `<circle cx="${cx}" cy="${cy + 6}" r="${R + 30}" fill="${u("chick")}" stroke="#d68f00" stroke-width="5"/>`;
      front += `<path d="M84 104Q84 22 200 18Q316 22 316 104L292 90L270 108L246 88L222 108L200 88L178 108L154 88L130 108L108 90Z" fill="${u("shell")}" stroke="#c9bfa6" stroke-width="4" stroke-linejoin="round"/>`;
      front += `<path d="M120 60Q140 34 176 30" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="246" cy="52" r="7" fill="#ffd23d" opacity=".7"/><circle cx="180" cy="66" r="5" fill="#9b5cff" opacity=".5"/>`;
      front += `<path d="M200 18Q192 0 206 -6" stroke="#f0a800" stroke-width="6" fill="none" stroke-linecap="round"/>` + face(200, 62, 0.85, "#ffb3c8");
      front += `<ellipse cx="62" cy="262" rx="16" ry="9" fill="#ff8fb1" opacity=".8"/><ellipse cx="338" cy="262" rx="16" ry="9" fill="#ff8fb1" opacity=".8"/>` + sparkle(366, 300, 14, "#fff") + sparkle(30, 300, 10, "#fff6a8") + heart(356, 352, 14, "#ff7ac0");
      cy = 212;
    }
    if (gate === 4) { // ---------- DJ headphones on a vinyl record ----------
      defs += g("band", [[0, "#ff9ccc"], [1, "#d6337a"]]) + g("cup", [[0, "#ff8fc4"], [0.5, "#e2408a"], [1, "#9c1a58"]], 1, 1);
      back += `<circle cx="${cx}" cy="${cy}" r="${R + 32}" fill="#1b1430"/>`;
      for (let r = R + 6; r <= R + 30; r += 6) back += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#3d3060" stroke-width="1.6"/>`;
      back += `<path d="M${cx - R - 30} ${cy - 30}A${R + 30} ${R + 30} 0 0 1 ${cx - 40} ${cy - R - 26}" stroke="#fff" stroke-width="5" opacity=".25" fill="none" stroke-linecap="round"/>`;
      front += `<path d="M58 210Q50 40 200 34Q350 40 342 210" stroke="${u("band")}" stroke-width="26" fill="none" stroke-linecap="round"/><path d="M78 170Q80 62 200 56" stroke="#fff" stroke-width="6" opacity=".45" fill="none" stroke-linecap="round"/>`;
      [[18, 1], [382, -1]].forEach(([x, s]) => (front += `<rect x="${x - (s > 0 ? 0 : 62)}" y="168" width="62" height="104" rx="26" fill="${u("cup")}" stroke="#7a1446" stroke-width="5"/><rect x="${x - (s > 0 ? 0 : 62) + 10}" y="180" width="16" height="50" rx="8" fill="#fff" opacity=".35"/>`));
      front += face(49, 238, 0.62, "#ffd6e8").replace("translate(49 238)", "translate(49 236)") + face(351, 236, 0.62, "#ffd6e8");
      const note = (x, y, c, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse cx="0" cy="0" rx="11" ry="8" fill="${c}" transform="rotate(-20)"/><path d="M9 -2V-38L26 -32" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      front += note(36, 110, "#ffd23d", -8) + note(366, 120, "#4cc9ff", 10) + note(352, 338, "#2ee6b6") + note(44, 340, "#ffd23d", -12) + sparkle(98, 22, 12, "#ffe58a") + sparkle(312, 20, 10, "#fff");
    }
    if (gate === 5) { // ---------- gift box with a big bow ----------
      defs += g("box", [[0, "#c4a3ff"], [0.5, "#8a5cff"], [1, "#5a2fc0"]], 1, 1) + g("bow", [[0, "#ffe58a"], [1, "#f0a800"]]);
      cy = 222;
      back += `<rect x="46" y="128" width="308" height="232" rx="24" fill="${u("box")}" stroke="#3f1f96" stroke-width="5"/><rect x="34" y="112" width="332" height="50" rx="16" fill="#a983ff" stroke="#3f1f96" stroke-width="5"/>`;
      back += `<rect x="182" y="112" width="36" height="248" fill="${u("bow")}"/><rect x="46" y="250" width="308" height="34" fill="${u("bow")}" opacity=".95"/>`;
      back += `<circle cx="${cx}" cy="${cy}" r="${R + 10}" fill="#fff"/>`;
      front += `<g stroke="#c27c00" stroke-width="5" stroke-linejoin="round"><path d="M200 96Q130 30 112 72Q100 112 200 104Z" fill="${u("bow")}"/><path d="M200 96Q270 30 288 72Q300 112 200 104Z" fill="${u("bow")}"/><path d="M188 104L160 150L178 146L188 162L200 108Z" fill="${u("bow")}"/><path d="M212 104L240 150L222 146L212 162L200 108Z" fill="${u("bow")}"/><ellipse cx="200" cy="100" rx="22" ry="18" fill="#ffd23d"/></g>`;
      front += face(200, 98, 0.62, "#ff9a2e") + sparkle(46, 84, 16, "#ffe58a") + sparkle(362, 92, 12, "#fff") + sparkle(372, 330, 14, "#ffe58a") + `<text x="56" y="342" font-size="40" font-weight="900" fill="#ffe58a" font-family="Fredoka,sans-serif">?</text>`;
    }
    if (gate === 6) { // ---------- gold medal with laurel wreath ----------
      defs += g("gold", [[0, "#fff3b0"], [0.4, "#ffd23d"], [1, "#c98a00"]], 1, 1) + g("leaf", [[0, "#7fe07a"], [1, "#1f8a3a"]]);
      back += `<path d="M96 0L160 0L232 120L176 140Z" fill="#ff9a2e"/><path d="M112 0L132 0L206 128L190 134Z" fill="#fff" opacity=".55"/><path d="M304 0L240 0L168 120L224 140Z" fill="#3d6bff"/><path d="M288 0L268 0L194 128L210 134Z" fill="#fff" opacity=".55"/>`;
      back += `<circle cx="${cx}" cy="${cy}" r="${R + 22}" fill="${u("gold")}" stroke="#a86c00" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="${R + 10}" fill="none" stroke="#fff6c8" stroke-width="3" stroke-dasharray="3 7"/>`;
      const leaf = (a, side) => { const x = cx + Math.cos(a) * (R + 38), y = cy + Math.sin(a) * (R + 38), rot = (a * 180) / Math.PI + (side > 0 ? 70 : 110); return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="18" ry="8" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${u("leaf")}" stroke="#14602a" stroke-width="2"/>`; };
      for (let i = 0; i < 8; i++) { back += leaf(Math.PI * (0.62 + i * 0.075), -1) + leaf(Math.PI * (0.38 - i * 0.075), 1); }
      front += `<path d="M200 46l9 19 21 3-15 15 4 21-19-10-19 10 4-21-15-15 21-3z" fill="#fff6c8" stroke="#c98a00" stroke-width="3"/>`;
      front += sparkle(60, 120, 16, "#fff6c8") + sparkle(348, 126, 12, "#fff") + sparkle(350, 330, 14, "#ffe58a") + heart(48, 326, 16, "#ff7ac0");
      front += `<g transform="translate(340 236)"><circle r="26" fill="${u("gold")}" stroke="#a86c00" stroke-width="4"/>${face(0, -2, 0.7, "#ff9a2e")}</g>`;
    }
    // ---------- the school emblem (always whole) + 土城國小 ribbon ----------
    const emb = `<circle cx="${cx}" cy="${cy + 5}" r="${R}" fill="#000" opacity=".25"/><image href="${EMB}" x="${cx - R * 1.1}" y="${cy - R * 1.1}" width="${R * 2.2}" height="${R * 2.2}"/>`;
    const rib = `<g transform="translate(200 ${ribY})"><path d="M${-ribW - 34} -6L${-ribW + 6} -6L${-ribW + 6} 46L${-ribW - 34} 46L${-ribW - 18} 20Z" fill="${T.c2}"/><path d="M${ribW + 34} -6L${ribW - 6} -6L${ribW - 6} 46L${ribW + 34} 46L${ribW + 18} 20Z" fill="${T.c2}"/><path d="M${-ribW + 6} 34L${-ribW + 6} 46L${-ribW - 6} 34Z M${ribW - 6} 34L${ribW - 6} 46L${ribW + 6} 34Z" fill="#000" opacity=".35"/>
      <path d="M${-ribW} -30Q0 -44 ${ribW} -30L${ribW} 34Q0 20 ${-ribW} 34Z" fill="${u("rib")}" stroke="#fff" stroke-width="4"/>
      <text x="0" y="4" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="38" fill="#fff" stroke="${T.c2}" stroke-width="7" paint-order="stroke" letter-spacing="4">土城國小</text>
      <text x="0" y="25" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="15" fill="#fff" letter-spacing="2.5">${T.sub}</text></g>`;
    return `<svg class="tc-badge-svg" viewBox="-6 -14 412 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="土城國小校徽 · Gate ${gate}"><defs>${defs}</defs>${back}${emb}${front}${rib}</svg>`;
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
