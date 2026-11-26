"""Print the `files` map (JSON) for publishing english-quest/ as the claude.ai backup page."""
import json, subprocess
names = subprocess.run(["git", "ls-files", "english-quest"], capture_output=True, text=True, check=True).stdout.split()
skip = {"index.html", "README.md", "sw.js"}
m = {}
for n in names:
    p = n[len("english-quest/"):]
    if p in skip or p.startswith("apps-script/"):
        continue
    m[p] = {"from": p, "contentType": "text/plain"} if p.endswith(".LICENSE") else p
print(json.dumps(m, ensure_ascii=False))
