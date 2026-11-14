/* =====================================================================
   Body-part pictures for Gate 4 (passport level 3 · 身體部位) — original
   glossy-toy drawings in the same style as the pose kid in js/art.js.
   Each picture is a front-facing kid with ONE part lit up by a glowing
   ring and pointed at by a bold arrow:  TC.art("body-nose") → data URL
   ===================================================================== */
(function () {
  "use strict";
  const TC = window.TC;
  if (!TC || !TC.ART || !TC.ArtCtx) return;
  const SKIN = "#ffd3a8", SKIN2 = "#f0a878", HAIR = "#5a3518", SHIRT = "#4cc9ff", PANTS = "#3d4a8a", INK = "#1b1d33";
  const f1 = (v) => +v.toFixed(1);

  /** the highlight: a soft glow + a bright two-tone ring */
  function ring(cx, cy, rx, ry = rx) {
    const e = (grow, a) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx + grow}" ry="${ry + grow}" fill="none" ${a}/>`;
    return e(8, `stroke="#ffe23d" stroke-width="9" opacity=".42"`) + e(0, `stroke="#ff7a00" stroke-width="9.5"`) + e(0, `stroke="#ffe23d" stroke-width="5.5"`) + e(-1.4, `stroke="#fffbe0" stroke-width="1.6" opacity=".9"`);
  }
  /** a bold glossy arrow from (x1,y1) with its tip at (x2,y2) */
  function arrow(c, x1, y1, x2, y2, w = 13) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, hl = w * 1.8, hw = w * 1.4;
    const bx = x2 - ux * hl, by = y2 - uy * hl, p = (x, y) => f1(x) + " " + f1(y);
    const d = `M${p(x1 + px * w / 2, y1 + py * w / 2)} L${p(bx + px * w / 2, by + py * w / 2)} L${p(bx + px * hw, by + py * hw)} L${p(x2, y2)} L${p(bx - px * hw, by - py * hw)} L${p(bx - px * w / 2, by - py * w / 2)} L${p(x1 - px * w / 2, y1 - py * w / 2)}Z`;
    return `<path d="${d}" transform="translate(0 3)" fill="#000" opacity=".2"/>` +
      `<path d="${d}" fill="${c.g("#ff2e63")}" stroke="#fff" stroke-width="7" stroke-linejoin="round" paint-order="stroke"/>`;
  }
  const limb = (x1, y1, x2, y2, col, w = 13) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  const hair = (c, cx, cy, R) => c.path(`M${cx - R} ${cy - 6} Q${f1(cx - R + 3)} ${f1(cy - R - 9)} ${cx} ${f1(cy - R - 9)} Q${f1(cx + R - 3)} ${f1(cy - R - 9)} ${cx + R} ${cy - 6} Q${f1(cx + R * 0.62)} ${f1(cy - R * 0.66)} ${cx} ${f1(cy - R * 0.5)} Q${f1(cx - R * 0.62)} ${f1(cy - R * 0.66)} ${cx - R} ${cy - 6}Z`, HAIR);
  const ear = (c, x, y, r, side) => c.sphere(x, y, r, SKIN, 0.4) + `<path d="M${f1(x + side * r * 0.35)} ${f1(y - r * 0.5)} Q${f1(x - side * r * 0.55)} ${y} ${f1(x + side * r * 0.35)} ${f1(y + r * 0.5)}" stroke="${SKIN2}" stroke-width="${f1(r * 0.24)}" fill="none" stroke-linecap="round"/>`;

  /* ---------- close-up face: eyes / ears / nose / mouth ---------- */
  function face(part) {
    const c = TC.ArtCtx(), cy = 96, R = part === "ears" ? 50 : 66, er = part === "ears" ? 23 : 14, ex = R + er * (part === "ears" ? 0.8 : 0.42);
    let s = c.path("M24 206 Q26 170 70 164 L130 164 Q174 170 176 206Z", SHIRT) + `<rect x="85" y="${cy + R - 16}" width="30" height="${178 - (cy + R - 16)}" rx="8" fill="${SKIN2}"/>`;
    s += ear(c, f1(100 - ex), 102, er, -1) + ear(c, f1(100 + ex), 102, er, 1);
    s += c.sphere(100, cy, R, SKIN, 0.6) + hair(c, 100, cy, R);
    if (part === "eyes") { // huge sparkling eyes with lashes
      s += c.eyes(100, 98, 28, 17);
      s += `<g stroke="${INK}" stroke-width="3.2" stroke-linecap="round"><path d="M59 87 l-7 -6 M64 82 l-4 -8 M141 87 l7 -6 M136 82 l4 -8"/></g>`;
      s += `<ellipse cx="100" cy="124" rx="5" ry="3.6" fill="${SKIN2}"/>` + c.smile(100, 138, 9) + c.blush(100, 128, 40);
    } else if (part === "nose") { // big round button nose
      s += c.eyes(100, 76, 24, 8.5) + c.smile(100, 144, 10) + c.blush(100, 122, 46);
      s += c.ell(100, 108, 17, 14, "#ffae7e", 0, 0.75) + `<ellipse cx="93.5" cy="115.5" rx="3" ry="2" fill="#c97a52"/><ellipse cx="106.5" cy="115.5" rx="3" ry="2" fill="#c97a52"/>`;
    } else if (part === "mouth") { // big open smile: lips, teeth, tongue
      s += c.eyes(100, 80, 24, 8.5) + `<ellipse cx="100" cy="102" rx="5" ry="3.6" fill="${SKIN2}"/>` + c.blush(100, 108, 46);
      s += `<path d="M66 122 Q100 116 134 122 Q133 160 100 160 Q67 160 66 122Z" fill="#7a1a2c" stroke="#ff4f7b" stroke-width="5" stroke-linejoin="round"/>`;
      s += `<path d="M72 123.5 Q100 119 128 123.5 L126 134 Q100 130 74 134Z" fill="#fff"/><path d="M82 152 Q100 140 118 152 Q110 158 100 158 Q90 158 82 152Z" fill="#ff7a9a"/>`;
    } else { // ears
      s += c.eyes(100, 96, 17, 8) + `<ellipse cx="100" cy="111" rx="4.5" ry="3.2" fill="${SKIN2}"/>` + c.smile(100, 122, 8) + c.blush(100, 114, 30);
    }
    if (part === "eyes") s += ring(72, 98, 24) + ring(128, 98, 24) + arrow(c, 22, 14, 53, 76, 12) + arrow(c, 178, 14, 147, 76, 12);
    if (part === "ears") s += ring(f1(100 - ex), 102, 26) + ring(f1(100 + ex), 102, 26) + arrow(c, 12, 12, 26, 68, 12) + arrow(c, 188, 12, 174, 68, 12);
    if (part === "nose") s += ring(100, 109, 25) + arrow(c, 186, 176, 124, 128, 14);
    if (part === "mouth") s += ring(100, 139, 42, 28) + arrow(c, 190, 104, 146, 128, 14);
    return c.out(s);
  }

  /* ---------- full kid: head / hands / feet ---------- */
  const smallHead = (c, cx, cy, R) => ear(c, f1(cx - R - 2), cy + 4, R * 0.2, -1) + ear(c, f1(cx + R + 2), cy + 4, R * 0.2, 1) + c.sphere(cx, cy, R, SKIN, 0.6) + hair(c, cx, cy, R) +
    c.eyes(cx, cy + R * 0.08, R * 0.34, R * 0.16) + c.smile(cx, cy + R * 0.44, R * 0.19) + `<ellipse cx="${f1(cx - R * 0.6)}" cy="${f1(cy + R * 0.36)}" rx="${f1(R * 0.2)}" ry="${f1(R * 0.11)}" fill="#ff7aa8" opacity=".55"/><ellipse cx="${f1(cx + R * 0.6)}" cy="${f1(cy + R * 0.36)}" rx="${f1(R * 0.2)}" ry="${f1(R * 0.11)}" fill="#ff7aa8" opacity=".55"/>`;
  /** an open hand, fingers up: palm at (x,y); side = -1 left hand of the picture, 1 right */
  function hand(c, x, y, k, side) {
    let fingers = "";
    [[-26, 19], [-9, 22], [9, 21], [26, 17], [side * -72, 15]].forEach(([deg, len]) => {
      const a = (deg - 90) * Math.PI / 180, x1 = x + Math.cos(a) * 9 * k, y1 = y + Math.sin(a) * 9 * k, x2 = x + Math.cos(a) * (10 + len) * k, y2 = y + Math.sin(a) * (10 + len) * k;
      fingers += `<path d="M${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)}" stroke="${SKIN2}" stroke-width="${f1(9.4 * k)}" stroke-linecap="round"/><path d="M${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)}" stroke="${SKIN}" stroke-width="${f1(7 * k)}" stroke-linecap="round"/>`;
    });
    return fingers + `<circle cx="${x}" cy="${y}" r="${f1(14.2 * k)}" fill="${SKIN2}"/>` + c.sphere(x, y, f1(13 * k), SKIN, 0.5);
  }
  /** a bare foot seen from the front, toes toward us; side = -1 left foot of the picture, 1 right */
  function foot(c, x, y, side) {
    let s = `<ellipse cx="${x}" cy="${y - 2}" rx="21.5" ry="18.5" fill="${SKIN2}"/>` + c.ell(x, y - 2, 20, 17, SKIN, 0, 0.5);
    [[-14, 9.5, 7.2], [-3.5, 15, 5.8], [5.5, 15.5, 5.1], [12.8, 12.5, 4.5], [18, 7, 3.9]].forEach(([dx, dy, r]) => {
      const tx = f1(x + side * dx), ty = y + dy; // big toe on the inside
      s += `<circle cx="${tx}" cy="${ty}" r="${r + 1.3}" fill="${SKIN2}"/><circle cx="${tx}" cy="${ty}" r="${r}" fill="${c.g(SKIN)}"/><ellipse cx="${tx}" cy="${f1(ty + r * 0.3)}" rx="${f1(r * 0.5)}" ry="${f1(r * 0.34)}" fill="#fff" opacity=".75"/>`;
    });
    return `<g transform="rotate(${side * -10} ${x} ${y})">${s}</g>`;
  }

  TC.ART["body-eyes"] = () => face("eyes");
  TC.ART["body-ears"] = () => face("ears");
  TC.ART["body-nose"] = () => face("nose");
  TC.ART["body-mouth"] = () => face("mouth");

  TC.ART["body-head"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 193, 44, 6);
    s += limb(89, 160, 87, 184, PANTS, 16) + limb(111, 160, 113, 184, PANTS, 16) + c.ell(84, 188, 13, 7, "#ff5fa2", 0, 0.5) + c.ell(116, 188, 13, 7, "#ff5fa2", 0, 0.5);
    s += `<rect x="72" y="118" width="56" height="50" rx="18" fill="${c.g(SHIRT)}"/>`;
    s += limb(76, 130, 58, 160, SHIRT) + c.sphere(58, 160, 8, SKIN, 0.4) + limb(124, 130, 142, 160, SHIRT) + c.sphere(142, 160, 8, SKIN, 0.4);
    s += smallHead(c, 100, 76, 44);
    s += ring(100, 71, 59, 57) + arrow(c, 192, 6, 149, 30, 14);
    return c.out(s);
  };
  TC.ART["body-hands"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 193, 40, 6);
    s += limb(90, 168, 88, 184, PANTS, 15) + limb(110, 168, 112, 184, PANTS, 15) + c.ell(85, 188, 12, 6.5, "#ff5fa2", 0, 0.5) + c.ell(115, 188, 12, 6.5, "#ff5fa2", 0, 0.5);
    s += `<rect x="75" y="124" width="50" height="52" rx="17" fill="${c.g(SHIRT)}"/>`;
    s += limb(80, 136, 46, 92, SHIRT, 13) + limb(120, 136, 154, 92, SHIRT, 13);
    s += smallHead(c, 100, 98, 28);
    s += hand(c, 40, 72, 1.15, -1) + hand(c, 160, 72, 1.15, 1);
    s += ring(40, 58, 33, 36) + ring(160, 58, 33, 36) + arrow(c, 16, 168, 26, 106, 12) + arrow(c, 184, 168, 174, 106, 12);
    return c.out(s);
  };
  TC.ART["body-feet"] = () => {
    const c = TC.ArtCtx(); let s = c.shadow(100, 193, 76, 7);
    s += limb(90, 112, 68, 152, SKIN2, 15.5) + limb(90, 112, 68, 152, SKIN, 13) + limb(110, 112, 132, 152, SKIN2, 15.5) + limb(110, 112, 132, 152, SKIN, 13);
    s += `<rect x="77" y="94" width="46" height="27" rx="10" fill="${c.g(PANTS)}"/><rect x="77" y="54" width="46" height="50" rx="16" fill="${c.g(SHIRT)}"/>`;
    s += limb(81, 66, 63, 94, SHIRT, 12) + c.sphere(63, 94, 7, SKIN, 0.4) + limb(119, 66, 137, 94, SHIRT, 12) + c.sphere(137, 94, 7, SKIN, 0.4);
    s += smallHead(c, 100, 32, 23);
    s += foot(c, 64, 166, -1) + foot(c, 136, 166, 1);
    s += ring(64, 168, 32, 25) + ring(136, 168, 32, 25) + arrow(c, 8, 88, 30, 138, 12) + arrow(c, 192, 88, 170, 138, 12);
    return c.out(s);
  };

  /* where the small 土城 pin sits: on the shirt, away from the highlighted part */
  Object.assign(TC.SEAL, {
    "body-head": [100, 147, 11], "body-hands": [100, 152, 11], "body-feet": [100, 78, 10],
    "body-eyes": [52, 184, 13, -8], "body-ears": [52, 184, 13, -8], "body-nose": [52, 184, 13, -8], "body-mouth": [52, 186, 12, -8]
  });
})();
