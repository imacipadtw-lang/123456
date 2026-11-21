"""Add single ElevenLabs clips (one generation = one sentence) to a manifest: trim silence, peak -1.5 dB, MP3 96 kbps mono.
usage: python3 tools/add_el_clip.py <audio dir> <manifest base> <subdir> <jsVar> <spec.json>
spec.json: [{"text": "Good job!", "src": "/path/raw.mp3", "gen": "<generation id>", "generated": "<ISO time>"}]   (key = lower-case text without punctuation)"""
import json, os, re, subprocess, sys, hashlib, datetime
AUD, MAN, SUB, VAR, spec = sys.argv[1:6]
mp = os.path.join(AUD, MAN + ".json"); man = json.load(open(mp)) if os.path.exists(mp) else {}
os.makedirs(os.path.join(AUD, SUB), exist_ok=True)
def key(t): return re.sub(r"[^a-z0-9' -]", "", t.lower().replace("’", "'")).strip()
def slug(t): return re.sub(r"[^a-z0-9]+", "-", t.lower().replace("'", "")).strip("-")
now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
base = next(iter(man.values()), {})
for it in json.load(open(spec)):
    name = slug(it["text"]) + ".mp3"; dst = os.path.join(AUD, SUB, name)
    af = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05:detection=peak,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12:detection=peak,areverse,afade=t=in:d=0.02"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", it["src"], "-af", af, "-ac", "1", "-ar", "44100", "-b:a", "96k", dst], check=True)
    pk = float(re.search(r"max_volume: (-?[\d.]+) dB", subprocess.run(["ffmpeg", "-hide_banner", "-i", dst, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr).group(1))
    tmp = dst + ".tmp.mp3"; subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", dst, "-af", f"volume={-1.5 - pk:.2f}dB", "-b:a", "96k", tmp], check=True); os.replace(tmp, dst)
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dst], capture_output=True, text=True).stdout.strip())
    man[key(it["text"])] = {"file": SUB + "/" + name, "text": it["text"], "ai": True, "source": "ElevenLabs text-to-speech — AI voice, NOT a human recording",
        "voice": "Bella - Professional, Bright, Warm", "voiceId": "hpp4J3VqNfWAUOO0d1Us", "voiceKind": "ElevenLabs premade voice", "accent": "American (ElevenLabs label: Standard American)",
        "model": "eleven_multilingual_v2", "generationId": it["gen"], "generated": it["generated"], "downloaded": now,
        "licence": "ElevenLabs Starter (paid) plan output — see credits.html for the terms",
        "changes": "single clip: silence trimmed, converted to MP3 96 kbps mono, peak level set to -1.5 dB",
        "sha1": hashlib.sha1(open(dst, "rb").read()).hexdigest(), "durationSec": round(d, 2)}
    print(key(it["text"]), name, round(d, 2), "s")
json.dump(man, open(mp, "w"), ensure_ascii=False, indent=1)
open(os.path.join(AUD, MAN + ".js"), "w").write("/* Clips made with ElevenLabs text-to-speech (AI voice, not human recordings) — generated from " + MAN + ".json. */\nwindow." + VAR + " = " + json.dumps(man, ensure_ascii=False, indent=1) + ";\n")
