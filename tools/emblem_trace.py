"""Redraws the school emblem (土城校徽) as a resolution-independent vector with a 3D badge finish.
The shapes are traced from the school's own emblem image (colour by colour), so the design is unchanged;
only the finish (bevelled rim, shading, gloss) is added.   usage: python3 tools/emblem_trace.py emblem.jpg out.svg"""
import sys, cv2, numpy as np
src, out = sys.argv[1], sys.argv[2]
K = 4
im = cv2.imread(src); H0, W0 = im.shape[:2]
big = cv2.GaussianBlur(cv2.resize(im, (W0 * K, H0 * K), interpolation=cv2.INTER_CUBIC), (0, 0), 1.6)
PAL = {"white": (255, 255, 255), "beige": (198, 205, 169), "sky": (123, 251, 213), "dk": (66, 146, 4), "lt": (149, 238, 112), "black": (4, 12, 4), "red": (160, 8, 4), "roof": (119, 22, 3)}
names = list(PAL); cols = np.array([PAL[n][::-1] for n in names], np.float32)
lab = np.argmin(((big[:, :, None, :].astype(np.float32) - cols[None, None]) ** 2).sum(-1), axis=2)
lab[lab == names.index("roof")] = names.index("red")
# explicit rules where blended edge pixels would otherwise fall into the wrong colour
B, G, Rr = [big[:, :, i].astype(np.int32) for i in range(3)]
luma = 0.299 * Rr + 0.587 * G + 0.114 * B
lab[(Rr - G > 55) & (Rr > 90)] = names.index("red")
lab[(luma < 62) & (Rr - G <= 55)] = names.index("black")
mn = np.minimum(np.minimum(Rr, G), B)
lab[mn > 188] = names.index("white")
inner = np.zeros(lab.shape, bool); inner[int(H0 * K * 0.25):int(H0 * K * 0.53), int(W0 * K * 0.22):int(W0 * K * 0.80)] = True
lab[inner & (mn > 150)] = names.index("white")   # the thin white line inside the house outline
m = lambda n: (lab == names.index(n)).astype(np.uint8) * 255
# the emblem disc = everything that is not the white paper outside it (largest non-white blob, filled)
nonwhite = cv2.morphologyEx(255 - m("white"), cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
cs, _ = cv2.findContours(nonwhite, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
disc = max(cs, key=cv2.contourArea); (cx, cy), (ea, eb), ang = cv2.fitEllipse(disc)
print("disc centre", round(cx / K, 1), round(cy / K, 1), "axes", round(ea / K, 1), round(eb / K, 1), "angle", round(ang, 1))
x0, y0, w0, h0 = cv2.boundingRect(disc); cx, cy, rx, ry = x0 + w0 / 2, y0 + h0 / 2, w0 / 2, h0 / 2
R = 440.0  # radius of the emblem face in the 1000x1000 output
def tx(p): return ((p[0] - cx) / rx * R + 500, (p[1] - cy) / ry * R + 500)
def clean(mask, k): return cv2.morphologyEx(cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((k, k), np.uint8)), cv2.MORPH_CLOSE, np.ones((k, k), np.uint8))
def paths(mask, eps, smooth, min_area=600, grow=0):
    if grow: mask = cv2.dilate(mask, np.ones((grow, grow), np.uint8))
    cs, hier = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE); d = []
    for c in cs:
        if cv2.contourArea(c) < min_area: continue
        pts = [tx(p[0]) for p in cv2.approxPolyDP(c, eps, True)]
        if len(pts) < 3: continue
        if smooth:  # closed quadratic spline through edge midpoints: smooth brush-stroke outlines
            mid = lambda a, b: ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
            s = "M%.1f %.1f" % mid(pts[-1], pts[0])
            for i, p in enumerate(pts): s += "Q%.1f %.1f %.1f %.1f" % (p + mid(p, pts[(i + 1) % len(pts)]))
            d.append(s + "Z")
        else: d.append("M" + "L".join("%.1f %.1f" % p for p in pts) + "Z")
    return "".join(d)
horizon = None
ys = np.where(m("black")[:, int(cx - rx * 0.8)] > 0)[0]; ys = ys[(ys > cy) & (ys < cy + ry * 0.2)]
hy = tx((0, ys.mean()))[1] if len(ys) else 520
upper = np.zeros_like(lab, np.uint8); upper[: int(ys.max() if len(ys) else cy) + 2] = 255
# the house: flood-fill its green interior (bounded by the white inner line), then rebuild it from clean polygons
whiteish = (G - B < 55) & (mn > 110)   # white line (and its blends with dark green), but not the light-green strip
free = ((lab != names.index("black")) & ~whiteish).astype(np.uint8)
ffm = np.zeros((free.shape[0] + 2, free.shape[1] + 2), np.uint8)
canvas = free.copy(); cv2.floodFill(canvas, ffm, (int(W0 * K * 0.46), int(H0 * K * 0.46)), 2)
inner_m = cv2.morphologyEx((canvas == 2).astype(np.uint8) * 255, cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8))
print("house interior px", int((inner_m > 0).sum()))
house_white = cv2.dilate(inner_m, np.ones((27, 27), np.uint8))
strip = cv2.morphologyEx(m("lt") & cv2.erode(inner_m, np.ones((9, 9), np.uint8)), cv2.MORPH_OPEN, np.ones((31, 31), np.uint8))
not_house = 255 - house_white
P = dict(
    h_white=paths(house_white, 3.0, False),
    h_in=paths(inner_m, 3.0, False),
    h_under=paths(cv2.dilate(house_white, np.ones((45, 45), np.uint8)) & upper, 3.0, False),
    h_strip=paths(cv2.fillConvexPoly(np.zeros_like(strip), cv2.convexHull(max(cv2.findContours(strip, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0], key=cv2.contourArea)), 255), 6.0, False, grow=9),
    dk=paths(clean(m("dk"), 9), 3.0, False, grow=15),
    lt=paths(clean(m("lt"), 9) & upper & not_house, 3.0, False, grow=5),
    roof=paths(clean(m("red"), 7) & upper, 2.5, False),
    red=paths(clean(m("red"), 5) & (255 - upper), 1.3, True, 200),
    black_top=paths(clean(m("black"), 5) & upper, 3.2, False, 300),
    black_txt=paths(clean(m("black"), 5) & (255 - upper), 1.2, True, 200),
)
for k, v in P.items(): print(k, len(v))
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" role="img" aria-label="南投縣草屯鎮土城國民小學校徽">
<defs>
<clipPath id="f"><circle cx="500" cy="500" r="{R}"/></clipPath>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9fff0"/><stop offset=".55" stop-color="#7bfbd5"/><stop offset="1" stop-color="#4fdcb8"/></linearGradient>
<linearGradient id="dk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5cb80c"/><stop offset=".5" stop-color="#429204"/><stop offset="1" stop-color="#2a6a00"/></linearGradient>
<linearGradient id="lt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c6ff9c"/><stop offset=".5" stop-color="#95ee70"/><stop offset="1" stop-color="#6fd04a"/></linearGradient>
<linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#aab58f"/><stop offset=".12" stop-color="#c6cda9"/><stop offset="1" stop-color="#d9dfc0"/></linearGradient>
<linearGradient id="rd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2281c"/><stop offset=".55" stop-color="#b30a05"/><stop offset="1" stop-color="#860300"/></linearGradient>
<linearGradient id="rf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b03a1c"/><stop offset="1" stop-color="#6a1202"/></linearGradient>
<linearGradient id="bk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262b26"/><stop offset=".35" stop-color="#0a0f0a"/><stop offset="1" stop-color="#000"/></linearGradient>
<linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff7cf"/><stop offset=".25" stop-color="#f3c64a"/><stop offset=".5" stop-color="#fff3b8"/><stop offset=".75" stop-color="#c8901a"/><stop offset="1" stop-color="#f6d56a"/></linearGradient>
<linearGradient id="rim2" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff7cf"/><stop offset=".5" stop-color="#b47a10"/><stop offset="1" stop-color="#ffe9a0"/></linearGradient>
<radialGradient id="dome" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#001a10" stop-opacity=".06"/><stop offset="1" stop-color="#001a10" stop-opacity=".34"/></radialGradient>
<linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur in="SourceAlpha" stdDeviation="14"/><feOffset dy="16"/><feComponentTransfer><feFuncA type="linear" slope=".45"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="up" x="-10%" y="-10%" width="120%" height="130%"><feGaussianBlur in="SourceAlpha" stdDeviation="3.5"/><feOffset dx="3" dy="7"/><feComponentTransfer><feFuncA type="linear" slope=".5"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<g filter="url(#sh)"><circle cx="500" cy="500" r="484" fill="url(#rim)"/><circle cx="500" cy="500" r="462" fill="url(#rim2)"/><circle cx="500" cy="500" r="447" fill="#16351f"/></g>
<g clip-path="url(#f)">
<rect x="0" y="0" width="1000" height="{hy:.1f}" fill="url(#sky)"/>
<rect x="0" y="{hy:.1f}" width="1000" height="{1000 - hy:.1f}" fill="url(#gr)"/>
<g filter="url(#up)"><path d="{P['dk']}" fill="url(#dk)"/><path d="{P['lt']}" fill="url(#lt)"/></g>
<path d="{P['roof']}" fill="url(#rf)"/>
<path d="{P['h_under']}" fill="#3a8404"/>
<path d="{P['h_white']}" fill="#fff"/>
<clipPath id="hc"><path d="{P['h_in']}"/></clipPath>
<path d="{P['h_in']}" fill="url(#dk)"/>
<g clip-path="url(#hc)"><path d="{P['h_strip']}" fill="url(#lt)"/><path d="{P['h_in']}" fill="none" stroke="#0b3d00" stroke-opacity=".35" stroke-width="7"/></g>
<path d="{P['black_top']}" fill="#081208"/>
<g filter="url(#up)"><path d="{P['red']}" fill="#5e0200" transform="translate(3 6)"/><path d="{P['red']}" fill="url(#rd)"/></g>
<g filter="url(#up)"><path d="{P['black_txt']}" fill="url(#bk)"/></g>
<circle cx="500" cy="500" r="{R}" fill="url(#dome)"/>
<path d="M120 420 A390 390 0 0 1 880 420 Q500 300 120 420Z" fill="url(#gloss)" opacity=".55"/>
</g>
<circle cx="500" cy="500" r="{R}" fill="none" stroke="#0b2413" stroke-width="5"/>
<circle cx="500" cy="500" r="473" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>
</svg>'''
open(out, "w").write(svg); print("svg bytes", len(svg))
