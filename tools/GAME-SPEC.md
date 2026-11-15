# Game rules after the "simple questions" redesign (read before editing a game)

Audience: grades 1–6 in a small rural school; the questions must be so easy nobody gets stuck in front of visitors.
**Themes are fixed by the teacher: gate 1 greetings, 2 numbers, 3 colours, 4 weather, 5 feelings, 6 animals** (see `js/content.js`; game engines were re-assigned to gates, so a gate's engine is `TC_CONTENT.gates[n].key`, not its number).

1. **One word answers.** Every question is `api.ask({ teacher, tzh, say, zh, keys, word, hideKey: true })` where
   `say` is the short sentence from `js/content.js` (e.g. "It's a bus."), `keys` is `item.keys || [[item.w]]`
   and `word` is the key word (used for the human pronunciation clip). The engine blanks the key word for
   中級 (level 2) and prints it for 初級 (level 1) by itself — games must not branch on the level for wording.
   `api.level` is only ever 1 or 2.
2. **Picture of the answer on screen** while the question is asked (large, clear, not a silhouette).
3. **No removed fields**: `s2 s3 k3 fin3 q2 clues like sports moves parts family pool size` no longer exist in content.js.
4. **Ollie's spoken lines** (`TC.speak("...")`): the TV never glues separate word recordings into a sentence. A line is
   cut at its punctuation and a piece is heard only if ONE human recording covers the whole piece. So write Ollie's lines
   as short exclamations: `"Yes! Seven!"`, `"Wow!"`, `"Great!"`, `"Go!"`, `"Hello!"`, `"Good morning!"`, `"Yes! Happy!"`
   — an interjection (yes, no, wow, great, good, go, ok, hello) and/or the answer word or phrase on its own.
   Never `"Yes! It's a tiger."` (the sentence part would be silent). Full sentences appear on screen as text; the teacher
   says them. `TC.model(sentence, word)` plays the answer word's recording (or the whole phrase if it is one recording).
5. Touch first: everything a child does is a tap on the big screen; Enter/Space = teacher's ✓, N = skip, Esc = abort.
6. Art: every picture comes from `TC.art(name)` (original SVG drawn in code, each wearing the 土城 pin). New pictures
   go in their own file and register with `TC.ART[name] = () => { const c = TC.ArtCtx(); ... return c.out(svg); }`
   and `TC.SEAL[name] = [x, y, r, tilt]` (where the 土城 pin sits).
