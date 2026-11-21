/* Offline cache for event day. 115.11.21: network first (the newest version shows at once when online);
   only when the network fails or takes over 4 s is the cached copy used. */
const CACHE = "tces-english-day-v29-20261121";
self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const core = ["./", "index.html", "station.html", "control.html", "opening.html", "teacher-cards.html", "quest-card.html", "guide.html", "credits.html", "links.html", "js/links.js", "js/scratch.js", "assets/img/tucheng-emblem.svg", "assets/img/tucheng-emblem-192.png",
      "css/core.css", "js/content.js", "js/core.js", "js/art.js", "js/emblem.js", "js/art-body.js", "js/ollie3d.js", "js/puzzles.js", "js/station.js", "js/control.js",
      "js/games/g1-rescue.js", "js/games/g2-talk.js", "js/games/g3-tpr.js", "js/games/g4-monster.js", "js/games/g5-chant.js", "js/games/g6-story.js",
      "assets/audio/credits.js", "assets/audio/ai-sentences.js", "assets/audio/el-words.js", "fonts/fredoka-latin-400-normal.woff2", "fonts/fredoka-latin-600-normal.woff2", "fonts/fredoka-latin-700-normal.woff2"];
    await c.addAll(core).catch(() => {});
    // the pronunciation clips
    try { const r = await fetch("assets/audio/credits.json"); const m = await r.json(); await c.addAll(Object.values(m).map((a) => "assets/audio/" + a.file)); } catch (err) {}
    try { const r = await fetch("assets/audio/el-words.json"); const m = await r.json(); await c.addAll(Object.values(m).map((a) => "assets/audio/" + a.file)); } catch (err) {}
    try { const r = await fetch("assets/audio/ai-sentences.json"); const m = await r.json(); await c.addAll(Object.values(m).map((a) => "assets/audio/" + a.file)); } catch (err) {}
  })());
  self.skipWaiting();
});
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // never touch Google Sheet sync or other sites
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const net = fetch(e.request, { cache: "no-cache" }).then((r) => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    const slow = new Promise((res) => setTimeout(() => res("slow"), 4000));
    const first = await Promise.race([net, slow]);
    if (first && first !== "slow") return first;
    const hit = await c.match(e.request, { ignoreSearch: true });
    return hit || (await net) || new Response("offline", { status: 503 });
  })());
});
