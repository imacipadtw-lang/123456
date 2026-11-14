"""Second, independent look at the pronunciation clips: decode the ORIGINAL Commons files (untouched by our conversion)
with the same recogniser and full-vocabulary grammar as verify_audio.py.
usage: PYTHONPATH=<pocketsphinx dir> python3 tools/verify_originals.py english-quest/assets/audio ORIGINALS_JSON
  ORIGINALS_JSON maps word -> path of the original file (built from the download folders)."""
import json, os, re, subprocess, sys, tempfile
from pocketsphinx import Decoder, get_model_path
AUD, ORIG = sys.argv[1], json.load(open(sys.argv[2]))
man = json.load(open(os.path.join(AUD, "credits.json"))); mp = get_model_path()
dic = {re.sub(r"\(\d+\)$", "", l.split()[0]) for l in open(os.path.join(mp, "en-us", "cmudict-en-us.dict"))}
HOMO = {"two": {"to", "too"}, "four": {"for"}, "eight": {"ate"}, "one": {"won"}, "no": {"know"}, "i": {"eye"}, "hi": {"high"}, "your": {"you're"}, "it's": {"its"}}
vocab = [w for w in sorted(man) if all(p in dic for p in w.replace("-", " ").split())]
gf = tempfile.NamedTemporaryFile("w", suffix=".gram", delete=False); gf.write("#JSGF V1.0;\ngrammar w;\npublic <w> = " + " | ".join(w.replace("-", " ") for w in vocab) + ";\n"); gf.close()
dec = Decoder(hmm=os.path.join(mp, "en-us", "en-us"), dict=os.path.join(mp, "en-us", "cmudict-en-us.dict"), jsgf=gf.name, loglevel="FATAL", samprate=16000)
ok, bad, none = [], [], []
for w in vocab:
    src = ORIG.get(w)
    if not src or not os.path.exists(src): none.append(w); continue
    exp = w.replace("-", " "); heard = []
    for af in ("anull", "volume=0.5", "volume=2,alimiter", "apad=pad_dur=0.3"):
        raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", src, "-af", af, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
        dec.start_utt(); dec.process_raw(raw, False, True); dec.end_utt()
        hyp = dec.hyp().hypstr if dec.hyp() else ""; heard.append(hyp)
        if hyp == exp or hyp in HOMO.get(exp, ()): break
    else: bad.append((w, "/".join(dict.fromkeys(heard)))); continue
    ok.append(w)
print(f"originals checked: {len(ok) + len(bad)} | recognised as the expected word: {len(ok)}")
print("not recognised:", ", ".join(f"{w} (heard: {h or 'nothing'})" for w, h in bad) or "none")
print("no original on disk:", " ".join(none) or "none")
json.dump({"ok": ok, "bad": bad, "none": none}, open(sys.argv[2] + ".result.json", "w"))
