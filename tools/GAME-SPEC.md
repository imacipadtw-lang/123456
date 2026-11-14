# Game rules after the "simple questions" redesign (read before editing a game)

Audience: grades 1–6 in a small rural school; the questions must be so easy nobody gets stuck in front of visitors.
**Every answer word must come from passport levels 1–6** (the teacher reviews those six levels with the children before the day).

1. **One word answers.** Every question is `api.ask({ teacher, tzh, say, zh, keys, word, hideKey: true })` where
   `say` is the short sentence from `js/content.js` (e.g. "It's a bus."), `keys` is `item.keys || [[item.w]]`
   and `word` is the key word (used for the human pronunciation clip). The engine blanks the key word for
   中級 (level 2) and prints it for 初級 (level 1) by itself — games must not branch on the level for wording.
   `api.level` is only ever 1 or 2.
2. **Picture of the answer on screen** while the question is asked (large, clear, not a silhouette).
3. **No removed fields**: `s2 s3 k3 fin3 q2 clues like sports moves[L] say[L] keys[L] color colors numbers pool size` no longer exist in content.js.
4. **Ollie's spoken lines** (`TC.speak("...")`) are played with human word recordings, so keep them to at most
   four words made only of: yes, no, great, good, go, wow, hello, ok, it's, a, an, the, i, like, can, you,
   big, small, the numbers one–ten, and the item word itself. (Longer encouragement can be shown as on-screen text.)
5. Touch first: everything a child does is a tap on the big screen; Enter/Space = teacher's ✓, N = skip, Esc = abort.
6. Art: every picture comes from `TC.art(name)` (original SVG drawn in code, each wearing the 土城 pin). New pictures
   go in their own file and register with `TC.ART[name] = () => { const c = TC.ArtCtx(); ... return c.out(svg); }`
   and `TC.SEAL[name] = [x, y, r, tilt]` (where the 土城 pin sits).
