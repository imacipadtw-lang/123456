"""Machine check of the AI sentence clips: a speech recogniser (CMU PocketSphinx, US-English model) may answer with ANY
of the sentences; a clip passes when the answer is its own sentence. Also checks every clip's SHA-1 against the manifest.
usage: PYTHONPATH=<dir with pocketsphinx> python3 tools/verify_sentences.py english-quest/assets/audio"""
import json, os, re, subprocess, sys, tempfile, hashlib
from pocketsphinx import Decoder, get_model_path
AUD = sys.argv[1]; man = json.load(open(os.path.join(AUD, "ai-sentences.json"))); mp = get_model_path()
words = lambda t: re.sub(r"[^a-z' ]", " ", t.lower()).split()
gram = "#JSGF V1.0;\ngrammar s;\npublic <s> = " + " | ".join("( " + " ".join(words(v["text"])) + " )" for v in man.values()) + ";\n"
gf = tempfile.NamedTemporaryFile("w", suffix=".gram", delete=False); gf.write(gram); gf.close()
dec = Decoder(hmm=os.path.join(mp, "en-us", "en-us"), dict=os.path.join(mp, "en-us", "cmudict-en-us.dict"), jsgf=gf.name, loglevel="FATAL", samprate=16000)
ok, bad = 0, []
for k, v in man.items():
    f = os.path.join(AUD, v["file"]); assert hashlib.sha1(open(f, "rb").read()).hexdigest() == v["sha1"], f
    pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", f, "-af", "apad=pad_dur=0.3", "-ar", "16000", "-ac", "1", "-f", "s16le", "-"], capture_output=True).stdout
    dec.start_utt(); dec.process_raw(pcm, full_utt=True); dec.end_utt()
    heard = dec.hyp().hypstr if dec.hyp() else ""
    if heard.split() == words(v["text"]): ok += 1
    else: bad.append(f"{v['text']} (heard: {heard or '—'})")
print(f"checked {len(man)} sentence clips: {ok} recognised as their own sentence"); print("second look needed:", "; ".join(bad) or "none")
