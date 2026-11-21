"""Replace one clip of an ElevenLabs manifest with a single-word retake: trim silence, peak -1.5 dB, MP3 96 kbps mono,
update file SHA-1, generation id and times.   usage: python3 tools/replace_el_clip.py <audio dir> <manifest base> <key> <retake.mp3> <generationId> <generated ISO>"""
import json, os, re, subprocess, sys, hashlib, datetime
AUD, MAN, key, src, gen, made = sys.argv[1:7]
man = json.load(open(os.path.join(AUD, MAN + ".json"))); e = man[key]; dst = os.path.join(AUD, e["file"])
af = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05:detection=peak,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12:detection=peak,areverse,afade=t=in:d=0.02"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", af, "-ac", "1", "-ar", "44100", "-b:a", "96k", dst], check=True)
pk = float(re.search(r"max_volume: (-?[\d.]+) dB", subprocess.run(["ffmpeg", "-hide_banner", "-i", dst, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr).group(1))
tmp = dst + ".tmp.mp3"; subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", dst, "-af", f"volume={-1.5 - pk:.2f}dB", "-b:a", "96k", tmp], check=True); os.replace(tmp, dst)
d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dst], capture_output=True, text=True).stdout.strip())
e.update({"generationId": gen, "generated": made, "downloaded": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
          "changes": "single-word retake (the batch take was not recognised reliably); silence trimmed, converted to MP3 96 kbps mono, peak level set to -1.5 dB",
          "sha1": hashlib.sha1(open(dst, "rb").read()).hexdigest(), "durationSec": round(d, 2)})
json.dump(man, open(os.path.join(AUD, MAN + ".json"), "w"), ensure_ascii=False, indent=1)
js = open(os.path.join(AUD, MAN + ".js")).read().split("window.", 1)
var = js[1].split(" =", 1)[0]
open(os.path.join(AUD, MAN + ".js"), "w").write(js[0] + "window." + var + " = " + json.dumps(man, ensure_ascii=False, indent=1) + ";\n")
print(key, e["file"], round(d, 2), "s")
