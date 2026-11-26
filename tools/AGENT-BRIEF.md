# Brief: write ONE new game file for the 《校園生活英語》 redesign

Project: `/home/user/123456/english-quest/` — static HTML/JS site, no build. Six classroom touch-screen English games.
`station.html?gate=N` loads `js/content.js`, `js/core.js`, `js/art.js`, `js/art-body.js`, `js/puzzles.js`, `js/scratch.js`,
the six `js/games/g*.js` files and `js/station.js`. `js/core.js`, `js/station.js`, `js/content.js` are ready and are NOT yours.

**Your job: create ONE game file (named in your task) that fulfils `/home/user/123456/tools/GAME-SPEC.md` for your gate.**
Read first: that spec, your gate's entry in `js/content.js`, `js/core.js` (`TC.ask`, `TC.speak`, `TC.model`, `TC.praise`,
`TC.teacherLine`, `TC.clapBanner`, `TC.countTurn`, `TC.rounds`, `TC.confetti`, `TC.sfx`, `TC.floatText`, `TC.art`, `TC.artImg`,
`TC.ArtCtx`, `TC.seal`), the way `js/station.js` builds `api` and calls `game.mount/idle/play`, and — as a style reference for a polished
game with CSS injected from JS — `git show HEAD:english-quest/js/games/g4-beat.js` and `git show HEAD:english-quest/js/games/g3-hatch.js`
(old games of this project; copy their technique and quality bar, not their content).
You may also read `css/core.css` and `js/art.js` / `js/art-body.js` (to see how pictures are drawn) but do not edit them.

Hard rules
- Create/edit ONLY your game file. Do not edit content.js, core.js, station.js, station.html, art*.js, css/core.css, other games.
  If you think a shared file must change, do not change it: describe the exact change in your final report.
- Do not run git commands that change state (no commit/add/stash/checkout).
- Plain ES2019, 2-space indent, no dependencies, no external images/fonts/network. Original art drawn in code only.
- The old game files (g1-kart.js … g6-obby.js) are deleted from the working tree; do not recreate them.
- The picture that shows the situation/answer must be LARGE and clear, never overlapped by `#talk` (the bottom talk bar, about
  the lower 38% of the screen), the HUD (top 8rem) or the big emblem (top-left 17rem × 18rem).
- The code must be robust: `Esc` at any time must leave no DOM or timers behind; `N` (skip) and Enter must never throw.

How to test (required before you report)
- Serve: `cd /home/user/123456/english-quest && python3 -m http.server PORT &` (port given in your task).
- Playwright is installed globally: `require('playwright')`, `chromium.launch({ args: ['--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required'] })`. Test scripts go in the scratch directory given
  in your task, never in the repo.
- Full playthrough: open `station.html?gate=N`, click `#lvlPick button[data-l="1"]` (or 2), click `#startBtn` with `{force:true}`, then
  press Enter every ~500 ms while also tapping whatever your game needs, until the result screen (`.overlay .stamp`) appears. There must
  be no `pageerror`. Do it at both levels. The repo's `node tools/tests/e2e.js http://localhost:PORT N 1,2` does exactly this.
- Take 1366x768 screenshots at 3 moments (start/idle, a question, the finale) and LOOK at them (Read the PNG): everything visible,
  nothing overlapping, 3D/cute/colourful. Fix what looks bad. Then `N` (skip) and `Esc` (abort) mid-game in separate runs: no errors, no leftovers.
- Also check 1920x1080.

Final report (short): what the child sees/says/does in each step, the wow moment and the parent moment, test results (levels 1 and 2,
skip, abort, both resolutions), the names of the TC.ART pictures you registered, and any change you need in files you may not edit.
