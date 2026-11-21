"""Find human pronunciation recordings on English Wiktionary / Wikimedia Commons for a word list, record provenance
(speaker, licence, dates, SHA-1), and download the original files.  Resumable; polite to the Wikimedia rate limits.

usage: python3 tools/fetch_audio.py STATE_DIR words.txt [meta|download]
  STATE_DIR/wikt.json   word -> [[file, label], ...]   (audio templates in the English section of the entry)
  STATE_DIR/info.json   file title -> Commons imageinfo (url, sha1, uploader, timestamp, extmetadata)
  STATE_DIR/raw/<sha1>.<ext>   downloaded originals (verified against the Commons SHA-1)
"""
import json, os, re, sys, time, urllib.parse, urllib.request, urllib.error, hashlib, html
UA = "SchoolEnglishGames/1.0 (educational, non-commercial; Wikimedia Commons pronunciation audio)"
S = sys.argv[1]; WORDS = [l.strip() for l in open(sys.argv[2]) if l.strip()]; MODE = sys.argv[3] if len(sys.argv) > 3 else "meta"
os.makedirs(S + "/raw", exist_ok=True)
def load(n): return json.load(open(f"{S}/{n}")) if os.path.exists(f"{S}/{n}") else {}
def save(n, o): json.dump(o, open(f"{S}/{n}.tmp", "w"), ensure_ascii=False, indent=0); os.replace(f"{S}/{n}.tmp", f"{S}/{n}")
PAUSE = [6.0]
def get(url, tries=40):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60) as r:
                data = r.read(); time.sleep(PAUSE[0]); return data
        except urllib.error.HTTPError as e:
            if e.code == 404: return None
            wait = int(e.headers.get("Retry-After") or 0) + 5 if e.code == 429 else 20
            PAUSE[0] = min(PAUSE[0] * 1.3, 30); print(f"  .. HTTP {e.code}; wait {wait}s (pause now {PAUSE[0]:.0f}s)", flush=True); time.sleep(wait)
        except Exception as e:
            print("  ..", type(e).__name__, e, flush=True); time.sleep(15)
    raise SystemExit("gave up: " + url)
def api(host, **p):
    p.update(format="json", formatversion="2")
    return json.loads(get(f"https://{host}/w/api.php?" + urllib.parse.urlencode(p)))
def pages_for(w):
    if w.startswith("letter-"): c = w[-1]; return [c, c.upper()]
    return list(dict.fromkeys([w, w.capitalize(), w.title(), w.upper()]))
def norm_file(f): f = f.strip().replace("_", " "); return f[0].upper() + f[1:] if f else f

wikt, info = load("wikt.json"), load("info.json")
if MODE == "meta":
    # 1. Wiktionary: which audio files do the English entries list, and with what accent label?
    todo = [w for w in WORDS if w not in wikt]
    titles = sorted({t for w in todo for t in pages_for(w)})
    text = {}
    for i in range(0, len(titles), 50):
        r = api("en.wiktionary.org", action="query", prop="revisions", rvprop="content", rvslots="main", titles="|".join(titles[i:i + 50]))
        for pg in r["query"]["pages"]:
            if not pg.get("missing") and pg.get("revisions"): text[pg["title"]] = pg["revisions"][0]["slots"]["main"]["content"]
        print(f"wiktionary {i + 50}/{len(titles)}", flush=True)
    for w in todo:
        found = []
        for t in pages_for(w):
            m = re.search(r"^==English==\s*$(.*?)(?=^==[^=]|\Z)", text.get(t, ""), re.S | re.M)
            if not m: continue
            for a in re.finditer(r"\{\{\s*audio\s*\|\s*en\s*\|([^{}]*)\}\}", m.group(1), re.I):
                parts = [x.strip() for x in a.group(1).split("|")]
                found.append([norm_file(parts[0]), " ".join(parts[1:]), t])
        wikt[w] = found
    save("wikt.json", wikt)
    # 2. Commons: details of every candidate file (+ the conventional En-us-<word>.ogg name even if Wiktionary doesn't list it)
    cands = set()
    for w in WORDS:
        for f, _, _ in wikt.get(w, []): cands.add(f)
        if not w.startswith("letter-"):
            for v in pages_for(w)[:2]: cands.add(f"En-us-{v}.ogg")
    todo = sorted(c for c in cands if c not in info)
    for i in range(0, len(todo), 50):
        r = api("commons.wikimedia.org", action="query", titles="|".join("File:" + c for c in todo[i:i + 50]), prop="imageinfo", iiprop="url|sha1|user|timestamp|size|mime|extmetadata")
        back = {n["to"]: n["from"] for n in r["query"].get("normalized", [])}
        for pg in r["query"]["pages"]:
            t = back.get(pg["title"], pg["title"])[5:]
            if pg.get("missing") or not pg.get("imageinfo"): info[t] = None; info[pg["title"][5:]] = None; continue
            ii = pg["imageinfo"][0]; em = ii.get("extmetadata", {})
            g = lambda k: html.unescape(re.sub(r"<[^>]+>", "", (em.get(k) or {}).get("value", ""))).strip()
            rec = dict(title=pg["title"], url=ii["url"], sha1=ii["sha1"], uploader=ii["user"], uploaded=ii["timestamp"], mime=ii.get("mime"), size=ii.get("size"),
                       artist=g("Artist"), licence=g("LicenseShortName"), licenceUrl=g("LicenseUrl"), recorded=g("DateTimeOriginal"), desc=g("ImageDescription")[:300], cats=g("Categories")[:400])
            info[t] = rec; info[pg["title"][5:]] = rec
        save("info.json", info); print(f"commons {i + 50}/{len(todo)}", flush=True)
    have = sum(1 for w in WORDS if any(info.get(f) for f, _, _ in wikt.get(w, [])) or any(info.get(f"En-us-{v}.ogg") for v in pages_for(w)[:2]))
    print("words with at least one Commons recording:", have, "/", len(WORDS))
else:
    # download the files named in STATE_DIR/chosen.json  (word -> file title)
    chosen = load("chosen.json"); n = 0
    for w, f in chosen.items():
        rec = info.get(f)
        if not rec: print("no info for", w, f); continue
        ext = os.path.splitext(rec["url"])[1].lower(); out = f"{S}/raw/{rec['sha1']}{ext}"
        if os.path.exists(out): n += 1; continue
        data = get(rec["url"])
        if data is None or hashlib.sha1(data).hexdigest() != rec["sha1"]: print("SHA-1 MISMATCH / missing", w, f, flush=True); continue
        open(out, "wb").write(data); n += 1
        rec["downloaded"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()); save("info.json", info)
        print(f"ok {n}/{len(chosen)} {w} <- {f}", flush=True)
    print("downloaded", n, "of", len(chosen))
