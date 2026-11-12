"""Independent machine check that each pronunciation clip really contains its word.
Every clip is decoded by a speech recogniser (CMU PocketSphinx, US-English acoustic model) that may answer with ANY
word of the project's vocabulary; the clip passes when the recogniser's answer is the expected word (or a listed
homophone).  Clips that do not pass are listed for a second look — they are not necessarily wrong.
usage: PYTHONPATH=<dir with pocketsphinx> python3 tools/verify_audio.py english-quest/assets/audio [word ...]"""
import json, os, subprocess, sys, tempfile, re
from pocketsphinx import Decoder, get_model_path
AUD = sys.argv[1]; only = set(sys.argv[2:])
man = json.load(open(os.path.join(AUD, "credits.json")))
mp = get_model_path()
dic = {}
for l in open(os.path.join(mp, "en-us", "cmudict-en-us.dict")):
    w, *ph = l.split(); dic.setdefault(re.sub(r"\(\d+\)$", "", w), []).append(" ".join(ph))
HOMO = {"two": {"to", "too"}, "four": {"for"}, "eight": {"ate"}, "one": {"won"}, "no": {"know"}, "i": {"eye"}, "eyes": {"i's"}, "hi": {"high"}, "we": {"wee"}, "bear": {"bare"}, "great": {"grate"}, "new": {"knew"}, "red": {"read"}, "blue": {"blew"}, "your": {"you're"}, "it's": {"its"}, "feet": {"feat"}, "nose": {"knows"}, "son": {"sun"}}
words = sorted(man)
vocab = [w for w in words if all(p in dic for p in w.replace("-", " ").split())]
skipped = [w for w in words if w not in vocab]
gram = "#JSGF V1.0;\ngrammar w;\npublic <w> = " + " | ".join(w.replace("-", " ") for w in vocab) + ";\n"
gf = tempfile.NamedTemporaryFile("w", suffix=".gram", delete=False); gf.write(gram); gf.close()
dec = Decoder(hmm=os.path.join(mp, "en-us", "en-us"), dict=os.path.join(mp, "en-us", "cmudict-en-us.dict"), jsgf=gf.name, loglevel="FATAL", bestpath=True, samprate=16000)
ok, bad = [], []
for w in vocab:
    if only and w not in only: continue
    exp = w.replace("-", " "); heard = []
    # the recogniser is sensitive to level and leading silence, so each clip is tried three ways; one match is a pass
    for af in ("apad=pad_dur=0.25,adelay=250", "apad=pad_dur=0.5,adelay=500,volume=0.5", "apad=pad_dur=0.4,adelay=400,volume=0.25"):
        raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", os.path.join(AUD, man[w]["file"]), "-af", af, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
        dec.start_utt(); dec.process_raw(raw, False, True); dec.end_utt()
        hyp = dec.hyp().hypstr if dec.hyp() else ""; heard.append(hyp)
        if hyp == exp or hyp in HOMO.get(exp, ()) or exp in HOMO.get(hyp, ()): break
    else:
        bad.append((w, "/".join(dict.fromkeys(heard)))); continue
    ok.append((w, hyp))
print(f"checked {len(ok) + len(bad)} clips against a {len(vocab)}-word vocabulary: {len(ok)} recognised as the expected word")
print("second look needed:", ", ".join(f"{w} (heard: {h or 'nothing'})" for w, h in bad) or "none")
if skipped: print("not checkable (word not in the recogniser's dictionary):", ", ".join(skipped))
