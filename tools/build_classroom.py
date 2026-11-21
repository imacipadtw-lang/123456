#!/usr/bin/env python3
"""Classroom edition: ONE self-contained HTML file per classroom.

Each file holds everything its screen needs — program, styles, fonts, the school emblem and every sound clip — so it
runs from the classroom computer by a double-click, with no network, no installation and no folder of files to lose.
A gate's file carries only THAT gate's questions (the other gates keep just their names and colours), so one file
that gets out does not give the other gates away.

    python3 tools/build_classroom.py <output dir>

Writes  gate1-….html … gate6-….html, final-gate.html, opening-show.html, a START-….bat for each (full screen in Edge
or Chrome on Windows) and a read-me. Nothing is written into the repository.
"""
import base64, json, pathlib, re, subprocess, sys, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / "english-quest"
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "classroom").resolve()
OUT.mkdir(parents=True, exist_ok=True)
STAMP = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
COMMIT = subprocess.run(["git", "-C", str(ROOT), "rev-parse", "--short", "HEAD"], capture_output=True, text=True).stdout.strip()

def read(rel): return (APP / rel).read_text(encoding="utf-8")
def data_uri(rel, mime): return "data:" + mime + ";base64," + base64.b64encode((APP / rel).read_bytes()).decode("ascii")
def script(code): return "<script>" + code.replace("</script", "<\\/script") + "</script>"

EMB = data_uri("assets/img/tucheng-emblem.svg", "image/svg+xml")

# styles with the three font files built in
css = read("css/core.css")
css = re.sub(r"url\(\.\./fonts/([^)]+\.woff2)\)", lambda m: "url(" + data_uri("fonts/" + m.group(1), "font/woff2") + ")", css)
assert "../fonts/" not in css

def manifest(rel):
    """the clip list of a manifest script (window.X = {...};) as (variable name, dict)"""
    src = read(rel); m = re.search(r"window\.(\w+)\s*=\s*", src)
    return m.group(1), json.loads(src[m.end():].rstrip().rstrip(";"))

# every ElevenLabs clip (both voices) goes into every file: no line can ever fall back to a computer voice
sounds, small = {}, {}
for rel in ("assets/audio/el-words.js", "assets/audio/ai-sentences.js"):
    var, man = manifest(rel)
    for k, v in man.items(): sounds[v["file"]] = data_uri("assets/audio/" + v["file"], "audio/mpeg")
    small[rel] = "window." + var + " = " + json.dumps({k: {"file": v["file"], "text": v.get("text", ""), "ai": True, "voice": v.get("voice", "")} for k, v in man.items()}, ensure_ascii=False) + ";"
VOICE_M = APP / "assets/audio/voice-m.js"   # the second (male) voice: clip key → file
if VOICE_M.exists():
    var, man = manifest("assets/audio/voice-m.js")
    for k, f in man.items(): sounds[f] = data_uri("assets/audio/" + f, "audio/mpeg")
    small["assets/audio/voice-m.js"] = "window." + var + " = " + json.dumps(man, ensure_ascii=False) + ";"
small["assets/audio/credits.js"] = "window.TC_AUDIO = {}; /* classroom edition: the Wikimedia recordings (a setting of the full version) are left out */"
SOUND_JS = "window.TC_AUDIO_DATA = " + json.dumps(sounds) + ";"

def content_for(gate):
    """js/content.js with the question lists of the other gates removed (names, colours and cities stay)"""
    js = r"""
      const fs = require("fs"); global.window = global; eval(fs.readFileSync(process.argv[1], "utf8"));
      const keep = +process.argv[2], C = TC_CONTENT;
      for (const n of Object.keys(C.gates)) if (+n !== keep) for (const k of ["scenes", "qa", "finale", "actions", "quiet", "wake", "words", "lines", "pages", "ending"]) delete C.gates[n][k];
      for (const part of ["hunt", "sentences"]) for (const n of Object.keys(C[part] || {})) if (+n !== keep) delete C[part][n];
      process.stdout.write("window.TC_SCHOOL = " + JSON.stringify(TC_SCHOOL) + ";\nwindow.TC_CONTENT = " + JSON.stringify(C) + ";\nwindow.TC_SCRIPT = " + TC_SCRIPT.toString() + ";\n");
    """
    return subprocess.run(["node", "-e", js, str(APP / "js/content.js"), str(gate)], capture_output=True, text=True, check=True).stdout

def build(page, gate, title):
    html = read(page)
    game = None
    if gate:
        key = json.loads(subprocess.run(["node", "-e", "global.window=global;eval(require('fs').readFileSync(process.argv[1],'utf8'));process.stdout.write(JSON.stringify(TC_CONTENT.gates[process.argv[2]].key))", str(APP / "js/content.js"), str(gate)], capture_output=True, text=True, check=True).stdout)
        game = next(p.name for p in sorted((APP / "js/games").glob("g%d-*.js" % gate)))
    def one(m):
        src = m.group(1)
        if src == "js/content.js": return script(content_for(gate))
        if src in small: return script(small[src]) + (script(SOUND_JS) if src == "assets/audio/ai-sentences.js" else "")
        if src.startswith("js/games/"): return script(read(src)) if src == "js/games/" + game else ""
        return script(read(src))
    html, n = re.subn(r'<script src="([^"]+)"></script>', one, html)
    if VOICE_M.exists() and "TC_VOICE_M" not in html:
        html = html.replace(script(SOUND_JS), script(small["assets/audio/voice-m.js"]) + script(SOUND_JS), 1)
    html = re.sub(r'<link rel="stylesheet" href="css/core\.css">', lambda m: "<style>" + css + "</style>", html)
    html = re.sub(r'<link rel="icon"[^>]*>', "", html)
    html = re.sub(r'<script>if \("serviceWorker" in navigator.*?</script>', "", html, flags=re.S)
    html = html.replace("assets/img/tucheng-emblem.svg", EMB)
    html = re.sub(r"<title>.*?</title>", lambda m: "<title>" + title + "</title>", html, count=1, flags=re.S)
    room = {"gate": gate or 0, "page": page, "built": STAMP, "commit": COMMIT}
    html = html.replace("<head>", "<head>\n<!-- 土城國小 English Day · classroom edition · " + title + " · built " + STAMP + " from " + COMMIT + " · one self-contained file: no network needed -->\n" + script("window.TC_CLASSROOM = " + json.dumps(room) + ";"), 1)
    left = re.findall(r'(?:src|href)="(?!data:|#|https?:)([^"]+\.(?:js|css|mp3|png|svg|woff2|html))"', html)
    assert n and not left, (page, left[:5])
    return html

GATES = json.loads(subprocess.run(["node", "-e", "global.window=global;eval(require('fs').readFileSync(process.argv[1],'utf8'));process.stdout.write(JSON.stringify(TC_CONTENT.gates))", str(APP / "js/content.js")], capture_output=True, text=True, check=True).stdout)
files = []
for g in range(1, 7):
    G = GATES[str(g)]; slug = re.sub(r"[^a-z0-9]+", "-", G["title"].lower()).strip("-")
    files.append(("gate%d-%s" % (g, slug), "station.html", g, "第 %d 關 %s %s · 土城國小英語日（教室版）" % (g, G["title"], G["zh"]), "第 %d 關 %s（%s）" % (g, G["zh"], G["genre"].split(" ")[0])))
files.append(("final-gate", "control.html", 0, "終點登機門 Final Gate · 土城國小英語日（教室版）", "終點登機門（排字母、領獎狀）"))
files.append(("opening-show", "opening.html", 0, "開場動畫 Opening Show · 土城國小英語日（教室版）", "開場動畫（集合時播放）"))

BAT = "@echo off\r\nrem Tucheng English Day - classroom edition: opens %s full screen (Edge, else Chrome, else the default browser).\r\nrem Close with Alt+F4.\r\nset \"F=%%~dp0%s\"\r\nstart \"\" msedge --kiosk \"%%F%%\" --edge-kiosk-type=fullscreen --no-first-run 2>nul && goto :eof\r\nstart \"\" chrome --kiosk \"%%F%%\" --no-first-run 2>nul && goto :eof\r\nstart \"\" \"%%F%%\"\r\n"
lines = []
for name, page, gate, title, zh in files:
    html = build(page, gate, title)
    (OUT / (name + ".html")).write_text(html, encoding="utf-8")
    (OUT / ("START-" + name + ".bat")).write_bytes((BAT % (name + ".html", name + ".html")).encode("ascii"))
    lines.append("  %-34s %s" % (name + ".html", zh))
    print("%-36s %5.1f MB" % (name + ".html", len(html.encode("utf-8")) / 1e6))

(OUT / "請先讀我-教室版.txt").write_text("""土城國小 運動會英語日 — 教室版（每間教室一個檔案，不用網路、不用安裝）

【這是什麼】
每一個 .html 檔就是一間教室要用的全部東西：程式、圖、立體歐力、校徽和所有聲音都在這一個檔案裡。
把檔案複製到那間教室的電腦，點兩下就能玩；當天沒有網路也沒關係。
每個闖關檔案只放「那一關」的題目，其他關的題目不在裡面。

%s

【怎麼用】
1. 把那間教室的 .html 檔（和同名的 START-….bat）複製到教室電腦的桌面。
2. 點兩下 START-….bat：會用 Edge（或 Chrome）全螢幕開啟。要關掉按 Alt+F4。
   ※ 如果 .bat 被學校電腦擋住，直接點兩下 .html 檔，再按 F11 全螢幕，效果一樣。
3. 開始畫面下方選年級（低年級／中年級／高年級），再按大大的 START。
4. 歐力只問問題，孩子自己先念；念完老師按「✓ 說得好」或 Enter。
   孩子不會念時，老師按「🔊 聽示範」，歐力才會念。
5. 每位孩子（家長可以陪同）只闖自己年級的六關，一共六張點數貼紙（10／20／30 points）。
   六關完成：點心 1 份＋飲料 1 瓶；總分超過 100 點：再多 1 份小點心。

【畫面】
每個畫面都排在一頁裡，不用往下捲；1920×1080、1366×768、1280×720 的螢幕都檢查過。
左上角的大校徽在遊戲中按一下，可以回到開始畫面（會先問一次）。

【不要外流】
這些檔案只放在教室電腦和老師的隨身碟就好，不需要放到網路上。活動結束後可以從教室電腦刪除。

【要列印的東西】
闖關小卡、關主一頁卡、活動手冊不在這裡，請用完整離線包（english-quest 資料夾）裡的
quest-card.html、teacher-cards.html、guide.html 列印。

製作時間：%s（版本 %s）
""" % ("【檔案】\n" + "\n".join(lines), STAMP, COMMIT), encoding="utf-8")
print("written to", OUT)
