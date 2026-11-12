# Brief: adapt ONE game file to the simplified content

Project: `/home/user/123456/english-quest/` — a static HTML/JS site (no build step). Six classroom touch-screen English
games for an elementary school (Taiwan). `station.html?gate=N` loads `js/content.js`, `js/core.js`, `js/art.js`,
`js/puzzles.js`, the six `js/games/g*.js` files and `js/station.js`.

`js/content.js` was just rewritten (simpler questions, one-word answers, new fields). `js/core.js` and `js/station.js`
are already updated. **Your job: make your one game file work with the new content and the rules in
`/home/user/123456/tools/GAME-SPEC.md`** (read that file and `js/content.js` first, then your game file, then the parts of
`js/core.js` you need: `TC.ask`, `TC.speak`, `TC.model`, `TC.rounds`, and how `js/station.js` builds the `api` object).

Hard rules
- Edit ONLY the file(s) named in your task. Do not edit content.js, core.js, station.js, art.js, css/core.css or other games.
  If you believe one of them must change, do not change it — describe the exact change needed in your final report.
- Do not git commit, push, or run git commands that change state.
- Keep the game's look, touch interactions, sounds and "wow" moments; change the dialogue/logic, remove dead code for
  removed fields, and keep the code style (plain ES2019, 2-space indent, no dependencies).
- The picture of the answer must be large and clearly visible while the question is asked.
- Chinese UI strings stay in Traditional Chinese.

How to test (required before you report)
- Serve: `cd /home/user/123456/english-quest && python3 -m http.server PORT` (use the port given in your task; run it in the
  background).
- Playwright is installed globally (`require('playwright')`, `chromium.launch({ args: ['--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream'] })`). Put test scripts in the scratch directory given in your task, not in the repo.
- Drive a full playthrough: open `station.html?gate=N`, click `#vipBtn` (guest player), then repeatedly press Enter
  (= teacher's ✓ "said it well") with ~500 ms pauses, also tapping whatever the game asks the child to tap, until the result
  screen (`.overlay` with the stamp) appears. Collect `pageerror` events — there must be none. Do this at both levels
  (after the guest starts, click `#lvlBtns button[data-l="1"]` or `[data-l="2"]`).
- Take screenshots (viewport 1366x768) at a question moment for each level and LOOK at them (Read the PNG): the picture
  must be visible, the sentence in `#kLine` must show the blank ("?") at level 2 and the word at level 1, nothing overlapping.
- Also press `N` (skip) and `Esc` (abort) once mid-game in a separate run to confirm no errors.

Final report (short): what you changed, what the child now sees/says in each step, test results (levels 1 and 2, skip,
abort), and any change you need in files you were not allowed to edit.
