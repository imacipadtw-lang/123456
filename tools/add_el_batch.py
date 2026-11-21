"""Like split_el.py, but ADDS the clips of the given batches to the existing manifest instead of rebuilding it
(use it for a few extra sentences when the raw files of the older batches are no longer at hand).
Cut ElevenLabs batch recordings (one sentence per pause) into one MP3 per sentence and write the AI-voice manifest.
usage: python3 tools/add_el_batch.py <batches.json> <raw dir> english-quest/assets/audio [subdir=ai] [manifest=ai-sentences] [jsVar=TC_AI_AUDIO]
(sentences: default arguments; single words: ... el el-words TC_EL_AUDIO). An entry of "s" may be [text, key] when the
manifest key differs from the spoken text ("Okay!" is stored under "ok").
batches.json: [{"id", "gen", "created", "url", "s": [sentence, ...]}] — each batch audio has exactly len(s)-1 long pauses."""
import json, os, re, subprocess, sys, hashlib, datetime
batches, raw, AUD = json.load(open(sys.argv[1])), sys.argv[2], sys.argv[3]
SUB = sys.argv[4] if len(sys.argv) > 4 else "ai"; MAN = sys.argv[5] if len(sys.argv) > 5 else "ai-sentences"; VAR = sys.argv[6] if len(sys.argv) > 6 else "TC_AI_AUDIO"
OUT = os.path.join(AUD, SUB); os.makedirs(OUT, exist_ok=True)
VOICE = {"name": "Bella - Professional, Bright, Warm", "id": "hpp4J3VqNfWAUOO0d1Us", "kind": "ElevenLabs premade voice", "accent": "American (ElevenLabs label: Standard American)"}
def key(t): return re.sub(r"[^a-z0-9' -]", "", t.lower().replace("’", "'")).strip()
def slug(t): return re.sub(r"[^a-z0-9]+", "-", t.lower().replace("'", "")).strip("-")
_mp = os.path.join(AUD, MAN + ".json")
man = json.load(open(_mp)) if os.path.exists(_mp) else {}  # keep every clip already in the manifest, add the new batches
now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
for b in batches:
    f = os.path.join(raw, b["id"] + ".mp3")
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "silencedetect=noise=-40dB:d=0.5", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    dur = float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", err).group(3)) + 60 * int(re.search(r"Duration: (\d+):(\d+)", err).group(2))
    gaps = [(s, e) for s, e in zip(st, en) if e < dur - 0.05]
    if len(gaps) != len(b["s"]) - 1: raise SystemExit(f"{b['id']}: {len(gaps)} pauses for {len(b['s'])} sentences")
    # speech i runs from the end of the pause before it to the start of the pause after it (padded 50 ms / 120 ms)
    starts = [0.0] + [e for s, e in gaps]; ends = [s for s, e in gaps] + [dur]
    if st and st[0] < 0.05: starts[0] = en[0]  # leading silence of the whole batch
    if st and en[-1] >= dur - 0.05: ends[-1] = st[-1]  # trailing silence of the whole batch
    cuts = None
    for i, t in enumerate(b["s"]):
        t, k0 = (t if isinstance(t, list) else [t, None])
        name = slug(k0 or t) + ".mp3"; dst = os.path.join(OUT, name)
        a0, a1 = max(0.0, starts[i] - 0.05), min(dur, ends[i] + 0.12)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f, "-ss", f"{a0:.3f}", "-to", f"{a1:.3f}", "-af", "afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse", "-ac", "1", "-ar", "44100", "-b:a", "96k", dst], check=True)
        # peak to -1.5 dB like the human clips
        pk = float(re.search(r"max_volume: (-?[\d.]+) dB", subprocess.run(["ffmpeg", "-hide_banner", "-i", dst, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr).group(1))
        tmp = dst + ".tmp.mp3"; subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", dst, "-af", f"volume={-1.5 - pk:.2f}dB", "-b:a", "96k", tmp], check=True); os.replace(tmp, dst)
        d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dst], capture_output=True, text=True).stdout.strip())
        man[k0 or key(t)] = {"file": SUB + "/" + name, "text": t, "ai": True, "source": "ElevenLabs text-to-speech — AI voice, NOT a human recording",
            "voice": VOICE["name"], "voiceId": VOICE["id"], "voiceKind": VOICE["kind"], "accent": VOICE["accent"], "model": "eleven_multilingual_v2",
            "generationId": b["gen"], "generated": b.get("created", ""), "downloaded": now,
            "licence": "ElevenLabs Starter (paid) plan output — see credits.html for the terms",
            "changes": "cut from a batch generation between its pauses (50 ms before, 120 ms after the speech, short fades), converted to MP3 96 kbps mono, peak level set to -1.5 dB",
            "sha1": hashlib.sha1(open(dst, "rb").read()).hexdigest(), "durationSec": round(d, 2)}
        print(f"{d:4.2f}s  {name:28s} {t}")
json.dump(man, open(os.path.join(AUD, MAN + ".json"), "w"), ensure_ascii=False, indent=1)
open(os.path.join(AUD, MAN + ".js"), "w").write("/* Clips made with ElevenLabs text-to-speech (AI voice, not human recordings) — generated from " + MAN + ".json. */\nwindow." + VAR + " = " + json.dumps(man, ensure_ascii=False, indent=1) + ";\n")
print(len(man), "clips")
