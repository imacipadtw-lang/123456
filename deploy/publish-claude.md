# Backup copy on claude.ai (備用網址)

Every screen has two addresses (see `english-quest/js/links.js`):

- **Main — GitHub Pages:** https://imacipadtw-lang.github.io/123456/english-quest/ (published automatically by `.github/workflows/pages.yml` on every push, to the `gh-pages` branch)
- **Backup — claude.ai Artifact:** https://claude.ai/artifact/EGDBXGnMnVbkMtdUMgWxjn (`#gate-1` … `#gate-6`, `#final`, `#opening`)

To update the backup, a Claude session publishes `deploy/claude-launch.html` with the Artifact tool to the URL above, with
`root: "english-quest"` and `files` = every tracked file under `english-quest/` except `index.html` (the launcher replaces it),
`README.md`, `sw.js` and `apps-script/` (list them with `python3 deploy/claude_files.py`). The backup has no microphone, camera, print or offline
(the claude.ai frame does not allow them), so teachers press ✓/Enter after a child speaks.

One version of the artifact holds at most 512 files (the page counts as one), so `README.md` and `sw.js` are not
published there. After the second 2026-11-21 publish (the nine-unit question bank and the 3D Ollie) the backup holds
about 390 files: `node tools/prune_audio.js --apply` removed the ElevenLabs clips no screen says any more, and they were
passed as `null` in the `files` map. Before adding many new files, run that tool again and remove what it lists. Publish only what changed since the last publish
(`git diff --name-only <last published commit> HEAD -- english-quest`); if another session published in between, list
the published files first (`action: "list", scope: "files"`) and compare their hashes with that session's commit.
