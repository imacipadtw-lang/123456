/* Gate 5 · Classroom Beat 教室節奏派對 — sing & dance (a rhythm chant of passport commands)
   A glossy disco stage: giant DJ Ollie behind the decks, mirror ball, light beams, an LED floor, four glowing drum pads and a
   karaoke strip.  Every line of TC_CONTENT.gates[5].lines:
     1. Ollie chants the line over the beat while a dancing avatar shows the move (wash / clean / brush / rest / wake / run);
     2. DANCE BREAK: everybody in the room does the move, the child taps the pads on the beat (forgiving: a tap in time lights
        the pad and adds to the combo, a missed beat costs nothing);
     3. fill-in: the child says the last word of the line (api.ask), then Ollie praises.
   Finale: the mirror ball drops, lasers + a confetti shower, all lines are chanted together by Ollie and a line-up of avatars.
   Everything is drawn in code (no images) and the beat is synthesised with WebAudio inside this file. */
(function () {
  "use strict";
  TC.games = TC.games || {};
  const h = TC.h, sleep = TC.sleep;

  const BPM = 100, BREAK_BARS = 2; // the dance break is 4 beats (one bar) per bar, BREAK_BARS bars long
  const MOVES = {
    wash: { c: "#4cc9ff", zh: "洗洗手" }, clean: { c: "#ffc83d", zh: "清桌子" }, brush: { c: "#2ee6b6", zh: "刷刷牙" },
    rest: { c: "#9b6bff", zh: "休息一下" }, wake: { c: "#ff9a2e", zh: "起床囉" }, run: { c: "#ff5fa2", zh: "快一點" }
  };
  const PADS = [["#ff5fa2", "BOOM", "drum"], ["#4cc9ff", "CLAP", "clap"], ["#ffc83d", "TSS", "bell"], ["#2ee6b6", "YEAH", "zap"]];
  const PAL = [["#ff5fa2", "#4a2a14"], ["#4cc9ff", "#1b1d33"], ["#ffc83d", "#7a3a14"], ["#2ee6b6", "#2a2a5a"], ["#9b6bff", "#5a3518"], ["#ff9a2e", "#1b1d33"]];
  const SKIN = "#ffd3a8", INK = "#1b1d33", PANTS = "#3d4fb0";

  /* ====================================================================================================================
     ART — original drawings (SVG strings).  Inline copies get unique ids; TC.ART copies are used as <img> (start screen).
     ==================================================================================================================== */
  function mix(hex, f) { // f > 0 lighten, f < 0 darken
    const n = parseInt(hex.slice(1), 16), t = f < 0 ? 0 : 255, a = Math.abs(f);
    const r = Math.round(((n >> 16) & 255) + (t - ((n >> 16) & 255)) * a), g = Math.round(((n >> 8) & 255) + (t - ((n >> 8) & 255)) * a), b = Math.round((n & 255) + (t - (n & 255)) * a);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  let uidN = 0;
  const uniq = (svg) => { const p = "c5" + uidN++ + "_"; return svg.replace(/id="([^"]+)"/g, 'id="' + p + '$1"').replace(/url\(#([^)]+)\)/g, "url(#" + p + "$1)"); };
  const stroke = (d, col, w, ex) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${ex || ""}/>`;
  /** the school's mark as a small inline SVG, for things built in the DOM (the booth's lit logo plate, the speakers' badges) */
  const sealSvg = (kind) => uniq(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-37 -32 74 66">${TC.seal(0, 0, 20, 0, kind)}</svg>`);
  const spark = (x, y, r, col, cls, delay) => `<path ${cls ? `class="${cls}" style="transform-box:fill-box;transform-origin:50% 50%;animation-delay:${delay || 0}s"` : ""} d="M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z" fill="${col}"/>`;

  /** a dancing kid doing one of the six moves (viewBox 0 0 240 300); parts carry classes the CSS animates */
  function avatar(move, k) {
    const c = TC.ArtCtx(), P = PAL[k % PAL.length], top = P[0], hairC = P[1];
    const sleeve = (d) => stroke(d, top, 21) + stroke(d, mix(top, 0.5), 5, 'opacity=".5" transform="translate(-4 -1)"');
    const hand = (x, y) => c.sphere(x, y, 11.5, SKIN, 0.55);
    const arm = (cls, sx, rot, len, extra) => `<g class="${cls}" style="transform-origin:${sx}px 166px" transform="rotate(${rot})">${sleeve(`M${sx} 166 L${sx} ${166 + len}`)}${hand(sx, 166 + len)}${extra || ""}</g>`;
    const leg = (x, cls, rot) => `<g class="${cls}" style="transform-origin:${x}px 228px" transform="rotate(${rot || 0})">${stroke(`M${x} 228 L${x} 270`, PANTS, 25)}${stroke(`M${x - 6} 232 L${x - 6} 266`, "#8394f2", 5, 'opacity=".5"')}<ellipse cx="${x + 4}" cy="281" rx="21" ry="11" fill="${c.g("#ffffff")}"/>${stroke(`M${x - 14} 285 Q${x + 4} 293 ${x + 22} 285`, "#ff5fa2", 4)}</g>`;
    const eyes = c.eyes(120, 106, 22, 9.5), shut = stroke("M97 108 Q106 117 115 108", INK, 4) + stroke("M125 108 Q134 117 143 108", INK, 4);
    const blush = c.blush(120, 126, 34), smile = c.smile(120, 128, 10);
    let back = "", mid = "", front = "", arms = "", face = eyes + blush + smile, hat = `<path d="M69 98 Q64 42 120 42 Q176 42 171 98 Q160 70 138 68 Q124 78 104 68 Q82 72 69 98Z" fill="${c.g(hairC)}"/>${c.hl(98, 54, 22, 8, -10, 0.45)}<path d="M104 46 Q118 22 140 44Z" fill="${c.g(hairC)}"/>`;
    let legs = leg(104, "lgL") + leg(136, "lgR"), hdRot = "", allRot = "";
    switch (move) {
      case "wash": {
        back = `<g>${stroke("M204 112 L204 170 Q204 188 186 188 L130 188", "#9fb0d8", 12)}${stroke("M204 112 L204 170 Q204 188 186 188 L130 188", "#eef2ff", 4, 'transform="translate(-2 -2)" opacity=".85"')}<circle cx="204" cy="106" r="10" fill="${c.g("#ff5fa2")}"/></g><path class="wat" d="M129 192 L129 214" stroke="#7fd8ff" stroke-width="8" stroke-linecap="round" stroke-dasharray="6 8"/>`;
        mid = `<rect x="38" y="228" width="164" height="90" rx="12" fill="${c.v("#9fd8ff", "#4f9fd6")}"/><rect x="38" y="228" width="164" height="14" fill="#fff" opacity=".25"/><ellipse cx="120" cy="229" rx="88" ry="16" fill="${c.g("#ffffff")}"/><ellipse cx="120" cy="231" rx="66" ry="9.5" fill="#6fcfff"/><ellipse cx="104" cy="229" rx="22" ry="3" fill="#fff" opacity=".7"/>`;
        arms = `<g class="amL" style="transform-origin:86px 166px">${sleeve("M86 166 L70 198 L108 207")}${hand(110, 207)}</g><g class="amR" style="transform-origin:154px 166px">${sleeve("M154 166 L170 198 L132 207")}${hand(130, 207)}</g>`; // elbows out: the crest on the chest stays visible
        front = `<g><circle cx="120" cy="206" r="13" fill="#fff"/><circle cx="108" cy="210" r="9" fill="#fff"/><circle cx="133" cy="209" r="10" fill="#fff"/><circle cx="116" cy="199" r="8" fill="#eaf6ff"/></g>` +
          [[96, 190, 7], [176, 190, 6], [104, 172, 6], [74, 200, 5], [168, 204, 6], [88, 176, 5]].map((b, i) => `<circle class="bub" style="--dl:${-i * 0.45}s" cx="${b[0]}" cy="${b[1]}" r="${b[2]}" fill="#dff6ff" stroke="#7fd8ff" stroke-width="2"/>`).join("");
        break; }
      case "clean": {
        mid = `<path d="M14 234 L46 202 L194 202 L226 234Z" fill="${c.g("#f2b866")}"/><path d="M22 232 L50 207 L190 207 L218 232Z" fill="#ffd9a0" opacity=".55"/><rect x="14" y="234" width="212" height="18" rx="4" fill="${c.v("#c9863a", "#8f5a22")}"/><rect x="22" y="252" width="12" height="52" fill="#8f5a22"/><rect x="206" y="252" width="12" height="52" fill="#8f5a22"/>` +
          spark(92, 216, 9, "#fff", "tw", 0) + spark(150, 214, 7, "#fff", "tw", 0.3) + spark(120, 222, 6, "#fff7b0", "tw", 0.6) +
          `<circle cx="68" cy="218" r="3" fill="#8f5a22"/><circle cx="168" cy="220" r="3" fill="#8f5a22"/><circle cx="178" cy="213" r="2.5" fill="#8f5a22"/>`;
        arms = arm("amL", 86, -24, 50, `<g transform="rotate(6 86 216)"><rect x="64" y="208" width="34" height="20" rx="8" fill="${c.g("#ffe45e")}"/><path d="M66 222 q5.5 6 11 0 q5.5 6 11 0 q5.5 6 11 0" stroke="#e0a21a" stroke-width="2.5" fill="none"/></g>`) + arm("amR", 154, -8, 50); // wipes with the right hand, the left chest (crest) stays free
        break; }
      case "brush": {
        arms = `<g class="amR" style="transform-origin:154px 166px" transform="rotate(-30)">${sleeve("M154 166 L174 196 L144 214")}${hand(144, 214)}</g>` +
          `<g>${sleeve("M86 166 L64 198")}</g><g class="fa" style="transform-origin:64px 198px">${sleeve("M64 198 L90 154")}${hand(90, 152)}${stroke("M94 146 L102 134", "#4cc9ff", 10)}${stroke("M94 146 L102 134", "#bff0ff", 3, 'transform="translate(-2 -1)"')}<rect x="96" y="121" width="36" height="12" rx="5" fill="${c.g("#ffffff")}"/><rect x="98" y="127" width="32" height="7" rx="3" fill="#2ee6b6"/></g>`;
        face = eyes + blush + `<ellipse cx="120" cy="131" rx="21" ry="12" fill="#7a1a2c"/><path d="M101 126 Q120 120 139 126 L139 130 Q120 125 101 130Z" fill="#fff"/><ellipse cx="120" cy="138" rx="10" ry="5" fill="#ff7a9a"/>`;
        front = [[98, 142, 7], [108, 148, 6], [142, 144, 8], [150, 136, 5], [92, 134, 5]].map((b, i) => `<circle class="bub" style="--dl:${-i * 0.35}s" cx="${b[0]}" cy="${b[1]}" r="${b[2]}" fill="#fff" stroke="#bff0ff" stroke-width="1.5"/>`).join("");
        break; }
      case "rest": {
        back = `<path d="M26 38 Q4 58 26 84 Q10 58 38 40Z" fill="${c.g("#fff2a8")}"/>` + spark(34, 104, 8, "#fff7b0", "tw", 0) + spark(204, 40, 9, "#fff7b0", "tw", 0.4) + spark(214, 96, 6, "#cfe3ff", "tw", 0.8);
        arms = sleeve("M86 166 L54 138 L78 112") + sleeve("M154 166 L186 138 L162 112"); // leaning back, hands behind the head
        face = shut + blush + c.smile(120, 130, 7) + `<circle class="snore" style="transform-box:fill-box;transform-origin:0% 100%" cx="136" cy="126" r="9" fill="#dff6ff" stroke="#7fd8ff" stroke-width="2.5"/>`;
        hat = `<path d="M66 94 Q62 40 120 38 Q178 40 174 94 Q120 78 66 94Z" fill="${c.g("#6f7fd8")}"/><path d="M150 48 Q202 50 194 106 Q178 80 150 66Z" fill="${c.g("#6f7fd8")}"/><path d="M64 94 Q120 78 176 94 L176 104 Q120 90 64 104Z" fill="#fff"/>${c.sphere(194, 108, 11, "#ffffff", 0.5)}${spark(96, 62, 5, "#ffe58a")}${spark(130, 56, 4, "#ffe58a")}${spark(150, 80, 4, "#ffe58a")}`;
        hdRot = ' transform="rotate(9)"';
        front = `<text class="zz" x="176" y="66" font-size="30" font-weight="900" font-family="Arial Rounded MT Bold,Arial,sans-serif" fill="#cfe3ff" stroke="#6f7fd8" stroke-width="1.5" style="--dl:0s">Z</text><text class="zz" x="196" y="44" font-size="22" font-weight="900" font-family="Arial Rounded MT Bold,Arial,sans-serif" fill="#cfe3ff" stroke="#6f7fd8" stroke-width="1.5" style="--dl:-1.2s">z</text><text class="zz" x="210" y="28" font-size="16" font-weight="900" font-family="Arial Rounded MT Bold,Arial,sans-serif" fill="#cfe3ff" stroke="#6f7fd8" stroke-width="1.5" style="--dl:-2.4s">z</text>`;
        break; }
      case "wake": {
        const rays = Array.from({ length: 12 }, (_, i) => `<path d="M120 118 L${(120 + 112 * Math.cos((i * Math.PI) / 6 - 0.13)).toFixed(1)} ${(118 + 112 * Math.sin((i * Math.PI) / 6 - 0.13)).toFixed(1)} L${(120 + 112 * Math.cos((i * Math.PI) / 6 + 0.13)).toFixed(1)} ${(118 + 112 * Math.sin((i * Math.PI) / 6 + 0.13)).toFixed(1)}Z" fill="#ffd54a" opacity=".55"/>`).join("");
        back = `<g class="sun" style="transform-origin:120px 118px">${rays}</g><circle cx="120" cy="118" r="82" fill="${c.g("#ffd54a")}" opacity=".9"/>`;
        arms = arm("amL", 86, 152, 54) + arm("amR", 154, -152, 54);
        face = shut + blush + `<ellipse cx="120" cy="136" rx="13" ry="17" fill="#7a1a2c"/><ellipse cx="120" cy="147" rx="8" ry="7" fill="#ff7a9a"/>`;
        front = `<g class="clk" style="transform-origin:34px 262px"><circle cx="20" cy="228" r="9" fill="${c.g("#ffc83d")}"/><circle cx="48" cy="228" r="9" fill="${c.g("#ffc83d")}"/><rect x="29" y="232" width="10" height="10" fill="#b5850c" transform="rotate(0)"/><circle cx="34" cy="262" r="27" fill="${c.g("#ff5a5a")}"/><circle cx="34" cy="262" r="20" fill="#fff"/><path d="M34 262 L34 248 M34 262 L44 268" stroke="#1b1d33" stroke-width="3.5" stroke-linecap="round"/><circle cx="34" cy="262" r="3" fill="#1b1d33"/><path d="M12 290 L8 298 M56 290 L60 298" stroke="#b5850c" stroke-width="5" stroke-linecap="round"/></g>` +
          stroke("M2 232 Q-4 246 2 260", "#ff5a5a", 3.5, 'class="ringw"') + stroke("M66 232 Q72 246 66 260", "#ff5a5a", 3.5, 'class="ringw"');
        hdRot = ' transform="rotate(-4)"';
        break; }
      default: { // run
        back = `<g class="spd">${stroke("M8 120 L56 120", "#fff", 5, 'opacity=".7"')}${stroke("M0 150 L48 150", "#fff", 5, 'opacity=".55"')}${stroke("M14 180 L62 180", "#fff", 5, 'opacity=".7"')}${stroke("M2 208 L44 208", "#fff", 5, 'opacity=".5"')}</g>`;
        arms = `<g class="amL" style="transform-origin:86px 166px" transform="rotate(16)">${sleeve("M86 166 L72 194 L50 180")}${hand(48, 178)}</g><g class="amR" style="transform-origin:154px 166px" transform="rotate(16)">${sleeve("M154 166 L168 194 L190 180")}${hand(192, 178)}</g>`; // bent arms pump beside the body
        face = eyes + blush + `<path d="M104 124 Q120 150 136 124Z" fill="#7a1a2c"/><path d="M106 125 Q120 130 134 125 L132 130 Q120 134 108 130Z" fill="#fff"/><ellipse cx="120" cy="138" rx="8" ry="5" fill="#ff7a9a"/>` + stroke("M96 92 L114 98", INK, 4) + stroke("M144 92 L126 98", INK, 4);
        front = `<path d="M174 78 q9 15 0 22 q-9 -7 0 -22z" fill="#9fe3ff" stroke="#4cc9ff" stroke-width="2"/>` + `<circle class="dust" cx="52" cy="290" r="9" fill="#fff" opacity=".6"/><circle class="dust" style="--dl:-.3s" cx="34" cy="284" r="6" fill="#fff" opacity=".6"/>`;
        legs = leg(104, "lgL", -30) + leg(136, "lgR", 30);
        allRot = ' transform="rotate(6)"';
        break; }
    }
    const torso = `<path d="M82 160 Q84 144 108 142 L132 142 Q156 144 158 160 L162 232 Q162 244 150 244 L90 244 Q78 244 78 232Z" fill="${c.g(top)}"/><path d="M96 143 Q120 166 144 143Z" fill="${mix(top, -0.28)}"/><path d="M96 208 Q120 200 144 208 L148 230 L92 230Z" fill="${mix(top, -0.18)}" opacity=".7"/><path d="M79 228 L161 228 L162 236 Q162 244 150 244 L90 244 Q78 244 78 236Z" fill="${c.g(PANTS)}"/>${c.hl(102, 168, 20, 26, -12, 0.5)}${TC.seal(130.5, 178, 9.2, 0, "patch")}`; // the school crest: an embroidered patch on the left chest of the PE shirt
    const head = `<g class="hd" style="transform-origin:120px 150px"${hdRot}>${c.sphere(68, 108, 10, SKIN, 0.4)}${c.sphere(172, 108, 10, SKIN, 0.4)}${c.sphere(120, 102, 50, SKIN, 0.6)}${hat}${face}</g>`;
    const body = c.shadow(120, 290, 64, 9) + back + `<g class="all" style="transform-origin:120px 290px"${allRot}>${legs}${torso}${mid}${arms}${head}${front}</g>`;
    return c.out(body, "0 0 240 300");
  }

  /** Ollie-Bot as the DJ: big headphones (the 土城 mark is printed on the ear-cups), wings that scratch the decks, beak that talks, equaliser chest */
  function ollieDJ() {
    const c = TC.ArtCtx(); let s = c.shadow(100, 224, 62, 8);
    s += `<line x1="100" y1="40" x2="100" y2="16" stroke="#c9d6ff" stroke-width="5" stroke-linecap="round"/>` + c.path("M100 0l5 10 11 1-8 7 3 11-11-6-11 6 3-11-8-7 11-1z", "#ffc83d");
    s += `<g class="wL" style="transform-origin:46px 118px">${c.path("M36 110 Q4 140 22 190 Q42 162 50 132Z", "#6f7fd8")}</g><g class="wR" style="transform-origin:154px 118px">${c.path("M164 110 Q196 140 178 190 Q158 162 150 132Z", "#6f7fd8")}</g>`;
    s += c.path("M100 34 C30 34 30 90 34 140 C38 196 66 214 100 214 C134 214 162 196 166 140 C170 90 170 34 100 34Z", "#8fa2ff");
    s += c.path("M42 56 L58 26 L80 50Z", "#8fa2ff") + c.path("M158 56 L142 26 L120 50Z", "#8fa2ff");
    s += c.sphere(72, 92, 28, "#ffffff", 0.3) + c.sphere(128, 92, 28, "#ffffff", 0.3) + c.eyes(100, 92, 28, 13);
    s += `<g class="bk" style="transform-box:fill-box;transform-origin:50% 0%">${c.path("M90 110 L110 110 L100 126Z", "#ffb020")}</g>` + c.blush(100, 118, 50);
    s += `<rect x="62" y="136" width="76" height="52" rx="14" fill="${c.v("#1b2b5e", "#0a1633")}" stroke="#c9d6ff" stroke-width="4"/>` +
      [["#ff5fa2", 70], ["#ffc83d", 82], ["#2ee6b6", 94], ["#4cc9ff", 106], ["#9b6bff", 118]].map((b, i) => `<rect class="eqb" style="--dl:${-i * 0.17}s" x="${b[1]}" y="146" width="9" height="34" rx="3" fill="${b[0]}"/>`).join("");
    s += c.hl(70, 60, 30, 12, -20, 0.7) + c.ell(80, 212, 14, 8, "#ffc83d", 0, 0.4) + c.ell(120, 212, 14, 8, "#ffc83d", 0, 0.4);
    s += `<path d="M24 92 C24 14 176 14 176 92" stroke="#ff5fa2" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M24 92 C24 14 176 14 176 92" stroke="#ffd0e4" stroke-width="3" fill="none" stroke-linecap="round" transform="translate(0 -3)" opacity=".7"/>`;
    [[23, -5], [177, 5]].forEach((e) => { s += `<circle cx="${e[0]}" cy="107" r="21" fill="#5a1238" opacity=".35"/>` + c.sphere(e[0], 104, 21, "#ff5fa2", 0.5) + `<circle cx="${e[0]}" cy="104" r="16.6" fill="#b82c66"/>` + TC.seal(e[0], 104, 12.4, e[1], "print"); });
    return c.out(s, "0 0 200 232");
  }

  // pictures for the start screen and the rest of the site
  const A = TC.ART, S = TC.SEAL;
  if (A && TC.ArtCtx) {
    Object.keys(MOVES).forEach((m, i) => { A["chant-" + m] = () => avatar(m, i); S["chant-" + m] = "none"; }); // the crest is part of the shirt
    A["chant-dj"] = () => ollieDJ(); S["chant-dj"] = "none"; // printed on the ear-cups
    A["chant-ball"] = () => {
      const c = TC.ArtCtx(); let g = "";
      for (let i = -4; i <= 4; i++) g += `<path d="M${100 + i * 17} 44 Q${100 + i * 26} 112 ${100 + i * 17} 180" stroke="#1d2352" stroke-width="2" fill="none" opacity=".5"/>`;
      for (let j = -4; j <= 4; j++) { const y = 112 + j * 16; g += `<path d="M30 ${y} Q100 ${y + j * 7} 170 ${y}" stroke="#1d2352" stroke-width="2" fill="none" opacity=".5"/>`; }
      const cols = ["#ff5fa2", "#4cc9ff", "#ffc83d", "#2ee6b6", "#9b6bff"]; let f = "";
      for (let i = 0; i < 26; i++) { const a = i * 2.4, r = 14 + ((i * 17) % 50); f += `<rect x="${(100 + Math.cos(a) * r - 7).toFixed(1)}" y="${(112 + Math.sin(a) * r * 0.9 - 7).toFixed(1)}" width="13" height="13" rx="2" fill="${cols[i % 5]}" opacity=".42"/>`; }
      const ball = `<g transform="translate(10 27) scale(.9)"><line x1="100" y1="12" x2="100" y2="46" stroke="#c9d6ff" stroke-width="4"/><clipPath id="bc"><circle cx="100" cy="112" r="68"/></clipPath>` + c.sphere(100, 112, 68, "#aab6f0", 0.5) + `<g clip-path="url(#bc)">${f}${g}</g>` + c.hl(76, 82, 26, 13, -30, 0.95) + spark(150, 70, 12, "#fff") + spark(54, 150, 8, "#fff") + `</g>`;
      // nothing is stuck on the mirrors: the motor box the ball hangs from carries the school's plate
      const s = `<rect x="56" y="3" width="88" height="37" rx="9" fill="${c.v("#4a4f9a", "#1a1d52")}" stroke="#8a93e8" stroke-width="2.5"/><rect x="62" y="6" width="76" height="5" rx="2.5" fill="#fff" opacity=".2"/>` + TC.seal(100, 21.5, 10, 0, "plate") + ball;
      return c.out(s, "0 0 200 200"); };
    S["chant-ball"] = "none";
    A["chant-note"] = () => {
      const c = TC.ArtCtx();
      const s = `<circle cx="100" cy="100" r="80" fill="${c.g("#ff5fa2")}"/>` + c.hl(70, 56, 40, 20, -25, 0.8) + `<path d="M92 56 L152 44 L152 70 L92 82Z" fill="#fff"/><rect x="92" y="56" width="10" height="76" fill="#fff"/><rect x="144" y="44" width="10" height="76" fill="#fff"/><ellipse cx="80" cy="134" rx="21" ry="15" fill="#fff" transform="rotate(-20 80 134)"/><ellipse cx="132" cy="122" rx="21" ry="15" fill="#fff" transform="rotate(-20 132 122)"/>`;
      return c.out(s, "0 0 200 200"); };
    S["chant-note"] = "none"; // the little notes that fly out of the pads are sparks, not things: no mark on them
    A["chant-vinyl"] = () => { // a record: its centre label is the school's mark
      const c = TC.ArtCtx(); let s = c.shadow(100, 190, 70, 8) + `<circle cx="100" cy="100" r="86" fill="${c.g("#2a2c52")}"/>`;
      for (let r = 78; r > 40; r -= 7) s += `<circle cx="100" cy="100" r="${r}" fill="none" stroke="#6f7be0" stroke-width="1.2" opacity=".5"/>`;
      s += `<path d="M100 100 L42 36 A86 86 0 0 1 82 16Z" fill="#fff" opacity=".16"/><path d="M100 100 L158 164 A86 86 0 0 1 118 184Z" fill="#fff" opacity=".1"/><circle cx="100" cy="100" r="37" fill="${c.g("#ff5fa2")}"/>` + TC.seal(100, 100, 26, 0, "print");
      return c.out(s, "0 0 200 200"); };
    S["chant-vinyl"] = "none";
  }

  /* ====================================================================================================================
     STYLE
     ==================================================================================================================== */
  const css = `
  .g5{position:absolute;inset:0;overflow:hidden;--spb:.6s;background:radial-gradient(80% 70% at 50% 34%,#4b1c80 0%,#1d0b3d 55%,#0a031d 100%)}
  .g5 *{box-sizing:border-box}
  .g5 .eq{position:absolute;left:5%;right:5%;top:15%;height:40%;display:flex;align-items:flex-end;gap:.5%;opacity:.3;pointer-events:none}
  .g5 .eq i{flex:1;height:100%;border-radius:1vh 1vh 0 0;background:linear-gradient(0deg,#ff5fa2,#9b6bff 60%,#4cc9ff);transform-origin:50% 100%;animation:g5eq calc(var(--spb)*var(--m)) ease-in-out infinite alternate;animation-delay:var(--dl)}
  @keyframes g5eq{from{transform:scaleY(.1)}to{transform:scaleY(1)}}
  .g5 .beam{position:absolute;top:-6%;left:var(--x);width:36vh;height:125%;margin-left:-18vh;transform-origin:50% 0;opacity:.36;mix-blend-mode:screen;
    background:linear-gradient(180deg,color-mix(in srgb,var(--c) 75%,#fff) 0%,transparent 78%);clip-path:polygon(46% 0,54% 0,100% 100%,0 100%);animation:g5sweep var(--t) ease-in-out infinite alternate}
  @keyframes g5sweep{from{transform:rotate(calc(var(--r)*-1))}to{transform:rotate(var(--r))}}
  /* the LED dance floor starts at the back wall (55 %) and runs under everybody's feet to the front edge of the screen */
  .g5:before{content:"";position:absolute;left:0;right:0;top:53.6%;height:2.8%;pointer-events:none;background:linear-gradient(180deg,transparent,rgba(255,95,162,.5) 40%,rgba(255,255,255,.9) 50%,rgba(76,201,255,.45) 60%,transparent)}
  .g5 .floor{position:absolute;left:-3%;right:-3%;top:55%;height:40vh;display:grid;grid-template-columns:repeat(20,1fr);grid-template-rows:repeat(8,1fr);gap:.45vh;transform:perspective(60vh) rotateX(62deg);transform-origin:50% 0;background:linear-gradient(180deg,rgba(40,16,90,.9),rgba(12,4,34,.55))}
  .g5 .floor i{border-radius:.6vh;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.22);transition:background .25s,box-shadow .25s}
  .g5 .floor i.a{background:rgba(255,95,162,.55);box-shadow:0 0 2vh rgba(255,95,162,.9)}
  .g5 .floor i.b{background:rgba(76,201,255,.5);box-shadow:0 0 2vh rgba(76,201,255,.9)}
  .g5 .floor i.c{background:rgba(255,200,61,.45);box-shadow:0 0 2vh rgba(255,200,61,.8)}
  .g5 .floor i.d{background:rgba(46,230,182,.4)}
  .g5 .ballw{position:absolute;left:50%;top:0;width:0;height:0;z-index:3;transition:transform 1.5s cubic-bezier(.3,1.45,.5,1)}
  .g5 .ballw .str{position:absolute;left:-.25vh;top:-70vh;width:.5vh;height:74vh;background:linear-gradient(90deg,#8c97c8,#e8eeff)}
  .g5 .ball{position:absolute;left:-6.5vh;top:6vh;width:13vh;height:13vh;border-radius:50%;overflow:hidden;animation:g5bs 3s linear infinite;
    background:radial-gradient(circle at 32% 26%,#fff 0,rgba(255,255,255,0) 26%),repeating-linear-gradient(90deg,rgba(10,10,50,.38) 0 .25vh,transparent .25vh 1.3vh),repeating-linear-gradient(0deg,rgba(10,10,50,.38) 0 .25vh,transparent .25vh 1.3vh),radial-gradient(circle at 40% 35%,#f4f7ff,#9aa8e8 55%,#3d4a9a);
    box-shadow:0 0 5vh rgba(200,215,255,.75),inset -1.5vh -1.5vh 3vh rgba(10,10,60,.55)}
  .g5 .ball:after{content:"";position:absolute;inset:0;border-radius:50%;background:conic-gradient(#ff5fa2,#4cc9ff,#ffc83d,#2ee6b6,#9b6bff,#ff5fa2);mix-blend-mode:overlay;opacity:.55;animation:g5spin 4s linear infinite}
  @keyframes g5bs{to{background-position:0 0,1.3vh 0,0 0,0 0}}
  @keyframes g5spin{to{transform:rotate(360deg)}}
  .g5.finale .ballw{transform:translateY(17.5vh)} /* the ball really drops: below Ollie's subtitle, just above his head */
  .g5 .dot{position:absolute;width:1.3vh;height:1.3vh;border-radius:50%;background:#fff;box-shadow:0 0 1.2vh #fff;opacity:0;animation:g5dot 4s ease-in-out infinite;animation-delay:var(--dl)}
  @keyframes g5dot{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:.85;transform:scale(1.2)}}
  .g5 .laser{display:none;position:absolute;left:50%;top:30vh;width:.7vh;height:150vh;margin-left:-.35vh;transform-origin:50% 0;mix-blend-mode:screen;pointer-events:none;z-index:4;
    background:linear-gradient(180deg,#fff,var(--c) 14%,transparent 100%);filter:drop-shadow(0 0 1vh var(--c));animation:g5laser var(--t) ease-in-out infinite alternate}
  .g5.finale .laser{display:block}
  @keyframes g5laser{from{transform:rotate(var(--a))}to{transform:rotate(calc(var(--a)*-1 + var(--b)))}}
  .g5 .spk{position:absolute;bottom:23%;width:6.4%;height:25%;border-radius:1vh;background:linear-gradient(180deg,#2c2f66,#101234);border:.35vh solid #4a4f9a;box-shadow:0 1vh 2vh rgba(0,0,0,.5);display:flex;flex-direction:column;align-items:center;justify-content:space-evenly}
  .g5 .spk i{width:72%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 40% 35%,#6a6fd0,#1a1d52 62%,#0a0b24);box-shadow:inset 0 0 1vh #000,0 0 1.4vh rgba(255,95,162,.5)}
  .g5 .spk i+i{width:46%}
  .g5 .spk{transition:opacity .5s}.g5.wide .spk{opacity:0} /* in the line-up the dancers stand where the speakers are: no half-hidden badge */
  .g5 .spk b{flex:none;width:54%;aspect-ratio:74/66}.g5 .spk b svg,.g5 .decks .logo svg{width:100%;height:100%;display:block}
  .g5 .podium{position:absolute;left:61%;top:57.5%;width:32%;height:11%;pointer-events:none}
  .g5 .podium b{position:absolute;inset:0;border-radius:50%;background:radial-gradient(ellipse,rgba(255,255,255,.45),var(--pc,#ff5fa2) 55%,transparent 72%);box-shadow:0 0 4vh var(--pc,#ff5fa2);opacity:.85;transition:background .4s}
  .g5 .podium em{position:absolute;inset:10% 6%;border-radius:50%;border:.5vh solid #fff;opacity:.7;box-shadow:0 0 2vh var(--pc,#ff5fa2)}
  .g5 .pring{position:absolute;left:61%;top:58.5%;width:32%;height:9%;border-radius:50%;border:.5vh solid var(--pc,#fff);pointer-events:none}
  /* DJ booth */
  .g5 .dj{position:absolute;left:17%;top:20%;width:37%;height:45.5%;transition:left .9s cubic-bezier(.3,1.2,.5,1),width .9s,top .9s,height .9s}
  .g5 .dj .oll{position:absolute;left:50%;top:0;height:80%;aspect-ratio:200/232;transform:translateX(-50%)}
  .g5 .dj .oll .bump,.g5 .av .bump{width:100%;height:100%;transform-origin:50% 100%}
  .g5 .dj .oll svg,.g5 .av svg{width:100%;height:100%;display:block;overflow:visible}
  .g5 .oll svg .wL{animation:g5wingL calc(var(--spb)*2) ease-in-out infinite alternate}
  .g5 .oll svg .wR{animation:g5wingR calc(var(--spb)*2) ease-in-out infinite alternate}
  @keyframes g5wingL{from{transform:rotate(-14deg)}to{transform:rotate(16deg)}}
  @keyframes g5wingR{from{transform:rotate(14deg)}to{transform:rotate(-16deg)}}
  .g5 .oll svg .eqb{transform-box:fill-box;transform-origin:50% 100%;animation:g5eq calc(var(--spb)*1.2) ease-in-out infinite alternate;animation-delay:var(--dl)}
  .g5 .dj.talk .bk{animation:g5beak .22s ease-in-out infinite alternate}
  @keyframes g5beak{from{transform:scaleY(1)}to{transform:scaleY(1.9)}}
  .g5 .decks{position:absolute;left:3%;right:3%;bottom:0;height:39%;z-index:2}
  .g5 .decks .top{position:absolute;left:0;right:0;top:0;height:66%;border-radius:1.6vh;background:linear-gradient(180deg,#3b3f86,#1a1d52 70%,#10123a);border:.45vh solid #6f7be0;box-shadow:0 0 3vh rgba(111,123,224,.7),inset 0 0 2vh rgba(0,0,0,.4);transform:perspective(60vh) rotateX(34deg);transform-origin:50% 100%}
  .g5 .decks .front{position:absolute;left:1%;right:1%;bottom:0;height:38%;border-radius:0 0 1.6vh 1.6vh;background:linear-gradient(180deg,#232763,#0d0f31);border:.4vh solid #4a4f9a;border-top:0;display:flex;align-items:center;justify-content:space-evenly;padding:0 4%}
  .g5 .decks .front i{flex:1;height:28%;margin:0 .6%;border-radius:1vh;background:var(--lc);box-shadow:0 0 1.4vh var(--lc);animation:g5led calc(var(--spb)*2) ease-in-out infinite alternate;animation-delay:var(--dl)}
  @keyframes g5led{from{opacity:.35}to{opacity:1}}
  /* the booth's logo plate, lit from behind in time with the music */
  .g5 .decks .logo{flex:none;height:88%;aspect-ratio:74/66;margin:0 1.4%;animation:g5lit calc(var(--spb)*2) ease-in-out infinite alternate}
  @keyframes g5lit{from{filter:drop-shadow(0 0 .4vh rgba(255,229,138,.5))}to{filter:drop-shadow(0 0 1.5vh #ffe58a) brightness(1.08)}}
  .g5 .plat{position:absolute;top:10%;width:30%;height:78%;border-radius:50%;background:repeating-radial-gradient(circle,#1a1a2e 0 .3vh,#2c2c4a .3vh .6vh);box-shadow:0 .6vh 1.2vh rgba(0,0,0,.6),0 0 0 .5vh #8a93e8;animation:g5spin 1.8s linear infinite}
  .g5 .plat:after{content:"";position:absolute;inset:34%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffd0e4,#ff5fa2 55%,#b0306a)}
  .g5 .plat:before{content:"";position:absolute;left:46%;top:6%;width:8%;height:42%;border-radius:1vh;background:linear-gradient(90deg,#fff,#9aa8e8);z-index:1}
  .g5 .plat.l{left:7%}.g5 .plat.r{right:7%}
  .g5 .mixer{position:absolute;left:41%;right:41%;top:8%;height:80%;border-radius:1vh;background:linear-gradient(180deg,#14163e,#0b0c28);border:.3vh solid #6f7be0;display:flex;justify-content:space-evenly;align-items:flex-end;padding:0 6% 8%}
  .g5 .mixer i{width:14%;border-radius:.4vh;background:linear-gradient(180deg,#2ee6b6,#ffc83d,#ff5fa2);transform-origin:50% 100%;animation:g5eq calc(var(--spb)*var(--m)) ease-in-out infinite alternate;animation-delay:var(--dl);height:70%}
  /* the dancing avatar (the big action picture) and the line-up */
  .g5 .avwrap{position:absolute;left:62%;top:17%;width:30%;height:43%;display:flex;justify-content:center;transition:opacity .3s}
  .g5 .av{height:100%;aspect-ratio:240/300}
  .g5 .row{position:absolute;left:0;right:0;top:41%;height:38%;display:none;pointer-events:none}
  .g5 .row .av{position:absolute;bottom:0;height:100%;margin-left:-15.2vh;left:var(--x)}
  .g5.wide .row{display:block}.g5.wide .avwrap{display:none}
  .g5.wide .row .av{animation:g5popin .6s cubic-bezier(.2,1.6,.4,1) both;animation-delay:var(--pd)}
  @keyframes g5popin{from{transform:translateY(8vh) scale(.5);opacity:0}to{transform:none;opacity:1}}
  .g5 .row .av .bump{transition:filter .25s,transform .25s}
  .g5 .row .av.hot .bump{filter:drop-shadow(0 0 2.4vh #ffe58a) drop-shadow(0 0 1vh #fff);transform:scale(1.14)}
  .g5.wide .dj{left:31.5%;width:37%;top:30%;height:49%}
  .g5.wide.finale .dj{top:36.5%;height:42.5%}
  .g5.wide .podium,.g5.wide .pring{opacity:0}
  /* avatar parts (animations run on the beat: --spb) */
  .g5 .mv-wash .all,.g5 .mv-clean .all,.g5 .mv-brush .all{animation:g5sway calc(var(--spb)*2) ease-in-out infinite alternate}
  @keyframes g5sway{from{transform:rotate(-2.5deg)}to{transform:rotate(2.5deg) translateY(-3px)}}
  .g5 .mv-wash .amL,.g5 .mv-wash .amR{animation:g5wL calc(var(--spb)/2) ease-in-out infinite alternate}
  @keyframes g5wL{from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}
  .g5 .wat{animation:g5wat .35s linear infinite}@keyframes g5wat{to{stroke-dashoffset:-14}}
  .g5 .bub{animation:g5bub calc(var(--spb)*3) ease-out infinite;animation-delay:var(--dl);transform-box:fill-box;transform-origin:50% 50%}
  @keyframes g5bub{0%{transform:translateY(8px) scale(.5);opacity:0}25%{opacity:1}100%{transform:translateY(-34px) scale(1.15);opacity:0}}
  .g5 .mv-clean .amL{animation:g5cL var(--spb) ease-in-out infinite}.g5 .mv-clean .amR{animation:g5cR calc(var(--spb)*2) ease-in-out infinite alternate}
  @keyframes g5cL{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(-40deg)}}
  @keyframes g5cR{from{transform:rotate(-9deg)}to{transform:rotate(-4deg)}}
  .g5 .tw{animation:g5tw calc(var(--spb)*2) ease-in-out infinite}@keyframes g5tw{0%,100%{transform:scale(.3);opacity:.2}50%{transform:scale(1.25);opacity:1}}
  .g5 .mv-brush .fa{animation:g5scrub calc(var(--spb)/2) ease-in-out infinite}
  @keyframes g5scrub{0%,100%{transform:translate(6px,3px) rotate(3deg)}50%{transform:translate(-6px,-3px) rotate(-3deg)}}
  .g5 .mv-brush .amR{animation:g5hip calc(var(--spb)*2) ease-in-out infinite alternate}@keyframes g5hip{from{transform:rotate(-30deg)}to{transform:rotate(-22deg)}}
  .g5 .mv-rest .all{animation:g5rest calc(var(--spb)*4) ease-in-out infinite alternate}
  @keyframes g5rest{from{transform:rotate(-5deg) translateY(0)}to{transform:rotate(5deg) translateY(3px)}}
  .g5 .zz{animation:g5zz calc(var(--spb)*4) ease-out infinite;animation-delay:var(--dl)}
  @keyframes g5zz{0%{transform:translate(0,12px);opacity:0}20%{opacity:1}100%{transform:translate(8px,-24px);opacity:0}}
  .g5 .snore{animation:g5snore calc(var(--spb)*4) ease-in-out infinite}@keyframes g5snore{0%,100%{transform:scale(.3)}50%{transform:scale(1.5)}}
  .g5 .mv-wake .all{animation:g5stretch calc(var(--spb)*2) ease-in-out infinite alternate}
  @keyframes g5stretch{from{transform:scale(1,1)}to{transform:scale(.97,1.05)}}
  .g5 .mv-wake .amL{animation:g5kL calc(var(--spb)*2) ease-in-out infinite alternate}.g5 .mv-wake .amR{animation:g5kR calc(var(--spb)*2) ease-in-out infinite alternate}
  @keyframes g5kL{from{transform:rotate(150deg)}to{transform:rotate(176deg)}}@keyframes g5kR{from{transform:rotate(-150deg)}to{transform:rotate(-176deg)}}
  .g5 .mv-wake .hd{animation:g5yawn calc(var(--spb)*2) ease-in-out infinite alternate}@keyframes g5yawn{from{transform:rotate(0deg)}to{transform:rotate(-8deg)}}
  .g5 .sun{animation:g5spin 14s linear infinite}
  .g5 .clk{animation:g5shake .18s linear infinite}@keyframes g5shake{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
  .g5 .ringw{animation:g5rw .36s ease-in-out infinite alternate}@keyframes g5rw{from{opacity:.2}to{opacity:1}}
  .g5 .mv-run .all{animation:g5runb calc(var(--spb)/2) ease-in-out infinite alternate}
  @keyframes g5runb{from{transform:rotate(6deg) translateY(0)}to{transform:rotate(6deg) translateY(-9px)}}
  .g5 .mv-run .lgL{animation:g5leg calc(var(--spb)/2) ease-in-out infinite alternate}.g5 .mv-run .lgR{animation:g5leg calc(var(--spb)/2) ease-in-out infinite alternate-reverse}
  .g5 .mv-run .amL,.g5 .mv-run .amR{animation:g5arm calc(var(--spb)/2) ease-in-out infinite alternate}
  @keyframes g5leg{from{transform:rotate(-40deg)}to{transform:rotate(40deg)}}@keyframes g5arm{from{transform:rotate(-20deg)}to{transform:rotate(20deg)}}
  .g5 .spd{animation:g5spd calc(var(--spb)/2) linear infinite}@keyframes g5spd{from{transform:translateX(18px);opacity:1}to{transform:translateX(-14px);opacity:.2}}
  .g5 .dust{animation:g5dust var(--spb) ease-out infinite;animation-delay:var(--dl,0s);transform-box:fill-box;transform-origin:50% 50%}@keyframes g5dust{from{transform:translate(0,0) scale(.5);opacity:.8}to{transform:translate(-18px,-8px) scale(1.5);opacity:0}}
  /* lyric strip */
  .g5 .strip{position:absolute;left:6%;right:6%;top:68%;height:14.2%;border-radius:2.4vh;background:linear-gradient(180deg,rgba(46,20,100,.94),rgba(14,6,42,.96));border:.5vh solid #ff5fa2;
    box-shadow:0 0 3vh rgba(255,95,162,.6),inset 0 0 3vh rgba(155,107,255,.4);display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .3s,transform .4s;z-index:6}
  .g5 .strip .chip{position:absolute;left:3%;top:-2.6vh;padding:.2rem 1.4rem;border-radius:2rem;font-size:2.1rem;font-weight:700;color:#14213d;background:linear-gradient(180deg,#ffe58a,#ffc83d);box-shadow:0 .3rem 0 #b5850c;white-space:nowrap}
  .g5 .strip .chip.dance{background:linear-gradient(180deg,#9bf5dd,#2ee6b6);box-shadow:0 .3rem 0 #138a6a}
  .g5 .strip .chip.ready{background:linear-gradient(180deg,#8fe3ff,#4cc9ff);box-shadow:0 .3rem 0 #1b7fae}
  .g5 .strip .dots{position:absolute;right:3%;top:-1.6vh;display:flex;gap:1rem}
  .g5 .strip .dots i{width:2.6rem;height:2.6rem;border-radius:50%;background:#3a2c7a;border:.3rem solid #fff;transition:all .1s}
  .g5 .strip .dots i.on{background:#ffc83d;box-shadow:0 0 1.6rem #ffc83d;transform:scale(1.25)}
  .g5 .strip .ly{display:flex;gap:1.7rem;align-items:baseline;white-space:nowrap;font-size:5.1rem;font-weight:700;line-height:1.08}
  .g5 .strip .ly .w{color:rgba(255,255,255,.4);transition:color .12s,transform .12s,text-shadow .12s;display:inline-block}
  .g5 .strip .ly .w.done{color:#ffe58a}
  .g5 .strip .ly .w.on{color:#fff;transform:scale(1.2) translateY(-.2rem);text-shadow:0 0 1.2rem #ff5fa2,0 0 3rem #ff5fa2}
  .g5 .strip .ly .w.last{text-decoration:underline;text-decoration-color:#ff5fa2;text-decoration-thickness:.35rem;text-underline-offset:.4rem}
  .g5 .strip .zh{font-size:2.1rem;font-weight:600;color:#d3defc;margin-top:.1rem}
  .g5 .pads{position:absolute;left:5%;right:5%;top:84.2%;height:14.2%;display:grid;grid-template-columns:repeat(4,1fr);gap:2vw;transition:opacity .3s,transform .4s;z-index:7}
  .g5 .pad{position:relative;border-radius:2rem;display:grid;place-items:center;font-size:3.6rem;font-weight:700;letter-spacing:.04em;color:#fff;touch-action:manipulation;cursor:pointer;-webkit-tap-highlight-color:transparent;
    background:radial-gradient(circle at 35% 25%,color-mix(in srgb,var(--pc) 45%,#fff),var(--pc) 58%,color-mix(in srgb,var(--pc) 62%,#000));
    box-shadow:0 .8rem 0 color-mix(in srgb,var(--pc) 50%,#000),0 0 2.4rem color-mix(in srgb,var(--pc) 70%,transparent);text-shadow:0 .25rem 0 rgba(0,0,0,.35)}
  .g5 .pad:before{content:"";position:absolute;left:8%;right:8%;top:7%;height:30%;border-radius:2rem;background:linear-gradient(180deg,rgba(255,255,255,.65),rgba(255,255,255,0))}
  .g5 .pad.down{transform:translateY(.6rem);box-shadow:0 .2rem 0 color-mix(in srgb,var(--pc) 50%,#000),0 0 5rem var(--pc)}
  .g5 .pad.cue{animation:g5cue calc(var(--spb)/2) ease-in-out infinite alternate;z-index:2}
  @keyframes g5cue{from{box-shadow:0 .8rem 0 color-mix(in srgb,var(--pc) 50%,#000),0 0 2rem var(--pc)}to{box-shadow:0 .8rem 0 color-mix(in srgb,var(--pc) 50%,#000),0 0 6rem 1rem var(--pc)}}
  .g5 .pad .rg{position:absolute;inset:-6%;border-radius:2.4rem;border:.55rem solid #fff;box-shadow:0 0 1.6rem #fff;pointer-events:none}
  .g5 .combo{position:absolute;left:1.4%;top:31%;width:13.5%;text-align:center;z-index:6;pointer-events:none;transition:opacity .3s}
  .g5 .combo small{display:block;font-size:2rem;font-weight:700;letter-spacing:.14em;color:#ffe58a;text-shadow:0 .2rem 0 rgba(0,0,0,.5)}
  .g5 .combo b{display:block;font-size:6.6rem;line-height:1;font-weight:700;color:#fff;text-shadow:0 .35rem 0 #ff5fa2,0 0 2rem #ff5fa2,0 .7rem 0 rgba(0,0,0,.35)}
  .g5 .combo.hot b{color:#ffe58a;text-shadow:0 .35rem 0 #ff9a2e,0 0 3rem #ffc83d,0 .7rem 0 rgba(0,0,0,.35)}
  .g5 .count{position:absolute;left:50%;top:36%;transform:translate(-50%,-50%);font-size:22rem;font-weight:700;line-height:1;color:#fff;text-shadow:0 1rem 0 #ff5fa2,0 0 6rem #ff5fa2;opacity:0;pointer-events:none;z-index:9}
  .g5 .flash{position:absolute;inset:0;pointer-events:none;background:radial-gradient(70% 60% at 50% 45%,rgba(255,150,220,.55),transparent);opacity:0;z-index:5}
  .g5 .rain{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:8}
  .g5 .fx{position:absolute;pointer-events:none;z-index:9}
  .g5:not(.live):not(.finale) .pads,.g5:not(.live):not(.finale) .strip,.g5:not(.live):not(.finale) .combo{opacity:0;pointer-events:none}
  .g5.wide .pads,.g5.asking .pads{opacity:0;pointer-events:none;transform:translateY(12%)}
  .g5.asking .strip{opacity:0;transform:translateY(10%)}
  .g5.wide .combo{opacity:0}
  .g5.wide .strip{top:82%}
  @media (prefers-reduced-motion:reduce){.g5 .beam,.g5 .ball{animation:none}}
  `;

  /* ====================================================================================================================
     STATE
     ==================================================================================================================== */
  let root, api0, ballw, djEl, ollSvg, avwrap, avBump, avEl, rowEls = [], podium, floorEl, tiles = [], stripEl, lyEl, zhEl, chipEl, dotEls = [], padEls = [], comboEl, countEl, flashEl, rainEl, spkEls = [];
  let combo = 0, hits = 0, danceOn = false, curMove = "wash", curLine = null, rainOn = false, rainParts = [], rainRAF = 0, tileN = 0;
  const B = { on: false, spb: 60 / BPM, next: 0, n: 0, cur: -1, k: 0, origin: 0, restart: false, rw: null, times: new Map(), cues: new Map(), waiters: [], tos: new Set(), timer: 0, ctx: null, out: null, noise: null, targets: new Map() };
  const now = () => performance.now() / 1000;

  /* ---------------- sound: a tiny disco band on WebAudio ---------------- */
  function vol() { return (TC.cfg && TC.cfg.volume != null ? TC.cfg.volume : 0.9); }
  function noiseBuf(c) { if (B.noise && B.noise.ctx === c) return B.noise.buf; const b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; B.noise = { ctx: c, buf: b }; return b; }
  function envG(c, dest, t, a, d, v) { const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); g.connect(dest); return g; }
  const V = {
    kick(c, o, t, v) { const os = c.createOscillator(); os.frequency.setValueAtTime(165, t); os.frequency.exponentialRampToValueAtTime(42, t + 0.15); os.connect(envG(c, o, t, 0.004, 0.24, 0.9 * v)); os.start(t); os.stop(t + 0.32); },
    tom(c, o, t, v) { const os = c.createOscillator(); os.type = "triangle"; os.frequency.setValueAtTime(260, t); os.frequency.exponentialRampToValueAtTime(70, t + 0.25); os.connect(envG(c, o, t, 0.004, 0.34, 0.95 * v)); os.start(t); os.stop(t + 0.42); },
    clap(c, o, t, v) { for (let i = 0; i < 3; i++) { const s = c.createBufferSource(), f = c.createBiquadFilter(); s.buffer = noiseBuf(c); f.type = "bandpass"; f.frequency.value = 1500; f.Q.value = 0.9; s.connect(f); f.connect(envG(c, o, t + i * 0.011, 0.002, i === 2 ? 0.14 : 0.03, 0.6 * v)); s.start(t + i * 0.011, Math.random() * 0.4); s.stop(t + 0.3); } },
    hat(c, o, t, v, open) { const s = c.createBufferSource(), f = c.createBiquadFilter(); s.buffer = noiseBuf(c); f.type = "highpass"; f.frequency.value = 7200; s.connect(f); f.connect(envG(c, o, t, 0.002, open ? 0.16 : 0.035, 0.26 * v)); s.start(t, Math.random() * 0.4); s.stop(t + 0.25); },
    bell(c, o, t, v) { [587, 845].forEach((fr) => { const os = c.createOscillator(); os.type = "square"; os.frequency.value = fr; const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1000; os.connect(f); f.connect(envG(c, o, t, 0.003, 0.3, 0.32 * v)); os.start(t); os.stop(t + 0.4); }); },
    zap(c, o, t, v) { const os = c.createOscillator(); os.type = "sawtooth"; os.frequency.setValueAtTime(420, t); os.frequency.exponentialRampToValueAtTime(1900, t + 0.18); const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 3200; os.connect(f); f.connect(envG(c, o, t, 0.01, 0.3, 0.3 * v)); os.start(t); os.stop(t + 0.4);
      [523, 659, 784].forEach((fr) => { const q = c.createOscillator(); q.type = "triangle"; q.frequency.value = fr; q.connect(envG(c, o, t, 0.01, 0.4, 0.2 * v)); q.start(t); q.stop(t + 0.5); }); },
    bass(c, o, t, v, fr, dur) { const os = c.createOscillator(); os.type = "sawtooth"; os.frequency.value = fr; const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 520; os.connect(f); f.connect(envG(c, o, t, 0.006, dur, 0.5 * v)); os.start(t); os.stop(t + dur + 0.05); },
    stab(c, o, t, v) { [262, 311, 392, 466].forEach((fr) => { const os = c.createOscillator(); os.type = "square"; os.frequency.value = fr; const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1700; os.connect(f); f.connect(envG(c, o, t, 0.005, 0.13, 0.07 * v)); os.start(t); os.stop(t + 0.2); }); }
  };
  /** one beat of the groove (four on the floor, claps on 2 and 4, off-beat hats, octave bass, little chord stabs) */
  function groove(t, k) {
    const c = B.ctx, o = B.out, sp = B.spb; if (!c || !o) return;
    const at = c.currentTime + Math.max(0, t - now()), bass = [65.4, 65.4, 77.8, 87.3][k];
    V.kick(c, o, at, 1);
    if (k === 1 || k === 3) V.clap(c, o, at, 1);
    V.hat(c, o, at, 0.5); V.hat(c, o, at + sp / 2, 1, k % 2 === 1);
    V.bass(c, o, at + sp / 2, 1, bass * 2, sp * 0.4); if (k !== 3) V.bass(c, o, at, 0.8, bass, sp * 0.35);
    if (k === 1 || k === 3) V.stab(c, o, at + sp / 2, 1);
  }
  function music(level, tc) { if (B.out && B.ctx) B.out.gain.setTargetAtTime(level * vol(), B.ctx.currentTime, tc || 0.08); }
  function padSound(i) {
    const c = B.ctx || TC.ac(); if (!c) return; const t = c.currentTime + 0.005, o = padOut(c), v = 1;
    ({ 0: V.tom, 1: V.clap, 2: V.bell, 3: V.zap })[i](c, o, t, v);
  }
  let padBus = null;
  function padOut(c) { if (!padBus || padBus.c !== c) { const g = c.createGain(); g.gain.value = 0.9 * vol(); g.connect(c.destination); padBus = { c, g }; } padBus.g.gain.value = 0.9 * vol(); return padBus.g; }

  /* ---------------- the beat clock: sound + a callback on every beat ---------------- */
  function startBeat() {
    stopBeat();
    const c = TC.ac(); B.ctx = c;
    if (c) { B.out = c.createGain(); B.out.gain.value = 0.85 * vol(); B.out.connect(c.destination); }
    B.on = true; B.n = 0; B.cur = -1; B.origin = 0; B.restart = true; B.next = now() + 0.12; B.times.clear(); B.cues.clear();
    B.timer = setInterval(tick, 25);
  }
  function stopBeat() {
    B.on = false; clearInterval(B.timer); B.timer = 0; B.tos.forEach(clearTimeout); B.tos.clear();
    B.cues.clear(); B.targets.clear(); B.times.clear();
    const w = B.waiters; B.waiters = []; w.forEach((x) => x.res());
    if (B.rw) { const r = B.rw.res; B.rw = null; r(-1); }
    if (B.out) { try { B.out.disconnect(); } catch (e) {} B.out = null; }
  }
  function tick() {
    if (!B.on) return;
    if (api0 && api0.aborted) { stopAll(); return; }
    while (B.next < now() + 0.12) { schedule(B.n, B.next); B.n++; B.next += B.spb; }
  }
  function schedule(n, t) {
    if (B.restart) { B.restart = false; B.origin = n; if (B.rw) { const r = B.rw.res; B.rw = null; r(n); } }
    const k = (((n - B.origin) % 4) + 4) % 4;
    B.times.set(n, t); B.times.delete(n - 24);
    groove(t, k);
    const id = setTimeout(() => { B.tos.delete(id); fire(n, k); }, Math.max(0, (t - now()) * 1000));
    B.tos.add(id);
  }
  function fire(n, k) {
    if (!B.on) return;
    B.cur = n; B.k = k; thump(k, n);
    const cs = B.cues.get(n); if (cs) { B.cues.delete(n); cs.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); }
    if (B.waiters.length) { const ready = B.waiters.filter((w) => w.beat <= n); B.waiters = B.waiters.filter((w) => w.beat > n); ready.forEach((w) => w.res()); }
  }
  const cueAt = (n, f) => { if (B.on && n <= B.cur) { try { f(); } catch (e) { console.error(e); } return; } if (!B.cues.has(n)) B.cues.set(n, []); B.cues.get(n).push(f); };
  const waitBeat = (n) => new Promise((res) => { if (!B.on || B.cur >= n) res(); else B.waiters.push({ beat: n, res }); });
  /** restart the bar so that the next beat is "1" (used when the music was silent); resolves with that beat's number */
  const barStart = () => new Promise((res) => { if (!B.on) { res(-1); return; } B.restart = true; B.rw = { res }; });

  /* ---------------- visuals on every beat ---------------- */
  function bump(el, s) { if (el && el.animate) el.animate([{ transform: `scale(${s},${(2 - s).toFixed(3)})` }, { transform: "scale(1,1)" }], { duration: 300, easing: "ease-out" }); }
  function thump(k, n) {
    if (!root) return;
    const big = k === 0, s = big ? 1.06 : 1.03;
    bump(ollBump, s); bump(avBump, s + 0.01); rowEls.forEach((e, i) => bump(e.firstChild, s + (i % 2 ? 0.015 : 0)));
    spkEls.forEach((e) => e.animate && e.animate([{ transform: "scale(1.18)" }, { transform: "scale(1)" }], { duration: 280, easing: "ease-out" }));
    if (flashEl && flashEl.animate) flashEl.animate([{ opacity: big ? 0.8 : 0.4 }, { opacity: 0 }], { duration: 420 });
    if (!root.classList.contains("wide") && root.classList.contains("live")) ripple();
    tileN = n; const m = n % 5;
    tiles.forEach((t, i) => { const x = i % 20, y = (i / 20) | 0, v = (x + y * 2 + n) % 6; t.className = v === 0 ? "a" : v === 2 ? "b" : v === 4 && m % 2 ? "c" : (x * 3 + y + n) % 11 === 0 ? "d" : ""; });
    dotEls.forEach((d, i) => d.classList.toggle("on", i === k));
  }
  function ripple(col) {
    const r = h("div", { class: "pring", style: `--pc:${col || (MOVES[curMove] || MOVES.wash).c}` });
    root.append(r);
    if (r.animate) { const a = r.animate([{ transform: "scale(.7)", opacity: 0.9 }, { transform: "scale(1.45,1.7)", opacity: 0 }], { duration: 700, easing: "ease-out" }); a.onfinish = () => r.remove(); } else r.remove();
  }

  /* ---------------- helpers for the scene ---------------- */
  let ollBump = null;
  function setMove(move) {
    curMove = move; avEl.innerHTML = ""; const b = h("div", { class: "bump", html: uniq(avatar(move, 0, true)).replace("<svg ", `<svg class="mv-${move}" `) }); avEl.append(b); avBump = b;
    if (b.animate) b.animate([{ transform: "scale(.55) rotate(-8deg)", opacity: 0 }, { transform: "scale(1.08) rotate(2deg)", opacity: 1, offset: 0.7 }, { transform: "scale(1)", opacity: 1 }], { duration: 520, easing: "ease-out" });
    podium.style.setProperty("--pc", MOVES[move].c);
    TC.sfx("pop");
  }
  function setRow(moves) {
    rowEls.forEach((e, i) => { const m = moves[i % moves.length]; e.innerHTML = ""; e.classList.remove("hot"); e.append(h("div", { class: "bump", html: uniq(avatar(m, i + 1, true)).replace("<svg ", `<svg class="mv-${m}" `) })); });
  }
  function setLyric(x, label, cls) {
    const words = String(x.say).split(/\s+/).filter(Boolean), lastN = String(x.w || "").toLowerCase();
    lyEl.innerHTML = ""; words.forEach((w) => lyEl.append(h("span", { class: "w" + (w.toLowerCase().replace(/[^a-z']/g, "") === lastN ? " last" : "") }, w)));
    zhEl.textContent = x.zh || ""; setChip(label, cls);
    if (lyEl.animate) lyEl.animate([{ transform: "translateX(35%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 420, easing: "cubic-bezier(.2,1.2,.4,1)" });
  }
  function setChip(t, cls) { chipEl.textContent = t || ""; chipEl.className = "chip" + (cls ? " " + cls : ""); chipEl.style.display = t ? "" : "none"; }
  /** light the words of the line on the beat: word i belongs to beat floor(i * 4 / count) of the bar */
  function lyricAt(k) {
    const ws = [...lyEl.children], n = ws.length;
    ws.forEach((w, i) => { const b = Math.floor((i * 4) / n); w.classList.toggle("on", b === k); w.classList.toggle("done", b < k); });
  }
  function lyricAll(on) { [...lyEl.children].forEach((w) => { w.classList.remove("on"); w.classList.toggle("done", !!on); }); }
  function setCombo(n, hot) { combo = n; comboEl.querySelector("b").textContent = n; comboEl.classList.toggle("hot", !!hot); comboEl.style.visibility = n > 0 ? "visible" : "hidden"; if (n && comboEl.animate) comboEl.animate([{ transform: "scale(1.4)" }, { transform: "scale(1)" }], { duration: 260, easing: "ease-out" }); }
  function notes(i, n) {
    const rc = padEls[i].getBoundingClientRect(), pr = root.getBoundingClientRect();
    for (let q = 0; q < n; q++) { const d = TC.artImg("chant-note", "fx"); const sz = 5 + Math.random() * 3;
      d.style.cssText = `left:${rc.left - pr.left + rc.width * (0.2 + Math.random() * 0.6)}px;top:${rc.top - pr.top - 10}px;width:${sz}vh;height:${sz}vh`; root.append(d);
      if (d.animate) { const a = d.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${(Math.random() - 0.5) * 140}px,-${130 + Math.random() * 120}px) rotate(${(Math.random() - 0.5) * 80}deg)`, opacity: 0 }], { duration: 1100 + Math.random() * 400, easing: "ease-out" }); a.onfinish = () => d.remove(); } else d.remove(); }
  }
  function cueRing(i) {
    const p = padEls[i]; p.classList.add("cue");
    const rg = h("div", { class: "rg" }); p.append(rg);
    if (rg.animate) { const a = rg.animate([{ transform: "scale(2.5,2.9)", opacity: 0.15 }, { transform: "scale(1,1)", opacity: 1 }], { duration: B.spb * 1000, easing: "linear", fill: "forwards" }); a.onfinish = () => setTimeout(() => rg.remove(), 90); } else setTimeout(() => rg.remove(), B.spb * 1000);
  }

  /* ---------------- tapping the pads ---------------- */
  function tap(i) {
    padSound(i); const p = padEls[i]; p.classList.add("down"); setTimeout(() => p.classList.remove("down"), 130);
    notes(i, 2); ripple(PADS[i][0]);
    if (!danceOn || !B.on) return;
    const T = now(); let best = null, bd = 9;
    B.targets.forEach((done, b) => { if (done) return; const bt = B.times.get(b); if (bt == null) return; const d = Math.abs(T - bt); if (d < bd) { bd = d; best = b; } });
    if (best == null || bd > B.spb * 0.46) return;
    B.targets.set(best, true); hits++;
    const perfect = bd <= 0.1, rc = p.getBoundingClientRect();
    setCombo(combo + 1, combo + 1 >= 6);
    TC.floatText(perfect ? "PERFECT!" : "GOOD!", ((rc.left + rc.width / 2) / innerWidth) * 100, ((rc.top - 30) / innerHeight) * 100, perfect ? "#ffe58a" : "#2ee6b6");
    TC.sfx("ding"); notes(i, perfect ? 4 : 2);
    if ((combo) % 4 === 0) TC.confetti(40);
  }

  /* ---------------- confetti shower for the finale ---------------- */
  function rain(on) {
    if (!on) { rainOn = false; return; }
    if (rainOn) return; rainOn = true; const cv = rainEl, W = (cv.width = cv.clientWidth || 1366), H = (cv.height = cv.clientHeight || 768), cx = cv.getContext("2d"), cols = ["#ffc83d", "#ff5fa2", "#2ee6b6", "#4cc9ff", "#9b6bff", "#ffffff"];
    (function loop() {
      if (!rainOn && !rainParts.length) { cx.clearRect(0, 0, W, H); rainRAF = 0; return; }
      if (rainOn) for (let i = 0; i < 5; i++) rainParts.push({ x: Math.random() * W, y: -20, vy: 3 + Math.random() * 4, vx: (Math.random() - 0.5) * 1.6, r: 7 + Math.random() * 9, c: cols[(Math.random() * 6) | 0], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3, ph: Math.random() * 6 });
      cx.clearRect(0, 0, W, H);
      rainParts.forEach((p) => { p.y += p.vy; p.x += p.vx + Math.sin(p.ph + p.y / 40) * 0.8; p.a += p.va; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c; cx.fillRect(-p.r / 2, -p.r / 3, p.r, p.r * 0.66); cx.restore(); });
      rainParts = rainParts.filter((p) => p.y < H + 30);
      rainRAF = requestAnimationFrame(loop);
    })();
  }
  function stopRain() { rainOn = false; rainParts = []; if (rainRAF) cancelAnimationFrame(rainRAF); rainRAF = 0; if (rainEl) { const cx = rainEl.getContext("2d"); cx.clearRect(0, 0, rainEl.width, rainEl.height); } }

  function stopAll() {
    stopBeat(); stopRain(); danceOn = false;
    document.querySelectorAll(".clap-banner").forEach((e) => e.remove());
    if (root) { root.querySelectorAll(".pring,.fx,.rg").forEach((e) => e.remove()); padEls.forEach((p) => p.classList.remove("cue", "down")); root.classList.remove("asking"); if (djEl) djEl.classList.remove("talk"); }
  }

  /* ====================================================================================================================
     BUILD
     ==================================================================================================================== */
  function build(api) {
    api0 = api;
    api.stage.append(h("style", {}, css));
    root = h("div", { class: "g5 wide" });
    const eq = h("div", { class: "eq" }); for (let i = 0; i < 28; i++) eq.append(h("i", { style: `--m:${(1 + ((i * 7) % 5) * 0.35).toFixed(2)};--dl:${(-(i * 0.37) % 2).toFixed(2)}s` }));
    root.append(eq);
    [["8%", "#ff5fa2", "-30deg", "5s"], ["26%", "#4cc9ff", "28deg", "6.5s"], ["44%", "#ffc83d", "-22deg", "4.5s"], ["60%", "#2ee6b6", "26deg", "7s"], ["78%", "#9b6bff", "-28deg", "5.5s"], ["94%", "#ff9a2e", "24deg", "6s"]]
      .forEach((b, i) => root.append(h("div", { class: "beam", style: `--x:${b[0]};--c:${b[1]};--r:${b[2]};--t:${b[3]};animation-delay:${-i * 0.9}s` })));
    floorEl = h("div", { class: "floor" }); tiles = []; for (let i = 0; i < 160; i++) { const t = h("i"); tiles.push(t); floorEl.append(t); } root.append(floorEl);
    for (let i = 0; i < 14; i++) root.append(h("div", { class: "dot", style: `left:${(i * 37 + 5) % 96}%;top:${12 + ((i * 29) % 44)}%;--dl:${-(i * 0.7).toFixed(1)}s` }));
    // mirror ball (drops in the finale) + lasers
    ballw = h("div", { class: "ballw" }, h("div", { class: "str" }), h("div", { class: "ball" })); root.append(ballw);
    [["#2bff9a", "-62deg", "50deg", "2.6s"], ["#ff3b9a", "-38deg", "26deg", "3.1s"], ["#4cc9ff", "-14deg", "0deg", "2.2s"], ["#ffe45e", "10deg", "-20deg", "3.4s"], ["#2bff9a", "34deg", "-50deg", "2.8s"], ["#ff3b9a", "58deg", "-70deg", "2.4s"]]
      .forEach((l, i) => root.append(h("div", { class: "laser", style: `--c:${l[0]};--a:${l[1]};--b:${l[2]};--t:${l[3]};animation-delay:${-i * 0.5}s` })));
    ["left:.5%", "right:.5%"].forEach((p) => root.append(h("div", { class: "spk", style: p }, h("i"), h("i"), h("b", { html: sealSvg("plate") })))); // maker's badge under the cones
    spkEls = [...root.querySelectorAll(".spk i")]; // only the cones thump on the beat
    podium = h("div", { class: "podium" }, h("b"), h("em")); root.append(podium);
    // DJ booth
    ollBump = h("div", { class: "bump", html: uniq(ollieDJ()) });
    djEl = h("div", { class: "dj" }, h("div", { class: "oll" }, ollBump),
      h("div", { class: "decks" }, h("div", { class: "top" }, h("div", { class: "plat l" }), h("div", { class: "mixer" }, ...[0, 1, 2, 3].map((i) => h("i", { style: `--m:${1 + i * 0.3};--dl:${-i * 0.2}s` }))), h("div", { class: "plat r", style: "animation-direction:reverse" })),
        h("div", { class: "front" }, ...["#ff5fa2", "#4cc9ff", "#ffc83d", "", "#2ee6b6", "#9b6bff", "#ff5fa2"].map((c, i) => c ? h("i", { style: `--lc:${c};--dl:${-i * 0.15}s` }) : h("b", { class: "logo", html: sealSvg("plate") })))));
    root.append(djEl);
    ollSvg = ollBump.firstChild;
    avEl = h("div", { class: "av" }); avwrap = h("div", { class: "avwrap" }, avEl); root.append(avwrap);
    const row = h("div", { class: "row" }); rowEls = [10.5, 26, 74, 89.5].map((x, i) => { const e = h("div", { class: "av", style: `--x:${x}%;--pd:${i * 0.12}s` }); row.append(e); return e; }); root.append(row);
    // lyric strip, pads, combo
    chipEl = h("div", { class: "chip" }); dotEls = [0, 1, 2, 3].map(() => h("i")); lyEl = h("div", { class: "ly" }); zhEl = h("div", { class: "zh" });
    stripEl = h("div", { class: "strip" }, chipEl, h("div", { class: "dots" }, ...dotEls), lyEl, zhEl); root.append(stripEl);
    const pads = h("div", { class: "pads" });
    padEls = PADS.map((p, i) => { const e = h("div", { class: "pad", style: `--pc:${p[0]}` }, p[1]); e.addEventListener("pointerdown", (ev) => { ev.preventDefault(); TC.ac(); tap(i); }); pads.append(e); return e; });
    root.append(pads);
    comboEl = h("div", { class: "combo" }, h("small", {}, "COMBO"), h("b", {}, "0")); comboEl.style.visibility = "hidden"; root.append(comboEl);
    countEl = h("div", { class: "count" }); flashEl = h("div", { class: "flash" }); rainEl = h("canvas", { class: "rain" }); root.append(flashEl, rainEl, countEl);
    api.stage.append(root);
    setMove("wash"); setRow(["wash", "brush", "run", "wake"]); lyEl.innerHTML = "";
  }

  function attract() {
    stopAll(); if (!root) return;
    root.className = "g5 wide"; setRow(["wash", "brush", "run", "wake"]); setCombo(0); music(0);
    root.querySelectorAll(".fx").forEach((e) => e.remove());
  }

  /* ====================================================================================================================
     PLAY
     ==================================================================================================================== */
  async function play(api) {
    api0 = api; stopAll();
    const G = api.G, pool = ((G && G.lines) || []).slice(), lines = [], n0 = Math.min(TC.rounds(4), pool.length);
    if (!pool.length) return { ok: true };
    while (lines.length < n0) lines.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
    const N = lines.length + 1, aborted = () => api.aborted;
    const quit = () => { stopAll(); return null; };
    root.className = "g5 live"; hits = 0; setCombo(0); lyEl.innerHTML = ""; zhEl.textContent = "";
    api.progress(0, N);

    /* intro: count-in bar */
    startBeat(); const first = barStart(); const b0 = await first; if (aborted() || b0 < 0) return quit();
    music(0.85, 0.05);
    setMove(lines[0].move); setChip("READY? 準備！", "ready"); lyEl.innerHTML = ""; zhEl.textContent = "跟著 Ollie 唸，跟著節奏拍！";
    ["1", "2", "3", "4"].forEach((t, k) => cueAt(b0 + k, () => { countEl.textContent = t; if (countEl.animate) countEl.animate([{ opacity: 1, transform: "translate(-50%,-50%) scale(1.5)" }, { opacity: 0, transform: "translate(-50%,-50%) scale(.8)" }], { duration: 560, easing: "ease-out" }); }));
    TC.floatText("CLASSROOM BEAT!", 50, 30, "#ffe58a");
    await waitBeat(b0 + 4); if (aborted()) return quit();

    for (let i = 0; i < lines.length; i++) {
      const x = lines[i]; api.progress(i, N); curLine = x;
      const mv = MOVES[x.move] ? x.move : "run";
      /* the bar restarts here (the music is silent after a question) */
      const bp = i === 0 ? Promise.resolve(b0 + 4) : barStart(); // first line follows the count-in bar
      if (i > 0) { root.classList.remove("asking"); music(0.85, 0.05); }
      const B0 = await bp; if (aborted() || B0 < 0) return quit();
      setMove(mv); setLyric(x, "LISTEN 聽 Ollie 唸！", "");
      const D0 = B0 + 4, DEND = D0 + 4 * BREAK_BARS;
      // 1. Ollie chants the line over the beat (words light up on the beat)
      for (let k = 0; k < 4; k++) cueAt(B0 + k, () => lyricAt(k));
      djEl.classList.add("talk"); cueAt(D0, () => djEl.classList.remove("talk"));
      const said = Promise.resolve(TC.teacherLine(x.say)).catch(() => {});
      // 2. dance break: everybody does the move, the child taps the pads on the beat
      B.targets.clear();
      cueAt(D0, () => { danceOn = true; setChip("DANCE! 大家一起跳！", "dance"); music(1, 0.05); TC.sfx("whoosh"); });
      for (let r = 0; r < BREAK_BARS; r++) for (let k = 0; k < 4; k++) {
        const b = D0 + 4 * r + k, pad = r % 2 ? 3 - k : k; B.targets.set(b, false);
        cueAt(b - 1, () => cueRing(pad));
        cueAt(b, () => { lyricAt(k); padEls[pad].classList.remove("cue"); });
      }
      cueAt(DEND - 1, () => {});
      cueAt(DEND, () => { danceOn = false; lyricAll(true); padEls.forEach((p) => p.classList.remove("cue")); const got = [...B.targets.values()].filter(Boolean).length; B.targets.clear();
        if (got >= 4) { TC.floatText(got >= 7 ? "AMAZING BEAT!" : "GREAT BEAT!", 50, 30, "#ffe58a"); TC.confetti(70); TC.sfx("levelup"); } });
      await Promise.all([said, waitBeat(D0)]); if (aborted()) return quit();
      await waitBeat(DEND); if (aborted()) return quit();
      // 3. your turn: say the last word
      music(0, 0.06); root.classList.add("asking"); setChip("");
      const r = await api.ask({ teacher: "Your turn!", tzh: "換你唸！", say: x.say, zh: x.zh, keys: [[x.w]], word: x.w, hideKey: true });
      if (aborted()) return quit();
      if (r && r.ok) { TC.confetti(110); TC.floatText("YEAH!", 50, 30, MOVES[mv].c); ripple(MOVES[mv].c); await TC.praise(); if (aborted()) return quit(); }
      TC.hideTalk();
    }

    /* finale */
    api.progress(lines.length, N);
    root.classList.remove("asking"); music(0.9, 0.05);
    const fp = barStart(); const F0 = await fp; if (aborted() || F0 < 0) return quit();
    setRow(lines.map((l) => l.move)); root.classList.add("wide", "finale"); setChip("ALL TOGETHER! 大家一起唸！", "dance"); lyEl.innerHTML = ""; zhEl.textContent = "";
    TC.sfx("fanfare"); TC.confetti(200); rain(true); TC.floatText("PARTY TIME!", 50, 30, "#ffe58a");
    await waitBeat(F0 + 4); if (aborted()) return quit();
    for (let i = 0; i < lines.length; i++) {
      const x = lines[i], S0 = F0 + 4 + 4 * i;
      if (i === 0) { /* S0 is the beat we are on: cues for it already passed, light by hand */ }
      setLyric(x, "ALL TOGETHER! 大家一起唸！", "dance"); lyricAt(0);
      rowEls.forEach((e, j) => e.classList.toggle("hot", j === i % rowEls.length));
      for (let k = 1; k < 4; k++) cueAt(S0 + k, () => lyricAt(k));
      djEl.classList.add("talk"); const said = Promise.resolve(TC.teacherLine(x.say)).catch(() => {});
      if (i % 2 === 0) TC.confetti(90);
      await Promise.all([said, waitBeat(S0 + 4)]); djEl.classList.remove("talk"); if (aborted()) return quit();
    }
    rowEls.forEach((e) => e.classList.add("hot")); setChip("THANK YOU! 謝謝大家！", "dance"); lyricAll(true); TC.confetti(220); TC.sfx("levelup");
    music(0.6, 0.2);
    await TC.clapBanner(); if (aborted()) return quit();
    rain(false); await sleep(700); if (aborted()) return quit();
    api.progress(N, N);
    stopAll();
    return { ok: true };
  }

  TC.games.chant = {
    startArt: ["chant-dj", "chant-ball", "chant-vinyl", "chant-wash", "chant-brush", "chant-run"],
    mount(api) { build(api); attract(); },
    idle() { attract(); },
    play
  };
})();
