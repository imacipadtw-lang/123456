/* =====================================================================
   Feeling faces for the "How are you?" gate (passport 第10關 心情) — original
   glossy-toy drawings in the same style as the pose kid in js/art.js.
   Each picture is that kid's head and shoulders with a big exaggerated
   face and ONE clear prop, so a first-grader can name the feeling without
   reading:  TC.art("feel-happy") → data URL
     feel-happy  laughing, arms up, sun and sparkles
     feel-sad    streams of tears under a rain cloud
     feel-angry  red face, gritted teeth, steam from the ears
     feel-tired  heavy eyelids, a huge yawn, Z z z and a moon
     feel-hungry drooling at a hamburger in a thought bubble, hands on the tummy
     feel-scared hair on end, huge eyes, shaking — and a little ghost
   ===================================================================== */
(function () {
  "use strict";
  const TC = window.TC;
  if (!TC || !TC.ART || !TC.ArtCtx) return;
  const SKIN = "#ffd3a8", SKIN2 = "#f0a878", HAIR = "#5a3518", SHIRT = "#4cc9ff", INK = "#1b1d33";
  const f1 = (v) => +v.toFixed(1);
  const limb = (x1, y1, x2, y2, col, w = 13) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  const hair = (c, cx, cy, R) => c.path(`M${cx - R} ${cy - 6} Q${f1(cx - R + 3)} ${f1(cy - R - 9)} ${cx} ${f1(cy - R - 9)} Q${f1(cx + R - 3)} ${f1(cy - R - 9)} ${cx + R} ${cy - 6} Q${f1(cx + R * 0.62)} ${f1(cy - R * 0.66)} ${cx} ${f1(cy - R * 0.5)} Q${f1(cx - R * 0.62)} ${f1(cy - R * 0.66)} ${cx - R} ${cy - 6}Z`, HAIR);
  const ear = (c, x, y, r, side, skin = SKIN, skin2 = SKIN2) => c.sphere(x, y, r, skin, 0.4) + `<path d="M${f1(x + side * r * 0.35)} ${f1(y - r * 0.5)} Q${f1(x - side * r * 0.55)} ${y} ${f1(x + side * r * 0.35)} ${f1(y + r * 0.5)}" stroke="${skin2}" stroke-width="${f1(r * 0.24)}" fill="none" stroke-linecap="round"/>`;
  const BROW = "#3d2410", MOUTH = "#7a1a2c", TONGUE = "#ff7a9a", TEAR = "#4db8ff";
  const st = (d, col, w, extra = "") => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  /** a water drop (tear, rain, sweat, drool) with its point up, centred on the round part */
  const drop = (x, y, r, col = TEAR, rot = 0) => `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x} ${f1(y - r * 2)} C${f1(x + r * 1.15)} ${f1(y - r * 0.3)} ${f1(x + r)} ${f1(y + r)} ${x} ${f1(y + r)} C${f1(x - r)} ${f1(y + r)} ${f1(x - r * 1.15)} ${f1(y - r * 0.3)} ${x} ${f1(y - r * 2)}Z" fill="${col}" stroke="#1f7fd6" stroke-width="${f1(r * 0.22)}"/><ellipse cx="${f1(x - r * 0.35)}" cy="${f1(y + r * 0.1)}" rx="${f1(r * 0.22)}" ry="${f1(r * 0.42)}" fill="#fff" opacity=".85"/></g>`;
  /** a four-point sparkle */
  const sparkle = (x, y, r, col = "#ffd21f") => { const k = f1(r * 0.2); return `<path d="M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r}Z" fill="${col}" stroke="#ff9a2e" stroke-width="1.6" stroke-linejoin="round"/><circle cx="${x}" cy="${y}" r="${f1(r * 0.22)}" fill="#fff"/>`; };
  /** head and shoulders: shirt, neck, ears, head (hair is added by the caller so props can sit under it) */
  function bust(c, o = {}) {
    const cx = o.cx || 100, cy = o.cy || 108, R = o.R || 54, skin = o.skin || SKIN, skin2 = o.skin2 || SKIN2, sh = o.sh || 166;
    let s = c.path(`M${cx - 80} 212 Q${cx - 78} ${sh + 7} ${cx - 30} ${sh} L${cx + 30} ${sh} Q${cx + 78} ${sh + 7} ${cx + 80} 212Z`, SHIRT);
    s += `<rect x="${cx - 14}" y="${cy + R - 18}" width="28" height="${sh + 12 - (cy + R - 18)}" rx="8" fill="${skin2}"/>`;
    s += ear(c, cx - R - 3, cy + 6, f1(R * 0.2), -1, skin, skin2) + ear(c, cx + R + 3, cy + 6, f1(R * 0.2), 1, skin, skin2);
    return s + c.sphere(cx, cy, R, skin, 0.6);
  }
  /** a raised arm: sleeve from the shoulder to a round hand */
  const arm = (c, x1, y1, x2, y2, r = 12, skin = SKIN) => limb(x1, y1, x2, y2, SHIRT, 16) + c.sphere(x2, y2, r, skin, 0.5);
  const cheeks = (cx, cy, gap, rx = 11, ry = 6.5, col = "#ff7aa8", op = 0.6) => `<ellipse cx="${cx - gap}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${col}" opacity="${op}"/><ellipse cx="${cx + gap}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${col}" opacity="${op}"/>`;

  /* happy — eyes squeezed into smiles, a huge open laugh, arms up, sun and sparkles */
  TC.ART["feel-happy"] = () => {
    const c = TC.ArtCtx(); let s = "";
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; s += st(`M${f1(164 + Math.cos(a) * 24)} ${f1(32 + Math.sin(a) * 24)} L${f1(164 + Math.cos(a) * 31)} ${f1(32 + Math.sin(a) * 31)}`, "#ffa51f", 5); }
    s += c.sphere(164, 32, 19, "#ffd21f") + sparkle(30, 30, 14) + sparkle(54, 10, 7) + sparkle(12, 76, 8) + sparkle(188, 88, 8);
    s += bust(c) + hair(c, 100, 108, 54);
    s += arm(c, 42, 186, 22, 146) + arm(c, 158, 186, 178, 146);
    s += st("M65 108 Q78 88 91 108", INK, 6) + st("M109 108 Q122 88 135 108", INK, 6);
    s += st("M66 84 Q78 76 90 82", BROW, 4) + st("M110 82 Q122 76 134 84", BROW, 4);
    s += cheeks(100, 122, 41);
    s += `<path d="M72 122 Q100 130 128 122 Q128 156 100 156 Q72 156 72 122Z" fill="${MOUTH}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
    s += `<path d="M76 125 Q100 132 124 125 L123 133 Q100 139 77 133Z" fill="#fff"/><path d="M83 149 Q100 137 117 149 Q110 155 100 155 Q90 155 83 149Z" fill="${TONGUE}"/>`;
    return c.out(s);
  };

  /* sad — worried brows, wet eyes, streams of tears, a trembling frown, under a rain cloud */
  TC.ART["feel-sad"] = () => {
    const c = TC.ArtCtx(), cy = 114; let s = "";
    [[30, 72, 5], [14, 96, 4.5], [26, 140, 4.5], [170, 72, 5], [186, 96, 4.5], [174, 140, 4.5]].forEach(([x, y, r]) => (s += drop(x, y, r, "#6cc5ff")));
    s += bust(c, { cy, R: 52 }) + hair(c, 100, cy, 52);
    s += c.sphere(66, 34, 19, "#8794b8", 0.45) + c.sphere(134, 34, 19, "#8794b8", 0.45) + c.sphere(100, 26, 25, "#8794b8", 0.45) + `<rect x="50" y="34" width="100" height="19" rx="9.5" fill="#6f7ba0"/>`;
    s += st("M62 99 L87 89", BROW, 5.5) + st("M138 99 L113 89", BROW, 5.5);
    [78, 122].forEach((x) => { const d = x < 100 ? -1 : 1;
      s += `<ellipse cx="${x}" cy="111" rx="10.5" ry="12" fill="${INK}"/><circle cx="${x - 3.5}" cy="106" r="4.6" fill="#fff"/><circle cx="${x + 4}" cy="115" r="2.4" fill="#fff" opacity=".85"/><path d="M${x - 9.5} 116 Q${x} 127 ${x + 9.5} 116 Q${x} 121 ${x - 9.5} 116Z" fill="#9fdcff"/>`;
      s += `<path d="M${x - 6} 122 Q${x + d * 1 - 8} 138 ${x + d * 6 - 7} 150 Q${x + d * 6} 158 ${x + d * 6 + 7} 150 Q${x + d * 1 + 8} 138 ${x + 6} 122Z" fill="${TEAR}" stroke="#1f7fd6" stroke-width="1.6"/><path d="M${x - 1.5} 127 Q${x + d * 2 - 3} 139 ${x + d * 5 - 3} 148" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/>`; });
    s += st("M84 152 Q100 136 116 152", INK, 4.8) + st("M93 158 Q100 155 107 158", INK, 2.6);
    return c.out(s);
  };

  /* angry — red face, hard V brows, glaring eyes, gritted teeth, steam from both ears */
  TC.ART["feel-angry"] = () => {
    const c = TC.ArtCtx(), RED = "#ff8468", RED2 = "#d9553c"; let s = "";
    const puff = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.g("#f4f6fd")}" stroke="#8d98bb" stroke-width="2.4"/>`;
    s += bust(c, { skin: RED, skin2: RED2 }) + hair(c, 100, 108, 54);
    s += arm(c, 42, 190, 22, 168, 14, RED) + arm(c, 158, 190, 178, 168, 14, RED) + st("M13 163 q2 6 0 11 M20 160 q2 7 0 13 M27 161 q2 6 0 11 M173 161 q-2 6 0 11 M180 160 q-2 7 0 13 M187 163 q-2 6 0 11", RED2, 2.2);
    s += st("M38 104 L28 94", "#8d98bb", 5) + st("M162 104 L172 94", "#8d98bb", 5);
    s += puff(38, 84, 9) + puff(28, 68, 12) + puff(14, 48, 15) + puff(34, 44, 11) + puff(162, 84, 9) + puff(172, 68, 12) + puff(186, 48, 15) + puff(166, 44, 11);
    s += `<path d="M63 100 L93 112 Q94 125 81 125 Q65 124 63 100Z" fill="#fff" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><circle cx="82" cy="116" r="5.6" fill="${INK}"/>`;
    s += `<path d="M137 100 L107 112 Q106 125 119 125 Q135 124 137 100Z" fill="#fff" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><circle cx="118" cy="116" r="5.6" fill="${INK}"/>`;
    s += st("M58 88 L94 105", INK, 9) + st("M142 88 L106 105", INK, 9);
    s += cheeks(100, 128, 40, 11, 6, "#ff2e3f", 0.5);
    s += `<path d="M76 140 Q100 129 124 140 L121 156 Q100 147 79 156Z" fill="#fff" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round"/>` + st("M78 148 Q100 138 122 148 M88 136 L89 150 M100 134 L100 148 M112 136 L111 150", INK, 2.3);
    s += `<g transform="translate(142 62)">` + st("M-11 -4 Q-4 -4 -4 -11 M4 -11 Q4 -4 11 -4 M11 4 Q4 4 4 11 M-4 11 Q-4 4 -11 4", "#fff", 9) + st("M-11 -4 Q-4 -4 -4 -11 M4 -11 Q4 -4 11 -4 M11 4 Q4 4 4 11 M-4 11 Q-4 4 -11 4", "#ff1f3a", 5) + `</g>`;
    return c.out(s);
  };

  /* tired — head drooping to one side, heavy eyelids with bags, a huge yawn behind a hand, Z z z and a moon */
  TC.ART["feel-tired"] = () => {
    const c = TC.ArtCtx(), cy = 112; let s = "";
    const zed = (x, y, k, col) => { const d = `M${x} ${y} h${k} l${-k} ${f1(k * 1.15)} h${k}`; return st(d, "#fff", f1(k * 0.62)) + st(d, col, f1(k * 0.36)); };
    s += `<path d="M34 14 A21 21 0 1 0 55 48 A16.5 16.5 0 1 1 34 14Z" fill="${c.g("#ffd21f")}" stroke="#e8a21a" stroke-width="1.6"/>` + sparkle(58, 20, 6) + sparkle(14, 62, 5);
    s += zed(136, 50, 10, "#8a6bff") + zed(151, 29, 14, "#7b5cff") + zed(170, 5, 18, "#6a4be8");
    s += `<g transform="rotate(7 100 170)">` + bust(c, { cy }) + hair(c, 100, cy, 54);
    s += st("M62 96 Q76 88 91 93", BROW, 4.6) + st("M138 96 Q124 88 109 93", BROW, 4.6);
    [78, 122].forEach((x) => {
      s += st(`M${x - 12} 108 Q${x} 98 ${x + 12} 108`, SKIN2, 2.6) + `<path d="M${x - 12} 116 Q${x} 112 ${x + 12} 116 Q${x + 11} 126 ${x} 126 Q${x - 11} 126 ${x - 12} 116Z" fill="${INK}"/><circle cx="${x - 3}" cy="121.5" r="2.2" fill="#fff" opacity=".85"/>`;
      s += st(`M${x - 14} 116 Q${x} 111 ${x + 14} 116`, INK, 4.6);
      s += st(`M${x - 10} 131 Q${x} 137 ${x + 10} 131`, "#b97f98", 3, `opacity=".75"`); });
    s += `<ellipse cx="100" cy="146" rx="13" ry="15.5" fill="${MOUTH}" stroke="${INK}" stroke-width="2.5"/><path d="M91 136 Q100 132 109 136 L108 139 Q100 137 92 139Z" fill="#fff"/><ellipse cx="100" cy="155" rx="8" ry="5" fill="${TONGUE}"/>`;
    s += arm(c, 152, 192, 130, 158, 13.5) + st("M121 153 L113 149 M121 159 L112 158 M123 165 L115 167", SKIN2, 5) + st("M121 153 L113 149 M121 159 L112 158 M123 165 L115 167", SKIN, 3.4);
    s += `</g>`;
    return c.out(s);
  };

  /* hungry — eyes on the hamburger in the thought bubble, tongue out and drooling, both hands on a rumbling tummy */
  TC.ART["feel-hungry"] = () => {
    const c = TC.ArtCtx(), cx = 72, cy = 96, R = 42; let s = "";
    s += `<rect x="30" y="134" width="84" height="84" rx="28" fill="${c.g(SHIRT)}"/><rect x="60" y="${cy + R - 14}" width="24" height="20" rx="7" fill="${SKIN2}"/>`;
    s += ear(c, cx - R - 2, cy + 5, 8.5, -1) + ear(c, cx + R + 2, cy + 5, 8.5, 1) + c.sphere(cx, cy, R, SKIN, 0.6) + hair(c, cx, cy, R);
    // thought bubble with a big hamburger
    s += `<circle cx="121" cy="97" r="4.2" fill="#fff" stroke="#8fa2d8" stroke-width="2.2"/><circle cx="129" cy="85" r="6.4" fill="#fff" stroke="#8fa2d8" stroke-width="2.4"/>`;
    s += `<ellipse cx="151" cy="44" rx="45" ry="39" fill="#fff" stroke="#8fa2d8" stroke-width="3"/>`;
    s += `<path d="M124 60 h54 q1 13 -10 13 h-34 q-11 0 -10 -13Z" fill="${c.g("#f0a850")}"/><rect x="121" y="50" width="60" height="12" rx="6" fill="${c.g("#7a3f1e")}"/>`;
    s += `<path d="M122 47 h58 l-9 10 l-9 -6 l-10 9 l-10 -9 l-10 7Z" fill="#ffd21f"/><rect x="123" y="42" width="56" height="6" rx="3" fill="#ff4b4b"/>`;
    s += `<path d="M119 44 q5.2 -7 10.4 0 q5.2 7 10.4 0 q5.2 -7 10.4 0 q5.2 7 10.4 0 q5.2 -7 10.4 0 q5.2 7 10.4 0 v-7 h-62.4Z" fill="#4fc24a"/>`;
    s += c.path("M122 40 Q123 12 151 12 Q179 12 180 40Z", "#f0a850") + c.hl(140, 22, 14, 5, -14, 0.7);
    [[138, 22], [151, 18], [164, 22], [144, 30], [158, 30], [170, 31], [132, 32]].forEach(([x, y]) => (s += `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.5" fill="#fff3d0" transform="rotate(-20 ${x} ${y})"/>`));
    // face: looking up at the food
    s += st("M46 80 Q55 73 65 78", BROW, 3.8) + st("M79 76 Q89 71 98 78", BROW, 3.8);
    [57, 88].forEach((x) => (s += `<circle cx="${x}" cy="94" r="11" fill="#fff" stroke="${INK}" stroke-width="2.4"/><circle cx="${x + 4}" cy="90" r="6.4" fill="${INK}"/><circle cx="${x + 2}" cy="87.5" r="2.3" fill="#fff"/>`));
    s += cheeks(cx, 108, 32, 8, 5);
    s += `<path d="M58 113 Q72 120 88 112 Q87 127 73 127 Q60 127 58 113Z" fill="${MOUTH}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`;
    s += `<path d="M70 120 Q72 116 80 116 Q90 117 91 126 Q91 135 82 135 Q73 134 70 120Z" fill="${TONGUE}" stroke="#d94a72" stroke-width="1.6"/>` + st("M80 120 Q83 126 82 131", "#d94a72", 1.6);
    s += `<path d="M57 114 Q52 126 54 135 Q56 140 59 135 Q61 126 60 116Z" fill="#9fdcff" stroke="#1f7fd6" stroke-width="1.4"/>`;
    // both hands on the tummy, which rumbles
    s += limb(38, 152, 56, 182, SHIRT, 15) + limb(106, 152, 88, 182, SHIRT, 15) + c.sphere(59, 184, 10.5, SKIN, 0.5) + c.sphere(85, 184, 10.5, SKIN, 0.5);
    s += st("M12 166 l9 5 l-9 5 l9 5 l-9 5", "#ff9a2e", 4.2) + st("M132 166 l-9 5 l9 5 l-9 5 l9 5", "#ff9a2e", 4.2);
    return c.out(s);
  };

  /* scared — pale blue face, hair on end, huge eyes with tiny pupils, wobbly mouth, hands on the cheeks, shaking — and a little ghost */
  TC.ART["feel-scared"] = () => {
    const c = TC.ArtCtx(), cy = 114, R = 52, PALE = "#ffdcbd", PALE2 = "#e8ab86"; let s = "";
    // the ghost in a dark puff of night
    s += `<circle cx="162" cy="40" r="36" fill="${c.g("#3a3478")}"/><circle cx="131" cy="56" r="13" fill="#2f2a66"/><circle cx="188" cy="66" r="10" fill="#2f2a66"/>`;
    s += `<path d="M142 66 Q138 12 163 12 Q188 12 184 66 q-5.25 -8 -10.5 0 q-5.25 8 -10.5 0 q-5.25 -8 -10.5 0 q-5.25 8 -10.5 0Z" fill="${c.g("#ffffff", 40, 25)}" stroke="#b9b4ee" stroke-width="2"/>`;
    s += `<ellipse cx="154" cy="34" rx="4.6" ry="6.4" fill="${INK}"/><ellipse cx="172" cy="34" rx="4.6" ry="6.4" fill="${INK}"/><ellipse cx="163" cy="49" rx="5.5" ry="6.5" fill="${INK}"/><path d="M142 44 q-9 -2 -11 -10 M184 44 q9 -2 11 -10" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    s += st("M26 96 Q17 114 26 132", "#7f8fc8", 4.5) + st("M13 90 Q1 114 13 138", "#7f8fc8", 4.5) + st("M174 96 Q183 114 174 132", "#7f8fc8", 4.5) + st("M187 90 Q199 114 187 138", "#7f8fc8", 4.5);
    s += bust(c, { cy, R, skin: PALE, skin2: PALE2 });
    s += `<path d="M${100 - R} ${cy} A${R} ${R} 0 0 1 ${100 + R} ${cy} Q100 ${cy - 6} ${100 - R} ${cy}Z" fill="${c.v("rgba(92,128,230,.75)", "rgba(92,128,230,0)")}"/>`;
    s += c.path(`M48 108 L40 74 L54 82 L52 50 L68 64 L74 34 L88 54 L100 30 L112 54 L126 34 L132 64 L148 50 L146 82 L160 74 L152 108 Q134 80 100 84 Q66 80 48 108Z`, HAIR);
    s += st("M74 98 v9 M84 95 v10 M116 95 v10 M126 98 v9 M100 94 v9", "#4a63b8", 2.4, `opacity=".7"`);
    s += st("M60 100 L84 91", BROW, 4.6) + st("M140 100 L116 91", BROW, 4.6);
    [77, 123].forEach((x) => (s += `<circle cx="${x}" cy="119" r="14.5" fill="#fff" stroke="${INK}" stroke-width="2.8"/><circle cx="${x}" cy="120" r="4.4" fill="${INK}"/><circle cx="${x - 1.5}" cy="118.4" r="1.4" fill="#fff"/>`));
    s += `<path d="M82 146 q4.5 -7 9 0 q4.5 7 9 0 q4.5 -7 9 0 q4.5 7 9 0 l0 9 q-4.5 7 -9 0 q-4.5 -7 -9 0 q-4.5 7 -9 0 q-4.5 -7 -9 0Z" fill="${MOUTH}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += drop(150, 96, 5, "#9fdcff", 20) + drop(44, 60, 4.5, "#9fdcff", -25);
    s += arm(c, 44, 190, 54, 160, 13, PALE) + arm(c, 156, 190, 146, 160, 13, PALE);
    return c.out(s);
  };

  /* the 土城 pin: on the shirt, under the chin (never on the face) */
  Object.assign(TC.SEAL, {
    "feel-happy": [100, 188, 11], "feel-sad": [100, 189, 11], "feel-angry": [100, 188, 11], "feel-tired": [97, 190, 11, 7], "feel-hungry": [72, 156, 9.5], "feel-scared": [100, 189, 11]
  });
})();
