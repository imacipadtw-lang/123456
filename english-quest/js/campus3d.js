/* =====================================================================
   The school from the air — 土城國小's campus as a 3D model that turns through 360° (TC.Campus)
   ---------------------------------------------------------------------
   Original work, modelled in code for this project after the real layout of the school: the red
   running track and its field, the long classroom block with the coloured stair towers, the main
   building with the round corner and the car park, the footbridge over the road at the gate, the hall
   with the solar roof, the big old trees — and round the school the rice paddies, the banana grove,
   the greenhouses, the town houses and the mountains.  Everything is built from simple solids in a
   bright toy style.  No third-party model, texture, photograph or library: it is drawn with the
   project's own small WebGL renderer (TC.O3.kit — js/ollie3d.js must be loaded first), and the only
   picture on it is the school's own emblem.

     const c = TC.Campus.mount(hostElement, { spin: true, speed: 9, drag: true, flags: true, gate: 0, zoom: 1, tilt: 34, dim: 0, yaw: 30, label: "…" });
       spin / speed   turns by itself, degrees per second (never with prefers-reduced-motion)
       drag           a finger or the mouse turns it        flags   the six gate flags are shown
       gate           1–6: this gate's flag is big and bounces, the others are small
       zoom, tilt     size, and the height angle of the camera in degrees        dim   0–1 darkens it (behind text)
     c.ok · c.el (the canvas) · c.destroy() · c.pause(on) · c.setGate(n) · c.onFrame(fn) (fn(c) after every drawn frame)
     c.yaw (degrees, get / set) · c.nodes (draw calls)
     c.project(n) → { x, y, visible }: where flag n is now, in CSS pixels of the host (for HTML labels)
     surprise       true: a tap on the model (not a drag) plays a surprise — the school's English (ABC blocks spell TUCHENG,
                    turn round to ENGLISH), the school's AI (a drone scans the campus and names what it finds in English),
                    rain and a rainbow, a relay race, a hot-air balloon, the school bell with dancing flags, Ollie flying past —
                    a different one on every tap (the teacher, 2026-11-24; English and AI replaced the fireworks and the
                    gold medal on 2026-11-26).  c.surprise(name) plays one by name.
     TC.Campus.supported() → boolean;  without WebGL mount() draws nothing and returns { ok: false, … }
   ===================================================================== */
(function () {
  "use strict";
  const TC = (window.TC = window.TC || {});
  const R0 = 11; // radius of the round base
  const TX = 0.2, TZ = -0.3, TA = 24, TL = 1.5, TR = 1.7, TI = 1.0; // the track: centre, angle, half straight, outer and inner radius
  const GATE = ["#ff9a2e", "#4cc9ff", "#2ee6b6", "#9b6bff", "#ff5fa2", "#ffc83d"];
  let model = null; // built once, shared by every mount

  /** the track's outline at radius r, in the track's own frame (x across, z along) */
  const outline = (r) => { const o = []; for (let h = 0; h < 2; h++) for (let i = 0; i <= 24; i++) { const a = (h + i / 24) * Math.PI; o.push([r * Math.cos(a), (h ? -TL : TL) + r * Math.sin(a)]); } o.push(o[0]); return o; };
  /** a point on a lap at radius r (u = 0 … 1, anticlockwise from above) → [x, z, heading in degrees] */
  const lap = (u, r) => { const c = Math.PI * r, T = 4 * TL + 2 * c; let s = (1 - (((u % 1) + 1) % 1)) * T;
    if (s < 2 * TL) return [r, -TL + s, 180]; s -= 2 * TL;
    if (s < c) return [r * Math.cos(s / r), TL + r * Math.sin(s / r), 180 - (s / r) * 57.3]; s -= c;
    if (s < 2 * TL) return [-r, TL - s, 0]; s -= 2 * TL;
    return [-r * Math.cos(s / r), -TL - r * Math.sin(s / r), -(s / r) * 57.3]; };

  /* ================= the model: meshes and pictures ================= */
  function make(K) {
    const { MESH, build, m4, mMul, mTRS, paint, RAD, TAU } = K, Z = [0, 0, 0], BOX = MESH.box, QUAD = MESH.quad;
    let seed = 20261;
    const rnd = (lo = 0, hi = 1) => { seed = (seed * 16807) % 2147483647; return lo + ((hi - lo) * seed) / 2147483647; }; // always the same campus

    /* Many solids, one draw call: every solid is baked into a big mesh, and its colour is a swatch of one small
       palette picture (the texture coordinates of all its corners point at that swatch).  "none" = the node's own colour. */
    const swatch = new Map();
    const pal = (c) => { let i = swatch.get(c); if (i === undefined) swatch.set(c, (i = swatch.size)); return [((i % 16) + 0.5) / 16, ((i >> 4) + 0.5) / 16]; };
    function Batch() {
      const P = [], N = [], U = [], I = [], M = m4(), L = m4(), F = m4(); let fx = 0, fz = 0, fr = 0;
      const b = {
        /** what follows is placed in a frame of its own: origin (x, z) on the ground, turned ry degrees */
        at(x, z, ry) { fx = x || 0; fz = z || 0; fr = ry || 0; mTRS(F, [fx, 0, fz], [0, fr, 0], [1, 1, 1]); return b; },
        /** frame → world: [x, z, ry] */
        w(x, z) { const c = Math.cos(fr * RAD), s = Math.sin(fr * RAD); return [fx + x * c + z * s, fz - x * s + z * c, fr]; },
        put(mesh, p, r, s, c) {
          mTRS(L, p, r, s); mMul(M, F, L); const uv = c ? pal(c) : null, b0 = P.length / 3, mp = mesh.P, mn = mesh.N, mu = mesh.U; // no colour: the mesh keeps its own (a prefab made with another Batch)
          for (let i = 0; i < mp.length; i += 3) {
            const x = mp[i], y = mp[i + 1], z = mp[i + 2], nx = mn[i] / (s[0] * s[0]), ny = mn[i + 1] / (s[1] * s[1]), nz = mn[i + 2] / (s[2] * s[2]);
            P.push(M[0] * x + M[4] * y + M[8] * z + M[12], M[1] * x + M[5] * y + M[9] * z + M[13], M[2] * x + M[6] * y + M[10] * z + M[14]);
            const a = M[0] * nx + M[4] * ny + M[8] * nz, e = M[1] * nx + M[5] * ny + M[9] * nz, f = M[2] * nx + M[6] * ny + M[10] * nz, l = Math.hypot(a, e, f) || 1;
            N.push(a / l, e / l, f / l); uv ? U.push(uv[0], uv[1]) : U.push(mu[(i / 3) * 2], mu[(i / 3) * 2 + 1]);
          }
          for (let i = 0; i < mesh.I.length; i++) I.push(b0 + mesh.I[i]);
          return b;
        },
        /** a flat patch on the ground: corners [x, z] in order */
        flat(pts, y, c) { const uv = pal(c), b0 = P.length / 3; pts.forEach((q) => { const p = b.w(q[0], q[1]); P.push(p[0], y, p[1]); N.push(0, 1, 0); U.push(uv[0], uv[1]); }); for (let i = 1; i < pts.length - 1; i++) I.push(b0, b0 + i, b0 + i + 1); return b; },
        mesh() { return { P: new Float32Array(P), N: new Float32Array(N), U: new Float32Array(U), I: new Uint16Array(I), n: P.length / 3 }; }
      };
      return b.at();
    }

    /* ---------- solids ---------- */
    /** a turned solid: profile [[radius, height], …] from the bottom up, B sides; smooth = round shading */
    const lathe = (prof, B, smooth) => build((P, N, U, I) => {
      const sn = prof.slice(0, -1).map((a, i) => { const b = prof[i + 1], dr = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dr, dy) || 1; return [dy / l, -dr / l]; });
      const ring = (q, n) => { for (let j = 0; j <= B; j++) { const a = (j / B) * TAU, c = Math.cos(a), s = Math.sin(a); P.push(q[0] * c, q[1], q[0] * s); N.push(n[0] * c, n[1], n[0] * s); U.push(0, 0); } };
      for (let i = 0; i < prof.length - 1; i++) { const b0 = P.length / 3;
        [i, i + 1].forEach((j) => { const a = sn[smooth ? Math.max(0, j - 1) : i], b = sn[smooth ? Math.min(sn.length - 1, j) : i]; ring(prof[j], [prof[j][0] ? a[0] + b[0] : 0, a[1] + b[1]]); });
        for (let j = 0; j < B; j++) { const a = b0 + j, b = a + B + 1; I.push(a, b, a + 1, a + 1, b, b + 1); } }
    });
    const round = (A) => { const o = []; for (let i = 0; i <= A; i++) o.push([Math.sin((i / A) * Math.PI), -Math.cos((i / A) * Math.PI)]); return o; };
    const BALL = lathe(round(6), 9, 1), BALLH = lathe(round(9), 14, 1), BUD = lathe(round(4), 6, 1), CAN = [[1, 0], [1, 1], [0, 1]];
    const CYL = lathe(CAN, 12), CYL6 = lathe(CAN, 6), CYLR = lathe(CAN, 30), CONE = lathe([[1, 0], [0, 1]], 30);
    const HILL = lathe([[1, 0], [0.76, 0.24], [0.52, 0.5], [0.31, 0.73], [0.13, 0.91], [0, 1]], 14, 1);
    const TUBE = lathe([[1, 0], [1, 1]], 72), PLATE = lathe([[0.9, 0], [1, 0.25], [1, 1], [0.9, 1]], 72);
    /** a roof over a 1 × 1 footprint, 1 high, ridge along z; f = how much of the length the ridge takes (1 gable, 0 pyramid); open = no gable walls */
    const roofs = {};
    const roofM = (f, open) => roofs[f + (open ? "o" : "")] || (roofs[f + (open ? "o" : "")] = build((P, N, U, I) => {
      const h = f / 2, face = (pts, n) => { const b0 = P.length / 3; pts.forEach((p) => { P.push(p[0], p[1], p[2]); N.push(n[0], n[1], n[2]); U.push(0, 0); }); for (let i = 1; i < pts.length - 1; i++) I.push(b0, b0 + i, b0 + i + 1); };
      [1, -1].forEach((s) => { face([[s * 0.5, 0, -0.5], [s * 0.5, 0, 0.5], [0, 1, h], [0, 1, -h]], [s * 0.894, 0.447, 0]); if (!open) face([[-0.5, 0, s * 0.5], [0.5, 0, s * 0.5], [0, 1, s * h]], [0, 0.5 - h, s]); });
    }));
    /** a tunnel: half an ellipse 1 wide and 1 high, 1 long (along z) */
    const ARCH = build((P, N, U, I) => { const n = 8;
      for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI, c = Math.cos(a), s = Math.sin(a); [-0.5, 0.5].forEach((z) => { P.push(c / 2, s, z); N.push(2 * c, s, 0); U.push(0, 0); }); }
      for (let i = 0; i < n; i++) { const a = i * 2; I.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); }
      [-0.5, 0.5].forEach((z) => { const b0 = P.length / 3; for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI; P.push(Math.cos(a) / 2, Math.sin(a), z); N.push(0, 0, z * 2); U.push(0, 0); } for (let i = 1; i < n; i++) I.push(b0, b0 + i, b0 + i + 1); });
    });
    /** the running track: a flat band between the inner and the outer outline (the lane lines are its picture) */
    const TRACK = build((P, N, U, I) => { const a = outline(TI), b = outline(TR), n = a.length;
      for (let i = 0; i < n; i++) { P.push(a[i][0], 0, a[i][1], b[i][0], 0, b[i][1]); N.push(0, 1, 0, 0, 1, 0); U.push(i / (n - 1), 0, i / (n - 1), 1); }
      for (let i = 0; i < n - 1; i++) { const q = i * 2; I.push(q, q + 1, q + 2, q + 2, q + 1, q + 3); } });
    /** the top of the base: radius 1, the ground picture seen from straight above (north = −z at the top) */
    const GROUND = build((P, N, U, I) => { const B = 72; P.push(0, 0, 0); N.push(0, 1, 0); U.push(0.5, 0.5);
      for (let j = 0; j <= B; j++) { const a = (j / B) * TAU, c = Math.cos(a), s = Math.sin(a); P.push(c, 0, s); N.push(0, 1, 0); U.push(c / 2 + 0.5, s / 2 + 0.5); }
      for (let j = 0; j < B; j++) I.push(0, 1 + j, 2 + j); });

    /* ---------- colours and the tools to build with ---------- */
    const BR = "#cc5a41", GY = "#8894a6", GN = "#2fb37c", WH = "#f8f5ee", GL = "#c4eaff", DG = "#5aa0d8", AS = "#5d6573", YL = "#ffcf33", CO = "#cfd5dd", NV = "#22335c", RD = "#e2463f", BL = "#3d8bff";
    const GREEN = ["#3fa650", "#2f9549", "#52b55a", "#47ad4e"];
    const S = Batch(), V = Batch(); let B = S; // S: the school and the road · V: everything green and far
    const shade = [], foot = [], yards = [], paddies = [], big = []; // for the ground picture: tree shade, building shade, paving, rice fields · the big trees
    const box = (x, y, z, w, h, d, c, ry) => B.put(BOX, [x, y + h / 2, z], [0, ry || 0, 0], [w, h, d], c);
    const cyl = (x, y, z, r, h, c, m) => B.put(m || CYL, [x, y, z], Z, [r, h, r], c);
    const top = (x, y, z, w, h, d, c, f, ry, open) => B.put(roofM(f, open), [x, y, z], [0, ry || 0, 0], [w, h, d], c);
    const lay = (x, z, w, d, c, ry, y) => B.put(QUAD, [x, y || 0.04, z], [-90, ry || 0, 0], [w, d, 1], c);  // a mark painted on the ground
    const pane = (x, y, z, w, h, ry, c) => B.put(QUAD, [x, y, z], [0, ry, 0], [w, h, 1], c); // an upright window, facing ry
    const yard = (x, z, w, d, c, r) => { const p = B.w(x, z); yards.push([p[0], p[1], w, d, p[2], c || "#e9dfc8", r]); };
    /** a building: walls standing on the ground (with their soft shade) and rows of windows at the heights ys — nx along x, nz along z */
    const hall = (x, z, w, h, d, c, ys, nx, nz, g) => {
      box(x, 0, z, w, h, d, c); const p = B.w(x, z); foot.push([p[0], p[1], w, d, p[2]]);
      const ww = (n, len) => Math.min(0.26, (len / n) * 0.6);
      (ys || []).forEach((y) => {
        for (let i = 0; i < nx; i++) [1, -1].forEach((s) => pane(x - w / 2 + (w * (i + 0.5)) / nx, y, z + s * (d / 2 + 0.012), ww(nx, w), 0.2, s > 0 ? 0 : 180, g || GL));
        for (let i = 0; i < nz; i++) [1, -1].forEach((s) => pane(x + s * (w / 2 + 0.012), y, z - d / 2 + (d * (i + 0.5)) / nz, ww(nz, d), 0.2, s * 90, g || GL));
      });
    };
    /** the roof of a w × d building: green eave trim, then grey slopes — ridge along z, or along x when rx is set */
    const lid = (x, y, z, w, d, h, f, rx, c, trim) => { box(x, y, z, w + 0.38, 0.07, d + 0.38, trim || GN); rx ? top(x, y + 0.05, z, d + 0.3, h, w + 0.3, c || GY, f, 90) : top(x, y + 0.05, z, w + 0.3, h, d + 0.3, c || GY, f); };
    /** a roof on posts (walkway, bicycle shed, pavilion) */
    const shed = (x, z, w, d, y, c) => { box(x, y, z, w, 0.06, d, c); const lz = d > w, n = Math.max(2, Math.round((lz ? d : w) / 0.8) + 1);
      for (let i = 0; i < n; i++) [1, -1].forEach((s) => { const k = i / (n - 1) - 0.5; lz ? box(x + s * (w / 2 - 0.06), 0, z + k * (d - 0.12), 0.05, y, 0.05, WH) : box(x + k * (w - 0.12), 0, z + s * (d / 2 - 0.06), 0.05, y, 0.05, WH); }); };
    const tree = (x, z, r) => { const h = r * 1.1; shade.push([x, z, r * 1.25]);
      V.put(CYL6, [x, 0, z], Z, [r * 0.17, h + r * 0.3, r * 0.17], "#8a5a33").put(BALL, [x, h + r * 0.62, z], [0, rnd(0, 360), 0], [r, r * 0.86, r], GREEN[rnd(0, 4) | 0])
        .put(BALL, [x + rnd(-0.3, 0.3) * r, h + r * 1.1, z + rnd(-0.3, 0.3) * r], Z, [r * 0.62, r * 0.5, r * 0.62], "#74c860"); };
    const car = (x, z, c, ry) => { box(x, 0.04, z, 0.2, 0.1, 0.42, c, ry); box(x, 0.14, z, 0.17, 0.08, 0.22, "#dff3ff", ry); };

    /* ---------- the round base: a model board ---------- */
    B.put(TUBE, [0, -0.22, 0], Z, [R0, 0.22, R0], "#62b24e").put(TUBE, [0, -0.85, 0], Z, [R0, 0.63, R0], "#bd8a52").put(TUBE, [0, -0.62, 0], Z, [R0 + 0.02, 0.1, R0 + 0.02], "#a6753f")
      .put(PLATE, [0, -1.1, 0], Z, [R0 + 0.45, 0.25, R0 + 0.45], "#f7f3e9");

    /* ---------- the road along the west side, the footbridge and the school gate ---------- */
    const RX = -7.6, BZ = 3.2, zr = (x) => Math.sqrt(R0 * R0 - x * x) - 0.03;
    B.flat([[RX - 0.8, -zr(RX - 0.8)], [RX + 0.8, -zr(RX + 0.8)], [RX + 0.8, zr(RX + 0.8)], [RX - 0.8, zr(RX - 0.8)]], 0.02, AS);
    [-0.05, 0.05].forEach((o) => lay(RX + o, 0, 0.045, 2 * zr(RX) - 0.5, YL)); // the double yellow line
    [-0.7, 0.7].forEach((o) => lay(RX + o, 0, 0.04, 2 * zr(RX + o) - 0.4, "#ffffff")); // white edge lines
    for (let z = -7.1; z < 7.6; z += 0.9) if (Math.abs(z - 1.9) > 1 && Math.abs(z + 4.4) > 0.9) [-0.37, 0.37].forEach((o) => lay(RX + o, z, 0.04, 0.42, "#ffffff"));
    [[RX + 0.38, 1.9], [RX - 0.38, -4.4]].forEach((q) => { [[0, -0.3], [0, 0.3]].forEach((e) => lay(q[0] + e[0], q[1] + e[1], 0.62, 0.04, YL)); [-0.3, 0.3].forEach((e) => lay(q[0] + e, q[1], 0.04, 0.62, YL)); [45, -45].forEach((r) => lay(q[0], q[1], 0.04, 0.82, YL, r)); }); // yellow "keep clear" boxes
    box(RX, 0.9, BZ, 2.5, 0.1, 0.46, CO); [-0.23, 0.23].forEach((o) => box(RX, 1.0, BZ + o, 2.5, 0.16, 0.04, "#f3f5f8")); // the footbridge: deck and railings
    [-1.05, 1.05].forEach((o) => cyl(RX + o, 0, BZ, 0.09, 0.9, CO));
    B.put(BOX, [RX + 1.1, 0.475, BZ + 0.9], [34, 0, 0], [0.34, 0.08, 1.72], CO).put(BOX, [RX - 1.1, 0.475, BZ - 0.9], [-34, 0, 0], [0.34, 0.08, 1.72], CO); // its stairs
    [1, -1].forEach((s) => box(RX, 1.16, BZ + s * 0.27, 1.5, 0.38, 0.04, "#1f9d55")); // the green sign (the name on it is a picture, added in mount)
    [[-4.9, 0.75], [4.95, 8.2]].forEach((q) => box(-6.42, 0, (q[0] + q[1]) / 2, 0.07, 0.2, q[1] - q[0], WH)); // the school wall
    [0.85, 2.95].forEach((z) => { box(-6.42, 0, z, 0.2, 0.5, 0.2, BR); box(-6.42, 0.5, z, 0.27, 0.06, 0.27, WH); }); // … and the gate posts

    /* ---------- the main building: hipped roofs, the entrance with the emblem, the car park ---------- */
    B.at(-4.75, -1.2);
    hall(0, 0, 2.3, 1.15, 2.7, BR, [0.36, 0.84], 5, 6); box(0, 0, 0, 2.36, 0.12, 2.76, WH); lid(0, 1.15, 0, 2.3, 2.7, 0.7, 0.18);
    hall(0, 1.55, 1.2, 1.3, 0.5, BR); top(0, 1.3, 1.55, 1.2, 0.42, 0.5, BR, 1); top(0, 1.32, 1.125, 1.56, 0.56, 1.65, GY, 1, 0, 1); // the entrance and its gable
    pane(0, 0.27, 1.812, 0.44, 0.54, 0, "#3a2a22"); box(0, 0.6, 1.95, 0.9, 0.05, 0.3, WH);
    B.put(CYLR, [0, 2.46, 1.76], [90, 0, 0], [0.69, 0.08, 0.69], "#ffc83d"); // the rim of the emblem medal
    shed(1.5, 0, 0.5, 3.3, 0.52, GN); shed(-1.55, -0.4, 0.5, 2.2, 0.46, WH); // the green walkway and the white bicycle shed
    yard(0, 0.9, 3.6, 5.6);
    const medal = B.w(0, 1.8);
    B.at(-4.3, -3.75); B.flat([[-0.95, -0.55], [0.95, -0.55], [0.95, 0.55], [-0.95, 0.55]], 0.02, "#3fa37a"); B.flat([[-0.95, -0.2], [-0.5, -0.2], [-0.5, 0.2], [-0.95, 0.2]], 0.03, "#e0704c").flat([[0.5, -0.2], [0.95, -0.2], [0.95, 0.2], [0.5, 0.2]], 0.03, "#e0704c"); // the basketball court
    [-0.55, 0.55].forEach((z) => lay(0, z, 1.9, 0.035, "#ffffff")); [-0.95, 0, 0.95].forEach((x) => lay(x, 0, 0.035, 1.1, "#ffffff"));
    [-1, 1].forEach((s) => { box(s * 1.02, 0, 0, 0.04, 0.42, 0.04, WH); box(s * 0.97, 0.36, 0, 0.03, 0.2, 0.3, "#ffffff"); });
    B.at();
    B.flat([[-6.38, 0.9], [-3.6, 0.9], [-3.6, 3.0], [-6.38, 3.0]], 0.02, "#6c7482"); // the car park
    for (let i = 0; i < 6; i++) lay(-5.95 + i * 0.44, 2.6, 0.035, 0.64, "#ffffff");
    [["#ffffff", 0], [RD, 1], ["#4cc9ff", 3], ["#ffc83d", 4]].forEach((q) => car(-5.73 + q[1] * 0.44, 2.6, q[0]));
    /* the round corner by the gate, the south wing and the covered walk to the classrooms */
    cyl(-5.3, 0, 4.1, 0.92, 1.6, BR, CYLR); [0.5, 1.03].forEach((y) => cyl(-5.3, y, 4.1, 0.98, 0.09, WH, CYLR)); foot.push([-5.3, 4.1, 1.6, 1.6, 0]);
    cyl(-5.3, 1.6, 4.1, 1.06, 0.07, GN, CYLR); B.put(CONE, [-5.3, 1.66, 4.1], Z, [1.02, 0.5, 1.02], GY);
    for (let a = 0; a < 360; a += 30) [0.28, 0.8, 1.32].forEach((y) => pane(-5.3 + 0.935 * Math.sin(a * RAD), y, 4.1 + 0.935 * Math.cos(a * RAD), 0.22, 0.2, a, GL));
    B.at(-4.6, 6.4); hall(0, 0, 1.3, 1.15, 3.8, BR, [0.36, 0.84], 3, 8); box(0, 0, 0, 1.36, 0.12, 3.86, WH); lid(0, 1.15, 0, 1.3, 3.8, 0.6, 1);
    hall(1.4, 1.3, 1.5, 0.95, 1.3, BR, [0.5], 3, 3); lid(1.4, 0.95, 1.3, 1.5, 1.3, 0.5, 0); yard(0.4, 0.2, 3.6, 5);
    B.at(); shed(-1.4, 4.75, 5.2, 0.5, 0.5, GY); box(-1.4, 0.46, 4.75, 5.32, 0.04, 0.62, GN); yard(-1.2, 4.75, 5.8, 0.8);
    shed(1.65, 4.75, 0.9, 0.9, 0.55, GN); top(1.65, 0.6, 4.75, 1.05, 0.4, 1.05, GY, 0);

    /* ---------- the track's own frame: the classroom block with its coloured stair towers, the stand and the flag pole ---------- */
    B.at(TX, TZ, TA);
    const bx = 3.05, bz = -0.5, bl = 7.4;
    hall(bx, bz, 1.1, 1.0, bl, BR, [0.27, 0.77], 2, 17); box(bx, 0.5, bz, 1.16, 0.045, bl + 0.06, WH); lid(bx, 1.0, bz, 1.1, bl, 0.45, 1);
    [BL, GN, RD, "#ffc83d"].forEach((c, i) => { const z = bz - 3 + i * 2; box(bx - 0.8, 0, z, 0.5, 1.2, 0.62, c); box(bx - 0.8, 1.2, z, 0.58, 0.06, 0.7, WH); pane(bx - 1.062, 0.2, z, 0.24, 0.4, -90, NV); pane(bx - 1.062, 0.82, z, 0.26, 0.2, -90, GL); });
    yard(bx - 0.25, bz, 2.3, bl + 0.7);
    box(-2.4, 0, 0, 0.6, 0.2, 1.3, "#efe7d6"); shed(-2.4, 0, 0.72, 1.42, 0.74, RD); yard(-2.35, 0, 1.1, 1.9); // the stand by the track
    cyl(-2.95, 0, 0, 0.03, 2.0, "#eef2f6", CYL6); B.put(BUD, [-2.95, 2.03, 0], Z, [0.06, 0.06, 0.06], "#ffc83d"); // the flag pole
    const pole = B.w(-2.95, 0), cls = B.w(bx, bz);
    for (let z = -3.9; z < 3.3; z += 0.85) { const p = B.w(4.2, z); tree(p[0], p[1], 0.34); } // the row of trees behind the classrooms

    /* ---------- east of the classrooms: the hall with the solar roof and its neighbours ---------- */
    B.at(7.0, 2.5, -12);
    hall(0, 0, 3.0, 1.15, 2.1, "#eef2f6", [0.66], 6, 4, DG); box(0, 0, 0, 3.05, 0.26, 2.15, "#7fa6d9"); top(0, 1.15, 0, 2.4, 0.42, 3.3, "#aab4c2", 1, 90); yard(0, 0, 3.8, 2.9);
    [1, -1].forEach((s) => { const a = (s * Math.atan2(0.42, 1.2)) / RAD, put = (x, z, w, d, c, o) => B.put(BOX, [x, 1.36 + o - s * z * 0.33, s * 0.6 + z], [a, 0, 0], [w, 0.03, d], c);
      put(0, 0, 2.8, 0.96, "#24457e", 0.035); for (let i = 1; i < 7; i++) put(-1.4 + i * 0.4, 0, 0.03, 0.96, "#9cc2ff", 0.05); put(0, 0, 2.8, 0.03, "#9cc2ff", 0.05); }); // the solar panels
    B.at(6.2, -1.6, TA); hall(0, 0, 1.0, 1.0, 2.6, WH, [0.3, 0.74], 2, 6, DG); box(0, 1.0, 0, 1.1, 0.08, 2.7, "#c3ccd8"); cyl(0.1, 1.08, 0.7, 0.13, 0.2, "#e7edf3", CYL6); yard(0, 0, 1.7, 3.2);
    B.at(2.7, -6.05, 18); hall(0, 0, 1.3, 0.55, 1.0, WH, [0.3], 3, 2, DG); B.put(ARCH, [0, 0.55, 0], [0, 90, 0], [1.1, 0.42, 1.45], "#2fb37c"); // the small hall with the round roof
    B.at(-0.7, 6.8, 20); box(0, 0, 0, 0.3, 0.42, 0.3, "#ffc83d"); top(0, 0.42, 0, 0.42, 0.22, 0.42, RD, 0); B.put(BOX, [0, 0.2, 0.47], [30, 0, 0], [0.2, 0.04, 0.72], BL);  // the playground
    box(0.65, 0, 0.1, 0.5, 0.09, 0.5, "#9b6bff"); cyl(0.65, 0.09, 0.1, 0.12, 0.2, "#ff5fa2", CYL6); yard(0.3, 0.25, 1.6, 1.5, "#f1d9a6", 0.5);
    B.at();

    /* ---------- trees: the big old ones (their crowns sway) and the small ones ---------- */
    [[3.3, 5.5, 1.1], [5.3, 5.7, 1.15], [-2.5, -3.5, 1.0], [-1.2, -4.5, 0.9], [-0.3, 7.6, 0.9]].forEach((q) => { const r = q[2]; big.push([q[0], r * 1.05, q[1], r]); shade.push([q[0], q[1], r * 1.3]);
      V.put(CYL6, [q[0], 0, q[1]], Z, [r * 0.2, r * 1.3, r * 0.2], "#8a5a33"); });
    [[-2.3, -5.3, 0.62], [-3.2, -5.0, 0.6], [-0.5, -5.8, 0.55], [-5.95, -3.4, 0.4], [-5.9, -4.6, 0.45], [-2.4, 5.9, 0.55], [-1.9, 8.1, 0.6], [0.9, 6.3, 0.5], [2.0, 6.9, 0.45],
      [-0.4, 9.8, 0.55], [-2.6, 9.5, 0.5], [9.6, 1.5, 0.55], [9.5, 3.3, 0.45], [4.6, -5.5, 0.5], [-9.3, 3.7, 0.45], [-5.9, 5.3, 0.4], [-5.9, 6.6, 0.42], [-5.8, 8.0, 0.4]].forEach((q) => tree(q[0], q[1], q[2]));

    /* ---------- round the school: town houses, rice paddies, greenhouses, the banana grove, the mountains ---------- */
    B = V;
    const TOWN = ["#fff6e6", "#ffe3c8", "#dfeefc", "#f9dcdc", "#ece6da", "#fdf0b8"];
    const house = (x, z) => { const w = rnd(0.8, 1.05), d = rnd(0.85, 1.1), h = rnd(0.6, 1.5);
      B.at(x, z); hall(0, 0, w, h, d, TOWN[rnd(0, 6) | 0], [0.3, 0.74, 1.18].filter((y) => y < h - 0.12), 2, 2, DG);
      rnd() < 0.45 ? top(0, h, 0, w + 0.14, 0.3, d + 0.14, "#d0714f", 0.4) : box(0, h, 0, w + 0.1, 0.07, d + 0.1, "#bcc4ce"); if (rnd() < 0.5) cyl(0.2, h + 0.07, -0.2, 0.1, 0.17, "#e7edf3", CYL6); B.at(); };
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) house(-6.0 + i * 1.2 + j * 0.2, -6.6 - j * 1.2); // the town, north of the school
    [[-4.2, -9.0], [-9.15, -4.7], [-9.2, 4.4]].forEach((q) => house(q[0], q[1]));
    for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) paddies.push([-9.65 - i * 1.5, -2.9 + j * 1.75, 1.42, 1.67, (i + j) % 4 === 2 ? "#ecd35a" : (i + j) % 2 ? "#a2e45c" : "#8fdb4a"]); // rice, west of the road
    for (let i = 0; i < 5; i++) paddies.push([-0.7 + i * 1.4, -7.45, 1.32, 1.37, i === 1 ? "#ecd35a" : i % 2 ? "#8fdb4a" : "#a2e45c"]); // … and north of the school
    const tunnels = (x, z, ry, n, len) => { B.at(x, z, ry); yard(0, 0, n * 0.74 + 0.3, len + 0.4, "#d9d2bd", 0.1); for (let i = 0; i < n; i++) for (let j = 0; j < 6; j++) B.put(ARCH, [(i - (n - 1) / 2) * 0.74, 0, (j - 2.5) * (len / 6)], Z, [0.7, 0.4, len / 6], j % 2 ? "#f2f7fa" : "#c6dae7"); B.at(); }; // white tunnels with ribs
    tunnels(7.4, -4.4, -28, 3, 2.4); tunnels(9.0, -0.9, -28, 2, 2.0); // the greenhouses
    const LEAF = build((P, N, U, I) => { P.push(0, 0, 0, 0.45, 0.22, -0.17, 0.45, 0.22, 0.17, 1, -0.04, 0); N.push(-0.3, 1, 0, 0, 1, -0.3, 0, 1, 0.3, 0.3, 1, 0); U.push(0, 0, 0, 0, 0, 0, 0, 0); I.push(0, 1, 2, 1, 3, 2); });
    const PLANT = (() => { const b = Batch().put(CYL6, [0, 0, 0], Z, [0.045, 0.3, 0.045], "#9bd05c"); for (let i = 0; i < 6; i++) b.put(LEAF, [0, 0.27 + (i % 2) * 0.05, 0], [0, i * 60, i % 2 ? 22 : 0], [0.36, 0.36, 0.36], i % 2 ? "#3fa84a" : "#1f8a3e");
      return b.put(BOX, [0.08, 0.2, 0.05], [0, 30, 20], [0.07, 0.12, 0.07], YL).mesh(); })(); // a banana plant: big leaves and a yellow bunch
    for (let i = 0; i < 17; i++) for (let j = 0; j < 11; j++) { const x = 0.9 + i * 0.58 + (j % 2) * 0.12, z = 4.7 + j * 0.56, k = rnd(0.95, 1.2); // the banana grove, in rows
      if (Math.hypot(x, z) > R0 - 0.65 || (z < 7.5 && x < 7.1) || Math.hypot(x - 5.3, z - 5.7) < 2 || Math.hypot(x + 0.3, z - 7.6) < 1.9) continue;
      shade.push([x, z, 0.36]); V.put(PLANT, [x, 0, z], [0, rnd(0, 360), 0], [k, k, k]); }
    for (let i = 0; i < 7; i++) { const a = (-12 + i * 8 + rnd(-1.5, 1.5)) * RAD, r = R0 - 1.7 + rnd(-0.1, 0.1), s = rnd(1.15, 1.4); V.put(HILL, [r * Math.sin(a), 0, -r * Math.cos(a)], Z, [s, rnd(1.3, 2.05), s], i % 2 ? "#3f9f66" : "#2f8f5b"); } // the mountains
    for (let i = 0; i < 6; i++) { const a = (-8 + i * 8) * RAD, r = R0 - 2.55; V.put(HILL, [r * Math.sin(a), 0, -r * Math.cos(a)], Z, [0.92, rnd(0.7, 1.05), 0.92], "#74c878"); }

    /* ---------- meshes that move: a big crown, a runner, a car ("none" takes the colour of its node) ---------- */
    const CROWN = (() => { const b = Batch(); b.put(BALLH, [0, 0.55, 0], Z, [1, 0.8, 1], "#3fa650");
      for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU + 0.4; b.put(BALLH, [Math.cos(a) * 0.62, 0.45 + (i % 2) * 0.22, Math.sin(a) * 0.62], Z, [0.56, 0.48, 0.56], i % 2 ? "#57b95c" : "#2f9549"); }
      return b.put(BALLH, [0.1, 1.08, -0.05], Z, [0.6, 0.42, 0.6], "#7fce63").mesh(); })();
    const KID = (() => { const b = Batch(); b.put(BALL, [0, 0.2, 0], Z, [0.085, 0.12, 0.07], "none").put(BALL, [0, 0.38, 0], Z, [0.075, 0.075, 0.075], "#ffd7b0").put(BALL, [0, 0.415, -0.012], Z, [0.08, 0.055, 0.08], "#3b2a20");
      [-1, 1].forEach((s) => b.put(BOX, [s * 0.035, 0.06, s * 0.03], [s * 28, 0, 0], [0.04, 0.13, 0.04], NV)); return b.mesh(); })();
    const CAR = Batch().put(BOX, [0, 0.05, 0], Z, [0.2, 0.1, 0.42], "none").put(BOX, [0, 0.14, -0.02], Z, [0.17, 0.08, 0.22], "#dff3ff").mesh();

    /* ---------- pictures: the palette, the lanes of the track, the ground seen from above ---------- */
    const palette = paint(128, (g) => { swatch.forEach((i, c) => { if (c !== "none") { g.fillStyle = c; g.fillRect((i % 16) * 8, (i >> 4) * 8, 8, 8); } }); });
    const name = paint(256, (g, s) => { g.fillStyle = "#1f9d55"; g.fillRect(0, 0, s, s); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 46px 'Noto Sans TC','Microsoft JhengHei','PingFang TC','Heiti TC','Noto Sans CJK TC',sans-serif"; g.fillText("土城國小", s / 2, s / 2 + 2); });
    const BOARD = build((P, N, U, I) => { [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach((q) => { P.push(q[0] / 2, q[1] / 2, 0); N.push(0, 0, 1); U.push((q[0] + 1) / 2, 0.5 - q[1] * 0.11); }); I.push(0, 1, 2, 0, 2, 3); }); // a 4.5 : 1 board showing the middle strip of its picture
    const lanes = paint(128, (g, s) => { g.fillStyle = "#dc5140"; g.fillRect(0, 0, s, s); g.fillStyle = "rgba(255,255,255,.92)"; for (let i = 0; i <= 5; i++) g.fillRect(0, (i / 5) * s - 2.5, s, 5); });
    const ground = paint(1024, (g, s) => {
      const k = s / (2 * R0), on = (x, z, ry, fn) => { g.save(); g.translate((x + R0) * k, (z + R0) * k); g.rotate(-ry * RAD); g.scale(k, k); fn(); g.restore(); };
      const blob = (x, z, r, c, a, core) => { const q = g.createRadialGradient(x, z, r * (core || 0), x, z, r); q.addColorStop(0, "rgba(" + c + "," + a + ")"); q.addColorStop(1, "rgba(" + c + ",0)"); g.fillStyle = q; g.fillRect(x - r, z - r, 2 * r, 2 * r); };
      g.fillStyle = "#78c45c"; g.fillRect(0, 0, s, s);
      on(0, 0, 0, () => {
        for (let i = 0; i < 520; i++) blob(rnd(-R0, R0), rnd(-R0, R0), rnd(0.4, 1.5), i % 2 ? "136,210,106" : "92,172,80", 0.4); // the grass is not all one green
        paddies.forEach((p) => { const x = p[0] - p[2] / 2, z = p[1] - p[3] / 2; g.fillStyle = "#5fa046"; g.fillRect(x, z, p[2], p[3]); g.fillStyle = p[4]; g.fillRect(x + 0.06, z + 0.06, p[2] - 0.12, p[3] - 0.12);
          g.strokeStyle = "rgba(255,255,255,.22)"; g.lineWidth = 0.035; g.beginPath(); for (let y = z + 0.17; y < z + p[3] - 0.1; y += 0.13) { g.moveTo(x + 0.11, y); g.lineTo(x + p[2] - 0.11, y); } g.stroke(); });
        g.fillStyle = "#d9d2bd"; g.fillRect(-6.8, -R0, 0.34, 2 * R0); g.fillRect(-8.74, -R0, 0.34, 2 * R0); // the pavements of the road
      });
      yards.forEach((p) => on(p[0], p[1], p[4], () => { g.fillStyle = p[5]; g.beginPath(); g.roundRect ? g.roundRect(-p[2] / 2, -p[3] / 2, p[2], p[3], p[6] || 0.25) : g.rect(-p[2] / 2, -p[3] / 2, p[2], p[3]); g.fill(); }));
      on(TX, TZ, TA, () => { const ring = (r) => { g.beginPath(); outline(r).forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); };
        ring(TR + 0.22); g.fillStyle = "#e9dfc8"; g.fill(); ring(TI + 0.03); g.fillStyle = "#84cf5a"; g.fill(); g.clip(); g.fillStyle = "rgba(255,255,255,.14)"; for (let z = -2.8; z < 2.8; z += 0.7) g.fillRect(-2, z, 4, 0.35); });
      foot.forEach((p) => on(p[0], p[1], p[4], () => { g.shadowColor = "rgba(30,60,40,.6)"; g.shadowBlur = 0.32 * k; g.fillStyle = "rgba(30,60,40,.5)"; g.fillRect(-p[2] / 2, -p[3] / 2, p[2], p[3]); }));
      on(0, 0, 0, () => shade.forEach((p) => blob(p[0], p[1], p[2], "22,74,40", 0.5, 0.35)));
    });
    return { S: S.mesh(), V: V.mesh(), TRACK, GROUND, CROWN, KID, CAR, BOARD, palette, lanes, name, ground, big, medal, pole, bridge: [RX, BZ],
      /* where the six gate flags stand: [x, the height the pole starts at, z, the length of the pole] */
      spots: [[cls[0], 1.42, cls[1], 1.5], [-4.75, 1.6, -2.0, 1.75], [TX, 0, TZ, 2.6], [3.3, 2.6, 5.5, 1.1], [7.0, 1.5, 2.5, 1.5], [RX, 1.0, BZ, 1.7]] };
  }

  /* ================= on the page ================= */
  const Campus = (TC.Campus = {});
  Campus.supported = () => !!(TC.O3 && TC.O3.kit && TC.O3.supported());
  const numbers = {};
  const gateColour = (i) => { const g = window.TC_CONTENT && window.TC_CONTENT.gates && window.TC_CONTENT.gates[i + 1]; return g && /^#[0-9a-f]{6}$/i.test(g.color || "") ? g.color : GATE[i]; };

  Campus.mount = function (host, opt = {}) {
    const none = { ok: false, el: null, nodes: 0, yaw: 0, surprise() { return none; }, destroy() {}, pause() { return none; }, setGate() { return none; }, onFrame() { return none; }, project() { return { x: 0, y: 0, visible: false }; } };
    if (!host || !Campus.supported()) return none;
    const K = TC.O3.kit, { MESH, node, add, m4, mMul, mPersp, mLook, hex, paint, emblem, clamp, lerp, wave, RAD } = K;
    const canvas = document.createElement("canvas"); canvas.className = "c3c"; canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", opt.label || "土城國小校園的立體模型，可以轉 360 度");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y;" + (opt.drag === false ? "pointer-events:none;" : "cursor:grab;");
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.prepend(canvas);                                  // first in the host: its own labels and captions stay on top of the model
    const R = K.Renderer(canvas); if (!R) { canvas.remove(); return none; }
    const M = model || (model = make(K));
    const tilt = clamp(opt.tilt === undefined ? 34 : +opt.tilt, 8, 80), zoom = opt.zoom || 1, speed = opt.speed === undefined ? 9 : +opt.speed, showFlags = opt.flags !== false;
    const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches), spin = opt.spin !== false && !reduce;
    if (opt.dim) canvas.style.filter = "brightness(" + (1 - 0.45 * clamp(+opt.dim)) + ") saturate(" + (1 - 0.3 * clamp(+opt.dim)) + ")";

    /* ---------- the scene ---------- */
    const root = node({}), turn = add(root), col = hex;
    add(turn, { mesh: M.S, tex: M.palette, spec: 0.12 }); add(turn, { mesh: M.V, tex: M.palette, spec: 0.06 });
    const field = add(turn, { p: [TX, 0, TZ], r: [0, TA, 0] });
    add(field, { mesh: M.TRACK, p: [0, 0.03, 0], tex: M.lanes, col: col("#dc5140"), spec: 0.04 });
    const kids = [["#3d8bff", 1.18, 0.052, 0], ["#ffc83d", 1.36, 0.047, 0.3], ["#ff5fa2", 1.54, 0.043, 0.62]].map((q) => ({ n: add(field, { mesh: M.KID, tex: M.palette, col: col(q[0]), s: [1.5, 1.5, 1.5], spec: 0.1 }), r: q[1], v: q[2], u: q[3], x: 0, big: 1 }));
    const cars = [["#e2463f", 0.38, 1.5, 0], ["#ffffff", -0.38, 1.2, 0.3], ["#ffc83d", 0.38, 1.3, 0.55], ["#4cc9ff", -0.38, 1.7, 0.8]].map((q) => ({ n: add(turn, { mesh: M.CAR, tex: M.palette, col: col(q[0]), p: [M.bridge[0] + q[1], 0.04, 0], r: [0, q[1] > 0 ? 180 : 0, 0], spec: 0.3 }), v: q[2], u: q[3] })); // they drive on the right
    const crowns = M.big.map((q, i) => ({ n: add(turn, { mesh: M.CROWN, tex: M.palette, p: [q[0], q[1], q[2]], r: [0, i * 77, 0], s: [q[3], q[3], q[3]], spec: 0.05 }), ph: i * 0.37 }));
    [[0.05, 0], [-0.045, 180]].forEach((q) => add(turn, { mesh: MESH.disc, p: [M.medal[0], 2.46, M.medal[1] + q[0]], r: [0, q[1], 0], s: [0.63, 0.63, 1], col: col("#ffd768"), tex: emblem, spec: 0.12 })); // the school emblem over the entrance
    const banner = add(turn, { p: [M.pole[0], 1.76, M.pole[1]] }); // the school flag
    add(banner, { mesh: MESH.quad, p: [0.36, 0, 0], s: [0.66, 0.44, 1], col: [1, 1, 1], spec: 0.05 });
    [[0.012, 0], [-0.012, 180]].forEach((q) => add(banner, { mesh: MESH.disc, p: [0.36, 0, q[0]], r: [0, q[1], 0], s: [0.17, 0.17, 1], col: col("#ffd768"), tex: emblem, spec: 0.05 }));
    [[0.295, 0], [-0.295, 180]].forEach((q) => add(turn, { mesh: M.BOARD, p: [M.bridge[0], 1.35, M.bridge[1] + q[0]], r: [0, q[1], 0], s: [1.4, 0.31, 1], tex: M.name, emis: 0.45, spec: 0 })); // the name on the footbridge
    const flags = M.spots.map((q, i) => { const c = gateColour(i), f = add(turn, { p: [q[0], q[1], q[2]], vis: showFlags });
      const pole = add(f, { mesh: MESH.cyl, s: [0.045, q[3], 0.045], col: [1, 1, 1], spec: 0.5 }), sign = add(f, { p: [0, q[3], 0] });
      sign.mesh = MESH.disc; sign.s = [0.7, 0.7, 1]; sign.col = [1, 1, 1]; sign.emis = 0.9; sign.spec = 0; // a round sign with a white edge, the gate's colour and its number; it always faces the camera
      sign.tex = numbers[i + c] || (numbers[i + c] = paint(256, (g, s) => { g.fillStyle = "#fff"; g.fillRect(0, 0, s, s); g.fillStyle = c; g.beginPath(); g.arc(s / 2, s / 2, s * 0.445, 0, 7); g.fill();
        g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.font = "900 168px Fredoka,'Arial Black',Arial,sans-serif";
        g.lineWidth = 24; g.strokeStyle = "#152a63"; g.strokeText(i + 1, s / 2, s / 2 + 10); g.fillStyle = "#fff"; g.fillText(i + 1, s / 2, s / 2 + 10); }));
      return { f, pole, sign, h: q[3], k: 1 }; });
    add(turn, { mesh: M.GROUND, s: [R0, 1, R0], tex: M.ground, col: col("#78c45c"), spec: 0.03 }); // drawn last: what stands on the ground hides much of it

    /* ---------- surprises (opt.surprise): their pieces wait, hidden, until a tap plays one ---------- */
    const FX = [], fxAdd = (parent, o) => { const n = add(parent, Object.assign({ vis: false, spec: 0.2 }, o)); FX.push(n); return n; };
    const rnd = (a, b) => a + Math.random() * (b - a), PAL = ["#ff4f6d", "#ffc83d", "#2ee6b6", "#4cc9ff", "#a77bff", "#ff8fd0", "#ffffff", "#7dff6a"].map(col);
    kids.forEach((k, i) => (k.trail = opt.surprise ? Array.from({ length: 7 }, () => fxAdd(field, { mesh: MESH.sphere, col: col(["#3d8bff", "#ffc83d", "#ff5fa2"][i]), emis: 0.9, spec: 0 })) : []));
    let drops = [], rainbow = null, confetti = [], balloon = null, abc = null, blocks = [], drone = null, rotors = [], beam = null, pins = [];
    /* what the AI drone finds, in the order it flies (turn frame: [x, y, z]); the last one is the school itself */
    const SEEN = [[[TX, 0.05, TZ], "running track", "跑道"], [[M.spots[0][0], 1.0, M.spots[0][2]], "classrooms", "教室"], [[0.7, 0.05, -7.45], "rice field", "稻田"],
      [[1.93, 1.4, -9.1], "mountains", "山"], [[7.4, 0.45, -4.4], "greenhouses", "溫室"], [[7.0, 1.45, 2.5], "solar panels", "太陽能板"], [[8.0, 0.5, 5.9], "banana trees", "香蕉樹"],
      [[M.big[0][0], 1.6, M.big[0][2]], "big tree", "大樹"], [[M.bridge[0], 1.1, M.bridge[1]], "footbridge", "天橋"], [[M.medal[0], 2.46, M.medal[1]], "Tucheng Elementary School", "土城國小"]];
    const ARRIVE = [0.8]; for (let i = 1; i < SEEN.length; i++) { const a = SEEN[i - 1][0], b = SEEN[i][0]; ARRIVE.push(ARRIVE[i - 1] + 0.42 + 0.05 * Math.hypot(b[0] - a[0], b[2] - a[2])); } // a long hop takes longer
    if (opt.surprise) {
      // English: seven ABC blocks; their fronts spell TUCHENG, their backs ENGLISH
      const W1 = "TUCHENG", W2 = "ENGLISH", BC = ["#ff4f6d", "#ff9a2e", "#ffc83d", "#2ee6b6", "#4cc9ff", "#7b6bff", "#ff5fa2"];
      const face = (L, c) => paint(128, (g, S) => { g.fillStyle = c; g.fillRect(0, 0, S, S); g.fillStyle = "rgba(255,255,255,.28)"; g.fillRect(8, 8, S - 16, 10);
        g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 96px Fredoka,'Arial Black',Arial,sans-serif"; g.lineJoin = "round"; g.lineWidth = 12; g.strokeStyle = "#152a63"; g.strokeText(L, S / 2, S / 2 + 6); g.fillStyle = "#fff"; g.fillText(L, S / 2, S / 2 + 6); });
      abc = fxAdd(root, {});
      blocks = W1.split("").map((L, i) => { const n = add(abc, {}), c = BC[i], c2 = BC[(i + 3) % 7];
        add(n, { mesh: MESH.box, col: col(c), spec: 0.35 });
        add(n, { mesh: MESH.quad, p: [0, 0, 0.505], s: [0.92, 0.92, 1], tex: face(L, c), emis: 0.3, spec: 0.1 });
        add(n, { mesh: MESH.quad, p: [0, 0, -0.505], r: [0, 180, 0], s: [0.92, 0.92, 1], tex: face(W2[i], c2), emis: 0.3, spec: 0.1 });
        [[0.505, 90], [-0.505, -90]].forEach((q) => add(n, { mesh: MESH.quad, p: [q[0], 0, 0], r: [0, q[1], 0], s: [0.92, 0.92, 1], tex: face("★", c2), emis: 0.2, spec: 0.1 }));
        return { n, x: 0, s: 1, from: [0, 0, 0] }; });
      // AI: a little drone that flies with the campus as it turns, its scan beam, and a ring on each thing it finds
      drone = fxAdd(turn, {});
      add(drone, { mesh: MESH.box, s: [0.5, 0.16, 0.56], col: col("#f4f7ff"), spec: 0.8 });
      add(drone, { mesh: MESH.box, p: [0, 0.1, 0], s: [0.3, 0.08, 0.32], col: col("#3d8bff"), spec: 0.8 });
      [45, -45].forEach((a) => add(drone, { mesh: MESH.box, r: [0, a, 0], s: [1.0, 0.05, 0.07], col: col("#5a6aa8"), spec: 0.4 }));
      add(drone, { mesh: MESH.sphere, p: [0, -0.1, 0.18], s: [0.12, 0.1, 0.12], col: col("#152a63"), spec: 0.9 }); // the camera
      add(drone, { mesh: MESH.sphere, p: [0, 0.01, 0.29], s: [0.06, 0.06, 0.06], col: col("#39f5ff"), emis: 1, spec: 0 }); // its eye light
      rotors = [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([a, b2]) => { const r = add(drone, { p: [a * 0.36, 0.08, b2 * 0.36] });
        add(r, { mesh: MESH.cyl, s: [0.03, 0.06, 0.03], col: col("#5a6aa8") });
        add(r, { mesh: MESH.box, p: [0, 0.07, 0], s: [0.42, 0.015, 0.06], col: col("#ff5fa2"), spec: 0.3 }); return r; });
      beam = fxAdd(turn, { mesh: MESH.cone, col: col("#39f5ff"), emis: 1, spec: 0, alpha: 0.16 });
      pins = SEEN.map((q, i) => fxAdd(turn, { mesh: MESH.ringThin, p: q[0].slice(), col: col(i === SEEN.length - 1 ? "#ffd23d" : "#39f5ff"), emis: 1, spec: 0 }));
      // rain, then a rainbow standing over the school (its lower half is hidden under the ground)
      drops = Array.from({ length: 64 }, () => ({ n: fxAdd(root, { mesh: MESH.cyl, s: [0.05, 0.6, 0.05], col: col("#cfeaff"), emis: 0.6, alpha: 0.85 }), x: 0, z: 0, ph: 0 }));
      rainbow = fxAdd(root, { p: [0, 0, -3.2], r: [90, 0, 0] });
      ["#ff4d4d", "#ff9a2e", "#ffd93d", "#4cd964", "#3fa9ff", "#5b6cff", "#a35bff"].forEach((c, i) => { const R = 7.6 - i * 0.62; add(rainbow, { mesh: K.torus(0.33 / R), s: [R, R, R], col: col(c), emis: 0.5, spec: 0.35 }); });
      // confetti for the relay race
      confetti = Array.from({ length: 72 }, (x, i) => ({ n: fxAdd(root, { mesh: MESH.box, s: [0.34, 0.05, 0.22], col: PAL[i % 7], emis: 0.45 }), x: 0, y: 0, z: 0, v: 1, sp: [0, 0] }));
      // a hot-air balloon in rainbow stripes, with the emblem on its side
      const stripes = paint(256, (g, S) => { const c = ["#ff4f6d", "#ffc83d", "#2ee6b6", "#4cc9ff", "#a77bff", "#ff8fd0"]; for (let i = 0; i < 12; i++) { g.fillStyle = c[i % 6]; g.fillRect((i * S) / 12, 0, S / 12 + 1, S); } });
      balloon = fxAdd(root, {});
      add(balloon, { mesh: MESH.sphere, p: [0, 1.85, 0], s: [1, 1.18, 1], tex: stripes, spec: 0.5 });
      add(balloon, { mesh: MESH.cone, p: [0, 1.2, 0], r: [180, 0, 0], s: [0.74, 0.52, 0.74], tex: stripes, spec: 0.4 });
      add(balloon, { mesh: MESH.disc, p: [0, 1.95, 1.0], s: [0.44, 0.44, 1], col: col("#ffe08a"), tex: emblem, spec: 0.2 });
      add(balloon, { mesh: MESH.box, p: [0, 0.22, 0], s: [0.46, 0.34, 0.46], col: col("#a0652c"), spec: 0.2 });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => add(balloon, { mesh: MESH.cyl, p: [a * 0.2, 0.38, b * 0.2], s: [0.015, 0.36, 0.015], col: col("#5a3a1c") }));
    }
    let count = 0; (function walk(n) { if (n.mesh) count++; n.kids.forEach(walk); })(root);

    /* ---------- the camera: far enough for the whole base, whatever the shape of the host ---------- */
    const proj = m4(), view = m4(), vp0 = m4(), vp = m4(), fix = m4(), eye = [0, 0, 0];
    const light = (() => { const v = [-0.36, 0.8, 0.5], l = Math.hypot(v[0], v[1], v[2]); return new Float32Array(v.map((x) => x / l)); })();
    const hull = []; // what must stay on the screen: the base, the mountains, and every flag at its biggest
    [[R0 + 0.45, -1.1], [R0, 0], [R0 - 1.2, 2.2]].concat(showFlags ? M.spots.map((q) => [Math.hypot(q[0], q[2]) + 0.95, q[1] + q[3] * 1.2 + 1.4]) : []).forEach((q) => { for (let a = 0; a < 16; a++) hull.push([q[0] * Math.cos(a * 0.3927), q[1], q[0] * Math.sin(a * 0.3927)]); });
    let W = 0, H = 0, cssW = 1, cssH = 1, res = Math.min(2, window.devicePixelRatio || 1); // canvas pixels per CSS pixel
    function look(d) { // the camera at distance d → [widest |x|, lowest y, highest y] of the model on the screen (−1 … 1)
      const th = tilt * RAD; eye[0] = 0; eye[1] = 0.6 + d * Math.sin(th); eye[2] = d * Math.cos(th);
      mPersp(proj, 30, W / H, d * 0.45, d * 1.7); mLook(view, eye, [0, 0.6, 0]); mMul(vp0, proj, view);
      let xm = 0, y0 = 9, y1 = -9;
      for (let i = 0; i < hull.length; i++) { const p = hull[i], w = vp0[3] * p[0] + vp0[7] * p[1] + vp0[11] * p[2] + vp0[15], x = (vp0[0] * p[0] + vp0[4] * p[1] + vp0[8] * p[2] + vp0[12]) / w, y = (vp0[1] * p[0] + vp0[5] * p[1] + vp0[9] * p[2] + vp0[13]) / w;
        xm = Math.max(xm, Math.abs(x)); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      return [xm, y0, y1];
    }
    function size() {
      const r = host.getBoundingClientRect(), k = Math.min(res, Math.sqrt(2.6e6 / Math.max(1, r.width * r.height))), w = Math.max(2, Math.round(r.width * k)), h = Math.max(2, Math.round(r.height * k)); // never more than 2.6 million pixels
      if (w === W && h === H) return;
      W = canvas.width = w; H = canvas.height = h; cssW = host.clientWidth || r.width; cssH = host.clientHeight || r.height;
      let lo = 15, hi = 600; for (let i = 0; i < 20; i++) { const d = (lo + hi) / 2, e = look(d); if (Math.max(e[0], (e[2] - e[1]) / 2) > 0.95) lo = d; else hi = d; }
      const e = look(hi); fix.fill(0); fix[0] = fix[5] = zoom; fix[10] = fix[15] = 1; fix[13] = (-(e[1] + e[2]) / 2) * zoom; mMul(vp, fix, vp0); // centred, then zoomed
    }

    /* ---------- every frame ---------- */
    let yaw = opt.yaw === undefined ? 30 : +opt.yaw, vel = 0, dragging = false, lastX = 0, paused = false, dead = false, drawn = false, raf = 0, slow = 0, gate = +opt.gate || 0;
    const t0 = performance.now() / 1000, subs = []; let last = t0;
    function frame(ts) {
      raf = 0; if (dead) return;
      if (!canvas.isConnected) { ctl.destroy(); return; }
      const now = ts / 1000, real = now - last, dt = Math.min(0.1, Math.max(0.001, real)); last = now;
      if (document.hidden || paused || !canvas.offsetWidth) { raf = requestAnimationFrame(frame); return; } // not on screen: draw nothing
      size();
      const t = reduce ? 0 : now - t0;
      if (!dragging) { yaw += ((spin ? speed : 0) + vel) * dt; vel *= Math.exp(-dt * 2.4); if (Math.abs(vel) < 2) vel = 0; }
      turn.r[1] = yaw;
      crowns.forEach((c) => { c.n.r[0] = 2.2 * wave(t, 3.4, c.ph); c.n.r[2] = 2.6 * wave(t, 2.7, c.ph + 0.3); });
      if (cur) runFx(now - cur.at, dt);
      kids.forEach((k) => { const p = lap(k.u + t * k.v + k.x, k.r); k.n.s[0] = k.n.s[1] = k.n.s[2] = 1.5 * k.big; k.n.p[0] = p[0]; k.n.p[2] = p[1]; k.n.r[1] = p[2]; k.n.p[1] = 0.03 + 0.05 * Math.abs(wave(t, 0.5, k.u)); k.n.r[0] = reduce ? 0 : 10; });
      cars.forEach((c) => { const z = ((((t * c.v) / 14.8 + c.u) % 1) - 0.5) * 14.8, k = clamp((7.4 - Math.abs(z)) / 0.6); c.n.p[2] = c.n.r[1] ? -z : z; c.n.vis = k > 0.02; c.n.s[0] = c.n.s[1] = c.n.s[2] = k; }); // … and come and go at the edge of the base
      banner.r[1] = TA + 20 + 16 * wave(t, 2.3);
      const ease = 1 - Math.exp(-dt * 9);
      flags.forEach((f, i) => { const on = gate === i + 1, k = gate ? (on ? 1.5 : 0.6) : 1; f.k = drawn ? lerp(f.k, k, ease) : k;
        const y = f.h * (on ? 1.2 : 1) + (on ? 0.42 * Math.abs(wave(t, 1.2)) : 0) + (f.jy || 0); f.pole.s[1] = y; f.sign.p[1] = y; f.sign.s[0] = f.sign.s[1] = 0.7 * f.k * (1 + 0.35 * (f.jy || 0)); f.sign.r[0] = -tilt; f.sign.r[1] = -yaw + (f.spin || 0); });
      R.render(root, vp, eye, light); drawn = true;
      for (let i = 0; i < subs.length; i++) subs[i](ctl);
      /* a slow computer (not the first two seconds, when everything is being made): draw fewer pixels rather than stutter */
      if (real > 0.05 && now - t0 > 2) { if (++slow > 30 && res > 0.5) { res = res > 1 ? 1 : res > 0.75 ? 0.75 : 0.5; slow = 0; } } else if (slow > 0) slow--;
      raf = requestAnimationFrame(frame);
    }

    const feel = () => 0.55 * clamp(320 / cssW, 0.22, 1); // the same feel as turning Ollie: a drag across the model is about half a turn
    let downX = 0, downY = 0, downT = 0, moved = 0;
    const pd = (e) => { dragging = true; lastX = e.clientX; vel = 0; downX = e.clientX; downY = e.clientY; downT = performance.now(); moved = 0; canvas.style.cursor = "grabbing"; try { canvas.setPointerCapture(e.pointerId); } catch (err) {} };
    const pm = (e) => { if (!dragging) return; moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY)); const d = (e.clientX - lastX) * feel(); lastX = e.clientX; yaw += d; vel = clamp(d * 60, -300, 300); };
    const pu = (e) => { const was = dragging; dragging = false; canvas.style.cursor = "grab";
      if (was && opt.surprise && e && e.type === "pointerup" && moved < 12 && performance.now() - downT < 700) tap(e.clientX, e.clientY); }; // a tap, not a drag
    if (opt.drag !== false) { canvas.addEventListener("pointerdown", pd); canvas.addEventListener("pointermove", pm); canvas.addEventListener("pointerup", pu); canvas.addEventListener("pointercancel", pu); }

    /* ---------- the surprises ---------- */
    const ease = (x) => 1 - Math.pow(1 - clamp(x), 3), inout = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    const back = (x) => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
    const sfx = (n) => { try { TC.sfx && TC.sfx(n); } catch (e) {} };
    const t0fx = () => (reduce ? 0 : performance.now() / 1000 - t0); // the clock the kids run on (frame's t)
    const SHOWS = {
      english: { dur: 6.4, cap: "🔤 土城特色：英語！ Let's speak English!" }, rainbow: { dur: 6.6, cap: "🌈 雨停了，出彩虹！ Rainbow!" },
      ai: { dur: ARRIVE[ARRIVE.length - 1] + 1.9, cap: "🤖 土城特色：AI！ AI, find our school!" }, relay: { dur: 5.2, cap: "🏃 大隊接力衝衝衝！ Run, run, run!" },
      balloon: { dur: 6.8, cap: "🎈 熱氣球起飛！ Up, up and away!" }, bell: { dur: 5.4, cap: "🔔 噹噹噹～上課囉！ Ding-dong!" },
      ollie: { dur: 4.8, cap: "🦉 歐力飛來了！ Hi, I'm Ollie!" } };
    const order = Object.keys(SHOWS).sort(() => Math.random() - 0.5); let turnNo = 0, cur = null;
    let layer = null; // the HTML layer over the model: the caption, the sparkles at the finger, Ollie flying past, music notes
    if (opt.surprise) { layer = document.createElement("div"); layer.className = "c3fx"; layer.setAttribute("aria-hidden", "true"); layer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1"; host.append(layer); }
    const el = (tag, css, text) => { const d = document.createElement(tag); d.style.cssText = "position:absolute;" + css; if (text) d.textContent = text; layer.append(d); return d; };
    const later = (d, ms) => setTimeout(() => d.remove(), ms);
    function sparkle(x, y) { // stars burst out of the place the finger touched
      const u = Math.max(14, Math.min(cssW, cssH) * 0.045);
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + Math.random() * 0.4, r = u * (2 + Math.random() * 2.2);
        const d = el("span", `left:${x}px;top:${y}px;font-size:${u * (0.7 + Math.random() * 0.6)}px;line-height:1;color:${["#ffd23d", "#ff8fd0", "#7de3ff", "#a8ff8a", "#ffffff"][i % 5]};text-shadow:0 0 .3em rgba(255,255,255,.8)`, i % 3 ? "★" : "✦");
        d.animate([{ transform: "translate(-50%,-50%) scale(.3)", opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * r}px),calc(-50% + ${Math.sin(a) * r}px)) scale(1) rotate(${rnd(-160, 160)}deg)`, opacity: 0 }], { duration: 750 + Math.random() * 300, easing: "cubic-bezier(.2,.8,.3,1)", fill: "forwards" });
        later(d, 1100); }
    }
    function caption(text, dur) {
      layer.querySelectorAll(".c3cap").forEach((c) => c.remove());
      const u = Math.max(13, Math.min(cssW * 0.042, cssH * 0.06));
      const d = el("div", `left:50%;top:3%;transform:translateX(-50%);white-space:nowrap;padding:.35em 1em .4em;border-radius:2em;background:linear-gradient(180deg,#fff,#fff4d6);color:#2b3a8f;font:700 ${u}px Fredoka,'Noto Sans TC','Microsoft JhengHei',sans-serif;box-shadow:0 .2em 0 #e0a21a,0 .5em 1.2em rgba(0,0,0,.3);border:.12em solid #ffd23d`, text);
      d.className = "c3cap";
      d.animate([{ transform: "translateX(-50%) scale(.2) rotate(-8deg)", opacity: 0 }, { transform: "translateX(-50%) scale(1.12) rotate(2deg)", opacity: 1, offset: 0.08 }, { transform: "translateX(-50%) scale(1)", opacity: 1, offset: 0.14 }, { transform: "translateX(-50%) scale(1)", opacity: 1, offset: 0.86 }, { transform: "translateX(-50%) scale(.6)", opacity: 0 }], { duration: dur * 1000, fill: "forwards" });
      later(d, dur * 1000 + 100);
    }
    function ollieFly(dur) { // our 3D Ollie (a still of him) swoops over the campus, waving, with a trail of stars
      const h = Math.min(cssH * 0.42, cssW * 0.3), img = document.createElement("img"); img.alt = ""; img.src = opt.ollieImg || "assets/img/ollie-wave.png";
      img.onerror = () => { img.onerror = null; if (TC.art) img.src = TC.art("ollie"); };
      img.style.cssText = `position:absolute;left:0;top:0;height:${h}px;width:auto;max-width:none;filter:drop-shadow(0 .6em .5em rgba(0,0,0,.35))`; layer.append(img);
      const hi = el("span", `left:0;top:0;padding:.2em .6em;border-radius:1em;background:#fff;color:#ff5f9e;font:700 ${h * 0.13}px Fredoka,sans-serif;box-shadow:0 .15em 0 #ffc2d9`, "Hi!");
      const P = [[-0.35, 0.75, -15], [0.05, 0.3, -6], [0.32, 0.08, 8], [0.55, 0.22, -4], [0.62, 0.5, 10], [0.4, 0.4, -10], [0.7, 0.05, 6], [1.15, -0.2, 18]];
      const k = P.map((q, i) => ({ transform: `translate(${q[0] * cssW}px,${q[1] * cssH}px) rotate(${q[2]}deg)`, offset: i / (P.length - 1) }));
      img.animate(k, { duration: dur * 1000, easing: "ease-in-out", fill: "forwards" });
      hi.animate(P.map((q, i) => ({ transform: `translate(${q[0] * cssW + h * 0.62}px,${q[1] * cssH - h * 0.02}px)`, opacity: i === 0 || i === P.length - 1 ? 0 : 1, offset: i / (P.length - 1) })), { duration: dur * 1000, easing: "ease-in-out", fill: "forwards" });
      const hostR = host.getBoundingClientRect(), trail = setInterval(() => { if (!img.isConnected) return clearInterval(trail); const r = img.getBoundingClientRect(); if (r.right < hostR.left || r.left > hostR.right) return;
        const d = el("span", `left:${r.left - hostR.left + r.width * 0.3}px;top:${r.top - hostR.top + r.height * 0.75}px;font-size:${h * 0.11}px;color:${["#ffd23d", "#ff8fd0", "#7de3ff"][(Math.random() * 3) | 0]}`, "★");
        d.animate([{ transform: "scale(1)", opacity: 1 }, { transform: `translate(${rnd(-20, 20)}px,${rnd(10, 40)}px) scale(.2) rotate(180deg)`, opacity: 0 }], { duration: 900, fill: "forwards" }); later(d, 950); }, 90);
      later(img, dur * 1000 + 50); later(hi, dur * 1000 + 50); setTimeout(() => clearInterval(trail), dur * 1000 + 60);
      sfx("whoosh"); setTimeout(() => sfx("sparkle"), 900); setTimeout(() => sfx("ding"), 1900);
    }
    function notes(dur) { // music notes float up from the school while the bell rings
      for (let i = 0; i < 14; i++) setTimeout(() => { if (!layer.isConnected) return; const u = Math.min(cssW, cssH) * rnd(0.08, 0.12);
        const d = el("span", `left:${rnd(18, 78)}%;top:${rnd(45, 70)}%;font-size:${u}px;line-height:1;color:${["#ffd23d", "#ff8fd0", "#7de3ff", "#a8ff8a", "#ffffff"][i % 5]};text-shadow:0 0 .06em #2b3a8f,0 0 .06em #2b3a8f,0 .08em 0 #2b3a8f;font-weight:700`, ["♪", "♫", "♬", "♩"][i % 4]);
        d.animate([{ transform: "translateY(0) scale(.4)", opacity: 0 }, { transform: `translate(${rnd(-12, 12)}px,-${u * 0.8}px) scale(1)`, opacity: 1, offset: 0.2 }, { transform: `translate(${rnd(-40, 40)}px,-${u * 4}px) scale(.9) rotate(${rnd(-25, 25)}deg)`, opacity: 0 }], { duration: 2200, easing: "ease-out", fill: "forwards" }); later(d, 2300); }, i * ((dur - 2) * 1000 / 14));
    }
    function projY(x, y, z) { const w = vp[3] * x + vp[7] * y + vp[11] * z + vp[15]; return [(vp[0] * x + vp[4] * y + vp[8] * z + vp[12]) / w, (vp[1] * x + vp[5] * y + vp[9] * z + vp[13]) / w]; }
    function reset() { FX.forEach((n) => (n.vis = false)); kids.forEach((k) => (k.big = 1)); flags.forEach((f) => { f.jy = 0; f.spin = 0; }); cur = null;
      if (layer) layer.querySelectorAll(".c3ai").forEach((d) => d.remove()); }
    function bubbles() { // speech bubbles with lines the children know pop up over the campus
      const L = ["Hello!", "Good morning!", "Thank you!", "Good job!", "You're welcome.", "Have a nice day!"], C = ["#ff4f6d", "#2b7bff", "#0aa37f", "#ff8a00", "#7b4dff", "#e83e8c"];
      const u = Math.max(12, Math.min(cssW * 0.034, cssH * 0.05)), spots = [[12, 58], [70, 52], [28, 78], [60, 76], [8, 36], [76, 32]];
      L.forEach((t, i) => setTimeout(() => { if (!layer.isConnected) return;
        const d = el("div", `left:${spots[i][0] + rnd(-3, 3)}%;top:${spots[i][1] + rnd(-3, 3)}%;padding:.3em .75em .35em;border-radius:1.2em;background:#fff;color:${C[i]};font:700 ${u}px Fredoka,'Noto Sans TC',sans-serif;white-space:nowrap;box-shadow:0 .15em 0 ${C[i]},0 .4em .8em rgba(0,0,0,.25);border:.1em solid ${C[i]}`, t);
        const tail = document.createElement("i"); tail.style.cssText = `position:absolute;left:1.1em;bottom:-.45em;width:.8em;height:.8em;background:#fff;border-right:.1em solid ${C[i]};border-bottom:.1em solid ${C[i]};transform:rotate(45deg)`; d.append(tail);
        d.animate([{ transform: "translateY(.6em) scale(.2)", opacity: 0 }, { transform: "translateY(0) scale(1.12)", opacity: 1, offset: 0.12 }, { transform: "translateY(0) scale(1)", opacity: 1, offset: 0.2 },
          { transform: "translateY(-1.6em) scale(1)", opacity: 1, offset: 0.8 }, { transform: "translateY(-2.4em) scale(.8)", opacity: 0 }], { duration: 2300, easing: "ease-out", fill: "forwards" });
        later(d, 2400); sfx("pop"); }, i * 330));
    }
    function scr(x, y, z) { // a point in the turning campus → CSS pixels of the host (turn.W was set by the last frame)
      const m = turn.W, X = m[0] * x + m[4] * y + m[8] * z + m[12], Y = m[1] * x + m[5] * y + m[9] * z + m[13], Z = m[2] * x + m[6] * y + m[10] * z + m[14];
      const w = vp[3] * X + vp[7] * Y + vp[11] * Z + vp[15], nx = (vp[0] * X + vp[4] * Y + vp[8] * Z + vp[12]) / w, ny = (vp[1] * X + vp[5] * Y + vp[9] * Z + vp[13]) / w;
      return { x: (nx * 0.5 + 0.5) * cssW, y: (0.5 - ny * 0.5) * cssH, ok: w > 0 && Math.abs(nx) < 1.05 && Math.abs(ny) < 1.05 };
    }
    function tag(i) { // the AI's label on a thing it found: the English word, the Chinese under it
      const last = i === SEEN.length - 1, u = Math.max(11, Math.min(cssW * 0.026, cssH * 0.04)) * (last ? 1.25 : 1), c = last ? "#ffd23d" : "#39f5ff";
      const d = el("div", `left:0;top:0;padding:.22em .6em .3em;border-radius:.4em;background:rgba(8,20,52,.82);border:.12em solid ${c};box-shadow:0 0 .7em ${c};color:#fff;font:700 ${u}px Fredoka,'Noto Sans TC',sans-serif;white-space:nowrap;text-align:center;line-height:1.15`);
      d.className = "c3ai";
      const b = document.createElement("b"); b.textContent = (last ? "★ " : "") + SEEN[i][1]; b.style.color = last ? "#ffe58a" : "#fff";
      const s2 = document.createElement("small"); s2.textContent = "AI ✓ " + SEEN[i][2]; s2.style.cssText = `display:block;font-size:.68em;color:${c};font-weight:700`;
      d.append(b, s2); d.animate([{ opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1.15, offset: 0.6 }, { opacity: 1, scale: 1 }], { duration: 380, easing: "ease-out" });
      return d;
    }
    let tags = [], hud = null;
    function start(name) {
      reset(); const S = SHOWS[name]; if (!S) return;
      cur = { name, at: performance.now() / 1000, dur: S.dur, cue: {} }; caption(S.cap, S.dur);
      if (name === "english") { // the row of blocks floats as high as the screen allows (under the caption), as wide as it allows
        let y = 3.8; while (y > 1.6 && projY(0, y + 0.9, 2.2)[1] > 0.64) y -= 0.1;
        let g = 1.62; const edge = Math.abs(projY(3.5 * g, y, 2.2)[0]); if (edge > 0.9) g *= 0.9 / edge;
        abc.p = [0, y, 2.2]; abc.r = [-tilt * 0.45, 0, 0];
        blocks.forEach((b, i) => { b.x = (i - 3) * g; b.s = g * 0.84; b.from = [(i - 3) * g * 0.3 + rnd(-0.3, 0.3), -y + 0.3, rnd(-1.2, 0.4)]; b.n.p = b.from.slice(); b.n.s = [0, 0, 0]; }); }
      if (name === "ai") { tags = []; hud = el("div", `left:2%;bottom:3%;padding:.3em .8em;border-radius:.5em;background:rgba(8,20,52,.8);border:.12em solid #39f5ff;color:#7df9ff;font:700 ${Math.max(11, Math.min(cssW * 0.026, cssH * 0.04))}px Fredoka,'Noto Sans TC',monospace;white-space:nowrap;box-shadow:0 0 .6em #39f5ff`, "🤖 AI scanning…");
        hud.className = "c3ai"; drone.p = [SEEN[0][0][0], 0.2, SEEN[0][0][2]]; sfx("whoosh"); }
      if (name === "rainbow") { drops.forEach((d) => { const a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random()) * 8; d.x = Math.cos(a) * r; d.z = Math.sin(a) * r; d.ph = Math.random(); }); sfx("rain"); }
      if (name === "relay") { confetti.forEach((c) => { c.x = rnd(-6.5, 6.5); c.z = rnd(-3, 5.5); c.y = rnd(3, 9); c.v = rnd(1.1, 2); c.sp = [rnd(-400, 400), rnd(-400, 400)]; }); sfx("drum"); }
      if (name === "balloon") { sfx("whoosh"); setTimeout(() => sfx("pop"), 300); }
      if (name === "bell") { sfx("bell"); notes(S.dur); }
      if (name === "ollie") ollieFly(S.dur);
    }
    function runFx(e, dt) {
      if (e > cur.dur) { reset(); return; }
      const once = (k, fn) => { if (!cur.cue[k]) { cur.cue[k] = 1; fn(); } };
      const n = cur.name, out = clamp((cur.dur - e) / 0.6); // the last 0.6 s: everything shrinks away
      if (n === "english") { abc.vis = true;
        blocks.forEach((b, i) => { const k = clamp((e - 0.15 - i * 0.16) / 0.6); // one after another the blocks jump up out of the campus …
          if (k <= 0) { b.n.s = [0, 0, 0]; return; } once("p" + i, () => sfx("pop"));
          const f1 = inout((e - 2.0 - i * 0.13) / 0.5), f2 = inout((e - 4.25 - i * 0.1) / 0.7); // … turn round to ENGLISH, and later turn once more, all the way
          if (f1 > 0.5) once("f" + i, () => sfx("tick"));
          const hop = 0.5 * Math.max(0, Math.sin(Math.PI * clamp((e - 3.1 - i * 0.05) / 0.45))), bob = e > 3.6 ? 0.1 * Math.sin((e - 3.6) * 5 + i * 0.8) : 0;
          b.n.p = [lerp(b.from[0], b.x, ease(k)), lerp(b.from[1], 0, ease(k)) + 1.4 * Math.sin(Math.PI * k) + hop + bob, lerp(b.from[2], 0, ease(k))];
          b.n.r = [540 * (1 - ease(k)), 180 * f1 + 360 * f2, 0]; const sc = b.s * back(k) * out; b.n.s = [sc, sc, sc]; });
        if (e > 3.1) once("hi", () => { sfx("fanfare"); bubbles(); });
      }
      if (n === "ai") {
        const A = ARRIVE, last = A.length - 1, P = (i) => SEEN[i][0], high = (i) => Math.max(2.9, P(i)[1] + 1.6);
        const at = (t) => { // where the drone is at time t: it takes off from the track, then flies from one thing to the next, slowing down at each
          if (t <= A[0]) { const k = inout(t / A[0]), p = P(0); return [p[0], lerp(0.2, high(0), k), p[2]]; }
          if (t >= A[last]) { const p = P(last), a = (t - A[last]) * 2.4; return [p[0] + 0.9 * Math.sin(a), high(last) + 0.15 * Math.sin(a * 2), p[2] + 0.9 * (1 - Math.cos(a))]; }
          let i = 0; while (t > A[i + 1]) i++; const k = inout((t - A[i]) / (A[i + 1] - A[i])), a = P(i), b2 = P(i + 1);
          return [lerp(a[0], b2[0], k), lerp(high(i), high(i + 1), k) + 0.5 * Math.sin(Math.PI * k), lerp(a[2], b2[2], k)]; };
        const p = at(e), q = at(e + 0.06), dx = q[0] - p[0], dz = q[2] - p[2], v = Math.hypot(dx, dz), k = 2.8 * back(e / 0.5) * out;
        drone.vis = k > 0.01; drone.p = [p[0], p[1] + 0.06 * Math.sin(e * 7), p[2]]; drone.s = [k, k, k];
        if (v > 0.004) drone.r[1] = Math.atan2(dx, dz) / RAD; drone.r[0] = clamp(v * 120, 0, 18); rotors.forEach((r, i) => (r.r[1] = e * (i % 2 ? -2200 : 2200)));
        let flash = 0; A.forEach((t, i) => { if (e >= t) flash = Math.max(flash, Math.exp(-(e - t) * 4)); });
        beam.vis = drone.vis && e > A[0] - 0.3; beam.p = [p[0], 0.03, p[2]]; beam.s = [0.55 + 0.35 * flash, Math.max(0.1, drone.p[1] - 0.2), 0.55 + 0.35 * flash]; beam.alpha = (0.1 + 0.28 * flash) * out;
        pins.forEach((pn, i) => { const g = e - A[i]; pn.vis = g > 0 && out > 0.01; if (!pn.vis) return; const z = (i === last ? 1.0 : 0.62) * back(g / 0.35) * (1 + 0.08 * Math.sin(e * 5 + i)) * out; pn.s = [z, z, z]; pn.r[1] = e * 90; });
        A.forEach((t, i) => { if (e >= t) once("t" + i, () => { tags[i] = tag(i); sfx(i === last ? "levelup" : "coin"); if (hud) hud.textContent = i === last ? `🤖 AI found ${A.length} things! 找到 ${A.length} 個土城特色！` : `🤖 AI scanning… ${i + 1} / ${A.length}`; }); });
        const shown = tags.filter(Boolean).length; // the label hangs under the thing (the drone hovers over it); older labels get small, so they don't pile up
        tags.forEach((d, i) => { if (!d) return; const s3 = scr(P(i)[0], P(i)[1], P(i)[2]), big = i === last || i >= shown - 2; d.style.visibility = s3.ok ? "visible" : "hidden";
          d.style.transform = `translate(${s3.x.toFixed(1)}px,${s3.y.toFixed(1)}px) translate(-50%,30%) scale(${big ? 1 : 0.72})`; d.style.opacity = String(out * (big ? 1 : 0.82)); d.style.zIndex = big ? "2" : "1";
          d.lastChild.style.display = big ? "block" : "none"; });
        if (hud) hud.style.opacity = String(out);
      }
      if (n === "rainbow") {
        drops.forEach((d) => { const show = e < 2.8; d.n.vis = show; if (!show) return; d.n.p = [d.x, 6.5 - (((e * 1.4 + d.ph) % 1) * 6.5), d.z]; d.n.alpha = 0.85 * clamp(e / 0.4) * clamp((2.8 - e) / 0.5); });
        const k = e < 1.8 ? 0 : back((e - 1.8) / 1.1) * out; rainbow.vis = k > 0.01; rainbow.s = [k, k, k];
        if (e > 1.8) { once("d", () => sfx("ding")); once("s", () => setTimeout(() => sfx("sparkle"), 400)); }
      }
      if (n === "relay") {
        const boost = clamp(e / 0.6) * clamp((cur.dur - 0.8 - e) / 0.8);
        kids.forEach((k, i) => { k.x += dt * boost * 0.55; k.big = 1 + 1.2 * boost;
          k.trail.forEach((s, j) => { const q = lap(k.u + t0fx(e) * k.v + k.x - (j + 1) * 0.018 * boost, k.r); s.vis = boost > 0.05; s.p = [q[0], 0.28, q[1]]; const z = 0.2 * (1 - j / 7) * boost; s.s = [z, z, z]; s.alpha = 1 - j / 7; }); });
        flags.forEach((f, i) => (f.jy = 0.35 * boost * Math.abs(Math.sin(e * 6 + i))));
        confetti.forEach((c) => { const y = c.y - c.v * Math.max(0, e - 0.3); c.n.vis = e > 0.3 && y > 0.05; c.n.p = [c.x + 0.3 * Math.sin(e * 2 + c.x), y, c.z]; c.n.r = [c.sp[0] * e, c.sp[1] * e, 0]; });
        if (e > cur.dur - 1.6) once("f", () => sfx("fanfare"));
      }
      if (n === "balloon") {
        const k = 1.9 * back(e / 0.8) * clamp((cur.dur - e) / 1.3), y = 0.2 + 0.5 * e + 0.03 * e * e; balloon.vis = k > 0.01;
        balloon.p = [1.3 * Math.sin(e * 0.55), y, 2.8]; balloon.s = [k, k, k]; balloon.r = [0, 18 * Math.sin(e * 0.8), 5 * Math.sin(e * 1.7)];
      }
      if (n === "bell") flags.forEach((f, i) => { const a = (e - 0.35 - i * 0.28) / 0.75, b = (e - 2.6 - i * 0.28) / 0.75, j = (x) => (x > 0 && x < 1 ? Math.sin(Math.PI * x) : 0);
        f.jy = 1.1 * Math.max(j(a), j(b)); f.spin = 360 * (inout(a) + inout(b)); });
    }
    let lastTap = 0;
    function tap(cx, cy) {
      const r = host.getBoundingClientRect(); sparkle(cx - r.left, cy - r.top); sfx("pop");
      const now = performance.now() / 1000;
      if (cur && now - cur.at < 2.2) return; // the surprise that is playing goes on; the next tap after it starts the next one
      if (now - lastTap < 0.25) return; lastTap = now;
      start(order[turnNo++ % order.length]);
    }

    const ctl = {
      ok: true, el: canvas, nodes: count,
      surprise(name) { if (opt.surprise) start(SHOWS[name] ? name : order[turnNo++ % order.length]); return ctl; },
      get yaw() { return yaw; }, set yaw(v) { yaw = +v || 0; vel = 0; },
      pause(on) { paused = !!on; return ctl; },
      setGate(n) { gate = +n || 0; return ctl; },
      onFrame(fn) { if (typeof fn === "function") subs.push(fn); return ctl; },
      project(n) { const f = flags[n - 1]; if (!f || !drawn || !showFlags) return { x: 0, y: 0, visible: false };
        const m = f.sign.W, x = m[12], y = m[13], z = m[14], w = vp[3] * x + vp[7] * y + vp[11] * z + vp[15], nx = (vp[0] * x + vp[4] * y + vp[8] * z + vp[12]) / w, ny = (vp[1] * x + vp[5] * y + vp[9] * z + vp[13]) / w;
        return { x: (nx * 0.5 + 0.5) * cssW, y: (0.5 - ny * 0.5) * cssH, visible: w > 0 && Math.abs(nx) <= 1 && Math.abs(ny) <= 1 }; },
      destroy() { if (dead) return; dead = true; subs.length = 0; cancelAnimationFrame(raf); R.lose(); canvas.remove(); if (layer) layer.remove(); }
    };
    raf = requestAnimationFrame(frame);
    Campus.last = ctl; // the model mounted last (for tests)
    return ctl;
  };
})();
