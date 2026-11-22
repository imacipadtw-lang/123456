/* =====================================================================
   Ollie in real 3D — 土城國小's own model and animation (TC.O3)
   ---------------------------------------------------------------------
   Everything here is original and drawn in code: a small WebGL renderer written for this project
   (no 3D library, no downloaded model, no third-party picture), Ollie built from simple solids, and
   every action animated by hand below.  The only picture used is the school's own emblem
   (assets/img/tucheng-emblem.svg, copied into this file at the bottom so it also works from a
   folder on the disk, where a page may not read image files into WebGL).

   Ollie can be turned through 360° — he turns by himself, and a finger or the mouse can spin him.

     const o = TC.O3.mount(hostElement, { action: "idle", spin: "intro" | "auto" | false, drag: true });
     o.play("clap");   o.turn();   o.talk(true);   o.destroy();
     TC.O3.actions      → the names of all actions
     TC.O3.forWord(w)   → the action for an answer word (used by the 低年級 "do the action" step)

   Where WebGL is missing, mount() falls back to the flat picture of Ollie with a simple movement.
   ===================================================================== */
(function () {
  "use strict";
  const TC = (window.TC = window.TC || {});
  const TAU = Math.PI * 2, RAD = Math.PI / 180;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const sm = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
  const seg = (u, a, b) => sm((u - a) / (b - a));
  const wave = (t, T, ph = 0) => Math.sin((t / T + ph) * TAU);      // -1 … 1
  const up = (t, T, ph = 0) => 0.5 - 0.5 * Math.cos((t / T + ph) * TAU); // 0 … 1 … 0
  const hex = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };

  /* ---------------- matrices (column-major, like WebGL) ---------------- */
  const m4 = () => new Float32Array(16);
  function mMul(o, a, b) {
    for (let c = 0; c < 4; c++) {
      const b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
      o[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
      o[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
      o[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
      o[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
    }
    return o;
  }
  /** o = Translate(p) · RotY · RotX · RotZ · Scale(s); angles in degrees */
  function mTRS(o, p, r, s) {
    const cx = Math.cos(r[0] * RAD), sx = Math.sin(r[0] * RAD), cy = Math.cos(r[1] * RAD), sy = Math.sin(r[1] * RAD), cz = Math.cos(r[2] * RAD), sz = Math.sin(r[2] * RAD);
    o[0] = (cy * cz + sy * sx * sz) * s[0]; o[1] = cx * sz * s[0]; o[2] = (-sy * cz + cy * sx * sz) * s[0]; o[3] = 0;
    o[4] = (-cy * sz + sy * sx * cz) * s[1]; o[5] = cx * cz * s[1]; o[6] = (sy * sz + cy * sx * cz) * s[1]; o[7] = 0;
    o[8] = sy * cx * s[2]; o[9] = -sx * s[2]; o[10] = cy * cx * s[2]; o[11] = 0;
    o[12] = p[0]; o[13] = p[1]; o[14] = p[2]; o[15] = 1;
    return o;
  }
  function mPersp(o, fovy, aspect, near, far) {
    const f = 1 / Math.tan((fovy * RAD) / 2); o.fill(0);
    o[0] = f / aspect; o[5] = f; o[10] = (far + near) / (near - far); o[11] = -1; o[14] = (2 * far * near) / (near - far);
    return o;
  }
  function mLook(o, e, t) {
    let zx = e[0] - t[0], zy = e[1] - t[1], zz = e[2] - t[2]; const zl = Math.hypot(zx, zy, zz); zx /= zl; zy /= zl; zz /= zl;
    let xx = zz, xy = 0, xz = -zx; const xl = Math.hypot(xx, xy, xz); xx /= xl; xz /= xl;            // up × z, up = (0,1,0)
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;                    // z × x
    o[0] = xx; o[1] = yx; o[2] = zx; o[3] = 0; o[4] = xy; o[5] = yy; o[6] = zy; o[7] = 0; o[8] = xz; o[9] = yz; o[10] = zz; o[11] = 0;
    o[12] = -(xx * e[0] + xy * e[1] + xz * e[2]); o[13] = -(yx * e[0] + yy * e[1] + yz * e[2]); o[14] = -(zx * e[0] + zy * e[1] + zz * e[2]); o[15] = 1;
    return o;
  }
  /** normal matrix = cofactors of the upper 3 × 3 (the shader normalises) */
  function mNormal(o, w) {
    const a00 = w[0], a10 = w[1], a20 = w[2], a01 = w[4], a11 = w[5], a21 = w[6], a02 = w[8], a12 = w[9], a22 = w[10];
    o[0] = a11 * a22 - a12 * a21; o[1] = -(a01 * a22 - a02 * a21); o[2] = a01 * a12 - a02 * a11;
    o[3] = -(a10 * a22 - a12 * a20); o[4] = a00 * a22 - a02 * a20; o[5] = -(a00 * a12 - a02 * a10);
    o[6] = a10 * a21 - a11 * a20; o[7] = -(a00 * a21 - a01 * a20); o[8] = a00 * a11 - a01 * a10;
    return o;
  }

  /* ---------------- solids ---------------- */
  function build(fn) { const P = [], N = [], U = [], I = []; fn(P, N, U, I); return { P: new Float32Array(P), N: new Float32Array(N), U: new Float32Array(U), I: new Uint16Array(I) }; }
  const MESH = {};
  MESH.sphere = build((P, N, U, I) => {
    const A = 20, B = 32;
    for (let i = 0; i <= A; i++) { const th = (i / A) * Math.PI, st = Math.sin(th), ct = Math.cos(th);
      for (let j = 0; j <= B; j++) { const ph = (j / B) * TAU, x = st * Math.cos(ph), z = st * Math.sin(ph); P.push(x, ct, z); N.push(x, ct, z); U.push(j / B, i / A); } }
    for (let i = 0; i < A; i++) for (let j = 0; j < B; j++) { const a = i * (B + 1) + j, b = a + B + 1; I.push(a, a + 1, b, b, a + 1, b + 1); }
  });
  /** cone: base radius 1 on y = 0, tip at y = 1 */
  MESH.cone = build((P, N, U, I) => {
    const B = 28;
    for (let j = 0; j <= B; j++) { const ph = (j / B) * TAU, c = Math.cos(ph), s = Math.sin(ph); P.push(c, 0, s, 0, 1, 0); N.push(c * 0.8, 0.6, s * 0.8, c * 0.8, 0.6, s * 0.8); U.push(j / B, 1, j / B, 0); }
    for (let j = 0; j < B; j++) { const a = j * 2; I.push(a, a + 1, a + 2); }
    const c0 = P.length / 3; P.push(0, 0, 0); N.push(0, -1, 0); U.push(0.5, 0.5);
    for (let j = 0; j <= B; j++) { const ph = (j / B) * TAU; P.push(Math.cos(ph), 0, Math.sin(ph)); N.push(0, -1, 0); U.push(0.5, 0.5); }
    for (let j = 0; j < B; j++) I.push(c0, c0 + 1 + j, c0 + 2 + j);
  });
  /** cylinder: radius 1, y from 0 to 1, with both lids */
  MESH.cyl = build((P, N, U, I) => {
    const B = 36;
    for (let j = 0; j <= B; j++) { const ph = (j / B) * TAU, c = Math.cos(ph), s = Math.sin(ph); P.push(c, 0, s, c, 1, s); N.push(c, 0, s, c, 0, s); U.push(j / B, 1, j / B, 0); }
    for (let j = 0; j < B; j++) { const a = j * 2; I.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); }
    [0, 1].forEach((y) => { const c0 = P.length / 3; P.push(0, y, 0); N.push(0, y ? 1 : -1, 0); U.push(0.5, 0.5);
      for (let j = 0; j <= B; j++) { const ph = (j / B) * TAU, c = Math.cos(ph), s = Math.sin(ph); P.push(c, y, s); N.push(0, y ? 1 : -1, 0); U.push(c * 0.5 + 0.5, s * 0.5 + 0.5); }
      for (let j = 0; j < B; j++) I.push(c0, c0 + 1 + j, c0 + 2 + j); });
  });
  /** box: side 1, centred */
  MESH.box = build((P, N, U, I) => {
    [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]].forEach((n) => {
      const u = n[0] ? [0, 1, 0] : [1, 0, 0], v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]], b = P.length / 3;
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, c]) => { P.push((n[0] + a * u[0] + c * v[0]) / 2, (n[1] + a * u[1] + c * v[1]) / 2, (n[2] + a * u[2] + c * v[2]) / 2); N.push(n[0], n[1], n[2]); U.push((a + 1) / 2, (1 - c) / 2); });
      I.push(b, b + 1, b + 2, b, b + 2, b + 3);
    });
  });
  /** disc: radius 1 in the x-y plane, facing +z; the picture's top is +y */
  MESH.disc = build((P, N, U, I) => {
    const B = 48; P.push(0, 0, 0); N.push(0, 0, 1); U.push(0.5, 0.5);
    for (let j = 0; j <= B; j++) { const ph = (j / B) * TAU, c = Math.cos(ph), s = Math.sin(ph); P.push(c, s, 0); N.push(0, 0, 1); U.push(c * 0.5 + 0.5, 0.5 - s * 0.5); }
    for (let j = 0; j < B; j++) I.push(0, 1 + j, 2 + j);
  });
  /** square: side 1 in the x-y plane, facing +z */
  MESH.quad = build((P, N, U, I) => { [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, c]) => { P.push(a / 2, c / 2, 0); N.push(0, 0, 1); U.push((a + 1) / 2, (1 - c) / 2); }); I.push(0, 1, 2, 0, 2, 3); });
  /** ring: big radius 1 around the y axis, tube radius r */
  const torus = (r) => build((P, N, U, I) => {
    const A = 40, B = 12;
    for (let i = 0; i <= A; i++) { const a = (i / A) * TAU, ca = Math.cos(a), sa = Math.sin(a);
      for (let j = 0; j <= B; j++) { const b = (j / B) * TAU, cb = Math.cos(b), sb = Math.sin(b); P.push((1 + r * cb) * ca, r * sb, (1 + r * cb) * sa); N.push(cb * ca, sb, cb * sa); U.push(i / A, j / B); } }
    for (let i = 0; i < A; i++) for (let j = 0; j < B; j++) { const a = i * (B + 1) + j, b = a + B + 1; I.push(a, a + 1, b, b, a + 1, b + 1); }
  });
  MESH.ring = torus(0.085); MESH.ringThin = torus(0.035);
  /** five-point star, radius 1 in the x-y plane, thickness 0.5 */
  MESH.star = build((P, N, U, I) => {
    const pts = []; for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU + Math.PI / 2, r = i % 2 ? 0.46 : 1; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    [0.25, -0.25].forEach((z) => { const b = P.length / 3; P.push(0, 0, z * 1.5); N.push(0, 0, Math.sign(z)); U.push(0.5, 0.5);
      pts.forEach((p) => { P.push(p[0], p[1], z); N.push(p[0] * 0.5, p[1] * 0.5, Math.sign(z)); U.push(0.5, 0.5); });
      for (let i = 0; i < 10; i++) I.push(b, b + 1 + i, b + 1 + ((i + 1) % 10)); });
    for (let i = 0; i < 10; i++) { const p = pts[i], q = pts[(i + 1) % 10], nx = q[1] - p[1], ny = -(q[0] - p[0]), nl = Math.hypot(nx, ny), b = P.length / 3;
      P.push(p[0], p[1], 0.25, q[0], q[1], 0.25, q[0], q[1], -0.25, p[0], p[1], -0.25); for (let k = 0; k < 4; k++) { N.push(nx / nl, ny / nl, 0); U.push(0.5, 0.5); }
      I.push(b, b + 1, b + 2, b, b + 2, b + 3); }
  });

  /* ---------------- the renderer ---------------- */
  const VS = `attribute vec3 aP;attribute vec3 aN;attribute vec2 aU;uniform mat4 uVP,uW;uniform mat3 uNM;varying vec3 vN,vW;varying vec2 vU;
void main(){vec4 w=uW*vec4(aP,1.);vW=w.xyz;vN=uNM*aN;vU=aU;gl_Position=uVP*w;}`;
  const FS = `precision mediump float;uniform vec3 uCol,uEye,uL;uniform float uSpec,uEmis,uAlpha,uTexOn;uniform int uMode;uniform sampler2D uTex;varying vec3 vN,vW;varying vec2 vU;
void main(){
 if(uMode==1){float d=length(vU*2.-1.);float a=uAlpha*smoothstep(1.,.15,d);gl_FragColor=vec4(0.,0.,0.,a);return;}
 if(uMode==2){vec4 t=texture2D(uTex,vU);float a=t.a*uAlpha;gl_FragColor=vec4(t.rgb*a,a);return;}
 vec3 N=normalize(vN),V=normalize(uEye-vW);if(dot(N,V)<0.)N=-N;
 vec3 base=uCol;if(uTexOn>.5){vec4 t=texture2D(uTex,vU);base=mix(base,t.rgb,t.a);}
 float hl=dot(N,uL)*.5+.5;float tone=smoothstep(.08,.95,hl);
 vec3 amb=mix(vec3(.50,.52,.80),vec3(1.,1.,1.),N.y*.5+.5);
 vec3 col=base*(amb*.46+tone*.72);
 float s=pow(max(dot(N,normalize(uL+V)),0.),48.)*uSpec;
 float rim=pow(1.-max(dot(N,V),0.),3.2);
 col+=vec3(s)+rim*.20*vec3(.75,.88,1.);
 col=mix(col,base,uEmis);
 gl_FragColor=vec4(col*uAlpha,uAlpha);}`;

  function Renderer(canvas) {
    let gl = null;
    try { gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true }) || canvas.getContext("experimental-webgl", { alpha: true, antialias: true }); } catch (e) { gl = null; }
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader"); return s; };
    let pr;
    try {
      pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
      gl.bindAttribLocation(pr, 0, "aP"); gl.bindAttribLocation(pr, 1, "aN"); gl.bindAttribLocation(pr, 2, "aU"); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error("link");
    } catch (e) { return null; }
    gl.useProgram(pr);
    const u = {}; ["uVP", "uW", "uNM", "uCol", "uEye", "uL", "uSpec", "uEmis", "uAlpha", "uTexOn", "uMode", "uTex"].forEach((k) => (u[k] = gl.getUniformLocation(pr, k)));
    gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1); gl.enableVertexAttribArray(2);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0);
    gl.uniform1i(u.uTex, 0);
    const bufs = new Map(), nm = new Float32Array(9);
    const vbo = (m) => { let b = bufs.get(m); if (!b) { const mk = (t, d) => { const x = gl.createBuffer(); gl.bindBuffer(t, x); gl.bufferData(t, d, gl.STATIC_DRAW); return x; };
      b = { p: mk(gl.ARRAY_BUFFER, m.P), n: mk(gl.ARRAY_BUFFER, m.N), u: mk(gl.ARRAY_BUFFER, m.U), i: mk(gl.ELEMENT_ARRAY_BUFFER, m.I), n3: m.I.length }; bufs.set(m, b); } return b; };
    const texOf = new Map(); // canvas → texture
    const tex = (cv) => { let t = texOf.get(cv); if (!t) { t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv); } catch (e) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 200, 61, 255])); }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.generateMipmap(gl.TEXTURE_2D); texOf.set(cv, t); } return t; };
    function drawNode(n) {
      const b = vbo(n.mesh);
      gl.uniformMatrix4fv(u.uW, false, n.W); gl.uniformMatrix3fv(u.uNM, false, mNormal(nm, n.W));
      gl.uniform3fv(u.uCol, n.col); gl.uniform1f(u.uSpec, n.spec); gl.uniform1f(u.uEmis, n.emis); gl.uniform1f(u.uAlpha, n.alpha); gl.uniform1i(u.uMode, n.mode);
      const cv = typeof n.tex === "function" ? n.tex() : n.tex;
      if (cv) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex(cv)); gl.uniform1f(u.uTexOn, 1); } else gl.uniform1f(u.uTexOn, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.p); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.n); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.u); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.i); gl.drawElements(gl.TRIANGLES, b.n3, gl.UNSIGNED_SHORT, 0);
    }
    const solid = [], clear = [];
    function collect(n, pw) {
      if (!n.vis) return;
      mTRS(n.L, n.p, n.r, n.s); if (pw) mMul(n.W, pw, n.L); else n.W.set(n.L);
      if (n.mesh) (n.alpha < 1 || n.mode ? clear : solid).push(n);
      for (let i = 0; i < n.kids.length; i++) collect(n.kids[i], n.W);
    }
    return {
      gl,
      render(root, vp, eye, light) {
        gl.viewport(0, 0, canvas.width, canvas.height); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(u.uVP, false, vp); gl.uniform3fv(u.uEye, eye); gl.uniform3fv(u.uL, light);
        solid.length = 0; clear.length = 0; collect(root, null);
        gl.disable(gl.BLEND); gl.depthMask(true); for (let i = 0; i < solid.length; i++) drawNode(solid[i]);
        gl.enable(gl.BLEND); gl.depthMask(false); for (let i = 0; i < clear.length; i++) drawNode(clear[i]);
        gl.depthMask(true);
      },
      lose() { try { const e = gl.getExtension("WEBGL_lose_context"); e && e.loseContext(); } catch (err) {} }
    };
  }

  /* ---------------- pictures painted on the model (canvas → texture) ---------------- */
  const paint = (size, fn) => { const c = document.createElement("canvas"); c.width = c.height = size; fn(c.getContext("2d"), size); return c; };
  const CJK = "'Noto Sans TC','Microsoft JhengHei','PingFang TC','Heiti TC','Noto Sans CJK TC',sans-serif";
  let emblemCv = null, emblemImg = null;
  function emblem() { // the real school emblem; a plain gold disc until the picture has loaded
    if (emblemCv) return emblemCv;
    if (!emblemImg && O3.EMBLEM) { emblemImg = new Image();
      emblemImg.onload = () => { try { emblemCv = paint(512, (g, s) => { g.drawImage(emblemImg, 0, 0, s, s); }); } catch (e) { emblemCv = blank; } };
      emblemImg.onerror = () => { emblemCv = blank; }; emblemImg.src = O3.EMBLEM; }
    return blank;
  }
  let blank = null, backCv = null, zCv = null, pageCv = null, noteCv = null;
  function pictures() {
    if (blank) return;
    blank = paint(8, (g, s) => { g.fillStyle = "#ffd768"; g.fillRect(0, 0, s, s); });
    backCv = paint(256, (g, s) => { // the back of Ollie's jersey: 土城 and the year the school began
      g.fillStyle = "#152a63"; g.beginPath(); g.arc(s / 2, s / 2, s / 2, 0, TAU); g.fill();
      g.strokeStyle = "#ffd23d"; g.lineWidth = 12; g.beginPath(); g.arc(s / 2, s / 2, s / 2 - 12, 0, TAU); g.stroke();
      g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 96px " + CJK; g.fillText("土城", s / 2, s / 2 - 14);
      g.fillStyle = "#7dffd8"; g.font = "700 40px Fredoka,Arial,sans-serif"; g.fillText("1921", s / 2, s / 2 + 62);
    });
    zCv = paint(128, (g, s) => { g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 104px Fredoka,Arial,sans-serif"; g.lineWidth = 12; g.strokeStyle = "#152a63"; g.strokeText("Z", s / 2, s / 2 + 4); g.fillStyle = "#bfe9ff"; g.fillText("Z", s / 2, s / 2 + 4); });
    pageCv = paint(128, (g, s) => { g.fillStyle = "#fffdf4"; g.fillRect(0, 0, s, s); g.fillStyle = "#152a63"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "700 40px Fredoka,Arial,sans-serif"; g.fillText("ABC", s / 2, 34);
      g.strokeStyle = "#9fb0de"; g.lineWidth = 5; [66, 86, 106].forEach((y) => { g.beginPath(); g.moveTo(18, y); g.lineTo(s - 18, y); g.stroke(); }); });
    noteCv = paint(128, (g, s) => { g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 100px Arial,sans-serif"; g.lineWidth = 10; g.strokeStyle = "#152a63"; g.strokeText("!", s / 2, s / 2); g.fillStyle = "#ffd23d"; g.fillText("!", s / 2, s / 2); });
  }

  /* ---------------- the scene graph ---------------- */
  function node(o) { return Object.assign({ p: [0, 0, 0], r: [0, 0, 0], s: [1, 1, 1], kids: [], mesh: null, col: [1, 1, 1], spec: 0.32, emis: 0, alpha: 1, mode: 0, tex: null, vis: true, L: m4(), W: m4() }, o); }
  const add = (parent, o) => { const n = node(o || {}); parent.kids.push(n); return n; };
  const C = { body: hex("#8fa2ff"), wing: hex("#6677dd"), belly: hex("#eef1ff"), gold: hex("#ffc83d"), goldD: hex("#e39a12"), beak: hex("#ffb020"), pink: hex("#ff9ec4"), dark: hex("#101a3c"), white: [1, 1, 1], navy: hex("#152a63"), mint: hex("#2ee6b6"), wood: hex("#c98a4a"), red: hex("#e2463f"), sky: hex("#9fdcff") };

  function buildOllie() {
    pictures();
    const J = {}, root = node({}), turn = (J.turn = add(root));
    /* the round stand he turns on */
    const stand = (J.stand = add(turn)); // hidden with O3.mount(…, { stand: false }), e.g. for a picture on paper
    add(stand, { mesh: MESH.cyl, p: [0, -0.2, 0], s: [1.95, 0.2, 1.95], col: C.gold, spec: 0.55 });
    add(stand, { mesh: MESH.cyl, p: [0, -0.19, 0], s: [1.78, 0.2, 1.78], col: C.navy, spec: 0.2 });
    add(stand, { mesh: MESH.ringThin, p: [0, 0.012, 0], s: [1.5, 1, 1.5], col: C.mint, emis: 0.5 });
    J.shadow = add(turn, { mesh: MESH.quad, p: [0, 0.02, 0], r: [-90, 0, 0], s: [2.5, 2.2, 1], mode: 1, alpha: 0.42 });
    /* a little stool for "Sit down" / "Stand up" */
    const stool = (J.stool = add(turn, { p: [0, 0, -0.1], vis: false }));
    add(stool, { mesh: MESH.cyl, p: [0, 0.4, 0], s: [0.66, 0.13, 0.66], col: C.red, spec: 0.4 });
    [0, 120, 240].forEach((a) => add(stool, { mesh: MESH.cyl, p: [Math.sin(a * RAD) * 0.42, 0, Math.cos(a * RAD) * 0.42], s: [0.07, 0.42, 0.07], col: C.wood }));

    const pelvis = (J.pelvis = add(turn, { p: [0, 0.8, 0] }));
    /* legs and feet (they stay under him when the body leans) */
    ["L", "R"].forEach((k, i) => { const sx = i ? -1 : 1, leg = (J["leg" + k] = add(pelvis, { p: [sx * 0.34, 0.02, 0.04] }));
      add(leg, { mesh: MESH.cyl, p: [0, -0.62, 0], s: [0.09, 0.62, 0.09], col: C.goldD });
      add(leg, { mesh: MESH.sphere, p: [0, -0.66, 0.13], s: [0.29, 0.15, 0.42], col: C.gold, spec: 0.5 }); });
    const waist = (J.waist = add(pelvis));
    add(waist, { mesh: MESH.sphere, p: [0, 0.55, 0], s: [0.88, 0.82, 0.76], col: C.body });
    add(waist, { mesh: MESH.sphere, p: [0, 0.48, 0.26], s: [0.68, 0.64, 0.54], col: C.belly, spec: 0.2 });
    add(waist, { mesh: MESH.cone, p: [0, 0.0, -0.5], r: [-126, 0, 0], s: [0.24, 0.42, 0.16], col: C.wing });
    /* the school emblem: a big medal on his chest, and the school's name on his back */
    const medal = add(waist, { p: [0, 0.5, 0.71], r: [-7, 0, 0] });
    add(medal, { mesh: MESH.cyl, r: [90, 0, 0], s: [0.47, 0.15, 0.47], col: C.gold, spec: 0.7 });
    add(medal, { mesh: MESH.disc, p: [0, 0, 0.152], s: [0.43, 0.43, 1], col: C.gold, tex: emblem, spec: 0.15 });
    add(waist, { mesh: MESH.disc, p: [0, 0.58, -0.765], r: [6, 180, 0], s: [0.4, 0.4, 1], col: C.navy, tex: backCv, spec: 0.1 });

    /* head */
    const head = (J.head = add(waist, { p: [0, 1.1, 0] }));
    add(head, { mesh: MESH.sphere, p: [0, 0.62, 0], s: [1.02, 0.86, 0.88], col: C.body });
    ["L", "R"].forEach((k, i) => { const sx = i ? -1 : 1;
      const eye = (J["eye" + k] = add(head, { p: [sx * 0.37, 0.68, 0.7], r: [-4, sx * 14, 0] }));
      J["white" + k] = add(eye, { mesh: MESH.sphere, s: [0.34, 0.36, 0.17], col: C.white, spec: 0.5 });
      J["pupil" + k] = add(eye, { mesh: MESH.sphere, p: [-sx * 0.03, -0.02, 0.13], s: [0.17, 0.19, 0.07], col: C.dark, spec: 0.9 });
      J["glint" + k] = add(eye, { mesh: MESH.sphere, p: [-sx * 0.03 + 0.06, 0.06, 0.19], s: [0.055, 0.055, 0.03], col: C.white, emis: 1 });
      J["lid" + k] = add(eye, { mesh: MESH.sphere, s: [0.35, 0.37, 0.185], col: C.body, vis: false });
      J["lash" + k] = add(eye, { mesh: MESH.sphere, p: [0, -0.06, 0.17], s: [0.24, 0.035, 0.05], col: C.dark, vis: false });
      add(head, { mesh: MESH.sphere, p: [sx * 0.68, 0.38, 0.56], r: [0, sx * 42, 0], s: [0.15, 0.095, 0.04], col: C.pink, emis: 0.55 });
      const ear = add(head, { p: [sx * 0.6, 1.2, 0], r: [0, 0, -sx * 20] });
      add(ear, { mesh: MESH.cone, s: [0.3, 0.58, 0.24], col: C.body });
      add(ear, { mesh: MESH.cone, p: [0, 0.02, 0.1], s: [0.17, 0.4, 0.14], col: C.pink, emis: 0.3 }); });
    add(head, { mesh: MESH.cone, p: [0, 0.47, 0.8], r: [100, 0, 0], s: [0.17, 0.3, 0.13], col: C.beak, spec: 0.6 });
    J.jaw = add(head, { p: [0, 0.43, 0.8] });
    add(J.jaw, { mesh: MESH.cone, r: [104, 0, 0], s: [0.12, 0.2, 0.07], col: C.goldD });
    /* sports-day headband, antenna and star */
    add(head, { mesh: MESH.ring, p: [0, 1.07, 0], r: [-9, 0, 0], s: [0.86, 1, 0.73], col: C.gold, spec: 0.7 });
    add(head, { mesh: MESH.cyl, p: [0, 1.44, 0], s: [0.035, 0.36, 0.035], col: hex("#c9d6ff") });
    J.star = add(head, { mesh: MESH.star, p: [0, 1.98, 0], s: [0.24, 0.24, 0.24], col: C.gold, spec: 0.8, emis: 0.25 });
    J.mask = add(head, { mesh: MESH.sphere, p: [0, 0.4, 0.74], s: [0.5, 0.3, 0.24], col: C.sky, vis: false });
    J.plaster = add(head, { p: [0.3, 1.2, 0.62], r: [-28, 20, 24], vis: false });
    add(J.plaster, { mesh: MESH.box, s: [0.4, 0.13, 0.05], col: hex("#f6d2a6") }); add(J.plaster, { mesh: MESH.box, r: [0, 0, 90], s: [0.4, 0.13, 0.05], col: hex("#f6d2a6") });
    J.bulb = add(head, { p: [0, 2.5, 0], vis: false });
    add(J.bulb, { mesh: MESH.sphere, s: [0.24, 0.26, 0.24], col: hex("#fff3a0"), emis: 0.85 }); add(J.bulb, { mesh: MESH.cyl, p: [0, -0.36, 0], s: [0.1, 0.14, 0.1], col: hex("#9aa6c8") });

    /* arms: shoulder → elbow → hand */
    ["L", "R"].forEach((k, i) => { const sx = i ? -1 : 1;
      const sh = (J["sh" + k] = add(waist, { p: [sx * 0.82, 0.98, 0.04] }));
      add(sh, { mesh: MESH.sphere, s: [0.21, 0.21, 0.21], col: C.wing });
      add(sh, { mesh: MESH.sphere, p: [0, -0.29, 0], s: [0.185, 0.33, 0.2], col: C.wing });
      const el = (J["el" + k] = add(sh, { p: [0, -0.58, 0] }));
      add(el, { mesh: MESH.sphere, s: [0.17, 0.17, 0.17], col: C.wing });
      add(el, { mesh: MESH.sphere, p: [0, -0.27, 0], s: [0.165, 0.31, 0.175], col: C.wing });
      J["hand" + k] = add(el, { p: [0, -0.58, 0] });
      add(J["hand" + k], { mesh: MESH.sphere, s: [0.21, 0.2, 0.21], col: C.gold, spec: 0.55 }); });
    /* things he holds */
    J.brush = add(head, { p: [-0.12, 0.4, 1.02], vis: false });
    add(J.brush, { mesh: MESH.box, p: [-0.4, 0, 0], s: [0.8, 0.07, 0.06], col: C.mint }); add(J.brush, { mesh: MESH.box, p: [-0.06, 0, -0.07], s: [0.2, 0.1, 0.1], col: C.white });
    J.cup = add(head, { p: [-0.1, 0.16, 1.02], r: [-62, 0, 0], vis: false });
    add(J.cup, { mesh: MESH.cyl, s: [0.17, 0.36, 0.17], col: C.sky, spec: 0.6 }); add(J.cup, { mesh: MESH.cyl, p: [0, 0.3, 0], s: [0.15, 0.065, 0.15], col: C.white });
    J.cloth = add(J.handR, { mesh: MESH.box, p: [0, -0.2, 0], s: [0.46, 0.08, 0.4], col: hex("#ffd0e4"), vis: false });
    /* the book he opens and closes (the school emblem is on its cover) */
    const book = (J.book = add(waist, { p: [0, 0.56, 1.02], r: [-16, 0, 0], vis: false }));
    add(book, { mesh: MESH.box, p: [0, 0, 0], s: [0.07, 0.86, 0.1], col: C.red });
    const back = add(book); // the back cover and the right-hand page
    add(back, { mesh: MESH.box, p: [0.32, 0, -0.03], s: [0.62, 0.86, 0.045], col: C.red, spec: 0.4 });
    add(back, { mesh: MESH.quad, p: [0.32, 0, -0.004], s: [0.56, 0.78, 1], col: C.white, tex: pageCv, spec: 0.05 });
    const front = (J.cover = add(book)); // the front cover: emblem outside, the left-hand page inside
    add(front, { mesh: MESH.box, p: [0.32, 0, 0.03], s: [0.62, 0.86, 0.045], col: C.red, spec: 0.4 });
    add(front, { mesh: MESH.disc, p: [0.32, 0.02, 0.054], s: [0.28, 0.28, 1], col: C.gold, tex: emblem, spec: 0.1 });
    add(front, { mesh: MESH.quad, p: [0.32, 0, 0.004], r: [0, 180, 0], s: [0.56, 0.78, 1], col: C.white, tex: pageCv, spec: 0.05 });
    /* soap bubbles, sparks, sleepy Zs (they do not turn with him) */
    J.fx = add(root);
    J.bubbles = []; for (let i = 0; i < 9; i++) J.bubbles.push(add(J.fx, { mesh: MESH.sphere, col: hex("#d8f4ff"), alpha: 0.5, spec: 1.6, vis: false }));
    J.sparks = []; for (let i = 0; i < 8; i++) J.sparks.push(add(J.fx, { mesh: MESH.star, col: C.gold, emis: 0.7, vis: false }));
    J.zs = []; for (let i = 0; i < 3; i++) J.zs.push(add(J.fx, { mesh: MESH.quad, mode: 2, tex: zCv, vis: false }));
    J.bang = add(J.fx, { mesh: MESH.quad, mode: 2, tex: noteCv, vis: false });
    return { root, J };
  }

  /* ---------------- poses: what every joint does ---------------- */
  // arm = [a swing forward, b lift sideways, c turn inward, e bend elbow] in degrees
  const REST = { lift: 0, H: 0.8, yaw: 0, lean: 0, twist: 0, sway: 0, sq: 1, hx: 0, hy: 0, hz: 0, eye: 1, beak: 0, La: 0, Lb: 9, Lc: 0, Le: 14, Ra: 0, Rb: 9, Rc: 0, Re: 14, legL: 0, legR: 0, book: 0 };
  const both = (P, a, b, c, e) => { P.La = P.Ra = a; P.Lb = P.Rb = b; P.Lc = P.Rc = c; P.Le = P.Re = e; };
  const A = {};
  A.idle = { f(t, P) { P.sq = 1 + 0.018 * wave(t, 2.6); P.hz = 3 * wave(t, 5.2); P.hy = 5 * wave(t, 7); P.La = 4 * wave(t, 2.6); P.Ra = -4 * wave(t, 2.6); } };
  A.wave = { f(t, P) { P.Ra = 158; P.Rb = 26 + 10 * wave(t, 0.55); P.Re = 26 + 26 * wave(t, 0.55, 0.25); P.hz = -7 + 4 * wave(t, 1.1); P.lift = 0.05 * up(t, 0.55); P.beak = 0.4; } };
  A.cheer = { f(t, P) { const j = Math.abs(wave(t, 1.1)); P.lift = 0.5 * j; P.sq = 1.06 - 0.12 * (1 - j); both(P, 166, 20 + 10 * wave(t, 0.55), 0, 8); P.legL = -18 * j; P.legR = -18 * j; P.beak = 0.6; }, fx: "sparks" };
  A.raise = { f(t, P) { const k = seg(t, 0, 0.45); P.Ra = 172 * k; P.Rb = 9 + 16 * k; P.Re = 14 - 10 * k; P.lift = 0.07 * k * up(t, 1.3); P.hx = -7 * k; P.hz = -4 * k; P.sq = 1 + 0.03 * k; } };
  A.down = { T: 3.4, f(t, P, u) { const k = 1 - seg(u, 0.36, 0.56) + seg(u, 0.93, 1); both(P, lerp(0, 172, k), lerp(9, 16, k), 0, lerp(14, 6, k)); P.hx = -8 * k; P.sq = 1 + 0.03 * k - 0.04 * seg(u, 0.5, 0.6) * (1 - seg(u, 0.6, 0.72)); } };
  A.clap = { f(t, P) { const k = up(t, 0.62); both(P, 64, 12, 44 + 21 * k, 58 + 6 * k); P.hz = 5 * wave(t, 1.24); P.lift = 0.04 * k; P.beak = 0.3; }, fx: "clap" };
  A.stand = { T: 3.6, stool: 1, f(t, P, u) { const k = seg(u, 0.24, 0.42) - seg(u, 0.9, 1); P.H = lerp(0.56, 0.8, k); P.legL = P.legR = lerp(-66, 0, k); P.lift = 0.16 * seg(u, 0.3, 0.42) * (1 - seg(u, 0.42, 0.56)); both(P, lerp(30, 0, k), 9, lerp(14, 0, k), lerp(50, 8, k)); P.sq = 1 + 0.04 * k; P.hx = -5 * k; } };
  A.sit = { T: 3.6, stool: 1, f(t, P, u) { const k = seg(u, 0.24, 0.44) - seg(u, 0.92, 1); P.H = lerp(0.8, 0.56, k); P.legL = P.legR = lerp(0, -66, k); both(P, lerp(0, 30, k), 9, lerp(0, 14, k), lerp(14, 50, k)); P.sq = 1 - 0.05 * seg(u, 0.4, 0.5) * (1 - seg(u, 0.5, 0.64)); } };
  A.bow = { T: 2.8, f(t, P, u) { const k = seg(u, 0.16, 0.38) - seg(u, 0.7, 0.9); P.lean = 46 * k; P.hx = 12 * k; both(P, 0, 5, 0, 4); P.eye = 1 - 0.9 * k; } };
  A.attention = { T: 2.6, f(t, P, u) { const k = seg(u, 0.1, 0.22); both(P, 0, lerp(26, 2, k), 0, lerp(30, 0, k)); P.lean = -4 * k; P.sq = 1 + 0.045 * k; P.lift = 0.1 * seg(u, 0.1, 0.18) * (1 - seg(u, 0.18, 0.3)); P.hx = -4 * k; } };
  A.open = { T: 3.4, book: 1, f(t, P, u) { const k = seg(u, 0.2, 0.46) - seg(u, 0.92, 1); P.book = k; both(P, 50, 6, lerp(34, 12, k), 74); P.hx = 14; P.hy = 8 * wave(t, 2.2) * k; } };
  A.close = { T: 3.4, book: 1, f(t, P, u) { const k = 1 - seg(u, 0.24, 0.48) + seg(u, 0.92, 1); P.book = k; both(P, 50, 6, lerp(34, 12, k), 74); P.hx = 14 - 8 * (1 - k); } };
  A.read = { book: 1, f(t, P) { P.book = 1; both(P, 50, 6, 12, 74); P.hx = 15; P.hy = 11 * wave(t, 2.4); } };
  A.wash = { f(t, P) { const w = wave(t, 0.5); both(P, 60, 10, 52, 66); P.La += 9 * w; P.Ra -= 9 * w; P.Le += 8 * w; P.Re -= 8 * w; P.hx = 12; P.hz = 4 * wave(t, 1); }, fx: "bubbles" };
  A.brush = { hold: "brush", f(t, P) { const w = wave(t, 0.34); P.Ra = 96; P.Rb = 22; P.Rc = 34 + 10 * w; P.Re = 112; P.hz = 5 * w; P.beak = 0.8; P.La = 10; } };
  A.drink = { T: 2.4, hold: "cup", f(t, P, u) { const k = seg(u, 0.12, 0.36) - seg(u, 0.72, 0.92); P.Ra = lerp(50, 74, k); P.Rb = 10; P.Rc = lerp(10, 58, k); P.Re = lerp(70, 104, k); P.hx = -17 * k; P.beak = 0.5 * k; } };
  A.eat = { f(t, P) { const k = up(t, 0.8); P.Ra = 60 + 34 * k; P.Rc = 34; P.Rb = 14; P.Re = 84 + 34 * k; P.beak = Math.abs(wave(t, 0.4)); P.hz = 4 * wave(t, 1.6); P.La = 44; P.Lc = 30; P.Le = 70; } };
  A.sleep = { f(t, P) { P.eye = 0; P.hz = 19; P.hx = 6; P.sway = 3; P.sq = 1 + 0.03 * wave(t, 3.2); P.La = 66; P.Lc = 56; P.Le = 118; P.Ra = 78; P.Rc = 38; P.Rb = 12; P.Re = 122; }, fx: "zs" };
  A.wake = { f(t, P) { const k = seg(t, 0, 0.5); both(P, 150 * k + 8 * wave(t, 1.4), 38 * k, 0, 10); P.lift = 0.12 * k * up(t, 1.4); P.sq = 1 + 0.06 * k; P.hx = -12 * k; P.beak = 0.9 * k * up(t, 2.8); }, fx: "bang" };
  A.run = { f(t, P) { const w = wave(t, 0.36); P.legL = 46 * w; P.legR = -46 * w; P.La = -48 * w; P.Ra = 48 * w; P.Le = P.Re = 84; P.Lb = P.Rb = 12; P.lean = 12; P.lift = 0.13 * Math.abs(wave(t, 0.36, 0.25)); P.hx = -6; } };
  A.walk = { f(t, P) { const w = wave(t, 1); P.legL = 24 * w; P.legR = -24 * w; P.La = -22 * w; P.Ra = 22 * w; P.Le = P.Re = 30; P.sway = 3 * w; P.lift = 0.04 * Math.abs(wave(t, 1, 0.25)); P.yaw = 16 * wave(t, 2); } };
  A.knock = { f(t, P) { const k = Math.max(0, wave(t, 0.42)); P.Ra = 88; P.Rb = 12; P.Rc = 10; P.Re = 88 - 54 * k; P.lean = 5; P.hy = -6; }, fx: "knock" };
  A.push = { T: 2.6, f(t, P, u) { const k = seg(u, 0.18, 0.5) - seg(u, 0.82, 1); both(P, 84, 8, 16, lerp(96, 12, k)); P.lean = 12 * k; P.legL = 14 * k; P.legR = -14 * k; } };
  A.nod = { f(t, P) { P.hx = 18 * up(t, 0.8); P.Ra = 74; P.Rb = 20; P.Re = 96; P.beak = 0.4; P.lift = 0.03 * up(t, 0.8); } };
  A.thumb = { f(t, P) { const k = up(t, 0.9); P.Ra = 96 + 12 * k; P.Rb = 22; P.Rc = 8; P.Re = 30 - 14 * k; P.lift = 0.09 * k; P.hz = -6; P.beak = 0.5; P.La = 10; }, fx: "sparks" };
  A.hug = { T: 2.4, f(t, P, u) { const k = seg(u, 0.1, 0.4) - seg(u, 0.74, 0.96); both(P, 34, lerp(14, 84, k), 0, lerp(30, 6, k)); P.sq = 1 + 0.04 * k; P.hx = -6 * k; P.beak = 0.6 * k; } };
  A.thanks = { T: 2.6, f(t, P, u) { const k = seg(u, 0.18, 0.4) - seg(u, 0.7, 0.9); both(P, 62, 8, 56, 96); P.lean = 28 * k; P.hx = 10 * k; P.eye = 1 - 0.9 * k; } };
  A.idea = { f(t, P) { const k = seg(t, 0, 0.35); P.Ra = 172 * k; P.Rb = 6; P.Re = 6; P.lift = 0.12 * k * up(t, 1.2); P.hx = -10 * k; P.beak = 0.5; }, bulb: [0.95, 2.05, 0.3], fx: "sparks" };
  A.light = { T: 2.2, f(t, P, u) { const k = seg(u, 0.1, 0.3) - seg(u, 0.8, 1); P.Ra = 150 * k; P.Rb = 22; P.Re = 20; P.hx = -12 * k; P.bulbOn = u > 0.32 && u < 0.86 ? 1 : 0; }, bulb: [-1.25, 2.0, 0.3] };
  A.listen = { f(t, P) { P.Ra = 118; P.Rb = 44; P.Rc = -10; P.Re = 128; P.hz = -15; P.hy = -14 + 4 * wave(t, 2); P.lean = 6; } };
  A.ouch = { f(t, P) { P.eye = 0; P.Ra = 148; P.Rb = 20; P.Rc = 26; P.Re = 112; P.hz = 9 * wave(t, 0.5); P.lean = 10; P.sq = 0.97; P.La = 30; P.Le = 60; P.beak = 0.7; }, plaster: 1 };
  A.wipe = { hold: "cloth", f(t, P) { const w = wave(t, 0.9); P.Ra = 72; P.Rb = 10; P.Rc = 6 + 34 * w; P.Re = 22; P.lean = 16; P.hy = 8 * w; P.La = 20; P.Le = 40; } };
  A.mask = { f(t, P) { const k = seg(t, 0, 0.5); both(P, 96 * k, 12, 40 * k, 124 * k); P.hx = 4; P.maskOn = t > 0.45 ? 1 : 0; } };
  A.twirl = { f(t, P) { P.yaw = t * 260; both(P, 10, 78, 0, 6); P.lift = 0.05 * up(t, 0.7); P.beak = 0.5; } };
  A.window = { T: 2.4, f(t, P, u) { const k = seg(u, 0.14, 0.46) - seg(u, 0.8, 1); both(P, 78, lerp(4, 62, k), lerp(34, -20, k), 30); P.lean = 6 * k; } };
  A.freeze = { f(t, P) { P.La = 34; P.Lb = 72; P.Le = 84; P.Ra = 150; P.Rb = 32; P.Re = 64; P.legL = -38; P.hz = 9; P.lean = -4; P.sway = 1.1 * wave(t, 0.13); P.hy = 3 * wave(t, 0.5); } };
  A.talk = { f(t, P) { P.hz = 4 * wave(t, 2.2); P.hx = 3 * wave(t, 1.1); P.La = 26 + 10 * wave(t, 1.4); P.Le = 50; P.Lb = 16; } };

  /* answer word → action (the 低年級 step and the TPR gate use the same movements) */
  const WORD = { hi: "wave", hello: "wave", goodbye: "wave", bye: "wave", morning: "wave", wash: "wash", hands: "wash", clean: "wipe", table: "wipe", brush: "brush", teeth: "brush", mask: "mask",
    door: "knock", close: "push", in: "walk", late: "run", hurry: "run", run: "run", walk: "walk", go: "walk", water: "drink", drink: "drink", lunch: "eat", eat: "eat", hurt: "ouch", nurse: "ouch",
    rest: "sleep", break: "sleep", sleep: "sleep", quiet: "sleep", wake: "wake", window: "window", open: "open", light: "light", fan: "twirl", book: "read", idea: "idea", listen: "listen",
    done: "thumb", okay: "thumb", good: "thumb", sure: "nod", yes: "nod", please: "thanks", welcome: "hug", sorry: "thanks", "thank you": "thanks", help: "hug", happy: "clap", fun: "cheer", ready: "cheer",
    stand: "stand", sit: "sit", bow: "bow", clap: "clap", raise: "raise", down: "down", attention: "attention" };
  const FLAT = { wave: "abWave", wash: "abScrub", wipe: "abWipe", brush: "abBrush", knock: "abKnock", push: "abKnock", walk: "abWalk", run: "abRun", drink: "abDrink", eat: "abEat", ouch: "abOuch", sleep: "abSleep", wake: "abStretch",
    window: "abOpen", open: "abOpen", close: "abOpen", read: "abRead", light: "abFlick", twirl: "abTwirl", idea: "abIdea", listen: "abListen", thumb: "abThumb", nod: "abNod", thanks: "abBow", bow: "abBow", hug: "abHug", clap: "abClap",
    cheer: "abHop", stand: "abStretch", sit: "abNod", raise: "abStretch", down: "abNod", attention: "abStretch", mask: "abNod", idle: "", talk: "" };

  const O3 = (TC.O3 = { actions: Object.keys(A), forWord: (w) => WORD[String(w || "").toLowerCase().trim()] || "clap", EMBLEM: "" });
  const live = new Set();
  let support = null;
  O3.supported = function () { if (support === null) { try { const c = document.createElement("canvas"); support = !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); } catch (e) { support = false; } } return support; };

  function flat(host, opt) { // no WebGL: the flat picture with a simple movement
    const img = TC.artImg ? TC.artImg("ollie", "o3flat", "Ollie") : document.createElement("span");
    img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none"; host.append(img);
    const ctl = { ok: false, el: img, play(id) { img.style.animation = FLAT[id] ? FLAT[id] + " 1.2s ease-in-out infinite" : "none"; return ctl; }, turn() { return ctl; }, talk() { return ctl; }, destroy() { img.remove(); } };
    return ctl.play(opt.action || "idle");
  }

  O3.mount = function (host, opt = {}) {
    if (!host) return null;
    if (opt.flat || !O3.supported()) return flat(host, opt);
    const canvas = document.createElement("canvas"); canvas.className = "o3c"; canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", opt.label || "立體的歐力，可以轉 360 度");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;" + (opt.drag === false ? "pointer-events:none;" : "cursor:grab;");
    host.append(canvas);
    const R = Renderer(canvas); if (!R) { canvas.remove(); return flat(host, opt); }
    const { root, J } = buildOllie();
    if (opt.stand === false) J.stand.vis = false;
    const P = Object.assign({}, REST), Q = Object.assign({}, REST), keys = Object.keys(REST);
    const proj = m4(), view = m4(), vp = m4(), light = (() => { const v = [0.42, 0.78, 0.62], l = Math.hypot(v[0], v[1], v[2]); return new Float32Array(v.map((x) => x / l)); })();
    let act = A[opt.action] ? opt.action : "idle", t0 = performance.now() / 1000, last = t0, raf = 0, dead = false, talking = false, W = 0, H = 0;
    let yawBase = 0, turnAt = -1, turnDur = 1.5, nextTurn = 0, user = 0, vel = 0, dragging = false, lastX = 0, paused = false, slow = 0, dprCap = Math.min(2, window.devicePixelRatio || 1);
    const zoom = opt.zoom || 1, reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fxT = { bub: [], sp: [] };
    for (let i = 0; i < 9; i++) fxT.bub.push({ ph: Math.random(), x: (Math.random() - 0.5) * 1.5, s: 0.09 + Math.random() * 0.1, z: 0.9 + Math.random() * 0.5 });
    for (let i = 0; i < 8; i++) fxT.sp.push({ a: (i / 8) * TAU + Math.random() * 0.5, v: 0.8 + Math.random() * 0.6 });

    function size() {
      const r = host.getBoundingClientRect(), w = Math.max(2, Math.round(r.width * dprCap)), h = Math.max(2, Math.round(r.height * dprCap));
      if (w !== W || h !== H) { W = canvas.width = w; H = canvas.height = h; }
      const asp = W / H, fov = 27, needH = 5.5 / zoom, needW = 4.5 / zoom, tan = Math.tan((fov * RAD) / 2);
      const d = Math.max(needH / (2 * tan), needW / (2 * tan * asp));
      const eye = [0, 2.75, d], tgt = [0, 2.02, 0];
      mPersp(proj, fov, asp, 1, 60); mLook(view, eye, tgt); mMul(vp, proj, view); size.eye = eye;
    }
    function startTurn(now, dur) { if (turnAt < 0) { turnAt = now; turnDur = dur || 1.6; } }

    function frame(ts) {
      raf = 0; if (dead) return;
      if (!canvas.isConnected) { ctl.destroy(); return; }
      const now = ts / 1000, dt = Math.min(0.05, Math.max(0.001, now - last)); last = now;
      if (document.hidden || paused || !canvas.offsetWidth) { raf = requestAnimationFrame(frame); return; } // not on screen: draw nothing
      size();
      /* the pose for this moment */
      const a = A[act], t = now - t0, u = a.T ? (t % a.T) / a.T : 0;
      for (let i = 0; i < keys.length; i++) Q[keys[i]] = REST[keys[i]];
      Q.bulbOn = 1; Q.maskOn = 1;
      a.f(t, Q, u);
      if (act === "idle" && talking) { A.talk.f(t, Q, 0); }
      if (talking) Q.beak = Math.max(Q.beak, 0.25 + 0.75 * Math.abs(wave(t, 0.26)));
      if (Q.eye > 0.5 && (t + 0.7) % 3.6 < 0.13) Q.eye = 0; // blink
      const k = 1 - Math.exp(-dt * 13);
      for (let i = 0; i < keys.length; i++) { const key = keys[i]; P[key] = key === "yaw" || key === "book" ? Q[key] : lerp(P[key], Q[key], k); }
      /* turning: by himself (360°), and by finger */
      if (!dragging) { user += vel * dt; vel *= Math.exp(-dt * 2.4); if (Math.abs(vel) < 2) vel = 0; }
      if (opt.spin === "auto" && turnAt < 0 && !dragging && now > nextTurn && !reduce) { startTurn(now, 2.2); }
      let auto = yawBase;
      if (turnAt >= 0) { const q = (now - turnAt) / turnDur; if (q >= 1) { turnAt = -1; nextTurn = now + (opt.every || 5.5); } else auto += 360 * (q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2); }
      J.turn.r[1] = auto + user + P.yaw;
      /* joints */
      J.turn.p[1] = 0; J.pelvis.p[1] = P.H + P.lift; J.pelvis.r[2] = P.sway;
      J.waist.r[0] = P.lean; J.waist.r[1] = P.twist; const sq = P.sq, inv = 1 / Math.sqrt(sq); J.waist.s[0] = inv; J.waist.s[1] = sq; J.waist.s[2] = inv;
      J.head.r[0] = P.hx; J.head.r[1] = P.hy; J.head.r[2] = P.hz;
      J.shL.r[0] = -P.La; J.shL.r[1] = -P.Lc; J.shL.r[2] = P.Lb; J.elL.r[0] = -P.Le;
      J.shR.r[0] = -P.Ra; J.shR.r[1] = P.Rc; J.shR.r[2] = -P.Rb; J.elR.r[0] = -P.Re;
      J.legL.r[0] = P.legL; J.legR.r[0] = P.legR;
      J.jaw.r[0] = 26 * P.beak;
      const open = P.eye > 0.5;
      ["L", "R"].forEach((s) => { J["white" + s].vis = J["pupil" + s].vis = J["glint" + s].vis = open; J["lid" + s].vis = J["lash" + s].vis = !open; });
      J.star.r[1] = t * 70; J.star.p[1] = 1.98 + 0.03 * wave(t, 1.6);
      J.shadow.s[0] = 2.5 - P.lift * 1.6; J.shadow.s[1] = 2.2 - P.lift * 1.4; J.shadow.alpha = 0.42 - P.lift * 0.3;
      /* props */
      J.stool.vis = !!a.stool; J.stool.p[2] = lerp(-0.1, -1.05, clamp((P.H - 0.56) / 0.24)); J.book.vis = !!a.book; J.brush.vis = a.hold === "brush"; J.cup.vis = a.hold === "cup"; J.cloth.vis = a.hold === "cloth";
      if (J.brush.vis) J.brush.p[0] = -0.12 + 0.1 * wave(t, 0.34);
      J.bulb.vis = !!a.bulb && Q.bulbOn > 0; if (a.bulb) { J.bulb.p[0] = a.bulb[0]; J.bulb.p[1] = a.bulb[1] + 0.05 * wave(t, 1.2); J.bulb.p[2] = a.bulb[2]; } J.mask.vis = act === "mask" && Q.maskOn > 0; J.plaster.vis = !!a.plaster;
      if (a.book) { J.cover.r[1] = -180 * P.book; J.book.p[0] = -0.31 * (1 - P.book); }
      const fx = a.fx;
      J.bubbles.forEach((b, i) => { b.vis = fx === "bubbles"; if (b.vis) { const o = fxT.bub[i], q = (t * 0.42 + o.ph) % 1; b.p[0] = o.x * (0.5 + q) + 0.1 * wave(t, 1.3, o.ph); b.p[1] = 1.5 + q * 2.4; b.p[2] = o.z; const s = o.s * (0.5 + q * 0.9) * (q > 0.92 ? (1 - q) / 0.08 : 1); b.s[0] = b.s[1] = b.s[2] = s; } });
      J.sparks.forEach((s, i) => { let on = false, q = 0, cx = 0, cy = 2.2, cz = 1.0, R0 = 1.2;
        if (fx === "clap") { q = (t / 0.62 + 0.5) % 1; on = q < 0.55; cy = 1.55; cz = 1.25; R0 = 0.9; q /= 0.55; }
        else if (fx === "sparks") { q = (t / 1.1 + i * 0.07) % 1; on = true; cy = 3.0; cz = 0.2; R0 = 1.9; }
        else if (fx === "knock") { q = (t / 0.42 + 0.2) % 1; on = q < 0.5 && i < 4; cx = -0.75; cy = 1.75; cz = 1.35; R0 = 0.5; q /= 0.5; }
        s.vis = on; if (on) { const o = fxT.sp[i], r = R0 * o.v * (0.25 + 0.75 * q); s.p[0] = cx + Math.cos(o.a) * r; s.p[1] = cy + Math.sin(o.a) * r * 0.8; s.p[2] = cz; const z = 0.13 * (1 - q) + 0.02; s.s[0] = s.s[1] = s.s[2] = z; s.r[2] = t * 200 + i * 40; } });
      J.zs.forEach((z, i) => { z.vis = fx === "zs"; if (z.vis) { const q = (t * 0.33 + i / 3) % 1; z.p[0] = 0.9 + q * 0.9 + 0.1 * wave(t, 1.6, i / 3); z.p[1] = 3.0 + q * 1.5; z.p[2] = 0.6; const s = 0.3 + q * 0.5; z.s[0] = z.s[1] = s; z.alpha = q < 0.15 ? q / 0.15 : q > 0.75 ? (1 - q) / 0.25 : 1; z.r[2] = -12 + 10 * wave(t, 2, i / 3); } });
      J.bang.vis = fx === "bang" && t < 1.6; if (J.bang.vis) { const q = clamp(t / 0.35); J.bang.p[0] = 1.45; J.bang.p[1] = 3.9; J.bang.p[2] = 0.4; J.bang.s[0] = J.bang.s[1] = 0.9 * (q < 1 ? 1 + 0.4 * Math.sin(q * Math.PI) : 1); J.bang.alpha = t > 1.2 ? (1.6 - t) / 0.4 : 1; }
      R.render(root, vp, size.eye, light);
      /* a slow computer: draw fewer pixels rather than stutter */
      if (dt > 0.045) { if (++slow > 40 && dprCap > 1) { dprCap = 1; slow = 0; } } else if (slow > 0) slow--;
      raf = requestAnimationFrame(frame);
    }

    const pd = (e) => { dragging = true; lastX = e.clientX; vel = 0; canvas.style.cursor = "grabbing"; try { canvas.setPointerCapture(e.pointerId); } catch (err) {} };
    const pm = (e) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; const d = dx * 0.55; user += d; vel = clamp(d * 60, -420, 420); };
    const pu = () => { dragging = false; canvas.style.cursor = "grab"; };
    if (opt.drag !== false) { canvas.addEventListener("pointerdown", pd); canvas.addEventListener("pointermove", pm); canvas.addEventListener("pointerup", pu); canvas.addEventListener("pointercancel", pu); }

    const ctl = {
      ok: true, el: canvas,
      get action() { return act; },
      play(id, o = {}) { if (!A[id]) id = "idle"; if (id !== act || o.restart) { act = id; t0 = performance.now() / 1000; } if (o.turn) startTurn(performance.now() / 1000, o.turn === true ? 1.6 : o.turn); return ctl; },
      turn(dur) { startTurn(performance.now() / 1000, dur); return ctl; },
      talk(on) { talking = !!on; return ctl; },
      pause(on) { paused = !!on; return ctl; },
      destroy() { if (dead) return; dead = true; live.delete(ctl); cancelAnimationFrame(raf); R.lose(); canvas.remove(); }
    };
    live.add(ctl);
    if (opt.spin === "intro" || opt.spin === "auto") { turnAt = performance.now() / 1000; turnDur = 1.5; yawBase = 0; }
    nextTurn = performance.now() / 1000 + (opt.every || 5.5);
    raf = requestAnimationFrame(frame);
    return ctl;
  };
  /* The renderer and its building blocks, for other original 3D scenes of the project (js/campus3d.js: the school from the air).
     Renderer(canvas) → { gl, render(rootNode, viewProjection, eyePosition, lightDirection), lose() } or null without WebGL;
     node(o) / add(parent, o): { p, r (degrees), s, mesh, col [r,g,b], spec, emis, alpha, mode, tex (a canvas), vis, kids };
     MESH: sphere, cone, cyl, box, disc, quad, ring, ringThin, star · build(fn) makes a new mesh · torus(r) a ring. */
  O3.kit = { Renderer, MESH, build, torus, node, add, m4, mMul, mTRS, mPersp, mLook, hex, paint, emblem, clamp, lerp, sm, seg, wave, up, RAD, TAU };
  /** Ollie speaks: every 3D Ollie on the page moves his beak (called from TC.ollie) */
  O3.state = function (state) { live.forEach((c) => c.talk(state === "talk")); };
})();
/* EMBLEM-BEGIN — made by tools/embed_emblem.py from assets/img/tucheng-emblem.svg; do not edit by hand */
window.TC.O3.EMBLEM = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0i5Y2X5oqV57ij6I2J5bGv6Y6u5Zyf5Z+O5ZyL5rCR5bCP5a245qCh5b69Ij4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iZiI+PGNpcmNsZSBjeD0iNTAwIiBjeT0iNTAwIiByPSI0NDAuMCIvPjwvY2xpcFBhdGg+CjxsaW5lYXJHcmFkaWVudCBpZD0ic2t5IiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjYjlmZmYwIi8+PHN0b3Agb2Zmc2V0PSIuNTUiIHN0b3AtY29sb3I9IiM3YmZiZDUiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM0ZmRjYjgiLz48L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9ImRrIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjNWNiODBjIi8+PHN0b3Agb2Zmc2V0PSIuNSIgc3RvcC1jb2xvcj0iIzQyOTIwNCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzJhNmEwMCIvPjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0ibHQiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNjNmZmOWMiLz48c3RvcCBvZmZzZXQ9Ii41IiBzdG9wLWNvbG9yPSIjOTVlZTcwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNmZkMDRhIi8+PC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJnciIgeDE9IjAiIHkxPSIwIiB4Mj0iMCIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2FhYjU4ZiIvPjxzdG9wIG9mZnNldD0iLjEyIiBzdG9wLWNvbG9yPSIjYzZjZGE5Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZDlkZmMwIi8+PC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJyZCIgeDE9IjAiIHkxPSIwIiB4Mj0iMCIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2UyMjgxYyIvPjxzdG9wIG9mZnNldD0iLjU1IiBzdG9wLWNvbG9yPSIjYjMwYTA1Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjODYwMzAwIi8+PC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJyZiIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2IwM2ExYyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzZhMTIwMiIvPjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0iYmsiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMyNjJiMjYiLz48c3RvcCBvZmZzZXQ9Ii4zNSIgc3RvcC1jb2xvcj0iIzBhMGYwYSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwMCIvPjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icmltIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmZmN2NmIi8+PHN0b3Agb2Zmc2V0PSIuMjUiIHN0b3AtY29sb3I9IiNmM2M2NGEiLz48c3RvcCBvZmZzZXQ9Ii41IiBzdG9wLWNvbG9yPSIjZmZmM2I4Ii8+PHN0b3Agb2Zmc2V0PSIuNzUiIHN0b3AtY29sb3I9IiNjODkwMWEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmNmQ1NmEiLz48L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InJpbTIiIHgxPSIxIiB5MT0iMSIgeDI9IjAiIHkyPSIwIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZmY3Y2YiLz48c3RvcCBvZmZzZXQ9Ii41IiBzdG9wLWNvbG9yPSIjYjQ3YTEwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmZlOWEwIi8+PC9saW5lYXJHcmFkaWVudD4KPHJhZGlhbEdyYWRpZW50IGlkPSJkb21lIiBjeD0iLjM4IiBjeT0iLjMiIHI9Ii44NSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9Ii4yOCIvPjxzdG9wIG9mZnNldD0iLjQ1IiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9IjAiLz48c3RvcCBvZmZzZXQ9Ii44IiBzdG9wLWNvbG9yPSIjMDAxYTEwIiBzdG9wLW9wYWNpdHk9Ii4wNiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwMWExMCIgc3RvcC1vcGFjaXR5PSIuMzQiLz48L3JhZGlhbEdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9Imdsb3NzIiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9Ii42MiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2ZmZiIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD4KPGZpbHRlciBpZD0ic2giIHg9Ii0yMCUiIHk9Ii0yMCUiIHdpZHRoPSIxNDAlIiBoZWlnaHQ9IjE1MCUiPjxmZUdhdXNzaWFuQmx1ciBpbj0iU291cmNlQWxwaGEiIHN0ZERldmlhdGlvbj0iMTQiLz48ZmVPZmZzZXQgZHk9IjE2Ii8+PGZlQ29tcG9uZW50VHJhbnNmZXI+PGZlRnVuY0EgdHlwZT0ibGluZWFyIiBzbG9wZT0iLjQ1Ii8+PC9mZUNvbXBvbmVudFRyYW5zZmVyPjxmZU1lcmdlPjxmZU1lcmdlTm9kZS8+PGZlTWVyZ2VOb2RlIGluPSJTb3VyY2VHcmFwaGljIi8+PC9mZU1lcmdlPjwvZmlsdGVyPgo8ZmlsdGVyIGlkPSJ1cCIgeD0iLTEwJSIgeT0iLTEwJSIgd2lkdGg9IjEyMCUiIGhlaWdodD0iMTMwJSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VBbHBoYSIgc3RkRGV2aWF0aW9uPSIzLjUiLz48ZmVPZmZzZXQgZHg9IjMiIGR5PSI3Ii8+PGZlQ29tcG9uZW50VHJhbnNmZXI+PGZlRnVuY0EgdHlwZT0ibGluZWFyIiBzbG9wZT0iLjUiLz48L2ZlQ29tcG9uZW50VHJhbnNmZXI+PGZlTWVyZ2U+PGZlTWVyZ2VOb2RlLz48ZmVNZXJnZU5vZGUgaW49IlNvdXJjZUdyYXBoaWMiLz48L2ZlTWVyZ2U+PC9maWx0ZXI+CjwvZGVmcz4KPGcgZmlsdGVyPSJ1cmwoI3NoKSI+PGNpcmNsZSBjeD0iNTAwIiBjeT0iNTAwIiByPSI0ODQiIGZpbGw9InVybCgjcmltKSIvPjxjaXJjbGUgY3g9IjUwMCIgY3k9IjUwMCIgcj0iNDYyIiBmaWxsPSJ1cmwoI3JpbTIpIi8+PGNpcmNsZSBjeD0iNTAwIiBjeT0iNTAwIiByPSI0NDciIGZpbGw9IiMxNjM1MWYiLz48L2c+CjxnIGNsaXAtcGF0aD0idXJsKCNmKSI+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjUyNS44IiBmaWxsPSJ1cmwoI3NreSkiLz4KPHJlY3QgeD0iMCIgeT0iNTI1LjgiIHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjQ3NC4yIiBmaWxsPSJ1cmwoI2dyKSIvPgo8ZyBmaWx0ZXI9InVybCgjdXApIj48cGF0aCBkPSJNNjgyLjkgNTA4LjlMNjgyLjkgNTE2LjdMNzIxLjggNTE3LjFMNzI5LjIgNTE0LjVMNzI3LjggNTAzLjFMNzAyLjIgNDg0LjJMNjk0LjIgNDg0LjlaTTMwOC4xIDQ3Ny40TDMwOC4xIDQ4NC45TDI5MS4yIDUxNi40TDI5MC44IDUyNS4yTDM1OS44IDUyNC45TDM2MC40IDQ5MC40TDM2Ni4xIDQ5MC4xTDM2NS4xIDQ3Ny43Wk02MDMuMyA0MTAuOEw1NzMuNiAzODkuNkw1NzAuMyAzODUuN0w1NjcuOSAzODUuNEw1NTcuMCAzNzUuN0w1NTEuMyAzNzMuNEw1MzcuNiAzNjEuMEw1MTguMyAzNDkuMEw1MTEuMyAzNDEuOEw1MDYuMyAzMzguOUw0OTAuNyAzMzguOUw0NzEuMCAzNTMuMkw0NjguMCAzNTcuMUw0NTQuNyAzNjQuOUw0MzMuMSAzODEuOEw0MzAuNCAzODIuMkw0MjMuNCAzOTAuMEw0MTYuNyAzOTIuNkwzOTIuNCA0MTIuNEwzODIuOCA0MTcuNkwzNzYuNCA0MjQuMUwzNTguMSA0MzYuMUwzNTMuMSA0NDEuNkwzNTAuMSA0NDIuM0wzNDcuOCA0NDUuNUwzMzYuNSA0NTIuNEwzMzUuNSA0NTUuMEwzMzAuOCA0NTYuOUwzMjguOCA0NjEuMkwzMjguOCA0NzAuM0wzNDEuMSA0NzIuNUwzNjIuMSA0NzIuNUwzNjguMSA0NzUuNUwzNzAuOCA0ODIuMEwzNzAuNCA1MDQuMUwzNzEuOCA1MTIuMkwzNzguMSA1MTcuNEw1NTguNiA1MTcuNEw1NjYuMCA1MDYuN0w2MDMuMyA0MjAuNVpNODA1LjEgMjU0LjdMNzA5LjIgNDYzLjhMNzA3LjggNDc0LjhMNzY5LjEgNTE5LjdMNzc0LjUgNTI1LjhMOTMyLjMgNTI1LjhMOTMyLjcgNTE3LjdMOTEyLjQgNDc0LjhMODEyLjQgMjU0LjdaTTIwNy4yIDI1NC4xTDE5OS42IDI1NC4xTDY5LjMgNTEzLjVMNjcuMyA1MTguMEw2Ny4zIDUyNS4yTDE1OC42IDUyNS41TDE2Mi42IDUyMS42TDI0Mi45IDMzMy40TDI0Mi45IDMyNS4zWk01MDAuMyAxMzUuNEw0OTMuMCAxMzUuNEwzNDEuOCA0MjAuNUwzNDAuMSA0MjQuNEwzNDAuMSA0MzEuNkwzNDcuOCA0MzEuNkw0MzguNyAzNjQuM0w0MzkuNyAzNDAuNUw0MjQuMSAzMzkuMkw0MjIuMSAzMzcuMEw0OTguMyAyNzkuMUw1NzUuNiAzMzcuMEw1NzIuMyAzMzkuNkw1NTkuMCAzMzkuNkw1NTcuMyAzNDAuOUw1NTcuMyAzNjIuM0w1NTguNiAzNjQuNkw1OTkuNiAzOTQuOEw2MDguMyAzOTUuNUw2MjAuMiAzNjkuMkw2MjAuMiAzNjEuN1oiIGZpbGw9InVybCgjZGspIi8+PHBhdGggZD0iTTY4Ni45IDIzMC4wTDYxMS45IDM5My4yTDYxMS45IDM5Ny44TDYxNC4yIDQwMi4zTDYzNC42IDQxNy42TDY0MC4yIDQxOS4yTDY0MC45IDQyMi4xTDY0NS4yIDQyMi44TDY0NS45IDQyNS40TDY1MC4yIDQyNy4wTDY1Mi42IDQzMC45TDY5Ny41IDQ2NC40TDcwNi44IDQ2NC40TDc1MC4xIDM2OS44TDc1MC44IDM1Ny4xTDY5NC45IDIzMy45TDY5Mi4yIDIzMC4wWk0zMDQuNSAyMDQuM0wzMDAuMiAyMDQuM0wxNzIuNiA1MDIuOEwxNjYuOSA1MTYuN0wxNjcuNiA1MjMuNkwyODQuOCA1MjMuMkwzMDMuMSA0ODkuNEwzMDEuOCA0ODEuNkwyOTAuMiA0ODEuNkwyODYuOCA0NzcuN0wyODYuOCA0NzQuMkwyOTQuMiA0NjcuN0wyOTQuOCA0NjQuN0wzMDMuOCA0NjAuOEwzMjQuOCA0NDUuMkwzMjYuMSA0NDEuM0wzMjguOCA0NDEuMEwzNjguOCAzNjUuNkwzNzAuMSAzNTIuOUwzNTAuNCAzMDUuOEwzNDcuMSAyOTguOUwzNDUuNSAyOTguNkwzNDUuNSAyOTQuN0wzMDcuMSAyMDYuMFoiIGZpbGw9InVybCgjbHQpIi8+PC9nPgo8cGF0aCBkPSJNNDQyLjcgMzI4LjhMNDQyLjcgMzMxLjFMNDQ3LjQgMzM2LjNMNDQ4LjcgMzQ4LjdMNDUyLjQgMzQ4LjdMNDU3LjAgMzQ2LjFMNDk1LjAgMzE3LjVMNTAxLjMgMzE3LjVMNTQ2LjMgMzQ5LjZMNTQ5LjYgMzQ4LjdMNTUwLjAgMzM3LjZMNTU1LjAgMzMxLjhMNTU1LjAgMzI5LjJMNTQ5LjMgMzI0LjBMNTE5LjMgMzAxLjVMNTA2LjcgMjkzLjdMNTAwLjcgMjg4LjJMNDk1LjMgMjg5LjJMNDkxLjAgMjkzLjdMNDcyLjQgMzA2LjFaIiBmaWxsPSJ1cmwoI3JmKSIvPgo8cGF0aCBkPSJNMzA1LjUgNDU3LjlMMzA1LjUgNDgxLjBMMzA3LjUgNDgzLjNMMzUyLjggNDg0LjZMMzU3LjggNDg3LjJMMzU4LjggNTE5LjBMMzYwLjEgNTI1LjhMMzYyLjggNTI4LjRMNzQwLjggNTI4LjRMNzQ2LjUgNTI3LjVMNzUwLjEgNTI0LjlMNzQ5LjEgNDk5LjVMNzE3LjggNDc2LjhMNzE0LjUgNDcyLjlMNjk3LjUgNDYzLjFMNjcyLjIgNDQzLjNMNjY0LjUgNDM5LjBMNjMwLjIgNDExLjRMNjI0LjkgNDA5LjFMNjA5LjMgMzk1LjhMNTU2LjMgMzU3LjVMNTQ0LjYgMzQ3LjBMNTI3LjYgMzM2LjBMNTI0LjYgMzMyLjFMNTEyLjAgMzI1LjNMNDgyLjMgMzI1LjZMNDA3LjcgMzgxLjhMMzg3LjggMzk1LjJMMzg1LjEgMzk4LjRMMzc2LjQgNDAzLjBMMzU2LjggNDE5LjVMMzQ3LjEgNDI1LjFMMzQyLjEgNDMwLjNaIiBmaWxsPSIjM2E4NDA0Ii8+CjxwYXRoIGQ9Ik0zMTIuOCA0NjUuMUwzMTIuOCA0NzMuOEwzMTYuNSA0NzYuOEwzNTQuMSA0NzcuMUwzNjMuNCA0NzguNEwzNjYuMSA0ODIuM0wzNjcuMSA1MTcuN0wzNjkuMSA1MjAuNkwzNzIuOCA1MjEuOUw1ODMuMyA1MjAuM0w3MzMuNSA1MjEuM0w3MzkuMiA1MjAuM0w3NDIuOCA1MTcuN0w3NDIuOCA1MDguM0w3MzUuNSA1MDEuNUw3MTAuNSA0ODMuOUw3MDcuMiA0ODAuMEw2OTAuMiA0NzAuM0w2NjQuOSA0NTAuNEw2NTcuMiA0NDYuMkw2MjIuOSA0MTguNkw2MTcuNiA0MTYuM0w2MDEuOSA0MDMuMEw1NDkuMCAzNjQuNkw1MzcuMyAzNTQuMkw1MjAuMyAzNDMuMUw1MTcuMyAzMzkuMkw1MDQuNyAzMzIuNEw0ODguNyAzMzMuNEw0MTUuMSAzODkuMEwzOTUuMSA0MDIuM0wzOTIuNCA0MDUuNkwzODMuOCA0MTAuMUwzNjQuMSA0MjYuN0wzNTQuNCA0MzIuMkwzNDkuNCA0MzcuNFoiIGZpbGw9IiNmZmYiLz4KPGNsaXBQYXRoIGlkPSJoYyI+PHBhdGggZD0iTTMxNy4xIDQ2OS4zTDMyMC44IDQ3Mi41TDM1OC40IDQ3Mi45TDM2Ny44IDQ3NC4yTDM3MC44IDQ3OS43TDM3MS40IDUxMy41TDM3My40IDUxNi40TDM3Ny4xIDUxNy43TDU3OC45IDUxNi4xTDcyOS4yIDUxNy4xTDczNC44IDUxNi4xTDczOC41IDUxMy41TDczNy44IDUxMS4yTDcwNi4yIDQ4OC4xTDcwMi44IDQ4NC4yTDY4NS45IDQ3NC41TDU2OC42IDM4NS40TDU0NC42IDM2OC44TDUzMy4wIDM1OC40TDUxNi4wIDM0Ny40TDUxMy4wIDM0My41TDUwMC4zIDMzNi42TDQ5NC43IDMzNi42TDQxOS40IDM5My4yTDM5OS40IDQwNi41TDM5Ni43IDQwOS44TDM4OC4xIDQxNC4zTDM2OC40IDQzMC45TDM1OC44IDQzNi40TDM1My44IDQ0MS42WiIvPjwvY2xpcFBhdGg+CjxwYXRoIGQ9Ik0zMTcuMSA0NjkuM0wzMjAuOCA0NzIuNUwzNTguNCA0NzIuOUwzNjcuOCA0NzQuMkwzNzAuOCA0NzkuN0wzNzEuNCA1MTMuNUwzNzMuNCA1MTYuNEwzNzcuMSA1MTcuN0w1NzguOSA1MTYuMUw3MjkuMiA1MTcuMUw3MzQuOCA1MTYuMUw3MzguNSA1MTMuNUw3MzcuOCA1MTEuMkw3MDYuMiA0ODguMUw3MDIuOCA0ODQuMkw2ODUuOSA0NzQuNUw1NjguNiAzODUuNEw1NDQuNiAzNjguOEw1MzMuMCAzNTguNEw1MTYuMCAzNDcuNEw1MTMuMCAzNDMuNUw1MDAuMyAzMzYuNkw0OTQuNyAzMzYuNkw0MTkuNCAzOTMuMkwzOTkuNCA0MDYuNUwzOTYuNyA0MDkuOEwzODguMSA0MTQuM0wzNjguNCA0MzAuOUwzNTguOCA0MzYuNEwzNTMuOCA0NDEuNloiIGZpbGw9InVybCgjZGspIi8+CjxnIGNsaXAtcGF0aD0idXJsKCNoYykiPjxwYXRoIGQ9Ik01OTguMyA0MjAuNUw1NjMuMyA1MDAuMkw1NjIuNiA1MTUuMUw2ODUuOSA1MTQuNUw2OTQuMiA0OTQuM0w2OTQuMiA0ODEuM0w2MTkuOSA0MjQuN0w2MTEuMiA0MjAuNVoiIGZpbGw9InVybCgjbHQpIi8+PHBhdGggZD0iTTMxNy4xIDQ2OS4zTDMyMC44IDQ3Mi41TDM1OC40IDQ3Mi45TDM2Ny44IDQ3NC4yTDM3MC44IDQ3OS43TDM3MS40IDUxMy41TDM3My40IDUxNi40TDM3Ny4xIDUxNy43TDU3OC45IDUxNi4xTDcyOS4yIDUxNy4xTDczNC44IDUxNi4xTDczOC41IDUxMy41TDczNy44IDUxMS4yTDcwNi4yIDQ4OC4xTDcwMi44IDQ4NC4yTDY4NS45IDQ3NC41TDU2OC42IDM4NS40TDU0NC42IDM2OC44TDUzMy4wIDM1OC40TDUxNi4wIDM0Ny40TDUxMy4wIDM0My41TDUwMC4zIDMzNi42TDQ5NC43IDMzNi42TDQxOS40IDM5My4yTDM5OS40IDQwNi41TDM5Ni43IDQwOS44TDM4OC4xIDQxNC4zTDM2OC40IDQzMC45TDM1OC44IDQzNi40TDM1My44IDQ0MS42WiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMGIzZDAwIiBzdHJva2Utb3BhY2l0eT0iLjM1IiBzdHJva2Utd2lkdGg9IjciLz48L2c+CjxwYXRoIGQ9Ik02MS43IDUyNC41TDYyLjMgNTI3LjhMOTM2LjcgNTI4LjRMOTM4LjMgNTI3LjFMODg0LjAgNDA1LjJMODA5LjggMjQ1LjBMODA3LjggMjQ1LjBMODA1LjQgMjQ4LjJMNzU4LjEgMzUzLjJMNzU1LjEgMzU1LjJMNjk0LjIgMjIxLjJMNjkwLjUgMjE1LjdMNjg4LjIgMjE2LjBMNjIzLjkgMzU3LjFMNjIwLjkgMzU4LjhMNDk4LjAgMTI3LjBMNDkzLjcgMTI4LjlMMzc2LjEgMzUwLjlMMzc0LjEgMzUwLjNMMzA0LjggMTg5LjFMMzAyLjEgMTg5LjFMMjQ1LjIgMzIxLjdMMjQyLjUgMzIwLjdMMjA1LjIgMjQ1LjlMMjAxLjkgMjQ1LjNaTTQ0Mi4wIDMyOS4yTDQ5NS4zIDI4OC45TDUwMC43IDI4Ny45TDU0OS4zIDMyMy42TDU1NS4zIDMyOS4yTDU1NS42IDMzMS40TDU1MC42IDMzNi42TDU1MC4wIDM0OC43TDU0Ny4wIDM1MC4zTDUwMS4zIDMxNy44TDQ5NS4wIDMxNy44TDQ3MC40IDMzNy4zTDQ1NC4wIDM0OC4zTDQ0OS40IDM0OS4zTDQ0Ny40IDM0Ni40TDQ0Ni43IDMzNS4zWk04MDcuOCAyNTYuMEw4MDkuNCAyNTYuMEw4MTIuMSAyNTkuOUw5MzEuMyA1MjEuNkw5MzAuMCA1MjMuOUw3NzYuOCA1MjMuOUw3NzEuNSA1MTcuN0w3MDkuOCA0NzIuNUw3MTEuMiA0NjYuMFpNMjA0LjIgMjU0LjdMMjQxLjIgMzMwLjFMMTYwLjYgNTE5LjNMMTU2LjMgNTIzLjZMNzAuMyA1MjMuNkw2OC43IDUyMS4wTDE5My45IDI3MC43TDIwMS45IDI1NS40Wk02ODkuMiAyMjQuOEw2OTEuNSAyMjYuMUw3NTMuMSAzNjEuMEw3NDYuOCAzNzcuOUw3MDQuNSA0NjguMEw2OTcuNSA0NjQuN0w2MDkuNiAzOTguN1pNMTY0LjYgNTIyLjlMMzAyLjggMTk4LjhMMzA2LjEgMjAxLjRMMzcyLjQgMzU5LjRMMzI5LjEgNDQxLjZMMjg4LjIgNDcyLjlMMjg3LjIgNDc3LjRMMjg5LjggNDgxLjBMMzAwLjIgNDgwLjdMMjk4LjggNDc2LjhMNDk2LjcgMzMwLjFMNDk5LjcgMzI5LjhMNzU1LjEgNTE4LjdMNzU0LjEgNTIxLjNMMzY1LjEgNTIxLjNMMzYyLjggNTE5LjBMMzYyLjEgNDg5LjhMMzU5LjEgNDg2LjJMMzU4LjEgNTIxLjlMMzU2LjggNTIzLjZMMjkzLjggNTIzLjZMMjkyLjUgNTIyLjZMMjkzLjIgNTE4LjdMMzEwLjEgNDg3LjJMMzEwLjggNDgyLjlMMzA4LjUgNDgyLjZMMzA0LjUgNDg2LjhMMjg5LjIgNTE3LjFMMjgzLjUgNTI0LjJMMTY2LjMgNTI0LjJaTTQ5Ny4zIDEzNi40TDYxOC42IDM2NC42TDYwNy42IDM5MS4zTDYwNS42IDM5My45TDYwMS45IDM5Mi45TDU2MC4wIDM2MS40TDU1OS4zIDM0My4xTDU2MS4zIDM0MS41TDU3NC42IDM0MS41TDU3OC4zIDMzOC45TDU3Ny42IDMzNC43TDUwNi4wIDI4MC40TDQ5Ny43IDI3Ni4yTDQyMC4xIDMzNC43TDQxOS43IDMzOC45TDQyMS43IDM0MS4yTDQzNS43IDM0MS41TDQzNy43IDM0Mi44TDQzNy40IDM2MS40TDM1My40IDQyNC4xTDMzOS44IDQzMi41TDM0MC4xIDQyOS4zTDM1MC4xIDQxMi43TDQ5My4wIDE0MC42WiIgZmlsbD0iIzA4MTIwOCIvPgo8ZyBmaWx0ZXI9InVybCgjdXApIj48cGF0aCBkPSJNNzAxLjUgNTgyLjlRNzAwLjggNTg0LjAgNzAwLjggNTg1LjdRNzAwLjggNTg3LjMgNzAxLjcgNTg5LjJRNzAyLjUgNTkxLjIgNzA0LjUgNTkyLjhRNzA2LjUgNTk0LjQgNzA5LjcgNTk1LjRRNzEyLjggNTk2LjQgNzE1LjMgNTk2LjJRNzE3LjggNTk2LjEgNzIyLjIgNTkzLjhRNzI2LjUgNTkxLjUgNzI4LjIgNTg5LjZRNzI5LjggNTg3LjYgNzI5LjcgNTg2LjZRNzI5LjUgNTg1LjcgNzI3LjcgNTg0LjdRNzI1LjggNTgzLjcgNzIzLjUgNTgzLjFRNzIxLjIgNTgyLjQgNzE4LjggNTgyLjJRNzE2LjUgNTgyLjEgNzEzLjAgNTgwLjhRNzA5LjUgNTc5LjUgNzA3LjcgNTc5LjVRNzA1LjggNTc5LjUgNzA0LjAgNTgwLjZRNzAyLjIgNTgxLjggNzAxLjUgNTgyLjlaTTU2NS4wIDU4MC44UTU2My42IDU3OS44IDU2Mi42IDU3OS41UTU2MS42IDU3OS4yIDU1OS4wIDU3OS4yUTU1Ni4zIDU3OS4yIDU1NS4wIDU3OS42UTU1My42IDU4MC4xIDU1Mi4xIDU4MS42UTU1MC42IDU4My4xIDU0OC41IDU4OC4xUTU0Ni4zIDU5My4xIDU0Ni4wIDU5NS4xUTU0NS42IDU5Ny4wIDU0NC4xIDYwMS40UTU0Mi42IDYwNS44IDU0Mi4zIDYwOC40UTU0Mi4wIDYxMS4wIDU0MS4xIDYxMi4yUTU0MC4zIDYxMy4zIDUzNS4xIDYxNC42UTUzMC4wIDYxNS45IDUyNS42IDYxNi4yUTUyMS4zIDYxNi41IDUxOC43IDYxNy4yUTUxNi4wIDYxNy44IDUxNC4wIDYxOC44UTUxMi4wIDYxOS44IDUxMS4zIDYyMC45UTUxMC43IDYyMi4xIDUxMC43IDYyNC44UTUxMC43IDYyNy42IDUxMS4zIDYyOC45UTUxMi4wIDYzMC4yIDUxMy4yIDYzMS4yUTUxNC4zIDYzMi4xIDUxOC43IDYzMy4xUTUyMy4wIDYzNC4xIDUzMC41IDYzNC4xUTUzOC4wIDYzNC4xIDUzOS41IDYzNS4xUTU0MS4wIDYzNi4wIDU0MS4zIDYzNy4yUTU0MS42IDYzOC4zIDU0MS44IDY0My4yUTU0Mi4wIDY0OC4xIDU0MS41IDY0OS45UTU0MS4wIDY1MS43IDU0MC4wIDY1Mi42UTUzOS4wIDY1My42IDUzNC4xIDY1NC43UTUyOS4zIDY1NS45IDUyNC41IDY1OC4yUTUxOS43IDY2MC40IDUxNy4yIDY2Mi4yUTUxNC43IDY2NC4wIDUxMy44IDY2NS4zUTUxMy4wIDY2Ni42IDUxMi4yIDY2OS43UTUxMS4zIDY3Mi44IDUxMS41IDY3NC42UTUxMS43IDY3Ni40IDUxMi44IDY3OS4wUTUxNC4wIDY4MS42IDUxNi4zIDY4My4yUTUxOC43IDY4NC44IDUyMS41IDY4NS4wUTUyNC4zIDY4NS4xIDUyNi4wIDY4NC42UTUyNy42IDY4NC4yIDUzMC4zIDY4Mi40UTUzMy4wIDY4MC42IDUzNS4wIDY3OS42UTUzNy4wIDY3OC42IDUzOC4xIDY3OC41UTUzOS4zIDY3OC4zIDU0My4xIDY3Ni4yUTU0Ny4wIDY3NC4xIDU1MS4wIDY3My42UTU1NS4wIDY3My4xIDU1Ny4zIDY3Mi4zUTU1OS42IDY3MS41IDU2Ny42IDY3MS4wUTU3NS42IDY3MC41IDU3OS4xIDY2OS41UTU4Mi42IDY2OC42IDU4NS44IDY2Ni42UTU4OC45IDY2NC43IDU5MC4zIDY2Mi43UTU5MS42IDY2MC44IDU5Mi4zIDY1OS4wUTU5Mi45IDY1Ny4yIDU5Mi45IDY1Ni4wUTU5Mi45IDY1NC45IDU5MS44IDY1My4wUTU5MC42IDY1MS4wIDU4OC44IDY1MC40UTU4Ni45IDY0OS43IDU4MC40IDY0OS41UTU3My45IDY0OS40IDU3Mi44IDY0OC40UTU3MS42IDY0Ny40IDU3MC45IDY0NS4zUTU3MC4zIDY0My4yIDU2OS45IDYzOC42UTU2OS42IDYzNC4xIDU3MC44IDYzMy4wUTU3MS45IDYzMS44IDU3Ni45IDYzMS4yUTU4MS45IDYzMC41IDU4NS4xIDYyOS4yUTU4OC4zIDYyNy45IDU4OS4zIDYyNy4xUTU5MC4zIDYyNi4zIDU5MS42IDYyNC4zUTU5Mi45IDYyMi40IDU5My4zIDYyMS4xUTU5My42IDYxOS44IDU5My40IDYxOC4zUTU5My4zIDYxNi45IDU5Mi40IDYxNS43UTU5MS42IDYxNC42IDU4OS40IDYxMy42UTU4Ny4zIDYxMi42IDU4NC4zIDYxMi4yUTU4MS4zIDYxMS43IDU3Ni44IDYxMS44UTU3Mi4zIDYxMi4wIDU3MS4zIDYxMS4zUTU3MC4zIDYxMC43IDU2OS45IDYwOC45UTU2OS42IDYwNy4xIDU3MC40IDYwMi4yUTU3MS4zIDU5Ny40IDU3MS4xIDU5My45UTU3MC45IDU5MC41IDU2OS45IDU4Ny45UTU2OC45IDU4NS4zIDU2Ny42IDU4My41UTU2Ni4zIDU4MS44IDU2NS4wIDU4MC44Wk0yMjIuOSA2OTEuM1EyMjIuOSA2OTIuOSAyMjMuNSA2OTQuN1EyMjQuMiA2OTYuNSAyMjYuNSA2OTkuMVEyMjguOSA3MDEuNyAyMzEuNCA3MDIuOVEyMzMuOSA3MDQuMCAyMzUuNSA3MDQuMFEyMzcuMiA3MDQuMCAyNDEuOSA3MDMuM1EyNDYuNSA3MDIuNyAyNTIuOSA3MDAuN1EyNTkuMiA2OTguOCAyNjEuOCA2OTguNlEyNjQuNSA2OTguNSAyNjguNyA2OTcuNVEyNzIuOCA2OTYuNSAyNzYuMCA2OTYuMlEyNzkuMiA2OTUuOSAyODcuMCA2OTQuMVEyOTQuOCA2OTIuMyAzMDcuOCA2OTEuMFEzMjAuOCA2ODkuNyAzMjIuMyA2ODkuMlEzMjMuOCA2ODguNyAzMzguMyA2ODguN1EzNTIuOCA2ODguNyAzNjAuMyA2OTAuMFEzNjcuOCA2OTEuMyAzNjkuOCA2OTIuMFEzNzEuOCA2OTIuNiAzNzYuMSA2OTQuOVEzODAuNCA2OTcuMiAzODIuMSA2OTguM1EzODMuOCA2OTkuNCAzODUuMyA3MDEuMVEzODYuOCA3MDIuNyAzODkuNiA3MDQuM1EzOTIuNCA3MDUuOSAzOTkuOSA3MDkuMlE0MDcuNCA3MTIuNCA0MTEuMiA3MTIuOVE0MTUuMSA3MTMuNCA0MTkuNyA3MTMuNFE0MjQuNCA3MTMuNCA0MjguNiA3MTIuNlE0MzIuNyA3MTEuOCA0MzQuNCA3MTEuMFE0MzYuMCA3MTAuMiA0MzguOSA3MDkuNVE0NDEuNyA3MDguOSA0NDUuMCA3MDcuNFE0NDguNCA3MDUuOSA0NTEuNCA3MDQuMFE0NTQuNCA3MDIuMCA0NjIuNCA2OTQuNlE0NzAuNCA2ODcuMSA0NzIuMiA2ODQuM1E0NzQuMCA2ODEuNiA0NzQuMiA2NzkuM1E0NzQuNCA2NzcuMCA0NzMuNCA2NzYuNFE0NzIuNCA2NzUuNyA0NTguNyA2NzYuMlE0NDUuMCA2NzYuNyA0MzguMiA2NzYuMFE0MzEuNCA2NzUuNCA0MjkuMSA2NzQuNlE0MjYuNyA2NzMuOCA0MTcuOSA2NzIuM1E0MDkuMSA2NzAuOCA0MDcuNiA2NzAuMlE0MDYuMSA2NjkuNSA0MDMuNCA2NjkuMlE0MDAuNyA2NjguOSAzOTYuNiA2NjcuN1EzOTIuNCA2NjYuNiAzODIuMyA2NjUuM1EzNzIuMSA2NjQuMCAzNjkuOCA2NjQuMFEzNjcuNCA2NjQuMCAzNjMuOCA2NjMuMlEzNjAuMSA2NjIuNCAzNTUuMSA2NjIuMlEzNTAuMSA2NjIuMSAzNDguOSA2NjEuN1EzNDcuOCA2NjEuNCAzNDYuNiA2NTkuOFEzNDUuNSA2NTguMiAzNDUuMyA2NTAuMFEzNDUuMSA2NDEuOSAzNDUuOCA2MzguNlEzNDYuNCA2MzUuNCAzNDguMSA2MzMuNFEzNDkuOCA2MzEuNSAzNTAuOCA2MzEuMlEzNTEuOCA2MzAuOCAzNzUuMyA2MzEuMFEzOTguNyA2MzEuMiA0MDIuNiA2MzAuOFE0MDYuNCA2MzAuNSA0MDguNyA2MjkuNVE0MTEuMSA2MjguNiA0MTQuMiA2MjYuM1E0MTcuNCA2MjQuMCA0MTkuNyA2MjAuOVE0MjIuMSA2MTcuOCA0MjIuNiA2MTYuN1E0MjMuMSA2MTUuNiA0MjMuMSA2MTQuNlE0MjMuMSA2MTMuNiA0MjIuMSA2MTIuMlE0MjEuMSA2MTAuNyA0MTguNCA2MDkuOVE0MTUuNyA2MDkuMSAzODMuOSA2MDguM1EzNTIuMSA2MDcuNCAzNTAuOSA2MDcuMVEzNDkuOCA2MDYuOCAzNDguOCA2MDUuM1EzNDcuOCA2MDMuOSAzNDkuNCA1OTQuMVEzNTEuMSA1ODQuNCAzNTAuOSA1ODEuOVEzNTAuOCA1NzkuNSAzNTAuMSA1NzYuN1EzNDkuNCA1NzQuMCAzNDguNCA1NzIuNVEzNDcuNCA1NzEuMCAzNDUuNSA1NzAuMVEzNDMuNSA1NjkuMSAzNDEuMCA1NjguOVEzMzguNSA1NjguOCAzMzYuNiA1NjkuMVEzMzQuOCA1NjkuNCAzMzMuMCA1NzAuMlEzMzEuMSA1NzEuMCAzMjguNSA1NzQuMVEzMjUuOCA1NzcuMiAzMjQuMCA1ODIuMlEzMjIuMSA1ODcuMyAzMjEuNiA1OTIuNVEzMjEuMSA1OTcuNyAzMjAuNSA1OTkuOFEzMTkuOCA2MDEuOSAzMTkuNiA2MDMuOVEzMTkuNSA2MDUuOCAzMTguNiA2MDcuMFEzMTcuOCA2MDguMSAzMTQuNiA2MDguNlEzMTEuNSA2MDkuMSAyOTYuNSA2MDkuMlEyODEuNSA2MDkuNCAyNzkuOCA2MTAuMFEyNzguMiA2MTAuNyAyNzQuOCA2MTEuMFEyNzEuNSA2MTEuMyAyNjguNyA2MTIuM1EyNjUuOCA2MTMuMyAyNjIuMyA2MTUuMlEyNTguOCA2MTcuMiAyNTcuNCA2MTkuMVEyNTUuOSA2MjEuMSAyNTUuNCA2MjIuNlEyNTQuOSA2MjQuMCAyNTQuOSA2MjUuNVEyNTQuOSA2MjYuOSAyNTYuMiA2MjkuNFEyNTcuNSA2MzEuOCAyNTguNyA2MzIuOFEyNTkuOCA2MzMuOCAyNjEuMCA2MzQuMVEyNjIuMiA2MzQuNCAyNjUuMyA2MzQuNFEyNjguNSA2MzQuNCAyNzEuMiA2MzMuNFEyNzMuOCA2MzIuNSAyNzcuMiA2MzIuMFEyODAuNSA2MzEuNSAyODcuMCA2MzEuM1EyOTMuNSA2MzEuMiAzMDIuMSA2MzIuMFEzMTAuOCA2MzIuOCAzMTQuMSA2MzMuOFEzMTcuNSA2MzQuNyAzMTguNiA2MzYuMlEzMTkuOCA2MzcuNyAzMjAuMyA2NDAuOVEzMjAuOCA2NDQuMiAzMjAuOCA2NDYuOVEzMjAuOCA2NDkuNyAzMjAuMSA2NTIuM1EzMTkuNSA2NTQuOSAzMTkuNSA2NTYuN1EzMTkuNSA2NTguNSAzMTkuMCA2NTkuOFEzMTguNSA2NjEuMSAzMTcuMSA2NjIuMVEzMTUuOCA2NjMuMCAzMTAuMyA2NjMuMlEzMDQuOCA2NjMuNCAyOTguOCA2NjQuMlEyOTIuOCA2NjUuMCAyODcuMCA2NjUuM1EyODEuMiA2NjUuNiAyNzkuMCA2NjYuNFEyNzYuOCA2NjcuMyAyNjguMyA2NjguN1EyNTkuOCA2NzAuMiAyNTcuOSA2NzEuMFEyNTUuOSA2NzEuOCAyNTIuNyA2NzIuNVEyNDkuNSA2NzMuMSAyNDYuNSA2NzQuNlEyNDMuNSA2NzYuMCAyMzkuNCA2NzcuM1EyMzUuMiA2NzguNiAyMzMuMiA2NzkuNlEyMzEuMiA2ODAuNiAyMjcuNyA2ODMuN1EyMjQuMiA2ODYuOCAyMjMuNSA2ODguMlEyMjIuOSA2ODkuNyAyMjIuOSA2OTEuM1pNNjQwLjEgNTY3LjBRNjM2LjYgNTY4LjEgNjM0LjQgNTcwLjVRNjMyLjIgNTczLjAgNjMyLjEgNTc1LjdRNjMxLjkgNTc4LjUgNjMzLjEgNTgyLjRRNjM0LjIgNTg2LjMgNjM4LjQgNTkzLjZRNjQyLjYgNjAwLjkgNjQzLjEgNjAzLjFRNjQzLjYgNjA1LjIgNjQzLjIgNjA1LjhRNjQyLjkgNjA2LjUgNjQxLjkgNjA3LjFRNjQwLjkgNjA3LjggNjM1LjQgNjA4LjlRNjI5LjkgNjEwLjAgNjI4LjEgNjEwLjBRNjI2LjIgNjEwLjAgNjIyLjYgNjA5LjJRNjE4LjkgNjA4LjQgNjE1LjkgNjA4LjZRNjEyLjkgNjA4LjcgNjEwLjkgNjA5LjZRNjA4LjkgNjEwLjQgNjA2LjQgNjEyLjVRNjAzLjkgNjE0LjYgNjAyLjkgNjE3LjhRNjAxLjkgNjIxLjEgNjAyLjQgNjI2LjVRNjAyLjkgNjMxLjggNjAzLjYgNjMzLjhRNjA0LjMgNjM1LjcgNjA0LjggNjQyLjJRNjA1LjMgNjQ4LjcgNjA0LjYgNjU2LjJRNjAzLjkgNjYzLjcgNjAyLjYgNjY2LjZRNjAxLjMgNjY5LjUgNTk4LjkgNjcyLjZRNTk2LjYgNjc1LjcgNTkyLjggNjc4LjhRNTg4LjkgNjgxLjkgNTg2LjEgNjgzLjJRNTgzLjMgNjg0LjUgNTgwLjggNjg2LjRRNTc4LjMgNjg4LjQgNTc3LjEgNjkxLjNRNTc1LjkgNjk0LjIgNTc1LjkgNjk0LjlRNTc1LjkgNjk1LjUgNTc2LjkgNjk3LjVRNTc3LjkgNjk5LjQgNTc5LjggNzAwLjZRNTgxLjYgNzAxLjcgNTg0LjEgNzAyLjVRNTg2LjYgNzAzLjMgNTkxLjggNzAyLjdRNTk2LjkgNzAyLjAgNjAwLjEgNzAwLjdRNjAzLjMgNjk5LjQgNjA0LjEgNjk4LjZRNjA0LjkgNjk3LjggNjA3LjMgNjk2LjVRNjA5LjYgNjk1LjIgNjE0LjYgNjkwLjNRNjE5LjYgNjg1LjUgNjIxLjkgNjgxLjJRNjI0LjIgNjc3LjAgNjI2LjkgNjcwLjVRNjI5LjYgNjY0LjAgNjMyLjkgNjYxLjdRNjM2LjIgNjU5LjUgNjM4LjYgNjU5LjFRNjQwLjkgNjU4LjggNjQyLjEgNjU5LjlRNjQzLjIgNjYxLjEgNjQzLjkgNjYyLjdRNjQ0LjYgNjY0LjMgNjQ0LjYgNjY2LjRRNjQ0LjYgNjY4LjYgNjQzLjkgNjcxLjhRNjQzLjIgNjc1LjEgNjQxLjcgNjc3LjhRNjQwLjIgNjgwLjYgNjM3LjEgNjgzLjhRNjMzLjkgNjg3LjEgNjI5LjQgNjg5LjJRNjI0LjkgNjkxLjMgNjIzLjcgNjkzLjFRNjIyLjYgNjk0LjkgNjIyLjYgNjk1LjlRNjIyLjYgNjk2LjggNjIzLjEgNjk3LjhRNjIzLjYgNjk4LjggNjI1LjcgNzAwLjRRNjI3LjkgNzAyLjAgNjI5LjEgNzAyLjRRNjMwLjIgNzAyLjcgNjM1LjYgNzAyLjVRNjQwLjkgNzAyLjQgNjQ1LjkgNjk5LjRRNjUwLjkgNjk2LjUgNjU0LjcgNjkyLjZRNjU4LjUgNjg4LjcgNjYwLjIgNjg1LjNRNjYxLjkgNjgxLjkgNjYyLjcgNjc4LjVRNjYzLjUgNjc1LjEgNjYzLjUgNjcyLjBRNjYzLjUgNjY4LjkgNjY0LjIgNjY0LjVRNjY0LjkgNjYwLjEgNjY2LjIgNjU4LjVRNjY3LjUgNjU2LjkgNjY5LjIgNjU2LjdRNjcwLjkgNjU2LjUgNjcxLjcgNjU3LjJRNjcyLjUgNjU3LjggNjc1LjIgNjYxLjRRNjc3LjkgNjY1LjAgNjgxLjIgNjcwLjVRNjg0LjUgNjc2LjAgNjg0LjcgNjc3LjdRNjg0LjkgNjc5LjMgNjg0LjIgNjgwLjlRNjgzLjUgNjgyLjUgNjgxLjkgNjg0LjZRNjgwLjIgNjg2LjggNjc4LjUgNjkwLjdRNjc2LjkgNjk0LjYgNjc1LjcgNjk1LjlRNjc0LjUgNjk3LjIgNjczLjIgNzAwLjRRNjcxLjkgNzAzLjcgNjcwLjIgNzA2LjFRNjY4LjUgNzA4LjUgNjY4LjIgNzEwLjdRNjY3LjkgNzEyLjggNjY4LjcgNzE0LjFRNjY5LjUgNzE1LjQgNjcwLjQgNzE1LjdRNjcxLjIgNzE2LjAgNjcyLjkgNzE2LjBRNjc0LjUgNzE2LjAgNjc3LjAgNzE1LjBRNjc5LjUgNzE0LjEgNjgwLjIgNzEzLjRRNjgwLjkgNzEyLjggNjgxLjkgNzEwLjdRNjgyLjkgNzA4LjUgNjg1LjIgNzA2LjRRNjg3LjUgNzA0LjMgNjg5LjQgNzAxLjlRNjkxLjIgNjk5LjQgNjkyLjQgNjk4LjNRNjkzLjUgNjk3LjIgNjk1LjIgNjk3LjBRNjk2LjkgNjk2LjggNjk4LjcgNjk4LjVRNzAwLjUgNzAwLjEgNzA4LjAgNzEwLjNRNzE1LjUgNzIwLjYgNzE5LjMgNzI0LjNRNzIzLjIgNzI4LjAgNzI0LjcgNzI5LjBRNzI2LjIgNzMwLjAgNzMwLjMgNzMwLjhRNzM0LjUgNzMxLjYgNzM4LjAgNzMxLjZRNzQxLjUgNzMxLjYgNzQ3LjAgNzMwLjhRNzUyLjUgNzMwLjAgNzU4LjUgNzI2LjdRNzY0LjUgNzIzLjUgNzY4LjYgNzE5LjRRNzcyLjggNzE1LjQgNzc0LjMgNzEyLjlRNzc1LjggNzEwLjUgNzc1LjggNzA4LjdRNzc1LjggNzA2LjkgNzc0LjMgNzA2LjZRNzcyLjggNzA2LjMgNzY5LjEgNzA2LjRRNzY1LjUgNzA2LjYgNzYyLjggNzA2LjNRNzYwLjEgNzA1LjkgNzU3LjUgNzA1LjFRNzU0LjggNzA0LjMgNzUyLjEgNzAzLjBRNzQ5LjUgNzAxLjcgNzQ1LjEgNjk4LjVRNzQwLjggNjk1LjIgNzMyLjggNjg2LjhRNzI0LjggNjc4LjMgNzIwLjAgNjcyLjNRNzE1LjIgNjY2LjMgNzE1LjMgNjY0LjVRNzE1LjUgNjYyLjcgNzE4LjUgNjU5LjZRNzIxLjUgNjU2LjUgNzI0LjMgNjUyLjNRNzI3LjIgNjQ4LjEgNzI3LjMgNjQ2LjRRNzI3LjUgNjQ0LjggNzI2LjggNjQzLjJRNzI2LjIgNjQxLjYgNzI1LjIgNjQxLjFRNzI0LjIgNjQwLjYgNzIyLjIgNjQwLjhRNzIwLjIgNjQwLjkgNzEzLjggNjQ0LjhRNzA3LjUgNjQ4LjcgNzA1LjcgNjQ5LjJRNzAzLjggNjQ5LjcgNjk5LjcgNjQ2LjBRNjk1LjUgNjQyLjIgNjkzLjUgNjM5LjZRNjkxLjUgNjM3LjAgNjkwLjUgNjM1LjFRNjg5LjUgNjMzLjEgNjg5LjUgNjMxLjJRNjg5LjUgNjI5LjIgNjkwLjkgNjI4LjJRNjkyLjIgNjI3LjMgNjk1LjIgNjI3LjZRNjk4LjIgNjI3LjkgNzA2LjcgNjI5LjdRNzE1LjIgNjMxLjUgNzIwLjcgNjMxLjJRNzI2LjIgNjMwLjggNzI5LjAgNjI5LjJRNzMxLjggNjI3LjYgNzM0LjggNjI0LjNRNzM3LjggNjIxLjEgNzM4LjMgNjE5LjFRNzM4LjggNjE3LjIgNzM4LjggNjE2LjJRNzM4LjggNjE1LjIgNzM4LjMgNjE0LjFRNzM3LjggNjEzLjAgNzM2LjUgNjEyLjJRNzM1LjIgNjExLjMgNzMzLjggNjExLjBRNzMyLjUgNjEwLjcgNzIzLjcgNjEwLjdRNzE0LjggNjEwLjcgNzEyLjIgNjA5LjlRNzA5LjUgNjA5LjEgNzAzLjcgNjA4LjFRNjk3LjkgNjA3LjEgNjg4LjAgNjA3LjBRNjc4LjIgNjA2LjggNjc3LjIgNjA2LjVRNjc2LjIgNjA2LjEgNjc1LjAgNjA0LjRRNjczLjkgNjAyLjYgNjczLjAgNTk4LjNRNjcyLjIgNTk0LjEgNjcxLjUgNTkyLjhRNjcwLjkgNTkxLjUgNjcwLjUgNTg5LjJRNjcwLjIgNTg3LjAgNjY5LjAgNTgzLjdRNjY3LjkgNTgwLjUgNjY0LjQgNTc2LjJRNjYwLjkgNTcyLjAgNjU3LjIgNTY5LjZRNjUzLjYgNTY3LjEgNjUxLjkgNTY2LjZRNjUwLjIgNTY2LjIgNjQ2LjkgNTY2LjBRNjQzLjYgNTY1LjggNjQwLjEgNTY3LjBaTTYyOS4yIDYzNS4xUTYyOC45IDYzMi41IDYyOS40IDYzMS41UTYyOS45IDYzMC41IDYzMS4xIDYyOS43UTYzMi4yIDYyOC45IDY0Mi4yIDYyOC45UTY1Mi4yIDYyOC45IDY1NC4wIDYyOS41UTY1NS45IDYzMC4yIDY1Ny4wIDYzMS4zUTY1OC4yIDYzMi41IDY1OC43IDYzMy40UTY1OS4yIDYzNC40IDY1OS4yIDYzNS4yUTY1OS4yIDYzNi4wIDY1Ny40IDYzNy4yUTY1NS41IDYzOC4zIDY0Ny45IDYzOS4zUTY0MC4yIDY0MC4zIDYzNy4xIDY0MC4zUTYzMy45IDY0MC4zIDYzMi43IDYzOS45UTYzMS42IDYzOS42IDYzMC42IDYzOC42UTYyOS42IDYzNy43IDYyOS4yIDYzNS4xWiIgZmlsbD0iIzVlMDIwMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMyA2KSIvPjxwYXRoIGQ9Ik03MDEuNSA1ODIuOVE3MDAuOCA1ODQuMCA3MDAuOCA1ODUuN1E3MDAuOCA1ODcuMyA3MDEuNyA1ODkuMlE3MDIuNSA1OTEuMiA3MDQuNSA1OTIuOFE3MDYuNSA1OTQuNCA3MDkuNyA1OTUuNFE3MTIuOCA1OTYuNCA3MTUuMyA1OTYuMlE3MTcuOCA1OTYuMSA3MjIuMiA1OTMuOFE3MjYuNSA1OTEuNSA3MjguMiA1ODkuNlE3MjkuOCA1ODcuNiA3MjkuNyA1ODYuNlE3MjkuNSA1ODUuNyA3MjcuNyA1ODQuN1E3MjUuOCA1ODMuNyA3MjMuNSA1ODMuMVE3MjEuMiA1ODIuNCA3MTguOCA1ODIuMlE3MTYuNSA1ODIuMSA3MTMuMCA1ODAuOFE3MDkuNSA1NzkuNSA3MDcuNyA1NzkuNVE3MDUuOCA1NzkuNSA3MDQuMCA1ODAuNlE3MDIuMiA1ODEuOCA3MDEuNSA1ODIuOVpNNTY1LjAgNTgwLjhRNTYzLjYgNTc5LjggNTYyLjYgNTc5LjVRNTYxLjYgNTc5LjIgNTU5LjAgNTc5LjJRNTU2LjMgNTc5LjIgNTU1LjAgNTc5LjZRNTUzLjYgNTgwLjEgNTUyLjEgNTgxLjZRNTUwLjYgNTgzLjEgNTQ4LjUgNTg4LjFRNTQ2LjMgNTkzLjEgNTQ2LjAgNTk1LjFRNTQ1LjYgNTk3LjAgNTQ0LjEgNjAxLjRRNTQyLjYgNjA1LjggNTQyLjMgNjA4LjRRNTQyLjAgNjExLjAgNTQxLjEgNjEyLjJRNTQwLjMgNjEzLjMgNTM1LjEgNjE0LjZRNTMwLjAgNjE1LjkgNTI1LjYgNjE2LjJRNTIxLjMgNjE2LjUgNTE4LjcgNjE3LjJRNTE2LjAgNjE3LjggNTE0LjAgNjE4LjhRNTEyLjAgNjE5LjggNTExLjMgNjIwLjlRNTEwLjcgNjIyLjEgNTEwLjcgNjI0LjhRNTEwLjcgNjI3LjYgNTExLjMgNjI4LjlRNTEyLjAgNjMwLjIgNTEzLjIgNjMxLjJRNTE0LjMgNjMyLjEgNTE4LjcgNjMzLjFRNTIzLjAgNjM0LjEgNTMwLjUgNjM0LjFRNTM4LjAgNjM0LjEgNTM5LjUgNjM1LjFRNTQxLjAgNjM2LjAgNTQxLjMgNjM3LjJRNTQxLjYgNjM4LjMgNTQxLjggNjQzLjJRNTQyLjAgNjQ4LjEgNTQxLjUgNjQ5LjlRNTQxLjAgNjUxLjcgNTQwLjAgNjUyLjZRNTM5LjAgNjUzLjYgNTM0LjEgNjU0LjdRNTI5LjMgNjU1LjkgNTI0LjUgNjU4LjJRNTE5LjcgNjYwLjQgNTE3LjIgNjYyLjJRNTE0LjcgNjY0LjAgNTEzLjggNjY1LjNRNTEzLjAgNjY2LjYgNTEyLjIgNjY5LjdRNTExLjMgNjcyLjggNTExLjUgNjc0LjZRNTExLjcgNjc2LjQgNTEyLjggNjc5LjBRNTE0LjAgNjgxLjYgNTE2LjMgNjgzLjJRNTE4LjcgNjg0LjggNTIxLjUgNjg1LjBRNTI0LjMgNjg1LjEgNTI2LjAgNjg0LjZRNTI3LjYgNjg0LjIgNTMwLjMgNjgyLjRRNTMzLjAgNjgwLjYgNTM1LjAgNjc5LjZRNTM3LjAgNjc4LjYgNTM4LjEgNjc4LjVRNTM5LjMgNjc4LjMgNTQzLjEgNjc2LjJRNTQ3LjAgNjc0LjEgNTUxLjAgNjczLjZRNTU1LjAgNjczLjEgNTU3LjMgNjcyLjNRNTU5LjYgNjcxLjUgNTY3LjYgNjcxLjBRNTc1LjYgNjcwLjUgNTc5LjEgNjY5LjVRNTgyLjYgNjY4LjYgNTg1LjggNjY2LjZRNTg4LjkgNjY0LjcgNTkwLjMgNjYyLjdRNTkxLjYgNjYwLjggNTkyLjMgNjU5LjBRNTkyLjkgNjU3LjIgNTkyLjkgNjU2LjBRNTkyLjkgNjU0LjkgNTkxLjggNjUzLjBRNTkwLjYgNjUxLjAgNTg4LjggNjUwLjRRNTg2LjkgNjQ5LjcgNTgwLjQgNjQ5LjVRNTczLjkgNjQ5LjQgNTcyLjggNjQ4LjRRNTcxLjYgNjQ3LjQgNTcwLjkgNjQ1LjNRNTcwLjMgNjQzLjIgNTY5LjkgNjM4LjZRNTY5LjYgNjM0LjEgNTcwLjggNjMzLjBRNTcxLjkgNjMxLjggNTc2LjkgNjMxLjJRNTgxLjkgNjMwLjUgNTg1LjEgNjI5LjJRNTg4LjMgNjI3LjkgNTg5LjMgNjI3LjFRNTkwLjMgNjI2LjMgNTkxLjYgNjI0LjNRNTkyLjkgNjIyLjQgNTkzLjMgNjIxLjFRNTkzLjYgNjE5LjggNTkzLjQgNjE4LjNRNTkzLjMgNjE2LjkgNTkyLjQgNjE1LjdRNTkxLjYgNjE0LjYgNTg5LjQgNjEzLjZRNTg3LjMgNjEyLjYgNTg0LjMgNjEyLjJRNTgxLjMgNjExLjcgNTc2LjggNjExLjhRNTcyLjMgNjEyLjAgNTcxLjMgNjExLjNRNTcwLjMgNjEwLjcgNTY5LjkgNjA4LjlRNTY5LjYgNjA3LjEgNTcwLjQgNjAyLjJRNTcxLjMgNTk3LjQgNTcxLjEgNTkzLjlRNTcwLjkgNTkwLjUgNTY5LjkgNTg3LjlRNTY4LjkgNTg1LjMgNTY3LjYgNTgzLjVRNTY2LjMgNTgxLjggNTY1LjAgNTgwLjhaTTIyMi45IDY5MS4zUTIyMi45IDY5Mi45IDIyMy41IDY5NC43UTIyNC4yIDY5Ni41IDIyNi41IDY5OS4xUTIyOC45IDcwMS43IDIzMS40IDcwMi45UTIzMy45IDcwNC4wIDIzNS41IDcwNC4wUTIzNy4yIDcwNC4wIDI0MS45IDcwMy4zUTI0Ni41IDcwMi43IDI1Mi45IDcwMC43UTI1OS4yIDY5OC44IDI2MS44IDY5OC42UTI2NC41IDY5OC41IDI2OC43IDY5Ny41UTI3Mi44IDY5Ni41IDI3Ni4wIDY5Ni4yUTI3OS4yIDY5NS45IDI4Ny4wIDY5NC4xUTI5NC44IDY5Mi4zIDMwNy44IDY5MS4wUTMyMC44IDY4OS43IDMyMi4zIDY4OS4yUTMyMy44IDY4OC43IDMzOC4zIDY4OC43UTM1Mi44IDY4OC43IDM2MC4zIDY5MC4wUTM2Ny44IDY5MS4zIDM2OS44IDY5Mi4wUTM3MS44IDY5Mi42IDM3Ni4xIDY5NC45UTM4MC40IDY5Ny4yIDM4Mi4xIDY5OC4zUTM4My44IDY5OS40IDM4NS4zIDcwMS4xUTM4Ni44IDcwMi43IDM4OS42IDcwNC4zUTM5Mi40IDcwNS45IDM5OS45IDcwOS4yUTQwNy40IDcxMi40IDQxMS4yIDcxMi45UTQxNS4xIDcxMy40IDQxOS43IDcxMy40UTQyNC40IDcxMy40IDQyOC42IDcxMi42UTQzMi43IDcxMS44IDQzNC40IDcxMS4wUTQzNi4wIDcxMC4yIDQzOC45IDcwOS41UTQ0MS43IDcwOC45IDQ0NS4wIDcwNy40UTQ0OC40IDcwNS45IDQ1MS40IDcwNC4wUTQ1NC40IDcwMi4wIDQ2Mi40IDY5NC42UTQ3MC40IDY4Ny4xIDQ3Mi4yIDY4NC4zUTQ3NC4wIDY4MS42IDQ3NC4yIDY3OS4zUTQ3NC40IDY3Ny4wIDQ3My40IDY3Ni40UTQ3Mi40IDY3NS43IDQ1OC43IDY3Ni4yUTQ0NS4wIDY3Ni43IDQzOC4yIDY3Ni4wUTQzMS40IDY3NS40IDQyOS4xIDY3NC42UTQyNi43IDY3My44IDQxNy45IDY3Mi4zUTQwOS4xIDY3MC44IDQwNy42IDY3MC4yUTQwNi4xIDY2OS41IDQwMy40IDY2OS4yUTQwMC43IDY2OC45IDM5Ni42IDY2Ny43UTM5Mi40IDY2Ni42IDM4Mi4zIDY2NS4zUTM3Mi4xIDY2NC4wIDM2OS44IDY2NC4wUTM2Ny40IDY2NC4wIDM2My44IDY2My4yUTM2MC4xIDY2Mi40IDM1NS4xIDY2Mi4yUTM1MC4xIDY2Mi4xIDM0OC45IDY2MS43UTM0Ny44IDY2MS40IDM0Ni42IDY1OS44UTM0NS41IDY1OC4yIDM0NS4zIDY1MC4wUTM0NS4xIDY0MS45IDM0NS44IDYzOC42UTM0Ni40IDYzNS40IDM0OC4xIDYzMy40UTM0OS44IDYzMS41IDM1MC44IDYzMS4yUTM1MS44IDYzMC44IDM3NS4zIDYzMS4wUTM5OC43IDYzMS4yIDQwMi42IDYzMC44UTQwNi40IDYzMC41IDQwOC43IDYyOS41UTQxMS4xIDYyOC42IDQxNC4yIDYyNi4zUTQxNy40IDYyNC4wIDQxOS43IDYyMC45UTQyMi4xIDYxNy44IDQyMi42IDYxNi43UTQyMy4xIDYxNS42IDQyMy4xIDYxNC42UTQyMy4xIDYxMy42IDQyMi4xIDYxMi4yUTQyMS4xIDYxMC43IDQxOC40IDYwOS45UTQxNS43IDYwOS4xIDM4My45IDYwOC4zUTM1Mi4xIDYwNy40IDM1MC45IDYwNy4xUTM0OS44IDYwNi44IDM0OC44IDYwNS4zUTM0Ny44IDYwMy45IDM0OS40IDU5NC4xUTM1MS4xIDU4NC40IDM1MC45IDU4MS45UTM1MC44IDU3OS41IDM1MC4xIDU3Ni43UTM0OS40IDU3NC4wIDM0OC40IDU3Mi41UTM0Ny40IDU3MS4wIDM0NS41IDU3MC4xUTM0My41IDU2OS4xIDM0MS4wIDU2OC45UTMzOC41IDU2OC44IDMzNi42IDU2OS4xUTMzNC44IDU2OS40IDMzMy4wIDU3MC4yUTMzMS4xIDU3MS4wIDMyOC41IDU3NC4xUTMyNS44IDU3Ny4yIDMyNC4wIDU4Mi4yUTMyMi4xIDU4Ny4zIDMyMS42IDU5Mi41UTMyMS4xIDU5Ny43IDMyMC41IDU5OS44UTMxOS44IDYwMS45IDMxOS42IDYwMy45UTMxOS41IDYwNS44IDMxOC42IDYwNy4wUTMxNy44IDYwOC4xIDMxNC42IDYwOC42UTMxMS41IDYwOS4xIDI5Ni41IDYwOS4yUTI4MS41IDYwOS40IDI3OS44IDYxMC4wUTI3OC4yIDYxMC43IDI3NC44IDYxMS4wUTI3MS41IDYxMS4zIDI2OC43IDYxMi4zUTI2NS44IDYxMy4zIDI2Mi4zIDYxNS4yUTI1OC44IDYxNy4yIDI1Ny40IDYxOS4xUTI1NS45IDYyMS4xIDI1NS40IDYyMi42UTI1NC45IDYyNC4wIDI1NC45IDYyNS41UTI1NC45IDYyNi45IDI1Ni4yIDYyOS40UTI1Ny41IDYzMS44IDI1OC43IDYzMi44UTI1OS44IDYzMy44IDI2MS4wIDYzNC4xUTI2Mi4yIDYzNC40IDI2NS4zIDYzNC40UTI2OC41IDYzNC40IDI3MS4yIDYzMy40UTI3My44IDYzMi41IDI3Ny4yIDYzMi4wUTI4MC41IDYzMS41IDI4Ny4wIDYzMS4zUTI5My41IDYzMS4yIDMwMi4xIDYzMi4wUTMxMC44IDYzMi44IDMxNC4xIDYzMy44UTMxNy41IDYzNC43IDMxOC42IDYzNi4yUTMxOS44IDYzNy43IDMyMC4zIDY0MC45UTMyMC44IDY0NC4yIDMyMC44IDY0Ni45UTMyMC44IDY0OS43IDMyMC4xIDY1Mi4zUTMxOS41IDY1NC45IDMxOS41IDY1Ni43UTMxOS41IDY1OC41IDMxOS4wIDY1OS44UTMxOC41IDY2MS4xIDMxNy4xIDY2Mi4xUTMxNS44IDY2My4wIDMxMC4zIDY2My4yUTMwNC44IDY2My40IDI5OC44IDY2NC4yUTI5Mi44IDY2NS4wIDI4Ny4wIDY2NS4zUTI4MS4yIDY2NS42IDI3OS4wIDY2Ni40UTI3Ni44IDY2Ny4zIDI2OC4zIDY2OC43UTI1OS44IDY3MC4yIDI1Ny45IDY3MS4wUTI1NS45IDY3MS44IDI1Mi43IDY3Mi41UTI0OS41IDY3My4xIDI0Ni41IDY3NC42UTI0My41IDY3Ni4wIDIzOS40IDY3Ny4zUTIzNS4yIDY3OC42IDIzMy4yIDY3OS42UTIzMS4yIDY4MC42IDIyNy43IDY4My43UTIyNC4yIDY4Ni44IDIyMy41IDY4OC4yUTIyMi45IDY4OS43IDIyMi45IDY5MS4zWk02NDAuMSA1NjcuMFE2MzYuNiA1NjguMSA2MzQuNCA1NzAuNVE2MzIuMiA1NzMuMCA2MzIuMSA1NzUuN1E2MzEuOSA1NzguNSA2MzMuMSA1ODIuNFE2MzQuMiA1ODYuMyA2MzguNCA1OTMuNlE2NDIuNiA2MDAuOSA2NDMuMSA2MDMuMVE2NDMuNiA2MDUuMiA2NDMuMiA2MDUuOFE2NDIuOSA2MDYuNSA2NDEuOSA2MDcuMVE2NDAuOSA2MDcuOCA2MzUuNCA2MDguOVE2MjkuOSA2MTAuMCA2MjguMSA2MTAuMFE2MjYuMiA2MTAuMCA2MjIuNiA2MDkuMlE2MTguOSA2MDguNCA2MTUuOSA2MDguNlE2MTIuOSA2MDguNyA2MTAuOSA2MDkuNlE2MDguOSA2MTAuNCA2MDYuNCA2MTIuNVE2MDMuOSA2MTQuNiA2MDIuOSA2MTcuOFE2MDEuOSA2MjEuMSA2MDIuNCA2MjYuNVE2MDIuOSA2MzEuOCA2MDMuNiA2MzMuOFE2MDQuMyA2MzUuNyA2MDQuOCA2NDIuMlE2MDUuMyA2NDguNyA2MDQuNiA2NTYuMlE2MDMuOSA2NjMuNyA2MDIuNiA2NjYuNlE2MDEuMyA2NjkuNSA1OTguOSA2NzIuNlE1OTYuNiA2NzUuNyA1OTIuOCA2NzguOFE1ODguOSA2ODEuOSA1ODYuMSA2ODMuMlE1ODMuMyA2ODQuNSA1ODAuOCA2ODYuNFE1NzguMyA2ODguNCA1NzcuMSA2OTEuM1E1NzUuOSA2OTQuMiA1NzUuOSA2OTQuOVE1NzUuOSA2OTUuNSA1NzYuOSA2OTcuNVE1NzcuOSA2OTkuNCA1NzkuOCA3MDAuNlE1ODEuNiA3MDEuNyA1ODQuMSA3MDIuNVE1ODYuNiA3MDMuMyA1OTEuOCA3MDIuN1E1OTYuOSA3MDIuMCA2MDAuMSA3MDAuN1E2MDMuMyA2OTkuNCA2MDQuMSA2OTguNlE2MDQuOSA2OTcuOCA2MDcuMyA2OTYuNVE2MDkuNiA2OTUuMiA2MTQuNiA2OTAuM1E2MTkuNiA2ODUuNSA2MjEuOSA2ODEuMlE2MjQuMiA2NzcuMCA2MjYuOSA2NzAuNVE2MjkuNiA2NjQuMCA2MzIuOSA2NjEuN1E2MzYuMiA2NTkuNSA2MzguNiA2NTkuMVE2NDAuOSA2NTguOCA2NDIuMSA2NTkuOVE2NDMuMiA2NjEuMSA2NDMuOSA2NjIuN1E2NDQuNiA2NjQuMyA2NDQuNiA2NjYuNFE2NDQuNiA2NjguNiA2NDMuOSA2NzEuOFE2NDMuMiA2NzUuMSA2NDEuNyA2NzcuOFE2NDAuMiA2ODAuNiA2MzcuMSA2ODMuOFE2MzMuOSA2ODcuMSA2MjkuNCA2ODkuMlE2MjQuOSA2OTEuMyA2MjMuNyA2OTMuMVE2MjIuNiA2OTQuOSA2MjIuNiA2OTUuOVE2MjIuNiA2OTYuOCA2MjMuMSA2OTcuOFE2MjMuNiA2OTguOCA2MjUuNyA3MDAuNFE2MjcuOSA3MDIuMCA2MjkuMSA3MDIuNFE2MzAuMiA3MDIuNyA2MzUuNiA3MDIuNVE2NDAuOSA3MDIuNCA2NDUuOSA2OTkuNFE2NTAuOSA2OTYuNSA2NTQuNyA2OTIuNlE2NTguNSA2ODguNyA2NjAuMiA2ODUuM1E2NjEuOSA2ODEuOSA2NjIuNyA2NzguNVE2NjMuNSA2NzUuMSA2NjMuNSA2NzIuMFE2NjMuNSA2NjguOSA2NjQuMiA2NjQuNVE2NjQuOSA2NjAuMSA2NjYuMiA2NTguNVE2NjcuNSA2NTYuOSA2NjkuMiA2NTYuN1E2NzAuOSA2NTYuNSA2NzEuNyA2NTcuMlE2NzIuNSA2NTcuOCA2NzUuMiA2NjEuNFE2NzcuOSA2NjUuMCA2ODEuMiA2NzAuNVE2ODQuNSA2NzYuMCA2ODQuNyA2NzcuN1E2ODQuOSA2NzkuMyA2ODQuMiA2ODAuOVE2ODMuNSA2ODIuNSA2ODEuOSA2ODQuNlE2ODAuMiA2ODYuOCA2NzguNSA2OTAuN1E2NzYuOSA2OTQuNiA2NzUuNyA2OTUuOVE2NzQuNSA2OTcuMiA2NzMuMiA3MDAuNFE2NzEuOSA3MDMuNyA2NzAuMiA3MDYuMVE2NjguNSA3MDguNSA2NjguMiA3MTAuN1E2NjcuOSA3MTIuOCA2NjguNyA3MTQuMVE2NjkuNSA3MTUuNCA2NzAuNCA3MTUuN1E2NzEuMiA3MTYuMCA2NzIuOSA3MTYuMFE2NzQuNSA3MTYuMCA2NzcuMCA3MTUuMFE2NzkuNSA3MTQuMSA2ODAuMiA3MTMuNFE2ODAuOSA3MTIuOCA2ODEuOSA3MTAuN1E2ODIuOSA3MDguNSA2ODUuMiA3MDYuNFE2ODcuNSA3MDQuMyA2ODkuNCA3MDEuOVE2OTEuMiA2OTkuNCA2OTIuNCA2OTguM1E2OTMuNSA2OTcuMiA2OTUuMiA2OTcuMFE2OTYuOSA2OTYuOCA2OTguNyA2OTguNVE3MDAuNSA3MDAuMSA3MDguMCA3MTAuM1E3MTUuNSA3MjAuNiA3MTkuMyA3MjQuM1E3MjMuMiA3MjguMCA3MjQuNyA3MjkuMFE3MjYuMiA3MzAuMCA3MzAuMyA3MzAuOFE3MzQuNSA3MzEuNiA3MzguMCA3MzEuNlE3NDEuNSA3MzEuNiA3NDcuMCA3MzAuOFE3NTIuNSA3MzAuMCA3NTguNSA3MjYuN1E3NjQuNSA3MjMuNSA3NjguNiA3MTkuNFE3NzIuOCA3MTUuNCA3NzQuMyA3MTIuOVE3NzUuOCA3MTAuNSA3NzUuOCA3MDguN1E3NzUuOCA3MDYuOSA3NzQuMyA3MDYuNlE3NzIuOCA3MDYuMyA3NjkuMSA3MDYuNFE3NjUuNSA3MDYuNiA3NjIuOCA3MDYuM1E3NjAuMSA3MDUuOSA3NTcuNSA3MDUuMVE3NTQuOCA3MDQuMyA3NTIuMSA3MDMuMFE3NDkuNSA3MDEuNyA3NDUuMSA2OTguNVE3NDAuOCA2OTUuMiA3MzIuOCA2ODYuOFE3MjQuOCA2NzguMyA3MjAuMCA2NzIuM1E3MTUuMiA2NjYuMyA3MTUuMyA2NjQuNVE3MTUuNSA2NjIuNyA3MTguNSA2NTkuNlE3MjEuNSA2NTYuNSA3MjQuMyA2NTIuM1E3MjcuMiA2NDguMSA3MjcuMyA2NDYuNFE3MjcuNSA2NDQuOCA3MjYuOCA2NDMuMlE3MjYuMiA2NDEuNiA3MjUuMiA2NDEuMVE3MjQuMiA2NDAuNiA3MjIuMiA2NDAuOFE3MjAuMiA2NDAuOSA3MTMuOCA2NDQuOFE3MDcuNSA2NDguNyA3MDUuNyA2NDkuMlE3MDMuOCA2NDkuNyA2OTkuNyA2NDYuMFE2OTUuNSA2NDIuMiA2OTMuNSA2MzkuNlE2OTEuNSA2MzcuMCA2OTAuNSA2MzUuMVE2ODkuNSA2MzMuMSA2ODkuNSA2MzEuMlE2ODkuNSA2MjkuMiA2OTAuOSA2MjguMlE2OTIuMiA2MjcuMyA2OTUuMiA2MjcuNlE2OTguMiA2MjcuOSA3MDYuNyA2MjkuN1E3MTUuMiA2MzEuNSA3MjAuNyA2MzEuMlE3MjYuMiA2MzAuOCA3MjkuMCA2MjkuMlE3MzEuOCA2MjcuNiA3MzQuOCA2MjQuM1E3MzcuOCA2MjEuMSA3MzguMyA2MTkuMVE3MzguOCA2MTcuMiA3MzguOCA2MTYuMlE3MzguOCA2MTUuMiA3MzguMyA2MTQuMVE3MzcuOCA2MTMuMCA3MzYuNSA2MTIuMlE3MzUuMiA2MTEuMyA3MzMuOCA2MTEuMFE3MzIuNSA2MTAuNyA3MjMuNyA2MTAuN1E3MTQuOCA2MTAuNyA3MTIuMiA2MDkuOVE3MDkuNSA2MDkuMSA3MDMuNyA2MDguMVE2OTcuOSA2MDcuMSA2ODguMCA2MDcuMFE2NzguMiA2MDYuOCA2NzcuMiA2MDYuNVE2NzYuMiA2MDYuMSA2NzUuMCA2MDQuNFE2NzMuOSA2MDIuNiA2NzMuMCA1OTguM1E2NzIuMiA1OTQuMSA2NzEuNSA1OTIuOFE2NzAuOSA1OTEuNSA2NzAuNSA1ODkuMlE2NzAuMiA1ODcuMCA2NjkuMCA1ODMuN1E2NjcuOSA1ODAuNSA2NjQuNCA1NzYuMlE2NjAuOSA1NzIuMCA2NTcuMiA1NjkuNlE2NTMuNiA1NjcuMSA2NTEuOSA1NjYuNlE2NTAuMiA1NjYuMiA2NDYuOSA1NjYuMFE2NDMuNiA1NjUuOCA2NDAuMSA1NjcuMFpNNjI5LjIgNjM1LjFRNjI4LjkgNjMyLjUgNjI5LjQgNjMxLjVRNjI5LjkgNjMwLjUgNjMxLjEgNjI5LjdRNjMyLjIgNjI4LjkgNjQyLjIgNjI4LjlRNjUyLjIgNjI4LjkgNjU0LjAgNjI5LjVRNjU1LjkgNjMwLjIgNjU3LjAgNjMxLjNRNjU4LjIgNjMyLjUgNjU4LjcgNjMzLjRRNjU5LjIgNjM0LjQgNjU5LjIgNjM1LjJRNjU5LjIgNjM2LjAgNjU3LjQgNjM3LjJRNjU1LjUgNjM4LjMgNjQ3LjkgNjM5LjNRNjQwLjIgNjQwLjMgNjM3LjEgNjQwLjNRNjMzLjkgNjQwLjMgNjMyLjcgNjM5LjlRNjMxLjYgNjM5LjYgNjMwLjYgNjM4LjZRNjI5LjYgNjM3LjcgNjI5LjIgNjM1LjFaIiBmaWxsPSJ1cmwoI3JkKSIvPjwvZz4KPGcgZmlsdGVyPSJ1cmwoI3VwKSI+PHBhdGggZD0iTTY0NC4yIDc1OS45UTY0My45IDc1OS42IDY0Mi40IDc1OS43UTY0MC45IDc1OS45IDYzNy4yIDc2MS4yUTYzMy42IDc2Mi41IDYzMC4yIDc2Mi44UTYyNi45IDc2My4yIDYyMi4xIDc2NC44UTYxNy4yIDc2Ni40IDYxMy4yIDc2Ni45UTYwOS4zIDc2Ny40IDYwNi45IDc2OC4yUTYwNC42IDc2OS4wIDYwNC44IDc2OS44UTYwNC45IDc3MC42IDYwOS4zIDc3MC41UTYxMy42IDc3MC4zIDYxNS45IDc3MS40UTYxOC4yIDc3Mi42IDYxOS4yIDc3NC43UTYyMC4yIDc3Ni44IDYyMC4xIDc3OS40UTYxOS45IDc4Mi4wIDYxOC4yIDc4Ni40UTYxNi42IDc5MC44IDYxNi40IDc5Mi40UTYxNi4yIDc5NC4wIDYxNC42IDc5OC44UTYxMi45IDgwMy41IDYxMi42IDgwNS43UTYxMi4yIDgwOC4wIDYxMS4yIDgxMC4xUTYxMC4yIDgxMi4yIDYwOS40IDgxNi4zUTYwOC42IDgyMC40IDYwNy4xIDgyNC4xUTYwNS42IDgyNy44IDYwNS4xIDgzMC44UTYwNC42IDgzMy43IDYwMy42IDgzNi4wUTYwMi42IDgzOC4yIDYwMi40IDg0MC4wUTYwMi4zIDg0MS44IDYwMC42IDg0Ni4xUTU5OC45IDg1MC4zIDU5OC42IDg1MS45UTU5OC4zIDg1My41IDU5Ny4zIDg1NS4wUTU5Ni4zIDg1Ni41IDU5My44IDg1OC42UTU5MS4zIDg2MC43IDU4OS40IDg2MS4yUTU4Ny42IDg2MS43IDU4NC4zIDg2MS43UTU4MC45IDg2MS43IDU4MC42IDg2MS44UTU4MC4zIDg2Mi4wIDU4MC40IDg2Mi44UTU4MC42IDg2My42IDYwNS44IDg2My40UTYzMC45IDg2My4zIDYzMC45IDg2Mi41UTYzMC45IDg2MS43IDYyNy45IDg2MS43UTYyNC45IDg2MS43IDYyMi42IDg2MC44UTYyMC4yIDg2MC4wIDYxOS4yIDg1OC42UTYxOC4yIDg1Ny4xIDYxNy45IDg1NC43UTYxNy42IDg1Mi4yIDYxOC4xIDg1MC45UTYxOC42IDg0OS42IDYxOS4xIDg0Ni40UTYxOS42IDg0My4xIDYyMC42IDg0MS4yUTYyMS42IDgzOS4yIDYyMi40IDgzNS4zUTYyMy4yIDgzMS40IDYyNC40IDgyOC41UTYyNS42IDgyNS42IDYyNi4xIDgyMi44UTYyNi42IDgyMC4wIDYyOC4xIDgxNi4zUTYyOS42IDgxMi42IDYyOS43IDgxMC42UTYyOS45IDgwOC43IDYzMS42IDgwNC40UTYzMy4yIDgwMC4yIDYzMy40IDc5OC4zUTYzMy42IDc5Ni4zIDYzNS4yIDc5MS45UTYzNi45IDc4Ny41IDYzNy42IDc4NC4zUTYzOC4yIDc4MS4wIDYzOS42IDc3Ny44UTY0MC45IDc3NC41IDY0MS4xIDc3Mi40UTY0MS4yIDc3MC4zIDY0Mi45IDc2Ni40UTY0NC42IDc2Mi41IDY0NC42IDc2MS40UTY0NC42IDc2MC4yIDY0NC4yIDc1OS45Wk01NjMuNiA3NjYuMVE1NjAuMCA3NjMuMiA1NTUuOCA3NjEuNVE1NTEuNiA3NTkuOSA1NDYuMyA3NTkuOVE1NDEuMCA3NTkuOSA1MzUuNiA3NjIuMFE1MzAuMyA3NjQuMSA1MjYuMyA3NjcuNVE1MjIuMyA3NzEuMCA1MjAuOCA3NzMuMlE1MTkuMyA3NzUuNSA1MTcuOCA3NzguOFE1MTYuMyA3ODIuMCA1MTYuMyA3ODMuMFE1MTYuMyA3ODQuMCA1MTcuNSA3ODMuNlE1MTguNyA3ODMuMyA1MjEuOCA3NzkuOVE1MjUuMCA3NzYuNSA1MjcuMyA3NzUuNVE1MjkuNiA3NzQuNSA1MzEuOCA3NzQuMFE1MzQuMCA3NzMuNiA1MzYuMSA3NzMuNlE1MzguMyA3NzMuNiA1NDIuMCA3NzQuN1E1NDUuNiA3NzUuOCA1NDguMCA3NzguMVE1NTAuMyA3ODAuNCA1NTAuOCA3ODEuNVE1NTEuMyA3ODIuNyA1NTEuNiA3ODQuM1E1NTIuMCA3ODUuOSA1NTIuMCA3OTAuMVE1NTIuMCA3OTQuNCA1NTEuNiA3OTcuMVE1NTEuMyA3OTkuOSA1NDkuMCA4MDQuNlE1NDYuNiA4MDkuMyA1NDUuNSA4MTAuNVE1NDQuMyA4MTEuNiA1NDMuNSA4MTMuMlE1NDIuNiA4MTQuOCA1NDEuMSA4MTYuM1E1MzkuNiA4MTcuOCA1MzguMyA4MTkuOVE1MzcuMCA4MjIuMCA1MjUuMyA4MzQuMFE1MTMuNyA4NDYuMSA1MDUuMiA4NTMuOVE0OTYuNyA4NjEuNyA0OTYuOCA4NjIuNlE0OTcuMCA4NjMuNiA1MjQuMCA4NjMuNlE1NTEuMCA4NjMuNiA1NTEuNiA4NjMuMFE1NTIuMyA4NjIuMyA1NTMuMSA4NjAuNVE1NTQuMCA4NTguNyA1NTQuMSA4NTcuNFE1NTQuMyA4NTYuMSA1NTUuOCA4NTMuN1E1NTcuMyA4NTEuMyA1NTkuMCA4NDYuMlE1NjAuNiA4NDEuMiA1NjEuNSA4NDAuMFE1NjIuMyA4MzguOSA1NjIuMyA4MzguMVE1NjIuMyA4MzcuMyA1NjEuNSA4MzcuM1E1NjAuNiA4MzcuMyA1NTguMSA4NDAuNVE1NTUuNiA4NDMuOCA1NTIuMyA4NDUuNFE1NDkuMCA4NDcuMCA1NDUuNSA4NDcuNFE1NDIuMCA4NDcuNyA1MzEuNiA4NDcuN1E1MjEuMyA4NDcuNyA1MjAuNyA4NDcuMlE1MjAuMCA4NDYuNyA1MjAuMCA4NDYuMVE1MjAuMCA4NDUuNCA1MzQuMCA4MzMuNFE1NDguMCA4MjEuMyA1NTMuNSA4MTUuN1E1NTkuMCA4MTAuMCA1NjEuMSA4MDcuNFE1NjMuMyA4MDQuOCA1NjQuMCA4MDMuM1E1NjQuNiA4MDEuOCA1NjUuOCA4MDAuN1E1NjYuOSA3OTkuNiA1NjcuOSA3OTYuNVE1NjguOSA3OTMuNCA1NzAuMSA3OTEuMVE1NzEuMyA3ODguOCA1NzEuNiA3ODcuMlE1NzEuOSA3ODUuNiA1NzEuOSA3ODIuM1E1NzEuOSA3NzkuMSA1NzEuNiA3NzcuOFE1NzEuMyA3NzYuNSA1NjkuMyA3NzIuN1E1NjcuMyA3NjkuMCA1NjMuNiA3NjYuMVpNNDA1LjIgNzYwLjdRNDA1LjEgNzU5LjYgNDAzLjYgNzU5LjdRNDAyLjEgNzU5LjkgMzk4LjYgNzYxLjJRMzk1LjEgNzYyLjUgMzkwLjkgNzYzLjBRMzg2LjggNzYzLjUgMzgzLjMgNzY0LjhRMzc5LjggNzY2LjEgMzc2LjggNzY2LjRRMzczLjggNzY2LjcgMzY5LjggNzY3LjlRMzY1LjggNzY5LjAgMzY1LjggNzY5LjdRMzY1LjggNzcwLjMgMzcwLjMgNzcwLjNRMzc0LjggNzcwLjMgMzc2LjMgNzcwLjhRMzc3LjggNzcxLjMgMzc4LjkgNzcyLjFRMzgwLjEgNzcyLjkgMzgwLjYgNzc1LjBRMzgxLjEgNzc3LjEgMzgwLjYgNzgxLjVRMzgwLjEgNzg1LjkgMzc4LjQgNzkwLjFRMzc2LjggNzk0LjQgMzc2LjYgNzk2LjJRMzc2LjQgNzk3LjkgMzc0LjggODAyLjVRMzczLjEgODA3LjAgMzcyLjkgODA4LjhRMzcyLjggODEwLjYgMzcyLjMgODExLjNRMzcxLjggODExLjkgMzcxLjYgODEzLjJRMzcxLjQgODE0LjUgMzcwLjQgODE3LjBRMzY5LjQgODE5LjQgMzY5LjEgODIxLjhRMzY4LjggODI0LjMgMzY3LjEgODI4LjVRMzY1LjQgODMyLjcgMzY1LjEgODM1LjJRMzY0LjggODM3LjYgMzYzLjYgODQwLjBRMzYyLjQgODQyLjUgMzYxLjggODQ1LjlRMzYxLjEgODQ5LjMgMzU5LjkgODUxLjRRMzU4LjggODUzLjUgMzU4LjQgODU0LjhRMzU4LjEgODU2LjEgMzU1LjQgODU4LjRRMzUyLjggODYwLjcgMzUwLjggODYxLjJRMzQ4LjggODYxLjcgMzQ1LjEgODYxLjdRMzQxLjUgODYxLjcgMzQxLjEgODYxLjhRMzQwLjggODYyLjAgMzQxLjAgODYyLjhRMzQxLjEgODYzLjYgMzY1LjkgODYzLjhRMzkwLjcgODYzLjkgMzkxLjYgODYzLjZRMzkyLjQgODYzLjMgMzkyLjQgODYyLjVRMzkyLjQgODYxLjcgMzg4LjMgODYxLjVRMzg0LjEgODYxLjMgMzgxLjkgODU5LjVRMzc5LjggODU3LjggMzc5LjQgODU3LjFRMzc5LjEgODU2LjUgMzc5LjEgODUzLjBRMzc5LjEgODQ5LjYgMzgwLjYgODQ1LjdRMzgyLjEgODQxLjggMzgyLjQgODM5LjJRMzgyLjggODM2LjYgMzg0LjEgODMzLjVRMzg1LjQgODMwLjQgMzg2LjggODI0LjlRMzg4LjEgODE5LjQgMzg4LjkgODE3LjhRMzg5LjggODE2LjEgMzg5LjkgODE0LjJRMzkwLjEgODEyLjIgMzkxLjcgODA3LjlRMzkzLjQgODAzLjUgMzkzLjcgODAxLjBRMzk0LjEgNzk4LjYgMzk0LjcgNzk3LjVRMzk1LjQgNzk2LjMgMzk2LjQgNzkzLjJRMzk3LjQgNzkwLjEgMzk3LjYgNzg4LjVRMzk3LjcgNzg2LjkgMzk5LjIgNzgzLjNRNDAwLjcgNzc5LjcgNDAxLjIgNzc2LjVRNDAxLjcgNzczLjIgNDAyLjkgNzcwLjZRNDA0LjEgNzY4LjAgNDA0LjIgNzY1LjlRNDA0LjQgNzYzLjggNDA0LjkgNzYyLjhRNDA1LjQgNzYxLjkgNDA1LjIgNzYwLjdaTTQ3OS4zIDc2MS45UTQ3NS43IDc1OS45IDQ3My4wIDc1OS40UTQ3MC40IDc1OC45IDQ2NS41IDc1OS4xUTQ2MC43IDc1OS4zIDQ1NS4yIDc2MS40UTQ0OS43IDc2My41IDQ0NS45IDc2Ni45UTQ0Mi4wIDc3MC4zIDQ0MS43IDc3MS4xUTQ0MS40IDc3MS45IDQ0MC4wIDc3My4yUTQzOC43IDc3NC41IDQzNi43IDc3Ny45UTQzNC43IDc4MS40IDQzMi43IDc4Ny40UTQzMC43IDc5My40IDQzMC43IDgwMC45UTQzMC43IDgwOC4zIDQzMi45IDgxMy4yUTQzNS4wIDgxOC4xIDQzNy4wIDgyMC4wUTQzOS4wIDgyMi4wIDQ0Mi4yIDgyMy42UTQ0NS40IDgyNS4yIDQ1MS4wIDgyNS4yUTQ1Ni43IDgyNS4yIDQ1OS40IDgyNC40UTQ2Mi4wIDgyMy42IDQ2Mi41IDgyNC4xUTQ2My4wIDgyNC42IDQ2My4wIDgyNS40UTQ2My4wIDgyNi4yIDQ2Mi4yIDgyNy4yUTQ2MS40IDgyOC4yIDQ2MC41IDgzMC4zUTQ1OS43IDgzMi40IDQ1OC40IDgzNC4yUTQ1Ny4wIDgzNi4wIDQ1Ni40IDgzNy40UTQ1NS43IDgzOC45IDQ1MS4yIDg0NC40UTQ0Ni43IDg1MC4wIDQ0MS45IDg1My45UTQzNy4wIDg1Ny44IDQzNS45IDg1OC4xUTQzNC43IDg1OC40IDQzNC4wIDg1OS4xUTQzMy40IDg1OS43IDQzMS40IDg2MC43UTQyOS40IDg2MS43IDQyOC42IDg2MS43UTQyNy43IDg2MS43IDQyNi4xIDg2Mi41UTQyNC40IDg2My4zIDQyNC4yIDg2NC4zUTQyNC4xIDg2NS4yIDQyOS45IDg2NC42UTQzNS43IDg2My45IDQ0MS4wIDg2Mi4wUTQ0Ni40IDg2MC4wIDQ0OS41IDg1OC40UTQ1Mi43IDg1Ni44IDQ1Ny45IDg1My40UTQ2My4wIDg1MC4wIDQ2Ny43IDg0NS42UTQ3Mi40IDg0MS4yIDQ3NC43IDgzOC40UTQ3Ny4wIDgzNS42IDQ3Ny40IDgzNC44UTQ3Ny43IDgzNC4wIDQ3OS4wIDgzMi43UTQ4MC4zIDgzMS40IDQ4NC4wIDgyNC44UTQ4Ny43IDgxOC4xIDQ4OC4yIDgxNi4wUTQ4OC43IDgxMy45IDQ4OS43IDgxMi4xUTQ5MC43IDgxMC4zIDQ5Mi4wIDgwMy4wUTQ5My4zIDc5NS43IDQ5My4zIDc5MC4xUTQ5My4zIDc4NC42IDQ5Mi4yIDc3OS40UTQ5MS4wIDc3NC4yIDQ4OS4zIDc3MS4zUTQ4Ny43IDc2OC40IDQ4NS4zIDc2Ni4xUTQ4My4wIDc2My44IDQ3OS4zIDc2MS45Wk00NjYuMiA3NjIuN1E0NjguMCA3NjIuMiA0NzAuNCA3NjMuMlE0NzIuNyA3NjQuMSA0NzQuMCA3NjUuNlE0NzUuNCA3NjcuMSA0NzYuMiA3NjguN1E0NzcuMCA3NzAuMyA0NzcuMiA3NzMuOVE0NzcuNCA3NzcuNSA0NzYuNyA3ODEuN1E0NzYuMCA3ODUuOSA0NzUuMiA3ODguNVE0NzQuNCA3OTEuMSA0NzQuMiA3OTMuNFE0NzQuMCA3OTUuNyA0NzIuNyA3OTguNlE0NzEuNCA4MDEuNSA0NzAuOSA4MDQuNlE0NzAuNCA4MDcuNyA0NjkuMiA4MTAuMFE0NjguMCA4MTIuMiA0NjcuOSA4MTMuN1E0NjcuNyA4MTUuMiA0NjcuMCA4MTYuNlE0NjYuNCA4MTguMSA0NjUuMCA4MTguN1E0NjMuNyA4MTkuNCA0NTkuOSA4MTkuNFE0NTYuMCA4MTkuNCA0NTUuMCA4MTguOVE0NTQuMCA4MTguNCA0NTIuOSA4MTcuM1E0NTEuNyA4MTYuMSA0NTAuNCA4MTMuNFE0NDkuMCA4MTAuNiA0NDguOSA4MDcuMFE0NDguNyA4MDMuNSA0NTAuMCA3OTUuNVE0NTEuNCA3ODcuNSA0NTMuMiA3ODIuN1E0NTUuMCA3NzcuOCA0NTUuNCA3NzYuMFE0NTUuNyA3NzQuMiA0NTcuNCA3NzEuMVE0NTkuMCA3NjguMCA0NjEuNyA3NjUuNlE0NjQuNCA3NjMuMiA0NjYuMiA3NjIuN1oiIGZpbGw9InVybCgjYmspIi8+PC9nPgo8Y2lyY2xlIGN4PSI1MDAiIGN5PSI1MDAiIHI9IjQ0MC4wIiBmaWxsPSJ1cmwoI2RvbWUpIi8+CjxwYXRoIGQ9Ik0xMjAgNDIwIEEzOTAgMzkwIDAgMCAxIDg4MCA0MjAgUTUwMCAzMDAgMTIwIDQyMFoiIGZpbGw9InVybCgjZ2xvc3MpIiBvcGFjaXR5PSIuNTUiLz4KPC9nPgo8Y2lyY2xlIGN4PSI1MDAiIGN5PSI1MDAiIHI9IjQ0MC4wIiBmaWxsPSJub25lIiBzdHJva2U9IiMwYjI0MTMiIHN0cm9rZS13aWR0aD0iNSIvPgo8Y2lyY2xlIGN4PSI1MDAiIGN5PSI1MDAiIHI9IjQ3MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjU1IiBzdHJva2Utd2lkdGg9IjMiLz4KPC9zdmc+";
/* EMBLEM-END */
