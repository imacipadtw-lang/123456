/* Classroom Rescue 教室大救援 (gate 1 · SITUATIONS)
   Ollie-bot is in a classroom emergency: the siren flashes, the bell rings, a big 3D situation card drops in with a "?" bubble.
   The child says the key word (late / in / restroom / water / lunchbox / hurt) -> RESCUE animation -> "Good job!".
   A rescue meter of 5 stars fills up; after the last rescue the whole classroom turns into a disco while Ollie dances,
   then "Give him a big hand!" for the parents.  All artwork is original, drawn in code. */
(function () {
  "use strict";
  TC.games = TC.games || {};
  const h = TC.h;

  /* ======================================================================
     ARTWORK (SVG drawn in code; the pictures are registered as TC.ART[name] so they get the 土城 pin)
     ====================================================================== */
  const Ctx = () => TC.ArtCtx();
  const URLOF = (svg) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  const rawCache = {};
  const raw = (k, fn) => rawCache[k] || (rawCache[k] = URLOF(fn()));
  const FONT = "Fredoka,'Arial Rounded MT Bold',Arial,sans-serif";
  const star5 = (cx, cy, R, r) => { let d = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; d += (i ? "L" : "M") + (cx + Math.cos(a) * rr).toFixed(1) + " " + (cy + Math.sin(a) * rr).toFixed(1); } return d + "Z"; };
  const dropSvg = (c, x, y, s, col) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -15 C8 -3 13 3 13 9 A13 13 0 0 1 -13 9 C-13 3 -8 -3 0 -15Z" fill="${c.g(col || "#3db8ff")}"/><ellipse cx="-5" cy="6" rx="3" ry="5.5" fill="#fff" opacity=".75" transform="rotate(18 -5 6)"/></g>`;
  const reg = (name, seal, fn) => { TC.ART[name] = fn; if (seal) TC.SEAL[name] = seal; };

  /** a wall clock (gold rim, cream face) */
  function clockSvg(c, x, y, r, hr, mn) {
    const P = (deg, l) => `${(x + Math.sin(deg * Math.PI / 180) * l).toFixed(1)} ${(y - Math.cos(deg * Math.PI / 180) * l).toFixed(1)}`;
    let s = c.sphere(x, y, r, "#f0b429", 0.5) + `<circle cx="${x}" cy="${y}" r="${r * 0.8}" fill="#fffdf4"/><circle cx="${x}" cy="${y}" r="${r * 0.8}" fill="none" stroke="#e2d3a5" stroke-width="1.5"/>`;
    for (let i = 0; i < 12; i++) s += `<path d="M${P(i * 30, r * 0.62)} L${P(i * 30, r * 0.74)}" stroke="${i % 3 ? "#8a7a52" : "#2a2a3a"}" stroke-width="${i % 3 ? 1.4 : 2.8}" stroke-linecap="round"/>`;
    s += TC.seal(x, y + r * 0.37, r * 0.16, 0, "print"); // the school's mark printed on the face, like a maker's logo (the hands pass over it)
    s += `<path d="M${x} ${y} L${P(hr % 12 * 30 + mn * 0.5, r * 0.45)}" stroke="#1b1d33" stroke-width="${r * 0.1}" stroke-linecap="round"/><path d="M${x} ${y} L${P(mn * 6, r * 0.66)}" stroke="#1b1d33" stroke-width="${r * 0.07}" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="${r * 0.07}" fill="#e63946"/>`;
    return s + c.hl(x - r * 0.35, y - r * 0.45, r * 0.4, r * 0.18, -30, 0.55);
  }
  /** a classroom door: dark frame, wooden leaf, panels, knob; optional window */
  const DWIN = { y: 0.08, h: 0.31 }; // the door window (fractions of the door height)
  function doorSvg(c, x, y, w, hh, col, win) {
    let s = `<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${hh + 6}" rx="5" fill="${c.v("#8a5527", "#5a3414")}"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="3" fill="${c.g(col)}"/>`;
    s += `<rect x="${x + w * 0.12}" y="${y + hh * 0.62}" width="${w * 0.76}" height="${hh * 0.3}" rx="4" fill="#000" opacity=".12"/><rect x="${x + w * 0.12 + 1}" y="${y + hh * 0.62 + 1}" width="${w * 0.76 - 2}" height="${hh * 0.3 - 2}" rx="4" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>`;
    if (win) s += `<rect x="${x + w * 0.16 - 3}" y="${y + hh * DWIN.y - 3}" width="${w * 0.68 + 6}" height="${hh * DWIN.h + 6}" rx="6" fill="#7a4a20"/><rect x="${x + w * 0.16}" y="${y + hh * DWIN.y}" width="${w * 0.68}" height="${hh * DWIN.h}" rx="4" fill="${c.v("#cdeeff", "#86c8f0")}"/>`;
    s += c.sphere(x + w * 0.87, y + hh * 0.5, 4.6, "#ffd23d") + c.hl(x + w * 0.3, y + hh * 0.3, w * 0.2, hh * 0.3, -10, 0.25);
    return s + TC.seal(x + w / 2, y + hh * 0.5, Math.min(w, hh * 0.5) * 0.1, 0, "plate"); // the school's brass door plate on the middle rail
  }
  /** the room behind a situation: wall, baseboard and wooden floor */
  const room = (c, w1, w2, f1, f2) => `<rect width="280" height="200" fill="${c.v(w1, w2)}"/><ellipse cx="90" cy="20" rx="140" ry="40" fill="#fff" opacity=".22"/>` +
    `<rect y="146" width="280" height="54" fill="${c.v(f1, f2)}"/><rect y="142" width="280" height="6" fill="#000" opacity=".16"/>` +
    `<path d="M0 162H280M0 178H280M0 195H280M70 148L18 200M140 148V200M210 148L262 200" stroke="#000" stroke-opacity=".1" stroke-width="1.5" fill="none"/>`;
  const bellShape = (c, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-8 -26 Q0 -34 8 -26 L6 -18 H-6Z" fill="${c.g("#c98a14")}"/>` +
    `<path d="M-22 16 C-22 -6 -12 -22 0 -22 C12 -22 22 -6 22 16 L30 24 H-30Z" fill="${c.g("#ffc83d")}"/><circle cx="0" cy="3.4" r="9.9" fill="#a86c08" opacity=".6"/>${TC.seal(0, 3.4, 6.6, 0, "print")}<ellipse cx="0" cy="25" rx="30" ry="5" fill="${c.g("#e0a21a")}"/><circle cx="0" cy="31" r="7" fill="${c.g("#c98a14")}"/>${c.hl(-9, -6, 6, 13, -15, 0.8)}</g>`;

  /** Ollie-bot drawn in a situation. o: eyes n/w(orried)/s(ad)/q(>_<)/h(appy), beak n/pant/o/cry, wl/wr wing angles, front = wings in front of the body */
  function ollieFig(c, x, y, s, o) {
    o = Object.assign({ eyes: "n", beak: "n", wl: 0, wr: 0, sweat: 0, tear: 0, screen: "ABC", rot: 0, lift: 0, plaster: 0, bump: 0, front: 0 }, o || {});
    const BR = "#5a3b1f", wingL = (c0) => `<g transform="rotate(${o.wl} 44 118)">` + c0.path("M36 110 Q4 140 22 190 Q42 162 50 132Z", "#6f7fd8") + "</g>", wingR = (c0) => `<g transform="rotate(${o.wr} 156 118)">` + c0.path("M164 110 Q196 140 178 190 Q158 162 150 132Z", "#6f7fd8") + "</g>";
    let b = `<line x1="100" y1="40" x2="100" y2="16" stroke="#c9d6ff" stroke-width="5" stroke-linecap="round"/>` + c.path("M100 0l5 10 11 1-8 7 3 11-11-6-11 6 3-11-8-7 11-1z", "#ffc83d");
    if (!o.front) b += wingL(c) + wingR(c);
    b += c.path("M100 34 C30 34 30 90 34 140 C38 196 66 214 100 214 C134 214 162 196 166 140 C170 90 170 34 100 34Z", "#8fa2ff");
    b += c.path("M42 56 L58 26 L80 50Z", "#8fa2ff") + c.path("M158 56 L142 26 L120 50Z", "#8fa2ff");
    b += c.sphere(72, 92, 28, "#ffffff", 0.3) + c.sphere(128, 92, 28, "#ffffff", 0.3);
    b += {
      n: c.eyes(100, 92, 28, 13),
      w: c.eyes(100, 88, 28, 12) + `<path d="M50 70 L92 56M108 56 L150 70" stroke="${BR}" stroke-width="6" stroke-linecap="round"/>`,
      s: c.eyes(100, 97, 28, 14) + `<path d="M46 76 L92 54M108 54 L154 76" stroke="${BR}" stroke-width="6" stroke-linecap="round"/>`,
      q: `<path d="M56 76 L88 92 L56 108M144 76 L112 92 L144 108" stroke="#1b1d33" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
      h: `<path d="M54 98 Q72 70 90 98M110 98 Q128 70 146 98" stroke="#1b1d33" stroke-width="8" fill="none" stroke-linecap="round"/>`
    }[o.eyes];
    b += {
      n: c.path("M90 110 L110 110 L100 126Z", "#ffb020"),
      pant: `<path d="M86 110 Q100 142 114 110Z" fill="#7a1f2b"/>` + c.ell(100, 131, 8, 11, "#ff7aa8", 0, 0.5) + c.path("M89 107 L111 107 L100 117Z", "#ffb020"),
      o: `<ellipse cx="100" cy="122" rx="9" ry="11" fill="#7a1f2b"/>` + c.path("M91 108 L109 108 L100 116Z", "#ffb020"),
      cry: `<path d="M82 108 Q100 152 118 108Z" fill="#7a1f2b"/>` + c.ell(100, 136, 10, 8, "#ff7aa8", 0, 0.4) + c.path("M88 105 L112 105 L100 116Z", "#ffb020")
    }[o.beak];
    b += c.blush(100, 119, 50);
    b += `<rect x="62" y="134" width="76" height="43" rx="13" fill="${c.v("#1b2b5e", "#0a1633")}" stroke="#c9d6ff" stroke-width="4"/><text x="100" y="163.5" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${o.screen.length > 3 ? 20 : 23}" fill="#2ee6b6">${o.screen}</text>` + TC.seal(100, 196, 10.6, 0, "pin"); // the school's mark: the round "home button" under his screen
    b += c.hl(70, 60, 30, 12, -20, 0.7) + c.ell(80, 212, 14, 8, "#ffc83d", 0, 0.4) + c.ell(120, 212, 14, 8, "#ffc83d", 0, 0.4);
    if (o.plaster) b += `<g transform="rotate(-16 100 50)"><rect x="68" y="40" width="64" height="22" rx="11" fill="${c.g("#ffd9a0")}"/><rect x="88" y="40" width="24" height="22" fill="#fff3d6"/><circle cx="78" cy="51" r="1.8" fill="#c98a4a"/><circle cx="122" cy="51" r="1.8" fill="#c98a4a"/><circle cx="82" cy="46" r="1.8" fill="#c98a4a"/><circle cx="118" cy="56" r="1.8" fill="#c98a4a"/></g>`;
    if (o.bump) b += `<path d="${star5(152, 40, 24, 13)}" fill="${c.g("#ffb020")}" stroke="#ff8a00" stroke-width="2" stroke-linejoin="round"/>` + c.hl(146, 33, 9, 5, -30, 0.9);
    if (o.front) b += wingL(c) + wingR(c);
    if (o.tear) b += dropSvg(c, 58, 120, 0.8) + dropSvg(c, 142, 120, 0.8);
    if (o.sweat) b += dropSvg(c, 178, 66, 1.1) + (o.sweat > 1 ? dropSvg(c, 22, 80, 0.95) : "");
    return `<g transform="translate(${x} ${y}) scale(${s})">${c.shadow(100, 222, Math.max(24, 58 - o.lift * 1.4), 8)}<g transform="translate(0 ${-o.lift}) rotate(${o.rot} 100 214)">${b}</g></g>`;
  }

  /* ---------- the six situation pictures (viewBox 280 x 200) ---------- */
  reg("sit-late", "none", () => {
    const c = Ctx();
    let s = room(c, "#c9f0e2", "#8fd9c0", "#e7b777", "#c48c4f");
    s += doorSvg(c, 196, 36, 70, 110, "#d9803a", true);
    s += `<text x="231" y="30" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="11" fill="#5a3414">ROOM 5</text>`;
    s += clockSvg(c, 58, 52, 36, 9, 0);
    s += `<g stroke="#e63946" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M14 24 L22 30M10 50 H20M14 76 L22 70"/></g>`;
    s += bellShape(c, 134, 28, 0.74) + `<g stroke="#ff9a2e" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M154 12 Q160 24 154 36M162 6 Q172 24 162 42M114 12 Q108 24 114 36M106 6 Q96 24 106 42"/></g>`;
    s += `<g stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".85"><path d="M82 92 H104M76 110 H100M84 128 H106"/></g>`;
    s += ollieFig(c, 108, 56, 0.52, { eyes: "w", beak: "pant", sweat: 1, wl: 34, wr: -34, rot: -7, screen: "9:00" });
    return c.out(s, "0 0 280 200");
  });
  reg("sit-in", "none", () => {
    const c = Ctx();
    let s = room(c, "#ffe3b0", "#ffc978", "#d9a05a", "#b9783a");
    s += doorSvg(c, 150, 22, 98, 126, "#c97b3a", true);
    const wx = 150 + 98 * 0.16, wy = 22 + 126 * DWIN.y, ww = 98 * 0.68, wh = 126 * DWIN.h;
    s += `<defs><clipPath id="rqw"><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="4"/></clipPath></defs><g clip-path="url(#rqw)"><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="${c.v("#fff3d0", "#ffd98c")}"/>` +
      `<rect x="${wx + 4}" y="${wy + 4}" width="26" height="14" rx="2" fill="#2f6b4f"/><path d="M${wx + 7} ${wy + 14} H${wx + 24}" stroke="#fff" stroke-width="1.6"/>` +
      `<ellipse cx="${wx + ww / 2}" cy="${wy + wh + 6}" rx="26" ry="20" fill="${c.g("#4c78d9")}"/>` + c.sphere(wx + ww / 2, wy + wh / 2 + 2, 13, "#ffd1a8") +
      `<path d="M${wx + ww / 2 - 14} ${wy + wh / 2 - 2} Q${wx + ww / 2} ${wy + wh / 2 - 20} ${wx + ww / 2 + 14} ${wy + wh / 2 - 2} Q${wx + ww / 2} ${wy + wh / 2 - 8} ${wx + ww / 2 - 14} ${wy + wh / 2 - 2}Z" fill="#4a2e1b"/>` +
      `<g fill="none" stroke="#2a2a3a" stroke-width="1.6"><circle cx="${wx + ww / 2 - 5.5}" cy="${wy + wh / 2 + 2}" r="4.6"/><circle cx="${wx + ww / 2 + 5.5}" cy="${wy + wh / 2 + 2}" r="4.6"/><path d="M${wx + ww / 2 - 1} ${wy + wh / 2 + 2} H${wx + ww / 2 + 1}"/></g>` +
      `<path d="M${wx + ww / 2 - 4} ${wy + wh / 2 + 9} Q${wx + ww / 2} ${wy + wh / 2 + 12} ${wx + ww / 2 + 4} ${wy + wh / 2 + 9}" stroke="#a0522d" stroke-width="1.6" fill="none"/></g>`;
    s += `<text x="199" y="16" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="11" fill="#5a3414">ROOM 5</text>`;
    s += `<g stroke="#ff6a00" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M134 62 Q142 70 134 78M126 56 Q138 70 126 84"/></g>`;
    s += `<g transform="rotate(-8 100 36)"><rect x="62" y="22" width="82" height="28" rx="14" fill="#fff" stroke="#ff9a2e" stroke-width="3"/><text x="103" y="42" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="17" fill="#ff6a00">TOK TOK</text></g>`;
    s += ollieFig(c, 40, 54, 0.54, { eyes: "w", beak: "o", sweat: 1, wl: 6, wr: -84, rot: 4 });
    return c.out(s, "0 0 280 200");
  });
  /** the blue restroom plaque (two little people + WC) */
  const wcPlaque = (c, x, y, w, hh) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="8" fill="${c.g("#3d8bff")}" stroke="#fff" stroke-width="3"/>` +
    `<circle cx="${x + w * 0.3}" cy="${y + hh * 0.22}" r="${w * 0.07}" fill="#fff"/><rect x="${x + w * 0.22}" y="${y + hh * 0.32}" width="${w * 0.16}" height="${hh * 0.3}" rx="3" fill="#fff"/>` +
    `<circle cx="${x + w * 0.7}" cy="${y + hh * 0.22}" r="${w * 0.07}" fill="#fff"/><path d="M${x + w * 0.7} ${y + hh * 0.32} L${x + w * 0.57} ${y + hh * 0.64} H${x + w * 0.83}Z" fill="#fff"/>` +
    `<text x="${x + w / 2}" y="${y + hh * 0.9}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${hh * 0.2}" fill="#fff">WC</text>`;
  reg("sit-restroom", "none", () => {
    const c = Ctx();
    let s = room(c, "#d6ecff", "#a7d3f7", "#e8c493", "#c99a62");
    s += doorSvg(c, 176, 40, 74, 106, "#43c3a6", false) + wcPlaque(c, 190, 46, 46, 35);
    s += `<circle cx="213" cy="26.5" r="6" fill="${c.g("#ff4f4f")}"/>`;
    s += `<g stroke="#3d8bff" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M64 150 Q80 168 96 150M104 158 Q118 170 132 158"/></g>`;
    s += `<g stroke="#ff9a2e" stroke-width="4" stroke-linecap="round"><path d="M50 106 L40 98M52 122 L40 122M52 138 L42 146M150 106 L160 98M148 122 L160 122M148 138 L158 146"/></g>`;
    s += ollieFig(c, 62, 50, 0.55, { eyes: "q", beak: "o", sweat: 2, wl: -26, wr: 26, front: 1, lift: 16, rot: 6 });
    s += `<text x="170" y="28" font-family="${FONT}" font-weight="700" font-size="28" fill="#ff4f4f" transform="rotate(10 170 28)">!</text>`;
    return c.out(s, "0 0 280 200");
  });
  reg("sit-water", "none", () => {
    const c = Ctx();
    let s = room(c, "#ffe7a8", "#ffc765", "#e6b678", "#c48f52");
    s += c.sphere(38, 36, 20, "#ffcf3a") + `<g stroke="#ff9a2e" stroke-width="4" stroke-linecap="round">` + [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M${38 + Math.cos(a * Math.PI / 180) * 27} ${36 + Math.sin(a * Math.PI / 180) * 27}L${38 + Math.cos(a * Math.PI / 180) * 35} ${36 + Math.sin(a * Math.PI / 180) * 35}"/>`).join("") + `</g>`;
    s += `<g stroke="#ff7a3a" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"><path d="M70 60 q4 -6 8 0 t8 0 t8 0M168 126 q4 -6 8 0 t8 0 t8 0"/></g>`;
    // the desk with an empty cup
    s += `<rect x="176" y="120" width="92" height="12" rx="5" fill="${c.g("#b9783a")}"/><rect x="184" y="130" width="8" height="40" fill="#8a5527"/><rect x="252" y="130" width="8" height="40" fill="#8a5527"/>`;
    s += `<path d="M205 78 H243 L238 119 Q224 124 210 119Z" fill="#e8f8ff" fill-opacity=".55" stroke="#7cc4ee" stroke-width="3" stroke-linejoin="round"/><ellipse cx="224" cy="78" rx="19" ry="5" fill="#fff" fill-opacity=".6" stroke="#7cc4ee" stroke-width="2.5"/>` + c.hl(212, 96, 4, 14, 0, 0.9) + TC.seal(225, 101, 6.6, 0, "print"); // printed on the cup
    s += `<circle cx="150" cy="70" r="4" fill="#fff" opacity=".9"/><circle cx="160" cy="58" r="6" fill="#fff" opacity=".9"/>` + `<g><ellipse cx="204" cy="38" rx="38" ry="26" fill="#fff" stroke="#bfe3ff" stroke-width="3"/><circle cx="176" cy="50" r="9" fill="#fff"/><circle cx="232" cy="52" r="9" fill="#fff"/></g>` + dropSvg(c, 204, 36, 1.5);
    s += ollieFig(c, 52, 50, 0.57, { eyes: "w", beak: "pant", sweat: 2, wl: 14, wr: -14, rot: -3 });
    return c.out(s, "0 0 280 200");
  });
  reg("sit-lunchbox", "none", () => {
    const c = Ctx();
    let s = room(c, "#ffd9e6", "#ffb3cf", "#e7bd8a", "#c6935d");
    s += clockSvg(c, 52, 42, 26, 12, 0);
    // the open, empty bag with a lonely spoon
    s += c.shadow(214, 172, 52, 8);
    s += `<path d="M168 82 Q214 66 262 82 L266 164 Q214 178 164 164Z" fill="${c.g("#ff9a2e")}"/><ellipse cx="214" cy="82" rx="48" ry="12" fill="#3a2410"/><ellipse cx="214" cy="84" rx="40" ry="8" fill="#1a0f06"/>`;
    s += `<path d="M168 88 Q214 108 262 88 L264 164 Q214 176 166 164Z" fill="${c.g("#ffb454")}"/><rect x="190" y="122" width="48" height="30" rx="8" fill="#e07b1a" opacity=".55"/>` + TC.seal(214, 137, 8.2, 0, "patch"); // embroidered patch on the bag pocket
    s += `<path d="M180 80 Q176 52 196 48M248 80 Q252 52 232 48" stroke="#c0661a" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    s += `<g transform="rotate(24 222 64)"><rect x="219" y="40" width="6" height="40" rx="3" fill="${c.v("#f4f6fb", "#a9b2c6")}"/><ellipse cx="222" cy="36" rx="10" ry="13" fill="${c.g("#dfe5f2")}"/></g>`;
    s += `<rect x="186" y="24" width="64" height="40" rx="12" fill="#fff" fill-opacity=".3" stroke="#fff" stroke-width="3.5" stroke-dasharray="7 6"/><text x="218" y="53" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="30" fill="#fff">?</text>`;
    s += ollieFig(c, 40, 50, 0.57, { eyes: "s", beak: "o", tear: 1, wl: 36, wr: -36, rot: 2 });
    return c.out(s, "0 0 280 200");
  });
  reg("sit-hurt", "none", () => {
    const c = Ctx();
    let s = room(c, "#e3f6e6", "#b6e6bf", "#ead1a6", "#cfaa72");
    // first-aid box
    s += c.shadow(222, 172, 40, 6) + `<rect x="184" y="118" width="76" height="52" rx="10" fill="${c.g("#ffffff")}" stroke="#d62839" stroke-width="3"/><path d="M202 129 h10 v10 h10 v10 h-10 v10 h-10 v-10 h-10 v-10 h10Z" fill="${c.g("#e63946")}"/>${TC.seal(241, 144, 8, 0, "print")}<path d="M206 118 Q222 100 238 118" stroke="#b0b8c8" stroke-width="5" fill="none"/>`;
    s += `<g transform="translate(230 98) rotate(-18)"><rect x="-26" y="-8" width="52" height="16" rx="8" fill="${c.g("#ffd9a0")}"/><rect x="-8" y="-8" width="16" height="16" fill="#fff3d6"/></g>`;
    // dizzy stars around the head
    s += `<path d="${star5(70, 28, 9, 4)}" fill="#ffc83d"/><path d="${star5(138, 22, 8, 4)}" fill="#ffc83d"/><path d="${star5(104, 12, 7, 3.5)}" fill="#fff"/><path d="${star5(36, 54, 7, 3.5)}" fill="#ffe27a"/>`;
    s += ollieFig(c, 56, 40, 0.6, { eyes: "q", beak: "cry", tear: 1, plaster: 1, bump: 1, wl: 118, wr: -22, front: 1, rot: -4, screen: "ouch" });
    return c.out(s, "0 0 280 200");
  });

  /* ---------- rescue props and classroom pieces ---------- */
  reg("rq-door", "none", (col, wc) => { const c = Ctx(); let s = c.shadow(60, 212, 50, 6) + doorSvg(c, 14, 10, 92, 196, col || "#d9803a", !wc); if (wc) s += wcPlaque(c, 28, 24, 64, 54); return c.out(s, "0 0 120 220"); });
  reg("rq-bell", "none", () => { const c = Ctx(); return c.out(c.shadow(80, 170, 44, 6) + `<rect x="68" y="6" width="24" height="10" rx="5" fill="#8a5527"/>` + bellShape(c, 80, 86, 2.1), "0 0 160 180"); });
  reg("rq-clock", "none", () => { const c = Ctx(); return c.out(clockSvg(c, 100, 100, 92, 9, 0), "0 0 200 200"); });
  reg("rq-window", [104, 138, 11, -8, "sticker"], () => {
    const c = Ctx();
    let s = `<rect x="4" y="4" width="142" height="186" rx="10" fill="${c.v("#c98a4a", "#8a5527")}"/><rect x="14" y="14" width="122" height="150" rx="5" fill="${c.v("#7fd0ff", "#d8f3ff")}"/>`;
    s += c.sphere(108, 44, 18, "#ffd23d") + `<ellipse cx="50" cy="52" rx="26" ry="10" fill="#fff"/><ellipse cx="64" cy="46" rx="16" ry="9" fill="#fff"/><path d="M14 150 Q50 112 90 142 Q116 124 136 140 V164 H14Z" fill="${c.g("#58c46a")}"/>`;
    s += `<rect x="70" y="14" width="10" height="150" fill="#8a5527"/><rect x="14" y="84" width="122" height="9" fill="#8a5527"/><rect x="0" y="162" width="150" height="16" rx="6" fill="${c.v("#d9a05a", "#9a6330")}"/>`;
    s += `<path d="M14 14 Q34 64 14 130Z" fill="#ff7aa8" opacity=".85"/><path d="M136 14 Q116 64 136 130Z" fill="#ff7aa8" opacity=".85"/>` + c.hl(40, 40, 22, 10, -20, 0.5);
    return c.out(s, "0 0 150 200");
  });
  reg("rq-desk", "none", (flip) => {
    const c = Ctx();
    let s = `<rect x="46" y="40" width="82" height="62" rx="9" fill="${c.g("#ff6b6b")}"/><rect x="50" y="102" width="9" height="56" rx="3" fill="${c.g("#5a6aa8")}"/><rect x="141" y="102" width="9" height="56" rx="3" fill="${c.g("#5a6aa8")}"/>`;
    s += `<path d="M24 84 L176 84 L160 52 L40 52Z" fill="${c.g("#ffd58a")}"/><rect x="24" y="84" width="152" height="14" rx="4" fill="${c.g("#e0a14a")}"/><rect x="59" y="98" width="82" height="42" rx="5" fill="${c.v("#e6ad62", "#c48a3e")}"/><rect x="61.5" y="100.5" width="77" height="37" rx="3.5" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.2"/>`;
    s += `<path d="M62 56 L100 62 L138 56 L134 78 L100 84 L66 78Z" fill="#fff"/><path d="M100 62 V84" stroke="#9db7ee" stroke-width="2"/><rect x="146" y="40" width="16" height="22" rx="4" fill="${c.g("#4cc9ff")}"/><path d="M150 40 L152 30M156 40 L158 28" stroke="#ffc83d" stroke-width="3" stroke-linecap="round"/>`;
    if (flip) s = `<g transform="translate(200 0) scale(-1 1)">${s}</g>`; // the second desk is drawn mirrored in the art, so its plate still reads 土城
    return c.out(c.shadow(100, 166, 78, 8) + s + TC.seal(100, 119, 9.4, 0, "plate"), "0 0 200 170"); // brass plate on the front panel
  });
  reg("rq-lunchbox", [50, 91, 12, -8, "sticker"], () => {
    const c = Ctx();
    let s = c.shadow(85, 122, 66, 7) + `<path d="M62 30 Q85 -2 108 30" stroke="#2a9bd0" stroke-width="9" fill="none" stroke-linecap="round"/>`;
    s += `<rect x="14" y="46" width="142" height="72" rx="16" fill="${c.g("#4cc9ff")}"/><rect x="8" y="30" width="154" height="28" rx="14" fill="${c.g("#9ae8ff")}"/>`;
    s += `<rect x="70" y="42" width="30" height="20" rx="7" fill="${c.g("#ffc83d")}"/><path d="${star5(124, 94, 12, 5.5)}" fill="${c.g("#ff5fa2")}"/>` + c.hl(44, 62, 30, 9, -8, 0.8);
    return c.out(s, "0 0 170 130");
  });
  reg("rq-bag-f", [100, 127, 13.5, 0, "patch"], () => { const c = Ctx(); return c.out(`<path d="M10 60 Q100 86 190 60 L186 160 Q100 176 14 160Z" fill="${c.g("#ff9a2e")}"/><rect x="46" y="103" width="108" height="48" rx="12" fill="#e07b1a" opacity=".55"/><path d="M10 60 Q100 86 190 60" stroke="#ffd08a" stroke-width="5" fill="none"/>` + c.hl(50, 100, 36, 14, -10, 0.45), "0 0 200 170"); });
  TC.ART["rq-bag-b"] = () => { const c = Ctx(); return c.out(`<path d="M16 34 Q100 10 184 34 L190 152 Q100 172 10 152Z" fill="${c.g("#c0661a")}"/><ellipse cx="100" cy="44" rx="86" ry="18" fill="#3a2410"/><ellipse cx="100" cy="48" rx="76" ry="12" fill="#1a0f06"/>`, "0 0 200 170"); };
  TC.SEAL["rq-bag-b"] = "none"; // the back of the bag: the mark is the patch on its front piece
  reg("rq-bandage", [100, 50, 14, 0, "print"], () => {
    const c = Ctx();
    let s = `<rect x="8" y="16" width="184" height="68" rx="34" fill="${c.g("#ffd39a")}"/><rect x="70" y="16" width="60" height="68" fill="#fff4dc"/><rect x="70" y="16" width="60" height="68" fill="none" stroke="#e8c690" stroke-width="2"/>`;
    for (let i = 0; i < 5; i++) s += `<circle cx="${30 + i * 5}" cy="${34 + (i % 2) * 14}" r="2.2" fill="#c98a4a"/><circle cx="${170 - i * 5}" cy="${34 + (i % 2) * 14}" r="2.2" fill="#c98a4a"/>`;
    return c.out(s + c.hl(40, 30, 30, 8, -6, 0.8), "0 0 200 100");
  });
  reg("rq-heart", "none", () => {
    const c = Ctx();
    return c.out(c.shadow(100, 176, 56, 6) + `<path d="M100 168 C20 112 4 70 26 42 C50 14 88 24 100 52 C112 24 150 14 174 42 C196 70 180 112 100 168Z" fill="${c.g("#ff4f7b")}"/>` + c.hl(62, 50, 26, 12, -35, 0.9) + `<path d="${star5(158, 38, 10, 4.5)}" fill="#fff" opacity=".9"/>`, "0 0 200 184");
  });
  reg("rq-tap", [46, 35, 8.2, 0, "print"], () => {
    const c = Ctx();
    return c.out(`<rect x="0" y="22" width="86" height="26" rx="8" fill="${c.g("#cfd8e8")}"/><rect x="8" y="14" width="16" height="42" rx="6" fill="${c.g("#9fb0cc")}"/><path d="M70 30 H126 Q150 30 150 56 V76 H122 V60 Q122 56 118 56 H70Z" fill="${c.g("#cfd8e8")}"/><rect x="118" y="72" width="36" height="12" rx="5" fill="${c.g("#9fb0cc")}"/><rect x="92" y="6" width="28" height="22" rx="7" fill="${c.g("#4cc9ff")}"/>` + c.hl(46, 30, 26, 5, -3, 0.8), "0 0 160 100");
  });
  const rawGlass = () => raw("glass", () => { const c = Ctx(); return c.out(`<path d="M14 16 H106 L92 144 Q60 156 28 144Z" fill="#e8f8ff" fill-opacity=".28" stroke="#9ad6ff" stroke-width="5" stroke-linejoin="round"/><ellipse cx="60" cy="16" rx="46" ry="9" fill="#fff" fill-opacity=".35" stroke="#9ad6ff" stroke-width="4"/>` + c.hl(30, 70, 5, 40, 6, 0.9) + TC.seal(60, 104, 15, 0, "print"), "0 0 120 160"); });
  const rawFlame = () => raw("flame", () => { const c = Ctx(); return c.out(`<path d="M8 0 H52 C58 40 44 84 30 118 C16 84 2 40 8 0Z" fill="${c.v("#ff6a00", "#ff2d2d")}"/><path d="M16 0 H44 C48 34 38 66 30 92 C22 66 12 34 16 0Z" fill="${c.v("#ffd23d", "#ff9a2e")}"/><path d="M23 0 H37 C39 24 34 44 30 60 C26 44 21 24 23 0Z" fill="#fff6c8"/>`, "0 0 60 120"); });
  const rawSpark = () => raw("spark", () => { const c = Ctx(); return c.out(`<path d="M20 0 Q23 17 40 20 Q23 23 20 40 Q17 23 0 20 Q17 17 20 0Z" fill="${c.v("#ffffff", "#ffd23d")}"/>`, "0 0 40 40"); });
  const rawDrop = () => raw("drop", () => { const c = Ctx(); return c.out(dropSvg(c, 20, 20, 1.2), "0 0 40 40"); });
  const rawGlasses = () => raw("shades", () => { const c = Ctx(); return c.out(`<rect x="6" y="14" width="76" height="46" rx="18" fill="${c.v("#3b3f5c", "#0a0c1a")}"/><rect x="118" y="14" width="76" height="46" rx="18" fill="${c.v("#3b3f5c", "#0a0c1a")}"/><path d="M82 28 Q100 18 118 28" stroke="#0a0c1a" stroke-width="7" fill="none"/><path d="M6 26 L-4 20M194 26 L204 20" stroke="#0a0c1a" stroke-width="6" stroke-linecap="round"/>` + c.hl(30, 26, 16, 6, -20, 0.8) + c.hl(142, 26, 16, 6, -20, 0.8), "0 0 200 74"); });

  // Ollie as he stands in this classroom (same robot owl; the school's mark is the "home button" under his screen)
  reg("rq-ollie", "none", () => { const c = Ctx(); return c.out(ollieFig(c, 0, 0, 1, {}), "0 0 200 232"); });
  const rawHub = () => raw("hub", () => { const c = Ctx(); return c.out(c.sphere(30, 30, 29, "#aab4cf", 0.5) + TC.seal(30, 30, 18, 0, "print"), "0 0 60 60"); }); // the fan's hub cap
  const rawLogo = () => raw("logo", () => Ctx().out(TC.seal(22, 22, 17, 0, "print"), "0 0 44 44")); // printed mark (card corner, chalkboard corner)
  const rawStar = () => raw("star", () => { const c = Ctx(); return c.out(`<path d="${star5(50, 52, 46, 21)}" fill="${c.g("#ffd23d")}" stroke="#e8a21a" stroke-width="3" stroke-linejoin="round"/>` + c.hl(37, 36, 13, 7, -30, 0.8) + c.eyes(50, 54, 9, 4.6) + c.smile(50, 62, 6), "0 0 100 100"); }); // rescue-meter star (repeated, so it carries no mark)

  /* ======================================================================
     STYLE
     ====================================================================== */
  const css = `
  .rq{position:absolute;inset:0;overflow:hidden;font-family:var(--font);background:#ffe3a3}
  .rq *{box-sizing:border-box}
  .rq img{display:block;-webkit-user-drag:none;user-select:none}
  .rq .wall{position:absolute;left:0;right:0;top:0;height:68%;background:radial-gradient(60% 55% at 38% 8%,rgba(255,255,255,.6),rgba(255,255,255,0)),repeating-linear-gradient(90deg,rgba(255,255,255,.12) 0 5rem,rgba(0,0,0,.035) 5rem 10rem),linear-gradient(180deg,#ffeabd,#ffd488)}
  .rq .wains{position:absolute;left:0;right:0;top:51%;height:17%;background:linear-gradient(180deg,#3bd2a8,#17997d);border-top:.9rem solid #f7e8c6;box-shadow:0 -.35rem 0 #c9a064,inset 0 1.4rem 1.8rem rgba(255,255,255,.22)}
  .rq .floor{position:absolute;left:0;right:0;top:66.4%;bottom:0;background:linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0) 30%,rgba(80,40,0,.18)),repeating-conic-gradient(from 150deg at 50% -70%,#ecbd7d 0 3.6deg,#d49a58 3.6deg 5.6deg,#b98446 5.6deg 6deg);box-shadow:inset 0 2rem 3rem rgba(255,255,255,.18)}
  .rq .base{position:absolute;left:0;right:0;top:66.4%;height:2.2%;background:linear-gradient(180deg,#fff4d6,#d9b27a);box-shadow:0 .5rem 1rem rgba(0,0,0,.22)}
  .rq .ceil{position:absolute;left:0;right:0;top:0;height:9.5%;background:linear-gradient(180deg,#e7eefc,#c4d2ec);border-bottom:.5rem solid #aebddb;box-shadow:0 .6rem 1.4rem rgba(0,0,0,.18)}
  .rq .lamp{position:absolute;top:35%;width:15%;height:34%;border-radius:.8rem;background:linear-gradient(180deg,#fff,#eaf3ff);box-shadow:0 0 3rem 1rem rgba(255,255,255,.9),0 .5rem .8rem rgba(0,0,0,.2)}
  .rq .beam{position:absolute;left:0;top:9%;width:30%;height:70%;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,.5),rgba(255,255,255,0) 70%);clip-path:polygon(0 0,100% 40%,100% 100%,0 60%);transform:translateX(-4%)}
  .rq .win{position:absolute;left:15.8%;top:32%;width:11vh;height:14.7vh;z-index:2}
  .rq .doorbg{position:absolute;left:.6%;top:29.5%;width:12.8%;z-index:2}
  .rq .desk{position:absolute;width:20vh;z-index:3}
  .rq .board{position:absolute;left:21.5%;top:12.6%;width:31%;height:23.4%;border-radius:1.2rem;z-index:2;padding:.5rem 1.4rem .5rem;
    background:radial-gradient(90% 120% at 30% 20%,#3f8a69,#245a43 60%,#1c4634);border:.95rem solid #c98a4a;display:flex;flex-direction:column;align-items:center;justify-content:space-between;
    box-shadow:inset 0 0 2.6rem rgba(0,0,0,.5),inset .2rem .2rem 0 rgba(255,255,255,.18),0 .9rem 0 #8a5527,0 2rem 2.6rem rgba(0,0,0,.3)}
  .rq .board:after{content:"";position:absolute;inset:0;border-radius:.4rem;background:linear-gradient(115deg,rgba(255,255,255,.16),rgba(255,255,255,0) 40%);pointer-events:none}
  .rq .bt{font-family:"Comic Sans MS","Marker Felt","Chalkboard SE",var(--font);color:#f7fbef;font-weight:700;font-size:2.3rem;line-height:1;letter-spacing:.08em;text-shadow:0 0 .5rem rgba(255,255,255,.4);margin-top:.1rem;display:flex;flex-direction:column;align-items:center;gap:.35rem;flex:none}
  .rq .board .blogo{position:absolute;left:.7rem;top:.6rem;width:3.5rem;height:3.5rem;opacity:.95}
  .rq .bt .zh{line-height:1}
  .rq .bt small{font-size:1.15rem;letter-spacing:.12em;color:#ffe58a;font-weight:600}
  .rq .rmeter{flex:none;display:flex;gap:.6rem;align-items:center;justify-content:center;margin-bottom:.2rem}
  .rq .rmeter .lab{font-size:1.2rem;color:#ffe58a;font-weight:700;letter-spacing:.04em;margin-right:.3rem;text-align:center;line-height:1.15}
  .rq .slot{position:relative;flex:none;width:4.2rem;height:4.2rem;border-radius:50%;background:radial-gradient(circle at 35% 30%,#2f6f56,#143a2b);box-shadow:inset 0 .3rem .8rem rgba(0,0,0,.55),0 0 0 .22rem rgba(255,255,255,.25);display:grid;place-items:center}
  .rq .slot img{width:80%;height:80%;filter:grayscale(1) brightness(.5) opacity(.55);transition:filter .3s}
  .rq .slot.on{box-shadow:inset 0 .2rem .6rem rgba(0,0,0,.3),0 0 0 .22rem #ffe58a,0 0 2.4rem 1rem rgba(255,214,61,.8);background:radial-gradient(circle at 35% 30%,#fff6c8,#ffc83d)}
  .rq .slot.on img{filter:drop-shadow(0 .3rem .3rem rgba(0,0,0,.3));animation:rqpopstar .7s cubic-bezier(.2,1.8,.4,1)}
  @keyframes rqpopstar{0%{transform:scale(.1) rotate(-90deg)}100%{transform:none}}
  .rq .clk{position:absolute;left:55%;top:35.4%;width:15vh;height:15vh;z-index:2;filter:drop-shadow(0 1rem 1rem rgba(0,0,0,.3))}
  .rq .clk img{width:100%;height:100%}
  .rq .clk i{position:absolute;left:50%;bottom:50%;width:.22rem;height:41%;margin-left:-.11rem;background:#e63946;border-radius:.2rem;transform-origin:50% 100%;animation:rqsec 60s steps(60) infinite}
  @keyframes rqsec{to{transform:rotate(360deg)}}
  .rq .ollie{position:absolute;left:29%;top:36.3%;width:22.4vh;height:26vh;z-index:5;transform-origin:50% 100%}
  .rq .ollie .ollie3d{position:relative}
  .rq .ollie.worry{animation:rqworry .8s ease-in-out infinite}
  @keyframes rqworry{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg) translateY(-1%)}}
  .rq .ollie.joy{animation:rqjoy .5s ease-in-out infinite}
  @keyframes rqjoy{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-9%) rotate(4deg)}}
  .rq .ollie.gone{visibility:hidden}
  .rq .ollie.pop{animation:rqpop .6s cubic-bezier(.2,1.6,.4,1)}
  .rq .ollie .sw{position:absolute;width:2.4rem;height:2.4rem;opacity:0;pointer-events:none}
  .rq .ollie.worry .sw{animation:rqsweat 1.1s ease-in infinite}
  @keyframes rqsweat{0%{transform:translateY(-.4rem) scale(.4);opacity:0}25%{opacity:1}100%{transform:translateY(3rem) scale(1);opacity:0}}
  .rq .shades{position:absolute;left:19%;top:31%;width:62%;opacity:0;pointer-events:none}
  .rq .big .shades{opacity:1}
  .rq .flame{position:absolute;left:35%;top:92%;width:30%;transform-origin:50% 0;animation:rqflame .08s linear infinite alternate;opacity:0}
  .rq .rk .flame{opacity:1}
  @keyframes rqflame{from{transform:scaleY(.8) scaleX(1.05)}to{transform:scaleY(1.2) scaleX(.9)}}
  .rq .bub{position:absolute;left:42.4%;top:37.4%;width:11.5vh;height:10.5vh;z-index:7;opacity:0;transform-origin:0 100%;pointer-events:none}
  .rq .bub b{display:grid;place-items:center;width:100%;height:100%;background:linear-gradient(180deg,#fff,#e6ebff);border:.45rem solid #fff;border-radius:50% 50% 50% 50%;font-size:7.4rem;line-height:1;color:#ff3d57;font-weight:700;text-shadow:0 .4rem 0 rgba(0,0,0,.16);box-shadow:0 .7rem 0 rgba(0,0,0,.16),0 1.4rem 2rem rgba(0,0,0,.25)}
  .rq .bub:after{content:"";position:absolute;left:-1.4rem;bottom:.2rem;width:3rem;height:2.6rem;background:#fff;clip-path:polygon(100% 0,100% 100%,0 70%)}
  .rq .bub.show{opacity:1;animation:rqpop .55s cubic-bezier(.2,1.6,.4,1) both,rqbub 1.2s ease-in-out .55s infinite}
  @keyframes rqbub{0%,100%{transform:scale(1) rotate(-3deg)}50%{transform:scale(1.07) rotate(3deg)}}
  @keyframes rqpop{from{transform:scale(.2);opacity:0}to{transform:none;opacity:1}}
  @keyframes rqpopr{from{transform:scale(.2) rotate(-3deg);opacity:0}to{transform:rotate(-3deg);opacity:1}}
  .rq .siren{position:absolute;left:53.2%;top:13%;width:6.4vh;height:10.5vh;z-index:3}
  .rq .siren .dome{position:absolute;left:8%;right:8%;top:6%;height:68%;border-radius:50% 50% 12% 12%/72% 72% 12% 12%;overflow:hidden;background:radial-gradient(circle at 35% 30%,#ff9a9a,#e61e32 55%,#7d0010);box-shadow:inset 0 -.5rem .8rem rgba(0,0,0,.35)}
  .rq .siren .dome i{position:absolute;left:50%;top:50%;width:220%;height:220%;margin:-110% 0 0 -110%;background:conic-gradient(from 0deg,rgba(255,255,255,.95) 0 16deg,rgba(255,255,255,0) 40deg 340deg,rgba(255,255,255,.95) 360deg);animation:rqsp 1s linear infinite}
  .rq .siren .sb{position:absolute;left:0;right:0;bottom:0;height:30%;border-radius:.6rem;background:linear-gradient(180deg,#8a93ad,#4a5370)}
  .rq .siren.on .dome{animation:rqglow .5s ease-in-out infinite alternate}
  .rq .siren.calm .dome{animation:rqglow 1.4s ease-in-out infinite alternate}
  .rq .siren.off .dome i{animation-play-state:paused}
  @keyframes rqsp{to{transform:rotate(360deg)}}
  @keyframes rqglow{from{box-shadow:inset 0 -.5rem .8rem rgba(0,0,0,.35),0 0 .6rem 0 rgba(255,40,60,.4)}to{box-shadow:inset 0 -.5rem .8rem rgba(0,0,0,.35),0 0 4rem 1.4rem rgba(255,40,60,.95)}}
  .rq .bellw{position:absolute;left:57.2%;top:12.6%;width:8.6vh;z-index:3;transform-origin:50% 8%}
  .rq .bellw.ring{animation:rqring .16s ease-in-out 8 alternate}
  @keyframes rqring{from{transform:rotate(-16deg)}to{transform:rotate(16deg)}}
  .rq .fan{position:absolute;left:15.5%;top:13.6%;width:10.4vh;height:10.4vh;z-index:3;border-radius:50%;border:.3rem solid #7f8aa6;background:radial-gradient(circle at 40% 35%,#ffffff,#dfe7fa 70%);box-shadow:0 .5rem .9rem rgba(0,0,0,.28),inset 0 0 0 .35rem #c8d2ea}
  .rq .fan .bl{position:absolute;inset:6%;animation:rqsp .35s linear infinite}
  .rq .fan .bl i{position:absolute;left:50%;top:50%;width:46%;height:26%;margin:-13% 0 0 0;border-radius:0 90% 90% 0;background:linear-gradient(90deg,#7ec8ff,#2f8fe0);transform-origin:0 50%}
  .rq .fan .hub{position:absolute;left:50%;top:50%;width:42%;height:42%;margin:-21% 0 0 -21%;border-radius:50%;z-index:2;box-shadow:0 .15rem .3rem rgba(0,0,0,.3)}
  .rq .fan:after{content:"";position:absolute;inset:8%;border-radius:50%;background:repeating-radial-gradient(circle,rgba(127,138,166,.0) 0 .5rem,rgba(127,138,166,.55) .5rem .6rem);pointer-events:none}
  .rq .redflash{position:absolute;inset:0;z-index:30;pointer-events:none;opacity:0;box-shadow:inset 0 0 16rem 4rem rgba(255,0,40,.8)}
  .rq .redflash.on{animation:rqred .5s ease-in-out 4}
  @keyframes rqred{0%,100%{opacity:0}50%{opacity:1}}
  /* the situation card (front = the situation, back = the rescue) */
  .rq .card{position:absolute;right:2%;top:13.8%;width:33.6vw;height:27.6vw;perspective:110rem;z-index:6}
  .rq .card .tilt{position:absolute;inset:0;opacity:0;transform-style:preserve-3d}
  .rq .card.show .tilt{opacity:1;animation:rqdrop .95s cubic-bezier(.2,1.2,.4,1) both,rqfloat 5s ease-in-out .95s infinite}
  .rq .card.out .tilt{opacity:1;animation:rqout .6s ease-in forwards}
  @keyframes rqdrop{0%{transform:translateY(-140%) rotate(-14deg) scale(.8)}55%{transform:translateY(5%) rotate(3deg)}78%{transform:translateY(-2%) rotate(-1deg)}100%{transform:none}}
  @keyframes rqfloat{0%,100%{transform:rotateY(-6deg) rotateX(2deg) translateY(0)}50%{transform:rotateY(6deg) rotateX(-1deg) translateY(-.9rem)}}
  @keyframes rqout{to{transform:translateY(60%) rotate(12deg) scale(.6);opacity:0}}
  .rq .card .in{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .75s cubic-bezier(.3,1.25,.5,1)}
  .rq .card.flip .in{transform:rotateY(180deg)}
  .rq .face{position:absolute;inset:0;border-radius:2.2rem;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;border:.75rem solid #fff;box-shadow:0 1.3rem 0 rgba(0,0,0,.2),0 2.6rem 4rem rgba(0,0,0,.42)}
  .rq .front{background:#fff}
  .rq .front .hd{position:absolute;left:0;right:0;top:0;height:3.7rem;z-index:2;display:flex;align-items:center;gap:.8rem;padding:0 1.2rem 0 4.5rem;background:linear-gradient(180deg,#ff6a6a,#d62839);color:#fff;font-weight:700;font-size:1.9rem;letter-spacing:.05em;text-shadow:0 .2rem 0 rgba(0,0,0,.3)}
  .rq .front .hd .logo{position:absolute;left:-.3rem;top:-.3rem;width:4.1rem;height:4.1rem;padding:.35rem;border-radius:50%;background:#fff}
  .rq .front .hd i{width:1.5rem;height:1.5rem;border-radius:50%;background:#fff;box-shadow:0 0 .9rem #fff;animation:rqblink .5s steps(2) infinite}
  .rq .front .hd span{margin-left:auto;font-size:1.3rem;opacity:.9}
  @keyframes rqblink{50%{opacity:.15}}
  .rq .front .pic{position:absolute;left:0;top:3.7rem;width:100%;height:calc(100% - 3.7rem);object-fit:cover}
  .rq .front:after{content:"";position:absolute;inset:0;background:linear-gradient(125deg,rgba(255,255,255,.4),rgba(255,255,255,0) 32%);pointer-events:none}
  .rq .back{transform:rotateY(180deg);background:linear-gradient(180deg,#8fe3ff,#e8fbff)}
  .rq .pbox{position:absolute;inset:0;overflow:hidden;perspective:60rem;background:radial-gradient(70% 70% at 50% 62%,#fffbe0,#cdf3ff)}
  .rq .rays{position:absolute;left:50%;top:60%;width:260%;height:260%;margin:-130% 0 0 -130%;background:repeating-conic-gradient(rgba(255,230,120,.5) 0 9deg,rgba(255,255,255,0) 9deg 18deg);animation:rqsp 14s linear infinite}
  .rq .rbn{position:absolute;left:0;right:0;margin:0 auto;width:max-content;bottom:5%;white-space:nowrap;padding:.2rem 2.4rem .5rem;border-radius:2rem;border:.4rem solid #fff;text-align:center;color:#fff;line-height:1.05;
    background:linear-gradient(180deg,#ff7aa8,#ff3d77);box-shadow:0 .5rem 0 #b01c4d,0 1.2rem 1.6rem rgba(0,0,0,.3);animation:rqpopr .5s cubic-bezier(.2,1.6,.4,1) both}
  .rq .rbn b{display:block;font-size:3.3rem;letter-spacing:.06em;text-shadow:0 .25rem 0 rgba(0,0,0,.25)}
  .rq .rbn span{display:block;font-size:1.6rem;font-weight:700}
  .rq .fx{position:absolute;inset:0;z-index:20;pointer-events:none}
  .rq .ring{position:absolute;border-radius:50%;border:.5rem solid rgba(255,255,255,.9);animation:rqwave .9s ease-out forwards}
  @keyframes rqwave{from{transform:scale(.3);opacity:1}to{transform:scale(2.2);opacity:0}}
  .rq .abs{position:absolute}
  /* the disco finale */
  .rq .disco{position:absolute;inset:0;z-index:12;pointer-events:none;opacity:0;transition:opacity .8s}
  .rq .disco.on{opacity:1}
  .rq .disco .dim{position:absolute;inset:0;background:radial-gradient(70% 70% at 50% 55%,rgba(40,10,90,.15),rgba(10,4,40,.8))}
  .rq .disco .sp{position:absolute;top:-6%;width:34%;height:130%;mix-blend-mode:screen;clip-path:polygon(46% 0,54% 0,100% 100%,0 100%);transform-origin:50% 0;animation:rqsw 3s ease-in-out infinite;background:linear-gradient(rgba(255,255,255,.55),rgba(255,255,255,0))}
  @keyframes rqsw{0%,100%{transform:rotate(-26deg)}50%{transform:rotate(26deg)}}
  .rq .disco .ball{position:absolute;left:24%;top:13vh;width:15vh;height:15vh;margin-left:-7.5vh;border-radius:50%;animation:rqspin2 5s linear infinite;
    background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.95),transparent 28%),repeating-conic-gradient(#e5ecff 0 9deg,#7b8be0 9deg 18deg),#a5b4ff;box-shadow:0 0 5rem 1.5rem rgba(201,214,255,.85)}
  @keyframes rqspin2{to{transform:rotate(360deg)}}
  .rq .disco .tiles{position:absolute;left:-30%;right:-30%;bottom:-2%;height:50%;display:grid;grid-template-columns:repeat(14,1fr);grid-template-rows:repeat(6,1fr);gap:.5vh;transform-origin:50% 100%;transform:perspective(60rem) rotateX(56deg)}
  .rq .disco .tiles i{border-radius:.6vh;animation:rqtile .8s infinite}
  @keyframes rqtile{0%{background:#ff2d95}25%{background:#ffd23d}50%{background:#2ee6b6}75%{background:#4cc9ff}100%{background:#ff2d95}}
  .rq .disco .orbit{position:absolute;left:50%;top:42%;width:0;height:0;animation:rqspin2 6s linear infinite}
  .rq .disco .orbit img{position:absolute;width:9vh;height:9vh;margin:-4.5vh;animation:rqspin2 2s linear infinite reverse;filter:drop-shadow(0 0 1.4rem #ffd23d)}
  .rq .disco .ban{position:absolute;left:0;right:0;top:75%;text-align:center;color:#fff;line-height:1;text-shadow:0 .5rem 0 #9b2cff,0 0 2.4rem rgba(255,95,162,.9);animation:rqbeat .5s ease-in-out infinite}
  .rq .disco .ban b{display:block;font-size:7.4rem;letter-spacing:.06em}
  .rq .disco .ban span{display:block;font-size:2.6rem;margin-top:.4rem;color:#ffd23d;font-weight:700}
  @keyframes rqbeat{50%{transform:scale(1.05) rotate(-1deg)}}
  .rq .ollie.big{left:50%;top:37%;width:26vh;height:30vh;margin-left:-13vh;z-index:14;transform:scale(1.7)}
  .rq .ollie.dance{animation:rqdance .5s ease-in-out infinite}
  @keyframes rqdance{0%,100%{transform:scale(1.7) rotate(-9deg) translateY(0)}25%{transform:scale(1.7) rotate(0) translateY(-6%)}50%{transform:scale(1.7) rotate(9deg) translateY(0)}75%{transform:scale(1.7) rotate(0) translateY(-6%)}}
  .rq .ollie.big{transition:left .6s,top .6s}
  .rq .card.gone,.rq .bub.gone{display:none}
  `;

  /* ======================================================================
     SOUND (own little synth on the shared audio context)
     ====================================================================== */
  function tone(f, t0, dur, type, vol, f2) {
    try {
      const c = TC.ac(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain(), now = c.currentTime + t0, v = Math.max(0.0002, vol * (TC.cfg.volume == null ? 0.9 : TC.cfg.volume));
      o.type = type; o.frequency.setValueAtTime(f, now); if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + dur);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(v, now + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(g); g.connect(c.destination); o.start(now); o.stop(now + dur + 0.05);
    } catch (e) {}
  }
  const bellSound = (n) => { for (let i = 0; i < n; i++) { const t = i * 0.28; tone(1320, t, 0.7, "sine", 0.22); tone(2640, t, 0.45, "sine", 0.1); tone(3960, t, 0.25, "sine", 0.05); } };
  const sirenSound = () => { for (let i = 0; i < 3; i++) { tone(620, i * 0.42, 0.4, "sawtooth", 0.07, 940); } };

  /* ======================================================================
     THE GAME
     ====================================================================== */
  let root, api0, card, pic, pbox, fx, bub, ollie, siren, bellw, redflash, disco, meter, slots = [], alive = false, idleT = 0, discoT = 0, discoOn = false, beatStep = 0;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
  const q = (s) => root.querySelector(s);
  const an = (el, kf, opt) => { try { return el.animate(kf, Object.assign({ fill: "forwards" }, opt)).finished.catch(() => {}); } catch (e) { return Promise.resolve(); } };
  const art = (name, css, cls, args) => { const i = new Image(); i.src = TC.art(name, ...(args || [])); i.className = cls || ""; i.draggable = false; if (css) i.style.cssText = css; return i; };
  const rimg = (url, css) => { const i = new Image(); i.src = url; i.draggable = false; i.style.cssText = css || ""; return i; };
  const put = (parent, el, css) => { if (css) el.style.cssText = (el.style.cssText || "") + ";" + css; parent.append(el); return el; };
  const box = (css, cls) => h("div", { class: cls || "abs", style: css });
  const wait = async (ms) => { const end = Date.now() + ms; while (Date.now() < end && !(api0 && api0.aborted)) await TC.sleep(Math.max(10, Math.min(100, end - Date.now()))); };

  function burst(parent, x, y, n, size, dist) {
    for (let i = 0; i < n; i++) {
      const s = rimg(rawSpark(), `position:absolute;left:${x}%;top:${y}%;width:${(size || 3) * (0.6 + Math.random() * 0.8)}rem;margin:-1.4rem 0 0 -1.4rem;pointer-events:none`);
      parent.append(s);
      const a = Math.random() * 6.283, d = (dist || 12) * (0.5 + Math.random());
      const an0 = s.animate([{ transform: "translate(0,0) scale(.2) rotate(0)", opacity: 1 }, { transform: `translate(${Math.cos(a) * d}rem,${Math.sin(a) * d}rem) scale(1.2) rotate(240deg)`, opacity: 0 }], { duration: 700 + Math.random() * 600, easing: "ease-out" });
      an0.onfinish = () => s.remove();
    }
  }
  const ringAt = (parent, x, y, sz) => { const r = h("div", { class: "ring", style: `left:${x}%;top:${y}%;width:${sz}rem;height:${sz}rem;margin:${-sz / 2}rem 0 0 ${-sz / 2}rem` }); parent.append(r); later(() => r.remove(), 1000); };
  const banner = (b, zh) => b.append(h("div", { class: "rbn" }, h("b", {}, "RESCUED!"), h("span", { class: "zh" }, zh || "救到了！")));

  function build(api) {
    api.stage.append(h("style", {}, css));
    root = h("div", { class: "rq" });
    const doorUrl = TC.art("rq-door", "#d9803a");
    root.innerHTML = `
      <div class="wall"></div><div class="wains"></div><div class="floor"></div><div class="base"></div>
      <div class="ceil"><i class="lamp" style="left:44%"></i><i class="lamp" style="left:81%"></i></div>
      <div class="beam"></div>
      <div class="siren calm off"><div class="dome"><i></i></div><div class="sb"></div></div>
      <img class="bellw" src="${TC.art("rq-bell")}" alt="">
      <div class="fan"><div class="bl"><i></i><i style="transform:rotate(120deg)"></i><i style="transform:rotate(240deg)"></i></div><img class="hub" src="${rawHub()}" alt=""></div>
      <img class="win" src="${TC.art("rq-window")}" alt="">
      <img class="doorbg" src="${doorUrl}" alt="">
      <div class="board"><img class="blogo" src="${rawLogo()}" alt=""><div class="bt"><span class="zh">土城國小</span><small>TUCHENG ENGLISH DAY</small></div><div class="rmeter"></div></div>
      <img class="desk" style="left:17%;top:46.5%" src="${TC.art("rq-desk")}" alt="">
      <img class="desk" style="left:46%;top:46.5%" src="${TC.art("rq-desk", 1)}" alt="">
      <div class="clk"><img src="${TC.art("rq-clock")}" alt=""><i></i></div>
      <div class="ollie worry"><div class="ollie3d"><img src="${TC.art("rq-ollie")}" alt="Ollie-Bot" draggable="false"></div><img class="shades" src="${rawGlasses()}" alt=""><img class="flame" src="${rawFlame()}" alt=""><img class="sw" style="left:76%;top:4%" src="${rawDrop()}" alt=""><img class="sw" style="left:8%;top:14%;animation-delay:.5s" src="${rawDrop()}" alt=""></div>
      <div class="bub"><b>?</b></div>
      <div class="card"><div class="tilt"><div class="in">
        <div class="face front"><div class="hd"><img class="logo" src="${rawLogo()}" alt=""><i></i>SOS<span class="zh">教室求救！</span></div><img class="pic" alt=""></div>
        <div class="face back"><div class="pbox"></div></div>
      </div></div></div>
      <div class="disco"><div class="dim"></div>
        <div class="sp" style="left:-2%;background:linear-gradient(rgba(255,95,162,.8),rgba(255,95,162,0))"></div><div class="sp" style="left:18%;animation-delay:-.8s;background:linear-gradient(rgba(76,201,255,.8),rgba(76,201,255,0))"></div>
        <div class="sp" style="left:38%;animation-delay:-1.6s;background:linear-gradient(rgba(255,210,61,.8),rgba(255,210,61,0))"></div><div class="sp" style="left:58%;animation-delay:-2.2s;background:linear-gradient(rgba(46,230,182,.8),rgba(46,230,182,0))"></div>
        <div class="sp" style="left:76%;animation-delay:-.4s;background:linear-gradient(rgba(155,107,255,.85),rgba(155,107,255,0))"></div>
        <div class="tiles"></div><div class="ball"></div><div class="orbit"></div>
        <div class="ban"><b>ALL RESCUED!</b><span class="zh">教室大救援成功！</span></div></div>
      <div class="fx"></div><div class="redflash"></div>`;
    api.stage.append(root);
    card = q(".card"); pic = q(".front .pic"); pbox = q(".pbox"); fx = q(".fx"); bub = q(".bub"); ollie = q(".ollie"); siren = q(".siren"); bellw = q(".bellw"); redflash = q(".redflash"); disco = q(".disco"); meter = q(".rmeter");
    const tiles = q(".tiles"); for (let i = 0; i < 84; i++) tiles.append(h("i", { style: `animation-delay:${-((i * 7) % 13) * 0.12}s` }));
    const orb = q(".orbit"); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, st = rimg(rawStar()); st.style.left = Math.cos(a) * 34 + "vh"; st.style.top = Math.sin(a) * 22 + "vh"; orb.append(st); }
    buildMeter(5);
  }
  function buildMeter(n) {
    meter.innerHTML = ""; slots = [];
    meter.append(h("div", { class: "lab zh" }, "救援能量", h("br"), "RESCUE"));
    for (let i = 0; i < n; i++) { const s = h("div", { class: "slot" }, rimg(rawStar())); meter.append(s); slots.push(s); }
  }
  function fillMeter(i) { const s = slots[i]; if (!s) return; s.classList.add("on"); TC.sfx("levelup"); const r = s.getBoundingClientRect(); burst(fx, (r.left + r.width / 2) / innerWidth * 100, (r.top + r.height / 2) / innerHeight * 100, 10, 3, 9); }

  /** show / hide pieces of the scene ------------------------------------------------ */
  /** put Ollie back in his place (cancels leftover WAAPI animations, e.g. the rocket flight) */
  function resetOllie(cls) { ollie.getAnimations().forEach((a) => a.cancel()); ollie.className = cls == null ? "ollie worry" : cls; ollie.style.cssText = ""; }
  function resetScene() {
    timers.forEach(clearTimeout); timers.clear(); clearInterval(idleT); idleT = 0; clearTimeout(discoT); discoOn = false;
    if (!root) return;
    fx.innerHTML = ""; pbox.innerHTML = "";
    root.classList.remove("disc"); disco.classList.remove("on");
    resetOllie(); ollie.querySelectorAll(".ollie3d").forEach((o) => o.classList.remove("cheer", "talk"));
    card.classList.remove("flip", "out", "gone"); bub.classList.remove("show", "gone");
    redflash.classList.remove("on"); siren.className = "siren calm off"; bellw.classList.remove("ring");
    document.querySelectorAll(".clap-banner").forEach((e) => e.remove());
  }
  function setCard(sc) {
    const inn = q(".card .in"); inn.style.transition = "none"; card.classList.remove("flip", "out", "gone", "show"); void inn.offsetWidth; inn.style.transition = "";
    pic.src = TC.art(TC.ART[sc.img] ? sc.img : "sit-late"); pic.alt = sc.zh || sc.say;
    pbox.innerHTML = ""; fx.innerHTML = "";
    resetOllie(); bub.classList.remove("show");
    void card.offsetWidth;
  }
  /** SOS! red flashing siren, school bell, the card drops in, a "?" bubble pops over Ollie */
  async function emergency() {
    redflash.classList.remove("on"); void redflash.offsetWidth; redflash.classList.add("on");
    siren.className = "siren on"; bellw.classList.remove("ring"); void bellw.offsetWidth; bellw.classList.add("ring");
    sirenSound(); bellSound(3);
    card.classList.add("show");
    await wait(850);
    bub.classList.add("show"); TC.sfx("pop");
    await wait(650);
    siren.className = "siren calm"; bellw.classList.remove("ring");
  }

  /* ---------- the six rescues: each plays on the back of the card, 2–3 seconds ---------- */
  function panel() { pbox.innerHTML = ""; pbox.append(h("div", { class: "rays" })); return pbox; }
  /** a door whose leaf swings open in front of a bright doorway */
  function doorway(b, css, color, wc) {
    const d = box(css + ";aspect-ratio:120/220");
    const way = box("left:12%;right:12%;top:5%;bottom:5%;border-radius:.4rem;background:radial-gradient(circle at 50% 60%,#fff,#ffe27a 60%,#ffb347);box-shadow:0 0 3rem .6rem rgba(255,226,122,.9)");
    const leaf = art("rq-door", "position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:11% 50%;backface-visibility:visible", "", [color, wc]);
    d.append(way, leaf); b.append(d);
    return { d, way, leaf, open: () => an(leaf, [{ transform: "rotateY(0)" }, { transform: "rotateY(-108deg)" }], { duration: 850, easing: "cubic-bezier(.3,.1,.3,1)" }) };
  }
  const RESCUE = {
    /* late: the school bell stops, the door swings open, Ollie slips in */
    late: async (b) => {
      const bl = put(b, art("rq-bell"), "position:absolute;left:5%;top:7%;width:30%");
      const dw = doorway(b, "left:56%;top:8%;width:30%", "#d9803a");
      const ol = put(b, art("rq-ollie"), "position:absolute;left:4%;bottom:5%;width:22%");
      bl.animate([{ transform: "rotate(-18deg)" }, { transform: "rotate(18deg)" }], { duration: 130, iterations: 11, direction: "alternate" });
      bellSound(4); ringAt(b, 20, 24, 12); later(() => ringAt(b, 20, 24, 12), 350); later(() => ringAt(b, 20, 24, 12), 700);
      await wait(1450);
      bl.getAnimations().forEach((a) => a.cancel()); TC.sfx("ding"); bl.animate([{ transform: "rotate(0) scale(1)" }, { transform: "rotate(0) scale(1.12)" }, { transform: "rotate(0) scale(1)" }], { duration: 300 });
      await wait(300);
      TC.sfx("whoosh"); dw.open(); burst(b, 71, 50, 18, 3.2, 14);
      await wait(550); TC.sfx("sparkle");
      await an(ol, [{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: "translate(" + Math.round(b.clientWidth * 0.52) + "px,-8%) scale(.55)", opacity: 1, offset: 0.8 }, { transform: "translate(" + Math.round(b.clientWidth * 0.56) + "px,-8%) scale(.3)", opacity: 0 }], { duration: 900, easing: "ease-in-out" });
      burst(b, 71, 52, 14, 3, 10);
    },
    /* in: the door opens and everybody waves */
    in: async (b) => {
      const dw = doorway(b, "left:6%;top:8%;width:30%", "#c97b3a");
      const pals = ["cat", "dog", "bear"].map((n, i) => put(b, art(n), `position:absolute;left:${34 + i * 21}%;bottom:12%;width:24%;transform:scale(0);transform-origin:50% 100%`));
      const ol = put(b, art("rq-ollie"), "position:absolute;left:7%;bottom:5%;width:22%");
      TC.sfx("click"); await wait(300);
      TC.sfx("whoosh"); dw.open(); burst(b, 21, 50, 14, 3, 12);
      await wait(500);
      pals.forEach((p, i) => later(() => { TC.sfx("pop"); an(p, [{ transform: "scale(0) rotate(0)" }, { transform: "scale(1.15) rotate(-8deg)" }, { transform: "scale(1) rotate(0)" }], { duration: 420, easing: "ease-out" }).then(() => p.animate([{ transform: "rotate(-9deg) translateY(0)" }, { transform: "rotate(9deg) translateY(-6%)" }], { duration: 300, iterations: 8, direction: "alternate" })); }, i * 240));
      later(() => put(b, h("div", { class: "abs", style: "left:36%;top:7%;padding:.2rem 1.6rem;border-radius:2rem;background:#fff;font-weight:700;font-size:2.6rem;color:#ff6a00;box-shadow:0 .4rem 0 rgba(0,0,0,.15);animation:rqpop .4s both" }, "Hi, Ollie!")), 700);
      await an(ol, [{ transform: "translate(0,0)" }, { transform: "translate(" + Math.round(b.clientWidth * 0.2) + "px,-4%) scale(1.08) rotate(-6deg)" }, { transform: "translate(" + Math.round(b.clientWidth * 0.2) + "px,-4%) scale(1) rotate(0)" }], { duration: 900, easing: "ease-out" });
      TC.sfx("sparkle"); burst(b, 50, 40, 16, 3, 12);
      await wait(900);
    },
    /* restroom: Ollie rockets across the screen with turbo flames */
    restroom: async (b) => {
      const dw = doorway(b, "left:60%;top:8%;width:30%", "#43c3a6", true);
      const lamp = put(b, h("div", { class: "abs", style: "left:62%;top:2%;width:7%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff9a9a,#e61e32);box-shadow:0 0 1.4rem #e61e32" }));
      TC.sfx("boost");
      const r0 = ollie.getBoundingClientRect(), rp = dw.d.getBoundingClientRect(), tx = rp.left + rp.width / 2 - (r0.left + r0.width / 2), ty = rp.top + rp.height * 0.5 - (r0.top + r0.height / 2);
      // streaks of speed
      for (let i = 0; i < 7; i++) { const s = h("div", { class: "abs", style: `left:${22 + i * 3}%;top:${24 + i * 6}%;height:.5rem;width:${12 + (i % 3) * 5}%;border-radius:1rem;background:linear-gradient(90deg,rgba(255,255,255,0),#fff);opacity:0` }); fx.append(s); later(() => { s.animate([{ transform: "translateX(-10%)", opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: "translateX(260%)", opacity: 0 }], { duration: 700 }); }, 250 + i * 70); }
      ollie.classList.remove("worry"); ollie.classList.add("rk");
      await an(ollie, [{ transform: "scale(1,1)" }, { transform: "scale(1.15,.82)", offset: 0.35 }, { transform: "scale(1.15,.82)" }], { duration: 360, easing: "ease-in-out" });
      // lift off (the classroom Ollie itself flies)
      const flight = an(ollie, [{ transform: "translate(0,0) rotate(0) scale(1.15,.82)" }, { transform: `translate(${tx * 0.12}px,${-r0.height * 0.35}px) rotate(70deg) scale(1)`, offset: 0.2 }, { transform: `translate(${tx * 0.7}px,${ty * 0.5 - r0.height * 0.5}px) rotate(84deg) scale(.95)`, offset: 0.7 }, { transform: `translate(${tx}px,${ty}px) rotate(88deg) scale(.4)`, opacity: 0.1 }], { duration: 1250, easing: "cubic-bezier(.45,0,.75,.5)" });
      const puffT = setInterval(() => { const pr = ollie.getBoundingClientRect(); const pf = h("div", { class: "abs", style: `left:${pr.left + pr.width / 2 - 14}px;top:${pr.top + pr.height / 2 - 14}px;width:2.6rem;height:2.6rem;border-radius:50%;background:radial-gradient(circle,#fff,#ffd9a0 60%,rgba(255,150,60,0))` }); fx.append(pf); pf.animate([{ transform: "scale(.5)", opacity: 1 }, { transform: "scale(2.2)", opacity: 0 }], { duration: 500 }).onfinish = () => pf.remove(); }, 60);
      timers.add(puffT);
      await flight; clearInterval(puffT); timers.delete(puffT);
      ollie.classList.remove("rk"); ollie.classList.add("gone");
      lamp.style.background = "radial-gradient(circle at 35% 30%,#b8ffd8,#1ec46a)"; lamp.style.boxShadow = "0 0 1.6rem #1ec46a";
      TC.sfx("whoosh"); dw.open(); burst(b, 75, 50, 20, 3.2, 14);
      await wait(700);
    },
    /* water: a glass fills with water and splashes */
    water: async (b) => {
      const tap = put(b, art("rq-tap"), "position:absolute;left:12%;top:3%;width:40%;z-index:3");
      const gx = "left:20%;top:20%;width:30%;aspect-ratio:120/160;z-index:2";
      const gl = box(gx); const wat = box("inset:0;clip-path:polygon(15% 11%,85% 11%,74.2% 89%,25.8% 89%)"); const lv = box("left:0;right:0;bottom:11%;height:0;background:linear-gradient(180deg,#7fd8ff,#2f9bff)");
      lv.innerHTML = `<i style="position:absolute;left:10%;right:10%;top:-4%;height:8%;border-radius:50%;background:#c9f0ff"></i>`; wat.append(lv);
      gl.append(wat, rimg(rawGlass(), "position:absolute;inset:0;width:100%;height:100%")); b.append(gl);
      const stream = put(b, box("left:35.2%;top:19%;width:2.2%;height:0;border-radius:1rem;background:linear-gradient(90deg,#9fe0ff,#3aa7ff);z-index:1"));
      const ol = put(b, art("rq-ollie"), "position:absolute;right:4%;bottom:12%;width:25%");
      TC.sfx("click");
      an(stream, [{ height: "0" }, { height: "56%" }], { duration: 300 });
      await wait(250);
      for (let k = 0; k < 5; k++) later(() => TC.sfx("tick"), k * 160);
      an(lv, [{ height: "0%" }, { height: "62%" }], { duration: 1500, easing: "ease-in-out" });
      later(() => { for (let k = 0; k < 6; k++) { const d = rimg(rawDrop(), `position:absolute;left:35%;top:${70}%;width:2.6rem;z-index:3`); b.append(d); d.animate([{ transform: "translate(0,0)", opacity: 1 }, { transform: `translate(${(Math.random() - 0.5) * 14}rem,${-6 - Math.random() * 6}rem)`, opacity: 1, offset: 0.5 }, { transform: `translate(${(Math.random() - 0.5) * 18}rem,4rem)`, opacity: 0 }], { duration: 800 + Math.random() * 300 }).onfinish = () => d.remove(); } }, 600);
      await wait(1550);
      an(stream, [{ height: "56%", opacity: 1 }, { height: "56%", opacity: 0 }], { duration: 250 });
      TC.sfx("sparkle"); ringAt(b, 35, 70, 12); burst(b, 35, 40, 22, 3, 14);
      for (let k = 0; k < 10; k++) { const d = rimg(rawDrop(), `position:absolute;left:35%;top:30%;width:${1.6 + Math.random() * 2}rem;z-index:4`); b.append(d); d.animate([{ transform: "translate(0,0) scale(.4)", opacity: 1 }, { transform: `translate(${(Math.random() - 0.5) * 26}rem,${-8 - Math.random() * 8}rem) scale(1)`, opacity: 1, offset: 0.45 }, { transform: `translate(${(Math.random() - 0.5) * 30}rem,6rem)`, opacity: 0 }], { duration: 900 + Math.random() * 400, easing: "ease-out" }).onfinish = () => d.remove(); }
      an(gl, [{ transform: "scale(1)" }, { transform: "scale(1.12,.92)" }, { transform: "scale(1)" }], { duration: 400 });
      an(ol, [{ transform: "translateY(0) rotate(0)" }, { transform: "translateY(-14%) rotate(-8deg)" }, { transform: "translateY(0) rotate(8deg)" }, { transform: "translateY(-10%) rotate(0)" }], { duration: 800 });
      await wait(800);
    },
    /* lunchbox: a lunchbox pops out of the bag with a rainbow */
    lunchbox: async (b) => {
      const rb = put(b, art("rainbow"), "position:absolute;left:12%;top:6%;width:76%;transform:scale(0);transform-origin:50% 100%");
      const bg = "position:absolute;left:30%;bottom:6%;width:40%";
      put(b, art("rq-bag-b", bg + ";z-index:1"));
      const lb = put(b, art("rq-lunchbox"), "position:absolute;left:36%;bottom:12%;width:28%;z-index:2;transform:translateY(60%)");
      put(b, art("rq-bag-f", bg + ";z-index:3"));
      TC.sfx("click"); await wait(250);
      TC.sfx("boost");
      an(rb, [{ transform: "scale(0)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 900, easing: "ease-out" });
      await an(lb, [{ transform: "translateY(60%) rotate(0) scale(.9,1.1)" }, { transform: "translateY(-135%) rotate(-12deg) scale(1,1)", offset: 0.55 }, { transform: "translateY(-95%) rotate(8deg) scale(1.05,.95)", offset: 0.78 }, { transform: "translateY(-105%) rotate(0) scale(1)" }], { duration: 900, easing: "ease-out" });
      TC.sfx("sparkle"); burst(b, 50, 34, 24, 3.2, 14); ringAt(b, 50, 36, 10);
      await an(lb, [{ transform: "translateY(-105%) rotate(0)" }, { transform: "translateY(-112%) rotate(-6deg) scale(1.06)" }, { transform: "translateY(-105%) rotate(6deg)" }, { transform: "translateY(-108%) rotate(0)" }], { duration: 700 });
    },
    /* hurt: a bandage and a heart with "get well" sparkles */
    hurt: async (b) => {
      const ht = put(b, art("rq-heart"), "position:absolute;left:25%;top:8%;width:50%;transform:scale(0);transform-origin:50% 60%");
      const bd = put(b, art("rq-bandage"), "position:absolute;left:30%;top:34%;width:40%;z-index:2;opacity:0");
      TC.sfx("pop");
      await an(ht, [{ transform: "scale(0)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }], { duration: 500, easing: "ease-out" });
      TC.sfx("whoosh");
      await an(bd, [{ transform: "translate(-120%,-90%) rotate(-200deg) scale(.4)", opacity: 1 }, { transform: "translate(0,0) rotate(-24deg) scale(1.15)", opacity: 1, offset: 0.75 }, { transform: "translate(0,0) rotate(-24deg) scale(1)", opacity: 1 }], { duration: 650, easing: "ease-out" });
      TC.sfx("stamp"); burst(b, 50, 42, 26, 3.2, 14); ringAt(b, 50, 42, 14);
      ht.animate([{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }], { duration: 420, iterations: 3 });
      bd.animate([{ transform: "rotate(-24deg) scale(1)" }, { transform: "rotate(-24deg) scale(1.08)" }, { transform: "rotate(-24deg) scale(1)" }], { duration: 420, iterations: 3 });
      put(b, h("div", { class: "abs", style: "left:0;right:0;margin:0 auto;width:max-content;top:6%;white-space:nowrap;padding:.1rem 1.8rem;border-radius:2rem;background:#fff;color:#ff3d77;font-weight:700;font-size:2.8rem;box-shadow:0 .4rem 0 rgba(0,0,0,.15);animation:rqpopr .4s both" }, "Get well soon!"));
      for (let k = 0; k < 3; k++) later(() => { TC.sfx("sparkle"); burst(b, 30 + Math.random() * 40, 30 + Math.random() * 30, 8, 2.6, 10); }, 300 + k * 380);
      await wait(1300);
    }
  };
  RESCUE.generic = async (b) => { const ht = put(b, art("rq-heart"), "position:absolute;left:30%;top:14%;width:40%"); TC.sfx("sparkle"); burst(b, 50, 40, 24, 3, 14); await an(ht, [{ transform: "scale(.2)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }], { duration: 600 }); await wait(700); };
  const ZH = { late: "準時進教室！", in: "歡迎進來！", restroom: "衝向廁所！", water: "有水喝了！", lunchbox: "有便當吃了！", hurt: "快快好起來！" };

  async function rescue(sc, i) {
    bub.classList.remove("show"); siren.className = "siren calm off";
    card.classList.add("flip"); TC.sfx("whoosh");
    await wait(550);
    const b = panel();
    const run = (RESCUE[sc.w] || RESCUE.generic)(b);
    const fill = wait(1500).then(() => { if (!(api0 && api0.aborted)) fillMeter(i); });
    await run; await fill;
    if (api0 && api0.aborted) return;
    banner(b, ZH[sc.w]); TC.sfx("fanfare"); TC.confetti(70);
    resetOllie("ollie joy pop");
  }

  /** after the last rescue: the classroom becomes a disco, Ollie dances in shades */
  async function discoParty() {
    card.classList.add("out"); bub.classList.add("gone"); siren.className = "siren on"; TC.sfx("whoosh");
    resetOllie("ollie big");
    root.classList.add("disc"); disco.classList.add("on"); discoOn = true;
    await wait(450);
    ollie.classList.add("dance");
    TC.sfx("fanfare"); TC.confetti(220);
    // beat + confetti bursts
    beatStep = 0;
    const tick = () => {
      if (!discoOn) return;
      const s = beatStep++ % 8;
      if (s === 0 || s === 4) TC.sfx("kick"); if (s === 2 || s === 6) TC.sfx("snare"); TC.sfx("hat");
      if (s === 0) TC.confetti(70);
      if (s % 2 === 0) burst(fx, 20 + Math.random() * 60, 20 + Math.random() * 40, 6, 3, 10);
      discoT = setTimeout(tick, 250);
    };
    tick();
    await wait(4200);
  }

  TC.games.rescue = {
    startArt: ["rq-bell", "rq-heart", "rq-lunchbox", "rq-bandage", "star", "trophy", "rq-desk", "rq-tap"],
    mount(api) { api0 = api; build(api); },
    idle(api) {
      api0 = api; if (!root) return;
      resetScene();
      const sc = (api.G.scenes || [])[0]; let k = 0;
      const show = () => { const s = api.G.scenes[k++ % api.G.scenes.length]; setCard(s); card.classList.add("show"); bub.classList.add("show"); };
      if (sc) { show(); idleT = setInterval(() => { card.classList.remove("show"); void card.offsetWidth; show(); }, 5200); }
      siren.className = "siren calm"; buildMeter(5);
    },
    async play(api) {
      api0 = api; const G = api.G;
      const quit = () => { discoOn = false; clearTimeout(discoT); resetScene(); return null; };
      resetScene();
      const pool = G.scenes.slice(), pick = [];
      for (let k = Math.min(TC.rounds(5), pool.length); k > 0; k--) pick.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
      const n = pick.length;
      buildMeter(n);
      for (let i = 0; i < n; i++) {
        const sc = pick[i];
        api.progress(i, n);
        setCard(sc);
        await emergency();
        if (api.aborted) return quit();
        const r = await api.ask({ teacher: G.teacher, tzh: G.tzh, say: sc.say, zh: sc.zh, keys: sc.keys, word: sc.w, hideKey: true });
        if (api.aborted) return quit();
        if (!r.ok) { await TC.model(sc.say, sc.w); if (api.aborted) return quit(); await TC.waitAction(3500); if (api.aborted) return quit(); }
        TC.hideTalk();
        const praise = r.ok ? TC.praise() : null;
        await rescue(sc, i);
        if (api.aborted) return quit();
        if (praise) await praise;
        if (api.aborted) return quit();
        await wait(500);
        if (api.aborted) return quit();
        if (i < n - 1) resetOllie();
      }
      api.progress(n, n);
      await discoParty();
      if (api.aborted) return quit();
      await TC.clapBanner(3600);
      if (api.aborted) return quit();
      await wait(300);
      discoOn = false; clearTimeout(discoT);
      disco.classList.remove("on"); root.classList.remove("disc"); resetOllie("ollie"); await wait(500);
      if (api.aborted) return quit();
      resetScene();
      return { ok: true };
    }
  };
})();
