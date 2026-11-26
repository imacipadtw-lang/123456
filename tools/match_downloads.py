"""Files fetched through a web-fetch helper arrive without names. Identify each by its SHA-1 (as published by Commons)
and copy it to STATE_DIR/raw/<sha1>.<ext>; print which chosen words are still missing.
usage: python3 tools/match_downloads.py STATE_DIR DIR_WITH_BIN_FILES"""
import glob, hashlib, json, os, shutil, sys, time
S, D = sys.argv[1], sys.argv[2]
chosen = json.load(open(S + "/chosen.json")); info = json.load(open(S + "/info.json"))
want = {info[f]["sha1"]: f for f in chosen.values() if info.get(f)}
os.makedirs(S + "/raw", exist_ok=True); n = 0
for p in glob.glob(os.path.join(D, "webfetch-*.bin")):
    h = hashlib.sha1(open(p, "rb").read()).hexdigest()
    if h in want:
        rec = info[want[h]]; out = f"{S}/raw/{h}{os.path.splitext(rec['url'].split('?')[0])[1].lower()}"
        if not os.path.exists(out):
            shutil.copy(p, out); rec["downloaded"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(os.path.getmtime(p))); n += 1
json.dump(info, open(S + "/info.json", "w"), ensure_ascii=False, indent=0)
have = {os.path.basename(x).split(".")[0] for x in glob.glob(S + "/raw/*")}
miss = sorted(w for w, f in chosen.items() if info[f]["sha1"] not in have)
print("newly matched", n, "| have", len(chosen) - len(miss), "/", len(chosen), "| missing:", " ".join(miss))
for w in miss: print("  ", info[chosen[w]]["url"].split("?")[0].replace("https://upload.wikimedia.org/wikipedia/commons/", ""))
