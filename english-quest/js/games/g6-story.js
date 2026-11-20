/* Gate 6 · Storybook Day — a giant glossy 3D pop-up storybook lies open on a wooden table under a warm lamp.
   Every page is a pop-up scene of layered paper cut-outs (drawn in code) that rise up with a springy animation.
   The child says the missing word of the page sentence; the picture comes alive, the page turns; at the end the book closes,
   all the characters jump out and wave ("Have a nice day!"), the whole room says "Goodbye!" and fireworks go off.
   Content is data: TC_CONTENT.gates[n].pages / .ending (key "story") — the English teacher's own story can replace it. */
(function () {
  "use strict";
  const { h } = TC;
  TC.games = TC.games || {};
  const PW = 330, PH = 240; // page space: one page is 66em x 48em  ->  330 x 240 drawing units

  /* =====================================================================
     ART — original paper cut-outs, drawn in code.  Each "layer" is one cut-out with its own 土城 pin;
     a scene (TC.ART["st-wake"] …) is the same layers stitched together on one page.
     ===================================================================== */
  const INK = "#3a2a3e", SKIN = "#ffd3a8", SKIN2 = "#f0a878";
  const f1 = (v) => +v.toFixed(1);
  const st = (d, col, w, ex = "") => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${ex}/>`;
  const star4 = (x, y, r, col = "#fff6a8") => { const k = f1(r * 0.22); return `<path d="M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r}Z" fill="${col}"/>`; };
  const LAY = {};
  /** register one cut-out: id, size, pin [x,y,r,tilt] (null = no pin), draw(c, …args) → svg markup in a w x h box */
  function def(id, w, hh, pin, draw) {
    LAY[id] = { w, h: hh, pin, draw };
    TC.ART[id] = (...a) => { const c = TC.ArtCtx(); return c.out(draw(c, ...a), `0 0 ${w} ${hh}`); };
    TC.SEAL[id] = pin || [-999, -999, 1, 0]; // no pin on backgrounds: park it outside the picture
  }
  const smileOpen = (x, y, w = 8) => `<path d="M${x - w} ${y} Q${x} ${y + w * 1.5} ${x + w} ${y}Z" fill="#7a1a2c" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M${x - w * 0.55} ${y + w * 0.75} Q${x} ${y + w * 0.4} ${x + w * 0.55} ${y + w * 0.75} Q${x} ${y + w * 1.15} ${x - w * 0.55} ${y + w * 0.75}Z" fill="#ff7a9a"/>`;

  /* ----- a chibi kid (120 x 160), one arm waving: the cast of the finale ----- */
  function kidFig(c, o) {
    const hair = o.hair, shirt = o.shirt, pants = o.pants;
    let s = c.shadow(60, 156, 34, 6);
    s += `<rect x="42" y="114" width="15" height="36" rx="7" fill="${c.g(pants)}"/><rect x="63" y="114" width="15" height="36" rx="7" fill="${c.g(pants)}"/>`;
    s += c.ell(49, 152, 12, 6, "#ff9a2e", 0, 0.4) + c.ell(71, 152, 12, 6, "#ff9a2e", 0, 0.4);
    s += st("M42 86 Q28 100 33 114", shirt, 13) + c.sphere(33, 117, 7.5, SKIN, 0.5);
    s += `<rect x="38" y="76" width="44" height="50" rx="18" fill="${c.g(shirt)}"/>`;
    s += st("M80 86 Q99 80 101 58", shirt, 13) + c.sphere(101, 52, 9, SKIN, 0.5) + st("M108 38 q6 4 8 10 M111 52 q7 0 10 4", "#ffc83d", 3.5);
    if (o.girl) s += c.sphere(27, 46, 11, hair, 0.4) + c.sphere(93, 46, 11, hair, 0.4) + `<circle cx="31" cy="35" r="5.5" fill="#ff5fa2"/><circle cx="89" cy="35" r="5.5" fill="#ff5fa2"/>`;
    s += c.sphere(60, 46, 30, SKIN, 0.6);
    s += c.path(o.girl ? "M29 48 Q27 14 60 14 Q93 14 91 48 Q86 28 68 28 Q54 36 40 28 Q32 34 29 48Z" : "M30 46 Q28 13 60 13 Q92 13 90 46 Q80 26 62 30 Q44 24 30 46Z", hair);
    s += c.eyes(60, 49, 11, 5.2) + c.blush(60, 59, 21) + smileOpen(60, 58, 7);
    return s;
  }
  def("st-boy", 120, 160, [60, 100, 10, 0], (c) => kidFig(c, { girl: false, hair: "#5a3518", shirt: "#4cc9ff", pants: "#3d4a8a" }));
  def("st-girl", 120, 160, [60, 100, 10, 0], (c) => kidFig(c, { girl: true, hair: "#3a2210", shirt: "#ff7ab0", pants: "#7a5cff" }));

  /* ----- the rooster (crowing), the alarm clock, Ollie stretching in bed ----- */
  def("st-rooster", 70, 80, [33, 55, 9, 0], (c) => {
    let s = c.shadow(35, 78, 22, 4);
    s += `<path d="M46 56 Q72 52 66 12 Q55 30 43 44Z" fill="${c.g("#3fbf5a")}"/><path d="M48 62 Q76 64 72 30 Q58 44 46 54Z" fill="${c.g("#3d8bff")}"/><path d="M46 66 Q70 78 71 46 Q58 56 44 60Z" fill="${c.g("#ff9a2e")}"/>`;
    s += st("M28 70 V77 M40 70 V77", "#ffb020", 3.6) + st("M21 77.5 H31 M33 77.5 H43", "#ffb020", 3.6);
    s += c.ell(34, 54, 22, 20, "#fff2da", 0, 0.5) + c.ell(42, 56, 11, 13, "#ffc27a", -12, 0.3);
    s += c.sphere(25, 27, 15, "#fff2da", 0.6);
    s += c.sphere(19, 12, 6, "#ff3d4f", 0.5) + c.sphere(27, 9, 7, "#ff3d4f", 0.5) + c.sphere(35, 13, 6, "#ff3d4f", 0.5);
    s += `<path d="M13 21 L0 13 L13 27Z" fill="#ffb020" stroke="#e08a00" stroke-width="1.2" stroke-linejoin="round"/><path d="M13 29 L2 34 L13 34Z" fill="#ffa010" stroke="#e08a00" stroke-width="1.2" stroke-linejoin="round"/><path d="M14 35 Q10 46 18 44 Q22 40 20 35Z" fill="#ff3d4f"/>`;
    s += `<ellipse cx="25" cy="22" rx="3" ry="3.8" fill="${INK}"/><circle cx="24" cy="20.5" r="1.2" fill="#fff"/>` + `<ellipse cx="31" cy="30" rx="5" ry="3" fill="#ff9ab0" opacity=".6"/>`;
    s += st("M3 4 q-2 4 0 8 M8 0 q-3 6 0 12", "#ff9a2e", 2.2);
    return s;
  });
  def("st-clock", 74, 80, [58, 62, 8, 0], (c) => {
    let s = c.shadow(37, 78, 28, 4);
    s += st("M37 14 V24", "#8a94b8", 4) + c.sphere(37, 8, 5, "#ffd23d", 0.5);
    s += c.sphere(18, 17, 12, "#ffd23d") + c.sphere(56, 17, 12, "#ffd23d") + `<path d="M12 12 Q18 4 24 10" stroke="#fff6a8" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M50 12 Q56 4 62 10" stroke="#fff6a8" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    s += c.ell(16, 73, 9, 5, "#26293a", 0, 0.3) + c.ell(58, 73, 9, 5, "#26293a", 0, 0.3);
    s += c.sphere(37, 46, 30, "#ff4b55") + `<circle cx="37" cy="46" r="23" fill="#fff8ec"/><circle cx="37" cy="46" r="23" fill="none" stroke="#ffb0b0" stroke-width="1.5"/>`;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; s += st(`M${f1(37 + Math.cos(a) * 18)} ${f1(46 + Math.sin(a) * 18)} L${f1(37 + Math.cos(a) * 21)} ${f1(46 + Math.sin(a) * 21)}`, INK, i % 3 === 0 ? 2.6 : 1.6); }
    s += st("M26 36 L34 40 M48 36 L40 40", INK, 3) + `<ellipse cx="30" cy="44" rx="3" ry="3.6" fill="${INK}"/><ellipse cx="44" cy="44" rx="3" ry="3.6" fill="${INK}"/><circle cx="29" cy="42.6" r="1.1" fill="#fff"/><circle cx="43" cy="42.6" r="1.1" fill="#fff"/>`;
    s += `<ellipse cx="37" cy="57" rx="7" ry="6" fill="#7a1a2c" stroke="${INK}" stroke-width="2"/><ellipse cx="37" cy="60" rx="4" ry="2.6" fill="#ff7a9a"/>`;
    s += c.hl(24, 28, 10, 5, -35, 0.7);
    return s;
  });
  def("st-wake-bed", 190, 134, [100, 108, 11, 0], (c) => {
    let s = c.shadow(95, 130, 92, 6);
    s += `<rect x="2" y="50" width="15" height="82" rx="7" fill="${c.g("#b97a44")}"/><rect x="173" y="84" width="15" height="48" rx="7" fill="${c.g("#b97a44")}"/>`;
    s += `<rect x="8" y="108" width="174" height="20" rx="8" fill="${c.g("#e9eefc")}"/>`;
    s += c.ell(46, 90, 33, 15, "#ffffff", -4, 0.5);
    s += st("M66 72 Q44 54 30 18", "#6f7fd8", 17) + st("M134 72 Q156 54 170 18", "#6f7fd8", 17) + st("M64 68 Q44 52 32 22", "#a9b6ff", 4.5) + st("M136 68 Q156 52 168 22", "#a9b6ff", 4.5);
    s += c.sphere(30, 16, 10, "#6f7fd8", 0.4) + c.sphere(170, 16, 10, "#6f7fd8", 0.4);
    s += st("M100 28 V8", "#c9d6ff", 4.5) + c.path("M100 -2l4.5 8 9 1-6.8 6 2.2 9-8.9-5-8.9 5 2.2-9-6.8-6 9-1z", "#ffc83d");
    s += c.path("M62 40 L70 14 L88 32Z", "#8fa2ff") + c.path("M138 40 L130 14 L112 32Z", "#8fa2ff");
    s += c.path("M100 26 C54 26 56 72 58 92 C60 118 80 120 100 120 C120 120 140 118 142 92 C144 72 146 26 100 26Z", "#8fa2ff");
    s += c.sphere(80, 52, 17, "#ffffff", 0.3) + c.sphere(120, 52, 17, "#ffffff", 0.3);
    s += st("M69 55 Q80 42 91 55", INK, 5) + st("M109 55 Q120 42 131 55", INK, 5);
    s += `<path d="M91 64 L109 64 L100 72Z" fill="#ffb020"/><ellipse cx="100" cy="82" rx="9" ry="9" fill="#7a1a2c" stroke="#e08a00" stroke-width="3"/><ellipse cx="100" cy="87" rx="5" ry="3.4" fill="#ff7a9a"/>`;
    s += `<ellipse cx="66" cy="70" rx="8" ry="4.5" fill="#ff7aa8" opacity=".55"/><ellipse cx="134" cy="70" rx="8" ry="4.5" fill="#ff7aa8" opacity=".55"/>`;
    s += c.hl(78, 40, 14, 22, 15, 0.45);
    s += c.path("M6 100 Q24 88 44 99 T84 99 T124 99 T164 99 T184 100 V126 H6Z", "#ffb347");
    s += st("M26 104 V124 M52 104 V124 M78 104 V124 M104 104 V124 M130 104 V124 M156 104 V124", "#fff", 6, 'opacity=".4"') + c.hl(60, 106, 40, 5, 0, 0.5);
    s += `<rect x="2" y="120" width="186" height="12" rx="6" fill="${c.g("#b97a44")}"/>`;
    return s;
  });
  def("st-wake-bg", 306, 216, null, (c) => {
    const W = 306, H = 216;
    let s = `<defs><clipPath id="wkr"><rect width="${W}" height="${H}" rx="14"/></clipPath><clipPath id="wkw"><rect x="34" y="20" width="142" height="96" rx="5"/></clipPath>` +
      `<linearGradient id="wks" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset=".5" stop-color="#ffe6a8"/><stop offset="1" stop-color="#ff9a6b"/></linearGradient>` +
      `<radialGradient id="wkg"><stop offset="0" stop-color="#fff6b0" stop-opacity=".95"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs><g clip-path="url(#wkr)">`;
    s += `<rect width="${W}" height="${H}" fill="${c.v("#ffe9cf", "#ffd2a2")}"/>`;
    for (let i = 0; i < 30; i++) s += `<circle cx="${(i * 53) % W}" cy="${(i * 37) % 160}" r="${3 + (i % 3)}" fill="#fff" opacity=".3"/>`;
    s += `<rect y="168" width="${W}" height="${H - 168}" fill="${c.v("#d9a066", "#a8703a")}"/>` + st("M0 184 H306 M0 200 H306", "#8a5a2c", 1.6, 'opacity=".4"') + st("M60 168 V184 M170 184 V200 M250 168 V184 M110 200 V216 M220 200 V216", "#8a5a2c", 1.6, 'opacity=".4"');
    s += `<g clip-path="url(#wkw)"><rect x="34" y="20" width="142" height="96" fill="url(#wks)"/><circle cx="105" cy="108" r="54" fill="url(#wkg)"/>`;
    for (let i = 0; i < 14; i++) { const a = -Math.PI + (i / 13) * Math.PI; s += `<path d="M105 108 L${f1(105 + Math.cos(a - 0.05) * 80)} ${f1(108 + Math.sin(a - 0.05) * 80)} L${f1(105 + Math.cos(a + 0.05) * 80)} ${f1(108 + Math.sin(a + 0.05) * 80)}Z" fill="#fff3b0" opacity=".5"/>`; }
    s += c.sphere(105, 108, 22, "#ffd23d") + `<ellipse cx="62" cy="42" rx="22" ry="7" fill="#fff" opacity=".85"/><ellipse cx="74" cy="36" rx="12" ry="6" fill="#fff" opacity=".85"/><ellipse cx="150" cy="56" rx="18" ry="6" fill="#ffd9d0" opacity=".9"/>`;
    s += c.path("M34 118 Q62 84 100 104 T176 96 V120 H34Z", "#7ad66a") + c.path("M34 120 Q96 100 176 114 V120Z", "#3fb45a") + `</g>`;
    s += `<rect x="34" y="20" width="142" height="96" rx="5" fill="none" stroke="${c.v("#a06b3a", "#6a4020")}" stroke-width="7"/><rect x="102" y="20" width="6" height="96" fill="#8a5a32"/><rect x="34" y="66" width="142" height="5" fill="#8a5a32"/>`;
    s += `<rect x="24" y="114" width="162" height="10" rx="4" fill="${c.v("#d9a066", "#8a5a32")}"/>`;
    s += `<rect x="10" y="8" width="190" height="7" rx="3.5" fill="${c.v("#ffe58a", "#d9a21a")}"/>`;
    s += `<path d="M12 14 H44 Q52 48 42 70 Q36 100 46 126 H12Z" fill="${c.v("#ffa6cb", "#e8588f")}"/><path d="M20 14 Q26 60 20 126 M30 14 Q36 60 32 126" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/>`;
    s += `<path d="M198 14 H166 Q158 48 168 70 Q174 100 164 126 H198Z" fill="${c.v("#9fd0ff", "#4f8fe8")}"/><path d="M190 14 Q184 60 190 126 M180 14 Q174 60 178 126" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/>`;
    s += `<rect x="212" y="114" width="86" height="14" rx="6" fill="${c.v("#e0a56a", "#b57a42")}"/><rect x="220" y="128" width="70" height="46" rx="6" fill="${c.v("#d49458", "#a06a34")}"/><rect x="230" y="136" width="50" height="14" rx="4" fill="#c4813f"/><circle cx="255" cy="143" r="3.5" fill="#ffd23d"/>`;
    s += `<rect x="230" y="14" width="56" height="30" rx="5" fill="#fff" stroke="#c98a4f" stroke-width="4"/><path d="M236 40 L248 26 L258 36 L266 30 L280 40Z" fill="#7ad66a"/><circle cx="272" cy="22" r="4.5" fill="#ffd23d"/>`;
    s += `</g>`;
    return s;
  });

  /* ----- wash: sink, hands, bathroom tiles ----- */
  def("st-sink", 176, 126, [88, 92, 11, 0], (c) => {
    let s = c.shadow(88, 122, 66, 5);
    s += `<path d="M62 84 L114 84 L124 122 L52 122Z" fill="${c.v("#f2f6ff", "#b9c6e2")}"/>`;
    s += `<path d="M6 62 Q10 108 88 110 Q166 108 170 62Z" fill="${c.g("#ffffff")}"/>`;
    s += `<ellipse cx="88" cy="62" rx="82" ry="25" fill="${c.g("#f4f8ff")}"/><ellipse cx="88" cy="63" rx="68" ry="18" fill="${c.v("#9fd8ff", "#4aa6e6")}"/><ellipse cx="88" cy="60" rx="52" ry="9" fill="#d8f1ff" opacity=".7"/>`;
    s += st("M88 52 V22 Q88 8 104 8 H112", "#c9d3ea", 11) + st("M88 52 V22 Q88 8 104 8 H112", "#f4f8ff", 5) + st("M112 8 V22", "#c9d3ea", 11) + st("M112 8 V20", "#f4f8ff", 5);
    s += c.sphere(66, 46, 8, "#3d8bff") + c.sphere(110, 46, 8, "#ff5a5a");
    s += `<path d="M110 24 Q112 40 112 56" stroke="#8fd3ff" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M109 26 Q110 40 110 54" stroke="#fff" stroke-width="2.5" fill="none" opacity=".8"/>`;
    s += c.hl(40, 84, 24, 6, -10, 0.8);
    return s;
  });
  def("st-hands", 120, 96, [16, 78, 8, -10], (c) => {
    let s = "";
    const hand = (cx, flip) => {
      const k = flip ? -1 : 1, X = (v) => cx + k * v;
      let t = `<g>`;
      t += `<rect x="${flip ? cx + 8 : cx - 46}" y="54" width="38" height="40" rx="14" fill="${c.g("#4cc9ff")}" transform="rotate(${flip ? -28 : 28} ${cx} 74)"/>`;
      t += c.ell(cx, 52, 21, 25, SKIN, flip ? 14 : -14, 0.5);
      [-12, -4, 4, 12].forEach((dx, i) => { t += c.ell(cx + dx * (flip ? -1 : 1), 28 - (i === 1 || i === 2 ? 3 : 0), 5.6, 12, SKIN, 0, 0.35); });
      t += c.ell(X(-19), 54, 6, 13, SKIN, flip ? 45 : -45, 0.35);
      return t + `</g>`;
    };
    s += hand(38, false) + hand(82, true);
    [[60, 38, 15], [44, 30, 11], [78, 28, 12], [58, 22, 10], [68, 44, 9], [38, 40, 8], [86, 44, 8]].forEach(([x, y, r]) => (s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.g("#ffffff")}" opacity=".95"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.22}" fill="#fff"/>`));
    s += `<circle cx="60" cy="14" r="6" fill="#bfe6ff" stroke="#fff" stroke-width="1.5" opacity=".9"/><circle cx="30" cy="12" r="4" fill="#bfe6ff" stroke="#fff" stroke-width="1.5" opacity=".9"/>`;
    return s;
  });
  def("st-wash-bg", 306, 216, null, (c) => {
    const W = 306, H = 216;
    let s = `<defs><clipPath id="wsr"><rect width="${W}" height="${H}" rx="14"/></clipPath></defs><g clip-path="url(#wsr)">`;
    s += `<rect width="${W}" height="${H}" fill="${c.v("#d7f4ff", "#a6e0f6")}"/>`;
    for (let x = 0; x <= W; x += 38) s += `<path d="M${x} 0 V${H}" stroke="#fff" stroke-width="2.2" opacity=".7"/>`;
    for (let y = 0; y <= H; y += 38) s += `<path d="M0 ${y} H${W}" stroke="#fff" stroke-width="2.2" opacity=".7"/>`;
    for (let i = 0; i < 14; i++) s += `<rect x="${(i * 67) % 260 + 4}" y="${(i * 41) % 150 + 4}" width="30" height="30" rx="5" fill="#fff" opacity=".18"/>`;
    s += `<rect y="176" width="${W}" height="40" fill="${c.v("#ffe9b8", "#f2c97a")}"/>`;
    for (let i = 0; i < 9; i++) s += `<rect x="${i * 38 + (i % 2 ? 0 : 0)}" y="${176 + (i % 2) * 20}" width="38" height="20" fill="#fff" opacity=".35"/>`;
    s += `<circle cx="155" cy="62" r="50" fill="${c.v("#f0bd3a", "#b9820f")}"/><circle cx="155" cy="62" r="44" fill="${c.v("#f1fbff", "#b9e6ff")}"/>`;
    s += `<path d="M122 90 L150 36 L162 36 L134 98Z" fill="#fff" opacity=".6"/><path d="M164 78 L178 52 L184 52 L170 82Z" fill="#fff" opacity=".45"/>` + star4(184, 36, 9, "#fff") + star4(128, 46, 5, "#fff");
    s += `<rect x="12" y="102" width="70" height="8" rx="4" fill="${c.v("#d9a066", "#8a5a32")}"/><rect x="22" y="76" width="22" height="26" rx="7" fill="${c.v("#ffb3d1", "#ff5fa2")}"/><path d="M28 76 L26 58 M34 76 L34 56 M40 76 L42 60" stroke="#3d8bff" stroke-width="3.4" stroke-linecap="round"/><rect x="52" y="92" width="22" height="10" rx="5" fill="#ffd23d"/>`;
    s += `<rect x="252" y="30" width="6" height="14" rx="3" fill="#c9d3ea"/><path d="M246 44 H296 V122 Q285 130 271 122 Q258 130 246 122Z" fill="${c.v("#ffffff", "#d9e4ff")}"/><rect x="246" y="62" width="50" height="9" fill="#4cc9ff"/><rect x="246" y="80" width="50" height="9" fill="#4cc9ff"/>`;
    return s + `</g>`;
  });

  /* ----- clean: table, crumbs, cloth, canteen wall ----- */
  def("st-table", 262, 124, [131, 63, 11, 0], (c) => {
    let s = c.shadow(131, 120, 120, 5);
    [[20, 76], [226, 76]].forEach(([x, y]) => (s += `<rect x="${x}" y="${y}" width="16" height="46" rx="6" fill="${c.g("#a8703a")}"/>`));
    s += `<path d="M22 10 H240 L258 54 H4Z" fill="${c.v("#f1c58a", "#d9a066")}"/>` + st("M32 20 H232 M24 32 H244 M14 44 H250", "#b57a42", 1.8, 'opacity=".5"');
    s += `<rect x="4" y="54" width="254" height="22" rx="7" fill="${c.g("#c98a4f")}"/>` + c.hl(100, 59, 90, 4, 0, 0.5);
    s += `<g><rect x="168" y="-0" width="26" height="30" rx="5" fill="${c.v("#fff", "#ffd0e4")}"/><path d="M168 10 H194 V22 H168Z" fill="#ff7aa8"/><circle cx="177" cy="16" r="2" fill="#fff"/><circle cx="186" cy="16" r="2" fill="#fff"/><path d="M174 -2 L181 -9 L188 -2Z" fill="#fff"/></g>`;
    s += `<ellipse cx="70" cy="22" rx="28" ry="7" fill="${c.v("#fff", "#cfd8ea")}"/><path d="M44 22 Q70 -8 96 22Z" fill="${c.g("#ffffff")}"/><circle cx="66" cy="12" r="2.3" fill="#ffb020"/><circle cx="76" cy="14" r="2.3" fill="#ffb020"/>`;
    return s;
  });
  def("st-crumbs", 190, 46, null, (c) => {
    let s = `<ellipse cx="136" cy="26" rx="30" ry="9" fill="${c.v("#ffb3cc", "#ff6f9c")}" opacity=".95"/><ellipse cx="128" cy="23" rx="14" ry="3" fill="#fff" opacity=".6"/>`;
    const cols = ["#e8b86a", "#c98a4f", "#ffe9b8", "#ff9a2e", "#fff", "#a8703a"];
    for (let i = 0; i < 44; i++) { const x = 8 + ((i * 47) % 170), y = 6 + ((i * 29) % 34), r = 1.8 + (i % 4) * 0.8; s += `<ellipse cx="${x}" cy="${y}" rx="${f1(r * 1.3)}" ry="${f1(r)}" fill="${cols[i % 6]}" transform="rotate(${(i * 37) % 180} ${x} ${y})"/>`; }
    return s;
  });
  def("st-cloth", 112, 96, [88, 20, 9, 0], (c) => {
    let s = "";
    s += `<g transform="rotate(-8 50 66)"><rect x="12" y="40" width="86" height="52" rx="10" fill="${c.g("#ffd84a")}"/>`;
    for (let x = 28; x < 98; x += 18) s += `<rect x="${x}" y="40" width="9" height="52" fill="#fff" opacity=".45"/>`;
    for (let y = 52; y < 92; y += 18) s += `<rect x="12" y="${y}" width="86" height="9" fill="#fff" opacity=".45"/>`;
    s += `<path d="M18 48 Q54 40 92 50" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
    s += `<rect x="70" y="-4" width="36" height="34" rx="12" fill="${c.g("#ff7ab0")}" transform="rotate(-18 88 14)"/>`;
    s += c.ell(66, 50, 17, 14, SKIN, -10, 0.5) + c.ell(58, 40, 5, 9, SKIN, 20, 0.3) + c.ell(66, 38, 5, 9, SKIN, 0, 0.3) + c.ell(75, 40, 5, 9, SKIN, -15, 0.3);
    return s;
  });
  def("st-clean-bg", 306, 216, null, (c) => {
    const W = 306, H = 216;
    let s = `<defs><clipPath id="clr"><rect width="${W}" height="${H}" rx="14"/></clipPath></defs><g clip-path="url(#clr)">`;
    s += `<rect width="${W}" height="${H}" fill="${c.v("#fff6cf", "#ffe29a")}"/>`;
    for (let i = 0; i < 26; i++) s += `<circle cx="${(i * 59) % W}" cy="${(i * 43) % 150}" r="${3 + (i % 3)}" fill="#fff" opacity=".35"/>`;
    s += `<rect y="116" width="${W}" height="56" fill="${c.v("#ffd27a", "#f2b24a")}"/><rect y="114" width="${W}" height="6" fill="#fff" opacity=".8"/>`;
    for (let y = 172, r = 0; y < H; y += 22, r++) for (let x = -(r % 2) * 22; x < W; x += 44) s += `<rect x="${x}" y="${y}" width="22" height="22" fill="${(x / 22 + r) % 2 ? "#f6e7c1" : "#e3cd98"}"/>`;
    s += `<path d="M0 12 Q76 34 153 20 T306 14" stroke="#c98a4f" stroke-width="2.5" fill="none"/>`;
    const cols = ["#ff5a5a", "#4cc9ff", "#ffd23d", "#35e07a", "#ff5fa2", "#9b6bff"];
    for (let i = 0; i < 10; i++) { const x = 14 + i * 30, y = 12 + Math.sin(i * 0.65) * 9 + (i > 4 ? -i * 0.5 : 0); s += `<path d="M${x} ${f1(y + 4)} L${x + 22} ${f1(y + 4)} L${x + 11} ${f1(y + 30)}Z" fill="${cols[i % 6]}"/>`; }
    s += `<rect x="214" y="48" width="76" height="64" rx="5" fill="${c.v("#8fd3ff", "#d8f1ff")}"/><ellipse cx="238" cy="70" rx="16" ry="6" fill="#fff"/><ellipse cx="270" cy="88" rx="14" ry="5" fill="#fff"/><rect x="214" y="48" width="76" height="64" rx="5" fill="none" stroke="#fff" stroke-width="6"/><rect x="249" y="48" width="5" height="64" fill="#fff"/><rect x="214" y="78" width="76" height="5" fill="#fff"/>`;
    s += `<rect x="22" y="44" width="66" height="62" rx="6" fill="#fff" stroke="#c98a4f" stroke-width="4"/><path d="M55 54 l7 15 17 2 -12 12 3 17 -15-8 -15 8 3-17 -12-12 17-2z" fill="${c.g("#ffc83d")}"/>`;
    return s + `</g>`;
  });

  /* ----- rest: night sky, sleepy moon, kid asleep on a cloud ----- */
  def("st-moon", 88, 96, [66, 72, 9, 0], (c) => {
    let s = `<circle cx="44" cy="52" r="46" fill="#fff3a8" opacity=".25"/><circle cx="44" cy="52" r="38" fill="#fff3a8" opacity=".3"/>`;
    s += c.sphere(44, 52, 32, "#fff0a0") + `<circle cx="28" cy="40" r="6" fill="#f2d86a" opacity=".6"/><circle cx="62" cy="62" r="5" fill="#f2d86a" opacity=".6"/><circle cx="56" cy="38" r="3.4" fill="#f2d86a" opacity=".6"/>`;
    s += st("M34 52 Q40 58 46 52", INK, 3.2) + st("M50 52 Q56 58 62 52", INK, 3.2) + st("M41 66 Q48 70 54 65", INK, 3) + `<ellipse cx="32" cy="62" rx="6" ry="3.6" fill="#ff9ab0" opacity=".6"/><ellipse cx="66" cy="60" rx="6" ry="3.6" fill="#ff9ab0" opacity=".6"/>`;
    s += `<path d="M18 36 Q44 -4 80 34 Q50 24 18 36Z" fill="${c.g("#4f6bff")}"/><path d="M24 33 Q48 14 74 32" stroke="#fff" stroke-width="3" stroke-dasharray="6 6" fill="none" opacity=".7"/><circle cx="80" cy="32" r="8" fill="#fff"/><circle cx="78" cy="30" r="3" fill="#dfe6ff"/>`;
    return s;
  });
  def("st-sleepkid", 200, 112, [138, 70, 11, -6], (c) => {
    let s = c.shadow(100, 108, 90, 5);
    s += c.sphere(30, 92, 22, "#ffffff", 0.4) + c.sphere(62, 84, 28, "#ffffff", 0.4) + c.sphere(104, 90, 30, "#ffffff", 0.4) + c.sphere(148, 88, 28, "#ffffff", 0.4) + c.sphere(176, 94, 20, "#ffffff", 0.4);
    s += `<rect x="20" y="84" width="170" height="20" rx="10" fill="${c.g("#f4f8ff")}"/>`;
    s += c.ell(40, 56, 34, 15, "#ffd6e8", -6, 0.5);
    s += c.sphere(44, 42, 26, SKIN, 0.6);
    s += c.path("M18 44 Q18 14 46 14 Q74 14 70 44 Q60 26 44 30 Q28 26 18 44Z", "#5a3518");
    s += st("M31 46 Q37 52 43 46", INK, 3.6) + st("M50 46 Q56 52 62 46", INK, 3.6) + `<ellipse cx="30" cy="55" rx="6" ry="3.6" fill="#ff7aa8" opacity=".55"/><ellipse cx="62" cy="55" rx="6" ry="3.6" fill="#ff7aa8" opacity=".55"/>` + st("M40 58 Q46 62 52 58", INK, 3);
    s += c.path("M62 62 Q74 52 100 58 T150 56 T190 64 V102 H60Z", "#7a5cff");
    s += `<g fill="#ffd23d">${[[84, 74, 5], [112, 82, 4], [138, 70, 5], [160, 86, 4], [180, 74, 4]].map(([x, y, r]) => star4(x, y, r * 1.5)).join("")}</g>`;
    s += c.hl(110, 62, 36, 5, -4, 0.5);
    return s;
  });
  def("st-rest-bg", 306, 216, null, (c) => {
    const W = 306, H = 216;
    let s = `<defs><clipPath id="rsr"><rect width="${W}" height="${H}" rx="14"/></clipPath><linearGradient id="rsg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1446"/><stop offset=".6" stop-color="#2b2a86"/><stop offset="1" stop-color="#7a4aa8"/></linearGradient></defs><g clip-path="url(#rsr)">`;
    s += `<rect width="${W}" height="${H}" fill="url(#rsg)"/>`;
    for (let i = 0; i < 46; i++) s += `<circle cx="${(i * 71) % W}" cy="${(i * 47) % 150 + 4}" r="${0.8 + (i % 4) * 0.5}" fill="#fff" opacity="${0.45 + (i % 3) * 0.2}"/>`;
    s += `<ellipse cx="60" cy="150" rx="60" ry="10" fill="#8a5ad0" opacity=".5"/><ellipse cx="240" cy="140" rx="70" ry="9" fill="#8a5ad0" opacity=".45"/>`;
    s += `<path d="M0 176 Q50 140 110 168 T220 160 T306 170 V216 H0Z" fill="#1d1a62"/><path d="M0 196 Q80 170 160 192 T306 186 V216 H0Z" fill="#2a2478"/>`;
    for (let i = 0; i < 6; i++) s += `<rect x="${30 + i * 46}" y="${178 + (i % 2) * 6}" width="9" height="${7 + (i % 3) * 3}" fill="#ffd23d" opacity=".8"/>`;
    return s + `</g>`;
  });

  /* ----- hurt: kid with a bandage on the knee, nurse's cross, worried teddy, sick-room wall ----- */
  def("st-hurtkid", 170, 176, [84, 98, 10, 0], (c, mood) => {
    const happy = mood === "happy";
    let s = c.shadow(85, 172, 62, 6);
    s += `<rect x="22" y="132" width="11" height="36" rx="4" fill="#5d9fd6"/><rect x="137" y="132" width="11" height="36" rx="4" fill="#5d9fd6"/><rect x="14" y="114" width="142" height="22" rx="10" fill="${c.g("#8fd3ff")}"/>`;
    s += `<rect x="56" y="124" width="22" height="42" rx="9" fill="${c.g(SKIN)}"/><rect x="92" y="124" width="22" height="42" rx="9" fill="${c.g(SKIN)}"/>`;
    s += c.ell(66, 168, 15, 7, "#ff5a5a", 0, 0.4) + c.ell(104, 168, 15, 7, "#ff5a5a", 0, 0.4);
    s += `<path d="M48 112 H122 L126 140 H44Z" fill="${c.g("#3d4a8a")}"/>`;
    s += c.sphere(67, 142, 12, SKIN, 0.5) + c.sphere(103, 142, 12, SKIN, 0.5);
    s += `<g transform="rotate(-32 67 142)"><rect x="50" y="134" width="34" height="16" rx="8" fill="${c.g("#ffe3b8")}" stroke="#e0a870" stroke-width="1.5"/><rect x="60" y="136" width="14" height="12" rx="3" fill="#fff5e4"/><circle cx="55" cy="139" r="1.2" fill="#e0a870"/><circle cx="55" cy="145" r="1.2" fill="#e0a870"/><circle cx="79" cy="139" r="1.2" fill="#e0a870"/><circle cx="79" cy="145" r="1.2" fill="#e0a870"/></g>`;
    s += `<rect x="52" y="70" width="66" height="54" rx="20" fill="${c.g("#ff9a2e")}"/>`;
    s += st("M56 82 Q40 96 54 120", "#ff9a2e", 14) + c.sphere(56, 122, 8.5, SKIN, 0.5);
    s += st("M114 82 Q130 92 120 108 Q116 118 110 124", "#ff9a2e", 14) + c.sphere(70, 126, 0.1, SKIN);
    s += c.sphere(110, 128, 8.5, SKIN, 0.5);
    s += c.sphere(85, 40, 32, SKIN, 0.6);
    s += c.path("M52 40 Q50 6 85 6 Q120 6 118 40 Q108 20 86 24 Q64 20 52 40Z", "#3a2210") + c.sphere(60, 16, 9, "#3a2210", 0.3);
    if (happy) {
      s += st("M66 44 Q73 36 80 44", INK, 3.6) + st("M90 44 Q97 36 104 44", INK, 3.6) + `<ellipse cx="62" cy="54" rx="7" ry="4" fill="#ff7aa8" opacity=".6"/><ellipse cx="108" cy="54" rx="7" ry="4" fill="#ff7aa8" opacity=".6"/>` + smileOpen(85, 52, 8);
    } else {
      s += st("M62 40 L79 33", "#3a2210", 3.4) + st("M108 40 L91 33", "#3a2210", 3.4);
      s += c.eyes(85, 46, 12, 5.6) + `<ellipse cx="68" cy="57" rx="7" ry="4" fill="#ff7aa8" opacity=".55"/><ellipse cx="102" cy="57" rx="7" ry="4" fill="#ff7aa8" opacity=".55"/>`;
      s += st("M77 62 Q81 58 85 62 Q89 66 93 62", INK, 3.2);
      s += `<path d="M65 54 Q60 64 65 68 Q70 64 65 54Z" fill="#7fd0ff" stroke="#3d9be0" stroke-width="1.4"/><circle cx="64" cy="64" r="1.4" fill="#fff"/>`;
    }
    return s;
  });
  def("st-teddy", 92, 100, [46, 80, 9, 0], (c) => {
    let s = c.shadow(46, 97, 34, 5);
    const B = "#b97a44";
    s += c.ell(22, 90, 15, 9, B, 0, 0.3) + c.ell(70, 90, 15, 9, B, 0, 0.3);
    s += c.ell(46, 72, 28, 26, B, 0, 0.5) + c.ell(46, 78, 17, 16, "#f4d9b0", 0, 0.3);
    s += c.sphere(20, 66, 10, B, 0.4) + c.sphere(72, 66, 10, B, 0.4);
    s += c.sphere(22, 22, 14, B, 0.4) + c.sphere(70, 22, 14, B, 0.4) + `<circle cx="22" cy="22" r="7" fill="#f4d9b0"/><circle cx="70" cy="22" r="7" fill="#f4d9b0"/>`;
    s += c.sphere(46, 38, 27, B, 0.6) + c.ell(46, 48, 14, 10, "#f4d9b0", 0, 0.4);
    s += `<ellipse cx="46" cy="44" rx="5" ry="3.6" fill="#3a2530"/>` + st("M46 47 V51 M39 53 Q46 57 53 53", "#3a2530", 2.6);
    s += st("M27 33 L41 27", "#3a2530", 3) + st("M65 33 L51 27", "#3a2530", 3) + c.eyes(46, 36, 13, 4.6) + `<path d="M26 40 Q24 48 27 52" stroke="#7fd0ff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M34 62 L46 68 L58 62 L58 72 L46 68 L34 72Z" fill="#ff5a7a"/>`;
    s += `<g transform="rotate(-24 70 20)"><rect x="60" y="14" width="22" height="10" rx="5" fill="#ffe3b8" stroke="#e0a870" stroke-width="1.2"/><rect x="66" y="15.5" width="10" height="7" rx="2" fill="#fff5e4"/></g>`;
    return s;
  });
  def("st-cross", 94, 100, [72, 78, 9, 8], (c) => {
    let s = st("M30 6 L22 24 M64 6 L72 24", "#c9d3ea", 3.2);
    s += `<rect x="8" y="20" width="78" height="76" rx="18" fill="${c.v("#ffffff", "#c9d9f2")}" stroke="#9fb4d8" stroke-width="3"/>`;
    s += `<path d="M38 30 H56 V50 H76 V68 H56 V88 H38 V68 H18 V50 H38Z" fill="${c.g("#ff3d4f")}" stroke="#b81c2c" stroke-width="2" stroke-linejoin="round"/>`;
    s += c.hl(30, 32, 16, 6, -20, 0.8) + star4(12, 24, 8, "#fff") + star4(82, 94, 5, "#fff");
    return s;
  });
  def("st-hurt-bg", 306, 216, null, (c) => {
    const W = 306, H = 216;
    let s = `<defs><clipPath id="hur"><rect width="${W}" height="${H}" rx="14"/></clipPath></defs><g clip-path="url(#hur)">`;
    s += `<rect width="${W}" height="${H}" fill="${c.v("#dcf8ec", "#b9ecd8")}"/>`;
    for (let i = 0; i < 24; i++) s += `<circle cx="${(i * 61) % W}" cy="${(i * 43) % 130}" r="${3 + (i % 3)}" fill="#fff" opacity=".35"/>`;
    s += `<rect y="120" width="${W}" height="56" fill="#f6fffb"/><rect y="118" width="${W}" height="5" fill="#8fd7bd"/>`;
    for (let y = 176, r = 0; y < H; y += 20, r++) for (let x = -(r % 2) * 20; x < W; x += 40) s += `<rect x="${x}" y="${y}" width="20" height="20" fill="${(x / 20 + r) % 2 ? "#eef6f2" : "#cfe3da"}"/>`;
    s += `<rect x="18" y="20" width="62" height="58" rx="5" fill="${c.v("#8fd3ff", "#d8f1ff")}"/><ellipse cx="38" cy="38" rx="14" ry="5" fill="#fff"/><rect x="18" y="20" width="62" height="58" rx="5" fill="none" stroke="#fff" stroke-width="6"/><rect x="46" y="20" width="5" height="58" fill="#fff"/><rect x="18" y="46" width="62" height="5" fill="#fff"/>`;
    s += `<rect x="232" y="108" width="6" height="8" fill="#8fd7bd"/>`;
    s += `<rect x="108" y="22" width="98" height="9" rx="4.5" fill="${c.v("#d9a066", "#8a5a32")}"/>`;
    [["#ff7aa8", 116], ["#4cc9ff", 134], ["#ffd23d", 152], ["#35e07a", 170], ["#9b6bff", 188]].forEach(([col, x], i) => (s += `<rect x="${x}" y="${4 + (i % 2) * 2}" width="14" height="18" rx="4" fill="${c.g(col)}"/><rect x="${x + 3}" y="${i % 2 ? 0 : -2}" width="8" height="6" rx="2" fill="#fff"/>`));
    return s + `</g>`;
  });

  /* ----- bye: sunset, setting sun, hills + school, school bus full of waving kids, a big waving hand ----- */
  def("st-sun", 110, 110, null, (c) => {
    let s = `<circle cx="55" cy="55" r="52" fill="#ffd27a" opacity=".3"/><circle cx="55" cy="55" r="42" fill="#ffd27a" opacity=".35"/>`;
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; s += `<path d="M${f1(55 + Math.cos(a - 0.08) * 38)} ${f1(55 + Math.sin(a - 0.08) * 38)} L${f1(55 + Math.cos(a) * 54)} ${f1(55 + Math.sin(a) * 54)} L${f1(55 + Math.cos(a + 0.08) * 38)} ${f1(55 + Math.sin(a + 0.08) * 38)}Z" fill="#fff0a0" opacity=".85"/>`; }
    return s + c.sphere(55, 55, 32, "#ffb02e") + `<ellipse cx="55" cy="58" rx="26" ry="20" fill="#ff8a2a" opacity=".3"/>`;
  });
  def("st-bye-bg", 306, 216, null, (c) => {
    const W = 306, H = 216;
    let s = `<defs><clipPath id="byr"><rect width="${W}" height="${H}" rx="14"/></clipPath><linearGradient id="byg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b3a9c"/><stop offset=".35" stop-color="#ff7a9a"/><stop offset=".7" stop-color="#ffb25a"/><stop offset="1" stop-color="#ffe08a"/></linearGradient></defs><g clip-path="url(#byr)">`;
    s += `<rect width="${W}" height="${H}" fill="url(#byg)"/>`;
    [[40, 40, 30], [90, 66, 24], [220, 34, 28], [260, 76, 22], [30, 96, 20]].forEach(([x, y, w]) => (s += `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.28}" fill="#ffd0e0" opacity=".7"/><ellipse cx="${x + w * 0.3}" cy="${y - w * 0.16}" rx="${w * 0.5}" ry="${w * 0.22}" fill="#ffd0e0" opacity=".7"/>`));
    s += st("M60 22 q4 -5 8 0 q4 -5 8 0 M84 34 q3 -4 6 0 q3 -4 6 0 M232 54 q4 -5 8 0 q4 -5 8 0", INK, 2, 'opacity=".7"');
    return s + `</g>`;
  });
  def("st-ground", 306, 92, [226, 36, 11, 0], (c) => {
    const W = 306;
    let s = `<defs><clipPath id="gdr"><rect width="${W}" height="92" rx="0"/></clipPath></defs>`;
    s += `<path d="M0 30 Q50 6 110 24 T230 16 T306 26 V92 H0Z" fill="${c.v("#4fae6a", "#256b3e")}"/>`;
    s += `<rect x="186" y="30" width="98" height="38" rx="4" fill="${c.v("#fff4d6", "#e6cf9e")}"/><path d="M178 32 L235 6 L292 32Z" fill="${c.v("#ff7a5a", "#c8402a")}"/><rect x="224" y="46" width="22" height="22" fill="#8a5a32"/>`;
    for (let i = 0; i < 4; i++) s += `<rect x="${194 + (i % 2) * 70 + (i > 1 ? 0 : 0)}" y="${36 + (i > 1 ? 0 : 0)}" width="12" height="12" rx="2" fill="#ffe58a"/>`;
    s += st("M284 32 V-4", "#c9d3ea", 3) + `<path d="M285 -3 L300 2 L285 7Z" fill="#ff5a5a"/>`;
    s += `<rect y="62" width="${W}" height="30" fill="${c.v("#59506a", "#3a3448")}"/><path d="M0 77 H${W}" stroke="#fff3b0" stroke-width="3" stroke-dasharray="16 12"/>`;
    return s;
  });
  def("st-bus", 232, 104, [152, 71, 9, 0], (c) => {
    let s = c.shadow(116, 98, 108, 5);
    s += `<rect x="6" y="14" width="214" height="70" rx="20" fill="${c.g("#ffcf33")}"/>` + c.hl(86, 24, 80, 6, 0, 0.7);
    s += `<rect x="6" y="56" width="214" height="9" fill="#ff8a1f"/><rect x="6" y="64" width="214" height="5" fill="#26293a" opacity=".55"/>`;
    const kids = [["#5a3518", "#ff7ab0"], ["#3a2210", "#4cc9ff"], ["#8a5a2c", "#35e07a"], ["#2a1a10", "#ffd23d"]];
    kids.forEach(([hc, sc], i) => {
      const x = 16 + i * 40;
      s += `<rect x="${x}" y="22" width="32" height="32" rx="7" fill="${c.v("#cdeeff", "#6ab8f0")}"/>`;
      s += `<circle cx="${x + 16}" cy="42" r="9" fill="${SKIN}"/><path d="M${x + 7} 40 Q${x + 8} 31 ${x + 16} 32 Q${x + 24} 31 ${x + 25} 40 Q${x + 18} 35 ${x + 7} 40Z" fill="${hc}"/><circle cx="${x + 13}" cy="43" r="1.4" fill="${INK}"/><circle cx="${x + 19}" cy="43" r="1.4" fill="${INK}"/><path d="M${x + 13} 47 Q${x + 16} 50 ${x + 19} 47" stroke="${INK}" stroke-width="1.3" fill="none"/>`;
      s += `<rect x="${x + 22}" y="28" width="5" height="12" rx="2.5" fill="${SKIN}" transform="rotate(${i % 2 ? 18 : -14} ${x + 24} 40)"/><rect x="${x + 2}" y="48" width="28" height="6" fill="${sc}" opacity=".9"/>`;
    });
    s += `<path d="M178 22 H204 Q214 22 216 34 V54 H178Z" fill="${c.v("#cdeeff", "#6ab8f0")}"/><rect x="184" y="68" width="22" height="16" fill="#26293a" opacity=".25"/>`;
    s += `<text x="92" y="78.5" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="9" fill="${INK}" letter-spacing="1.6">SCHOOL BUS</text>`;
    s += `<rect x="216" y="62" width="12" height="9" rx="3" fill="${c.g("#9aa4c0")}"/><circle cx="222" cy="44" r="5" fill="#fff6a8"/><rect x="0" y="62" width="10" height="8" rx="3" fill="${c.g("#9aa4c0")}"/>`;
    s += `<rect x="28" y="8" width="16" height="9" rx="3" fill="#ff5a5a"/><circle cx="52" cy="10" r="3" fill="#ffc83d"/>`;
    s += c.wheel(54, 84, 17) + c.wheel(172, 84, 17);
    return s;
  });
  def("st-hand", 78, 124, [40, 112, 11, 0], (c) => {
    let s = `<path d="M6 124 L16 92 H62 L72 124Z" fill="${c.g("#ff5a5a")}"/>`;
    s += `<rect x="10" y="82" width="58" height="14" rx="7" fill="${c.g("#fff")}"/>`;
    s += c.ell(39, 66, 24, 24, SKIN, 0, 0.5);
    [[14, 44, -24], [26, 32, -8], [40, 28, 4], [53, 33, 18]].forEach(([x, y, r]) => (s += c.ell(x + 1, y, 7, 17, SKIN, r, 0.35)));
    s += c.ell(66, 66, 7, 16, SKIN, 62, 0.35);
    s += st("M20 32 q-4 -6 -2 -12 M34 20 q-1 -7 2 -12 M50 24 q2 -7 6 -9", "#ffc83d", 3);
    return s;
  });

  /* ----- scenes: the same layers stitched on one page = the page pictures st-wake … st-bye ----- */
  // l = {id, x, y (page space), z (pop-up height in em), d (rise delay s), flat (the printed picture, not a pop-up), cls, args}
  const SCENES = {
    "st-wake": [{ id: "st-wake-bg", x: 12, y: 12, flat: 1 }, { id: "st-rooster", x: 118, y: 50, z: 5, d: 0.15, cls: "crow" }, { id: "st-clock", x: 236, y: 50, z: 4, d: 0.3, cls: "ring" }, { id: "st-wake-bed", x: 26, y: 120, s: 0.82, z: 3, d: 0, cls: "bedl" }],
    "st-wash": [{ id: "st-wash-bg", x: 12, y: 12, flat: 1 }, { id: "st-sink", x: 77, y: 96, z: 3, d: 0 }, { id: "st-hands", x: 105, y: 108, z: 6, d: 0.25, cls: "scrub" }],
    "st-clean": [{ id: "st-clean-bg", x: 12, y: 12, flat: 1 }, { id: "st-table", x: 34, y: 104, z: 3, d: 0 }, { id: "st-crumbs", x: 76, y: 114, z: 3.4, d: 0.2, cls: "crumbs" }, { id: "st-cloth", x: 180, y: 70, z: 6, d: 0.35, cls: "cloth" }],
    "st-rest": [{ id: "st-rest-bg", x: 12, y: 12, flat: 1 }, { id: "st-moon", x: 224, y: 20, z: 4, d: 0.2, cls: "moon" }, { id: "st-sleepkid", x: 24, y: 94, s: 1.2, z: 4, d: 0, cls: "snooze" }],
    "st-hurt": [{ id: "st-hurt-bg", x: 12, y: 12, flat: 1 }, { id: "st-cross", x: 226, y: 22, z: 4, d: 0.25, cls: "cross" }, { id: "st-teddy", x: 14, y: 134, z: 5, d: 0.35, cls: "teddy" }, { id: "st-hurtkid", x: 70, y: 56, z: 3, d: 0, cls: "hkid" }],
    "st-bye": [{ id: "st-bye-bg", x: 12, y: 12, flat: 1 }, { id: "st-sun", x: 120, y: 64, z: 2, d: 0.1, cls: "sunl" }, { id: "st-ground", x: 12, y: 130, z: 3, d: 0 }, { id: "st-bus", x: 12, y: 140, s: 0.8, z: 5, d: 0.3, cls: "bus" }, { id: "st-hand", x: 250, y: 112, s: 0.85, z: 6, d: 0.45, cls: "hand" }]
  };
  Object.keys(SCENES).forEach((name) => {
    TC.ART[name] = () => {
      const c = TC.ArtCtx(); let s = "";
      SCENES[name].forEach((l) => { const D = LAY[l.id]; s += `<g transform="translate(${l.x} ${l.y}) scale(${l.s || 1})">${D.draw(c, ...(l.args || []))}${D.pin ? TC.seal(D.pin[0], D.pin[1], D.pin[2], D.pin[3] || 0) : ""}</g>`; });
      return c.out(s, `0 0 ${PW} ${PH}`);
    };
    TC.SEAL[name] = [-999, -999, 1, 0]; // the layers already carry their pins
  });

  /* =====================================================================
     STYLE
     ===================================================================== */
  const css = `
  .g6{position:absolute;inset:0;overflow:hidden;font-size:min(1vh,.5625vw);color:#4a2f1a;
    background:
      radial-gradient(55% 60% at 60% 36%,rgba(255,214,140,.62),rgba(255,170,80,.14) 62%,transparent 78%),
      radial-gradient(120% 100% at 56% 34%,transparent 52%,rgba(18,6,0,.7) 100%),
      repeating-linear-gradient(180deg,rgba(0,0,0,.34) 0 .22em,transparent .22em 15em),
      repeating-linear-gradient(180deg,rgba(255,235,200,.05) 0 .9em,rgba(0,0,0,.05) .9em 1.6em,transparent 1.6em 3.3em),
      linear-gradient(180deg,#9a6438,#7a4a28 55%,#5a361c)}
  .g6 *{box-sizing:border-box}
  .g6 .lamp{position:absolute;right:-6em;top:-14em;width:90em;height:96em;pointer-events:none;
    background:linear-gradient(200deg,rgba(255,226,160,.38),rgba(255,226,160,0) 70%);clip-path:polygon(40% 0,100% 0,100% 100%,0 100%);animation:g6lamp 5s ease-in-out infinite alternate}
  @keyframes g6lamp{from{opacity:.75}to{opacity:1}}
  .g6 .mote{position:absolute;width:.9em;height:.9em;border-radius:50%;background:#ffe9b0;opacity:.0;pointer-events:none;animation:g6mote 9s linear infinite}
  @keyframes g6mote{0%{opacity:0;transform:translate(0,0)}15%{opacity:.7}85%{opacity:.5}100%{opacity:0;transform:translate(-8em,14em)}}
  .g6 .prop{position:absolute;pointer-events:none;filter:drop-shadow(0 1em .8em rgba(0,0,0,.45))}
    .g6-world{position:absolute;inset:0;perspective:170em;perspective-origin:50% 30%}
  .g6-book{position:absolute;left:calc(50% - 57em);top:9em;width:124em;height:45em;transform-style:preserve-3d;transform-origin:50% 100%;
    transform:rotateX(9deg);translate:0 0;transition:translate 1.3s cubic-bezier(.45,.05,.3,1);animation:g6sway 7s ease-in-out infinite}
  .g6-book.closed{translate:-31em 0}
  @keyframes g6sway{0%,100%{transform:rotateX(9deg) rotateY(-1.6deg)}50%{transform:rotateX(10.5deg) rotateY(1.6deg)}}
  .g6-bd{position:absolute;top:-1.6em;height:48.6em;background:linear-gradient(160deg,#d9452e,#a8202a 60%,#7a1520);box-shadow:0 2em 0 #5d0f18,0 4em 4em rgba(0,0,0,.65);transform:translateZ(-.8em)}
  .g6-bl{left:-2em;width:64.2em;border-radius:3em .6em .6em 3em;transition:opacity .9s}
  .g6-br{left:62em;width:64.2em;border-radius:.6em 3em 3em .6em}
  .g6-book.closed .g6-bl{opacity:0}
  .g6-pg{position:absolute;top:0;width:62em;height:45em;transform-style:preserve-3d;background:#fff8e6}
  .g6-lp{left:0;border-radius:2.2em 0 0 2.2em;background:linear-gradient(90deg,#fffaf0,#fdf1d6 86%,#e0cfa8);box-shadow:0 .5em 0 #f0e3c4,0 1em 0 #fff8e8,0 1.5em 0 #eadcbc,0 2em 0 #d9c8a0;transition:opacity .9s}
  .g6-rp{left:62em;border-radius:0 2.2em 2.2em 0;background:linear-gradient(270deg,#fffaf0,#fdf1d6 86%,#e0cfa8);box-shadow:0 .5em 0 #f0e3c4,0 1em 0 #fff8e8,0 1.5em 0 #eadcbc,0 2em 0 #d9c8a0}
  .g6-book.closed .g6-lp{opacity:0}
  .g6-gut{position:absolute;left:58em;top:0;width:8em;height:45em;transform:translateZ(.3em);pointer-events:none;background:linear-gradient(90deg,transparent,rgba(90,50,10,.28) 50%,transparent)}
  .g6-book.closed .g6-gut{opacity:0}
  /* text page */
  .tcard{position:absolute;inset:0;padding:11em 6em 5em 7em;display:flex;flex-direction:column;justify-content:center;gap:1.6em;transform-style:flat}
  .trk{position:absolute;left:7em;top:6em;display:flex;gap:5em}
  .trk i{display:block;width:3.4em;height:3.4em;border-radius:50%;background:#efe0bc;box-shadow:inset 0 .3em .4em rgba(120,80,20,.35)}
  .trk i.d{background:radial-gradient(circle at 35% 30%,#fff3a0,#ffc83d 60%,#d9961a);box-shadow:0 .2em .3em rgba(120,80,20,.4)}
  .trk i.c{background:#fff;box-shadow:0 0 0 .5em #ffc83d}
  .sent{font-size:6.3em;font-weight:700;line-height:1.2;color:#4a2f1a;text-wrap:balance}
  .sent .wd{display:inline-block;margin-right:.22em}
  .kw{display:inline-block;border-radius:.3em;padding:0 .15em;transition:color .3s,background .3s}
  .kw.blank{color:transparent;background:repeating-linear-gradient(45deg,rgba(255,200,61,.55) 0 .3em,rgba(255,224,130,.55) .3em .6em);box-shadow:inset 0 0 0 .1em #e8a21a;animation:g6blank 1.2s ease-in-out infinite}
  @keyframes g6blank{50%{background-color:#ffe58a;transform:scale(1.04)}}
  .kw.done{color:#1f9a4a;background:rgba(53,224,122,.2);animation:g6done .7s cubic-bezier(.2,1.7,.4,1)}
  @keyframes g6done{from{transform:scale(.5)}}
  .szh{font-size:3.5em;color:#8a5a30;font-weight:600}
  .stag{position:absolute;right:2.6em;bottom:1.3em;font-size:2.3em;color:#b8946a;font-weight:600}
  .pgn b{font-size:4em}
  .pgn{position:absolute;left:7em;bottom:2.6em;width:6em;height:6em;border-radius:50%;display:grid;place-items:center;font-weight:700;color:#fff;background:radial-gradient(circle at 35% 30%,#ff9a8a,#e8453c 60%,#a8202a);box-shadow:0 .4em 0 #7a1520,0 1em 1em rgba(0,0,0,.3)}
  .tcard .ol{position:absolute;right:4em;top:8em;width:11em;height:12em;opacity:.0}
  .tcard .doodle{position:absolute;right:5em;bottom:7em;width:7em;height:7em;opacity:.55}
  /* the ribbon bookmark */
  .g6-rib{position:absolute;top:.4em;left:6.7em;width:4em;height:9.6em;transform:translateZ(3em);transition:left .9s cubic-bezier(.3,1.5,.5,1),opacity .5s;filter:drop-shadow(.3em .5em .3em rgba(0,0,0,.4))}
  .g6-rib i{display:block;width:100%;height:100%;background:linear-gradient(90deg,#ff5a6a,#d8283c);clip-path:polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)}
  .g6-book.closed .g6-rib{opacity:0}
  /* scene on the right page */
  .scene{position:absolute;inset:0;transform-style:preserve-3d}
  .pw{position:absolute;transform-style:preserve-3d}
  .pw .pu{position:absolute;inset:0;transform-origin:50% 100%;transform:translateZ(0) rotateX(86deg);opacity:0}
  .pw.flat .pu{opacity:1;transform:none}
  .pw .pu img{display:block;width:100%;height:100%;pointer-events:none;user-select:none}
  .pw:not(.flat) .pu img{filter:drop-shadow(.32em 0 0 #fff) drop-shadow(-.32em 0 0 #fff) drop-shadow(0 .32em 0 #fff) drop-shadow(0 -.32em 0 #fff) drop-shadow(0 .9em .6em rgba(60,30,0,.4))}
  .pw.flat .pu img{border-radius:2em}
  .pw .psh{position:absolute;left:4%;right:4%;bottom:-2%;height:9%;border-radius:50%;background:radial-gradient(rgba(50,25,0,.55),transparent 70%);opacity:0;transform:scale(.3)}
  .scene.up .pw:not(.flat) .pu{animation:g6rise .95s cubic-bezier(.25,1.5,.45,1) var(--d,0s) both}
  .scene.up .pw .psh{animation:g6sh .95s ease-out var(--d,0s) both}
  .scene.set .pw:not(.flat) .pu{opacity:1;transform:translateZ(var(--z)) rotateX(0deg)}
  .scene.set .pw .psh{opacity:1;transform:none}
  @keyframes g6rise{0%{transform:translateZ(0) rotateX(86deg);opacity:0}22%{opacity:1}100%{transform:translateZ(var(--z)) rotateX(0deg);opacity:1}}
  @keyframes g6sh{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}
  .ex{position:absolute;pointer-events:none;opacity:0;transition:opacity .5s}
  .scene.up .ex.idle,.scene.set .ex.idle{opacity:1}
  .scene.alive .ex.live{opacity:1}
  /* idle life: things that move before the child answers */
  .scene.set .ring .pu img,.scene.up .ring .pu img{animation:g6ring .16s linear infinite alternate 1.1s}
  @keyframes g6ring{from{transform:rotate(-5deg) translateX(-.3em)}to{transform:rotate(5deg) translateX(.3em)}}
  .scene.alive .ring .pu img{animation:none}
  .rings{left:62%;top:3%;width:38%;height:24%}
  .rings svg{width:100%;height:100%;overflow:visible}
  .rings path{stroke:#ff4b55;stroke-width:4;fill:none;stroke-linecap:round;animation:g6rg .3s ease-in-out infinite alternate}
  @keyframes g6rg{from{opacity:.3}to{opacity:1}}
  .scene.alive .rings{opacity:0!important}
  .scene.set .crow .pu img,.scene.up .crow .pu img{transform-origin:50% 100%;animation:g6crow 1.4s ease-in-out infinite 1.1s}
  @keyframes g6crow{0%,100%{transform:rotate(-3deg) scale(1,1)}30%{transform:rotate(4deg) scale(1.03,.97)}60%{transform:rotate(-1deg) scale(.98,1.03)}}
  .sunburst{left:16%;top:6%;width:44%;height:61%;transform:scale(0);transition:transform .9s cubic-bezier(.2,1.7,.4,1),opacity .4s;opacity:0;transform-origin:50% 78%}
  .sunburst .rays{position:absolute;inset:-35%;border-radius:50%;background:repeating-conic-gradient(rgba(255,238,150,.8) 0 7deg,transparent 7deg 18deg);-webkit-mask:radial-gradient(circle,#000 22%,transparent 68%);mask:radial-gradient(circle,#000 22%,transparent 68%);animation:spin 9s linear infinite}
  .sunburst .disc{position:absolute;left:25%;top:30%;width:50%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fffbd0,#ffd23d 55%,#ff9a1f);box-shadow:0 0 6em 2em rgba(255,214,90,.7)}
  .scene.alive .sunburst{opacity:1;transform:scale(1)}
  .note{left:0;top:0;font-size:5em;font-weight:700;color:#ff6a3a;text-shadow:0 .1em 0 #fff,0 0 .6em #fff;opacity:0}
  .scene.alive .note{animation:g6note 2.4s ease-out infinite}
  @keyframes g6note{0%{opacity:0;transform:translateY(0) rotate(-10deg)}20%{opacity:1}100%{opacity:0;transform:translateY(-9em) rotate(14deg)}}
  .scene.alive .bedl .pu img{animation:g6hop .55s cubic-bezier(.3,1.6,.5,1) 3}
  @keyframes g6hop{0%,100%{transform:none}40%{transform:translateY(-6%) scale(1.03,.98)}}
  /* wash */
  .bub{left:0;top:0;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff,rgba(255,255,255,.75) 18%,rgba(150,215,255,.4) 55%,rgba(255,255,255,.5));box-shadow:inset 0 0 .5em rgba(255,255,255,.9),0 0 .5em rgba(120,200,255,.6);animation:g6bub 2.6s ease-in-out infinite alternate}
  @keyframes g6bub{from{transform:translate(0,0)}to{transform:translate(.8em,-2.2em)}}
  .bub.pop{animation:g6bpop .35s ease-out forwards}
  @keyframes g6bpop{0%{transform:scale(1);opacity:1}45%{transform:scale(1.35);opacity:1}100%{transform:scale(1.7);opacity:0}}
  .scene.set .scrub .pu img,.scene.up .scrub .pu img{animation:g6scrub .38s ease-in-out infinite alternate 1.2s}
  @keyframes g6scrub{from{transform:translateX(-1.2%) rotate(-2.5deg)}to{transform:translateX(1.2%) rotate(2.5deg)}}
  .scene.alive .scrub .pu img{animation:g6scrub .16s ease-in-out 8 alternate}
  .glint{opacity:0}
  .scene.alive .glint{animation:g6gl 1.4s ease-out both}
  @keyframes g6gl{0%{opacity:0;transform:scale(.2) rotate(0)}30%{opacity:1;transform:scale(1.1) rotate(40deg)}100%{opacity:0;transform:scale(.7) rotate(120deg)}}
  /* clean */
  .scene.alive .cloth .pu img{animation:g6wipe 1.4s ease-in-out both}
  @keyframes g6wipe{0%{transform:none}22%{transform:translateX(-150%) rotate(-6deg)}50%{transform:translateX(-10%) rotate(5deg)}78%{transform:translateX(-120%) rotate(-5deg)}100%{transform:translateX(-30%) rotate(0)}}
  .scene.set .cloth .pu img,.scene.up .cloth .pu img{animation:g6cl 2.4s ease-in-out infinite 1.3s}
  @keyframes g6cl{50%{transform:translateX(-14%) rotate(-4deg)}}
  .scene.alive .crumbs .pu img{animation:g6vanish .9s ease-in .5s forwards}
  @keyframes g6vanish{to{opacity:0;transform:scale(.4)}}
  .spk{width:6em;height:6em;opacity:0}
  .spk svg{width:100%;height:100%;overflow:visible}
  .scene.alive .spk{animation:g6spk 1.8s ease-in-out infinite;animation-delay:var(--sd,0s)}
  @keyframes g6spk{0%,100%{opacity:0;transform:scale(.2) rotate(0)}40%{opacity:1;transform:scale(1) rotate(35deg)}70%{opacity:.6;transform:scale(.7) rotate(70deg)}}
  /* rest */
  .zz{left:0;top:0;font-size:6em;font-weight:700;color:#fff;text-shadow:0 0 .6em #9b8cff,0 .1em 0 #6a4be8;opacity:0;animation:g6zz 3.6s ease-in infinite;animation-delay:var(--zd,0s)}
  @keyframes g6zz{0%{opacity:0;transform:translate(0,0) scale(.4) rotate(0)}15%{opacity:1}100%{opacity:0;transform:translate(5em,-9em) scale(1.2) rotate(18deg)}}
  .scene.alive .zz{animation-duration:2s}
  .tstar{width:2.4em;height:2.4em;background:#fff6a8;clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);animation:g6tw 2.2s ease-in-out infinite;animation-delay:var(--sd,0s);filter:drop-shadow(0 0 .5em #fff6a8)}
  @keyframes g6tw{0%,100%{opacity:.35;transform:scale(.6) rotate(0)}50%{opacity:1;transform:scale(1) rotate(20deg)}}
  .scene.alive .tstar{animation:g6tw2 .5s ease-in-out infinite alternate;animation-delay:var(--sd,0s)}
  @keyframes g6tw2{from{opacity:.5;transform:scale(.8) rotate(-10deg)}to{opacity:1;transform:scale(1.9) rotate(30deg)}}
  .shoot{left:-10%;top:10%;width:30%;height:.7em;border-radius:.4em;background:linear-gradient(90deg,transparent,#fff 80%);opacity:0;transform:rotate(24deg)}
  .scene.alive .shoot{animation:g6shoot 1.3s ease-in .3s both}
  @keyframes g6shoot{0%{opacity:0;transform:translate(0,0) rotate(24deg)}15%{opacity:1}100%{opacity:0;transform:translate(300%,150%) rotate(24deg)}}
  .scene.set .moon .pu img,.scene.up .moon .pu img{animation:g6bob 3.2s ease-in-out infinite 1.2s}
  @keyframes g6bob{50%{transform:translateY(-4%) rotate(2deg)}}
  .scene.alive .moon .pu img{animation:g6moon 1s ease-in-out infinite alternate;filter:drop-shadow(0 0 1.4em #fff3a0) drop-shadow(0 .9em .6em rgba(60,30,0,.4))}
  @keyframes g6moon{from{transform:scale(1)}to{transform:scale(1.1)}}
  .scene.set .snooze .pu img,.scene.up .snooze .pu img{transform-origin:50% 90%;animation:g6snore 3.4s ease-in-out infinite 1.2s}
  @keyframes g6snore{50%{transform:scale(1.02,1.05)}}
  /* hurt */
  .glow{border-radius:50%;background:radial-gradient(circle,rgba(255,255,200,.95),rgba(120,255,170,.55) 45%,transparent 70%);opacity:0;transform:scale(.2)}
  .scene.alive .glow{animation:g6glow 1.1s ease-in-out infinite alternate;opacity:1;transform:none}
  @keyframes g6glow{from{transform:scale(.8);opacity:.7}to{transform:scale(1.5);opacity:1}}
  .hrt{width:4em;height:3.8em;opacity:0}
  .hrt svg{width:100%;height:100%}
  .scene.alive .hrt{animation:g6hrt 2.2s ease-out infinite;animation-delay:var(--sd,0s)}
  @keyframes g6hrt{0%{opacity:0;transform:translateY(0) scale(.4)}20%{opacity:1}100%{opacity:0;transform:translateY(-12em) scale(1.2)}}
  .scene.alive .teddy .pu img{animation:g6hop .5s cubic-bezier(.3,1.6,.5,1) 4}
  .scene.set .cross .pu img,.scene.up .cross .pu img{transform-origin:50% 0;animation:g6swing 3s ease-in-out infinite 1.2s}
  @keyframes g6swing{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
  .scene.alive .cross .pu img{filter:drop-shadow(0 0 1.4em #7dffb0) drop-shadow(0 .9em .6em rgba(60,30,0,.4))}
  .scene.set .hkid .pu img,.scene.up .hkid .pu img{transform-origin:50% 100%;animation:g6snore 2.6s ease-in-out infinite 1.2s}
  /* bye */
  .scene.set .bus .pu img,.scene.up .bus .pu img{animation:g6idlebus 1.6s ease-in-out infinite 1.2s}
  @keyframes g6idlebus{50%{transform:translateY(-1.6%)}}
  .scene.alive .bus .pu{animation:g6drive 2.6s cubic-bezier(.5,0,.8,.6) both}
  @keyframes g6drive{0%{transform:translateZ(var(--z)) translateX(0)}12%{transform:translateZ(var(--z)) translateX(-4%)}100%{transform:translateZ(var(--z)) translateX(130%)}}
  .scene.alive .bus .pu img{animation:g6bump .25s linear infinite alternate}
  @keyframes g6bump{from{transform:translateY(0)}to{transform:translateY(-2.5%)}}
  .scene.set .hand .pu img,.scene.up .hand .pu img{transform-origin:50% 95%;animation:g6wave 1.1s ease-in-out infinite alternate 1.2s}
  @keyframes g6wave{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
  .scene.alive .hand .pu img{animation:g6wave .3s ease-in-out infinite alternate}
  .scene.alive .sunl .pu img{animation:g6set 2.6s ease-in-out both;filter:drop-shadow(0 0 2em #ffd27a)}
  @keyframes g6set{0%{transform:none}40%{transform:scale(1.18)}100%{transform:translateY(16%) scale(1.1)}}
  .dust{width:5em;height:5em;border-radius:50%;background:radial-gradient(circle,rgba(255,240,210,.9),rgba(255,230,190,0) 70%);opacity:0}
  .scene.alive .dust{animation:g6dust 1.4s ease-out infinite;animation-delay:var(--sd,0s)}
  @keyframes g6dust{0%{opacity:0;transform:translate(0,0) scale(.3)}25%{opacity:.9}100%{opacity:0;transform:translate(-6em,-2em) scale(1.6)}}
  /* leaves (the page that turns) */
  .leaf{position:absolute;left:62em;top:0;width:62em;height:45em;transform-origin:0 50%;transform-style:preserve-3d}
  .leaf .fr,.leaf .bk{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}
  .leaf .bk{transform:rotateY(180deg)}
  .leaf .fr.pgr{border-radius:0 2.2em 2.2em 0}
  .leaf .bk.pgl{border-radius:2.2em 0 0 2.2em;background:linear-gradient(90deg,#fffaf0,#fdf1d6 86%,#e0cfa8)}
  .leaf .fr.pgr{background:linear-gradient(270deg,#fffaf0,#fdf1d6 86%,#e0cfa8)}
  .leaf .shade{position:absolute;inset:0;pointer-events:none;opacity:0;background:linear-gradient(90deg,rgba(40,20,0,.75),rgba(40,20,0,.1))}
  .leaf .fr .scene{inset:0}
  .leaf .fr,.leaf .bk{box-shadow:0 .6em 0 #f0e3c4}
  /* the cover */
  .cv{position:absolute;inset:0;border-radius:.6em 3em 3em .6em;overflow:hidden;
    background:radial-gradient(circle at 24% 18%,rgba(255,255,255,.35),transparent 40%),linear-gradient(135deg,#ff7a45,#e8453c 55%,#b8232f);
    box-shadow:inset 0 0 0 .7em #ffcf5a,inset 0 0 0 1.1em #a8202a,inset 0 0 0 1.5em #ffe58a,0 .9em 0 #7a1520}
  .cv::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4em;background:linear-gradient(90deg,rgba(0,0,0,.35),rgba(255,255,255,.18) 40%,rgba(0,0,0,.1));pointer-events:none}
  .cv::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0 .4em,transparent .4em .8em);pointer-events:none}
  .cv .top{position:absolute;left:0;right:0;top:3em;text-align:center;font-size:2.6em;font-weight:700;color:#ffe9a8;letter-spacing:.2em}
  .cv .pin{position:absolute;left:50%;top:6.4em;width:11em;height:11em;margin-left:-5.5em;filter:drop-shadow(0 .6em .5em rgba(0,0,0,.4));animation:g6pin 3s ease-in-out infinite}
  @keyframes g6pin{50%{transform:rotate(5deg) scale(1.05)}}
  .cv .ttl{position:absolute;left:0;right:0;top:18em;text-align:center;font-size:7em;line-height:1;font-weight:700;color:#fff2b0;text-shadow:0 .1em 0 #a8202a,0 .2em 0 #7a1520,0 .5em .5em rgba(0,0,0,.4);letter-spacing:.01em}
  .cv .czh{position:absolute;left:0;right:0;top:27.5em;text-align:center;font-size:3.6em;font-weight:700;color:#ffe9a8;text-shadow:0 .1em 0 #7a1520}
  .cv .cast{position:absolute;left:0;right:0;bottom:2.4em;display:flex;justify-content:center;gap:1.4em}
  .cv .cast img{height:8.6em;filter:drop-shadow(0 .4em .3em rgba(0,0,0,.4))}
  .cv .endtag{position:absolute;right:3.5em;top:5em;width:12em;height:12em;border-radius:50%;display:none;place-items:center;text-align:center;font-size:3em;font-weight:700;color:#7a1520;line-height:1.05;transform:rotate(14deg);background:radial-gradient(circle at 35% 30%,#fff6c8,#ffd23d 60%,#e8a21a);box-shadow:0 .5em 0 #a3740b,0 1em 1em rgba(0,0,0,.4)}
  .cv.theend .endtag{display:grid}
  /* the cast that jumps out of the closed book */
  .g6 .cst{position:absolute;pointer-events:none;transform-origin:50% 100%;filter:drop-shadow(0 1em .8em rgba(0,0,0,.45))}
  .g6 .cst.wv{animation:g6cwave .5s ease-in-out infinite alternate;animation-delay:var(--wd,0s)}
  @keyframes g6cwave{from{transform:rotate(-7deg) translateY(0)}to{transform:rotate(7deg) translateY(-3%)}}
  .g6 .nice{position:absolute;left:50%;top:21em;transform:translateX(-50%) rotate(-3deg);z-index:5;text-align:center;padding:2em 7em 2.4em;border-radius:5em;color:#3a2300;white-space:nowrap;
    background:linear-gradient(180deg,#fff6b8,#ffd84a 45%,#ff9f1f);box-shadow:0 1.2em 0 #b86a00,0 3em 6em rgba(0,0,0,.55),inset 0 .5em 0 rgba(255,255,255,.7);animation:g6nice .7s cubic-bezier(.2,1.6,.4,1) both}
  .g6 .nice b{display:block;font-size:11em;line-height:1.05}
  .g6 .nice span{display:block;font-size:4em;margin-top:.2em}
  @keyframes g6nice{from{transform:translateX(-50%) scale(.2) rotate(-20deg);opacity:0}}
  .g6 .nice.out{animation:g6niceout .4s forwards}
  @keyframes g6niceout{to{transform:translateX(-50%) scale(.6);opacity:0}}
  .chorus.g6c{background:radial-gradient(circle,rgba(20,10,60,.1),rgba(5,10,25,.5));justify-content:flex-start;padding-top:12rem;gap:1.4rem}
  .chorus.g6c .c2{font-size:11rem!important}
  canvas.g6-fw{position:fixed;inset:0;z-index:44;pointer-events:none}
  .g6 .idle-cast{position:absolute;pointer-events:none;opacity:.95;filter:drop-shadow(0 1em .8em rgba(0,0,0,.45));animation:float 3.4s ease-in-out infinite}
  `;

  /* =====================================================================
     GAME
     ===================================================================== */
  const pos = (x, y, w, hh) => `left:${f1((x / PW) * 100)}%;top:${f1((y / PH) * 100)}%;width:${f1((w / PW) * 100)}%;height:${f1((hh / PH) * 100)}%`;
  const ex = (cls, x, y, w, hh, extra = "", style = "") => typeof extra === "string" && extra.trim().startsWith("<") // markup (an inline SVG) is HTML, not text
    ? h("div", { class: "ex " + cls, style: pos(x, y, w, hh) + ";" + style, html: extra })
    : h("div", { class: "ex " + cls, style: pos(x, y, w, hh) + ";" + style }, extra);
  const svgHtml = (vb, inner) => `<svg viewBox="${vb}">${inner}</svg>`;
  const star4Svg = svgHtml("-12 -12 24 24", `<path d="M0 -11 Q2.4 -2.4 11 0 Q2.4 2.4 0 11 Q-2.4 2.4 -11 0 Q-2.4 -2.4 0 -11Z" fill="#fff6a8" stroke="#ffb020" stroke-width="1"/>`);
  const heartSvg = svgHtml("0 0 24 22", `<path d="M12 21 C-7 8 3 -3 12 5 C21 -3 31 8 12 21Z" fill="#ff5a7a" stroke="#c41e4a" stroke-width="1.2"/>`);
  const rnd = (a, b) => a + Math.random() * (b - a);

  /** the pop-up layers of one page picture: returns {el, alive} */
  function buildScene(name) {
    const sc = h("div", { class: "scene" });
    const L = SCENES[name] || [{ id: name, x: 40, y: 20, w: 250, flat: 0 }];
    L.forEach((l) => {
      const D = LAY[l.id];
      const w = D ? D.w : 200, hh = D ? D.h : 200;
      const pw = h("div", { class: "pw" + (l.flat ? " flat" : "") + (l.cls ? " " + l.cls : ""), style: pos(l.x, l.y, w * (l.s || 1), hh * (l.s || 1)) + `;--z:${(l.z || 2)}em;--d:${l.d || 0}s` });
      if (!l.flat) pw.append(h("i", { class: "psh" }));
      const img = TC.artImg(l.id, "", ""); if (l.args) img.src = TC.art(l.id, ...l.args);
      pw.append(h("div", { class: "pu" }, img));
      sc.append(pw);
    });
    const kit = EXTRAS[name] ? EXTRAS[name](sc) : null;
    return { el: sc, alive: kit };
  }

  /* extras (DOM bits on top of the cut-outs) and the "comes alive" moment of each page; nap() ends early on Esc */
  const EXTRAS = {
    "st-wake": (sc) => {
      sc.append(ex("rings idle", 238, 20, 100, 70, svgHtml("0 0 100 70", `<path d="M20 48 Q4 36 12 18"/><path d="M10 52 Q-12 36 -2 8"/><path d="M82 48 Q98 36 90 18"/><path d="M92 52 Q114 36 104 8"/>`)));
      sc.append(ex("sunburst live", 16, 16, 202, 175, `<div class="rays"></div><div class="disc"></div>`));
      [[130, 22], [150, 40], [104, 36]].forEach(([x, y], i) => sc.append(ex("note live", x, y, 20, 20, "♪", `animation-delay:${i * 0.7}s`)));
      return async (nap) => {
        sc.classList.add("alive"); TC.sfx("ding"); await nap(250); TC.sfx("boost"); TC.confetti(70, ["#ffd23d", "#ffb02e", "#fff6a8", "#ff8a4a"]); await nap(900); TC.sfx("sparkle");
      };
    },
    "st-wash": (sc) => {
      const cols = [];
      for (let i = 0; i < 16; i++) {
        const sz = rnd(3, 7);
        const b = h("div", { class: "ex bub idle", style: pos(rnd(112, 205), rnd(62, 150), sz * 5, sz * 5) + `;animation-delay:${-rnd(0, 2.6)}s;animation-duration:${rnd(1.8, 3.4)}s` });
        b.style.height = ""; b.style.aspectRatio = "1"; sc.append(b); cols.push(b);
      }
      [[120, 100, 0], [190, 120, 0.4], [150, 84, 0.8]].forEach(([x, y, d]) => sc.append(ex("glint live", x, y, 26, 26, star4Svg, `animation-delay:${d + 1.4}s`)));
      return async (nap) => {
        sc.classList.add("alive");
        for (const b of cols) { b.classList.add("pop"); TC.sfx("pop"); await nap(95); }
        TC.sfx("sparkle"); TC.confetti(40, ["#9fdcff", "#ffffff", "#bfe6ff", "#ffffff"]); await nap(600);
      };
    },
    "st-clean": (sc) => {
      for (let i = 0; i < 12; i++) { const s = ex("spk live", rnd(44, 270), rnd(104, 190), 20, 20, star4Svg, `--sd:${(i * 0.17).toFixed(2)}s`); s.style.aspectRatio = "1"; sc.append(s); }
      return async (nap) => { sc.classList.add("alive"); TC.sfx("whoosh"); await nap(500); TC.sfx("sparkle"); await nap(500); TC.sfx("ding"); TC.confetti(50, ["#fff6a8", "#ffffff", "#ffd23d"]); await nap(700); };
    },
    "st-rest": (sc) => {
      ["Z", "z", "Z"].forEach((ch, i) => sc.append(ex("zz idle", 70 + i * 16, 98 - i * 6, 30, 26, ch, `--zd:${i * 1.2}s`)));
      for (let i = 0; i < 12; i++) { const s = ex("tstar idle", rnd(28, 215), rnd(26, 100), 10, 10, "", `--sd:${(-rnd(0, 2.2)).toFixed(2)}s`); s.style.aspectRatio = "1"; s.style.height = ""; sc.append(s); }
      sc.append(ex("shoot live", 0, 24, 100, 6));
      return async (nap) => { sc.classList.add("alive"); TC.sfx("sparkle"); await nap(450); TC.sfx("levelup"); await nap(1100); TC.sfx("sparkle"); await nap(500); };
    },
    "st-hurt": (sc) => {
      sc.append(ex("glow live", 100, 183, 52, 52));
      for (let i = 0; i < 6; i++) { const e = ex("hrt live", 70 + i * 15, 190 - (i % 2) * 14, 14, 13, heartSvg, `--sd:${(i * 0.33).toFixed(2)}s`); sc.append(e); }
      return async (nap) => {
        sc.classList.add("alive"); const img = sc.querySelector(".hkid img"); if (img) img.src = TC.art("st-hurtkid", "happy");
        TC.sfx("ding"); await nap(350); TC.sfx("sparkle"); TC.confetti(50, ["#7dffb0", "#fff6a8", "#ffffff", "#ff9ab0"]); await nap(1000);
      };
    },
    "st-bye": (sc) => {
      for (let i = 0; i < 5; i++) sc.append(ex("dust live", 18 + i * 3, 196 + (i % 2) * 8, 18, 18, "", `--sd:${(i * 0.22).toFixed(2)}s`));
      return async (nap) => { sc.classList.add("alive"); TC.sfx("coin"); await nap(260); TC.sfx("coin"); await nap(500); TC.sfx("whoosh"); TC.confetti(40, ["#ffd27a", "#ff9ab0", "#ffffff"]); await nap(2000); };
    }
  };

  /** the words of a page sentence, with the key word marked (same matching rule as the engine's blank) */
  function tokens(P) {
    const keys = (P.keys && P.keys[0]) || [P.w];
    return String(P.say).split(/\s+/).filter(Boolean).map((w) => {
      const m = w.match(/^([^A-Za-z']*)(.*?)([^A-Za-z']*)$/), core = m[2], n = TC.norm(core)[0] || "";
      return { pre: m[1], core, suf: m[3], key: keys.some((k) => TC.norm(k).some((kk) => TC.wordMatch(n, kk))) };
    });
  }
  function textCard(i, n, P) {
    const sent = h("div", { class: "sent" });
    tokens(P).forEach((t) => sent.append(h("span", { class: "wd" }, t.pre, t.key ? h("span", { class: "kw blank" }, t.core) : t.core, t.suf)));
    return h("div", { class: "tcard" },
      h("div", { class: "trk" }, ...Array.from({ length: n }, (_, k) => h("i", { class: k < i ? "d" : k === i ? "c" : "" }))),
      sent, h("div", { class: "szh zh" }, P.zh || ""),
      h("div", { class: "pgn" }, h("b", {}, String(i + 1))),
      h("div", { class: "stag zh" }, P.no ? "護照 " + P.no : ""));
  }
  function coverEl(G, ended) {
    const cv = h("div", { class: "cv" + (ended ? " theend" : "") },
      h("div", { class: "top zh" }, "土城國小 · ENGLISH DAY"),
      h("div", { class: "pin", html: svgHtml("-26 -26 52 52", TC.seal(0, 0, 17, 0)) }),
      h("div", { class: "ttl" }, G.title || "Storybook Day"),
      h("div", { class: "czh zh" }, G.zh || ""),
      h("div", { class: "cast" }, TC.artImg("st-rooster"), TC.artImg("ollie"), TC.artImg("st-teddy")),
      h("div", { class: "endtag" }, "The", h("br"), "End"));
    return cv;
  }

  /** mini fireworks over the book (own canvas, removed by kill()) */
  function fireworks() {
    const cv = h("canvas", { class: "g6-fw" }); document.body.append(cv);
    const W = (cv.width = innerWidth), H = (cv.height = innerHeight), g = cv.getContext("2d");
    let ps = [], rk = [], raf = 0, on = true;
    function burst(x, y, hue) {
      const n = 80 + ((Math.random() * 30) | 0);
      for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = 1.5 + Math.random() * 7.5; ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, hue: hue + rnd(-18, 18), r: 2 + Math.random() * 2.4 }); }
      TC.sfx("kick"); TC.sfx("sparkle");
    }
    function shoot(x, y, hue) { rk.push({ x: x == null ? rnd(W * 0.25, W * 0.75) : x, y: H * 0.9, ty: y == null ? rnd(H * 0.1, H * 0.38) : y, vx: rnd(-1.2, 1.2), vy: -rnd(13, 17), hue: hue == null ? rnd(0, 360) : hue }); TC.sfx("whoosh"); }
    (function loop() {
      g.globalCompositeOperation = "destination-out"; g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, 0, W, H); g.globalCompositeOperation = "lighter";
      rk.forEach((r) => { r.x += r.vx; r.y += r.vy; r.vy *= 0.985; g.fillStyle = `hsl(${r.hue},100%,75%)`; g.beginPath(); g.arc(r.x, r.y, 3, 0, 7); g.fill(); if (r.y <= r.ty || r.vy > -3) { r.dead = 1; burst(r.x, r.y, r.hue); } });
      rk = rk.filter((r) => !r.dead);
      ps.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.vx *= 0.985; p.vy *= 0.985; p.life -= 0.012; g.fillStyle = `hsla(${p.hue},100%,${55 + p.life * 25}%,${Math.max(0, p.life)})`; g.beginPath(); g.arc(p.x, p.y, p.r * Math.max(0.35, p.life), 0, 7); g.fill(); });
      ps = ps.filter((p) => p.life > 0);
      raf = requestAnimationFrame(loop);
    })();
    return { burst, shoot, kill() { on = false; cancelAnimationFrame(raf); cv.remove(); } };
  }

  /* ----- the game object ----- */
  let root = null, book = null, lp = null, rp = null, rib = null, idleBits = null;
  let fx = null, abortIv = 0, syncIv = 0;
  const live = new Set(); // temporary DOM (leaves, cast, banners) so Esc / the next player never meets leftovers

  function clearTemp() {
    live.forEach((e) => e.remove()); live.clear();
    clearInterval(abortIv); abortIv = 0; clearInterval(syncIv); syncIv = 0;
    if (fx) { fx.kill(); fx = null; }
    document.querySelectorAll(".chorus.g6c,.clap-banner").forEach((e) => e.remove());
  }
  const keep = (e) => { live.add(e); return e; };

  function resetBook(api) {
    clearTemp();
    if (!book) return;
    book.classList.add("closed");
    lp.replaceChildren(); rp.replaceChildren();
    rib.style.left = "6.7em";
    book.querySelectorAll(".leaf").forEach((e) => e.remove());
    const leaf = h("div", { class: "leaf", style: "transform:translateZ(.3em)" }, h("div", { class: "fr" }, coverEl(api.G, false)), h("div", { class: "bk pgl" }));
    book.append(leaf);
  }

  TC.games.story = {
    startArt: ["st-rooster", "st-clock", "st-teddy", "st-moon", "st-boy", "st-girl", "st-sun", "star"],

    mount(api) {
      const style = h("style", { id: "g6css" }, css); document.head.append(style);
      root = h("div", { class: "g6" });
      root.append(h("div", { class: "lamp" }));
      for (let i = 0; i < 14; i++) root.append(h("i", { class: "mote", style: `left:${rnd(40, 100)}%;top:${rnd(0, 60)}%;animation-delay:${-rnd(0, 9)}s;animation-duration:${rnd(7, 12)}s` }));
      const apple = TC.artImg("apple", "prop"); apple.style.cssText = "left:5em;top:33em;width:14em;height:14em";
      const cookie = TC.artImg("cookie", "prop"); cookie.style.cssText = "left:158em;top:36em;width:13em;height:13em";
      root.append(apple, cookie);
      const world = h("div", { class: "g6-world" });
      book = h("div", { class: "g6-book closed" });
      lp = h("div", { class: "g6-pg g6-lp" }); rp = h("div", { class: "g6-pg g6-rp" });
      rib = h("div", { class: "g6-rib" }, h("i"));
      book.append(h("div", { class: "g6-bd g6-bl" }), h("div", { class: "g6-bd g6-br" }), lp, rp, h("div", { class: "g6-gut" }), rib);
      world.append(book); root.append(world);
      api.stage.append(root);
      Object.keys(LAY).forEach((id) => { const i = new Image(); i.src = TC.art(id); }); // decode the pictures now
      new Image().src = TC.art("st-hurtkid", "happy");
    },

    idle(api) {
      if (!root) return;
      resetBook(api);
      idleBits && idleBits.forEach((e) => e.remove());
      idleBits = ["st-boy", "st-rooster", "st-girl"].map((n, i) => {
        const im = TC.artImg(n, "idle-cast"); const L = [[6, 30, 22], [160, 12, 18], [152, 36, 19]][i];
        im.style.cssText = `left:${L[0]}em;top:${L[1]}em;height:${L[2]}em;animation-delay:${-i * 0.8}s`; root.append(im); return im;
      });
    },

    async play(api) {
      const G = api.G, pages = G.pages, n = Math.max(1, Math.min(pages.length, TC.rounds(pages.length)));
      idleBits && idleBits.forEach((e) => e.remove()); idleBits = null;
      // everything that waits is abortable (Esc sets api.aborted)
      const abortP = new Promise((res) => { abortIv = setInterval(() => { if (api.aborted) res(); }, 70); });
      const race = (p) => Promise.race([p, abortP]);
      const nap = (ms) => new Promise((r) => { const t0 = performance.now(); (function k() { const left = ms - (performance.now() - t0); if (api.aborted || left <= 0) r(); else setTimeout(k, Math.min(50, left)); })(); });
      const said = (t, o) => race(TC.speak(t, o));
      try {
        api.progress(0, n);
        const cover = book.querySelector(".leaf");
        let cur = buildScene(pages[0].img);
        rp.replaceChildren(cur.el);
        const turn = async (leaf, midCb) => {
          const a = leaf.animate([{ transform: "translateZ(.3em) rotateY(0deg)" }, { transform: "translateZ(3em) rotateY(-90deg)", offset: 0.5 }, { transform: "translateZ(.3em) rotateY(-180deg)" }], { duration: 1300, easing: "ease-in-out", fill: "forwards" });
          const fs = leaf.querySelector(".fr .shade"), bs = leaf.querySelector(".bk .shade");
          fs && fs.animate([{ opacity: 0 }, { opacity: 0.6, offset: 0.5 }, { opacity: 0.6 }], { duration: 1300, fill: "forwards" });
          bs && bs.animate([{ opacity: 0.6 }, { opacity: 0.6, offset: 0.5 }, { opacity: 0 }], { duration: 1300, fill: "forwards" });
          TC.sfx("whoosh");
          await nap(650); midCb && midCb();
          await race(a.finished.catch(() => {}));
        };
        const popUp = async (sc) => {
          sc.classList.add("up");
          const k = sc.querySelectorAll(".pw:not(.flat)").length;
          for (let i = 0; i < k; i++) { TC.sfx("pop"); await nap(i === 0 ? 180 : 230); }
        };

        // ---- 1. the cover swings open ----
        await nap(500);
        book.classList.remove("closed");
        const card0 = textCard(0, n, pages[0]);
        cover.querySelector(".bk").append(card0.cloneNode(true));
        cover.querySelector(".fr").append(h("div", { class: "shade" })); cover.querySelector(".bk").append(h("div", { class: "shade" }));
        TC.sfx("fanfare");
        await turn(cover, () => { popUp(cur.el); });
        if (api.aborted) return null;
        lp.replaceChildren(card0); cover.remove();
        await nap(600);

        // ---- 2. one page after another ----
        for (let i = 0; i < n && !api.aborted; i++) {
          const P = pages[i];
          api.progress(i, n);
          rib.style.left = 6.7 + i * 8.4 + "em";
          if (i > 0) {
            const nxt = buildScene(P.img), card = textCard(i, n, P);
            const fr = h("div", { class: "fr pgr" }, h("div", { class: "shade" })); const old = cur.el.cloneNode(true); old.className = "scene set"; fr.prepend(old);
            const bk = h("div", { class: "bk pgl" }, card.cloneNode(true), h("div", { class: "shade" }));
            const leaf = keep(h("div", { class: "leaf", style: "transform:translateZ(.3em)" }, fr, bk));
            rp.replaceChildren(nxt.el); cur = nxt;
            await turn(leaf, () => { popUp(cur.el); });
            if (api.aborted) return null;
            lp.replaceChildren(card); leaf.remove(); live.delete(leaf);
            await nap(500);
          }
          const kw = lp.querySelector(".kw");
          // ask: the engine prints the question + the sentence (key word blanked); the page mirrors it
          const asked = api.ask({ teacher: P.t || G.teacher, tzh: P.tzh || G.tzh, say: P.say, zh: P.zh, keys: P.keys || [[P.w]], word: P.w, hideKey: true });
          clearInterval(syncIv);
          syncIv = setInterval(() => { if (kw) kw.classList.toggle("blank", !!document.querySelector("#kLine .w.blank")); }, 150);
          const res = await race(asked);
          clearInterval(syncIv); syncIv = 0;
          if (api.aborted || !res) return null;
          if (res.cancelled) return null;
          if (!res.ok) { await race(TC.model(P.say, P.w)); if (api.aborted) return null; } // never punish: Ollie models the word
          if (kw) { kw.classList.remove("blank"); kw.classList.add("done"); }
          TC.hideTalk();
          await nap(250);
          if (cur.alive) await cur.alive(nap);
          if (api.aborted) return null;
          await race(TC.praise());
          if (api.aborted) return null;
          await nap(450);
        }
        api.progress(n, n);
        if (api.aborted) return null;

        // ---- 3. finale: the book closes, everybody jumps out and waves ----
        book.classList.add("closed");
        cur.el.style.transition = "opacity .5s .5s"; cur.el.style.opacity = "0"; // the pop-ups fold away under the cover
        const back = h("div", { class: "leaf", style: "transform:translateZ(.3em) rotateY(-180deg)" }, h("div", { class: "fr" }, coverEl(G, true), h("div", { class: "shade" })), h("div", { class: "bk pgl" }, lp.firstChild ? lp.firstChild.cloneNode(true) : "", h("div", { class: "shade" })));
        keep(back); book.append(back);
        const a = back.animate([{ transform: "translateZ(.3em) rotateY(-180deg)" }, { transform: "translateZ(3em) rotateY(-90deg)", offset: 0.5 }, { transform: "translateZ(.3em) rotateY(0deg)" }], { duration: 1300, easing: "ease-in-out", fill: "forwards" });
        TC.sfx("whoosh");
        await race(a.finished.catch(() => {}));
        if (api.aborted) return null;
        TC.sfx("stamp");
        fx = fireworks();
        fx.shoot(innerWidth * 0.5, innerHeight * 0.22, 45); await nap(350); fx.shoot(innerWidth * 0.33, innerHeight * 0.3, 200); fx.shoot(innerWidth * 0.68, innerHeight * 0.28, 320);
        // the whole cast jumps out of the book
        const cast = [["st-boy", 21, 28], ["st-rooster", 15, 22], ["ollie", 22, 28], ["st-girl", 21, 30], ["st-teddy", 18, 20], ["st-hurtkid", 18, 26], ["st-clock", 13, 17]];
        const cx = innerWidth / 2, W = innerWidth, Hh = innerHeight, em = Math.min(Hh / 100, W / 177.8);
        for (let i = 0; i < cast.length; i++) {
          const [nm, wd, hh] = cast[i];
          const im = TC.artImg(nm, "cst"); if (nm === "st-hurtkid") im.src = TC.art("st-hurtkid", "happy");
          const tx = W * (0.1 + (i / (cast.length - 1)) * 0.8) - (wd * em) / 2, ty = Hh * 0.97 - hh * em;
          im.style.cssText = `left:0;top:0;width:${wd}em;height:${hh}em;--wd:${(-i * 0.13).toFixed(2)}s;transform:translate(${cx - (wd * em) / 2}px,${Hh * 0.3}px) scale(.2)`;
          root.append(keep(im));
          const an = im.animate([
            { transform: `translate(${cx - (wd * em) / 2}px,${Hh * 0.3}px) scale(.2)`, opacity: 0 },
            { transform: `translate(${cx + (tx - cx) * 0.5 - (wd * em) / 2}px,${Hh * 0.04}px) scale(.8)`, opacity: 1, offset: 0.45 },
            { transform: `translate(${tx}px,${ty}px) scale(1)`, opacity: 1 }], { duration: 950, easing: "cubic-bezier(.3,.6,.4,1)", fill: "forwards" });
          TC.sfx("pop");
          an.finished.then(() => { im.style.transform = `translate(${tx}px,${ty}px)`; im.style.left = "0"; an.cancel(); im.style.transform = `translate(${tx}px,${ty}px)`; im.classList.add("wv"); }).catch(() => {});
          await nap(170);
          if (i % 2) fx.shoot();
        }
        await nap(900);
        if (api.aborted) return null;
        // "Have a nice day!"
        const E = G.ending || { say: "Have a nice day!", zh: "" };
        const nice = keep(h("div", { class: "nice" }, h("b", {}, E.say), h("span", { class: "zh" }, E.zh || "")));
        root.append(nice); TC.sfx("levelup"); TC.confetti(120);
        fx.shoot(); fx.shoot();
        await said(E.say);
        if (api.aborted) return null;
        await nap(500);
        nice.classList.add("out"); await nap(380); nice.remove();

        // PARENT moment: the whole room says "Goodbye!" together (the louder, the more fireworks)
        const last = pages[pages.length - 1], word = String(last.say || "Goodbye.").replace(/[.!?]+$/, "") + "!";
        const bar = h("i"), ch = h("div", { class: "chorus g6c" }, h("div", { class: "c1 zh" }, "🎉 Everybody! 大家一起說！"), h("div", { class: "c2" }, word), h("div", { class: "bar" }, bar), h("div", { class: "zh", style: "font-size:1.8rem;color:var(--ink2)" }, "越大聲，煙火越多！"));
        document.body.append(ch); TC.sfx("levelup");
        await said(word);
        let peak = 0, loud = 0, nextBoom = 0, skip = false;
        TC.pending = () => { skip = true; };
        const t0 = performance.now();
        await race(new Promise((res) => {
          (function loop() {
            const el = performance.now() - t0, l = TC.Mic.level || 0; peak = Math.max(peak, l);
            bar.style.width = Math.min(100, peak * 140) + "%";
            if (l > 0.3) loud += 16; else loud = Math.max(0, loud - 8);
            if (el > nextBoom && (l > 0.3 || el > 3000)) { fx && fx.shoot(); nextBoom = el + (l > 0.5 ? 300 : 800); }
            if (api.aborted || el > 5200 || (skip && el > 1500) || (loud > 700 && el > 2500)) res(); else requestAnimationFrame(loop);
          })();
        }));
        if (TC.pending) TC.pending = null;
        if (api.aborted) return null;
        for (let i = 0; i < 5; i++) { fx.shoot(); await nap(180); }
        TC.confetti(peak > 0.5 ? 260 : 140); TC.sfx(peak > 0.5 ? "fanfare" : "ding");
        await nap(900);
        ch.remove();
        if (api.aborted) return null;
        await race(TC.clapBanner());
        if (api.aborted) return null;
        await nap(400);
        TC.lastSay = ""; // this game already did the room's "Goodbye!" — the station does not repeat it
        return { ok: true };
      } finally {
        clearTemp();
      }
    }
  };
})();
