"""Pick ONE human recording per word from the candidates found by fetch_audio.py.
Order of preference: a US-English recording listed on the word's Wiktionary entry (plain form, not a
"stressed"/"past"/phrase variant) → the conventional Commons name En-us-<word>.ogg → another native accent
listed on Wiktionary (UK/AU/CA/NZ…, recorded as such).  Unlabelled recordings are never used.
usage: python3 tools/choose_audio.py STATE_DIR words.txt   → STATE_DIR/chosen.json (+ prints what is still missing)"""
import json, re, sys
S = sys.argv[1]; WORDS = [l.strip() for l in open(sys.argv[2]) if l.strip()]
wikt = json.load(open(S + "/wikt.json")); info = json.load(open(S + "/info.json"))
OVERRIDE = {"a": "En-us-a.ogg", "an": "En-us-an.ogg", "the": "En-us-the-unstressed.ogg", "i": "En-us-I.ogg", "ok": "En-us-okay.ogg", "you": "En-us-you.ogg", "your": "En-us-your.ogg", "do": "En-us-do-verb.ogg"}
US = re.compile(r"\b(US|GA|GenAm|General American|American|California|Midwestern US|Northern California|Texas|New York|Canada)\b", re.I)
NATIVE = re.compile(r"\b(UK|RP|London|Southern England|England|AU|Australia|NZ|New Zealand|Ireland|Scotland|CA)\b", re.I)
BAD = re.compile(r"\b(text=|pos=|stressed|unstressed|past|plural|noun|verb|adjective|IPA=\[)", re.I)
def pages(w): return [w, w.capitalize()]
chosen, missing, accents = {}, [], {}
for w in WORDS:
    cands = [(f, l) for f, l, _ in wikt.get(w, []) if info.get(f)]
    pick = None
    if w in OVERRIDE and info.get(OVERRIDE[w]): pick = (OVERRIDE[w], "US")
    if not pick:
        us = [(f, l) for f, l in cands if (US.search(l) or f.lower().startswith("en-us-")) and not BAD.search(l) and not re.search(r"stressed|past|-noun|-verb|-adjective|-music|-letter", f, re.I)]
        us.sort(key=lambda x: (0 if x[0].lower().startswith("en-us-") else 1, len(x[0])))
        if us: pick = (us[0][0], "US")
    if not pick and not w.startswith("letter-"):
        for v in pages(w):
            f = f"En-us-{v}.ogg"
            if info.get(f): pick = (f, "US"); break
    if not pick:
        nat = [(f, l) for f, l in cands if NATIVE.search(l) and not BAD.search(l)]
        if nat: pick = (nat[0][0], NATIVE.search(nat[0][1]).group(1))
    if pick: chosen[w] = pick[0]; accents[w] = pick[1]
    else: missing.append(w)
json.dump(chosen, open(S + "/chosen.json", "w"), ensure_ascii=False, indent=0)
json.dump(accents, open(S + "/accents.json", "w"), ensure_ascii=False, indent=0)
print("chosen", len(chosen), "| non-US:", {w: a for w, a in accents.items() if a != "US"})
print("missing", len(missing), ":", " ".join(missing))
