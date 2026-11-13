/* Gate 5 · Mystery Box — tap the box open, the WEATHER bursts out and fills the scene, say the weather word (passport L5 weather, L3 hungry) */
(function () {
  "use strict";
  TC.games = TC.games || {};

  /* ---------- original weather pictures (glossy 3D toy style, like js/art.js) ---------- */
  /** a fluffy cloud of bubbly puffs; with a cute face if face is true */
  function puff(c, x, y, k, col, face) {
    let s = c.ell(x, y + 18 * k, 58 * k, 20 * k, col, 0, 0);
    s += c.sphere(x - 34 * k, y + 6 * k, 26 * k, col, 0.35) + c.sphere(x + 36 * k, y + 8 * k, 24 * k, col, 0.35) + c.sphere(x - 2 * k, y - 10 * k, 38 * k, col, 0.55);
    if (face) s += c.eyes(x - 2 * k, y + 4 * k, 14 * k, 6.5 * k) + c.blush(x - 2 * k, y + 16 * k, 27 * k) + c.smile(x - 2 * k, y + 14 * k, 6 * k);
    return s;
  }
  const drop = (c, x, y, k = 1) => c.path(`M${x} ${y - 14 * k} C${x + 9 * k} ${y - 2 * k} ${x + 9 * k} ${y + 9 * k} ${x} ${y + 9 * k} C${x - 9 * k} ${y + 9 * k} ${x - 9 * k} ${y - 2 * k} ${x} ${y - 14 * k}Z`, "#45b0ff") + c.hl(x - 3 * k, y + 1 * k, 2.6 * k, 5 * k, 10, 0.9);
  const leaf = (c, x, y, rot, col, k = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})">` + c.path("M0 -17 Q15 -4 0 17 Q-15 -4 0 -17Z", col) +
    `<path d="M0 -12 V14 M0 -2 l6 -5 M0 5 l-6 -5" stroke="#000" stroke-opacity=".22" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;
  const flake = (x, y, r) => { let d = ""; for (let i = 0; i < 3; i++) { const a = (i * Math.PI) / 3, dx = Math.cos(a) * r, dy = Math.sin(a) * r; d += `M${x - dx} ${y - dy} L${x + dx} ${y + dy} `; }
    for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3, bx = x + Math.cos(a) * r * 0.55, by = y + Math.sin(a) * r * 0.55, t = r * 0.32;
      d += `M${bx + Math.cos(a + 2.4) * t} ${by + Math.sin(a + 2.4) * t} L${bx} ${by} L${bx + Math.cos(a - 2.4) * t} ${by + Math.sin(a - 2.4) * t} `; }
    return `<path d="${d}" stroke="#8fcaff" stroke-width="5.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#fff" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; };
  const WX_ART = {
    /* a big smiling sun with glossy rays */
    "wx-sunny"() {
      const c = TC.ArtCtx();
      let s = `<defs><radialGradient id="sunGlow"><stop offset=".45" stop-color="#ffe066" stop-opacity=".7"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="100" r="99" fill="url(#sunGlow)"/>`;
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6 - Math.PI / 2, w = 0.16, r0 = 54, r1 = i % 2 ? 82 : 95, col = i % 2 ? "#ffb300" : "#ffd23d";
        const P = (ang, r) => `${(100 + Math.cos(ang) * r).toFixed(1)} ${(100 + Math.sin(ang) * r).toFixed(1)}`;
        s += `<path d="M${P(a - w, r0)} L${P(a, r1)} L${P(a + w, r0)}Z" fill="${c.g(col)}" stroke="${col}" stroke-width="7" stroke-linejoin="round"/>`;
      }
      s += c.sphere(100, 100, 60, "#ffc21f", 0.85);
      s += c.eyes(100, 92, 21, 9.5) + c.blush(100, 111, 36);
      s += `<path d="M81 111 Q100 136 119 111 Q100 119 81 111Z" fill="#b4380f"/><path d="M91 121 Q100 130 109 121 Q100 117 91 121Z" fill="#ff7a8a"/>`;
      return c.out(s);
    },
    /* a grey rain cloud, falling drops and a pink umbrella */
    "wx-rainy"() {
      const c = TC.ArtCtx();
      let s = c.shadow(132, 194, 50, 6);
      [[40, 120, 1], [72, 140, 0.9], [30, 162, 0.85], [62, 182, 1], [100, 124, 0.75], [92, 168, 0.8], [154, 98, 0.6], [124, 102, 0.55]].forEach(([x, y, k]) => (s += drop(c, x, y, k)));
      s += puff(c, 98, 52, 1.15, "#a7b6d4", true);
      s += `<path d="M142 154 V182 Q142 193 131 193 Q122 193 122 184" stroke="#8a4a22" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      s += c.path("M98 156 Q98 114 142 112 Q186 114 186 156 Q175 147 164 156 Q153 147 142 156 Q131 147 120 156 Q109 147 98 156Z", "#ff4f7b");
      s += c.path("M142 112 Q126 128 120 156 Q131 147 142 156 Q153 147 164 156 Q158 128 142 112Z", "#ff9ab8") + c.sphere(142, 110, 5, "#ffd21f") + c.hl(118, 128, 16, 7, -40, 0.65);
      s += `<g stroke="#bfe6ff" stroke-width="3" stroke-linecap="round" fill="none"><path d="M106 132 l-6 -6 M112 124 l-3 -8 M178 132 l6 -6 M172 124 l3 -8"/></g>`;
      return c.out(s);
    },
    /* three fluffy clouds, the front one smiling */
    "wx-cloudy"() {
      const c = TC.ArtCtx();
      let s = c.shadow(100, 190, 62, 7);
      s += puff(c, 62, 60, 0.8, "#c7d1ea") + puff(c, 148, 80, 0.72, "#dde5f6") + puff(c, 100, 128, 1.15, "#ffffff", true);
      return c.out(s);
    },
    /* wind swirls, a smiling kite and leaves blowing */
    "wx-windy"() {
      const c = TC.ArtCtx(), sw = c.v("#ffffff", "#9fe2ff");
      let s = `<path d="M150 82 Q120 130 70 196" stroke="#fff" stroke-opacity=".75" stroke-width="1.6" fill="none"/>`;
      s += `<g stroke="${sw}" stroke-width="10" fill="none" stroke-linecap="round"><path d="M8 96 H94 Q126 96 126 70 Q126 48 104 48 Q86 48 86 66 Q86 78 98 78"/><path d="M22 132 H136 Q164 132 164 156 Q164 176 144 176 Q128 176 128 162"/><path d="M6 166 H66 Q86 166 86 184" stroke-width="8"/></g>`;
      s += `<path d="M154 84 Q144 102 158 116 Q172 132 156 150" stroke="#fff" stroke-width="2.4" fill="none"/>`;
      [[152, 100, "#ff5fa2"], [163, 124, "#ffd21f"], [157, 146, "#2ee6b6"]].forEach(([x, y, col]) => (s += c.path(`M${x} ${y} l-9 -6 v12Z M${x} ${y} l9 -6 v12Z`, col)));
      s += c.path("M122 42 L154 4 L154 42Z", "#ff5fa2") + c.path("M154 4 L188 42 L154 42Z", "#ffd21f") + c.path("M154 42 L188 42 L154 86Z", "#3d8bff") + c.path("M122 42 L154 42 L154 86Z", "#2ee6b6");
      s += `<path d="M154 4 V86 M122 42 H188" stroke="#8a4a22" stroke-width="2.4" opacity=".7"/>` + c.hl(140, 26, 12, 5, -45, 0.8);
      s += `<circle cx="154" cy="44" r="15" fill="#fff" opacity=".9"/>` + c.eyes(154, 42, 7, 3.6) + c.smile(154, 49, 3.6);
      [[36, 38, -30, "#5bd36a", 1.1], [80, 20, 50, "#ffb02e", 0.9], [106, 112, 70, "#ff7a3d", 0.9], [186, 110, -20, "#5bd36a", 0.85], [112, 186, 20, "#ffc83d", 0.9]].forEach(([x, y, r, col, k]) => (s += leaf(c, x, y, r, col, k)));
      return c.out(s);
    },
    /* a snow cloud, snowflakes and a smiling snowman */
    "wx-snowy"() {
      const c = TC.ArtCtx();
      let s = c.ell(128, 188, 70, 11, "#eef5ff", 0, 0.5);
      [[34, 116, 11], [70, 142, 9], [26, 168, 8], [92, 116, 7], [180, 36, 10], [178, 82, 7], [60, 186, 7]].forEach(([x, y, r]) => (s += flake(x, y, r)));
      s += puff(c, 92, 52, 1.05, "#e6efff", true);
      s += `<g stroke="#7a4a22" stroke-width="4" stroke-linecap="round" fill="none"><path d="M114 152 L92 134 M98 139 l-8 1"/><path d="M166 152 L188 136 M182 141 l5 -7"/></g>`;
      s += c.sphere(140, 162, 30, "#f6f9ff", 0.6) + c.sphere(140, 114, 23, "#f6f9ff", 0.7);
      s += c.path("M118 104 Q118 82 140 82 Q162 82 162 104 Q140 97 118 104Z", "#3d8bff") + `<rect x="116" y="99" width="48" height="8" rx="4" fill="${c.g("#9bd0ff")}"/>` + c.sphere(140, 80, 6, "#ffffff", 0.4);
      s += c.eyes(140, 112, 8, 4) + c.path("M140 118 L157 122 L140 125Z", "#ff9a2e") + c.smile(138, 128, 4) + c.blush(140, 124, 15);
      s += c.path("M120 133 Q140 142 160 133 L161 141 Q140 151 119 141Z", "#ff4b55") + c.path("M148 140 l5 22 l10 -3 l-5 -21Z", "#ff4b55");
      s += `<circle cx="140" cy="182" r="3.6" fill="#26293a"/>`;
      return c.out(s);
    }
  };
  const WX_SEAL = { "wx-sunny": [150, 150, 16, -10], "wx-rainy": [178, 180, 14, -8], "wx-cloudy": [150, 156, 16, -8], "wx-windy": [176, 186, 14, -8], "wx-snowy": [140, 166, 11] };
  Object.keys(WX_ART).forEach((n) => { if (!TC.ART[n]) { TC.ART[n] = WX_ART[n]; TC.SEAL[n] = WX_SEAL[n]; } });

  /* ---------- styles ---------- */
  const css = `
  .g5{position:absolute;inset:0;overflow:hidden;background:radial-gradient(80% 70% at 50% 45%,#3a2a7a,#0d0a26)}
  .g5 .shelf{position:absolute;left:0;right:0;top:66%;height:4%;background:linear-gradient(#b07a4a,#6d4527);box-shadow:0 1vh 2vh rgba(0,0,0,.5)}
  .g5 .boxpos{position:absolute;left:50%;top:26%;width:30vh;height:30vh;margin-left:-15vh;transform-origin:50% 100%;transition:transform .6s cubic-bezier(.4,1.2,.5,1),opacity .3s}
  .g5 .side .boxpos{transform:translate(-39vw,9vh) scale(.62)}
  .g5 .bye .boxpos{opacity:0}
  .g5 .boxw{position:absolute;inset:0;transform-origin:50% 100%;perspective:120vh;cursor:pointer;touch-action:manipulation}
  .g5 .boxw.drop{animation:dropIn .8s cubic-bezier(.3,1.4,.5,1)}
  .g5 .boxw.shake{animation:shake .45s infinite}
  @keyframes dropIn{from{transform:translateY(-80vh)}}
  .g5 .cube{position:absolute;left:calc(50% - 11vh);width:22vh;bottom:4%;height:22vh;transform-style:preserve-3d;animation:cubeTurn 6s ease-in-out infinite}
  @keyframes cubeTurn{0%,100%{transform:rotateX(-14deg) rotateY(-28deg)}50%{transform:rotateX(-14deg) rotateY(28deg)}}
  .g5 .face{position:absolute;inset:0;border-radius:1vh;display:grid;place-items:center;backface-visibility:hidden;
     background:linear-gradient(90deg,transparent 42%,#ffe58a 42%,#ffd21f 58%,transparent 58%),linear-gradient(135deg,color-mix(in srgb,var(--c1) 70%,#fff),var(--c1) 45%,var(--c2));
     box-shadow:inset 0 0 0 .5vh rgba(255,255,255,.25),inset 0 -2vh 3vh rgba(0,0,0,.2)}
  .g5 .face b{font-size:12vh;color:#fff;text-shadow:0 .6vh 0 rgba(0,0,0,.25),0 0 2vh rgba(255,255,255,.6)}
  .g5 .f-front{transform:translateZ(11vh)}.g5 .f-back{transform:rotateY(180deg) translateZ(11vh)}
  .g5 .f-right{transform:rotateY(90deg) translateZ(11vh)}.g5 .f-left{transform:rotateY(-90deg) translateZ(11vh)}
  .g5 .f-bottom{transform:rotateX(-90deg) translateZ(11vh);filter:brightness(.6)}
  .g5 .lid3{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .8s cubic-bezier(.3,1.4,.5,1),opacity .8s}
  .g5 .f-top{transform:rotateX(90deg) translateZ(11vh);background:linear-gradient(90deg,transparent 42%,#ffe58a 42%,#ffd21f 58%,transparent 58%),linear-gradient(0deg,transparent 42%,#ffe58a 42%,#ffd21f 58%,transparent 58%),linear-gradient(135deg,color-mix(in srgb,var(--c2) 60%,#fff),var(--c2))}
  .g5 .bow{position:absolute;left:50%;top:6.5vh;z-index:2;width:16vh;height:10vh;margin-left:-8vh;transform:translateZ(0) translateY(-50%);pointer-events:none;
     background:radial-gradient(circle at 50% 60%,#ffe58a 0 18%,transparent 19%),radial-gradient(ellipse 34% 48% at 26% 50%,#ffd21f 60%,transparent 62%),radial-gradient(ellipse 34% 48% at 74% 50%,#ffd21f 60%,transparent 62%);filter:drop-shadow(0 .5vh .5vh rgba(0,0,0,.3))}
  .g5 .open .lid3{transform:translateY(-55vh) rotateX(70deg) rotateZ(30deg);opacity:0}
  .g5 .open .cube{animation-play-state:paused}
  .g5 .open .f-front b{opacity:0}
  .g5 .beams{position:absolute;left:50%;top:50%;width:120vh;height:120vh;margin:-60vh 0 0 -60vh;border-radius:50%;opacity:0;pointer-events:none;background:repeating-conic-gradient(var(--beam) 0 8deg,transparent 8deg 22deg);transition:opacity .4s;animation:spin 6s linear infinite;mask:radial-gradient(circle,#000 10%,transparent 60%);-webkit-mask:radial-gradient(circle,#000 10%,transparent 60%)}
  .g5 .open .beams{opacity:.9}
  .g5 .open .bow{opacity:0;transition:opacity .3s}
  .g5 .rar{position:absolute;left:50%;top:-2.5vh;transform:translateX(-50%);font-size:3.2rem;font-weight:700;letter-spacing:.2em;white-space:nowrap;opacity:0;pointer-events:none;text-shadow:0 0 2rem currentColor}
  .g5 .open .rar{opacity:1;transition:opacity .4s .3s}
  .g5 .snap,.g5 .snap *{transition:none!important}
  /* the weather picture: big, between Ollie's subtitle (top) and the talk bar (bottom) */
  .g5 .wxpic{position:absolute;left:57%;top:15.4rem;bottom:21.6rem;aspect-ratio:1;transform:translateX(-50%);pointer-events:none;visibility:hidden}
  .g5 .wxpic.on{visibility:visible}
  .g5 .wxpic::before{content:"";position:absolute;inset:-12%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.5),rgba(255,255,255,.18) 60%,transparent)}
  .g5 .wxpic img{position:relative;display:block;width:100%;height:100%;filter:drop-shadow(0 1.2vh 1.4vh rgba(0,0,0,.45));animation:bob 2.6s ease-in-out infinite}
  .g5 .wxpic.cheer img{animation:cheer .6s ease-in-out infinite}
  .g5 .label{position:absolute;left:57%;top:72%;transform:translateX(-50%);font-size:9rem;line-height:1.1;font-weight:700;color:#ffc83d;white-space:nowrap;opacity:0;transition:opacity .3s;text-shadow:0 .4rem 0 #7a3d00,0 0 3rem rgba(255,200,61,.6);pointer-events:none}
  .g5 .label.small{font-size:6.4rem;color:#fff;text-shadow:0 .3rem 0 #000}
  .g5 .label.on{opacity:1;animation:pop .35s cubic-bezier(.2,1.6,.4,1)}
  /* the collection: every weather that came out of a box */
  .g5 .shelfItems{position:absolute;right:1.2%;top:9rem;display:flex;flex-direction:column;gap:1vh;padding:1vh;border-radius:2vh;background:rgba(255,255,255,.1);box-shadow:inset 0 0 0 .3vh rgba(255,255,255,.15);min-height:9vh;min-width:9vh}
  .g5 .shelfItems:empty{visibility:hidden}
  .g5 .got{position:relative;width:9vh;text-align:center;animation:pop .45s}
  .g5 .got.hold{visibility:hidden;animation:none}
  .g5 .got img{display:block;width:8.4vh;height:8.4vh;margin:0 auto;filter:drop-shadow(0 .5vh .5vh rgba(0,0,0,.4))}
  .g5 .got b{display:block;font-size:1.9vh;line-height:1.1;color:#fff}
  .g5 .got.cheer img{animation:cheer .6s ease-in-out infinite}
  .g5 .tapopen{position:absolute;left:0;right:0;top:76%;text-align:center;font-size:3.2rem;font-weight:700;color:#ffc83d;text-shadow:0 .3rem 0 #000;animation:float 1s ease-in-out infinite;white-space:nowrap;pointer-events:none}
  /* full-screen weather effects (pure CSS transforms: light enough for a classroom PC) */
  .g5 .fx{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .9s}
  .g5 .fx.on{opacity:1}
  .g5 .fx>div{position:absolute;inset:0;display:none;overflow:hidden}
  .g5 .fx[data-w=sunny] .fx-sunny,.g5 .fx[data-w=rainy] .fx-rainy,.g5 .fx[data-w=cloudy] .fx-cloudy,.g5 .fx[data-w=windy] .fx-windy,.g5 .fx[data-w=snowy] .fx-snowy{display:block}
  .g5 .fx-sunny{background:radial-gradient(70% 80% at 80% 0%,rgba(255,196,60,.55),rgba(255,140,60,.18) 55%,transparent 80%),linear-gradient(rgba(255,170,70,.22),rgba(255,120,80,.12))}
  .g5 .fx-sunny .rays{position:absolute;left:80%;top:0;width:220vh;height:220vh;margin:-110vh 0 0 -110vh;background:repeating-conic-gradient(rgba(255,236,140,.26) 0 7deg,transparent 7deg 20deg);
     mask:radial-gradient(circle,#000 5%,transparent 62%);-webkit-mask:radial-gradient(circle,#000 5%,transparent 62%);animation:spin 50s linear infinite}
  .g5 .fx-rainy{background:linear-gradient(rgba(24,32,60,.62),rgba(30,46,80,.5))}
  .g5 .fx-rainy i{position:absolute;top:-12vh;width:.35vh;height:7vh;border-radius:1vh;background:linear-gradient(rgba(159,216,255,0),#bfe6ff);animation:g5rain .8s linear infinite}
  @keyframes g5rain{from{transform:translate(0,0) rotate(14deg)}to{transform:translate(-30vh,124vh) rotate(14deg)}}
  .g5 .fx-cloudy{background:linear-gradient(rgba(118,128,160,.5),rgba(80,90,130,.35))}
  .g5 .fx-cloudy img{position:absolute;left:0;opacity:.5;animation:g5cloud linear infinite}
  @keyframes g5cloud{from{transform:translateX(-40vh)}to{transform:translateX(calc(100vw + 10vh))}}
  .g5 .fx-windy{background:linear-gradient(100deg,rgba(40,150,170,.32),rgba(80,190,170,.14))}
  .g5 .fx-windy i{position:absolute;left:0;height:.45vh;border-radius:1vh;background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent);animation:g5streak linear infinite}
  @keyframes g5streak{from{transform:translateX(-40vw)}to{transform:translateX(120vw)}}
  .g5 .fx-windy img{position:absolute;left:0;animation:g5leaf linear infinite}
  @keyframes g5leaf{0%{transform:translate(-10vw,0) rotate(0)}30%{transform:translate(28vw,-7vh) rotate(260deg)}60%{transform:translate(62vw,4vh) rotate(520deg)}100%{transform:translate(112vw,-5vh) rotate(860deg)}}
  .g5 .fx-snowy{background:linear-gradient(rgba(140,180,235,.38),rgba(200,225,255,.22)),radial-gradient(90% 30% at 50% 100%,rgba(255,255,255,.35),transparent)}
  .g5 .fx-snowy i{position:absolute;top:-4vh;border-radius:50%;background:#fff;box-shadow:0 0 .8vh rgba(255,255,255,.9);animation:g5snow linear infinite}
  @keyframes g5snow{0%{transform:translate(0,0)}25%{transform:translate(3vh,28vh)}50%{transform:translate(-2vh,56vh)}75%{transform:translate(3vh,84vh)}100%{transform:translate(0,112vh)}}
  /* finale: a picnic under the sun */
  .g5 .picnic{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .5s}
  .g5 .picnic.on{opacity:1}
  .g5 .blanket{position:absolute;left:18%;right:18%;top:49%;height:15%;border-radius:2vh;transform:perspective(60vh) rotateX(50deg);transform-origin:50% 100%;
     background:repeating-conic-gradient(#ff5d6c 0 25%,#fff4f4 0 50%) 0 0/7vh 7vh;box-shadow:0 1.4vh 2vh rgba(0,0,0,.45),inset 0 0 0 .6vh #e8414f}
  .g5 .plate{position:absolute;width:11vh;height:5vh;margin:-2.5vh 0 0 -5.5vh;border-radius:50%;background:radial-gradient(closest-side,#fff 62%,#dfe6f5 64%,#fff 80%,#c9d3ea);box-shadow:0 .6vh .8vh rgba(0,0,0,.3)}
  .g5 .snack{position:absolute;width:10vh;height:10vh;margin:-8.5vh 0 0 -5vh;visibility:hidden;filter:drop-shadow(0 .6vh .6vh rgba(0,0,0,.4))}
  .g5 .snack.cheer{animation:cheer .6s ease-in-out infinite}
  .g5 .think{position:absolute;width:13vh;height:13vh;margin:-6.5vh 0 0 -6.5vh;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 .6vh 1.2vh rgba(0,0,0,.35);transition:opacity .3s,transform .3s;animation:float 1.6s ease-in-out infinite}
  .g5 .think::after{content:"";position:absolute;left:12%;bottom:-6%;width:20%;height:20%;border-radius:50%;background:#fff}
  .g5 .think.r::after{left:auto;right:12%}
  .g5 .think img{width:76%;height:76%}
  .g5 .think.off{opacity:0;transform:scale(.3)}
  `;
  const RAR = [{ n: "COMMON", c1: "#3d8bff", c2: "#2ee6b6", beam: "rgba(76,201,255,.55)", col: "#4cc9ff" },
               { n: "RARE", c1: "#9b6bff", c2: "#ff5fa2", beam: "rgba(155,107,255,.6)", col: "#c9a8ff" },
               { n: "EPIC", c1: "#ff5fa2", c2: "#ff9a2e", beam: "rgba(255,95,162,.6)", col: "#ff8cc0" },
               { n: "LEGENDARY", c1: "#ffc83d", c2: "#ff9a2e", beam: "rgba(255,210,80,.75)", col: "#ffc83d" }];
  const FOOD = ["cake", "pizza", "apple", "ice-cream", "banana", "cookie", "strawberry", "watermelon", "hamburger"];
  // where the snacks land on the picnic blanket (x %, y %) and where the "I'm hungry" thought bubbles float
  const PLATES = [[24, 59], [32, 53], [39, 62], [61, 62], [68, 53], [76, 59]];
  const THINK = [[25, 33, ""], [75, 33, "r"], [13, 46, ""], [87, 46, "r"]];
  // a little sound for each kind of weather as it bursts out
  const WX_SFX = { sunny: ["sparkle", "ding"], rainy: ["snare", "hat", "snare", "hat"], cloudy: ["whoosh", "sparkle"], windy: ["whoosh", "boost"], snowy: ["sparkle", "tick", "sparkle"] };
  let root, scene, boxpos, boxw, rarEl, labelEl, shelf, tapOpen, fx, wxpic, wxImg, picnic, picnicTop, openReady = false, fxT = null;

  /** the drifting clouds and blowing leaves of the effects (no 土城 pin: they are background decoration) */
  function decoSvg(draw) { const c = TC.ArtCtx(); return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(c.out(draw(c))); }
  function buildFx() {
    fx = TC.h("div", { class: "fx" });
    const L = {}, R = Math.random;
    ["sunny", "rainy", "cloudy", "windy", "snowy"].forEach((w) => { L[w] = TC.h("div", { class: "fx-" + w }); fx.append(L[w]); });
    L.sunny.append(TC.h("div", { class: "rays" }));
    for (let i = 0; i < 64; i++) L.rainy.append(TC.h("i", { style: `left:${(i / 64) * 125 - 2}%;animation-duration:${0.55 + R() * 0.35}s;animation-delay:${-R()}s;opacity:${0.45 + R() * 0.5}` }));
    const cloud = decoSvg((c) => puff(c, 100, 100, 1.4, "#ffffff"));
    for (let i = 0; i < 7; i++) { const im = new Image(); im.src = cloud; im.alt = ""; const s = 18 + (i % 3) * 8;
      im.style.cssText = `top:${8 + ((i * 37) % 55)}%;width:${s * 1.3}vh;height:${s}vh;animation-duration:${26 + (i % 4) * 7}s;animation-delay:${-i * 6}s`; L.cloudy.append(im); }
    for (let i = 0; i < 12; i++) L.windy.append(TC.h("i", { style: `top:${6 + ((i * 41) % 86)}%;width:${16 + (i % 4) * 7}vw;animation-duration:${0.9 + (i % 5) * 0.25}s;animation-delay:${-R() * 2}s` }));
    const leaves = ["#5bd36a", "#ffb02e", "#ff7a3d", "#ffc83d"].map((col) => decoSvg((c) => `<g transform="translate(100 100) scale(5)">${c.path("M0 -17 Q15 -4 0 17 Q-15 -4 0 -17Z", col)}<path d="M0 -12 V14" stroke="#000" stroke-opacity=".22" stroke-width="1.6"/></g>`));
    for (let i = 0; i < 14; i++) { const im = new Image(); im.src = leaves[i % 4]; im.alt = "";
      im.style.cssText = `top:${4 + ((i * 29) % 88)}%;width:${4 + (i % 3) * 1.5}vh;height:${4 + (i % 3) * 1.5}vh;animation-duration:${2.6 + (i % 5) * 0.5}s;animation-delay:${-R() * 4}s`; L.windy.append(im); }
    for (let i = 0; i < 70; i++) { const s = 0.6 + R() * 1.2; L.snowy.append(TC.h("i", { style: `left:${R() * 100}%;width:${s}vh;height:${s}vh;opacity:${0.6 + R() * 0.4};animation-duration:${5 + R() * 5}s;animation-delay:${-R() * 10}s` })); }
    return fx;
  }
  /** turn the full-screen weather on (w) or let it fade away (null) */
  function setFx(w) {
    clearTimeout(fxT);
    if (w) { fx.dataset.w = w; void fx.offsetWidth; fx.classList.add("on"); return; }
    fx.classList.remove("on");
    fxT = setTimeout(() => { fx.dataset.w = ""; }, 950); // display:none afterwards stops every animation
  }
  function build(api) {
    api.stage.append(TC.h("style", {}, css));
    root = TC.h("div", { class: "g5" });
    scene = TC.h("div", { class: "scene", style: "position:absolute;inset:0" });
    const F = (cls, txt) => TC.h("div", { class: "face " + cls }, txt ? TC.h("b", {}, txt) : null);
    boxw = TC.h("div", { class: "boxw" }, TC.h("div", { class: "cube" }, F("f-back"), F("f-left"), F("f-right"), F("f-bottom"), F("f-front", "?"),
      TC.h("div", { class: "lid3" }, F("f-top"))), TC.h("div", { class: "bow" }));
    rarEl = TC.h("div", { class: "rar" });
    boxpos = TC.h("div", { class: "boxpos" }, TC.h("div", { class: "beams" }), boxw, rarEl);
    wxImg = new Image(); wxImg.alt = ""; wxImg.draggable = false;
    wxpic = TC.h("div", { class: "wxpic" }, wxImg);
    labelEl = TC.h("div", { class: "label zh" });
    picnic = TC.h("div", { class: "picnic" }, TC.h("div", { class: "blanket" })); // blanket + plates behind the box …
    picnicTop = TC.h("div", { class: "picnic" }); // … snacks and thought bubbles in front of it
    scene.append(picnic, boxpos, picnicTop, wxpic, labelEl);
    shelf = TC.h("div", { class: "shelfItems" });
    tapOpen = TC.h("div", { class: "tapopen hidden zh" }, "👆 TAP TO OPEN! 點箱子打開！");
    const bg = TC.h("div", { style: "position:absolute;inset:0;pointer-events:none" });
    { const m = new Image(); m.alt = ""; m.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(TC.ART.mountains()); m.style.cssText = "position:absolute;left:50%;top:22%;width:120vh;height:46vh;margin-left:-60vh;opacity:.22"; bg.append(m); }
    const star = decoSvg((c) => c.path("M100 14 L124 70 L184 74 L138 112 L152 172 L100 140 L48 172 L62 112 L16 74 L76 70Z", "#ffc83d"));
    [0, 1, 2, 3, 4, 5].forEach((i) => { const im = new Image(); im.src = star; im.alt = ""; im.style.cssText = `position:absolute;left:${[30, 64, 44, 74, 22, 58][i]}%;top:${[10, 12, 60, 40, 36, 70][i]}%;width:${7 + (i % 3) * 3}vh;opacity:.16;filter:blur(2px);animation:drift ${7 + i}s ease-in-out ${-i}s infinite alternate`; bg.append(im); });
    root.append(bg, buildFx(), TC.h("div", { class: "shelf" }), scene, shelf, tapOpen);
    api.stage.append(root);
    boxw.addEventListener("pointerdown", () => {
      if (TC.pending && openReady) { TC.pending(); return; }
      boxw.classList.remove("shake"); void boxw.offsetWidth; boxw.classList.add("shake"); TC.sfx("snare"); setTimeout(() => boxw.classList.remove("shake"), 450);
    });
    setRar(RAR[1]);
  }
  function setRar(r) { scene.style.setProperty("--c1", r.c1); scene.style.setProperty("--c2", r.c2); scene.style.setProperty("--beam", r.beam); rarEl.textContent = "★ " + r.n + " ★"; rarEl.style.color = r.col; }
  /** a brand-new closed box in the middle (no transitions from the previous round) */
  function freshBox(rar, drop) {
    scene.classList.add("snap"); scene.classList.remove("open", "side", "bye");
    hidePic(); labelEl.classList.remove("on", "small"); tapOpen.classList.add("hidden"); openReady = false;
    setRar(rar); boxw.className = "boxw"; void boxw.offsetWidth; scene.classList.remove("snap");
    if (drop) boxw.classList.add("drop");
  }
  function hidePic() { wxpic.getAnimations().forEach((a) => a.cancel()); wxpic.classList.remove("on", "cheer"); wxpic.style.visibility = ""; }
  /** vector from an element's centre to the mouth of the box */
  function toBox(el) {
    const b = boxpos.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: b.left + b.width / 2 - (r.left + r.width / 2), y: b.top + b.height * 0.3 - (r.top + r.height / 2), up: root.clientHeight * 0.16 };
  }
  /** an element bursts out of the box and lands where it belongs */
  function flyOut(el, ms = 520) {
    const v = toBox(el); el.style.visibility = "visible";
    return el.animate([{ transform: `translate(${v.x}px,${v.y}px) scale(.1) rotate(-160deg)`, opacity: 0.4 },
      { transform: `translate(${v.x * 0.5}px,${v.y * 0.5 - v.up}px) scale(1.1) rotate(-20deg)`, opacity: 1, offset: 0.55 },
      { transform: "translate(0,2%) scale(1.06,.94)", opacity: 1, offset: 0.88 },
      { transform: "none", opacity: 1 }], { duration: ms, easing: "ease-out", composite: "add" }).finished.catch(() => {});
  }
  /** the weather picture shrinks into a new slot of the collection shelf */
  async function toShelf(x) {
    const slot = TC.h("div", { class: "got hold" }, TC.artImg(x.img), TC.h("b", {}, x.w));
    shelf.append(slot);
    const a = wxpic.getBoundingClientRect(), b = slot.firstChild.getBoundingClientRect();
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2), k = b.width / a.width;
    wxpic.classList.remove("cheer"); TC.sfx("whoosh");
    await wxpic.animate([{ transform: "translateX(-50%)" }, { transform: `translate(calc(-50% + ${dx * 0.4}px),${dy * 0.4 - root.clientHeight * 0.08}px) scale(${0.3 + k}) rotate(-12deg)`, offset: 0.45 },
      { transform: `translate(calc(-50% + ${dx}px),${dy}px) scale(${k})` }], { duration: 650, easing: "ease-in", fill: "forwards" }).finished.catch(() => {});
    slot.classList.remove("hold"); hidePic(); TC.sfx("pop");
  }
  function reset() {
    freshBox(RAR[1], false); shelf.innerHTML = ""; setFx(null);
    [picnic, picnicTop].forEach((p) => p.classList.remove("on")); scene.querySelectorAll(".plate,.snack,.think").forEach((e) => e.remove());
  }
  function wxSound(w) { (WX_SFX[w] || []).forEach((n, i) => setTimeout(() => TC.sfx(n), i * 230)); }

  TC.games.box = {
    mount(api) { build(api); },
    idle() { reset(); },
    async play(api) {
      const G = api.G, rounds = TC.rounds(4), N = rounds + 1;
      reset();
      const list = shuffle(G.weather).slice(0, rounds); // a different weather every round
      for (let i = 0; i < rounds; i++) {
        api.progress(i, N);
        const x = list[i % list.length], last = i === rounds - 1;
        const rar = last ? RAR[3] : RAR[(Math.random() * 3) | 0], colors = [rar.c1, rar.c2, "#fff"];
        // 1 · a fresh box drops in; the child taps it open
        freshBox(rar, true); TC.sfx("whoosh"); await TC.sleep(800);
        if (api.aborted) return null;
        tapOpen.classList.remove("hidden"); openReady = true; TC.sfx("pop");
        await TC.waitAction(8000); openReady = false; tapOpen.classList.add("hidden");
        if (api.aborted) return null;
        boxw.classList.add("shake"); TC.sfx("drum"); await TC.sleep(1000); boxw.classList.remove("shake");
        scene.classList.add("open"); TC.sfx("levelup"); TC.confetti(60, colors);
        const wow = TC.speak("Wow!");
        await TC.sleep(700);
        if (api.aborted) return null;
        // 2 · the box hops aside and the weather bursts out and fills the whole scene
        scene.classList.add("side"); await TC.sleep(450);
        wxImg.src = TC.art(x.img); wxpic.classList.add("on"); setFx(x.w); wxSound(x.w);
        await flyOut(wxpic, 700);
        await wow; await TC.sleep(500);
        if (api.aborted) return null;
        // 3 · "How's the weather?" — one word: sunny / rainy / cloudy / windy / snowy
        const r = await api.ask({ teacher: G.teacher, tzh: G.tzh, say: x.say, zh: x.zh, keys: x.keys || [[x.w]], word: x.w, hideKey: true });
        if (api.aborted) return null;
        TC.hideTalk();
        // 4 · the word, big, and the weather cheers
        labelEl.textContent = cap(x.w) + "!"; labelEl.classList.add("on"); wxpic.classList.add("cheer");
        TC.sfx(last ? "fanfare" : "levelup"); TC.confetti(last ? 200 : 100, colors);
        await TC.speak(r.ok ? "Yes! " + x.say : x.say);
        await TC.sleep(600);
        if (api.aborted) return null;
        // 5 · the weather goes into the collection; the sky clears for the next box
        labelEl.classList.remove("on"); setFx(null);
        await toShelf(x);
        scene.classList.add("bye"); await TC.sleep(450);
        if (api.aborted) return null;
      }
      // finale · a picnic under the sun: a golden box full of snacks — "Are you hungry?"
      api.progress(rounds, N);
      const F = G.finale, menu = shuffle(FOOD);
      freshBox(RAR[3], true); setFx("sunny"); TC.sfx("whoosh");
      const plates = PLATES.map(([px, py]) => TC.h("div", { class: "plate", style: `left:${px}%;top:${py}%` }));
      const snacks = PLATES.map(([px, py], k) => { const im = TC.artImg(menu[k % menu.length], "snack"); im.style.left = px + "%"; im.style.top = py + "%"; return im; });
      const thinks = THINK.map(([tx, ty, side], k) => TC.h("div", { class: "think " + side, style: `left:${tx}%;top:${ty}%;animation-delay:${-k * 0.4}s` }, TC.artImg(menu[k % menu.length])));
      picnic.append(...plates); picnicTop.append(...snacks, ...thinks); [picnic, picnicTop].forEach((p) => p.classList.add("on"));
      await TC.sleep(800);
      if (api.aborted) return null;
      thinks.forEach((t, k) => t.animate([{ transform: "scale(.2)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 400, delay: k * 150, fill: "backwards", easing: "cubic-bezier(.2,1.6,.4,1)", composite: "add" }));
      TC.sfx("pop"); await TC.sleep(700);
      if (api.aborted) return null;
      await api.ask({ teacher: F.teacher, tzh: F.zh, say: F.say, keys: F.keys, word: F.word });
      if (api.aborted) return null;
      TC.hideTalk();
      boxw.classList.add("shake"); TC.sfx("drum"); await TC.sleep(900); boxw.classList.remove("shake");
      scene.classList.add("open"); TC.sfx("fanfare"); TC.confetti(200);
      thinks.forEach((t) => t.classList.add("off"));
      for (const s of snacks) {
        if (api.aborted) return null;
        flyOut(s, 520); TC.sfx("pop"); await TC.sleep(260);
      }
      await TC.sleep(400);
      snacks.forEach((s, k) => { s.style.animationDelay = (k % 2) * 0.25 + "s"; s.classList.add("cheer"); });
      shelf.querySelectorAll(".got").forEach((g, k) => { g.style.animationDelay = (k % 2) * 0.25 + "s"; g.classList.add("cheer"); });
      labelEl.textContent = "Yummy! Let's eat! 開動囉！"; labelEl.classList.add("small", "on");
      await TC.speak("Wow! Great!");
      await TC.sleep(1200);
      api.progress(N, N);
      return { ok: true };
    }
  };
  function cap(w) { return w[0].toUpperCase() + w.slice(1); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
})();
