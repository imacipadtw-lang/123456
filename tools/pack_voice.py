#!/usr/bin/env python3
"""The second voice (a man's voice, ElevenLabs): build the list the pages load.

The clips live in english-quest/assets/audio/m/ai/ and m/el/, described by m-sentences.json and m-words.json
(same clip keys as ai-sentences.json / el-words.json). The pages do not load those two big manifests; they load
assets/audio/voice-m.js, a short list  clip key → file.

    python3 tools/pack_voice.py                 writes english-quest/assets/audio/voice-m.js   (key → "m/ai/x.mp3")
    python3 tools/pack_voice.py --packed FILE   also writes FILE: the same list with every clip built in as a data:
                                                address — ONE file instead of ~150, for the claude.ai backup, which
                                                holds at most 512 files (publish FILE as assets/audio/voice-m.js there)
"""
import base64, json, pathlib, sys

AUD = pathlib.Path(__file__).resolve().parent.parent / "english-quest" / "assets" / "audio"
voice, name = {}, ""
for man, first in (("m-words.json", "el-words.json"), ("m-sentences.json", "ai-sentences.json")):
    p = AUD / man
    if not p.exists(): continue
    m = json.loads(p.read_text(encoding="utf-8")); ref = json.loads((AUD / first).read_text(encoding="utf-8"))
    for k, v in m.items():
        if k not in ref: print("  (not in " + first + ", skipped: " + k + ")"); continue
        assert (AUD / v["file"]).exists(), v["file"]
        voice[k] = v["file"]; name = v.get("voice", name)
    miss = [k for k in ref if k not in m]
    if miss: print("  " + man + " has no clip for: " + ", ".join(miss) + "  → these lines keep the first voice")
head = "/* The second voice (" + (name or "not recorded yet") + ", ElevenLabs text-to-speech — an AI voice, not a human recording):\n   clip key → file. Made by tools/pack_voice.py from m-words.json and m-sentences.json; do not edit by hand. */\n"
(AUD / "voice-m.js").write_text(head + "window.TC_VOICE_M = " + json.dumps(voice, ensure_ascii=False, indent=0) + ";\n", encoding="utf-8")
print("voice-m.js:", len(voice), "clips,", name or "no voice yet")
if "--packed" in sys.argv:
    out = pathlib.Path(sys.argv[sys.argv.index("--packed") + 1])
    packed = {k: "data:audio/mpeg;base64," + base64.b64encode((AUD / f).read_bytes()).decode("ascii") for k, f in voice.items()}
    out.write_text(head + "window.TC_VOICE_M = " + json.dumps(packed) + ";\n", encoding="utf-8")
    print("packed:", out, round(out.stat().st_size / 1e6, 2), "MB")
