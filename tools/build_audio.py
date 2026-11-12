"""Turn the downloaded Commons originals into the game's clips and record where each came from.
For every word in STATE_DIR/chosen.json whose original is in STATE_DIR/raw/<sha1>.<ext> (SHA-1 already verified by
fetch_audio.py): convert to MP3 (mono, 44.1 kHz, 96 kbps), trim silence at both ends, bring the peak to -1.5 dB, and
add/replace the entry in english-quest/assets/audio/credits.json (+ credits.js).
usage: python3 tools/build_audio.py STATE_DIR english-quest/assets/audio [--drop word ...]"""
import json, os, re, subprocess, sys, time
S, OUT = sys.argv[1], sys.argv[2]
drop = sys.argv[sys.argv.index("--drop") + 1:] if "--drop" in sys.argv else []
chosen = json.load(open(S + "/chosen.json")); info = json.load(open(S + "/info.json")); acc = json.load(open(S + "/accents.json"))
man = json.load(open(OUT + "/credits.json"))
LURL = {"CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/", "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/", "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
        "CC BY 3.0": "https://creativecommons.org/licenses/by/3.0/", "CC BY 2.0": "https://creativecommons.org/licenses/by/2.0/", "CC0": "https://creativecommons.org/publicdomain/zero/1.0/", "Public domain": ""}
ACC = {"US": "US English", "UK": "British English", "RP": "British English (RP)", "London": "British English (London)", "Southern England": "British English (Southern England)", "England": "British English",
       "AU": "Australian English", "Australia": "Australian English", "NZ": "New Zealand English", "CA": "Canadian English", "Ireland": "Irish English", "Scotland": "Scottish English"}
added = []
for w, f in sorted(chosen.items()):
    rec = info.get(f)
    if not rec: continue
    src = f"{S}/raw/{rec['sha1']}{os.path.splitext(rec['url'].split('?')[0])[1].lower()}"
    if not os.path.exists(src): continue
    key = w.replace("letter-", "letter ")
    safe = re.sub(r"[^a-z0-9]+", "-", w.lower()).strip("-")
    mp3 = os.path.join(OUT, safe + ".mp3")
    tmp = mp3 + ".tmp.wav"
    trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-ac", "1", "-ar", "44100", "-af", trim, tmp], check=True)
    vd = subprocess.run(["ffmpeg", "-i", tmp, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr
    mx = float(re.search(r"max_volume: ([-\d.]+)", vd).group(1))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-af", f"volume={-1.5 - mx:.1f}dB", "-b:a", "96k", mp3], check=True); os.remove(tmp)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3], capture_output=True, text=True).stdout)
    title = rec["title"][5:]
    man[key] = dict(file=safe + ".mp3", source="File:" + title, page="https://commons.wikimedia.org/wiki/File:" + title.replace(" ", "_"), url=rec["url"].split("?")[0],
                    speaker=rec["artist"] or f"{rec['uploader']} (uploader; no author field on Commons)", uploader=rec["uploader"], licence=rec["licence"], licenceUrl=rec.get("licenceUrl") or LURL.get(rec["licence"], ""),
                    recorded=(rec.get("recorded") or rec["uploaded"])[:10], uploaded=rec["uploaded"], sha1=rec["sha1"],
                    accent=ACC.get(acc.get(w, "US"), acc.get(w, "US")) + " (label on the word's Wiktionary entry / Commons file name)",
                    downloaded=(rec.get("downloaded") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())), changes="converted to MP3 96 kbps mono, silence trimmed at both ends, peak level set to -1.5 dB", durationSec=round(dur, 2))
    added.append(key)
for w in drop:
    if w in man: os.remove(os.path.join(OUT, man[w]["file"])); del man[w]
json.dump(man, open(os.path.join(OUT, "credits.json"), "w"), ensure_ascii=False, indent=1)
open(os.path.join(OUT, "credits.js"), "w").write("/* Human pronunciation clips — generated from credits.json. Source: Wikimedia Commons, each file verified by SHA-1. */\nwindow.TC_AUDIO = " + json.dumps(man, ensure_ascii=False, indent=1) + ";\n")
print("clips now:", len(man), "| added/updated:", len(added), "| dropped:", [w for w in drop])
