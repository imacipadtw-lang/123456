/* =====================================================================
   Pictures for the two quiz gates "holidays" (gate 7) and "American culture"
   (gate 8) — original glossy-toy drawings in the style of js/art.js, drawn
   in code (no third-party artwork).  TC.art("hol-christmas") → data URL
     holidays   hol-christmas hol-halloween hol-thanksgiving hol-easter
                hol-newyear hol-moon hol-dragonboat hol-mother
     flags      usa-flag (13 stripes, 50 stars in rows of 6/5) flag-japan flag-germany
     buses      bus-yellow bus-red bus-blue (one drawing, three colours)
     birds      usa-eagle bird-penguin
     food       food-turkey food-zongzi food-mooncake
     trees      tree-apple tree-banana tree-coconut
     things     usa-liberty thing-torch thing-umbrella thing-icecream
     stories    usa-treat ("Trick or treat!") usa-johnny (Johnny Appleseed)
   Must load after js/art.js.
   ===================================================================== */
(function () {
  "use strict";
  const TC = window.TC;
  if (!TC || !TC.ART || !TC.ArtCtx) return;
  const A = TC.ART, S = TC.SEAL, Ctx = TC.ArtCtx;
  const SKIN = "#ffd3a8", INK = "#1b1d33", WHITE = "#fbf8ff", FONT = "Fredoka,Arial Rounded MT Bold,Arial";
  const PI = Math.PI, cos = Math.cos, sin = Math.sin;
  const f1 = (v) => +(+v).toFixed(1);
  const st = (d, col, w, extra = "") => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const G = (tr, body) => `<g transform="${tr}">${body}</g>`;
  const at = (x, y, k, body) => G(`translate(${x} ${y}) scale(${k})`, body);
  const tw = (dur = 1.4, v = "1;.35;1") => `<animate attributeName="opacity" values="${v}" dur="${dur}s" repeatCount="indefinite"/>`;
  const sway = (a, x, y, dur = 2.6) => `<animateTransform attributeName="transform" type="rotate" values="${-a} ${x} ${y};${a} ${x} ${y};${-a} ${x} ${y}" dur="${dur}s" repeatCount="indefinite"/>`;
  const bob = (dy, dur = 1.6) => `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${dy};0 0" dur="${dur}s" repeatCount="indefinite"/>`;
  const cheeks = (x, y, gap, rx = 6, ry = 3.6) => `<ellipse cx="${x - gap}" cy="${y}" rx="${rx}" ry="${ry}" fill="#ff7aa8" opacity=".55"/><ellipse cx="${x + gap}" cy="${y}" rx="${rx}" ry="${ry}" fill="#ff7aa8" opacity=".55"/>`;
  /** five-pointed star path data */
  const starD = (x, y, r, k = 0.45) => { let d = ""; for (let i = 0; i < 10; i++) { const a = (-90 + i * 36) * PI / 180, rr = i % 2 ? r * k : r; d += (i ? "L" : "M") + (+(x + cos(a) * rr).toFixed(2)) + " " + (+(y + sin(a) * rr).toFixed(2)); } return d + "Z"; };
  /** a golden flame standing on (x, y); k = 1 is about 56 high */
  const FL = "M0 0 C-22 0 -25 -22 -13 -35 C-11 -27 -5 -25 -5 -31 C-5 -43 2 -50 6 -57 C8 -44 23 -34 21 -16 C20 -4 10 0 0 0Z";
  const flame = (c, x, y, k = 1) => at(x, y, k, `<g><animateTransform attributeName="transform" type="scale" values="1 1;1.07 .93;.94 1.07;1 1" dur=".8s" repeatCount="indefinite"/>` +
    `<path d="${FL}" fill="${c.g("#ffa51f")}" stroke="#f2701b" stroke-width="2" stroke-linejoin="round"/><path d="${FL}" fill="#ffdf3d" transform="translate(1 -2) scale(.66)"/><path d="${FL}" fill="#fff9d0" transform="translate(1 -3) scale(.36)"/></g>`);
  /** a wrapped present */
  const gift = (c, x, y, w, h, col, rib) => `<rect x="${x}" y="${y + h * 0.25}" width="${w}" height="${h * 0.75}" rx="4" fill="${c.g(col)}"/><rect x="${x + w / 2 - 4}" y="${y}" width="8" height="${h}" fill="${rib}"/>` +
    `<rect x="${x - 3}" y="${y}" width="${w + 6}" height="${h * 0.3}" rx="4" fill="${c.g(col)}" stroke="#0003" stroke-width="1"/><rect x="${x + w / 2 - 4}" y="${y}" width="8" height="${h * 0.3}" fill="${rib}"/>` +
    `<ellipse cx="${x + w / 2 - 8}" cy="${y - 4}" rx="9" ry="5.5" fill="${rib}" stroke="#0003" stroke-width="1" transform="rotate(25 ${x + w / 2 - 8} ${y - 4})"/><ellipse cx="${x + w / 2 + 8}" cy="${y - 4}" rx="9" ry="5.5" fill="${rib}" stroke="#0003" stroke-width="1" transform="rotate(-25 ${x + w / 2 + 8} ${y - 4})"/><circle cx="${x + w / 2}" cy="${y - 2}" r="4.5" fill="${rib}" stroke="#0003" stroke-width="1"/>`;
  /** a pumpkin centred on (0,0), about 148 × 112 (+ stem); face = glowing jack-o'-lantern */
  const pump = (c, face) => {
    let s = `<path d="M-7 -48 Q-12 -68 2 -78 Q13 -76 10 -68 Q3 -62 8 -46Z" fill="${c.g("#3f9a3a")}"/>`;
    s += c.ell(-46, 2, 28, 46, "#ec7a17", 0, 0) + c.ell(46, 2, 28, 46, "#ec7a17", 0, 0) + c.ell(-24, 2, 28, 52, "#f98d22", 0, 0) + c.ell(24, 2, 28, 52, "#f98d22", 0, 0) + c.ell(0, 3, 24, 54, "#ffa033", 0, 0) + c.hl(-30, -30, 24, 11, -25, 0.6);
    if (face) s += `<g fill="#7a2f06"><path d="M-42 -6 L-25 -31 L-9 -6Z M42 -6 L25 -31 L9 -6Z M-8 9 L0 -5 L8 9Z M-46 14 L-31 23 L-22 14 L-11 25 L0 16 L11 25 L22 14 L31 23 L46 14 Q31 47 0 47 Q-31 47 -46 14Z"/></g>` +
      `<g fill="${c.v("#fffcc0", "#ffd21f")}">${tw(0.9, "1;.72;1;.86;1")}<path d="M-37 -9 L-25 -26 L-14 -9Z M37 -9 L25 -26 L14 -9Z M-5 6 L0 -1 L5 6Z M-40 19 L-31 26 L-22 18 L-11 28 L0 20 L11 28 L22 18 L31 26 L40 19 Q28 43 0 43 Q-28 43 -40 19Z"/></g>`;
    return s;
  };
  const bat = (x, y, k) => at(x, y, k, `<g>${bob(-5, 0.9)}<path d="M0 -4 Q-14 -22 -34 -10 Q-30 -4 -28 5 Q-22 -2 -18 7 Q-12 0 -6 9 L6 9 Q12 0 18 7 Q22 -2 28 5 Q30 -4 34 -10 Q14 -22 0 -4Z" fill="#6b46b0" stroke="#2e1a5a" stroke-width="2" stroke-linejoin="round"/>` +
    `<path d="M-8 -6 L-6 -16 L-1 -9Z M8 -6 L6 -16 L1 -9Z" fill="#7a55c2" stroke="#2e1a5a" stroke-width="1.5"/><ellipse cy="2" rx="9.5" ry="11" fill="#7a55c2" stroke="#2e1a5a" stroke-width="1.5"/><circle cx="-3.6" cy="0" r="2.8" fill="#fff"/><circle cx="3.6" cy="0" r="2.8" fill="#fff"/><circle cx="-3.2" cy=".4" r="1.3" fill="${INK}"/><circle cx="4" cy=".4" r="1.3" fill="${INK}"/><path d="M-3 6 Q0 9 3 6" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>`);
  const ghost = (c, x, y, k) => at(x, y, k, `<g>${bob(4, 1.8)}<path d="M-17 21 L-17 -4 Q-17 -25 0 -25 Q17 -25 17 -4 L17 21 Q13 14 8.5 21 Q4 14 0 21 Q-4 14 -8.5 21 Q-13 14 -17 21Z" fill="${c.g("#f4f1ff")}" stroke="#a59fe0" stroke-width="2" stroke-linejoin="round"/>` +
    `<ellipse cx="-6" cy="-7" rx="3.2" ry="4.6" fill="${INK}"/><ellipse cx="6" cy="-7" rx="3.2" ry="4.6" fill="${INK}"/><ellipse cy="4" rx="3.6" ry="4.6" fill="${INK}"/></g>`);
  /** roast turkey on a platter, in a 200 box (x 8–192, y 46–180) */
  const turkey = (c) => {
    let s = c.ell(100, 152, 92, 28, "#e9eef8", 0, 0) + `<ellipse cx="100" cy="152" rx="92" ry="28" fill="none" stroke="#aab4d0" stroke-width="1.5"/><ellipse cx="100" cy="148" rx="74" ry="18" fill="#cdd5ea"/>`;
    [[34, 146], [56, 154], [144, 154], [166, 146]].forEach(([x, y]) => (s += c.sphere(x, y, 13, "#6fd04a", 0.3)));
    const leg = (x, r) => G(`rotate(${r} ${x} 112)`, `<rect x="${x - 4.5}" y="60" width="9" height="30" rx="4" fill="#fff7e6" stroke="#d9c39a" stroke-width="1.5"/><circle cx="${x - 5}" cy="60" r="6.5" fill="#fff7e6" stroke="#d9c39a" stroke-width="1.5"/><circle cx="${x + 5}" cy="60" r="6.5" fill="#fff7e6" stroke="#d9c39a" stroke-width="1.5"/>` + c.ell(x, 112, 21, 32, "#c06a22", 0, 0.5));
    s += leg(50, -34) + leg(150, 34) + c.ell(100, 112, 62, 44, "#d98530", 0, 0) + c.hl(76, 88, 28, 13, -20, 0.75);
    s += st("M100 72 Q105 100 100 150", "#9a5216", 2.5, 'opacity=".45"') + st("M64 132 Q100 150 136 132", "#9a5216", 2.5, 'opacity=".35"');
    s += c.sphere(26, 160, 8, "#ff4d4d") + c.sphere(174, 160, 8, "#ff4d4d") + c.sphere(100, 166, 8, "#ff4d4d");
    [80, 100, 120].forEach((x, i) => (s += st(`M${x} 60 q-7 -8 0 -16 q7 -8 0 -16`, "#b9c4e0", 4, `opacity=".8"><animate attributeName="opacity" values=".2;.9;.2" dur="2s" begin="${i * 0.5}s" repeatCount="indefinite"/></path><path d="M0 0" `)));
    return s;
  };
  const maple = (x, y, k, rot, col) => G(`translate(${x} ${y}) rotate(${rot}) scale(${k})`, `<path d="M0 12 L-2 4 L-12 8 L-9 0 L-16 -4 L-8 -6 L-10 -14 L-3 -10 L0 -18 L3 -10 L10 -14 L8 -6 L16 -4 L9 0 L12 8 L2 4Z" fill="${col}" stroke="#0003" stroke-width="1" stroke-linejoin="round"/><path d="M0 18 L0 -8" stroke="#0004" stroke-width="1.2"/>`);
  /** a painted egg centred on (x,y); r = half width */
  let eggN = 0;
  const egg = (c, x, y, r, col, c2, kind, rot = 0) => {
    const id = "eg" + eggN++, d = `M0 ${f1(-r * 1.3)} C${f1(r * 0.9)} ${f1(-r * 1.3)} ${r} ${f1(r * 0.2)} ${r} ${f1(r * 0.35)} C${r} ${f1(r * 1.1)} ${-r} ${f1(r * 1.1)} ${-r} ${f1(r * 0.35)} C${-r} ${f1(r * 0.2)} ${f1(-r * 0.9)} ${f1(-r * 1.3)} 0 ${f1(-r * 1.3)}Z`;
    let p = "";
    if (kind === 0) { const z = (y0) => { let q = `M${-r} ${y0}`; for (let i = 0; i < 6; i++) q += ` l${f1(r / 6)} ${i % 2 ? r * 0.22 : -r * 0.22} l${f1(r / 6)} ${i % 2 ? -r * 0.22 : r * 0.22}`; return q; }; p = st(z(f1(-r * 0.3)), c2, r * 0.2) + st(z(f1(r * 0.3)), "#fff", r * 0.2); }
    else if (kind === 1) [[-0.45, -0.5], [0.4, -0.6], [0, 0], [-0.55, 0.35], [0.55, 0.3], [0, 0.7], [0, -0.95]].forEach(([a, b]) => (p += `<circle cx="${f1(a * r)}" cy="${f1(b * r)}" r="${f1(r * 0.17)}" fill="${c2}"/>`));
    else p = `<rect x="${-r}" y="${f1(-r * 0.62)}" width="${r * 2}" height="${f1(r * 0.3)}" fill="${c2}"/><rect x="${-r}" y="${f1(-r * 0.1)}" width="${r * 2}" height="${f1(r * 0.2)}" fill="#fff"/><rect x="${-r}" y="${f1(r * 0.34)}" width="${r * 2}" height="${f1(r * 0.3)}" fill="${c2}"/>`;
    return G(`translate(${x} ${y}) rotate(${rot})`, `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${c.g(col)}"/><g clip-path="url(#${id})" opacity=".9">${p}</g>` + c.hl(f1(-r * 0.35), f1(-r * 0.55), f1(r * 0.3), f1(r * 0.5), 15, 0.7));
  };
  /** a white bunny, head centred on (0,0) r 30; sit = with body (down to y 87) */
  const bunny = (c, sit) => {
    let s = "";
    if (sit) s += c.ell(0, 54, 32, 31, "#f4f1ff", 0, 0.3) + c.ell(0, 60, 18, 18, "#ffe6f0", 0, 0) + c.ell(-17, 81, 13, 7, WHITE, 0, 0.3) + c.ell(17, 81, 13, 7, WHITE, 0, 0.3);
    [-1, 1].forEach((d) => (s += c.ell(d * 13, -44, 10, 28, "#f4f1ff", d * 8, 0.3) + `<ellipse cx="${d * 13}" cy="-42" rx="4.6" ry="19" fill="#ffc2d6" transform="rotate(${d * 8} ${d * 13} -42)"/>`));
    return s + c.sphere(0, 0, 30, WHITE) + c.eyes(0, -1, 11, 5.8) + `<ellipse cx="0" cy="9" rx="3.6" ry="2.6" fill="#ff7aa8"/>` + c.smile(0, 12.5, 4.5) + cheeks(0, 9, 19);
  };
  /** a mooncake centred on (0,0): top face ±48 × ±20 at y −10, 22 thick */
  const mooncake = (c) => {
    let s = `<path d="M-52 -10 L-52 12 A52 23 0 0 0 52 12 L52 -10Z" fill="${c.g("#c9772a")}"/>`;
    for (let i = -4; i <= 4; i++) { const x = i * 11.5, y = f1(-10 + 23 * Math.sqrt(1 - (x / 52) * (x / 52))); s += `<path d="M${x} ${y} v21" stroke="#8f4d14" stroke-width="2.2" opacity=".5"/>`; }
    for (let i = 0; i < 16; i++) { const a = i / 16 * 2 * PI; s += `<ellipse cx="${f1(cos(a) * 47)}" cy="${f1(-10 + sin(a) * 20)}" rx="10" ry="5.5" fill="#e39a3c"/>`; }
    s += `<ellipse cx="0" cy="-10" rx="47" ry="20" fill="${c.g("#f2b85c")}"/>`;
    let f = `<circle r="35" fill="none" stroke="#b56a1f" stroke-width="3"/><circle r="7" fill="#b56a1f"/>`;
    for (let i = 0; i < 6; i++) f += `<ellipse cx="0" cy="-19" rx="7.5" ry="11" fill="none" stroke="#b56a1f" stroke-width="3" transform="rotate(${i * 60})"/>`;
    return s + G("translate(0 -10) scale(1 .43)", f) + c.hl(-20, -18, 18, 5, -8, 0.6);
  };
  /** a zongzi in a 200 box (x 14–186, y 2–168) */
  const zong = (c) => {
    let s = st("M100 22 Q94 10 104 3", "#e9d6a0", 4.5);
    s += c.path("M100 20 Q112 22 120 36 L180 146 Q188 164 168 168 L32 168 Q12 164 20 146 L80 36 Q88 22 100 20Z", "#62b53c");
    s += `<path d="M100 20 Q112 22 120 36 L180 146 Q187 161 176 166 L96 52Z" fill="#2f7f2a" opacity=".55"/><path d="M20 146 L56 80 L120 168 L32 168 Q12 164 20 146Z" fill="#8fd95a" opacity=".45"/>`;
    ["M90 40 L36 140", "M98 52 L60 162", "M70 96 L108 162", "M112 44 L168 146", "M110 70 L150 164"].forEach((d) => (s += st(d, "#c9f29a", 2, 'opacity=".55"')));
    s += st("M47 98 Q100 116 153 96", "#f4e6b8", 6) + st("M47 98 Q100 116 153 96", "#c9b070", 1.2, 'opacity=".6"') + st("M100 21 Q95 96 104 168", "#f4e6b8", 6);
    s += `<g fill="#f4e6b8" stroke="#c9b070" stroke-width="1.5"><ellipse cx="88" cy="100" rx="13" ry="7" transform="rotate(28 88 100)"/><ellipse cx="114" cy="100" rx="13" ry="7" transform="rotate(-28 114 100)"/><circle cx="100" cy="107" r="6"/></g>`;
    return s + c.hl(72, 70, 12, 26, 28, 0.55);
  };

  /* ================= holidays ================= */
  A["hol-christmas"] = () => {
    const c = Ctx(); let s = c.shadow(100, 186, 76, 9);
    s += `<rect x="89" y="150" width="22" height="36" rx="5" fill="${c.g("#8a5a34")}"/>`;
    s += c.path("M100 70 Q112 96 168 146 Q172 156 160 158 Q100 172 40 158 Q28 156 32 146 Q88 96 100 70Z", "#1f9a4c");
    s += c.path("M100 44 Q110 66 152 104 Q156 114 144 116 Q100 128 56 116 Q44 114 48 104 Q90 66 100 44Z", "#27ad57");
    s += c.path("M100 20 Q108 38 136 66 Q140 76 128 78 Q100 86 72 78 Q60 76 64 66 Q92 38 100 20Z", "#34c268");
    s += st("M68 68 Q100 84 132 66", "#ffe14d", 3.5) + st("M52 106 Q100 126 148 104", "#ffe14d", 3.5) + st("M38 148 Q100 168 162 146", "#ffe14d", 3.5);
    [[86, 58, "#ff4d5e", 7], [116, 62, "#4cc9ff", 7], [70, 98, "#ffd21f", 8], [100, 104, "#ff4d5e", 8], [130, 96, "#c07bff", 8], [56, 140, "#4cc9ff", 8], [78, 152, "#ff4d5e", 8], [128, 150, "#ffd21f", 8], [150, 138, "#ff7ab8", 8]]
      .forEach(([x, y, col, r]) => (s += c.sphere(x, y, r, col)));
    s += `<path d="${starD(100, 22, 19)}" fill="${c.g("#ffd21f")}" stroke="#f29a1b" stroke-width="2" stroke-linejoin="round">${tw(1.2, "1;.6;1")}</path>` + c.hl(96, 17, 6, 3.5, -30, 0.8);
    s += gift(c, 16, 152, 42, 36, "#ff4d5e", "#ffd21f") + gift(c, 142, 158, 40, 30, "#4c8dff", "#ffffff");
    return c.out(s);
  };
  S["hol-christmas"] = [103, 132, 8];

  A["hol-halloween"] = () => {
    const c = Ctx(); let s = c.shadow(100, 188, 78, 9);
    s += at(100, 128, 1.04, pump(c, true)) + bat(40, 36, 1.05) + ghost(c, 164, 36, 1.05);
    return c.out(s);
  };
  S["hol-halloween"] = [172, 180, 9];

  A["hol-thanksgiving"] = () => {
    const c = Ctx(); let s = c.shadow(100, 188, 90, 9);
    s += maple(22, 30, 1.25, -25, "#e8452a") + maple(178, 28, 1.25, 30, "#ff9a2e") + maple(52, 14, 0.8, 20, "#ffc21f") + maple(150, 12, 0.8, -15, "#d9772b");
    s += G("translate(10 -6) scale(.9)", turkey(c));
    s += at(34, 168, 0.3, pump(c, false));
    s += c.ell(152, 170, 40, 17, "#d99a4a", 0, 0) + `<ellipse cx="152" cy="170" rx="40" ry="17" fill="none" stroke="#a86a2a" stroke-width="2" stroke-dasharray="5 4"/>` + c.ell(152, 167, 31, 12, "#e8742a", 0, 0.5);
    s += st("M152 155 L152 179 M122 167 L182 167 M131 158 L173 176 M173 158 L131 176", "#b8521a", 1.5, 'opacity=".55"') + c.sphere(152, 164, 8, "#fffaf0", 0.5);
    s += maple(96, 186, 0.8, 80, "#e8452a");
    return c.out(s);
  };
  S["hol-thanksgiving"] = "none";

  A["hol-easter"] = () => {
    const c = Ctx(); eggN = 0; let s = c.shadow(100, 190, 88, 8);
    s += st("M100 130 Q140 14 184 130", "#b9793a", 9) + st("M100 130 Q140 14 184 130", "#e0a860", 3, 'stroke-dasharray="6 6"');
    s += at(50, 98, 1.05, bunny(c, true));
    s += egg(c, 118, 114, 16, "#ff7ab8", "#ffe14d", 0, -14) + egg(c, 166, 114, 16, "#4cc9ff", "#ffe14d", 2, 14) + egg(c, 142, 106, 18, "#ffd21f", "#ff5e7a", 1, 0);
    s += c.path("M92 124 L190 124 Q188 174 172 186 L110 186 Q94 174 92 124Z", "#dba25a");
    s += st("M96 142 Q141 150 186 142 M100 158 Q141 166 182 158 M106 174 Q141 180 176 174", "#a86a2a", 2.5) + st("M110 128 L116 184 M126 128 L129 186 M141 128 V186 M156 128 L153 186 M172 128 L166 184", "#a86a2a", 2, 'opacity=".6"');
    s += `<rect x="88" y="118" width="106" height="13" rx="6.5" fill="${c.g("#c98a44")}"/>` + egg(c, 84, 176, 12, "#7ad94e", "#fff", 0, -70);
    return c.out(s);
  };
  S["hol-easter"] = [141, 160, 8.5];

  A["hol-newyear"] = () => {
    const c = Ctx(); let s = "";
    const lantern = (x, a) => at(x, 62, 0.86, `<g>${sway(a, 0, -56)}` + st("M0 -56 V-36", "#b9793a", 3) + `<rect x="-13" y="-38" width="26" height="9" rx="3" fill="${c.g("#ffc21f")}"/><rect x="-13" y="29" width="26" height="9" rx="3" fill="${c.g("#ffc21f")}"/>` +
      c.ell(0, 0, 36, 31, "#ee2a24", 0, 0) + `<g fill="none" stroke="#a80f0c" stroke-width="2.2" opacity=".7"><ellipse rx="22" ry="31"/><ellipse rx="8" ry="31"/></g>` + c.hl(-14, -13, 13, 8, -30, 0.7) +
      st("M-5 38 V62 M0 38 V68 M5 38 V62", "#ee2a24", 3) + `<circle cy="40" r="5" fill="${c.g("#ffc21f")}"/></g>`);
    s += lantern(40, 4) + lantern(160, -4);
    s += st("M100 4 V104", "#b9793a", 3);
    for (let i = 0; i < 5; i++) { const y = 20 + i * 18; [-1, 1].forEach((d) => (s += G(`rotate(${d * 38} 100 ${y})`, `<rect x="${d > 0 ? 102 : 78}" y="${y - 5.5}" width="20" height="11" rx="3" fill="${c.g("#ee2a24")}"/><rect x="${d > 0 ? 104 : 93}" y="${y - 5.5}" width="3" height="11" fill="#ffd21f"/><rect x="${d > 0 ? 116 : 81}" y="${y - 5.5}" width="3" height="11" fill="#ffd21f"/>`))); }
    s += `<g>${tw(0.5, "1;.5;1")}<path d="${starD(100, 114, 17, 0.5)}" fill="#ff9a2e"/><path d="${starD(100, 114, 10, 0.5)}" fill="#fff3a0"/></g>`;
    [[78, 104], [124, 108], [86, 130], [118, 132]].forEach(([x, y], i) => (s += `<circle cx="${x}" cy="${y}" r="3" fill="#ffc21f">${tw(0.6 + i * 0.1, "1;0;1")}</circle>`));
    s += c.shadow(100, 190, 86, 8);
    // gold ingot
    s += at(48, 166, 1.15, `<path d="M-28 -8 Q-24 16 0 16 Q24 16 28 -8 Q14 3 0 3 Q-14 3 -28 -8Z" fill="${c.g("#ffc21f")}" stroke="#d98a0a" stroke-width="1.5" stroke-linejoin="round"/>` + c.ell(0, -3, 14, 10, "#ffd95a", 0, 0.7));
    // red envelope
    s += G("rotate(9 148 156)", `<rect x="122" y="120" width="52" height="70" rx="5" fill="${c.g("#ee2a24")}" stroke="#a80f0c" stroke-width="1.5"/><path d="M122 126 Q148 150 174 126" stroke="#ffc21f" stroke-width="2.5" fill="none"/><rect x="126" y="124" width="44" height="62" rx="3" fill="none" stroke="#ffc21f" stroke-width="1.2" opacity=".7"/>` +
      `<circle cx="148" cy="161" r="15" fill="${c.g("#ffc21f")}"/><text x="148" y="168.5" text-anchor="middle" font-family="'Noto Sans TC','Microsoft JhengHei','PingFang TC','Heiti TC','Noto Sans CJK TC',sans-serif" font-weight="900" font-size="20" fill="#c4170c">福</text>`);
    return c.out(s);
  };
  S["hol-newyear"] = [98, 174, 8];

  A["hol-moon"] = () => {
    const c = Ctx(); let s = c.hl(100, 72, 86, 86, 0, 0.55) + c.shadow(100, 190, 90, 8);
    s += c.sphere(100, 72, 60, "#ffe066", 0.6) + `<circle cx="100" cy="72" r="60" fill="none" stroke="#f2b01f" stroke-width="1.5" opacity=".6"/>`;
    [[122, 50, 12, 9], [80, 92, 15, 11], [126, 98, 8, 6], [92, 44, 6, 5]].forEach(([x, y, rx, ry]) => (s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#f2bd3a" opacity=".5"/>`));
    const cloud = (x, y, k) => at(x, y, k, c.sphere(-18, 4, 13, "#e3ebff", 0.4) + c.sphere(0, -3, 17, "#e3ebff", 0.4) + c.sphere(19, 4, 13, "#e3ebff", 0.4) + `<rect x="-30" y="4" width="60" height="13" rx="6.5" fill="#cfd9f5"/>`);
    s += cloud(34, 96, 1) + cloud(176, 40, 0.75);
    // pomelo
    s += at(42, 154, 1, `<path d="M-2 -34 Q-18 -50 -32 -40 Q-22 -28 -2 -34Z" fill="${c.g("#3fa53a")}"/>` + c.path("M0 -36 Q15 -31 23 -6 Q35 25 0 29 Q-35 25 -23 -6 Q-15 -31 0 -36Z", "#c3df4a") + c.hl(-10, -10, 8, 14, 15, 0.6) + `<rect x="-2.5" y="-41" width="5" height="8" rx="2" fill="#7a5a2a"/>`);
    s += at(102, 164, 0.62, mooncake(c)) + at(162, 128, 0.62, bunny(c, true));
    return c.out(s);
  };
  S["hol-moon"] = [42, 162, 7.5, -6, "sticker"];

  A["hol-dragonboat"] = () => {
    const c = Ctx(); let s = "";
    const wave = (y, amp, col, dur) => { let d = `M-40 ${y}`; for (let i = 0; i < 7; i++) d += ` q10 ${-amp} 20 0 t20 0`; return `<path d="${d} V200 H-40Z" fill="${col}"><animateTransform attributeName="transform" type="translate" values="0 0;40 0" dur="${dur}s" repeatCount="indefinite"/></path>`; };
    s += wave(148, 7, "#8fd6ff", 3.2);
    let b = "";
    // tail
    b += c.path("M30 126 Q4 122 8 94 Q12 80 24 88 Q16 98 24 108 Q32 116 44 124Z", "#2fb457") + `<path d="M8 94 L0 84 L12 84 L12 72 L22 84Z" fill="#ffc21f"/>`;
    // head
    b += `<path d="M150 62 L140 76 L152 76 L144 92 L158 88 L152 104 L168 96Z" fill="#ee2a24"/>`;
    b += c.path("M146 126 Q162 118 160 92 L184 98 Q190 132 158 152 L146 152Z", "#2fb457");
    b += `<path d="M158 62 L150 40 L166 56Z M172 58 L172 36 L182 56Z" fill="${c.g("#ffc21f")}" stroke="#d98a0a" stroke-width="1"/>`;
    b += c.ell(170, 78, 22, 19, "#35c060", 0, 0.5) + c.ell(188, 86, 13, 10, "#4fd47a", 0, 0.4);
    b += `<path d="M178 92 Q190 100 199 90 L196 97 Q188 106 176 98Z" fill="#c4170c"/><path d="M184 94 l2 4 l2 -3 l2 4 l2 -4" stroke="#fff" stroke-width="1.6" fill="none"/>`;
    b += `<circle cx="168" cy="74" r="7.5" fill="#fff"/><circle cx="170" cy="75" r="4" fill="${INK}"/><circle cx="168.6" cy="73.4" r="1.4" fill="#fff"/><circle cx="194" cy="82" r="1.6" fill="#14602f"/>` + st("M194 88 Q204 84 202 72", "#ee2a24", 2.5) + st("M160 64 Q170 60 178 66", "#14602f", 2.5);
    // rowers
    [[58, "#ffd21f"], [92, "#4cc9ff"], [126, "#ff7ab8"]].forEach(([x, col], i) => {
      b += `<rect x="${x - 10}" y="104" width="20" height="24" rx="7" fill="${c.g(col)}"/>` + c.sphere(x, 94, 11.5, SKIN, 0.5) + `<path d="M${x - 11.5} 92 Q${x - 10} 81 ${x} 81.500 Q${x + 10} 81 ${x + 11.5} 92 Q${x} 86 ${x - 11.5} 92Z" fill="#3a2a1c"/><path d="M${x - 11} 90 Q${x} 85 ${x + 11} 90" stroke="#ee2a24" stroke-width="3" fill="none"/>`;
      b += `<circle cx="${x - 3}" cy="96" r="1.8" fill="${INK}"/><circle cx="${x + 5}" cy="96" r="1.8" fill="${INK}"/><path d="M${x - 2} 100 Q${x + 1.5} 103 ${x + 5} 100" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    });
    // hull
    b += c.path("M26 122 L162 122 Q162 146 146 154 L48 154 Q30 148 26 122Z", "#ee2a24") + st("M27 124 H161", "#ffc21f", 5);
    for (let x = 40; x < 140; x += 14) b += st(`M${x} 134 q7 11 14 0`, "#ffc21f", 2.5);
    [58, 92, 126].forEach((x, i) => (b += `<g>${sway(7, x + 6, 110, 1.2)}` + st(`M${x + 4} 110 L${x + 22} 156`, "#8a5a34", 4.5) + `<ellipse cx="${x + 24}" cy="161" rx="5.5" ry="10" fill="#b9793a" transform="rotate(-21 ${x + 24} 161)"/>` + c.sphere(x + 6, 113, 5, SKIN, 0.3) + `</g>`));
    s += G("translate(-3 6) scale(.95)", `<g>${bob(-2.5, 1.6)}${b}</g>`);
    s += wave(164, 6, "#3fa9f5", 2.2) + `<g opacity=".7">${st("M20 180 q8 -5 16 0 M90 186 q8 -5 16 0 M150 178 q8 -5 16 0", "#d6f0ff", 2.5)}</g>`;
    s += at(6, 2, 0.36, zong(c));
    return c.out(s);
  };
  S["hol-dragonboat"] = "none";

  const frill = (r, n, rot, k = 0.84) => { let d = ""; for (let i = 0; i < n * 2; i++) { const a = rot + i * PI / n, rr = i % 2 ? r * k : r; d += (i ? "L" : "M") + f1(cos(a) * rr) + " " + f1(sin(a) * rr); } return d + "Z"; };
  const carnation = (c, x, y, r, col, col2, col3) => at(x, y, 1, `<path d="${frill(r, 12, 0)}" fill="${c.g(col)}" stroke="${col}" stroke-width="2" stroke-linejoin="round"/><path d="${frill(r * 0.72, 10, 0.3)}" fill="${col2}" stroke="${col2}" stroke-width="2" stroke-linejoin="round"/><path d="${frill(r * 0.44, 8, 0.1)}" fill="${col3}" stroke="${col3}" stroke-width="2" stroke-linejoin="round"/><path d="${frill(r * 0.18, 5, 0.5)}" fill="${col}"/>` + c.hl(f1(-r * 0.35), f1(-r * 0.4), f1(r * 0.36), f1(r * 0.2), -30, 0.45));
  const HEART = "M0 26 C-36 2 -31 -27 -13 -27 C-5 -27 0 -21 0 -16 C0 -21 5 -27 13 -27 C31 -27 36 2 0 26Z";
  A["hol-mother"] = () => {
    const c = Ctx(); let s = c.shadow(96, 190, 70, 8);
    s += st("M52 70 L92 150 M96 60 L96 150 M136 76 L100 150", "#3f9a3a", 5);
    s += c.ell(40, 104, 16, 7, "#4cc95a", 35, 0.3) + c.ell(140, 110, 16, 7, "#4cc95a", -40, 0.3) + c.ell(112, 96, 14, 6, "#3fb54a", -60, 0.3);
    s += carnation(c, 50, 62, 30, "#f0356b", "#ff6f9a", "#ffa8c4") + carnation(c, 136, 68, 30, "#ff5c8a", "#ff8fb0", "#ffc2d6") + carnation(c, 94, 40, 32, "#e81f4f", "#ff5c7f", "#ff9ab4");
    s += c.path("M46 100 Q94 122 142 100 L108 184 Q96 192 84 184Z", "#ffe9b8") + `<path d="M46 100 Q94 122 142 100 L132 124 Q94 140 56 124Z" fill="#ffd38a" opacity=".7"/>` + st("M70 132 L88 182 M118 132 L104 182", "#e9b96a", 2, 'opacity=".7"');
    s += `<g fill="${c.g("#ff4d6d")}" stroke="#c4173c" stroke-width="1.2"><ellipse cx="80" cy="160" rx="14" ry="8" transform="rotate(20 80 160)"/><ellipse cx="110" cy="160" rx="14" ry="8" transform="rotate(-20 110 160)"/><path d="M92 164 L84 188 L94 182 L96 166Z M98 164 L108 188 L98 182 L96 166Z"/><circle cx="95" cy="161" r="6.5"/></g>`;
    s += G("translate(152 150) rotate(10) scale(1.2)", `<path d="${HEART}" fill="#fff" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><path d="${HEART}" fill="${c.g("#ff3b5e")}" stroke="#c4173c" stroke-width="1.5"/>` + c.hl(-14, -15, 9, 5, -30, 0.7) +
      `<text x="0" y="3" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="15" fill="#fff">MOM</text>`);
    s += `<path d="${HEART}" fill="#ff7aa8" transform="translate(178 96) scale(.3)">${tw(1.3)}</path><path d="${HEART}" fill="#ff7aa8" transform="translate(16 140) scale(.26)">${tw(1.7)}</path>`;
    return c.out(s);
  };
  S["hol-mother"] = [95, 130, 6.5, 0, "sticker"];

  /* ================= flags (no school seal on a national flag) ================= */
  const FX = 18, FY = 30, FW = 176, FH = 110;
  function flag(inner) {
    const c = Ctx();
    let s = c.shadow(16, 190, 20, 5) + `<rect x="9" y="14" width="9" height="176" rx="4.5" fill="${c.v("#eef2fb", "#8a93b0")}" stroke="#6f7896" stroke-width="1"/>` + c.sphere(13.5, 12, 8.5, "#ffc21f");
    s += `<defs><linearGradient id="fs" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".1"/><stop offset=".22" stop-color="#fff" stop-opacity=".14"/><stop offset=".48" stop-color="#000" stop-opacity=".08"/><stop offset=".74" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient><clipPath id="fc"><rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" rx="1.5"/></clipPath></defs>`;
    s += `<g transform="translate(${FX} ${FY + FH / 2})"><g><animateTransform attributeName="transform" type="skewY" values="-1.4;1.4;-1.4" dur="3.2s" repeatCount="indefinite"/><g transform="translate(${-FX} ${-(FY + FH / 2)})">` +
      `<g clip-path="url(#fc)">${inner}<rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" fill="url(#fs)"/></g><rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" rx="1.5" fill="none" stroke="#7d86a8" stroke-width="1.2"/></g></g></g>`;
    return c.out(s);
  }
  A["usa-flag"] = () => {
    const sh = FH / 13, cw = FW * 0.4, ch = sh * 7;
    let s = `<rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" fill="#c8102e"/>`;
    for (let i = 1; i < 13; i += 2) s += `<rect x="${FX}" y="${+(FY + i * sh).toFixed(2)}" width="${FW}" height="${+sh.toFixed(2)}" fill="#fff"/>`;   // 7 red + 6 white
    s += `<rect x="${FX}" y="${FY}" width="${cw}" height="${+ch.toFixed(2)}" fill="#2a3580"/><path id="us" d="${starD(0, 0, 2.9, 0.4)}" fill="#fff"/>`;
    for (let r = 0; r < 9; r++) for (let j = 0; j < (r % 2 ? 5 : 6); j++)                                                                              // 6,5,6,5,6,5,6,5,6 = 50
      s += `<use href="#us" x="${+(FX + (2 * j + 1 + (r % 2)) * cw / 12).toFixed(2)}" y="${+(FY + (r + 1) * ch / 10).toFixed(2)}"/>`;
    return flag(s);
  };
  A["flag-japan"] = () => flag(`<rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" fill="#fff"/><circle cx="${FX + FW / 2}" cy="${FY + FH / 2}" r="${FH * 0.3}" fill="#bc002d"/>`);
  A["flag-germany"] = () => flag(`<rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" fill="#dd0000"/><rect x="${FX}" y="${FY}" width="${FW}" height="${+(FH / 3).toFixed(2)}" fill="#000"/><rect x="${FX}" y="${+(FY + FH * 2 / 3).toFixed(2)}" width="${FW}" height="${+(FH / 3).toFixed(2)}" fill="#ffce00"/>`);
  S["usa-flag"] = S["flag-japan"] = S["flag-germany"] = "none";

  /* ================= school bus in three colours ================= */
  const bus = (col) => () => {
    const c = Ctx(), T = "#2b2f45"; let s = c.shadow(102, 174, 92, 9);
    s += `<rect x="186" y="136" width="10" height="12" rx="3" fill="${c.g("#aab4d0")}"/><rect x="8" y="138" width="10" height="10" rx="3" fill="${c.g("#aab4d0")}"/>`;
    s += c.path("M14 60 Q14 46 28 46 L130 46 Q144 46 148 60 L156 96 L178 100 Q192 102 192 116 L192 144 Q192 154 182 154 L24 154 Q14 154 14 144Z", col);
    s += c.hl(72, 54, 54, 6, 0, 0.65);
    [24, 50, 76, 102].forEach((x, i) => {
      s += `<rect x="${x}" y="60" width="22" height="30" rx="5" fill="${c.v("#d9f3ff", "#7cc8f5")}" stroke="${T}" stroke-width="2.5"/>`;
      if (i % 2 === 0) s += c.sphere(x + 11, 79, 8, SKIN, 0.4) + `<path d="M${x + 3} 77 Q${x + 4} 69 ${x + 11} 69.500 Q${x + 18} 69 ${x + 19} 77 Q${x + 11} 72 ${x + 3} 77Z" fill="${i ? "#3a2a1c" : "#8a4a1c"}"/><circle cx="${x + 8}" cy="80" r="1.4" fill="${INK}"/><circle cx="${x + 14}" cy="80" r="1.4" fill="${INK}"/><path d="M${x + 8} 83.500 Q${x + 11} 86 ${x + 14} 83.500" stroke="${INK}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
    });
    s += `<path d="M130 60 L139 60 Q143 60 144.500 65 L151 92 L130 92Z" fill="${c.v("#d9f3ff", "#7cc8f5")}" stroke="${T}" stroke-width="2.5" stroke-linejoin="round"/>`;
    s += `<rect x="14" y="100" width="142" height="5" fill="${T}"/><rect x="14" y="110" width="178" height="3" fill="${T}" opacity=".85"/>`;
    s += `<circle cx="184" cy="124" r="6.5" fill="#fff6b0" stroke="${T}" stroke-width="2"/><rect x="14" y="118" width="6" height="13" rx="2" fill="#ff3b3b"/><circle cx="34" cy="46" r="4" fill="#ff3b3b"/><circle cx="126" cy="46" r="4" fill="#ffb01f"/>`;
    s += `<circle cx="52" cy="154" r="23" fill="#0005"/><circle cx="152" cy="154" r="23" fill="#0005"/>` + c.wheel(52, 156, 19) + c.wheel(152, 156, 19);
    return c.out(s);
  };
  [["yellow", "#ffc21f"], ["red", "#f0413c"], ["blue", "#3f8cff"]].forEach(([n, col]) => { A["bus-" + n] = bus(col); S["bus-" + n] = [102, 133, 8.5, 0, "print"]; });

  /* ================= birds ================= */
  A["usa-eagle"] = () => {
    const c = Ctx(); let s = c.shadow(100, 192, 70, 7);
    s += c.path("M80 156 L72 192 L88 185 L100 196 L112 185 L128 192 L120 156Z", "#f4f1ff") + st("M88 185 L92 164 M112 185 L108 164 M100 196 V166", "#b9b3d9", 1.5);
    s += st("M14 174 Q100 164 186 176", "#8a5a34", 11) + st("M20 171 Q100 161 180 173", "#b9824a", 3, 'opacity=".7"');
    s += c.path("M62 104 Q20 96 10 142 Q20 138 25 148 Q32 142 38 153 Q45 146 52 157 Q60 150 68 160Z", "#4a2f1c") + c.path("M138 104 Q180 96 190 142 Q180 138 175 148 Q168 142 162 153 Q155 146 148 157 Q140 150 132 160Z", "#4a2f1c");
    s += c.ell(100, 132, 45, 42, "#6b4427", 0, 0.35);
    s += st("M76 126 q8 8 16 0 q8 8 16 0 q8 8 16 0 M84 142 q8 8 16 0 q8 8 16 0", "#8f6238", 2.5);
    [84, 116].forEach((x) => (s += c.ell(x - 8, 171, 5, 8, "#ffc21f", 12, 0.4) + c.ell(x + 8, 171, 5, 8, "#ffc21f", -12, 0.4) + c.ell(x, 173, 5, 8.5, "#ffc21f", 0, 0.4)));
    s += `<path d="M60 84 L68 108 L79 97 L89 112 L100 99 L111 112 L121 97 L132 108 L140 84Z" fill="#f4f1ff" stroke="#d9d4ee" stroke-width="1"/>`;
    s += `<path d="M88 30 L92 12 L100 24 L108 10 L112 30Z" fill="#f4f1ff"/>` + c.sphere(100, 66, 42, WHITE, 0.7);
    [-1, 1].forEach((d) => (s += `<circle cx="${100 + d * 20}" cy="62" r="11" fill="#ffc21f"/>`));
    s += c.eyes(100, 62, 20, 8) + st("M68 50 Q80 49 92 54", "#4a2f1c", 4.5) + st("M132 50 Q120 49 108 54", "#4a2f1c", 4.5);
    s += `<path d="M85 74 Q100 65 115 74 Q119 89 107 100 Q103 105 100 113 Q97 105 93 100 Q81 89 85 74Z" fill="${c.g("#ffc21f")}" stroke="#d98a0a" stroke-width="1.5" stroke-linejoin="round"/>` + st("M89 88 Q100 95 111 88", "#c97a0a", 2) + `<circle cx="95" cy="79" r="1.5" fill="#c97a0a"/><circle cx="105" cy="79" r="1.5" fill="#c97a0a"/>` + c.hl(94, 76, 6, 3, -20, 0.7);
    s += cheeks(100, 82, 30, 7, 4);
    return c.out(s);
  };
  S["usa-eagle"] = [100, 146, 8.5];

  A["bird-penguin"] = () => {
    const c = Ctx(), K = "#3f4878"; let s = c.shadow(100, 190, 62, 8);
    s += c.ell(76, 182, 20, 9, "#ff9a2e", -8, 0.4) + c.ell(124, 182, 20, 9, "#ff9a2e", 8, 0.4);
    s += `<g>${sway(6, 50, 96, 1.4)}${c.ell(38, 124, 13, 38, K, 22, 0.3)}</g><g>${sway(6, 150, 96, 1.4)}${c.ell(162, 124, 13, 38, K, -22, 0.3)}</g>`;
    s += c.path("M100 12 C150 12 164 80 160 124 C158 166 136 184 100 184 C64 184 42 166 40 124 C36 80 50 12 100 12Z", K) + c.hl(76, 34, 20, 10, -30, 0.5);
    s += c.path("M100 58 C116 38 144 48 141 78 C139 92 147 110 147 130 C147 164 126 178 100 178 C74 178 53 164 53 130 C53 110 61 92 59 78 C56 48 84 38 100 58Z", WHITE);
    s += c.eyes(100, 74, 20, 9) + `<path d="M86 87 Q100 79 114 87 Q100 107 86 87Z" fill="${c.g("#ff9a2e")}" stroke="#d9701a" stroke-width="1.2" stroke-linejoin="round"/>` + st("M90 89 Q100 92 110 89", "#c9601a", 1.6) + cheeks(100, 92, 33, 8, 4.5);
    return c.out(s);
  };
  S["bird-penguin"] = [100, 142, 11];

  /* ================= food ================= */
  A["food-turkey"] = () => { const c = Ctx(); return c.out(c.shadow(100, 184, 92, 9) + turkey(c)); };
  S["food-turkey"] = [100, 172.5, 6, 0, "print"];

  A["food-zongzi"] = () => {
    const c = Ctx(); let s = c.shadow(96, 150, 78, 9) + c.shadow(150, 184, 46, 7);
    s += G("translate(-2 -8) scale(.9)", zong(c));
    s += at(150, 160, 1, `<path d="M-46 14 Q-30 -12 -4 8 Q18 -14 46 12 Q30 30 0 26 Q-30 32 -46 14Z" fill="${c.g("#62b53c")}"/><path d="M-40 14 Q-20 4 0 14 M6 12 Q24 2 40 12" stroke="#c9f29a" stroke-width="1.6" fill="none" opacity=".7"/>` +
      c.path("M0 -36 Q7 -35 11 -27 L31 7 Q35 18 24 20 L-24 20 Q-35 18 -31 7 L-11 -27 Q-7 -35 0 -36Z", "#edc790") + c.sphere(0, 4, 8, "#ffa51f", 0.6) +
      `<ellipse cx="-13" cy="10" rx="5" ry="3.5" fill="#7a4a2a"/><ellipse cx="14" cy="11" rx="4" ry="3" fill="#b8793a"/><ellipse cx="-3" cy="-14" rx="3.5" ry="2.6" fill="#b8793a"/><ellipse cx="6" cy="-20" rx="2" ry="1.5" fill="#fff" opacity=".7"/>` + c.hl(-9, -16, 5, 9, 28, 0.55));
    return c.out(s);
  };
  S["food-zongzi"] = [50, 174, 10];

  A["food-mooncake"] = () => {
    const c = Ctx(); let s = c.shadow(86, 132, 76, 10) + c.shadow(132, 178, 62, 8);
    s += at(84, 86, 1.3, mooncake(c));
    let h = `<path d="M-46 -8 A46 19 0 0 1 46 -8Z" fill="${c.g("#f2b85c")}"/>`;
    for (let i = 8; i <= 16; i++) { const a = i / 16 * 2 * PI; h += `<ellipse cx="${f1(cos(a) * 45)}" cy="${f1(-8 + sin(a) * 18)}" rx="9" ry="5" fill="#e39a3c"/>`; }
    h += `<path d="M-46 -8 A46 19 0 0 1 46 -8Z" fill="${c.g("#f2b85c")}"/><rect x="-50" y="-9" width="100" height="32" rx="7" fill="${c.g("#e39a3c")}"/><rect x="-44" y="-4" width="88" height="22" rx="4" fill="#6b2f1a"/>` +
      c.sphere(0, 7, 10, "#ffa51f", 0.7) + `<circle cx="0" cy="7" r="10" fill="none" stroke="#ffd21f" stroke-width="1.5"/>`;
    s += at(132, 148, 1.2, h);
    return c.out(s);
  };
  S["food-mooncake"] = [34, 166, 10];

  /* ================= trees ================= */
  A["tree-apple"] = () => {
    const c = Ctx(); let s = c.shadow(100, 190, 62, 9);
    s += c.path("M86 190 Q92 150 84 116 L116 116 Q108 150 114 190Z", "#8a5a34") + st("M98 150 Q100 170 96 186", "#6b4324", 2, 'opacity=".6"');
    s += c.sphere(56, 96, 38, "#34a843", 0.4) + c.sphere(144, 96, 38, "#34a843", 0.4) + c.sphere(100, 108, 40, "#3fb54a", 0.3) + c.sphere(72, 58, 36, "#44bf52", 0.5) + c.sphere(128, 58, 36, "#3fb54a", 0.5) + c.sphere(100, 44, 34, "#4cc95a", 0.6);
    [[56, 84], [94, 42], [132, 60], [152, 104], [102, 92], [70, 122], [126, 126], [36, 110]].forEach(([x, y]) => (s += st(`M${x} ${y - 9} q1 -5 4 -7`, "#6b4324", 2.2) + c.sphere(x, y, 10.5, "#ff3030", 0.85)));
    return c.out(s);
  };
  S["tree-apple"] = [100, 166, 7.5];

  const leafP = (L, w) => `M0 0 C${f1(L * 0.2)} ${-w} ${f1(L * 0.75)} ${-w} ${L} 0 C${f1(L * 0.75)} ${w} ${f1(L * 0.2)} ${f1(w * 0.8)} 0 0Z`;
  A["tree-banana"] = () => {
    const c = Ctx(); let s = c.shadow(100, 190, 60, 9);
    const leaf = (a, L, col) => G(`translate(100 84) rotate(${a})`, c.path(leafP(L, 20), col) + st(`M2 0 H${L - 4}`, "#c9f29a", 2.5) + st([0.3, 0.45, 0.6, 0.75].map((t) => `M${f1(L * t)} 0 l5 -15 M${f1(L * t)} 0 l5 14`).join(" "), "#1f7a2e", 1.3, 'opacity=".5"'));
    s += leaf(168, 70, "#2f9f3f") + leaf(12, 70, "#2f9f3f") + leaf(-150, 84, "#3fb54a") + leaf(-30, 84, "#3fb54a");
    s += c.path("M86 190 Q94 130 91 84 L109 84 Q107 130 114 190Z", "#9ad44f") + st("M96 100 Q98 150 94 186 M104 100 Q103 150 107 186", "#5f9a2e", 1.8, 'opacity=".6"');
    s += leaf(-118, 84, "#4cc95a") + leaf(-62, 84, "#4cc95a") + leaf(-90, 70, "#3fb54a");
    s += st("M104 88 Q134 86 136 106", "#6f9a2e", 6);
    const fin = `<path d="M-4.500 0 Q-8 14 -3 26 Q0 30 3 26 Q8 14 4.500 0Z" fill="${c.g("#ffd21f")}" stroke="#c98a0a" stroke-width="1.3"/><path d="M-2 26 Q0 31 2 26Z" fill="#6b4324"/>`;
    [[106, [-62, -32, 0, 32, 62]], [124, [-50, -17, 17, 50]], [140, [-30, 0, 30]]].forEach(([y, as]) => as.forEach((a) => (s += G(`translate(136 ${y}) rotate(${-a})`, fin))));
    s += `<path d="M136 162 Q146 174 136 186 Q126 174 136 162Z" fill="${c.g("#9a2f6b")}"/>`;
    return c.out(s);
  };
  S["tree-banana"] = [70, 176, 9];

  A["tree-coconut"] = () => {
    const c = Ctx(); let s = c.ell(100, 182, 84, 14, "#f4d58a", 0, 0.3);
    s += st("M92 180 Q82 120 108 62", "#b9824a", 17) + st("M92 180 Q82 120 108 62", "#8f5f30", 17, 'stroke-dasharray="2.500 11" stroke-linecap="butt" opacity=".7"').replace('stroke-linecap="round"', "") + st("M88 176 Q78 120 102 66", "#e0b070", 3, 'opacity=".6"');
    const frond = (a, L, col) => G(`translate(108 60) rotate(${a})${cos(a * PI / 180) < 0 ? " scale(1 -1)" : ""}`, c.path(`M0 0 Q${f1(L * 0.5)} -30 ${L} 8 Q${f1(L * 0.5)} -6 0 0Z`, col) + st(`M2 -1 Q${f1(L * 0.5)} -19 ${L - 3} 7`, "#c9f29a", 1.8, 'opacity=".8"') +
      st([0.3, 0.45, 0.6, 0.75].map((t) => `M${f1(L * t)} ${f1(-14 * t - 3)} l7 12`).join(" "), "#1f7a2e", 1.4, 'opacity=".55"'));
    s += frond(165, 74, "#2f9f3f") + frond(15, 74, "#2f9f3f") + frond(-160, 78, "#3fb54a") + frond(-20, 78, "#3fb54a") + frond(-125, 70, "#4cc95a") + frond(-55, 70, "#4cc95a") + frond(-90, 52, "#3fb54a");
    s += c.sphere(96, 72, 11.5, "#7a4a2a", 0.5) + c.sphere(119, 74, 11.5, "#7a4a2a", 0.5) + c.sphere(107, 84, 12, "#8a5632", 0.5);
    return c.out(s);
  };
  S["tree-coconut"] = [150, 180, 8];

  /* ================= things ================= */
  A["usa-liberty"] = () => {
    const c = Ctx(), CU = "#6fc7ad", DK = "#2f8a72", LT = "#a6ead6"; let s = "";
    // raised arm + torch
    s += st("M86 134 Q50 126 40 78", "#58b89c", 21) + st("M92 124 Q62 122 52 96", DK, 2.5, 'opacity=".5"');
    s += c.path("M32 92 L46 92 L44 56 L34 56Z", "#58b89c") + c.sphere(39, 76, 11.5, CU, 0.5) + st("M30 72 H48 M30 78 H48", DK, 1.6, 'opacity=".5"');
    s += flame(c, 39, 44, 0.66) + c.path("M21 42 L57 42 L50 58 L28 58Z", "#58b89c") + `<rect x="18" y="38" width="42" height="7" rx="3.500" fill="${c.g(LT)}"/>`;
    // robe
    s += c.path("M114 106 Q66 112 58 152 L50 200 L182 200 L174 152 Q164 112 114 106Z", CU);
    s += st("M86 130 Q112 160 100 200 M124 118 Q150 150 138 200 M70 152 Q82 176 74 200", DK, 3, 'opacity=".45"') + `<rect x="103" y="96" width="22" height="18" rx="6" fill="#58b89c"/>`;
    // left arm + tablet
    s += st("M158 126 Q178 156 150 170", "#58b89c", 17);
    s += G("rotate(-12 152 150)", `<rect x="132" y="116" width="42" height="58" rx="4" fill="${c.g(LT)}" stroke="${DK}" stroke-width="2"/>` + st("M141 130 H165 M141 140 H165 M141 150 H158", DK, 2.5, 'opacity=".6"'));
    s += c.sphere(137, 166, 10, CU, 0.5);
    // crown: 7 rays
    for (let i = 0; i < 7; i++) { const a = (-150 + i * 20) * PI / 180, bx = 114 + cos(a) * 25, by = 70 + sin(a) * 25, px = -sin(a) * 5.5, py = cos(a) * 5.5;
      s += `<path d="M${f1(bx - px)} ${f1(by - py)} L${f1(114 + cos(a) * 54)} ${f1(70 + sin(a) * 54)} L${f1(bx + px)} ${f1(by + py)}Z" fill="${c.g(LT)}" stroke="${DK}" stroke-width="1.3" stroke-linejoin="round"/>`; }
    s += c.sphere(88, 86, 9, "#58b89c", 0.3) + c.sphere(140, 86, 9, "#58b89c", 0.3) + c.sphere(114, 78, 28, CU, 0.6);
    s += c.path("M86 80 Q84 49 114 49 Q144 49 142 80 Q136 63 114 63 Q92 63 86 80Z", "#58b89c");
    s += `<path d="M87 67 Q114 51 141 67 L141 74 Q114 58 87 74Z" fill="${c.g(LT)}" stroke="${DK}" stroke-width="1.3"/>`;
    s += c.eyes(114, 84, 10.5, 5.6, "#1f5a4a") + c.smile(114, 94, 5, "#1f5a4a") + `<ellipse cx="97" cy="92" rx="6" ry="3.6" fill="#fff" opacity=".35"/><ellipse cx="131" cy="92" rx="6" ry="3.6" fill="#fff" opacity=".35"/>`;
    return c.out(s);
  };
  S["usa-liberty"] = [26, 178, 10];

  A["thing-torch"] = () => {
    const c = Ctx(); let s = c.shadow(100, 192, 34, 6);
    s += c.path("M83 98 L117 98 L107 184 Q100 192 93 184Z", "#b9793a") + st("M86 112 H114 M89 140 H111", "#7a4a1c", 2.5, 'opacity=".6"');
    s += flame(c, 100, 74, 1.18);
    s += c.path("M64 72 L136 72 L120 102 L80 102Z", "#8a93b0") + `<rect x="60" y="66" width="80" height="11" rx="5.500" fill="${c.g("#cfd7ea")}"/>` + c.hl(84, 86, 8, 10, 20, 0.6);
    [[58, 40, 3.5], [144, 30, 3], [150, 56, 2.5], [52, 18, 2.5]].forEach(([x, y, r], i) => (s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffc21f">${tw(0.8 + i * 0.2, "1;.1;1")}</circle>`));
    return c.out(s);
  };
  S["thing-torch"] = [100, 126, 6.5, 0, "print"];

  A["thing-umbrella"] = () => {
    const c = Ctx(), CAN = "M14 100 Q16 30 100 24 Q184 30 186 100 Q172 86 157 100 Q143 86 129 100 Q114 86 100 100 Q86 86 71 100 Q57 86 43 100 Q28 86 14 100Z";
    const X = [14, 43, 71, 100, 129, 157, 186], cx = (x) => f1((100 + x) / 2 + (x - 100) * 0.16);
    let u = st("M100 96 V168 Q100 187 86 187 Q73 187 73 173", "#8a5a34", 7) + `<rect x="96.500" y="10" width="7" height="18" rx="3.500" fill="${c.g("#aab4d0")}"/>`;
    u += `<clipPath id="uc"><path d="${CAN}"/></clipPath><path d="${CAN}" fill="${c.g("#ff4d5e", 40, 20)}"/><g clip-path="url(#uc)">`;
    [1, 3, 5].forEach((i) => (u += `<path d="M100 24 Q${cx(X[i])} 48 ${X[i]} 100 L${X[i]} 110 L${X[i + 1]} 110 L${X[i + 1]} 100 Q${cx(X[i + 1])} 48 100 24Z" fill="${c.g("#ffd21f", 40, 10)}"/>`));
    u += `</g>` + X.slice(1, 6).map((x) => st(`M100 24 Q${cx(x)} 48 ${x} 100`, "#0003", 1.5)).join("") + c.hl(66, 50, 26, 10, -35, 0.6);
    let s = c.shadow(100, 192, 50, 6) + G("rotate(-12 100 100)", u);
    [[22, 150], [40, 178], [166, 132], [180, 168], [140, 176]].forEach(([x, y]) => (s += `<path d="M${x} ${y - 9} Q${x + 6} ${y} ${x} ${y + 4} Q${x - 6} ${y} ${x} ${y - 9}Z" fill="#4db8ff" stroke="#1f7fd6" stroke-width="1"/>`));
    return c.out(s);
  };
  S["thing-umbrella"] = [107, 68, 7, -12, "print"];

  A["thing-icecream"] = () => {
    const c = Ctx(), CONE = "M62 104 L138 104 L104 188 Q100 194 96 188Z"; let s = c.shadow(100, 193, 30, 5);
    s += `<clipPath id="ic"><path d="${CONE}"/></clipPath>` + c.path(CONE, "#eaa74a") + `<g clip-path="url(#ic)" stroke="#b8731f" stroke-width="2.2" opacity=".7">`;
    for (let i = -6; i < 8; i++) s += `<path d="M${50 + i * 14} 100 l60 100 M${150 - i * 14} 100 l-60 100"/>`;
    s += `</g><rect x="57" y="98" width="86" height="13" rx="6.500" fill="${c.g("#f2b85c")}"/>`;
    s += c.sphere(100, 72, 35, "#ff8fb8") + c.path("M66 80 Q68 106 77 98 Q84 114 94 100 Q104 112 113 99 Q124 110 134 80Z", "#ff8fb8");
    s += c.sphere(100, 38, 26, "#8fe3c8") + c.path("M75 42 Q78 60 86 53 Q94 64 102 54 Q112 62 125 42Z", "#8fe3c8");
    [[88, 30, 30, "#ff5e7a"], [104, 24, -40, "#ffd21f"], [112, 40, 20, "#6b7bff"], [94, 46, -20, "#fff"], [84, 40, 60, "#ffd21f"]].forEach(([x, y, r, col]) => (s += `<rect x="${x - 4}" y="${y - 1.5}" width="8" height="3" rx="1.5" fill="${col}" transform="rotate(${r} ${x} ${y})"/>`));
    s += st("M106 10 Q110 2 118 2", "#6b4324", 2) + c.sphere(105, 14, 8, "#ff3030", 0.85);
    return c.out(s);
  };
  S["thing-icecream"] = [100, 132, 6, 0, "sticker"];

  /* ================= stories ================= */
  A["usa-treat"] = () => {
    const c = Ctx(); let s = c.shadow(100, 193, 96, 7);
    s += `<rect x="34" y="4" width="132" height="190" rx="8" fill="${c.g("#7a4a2a")}"/><rect x="44" y="13" width="112" height="181" rx="5" fill="${c.g("#c98a4a", 50, 20)}"/>`;
    s += `<g fill="none" stroke="#8a5a34" stroke-width="3" opacity=".7"><rect x="56" y="48" width="38" height="46" rx="4"/><rect x="106" y="48" width="38" height="46" rx="4"/></g>` + c.sphere(147, 112, 6, "#ffd21f");
    // witch
    s += c.ell(50, 191, 10, 5, "#3d2a6b", 0, 0.3) + c.ell(74, 191, 10, 5, "#3d2a6b", 0, 0.3) + c.path("M32 190 Q38 136 62 126 Q86 136 92 190Z", "#8a4fd0");
    s += `<path d="M38 104 Q30 124 40 134 L48 112Z M86 104 Q94 124 84 134 L76 112Z" fill="#ff8a2e"/>` + c.sphere(62, 108, 24, SKIN, 0.5);
    s += c.eyes(62, 110, 9.5, 5.6) + c.smile(62, 119, 5) + cheeks(62, 118, 16, 5, 3);
    s += c.ell(62, 88, 36, 8.5, "#3d2a6b", 0, 0.3) + c.path("M40 88 Q50 42 72 14 Q74 52 86 88 Q62 94 40 88Z", "#4a3380") + st("M43 82 Q62 89 84 82", "#ffb01f", 6) + `<rect x="57" y="79" width="11" height="10" rx="2" fill="none" stroke="#fff3a0" stroke-width="2.2"/>`;
    // ghost
    s += c.ell(128, 193, 10, 5, "#ff4d5e", 0, 0.3) + c.ell(150, 193, 10, 5, "#ff4d5e", 0, 0.3);
    s += `<path d="M108 190 L110 110 Q112 72 138 72 Q164 72 166 110 L168 190 Q160 180 153 190 Q146 180 138 190 Q130 180 123 190 Q116 180 108 190Z" fill="${c.g("#f4f1ff")}" stroke="#a59fe0" stroke-width="2" stroke-linejoin="round"/>` + c.hl(126, 88, 12, 7, -30, 0.8);
    s += `<ellipse cx="128" cy="106" rx="6" ry="8" fill="${INK}"/><ellipse cx="149" cy="106" rx="6" ry="8" fill="${INK}"/><circle cx="126" cy="103" r="2" fill="#fff"/><circle cx="147" cy="103" r="2" fill="#fff"/><path d="M131 121 Q138.500 129 146 121 Q138.500 124 131 121Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` + cheeks(138, 119, 17, 5, 3);
    // pumpkin bucket with sweets
    s += st("M78 164 Q100 124 122 164", "#3d2a6b", 3.5);
    s += `<g>${sway(8, 100, 150, 1.5)}<path d="M90 152 L86 130" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="85" cy="128" r="7.500" fill="#ff5e9a" stroke="#fff" stroke-width="2"/></g><path d="M104 144 l-6 -5 v10Z M116 144 l6 -5 v10Z" fill="#4cc9ff"/><ellipse cx="110" cy="144" rx="7" ry="5" fill="#4cc9ff" stroke="#fff" stroke-width="1.5"/>`;
    s += at(100, 172, 0.34, pump(c, true).replace(/^<path[^>]*\/>/, ""));
    s += st("M80 146 L84 152", "#8a4fd0", 9) + c.sphere(86, 153, 6, SKIN, 0.4) + c.ell(116, 153, 8, 6.5, "#f4f1ff", 0, 0.3);
    return c.out(s);
  };
  S["usa-treat"] = [100, 30, 7.5, 0, "plate"];

  A["usa-johnny"] = () => {
    const c = Ctx(), SH = "#5fae5a", PT = "#4c6fb8"; let s = c.shadow(96, 191, 88, 8);
    // sapling
    s += c.ell(160, 186, 30, 8, "#8a5a34", 0, 0.3) + st("M160 184 Q157 166 160 148", "#6f9a2e", 4.5) + c.ell(148, 158, 11, 6, "#4cc95a", 30, 0.4) + c.ell(172, 154, 11, 6, "#4cc95a", -30, 0.4) + c.ell(160, 142, 6.5, 10, "#5fd96a", 0, 0.4);
    s += `<g fill="#ffd21f">${tw(1.2, "1;.2;1")}<path d="${starD(182, 134, 6, 0.4)}"/><path d="${starD(140, 136, 4.5, 0.4)}"/></g>`;
    // sack on the back
    s += c.path("M24 92 Q10 128 28 152 Q48 164 62 146 Q70 120 56 96 Q40 86 24 92Z", "#d9b47a") + st("M30 94 Q40 100 52 96", "#8a6a3a", 4) + `<path d="M34 92 L28 80 L42 86 L50 78 L50 94Z" fill="${c.g("#d9b47a")}"/>`;
    s += c.sphere(38, 126, 10, "#ff3030", 0.8) + st("M38 117 q1 -5 5 -6", "#6b4324", 2) + c.ell(45, 113, 5, 2.6, "#4cc95a", -25, 0);
    // legs, bare feet
    s += st("M74 140 L72 168", PT, 15) + st("M96 140 L99 168", PT, 15) + `<path d="M64.500 166 l3 6 l3 -5 l3 6 l3 -5 l3 5 M91.500 166 l3 6 l3 -5 l3 6 l3 -5 l3 5" stroke="${PT}" stroke-width="3" fill="none" stroke-linejoin="round"/>`;
    s += `<rect x="67" y="168" width="10" height="14" rx="4" fill="#f0b888"/><rect x="94" y="168" width="10" height="14" rx="4" fill="#f0b888"/>` + c.ell(67, 185, 14, 7, SKIN, 0, 0.4) + c.ell(104, 185, 14, 7, SKIN, 0, 0.4);
    s += st("M56 184 v4 M60.500 183 v5 M65 183 v5 M106 183 v5 M110.500 183 v5 M115 184 v4", "#d9966a", 1.5);
    s += `<rect x="68" y="150" width="9" height="9" rx="1.5" fill="#e9c08a" stroke="#8a6a3a" stroke-width="1" stroke-dasharray="2 1.5"/>`;
    // shirt and arms
    s += c.path("M60 106 Q84 96 108 106 L106 146 Q84 152 62 146Z", SH) + st("M63 142 Q84 148 105 142", "#8a6a3a", 3.5);
    s += st("M66 110 Q52 112 52 102", SH, 11) + c.sphere(52, 99, 7, SKIN, 0.4);
    s += st("M103 110 Q124 114 134 130", SH, 11) + c.sphere(136, 133, 7.5, SKIN, 0.4);
    [[142, 146, 0], [147, 158, 0.3], [152, 170, 0.6]].forEach(([x, y, b]) => (s += `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="3.8" fill="#6b4324" transform="rotate(25 ${x} ${y})"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" begin="${b}s" repeatCount="indefinite"/></ellipse>`));
    // head + pot hat
    s += c.sphere(57, 74, 6, SKIN, 0.3) + c.sphere(111, 74, 6, SKIN, 0.3) + c.sphere(84, 72, 28, SKIN, 0.5);
    s += `<path d="M57 62 Q54 74 60 80 L62 60Z M111 62 Q114 74 108 80 L106 60Z" fill="#8a4a1c"/>`;
    s += c.eyes(84, 72, 10.5, 6) + st("M70 61 Q74 58 79 60 M89 60 Q94 58 98 61", "#6b3a14", 2.5) + cheeks(84, 82, 18, 6, 3.6);
    s += `<path d="M73 82 Q84 87 95 82 Q94 95 84 95 Q74 95 73 82Z" fill="#7a1a2c" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M78 92 Q84 87 90 92 Q87 94.500 84 94.500 Q81 94.500 78 92Z" fill="#ff7a9a"/>`;
    s += `<rect x="100" y="27" width="46" height="8" rx="4" fill="${c.g("#5a6180")}"/><circle cx="141" cy="31" r="2" fill="#2b2f45"/>` + c.path("M58 52 L62 22 Q84 12 106 22 L110 52Z", "#8a93b0") + c.hl(74, 30, 9, 12, 10, 0.7) + `<rect x="53" y="47" width="62" height="9" rx="4.500" fill="${c.g("#6f7896")}"/>`;
    return c.out(s);
  };
  S["usa-johnny"] = [84, 126, 6.5, 0, "patch"];
})();
