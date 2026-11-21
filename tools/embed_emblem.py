#!/usr/bin/env python3
"""Copy the school emblem into js/ollie3d.js as a data: address.

A page opened from a folder on the disk (the offline ZIP) may not read image files into WebGL,
so the 3D Ollie carries his own copy of the emblem.  Run this again whenever
english-quest/assets/img/tucheng-emblem.svg changes:

    python3 tools/embed_emblem.py
"""
import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent / "english-quest"
svg = (ROOT / "assets/img/tucheng-emblem.svg").read_bytes()
js = ROOT / "js/ollie3d.js"
src = js.read_text(encoding="utf-8")
block = (
    "/* EMBLEM-BEGIN — made by tools/embed_emblem.py from assets/img/tucheng-emblem.svg; do not edit by hand */\n"
    'window.TC.O3.EMBLEM = "data:image/svg+xml;base64,' + base64.b64encode(svg).decode("ascii") + '";\n'
    "/* EMBLEM-END */\n"
)
if "/* EMBLEM-BEGIN" in src:
    src = re.sub(r"/\* EMBLEM-BEGIN.*?/\* EMBLEM-END \*/\n", lambda m: block, src, flags=re.S)
else:
    src = src.rstrip("\n") + "\n" + block
js.write_text(src, encoding="utf-8")
print("embedded", len(svg), "bytes of SVG;", js.name, "is now", len(src.encode("utf-8")), "bytes")
