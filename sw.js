/* Offline cache for event day: after the first visit every page, script, sound and font
   is served from the cache (and refreshed in the background when online). */
const CACHE = "tces-english-day-v4";
self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const core = ["./", "index.html", "station.html", "control.html", "opening.html", "cards.html", "phone.html", "teacher-cards.html", "guide.html", "credits.html",
      "css/core.css", "js/content.js", "js/core.js", "js/art.js", "js/puzzles.js", "js/passport-code.js", "js/station.js", "js/control.js",
      "js/games/g1-kart.js", "js/games/g2-craft.js", "js/games/g3-hatch.js", "js/games/g4-beat.js", "js/games/g5-box.js", "js/games/g6-obby.js",
      "js/vendor/jsQR.js", "js/vendor/qrcode.js", "assets/audio/credits.js", "fonts/fredoka-latin-400-normal.woff2", "fonts/fredoka-latin-600-normal.woff2", "fonts/fredoka-latin-700-normal.woff2"];
    await c.addAll(core).catch(() => {});
    // the pronunciation clips
    try { const r = await fetch("assets/audio/credits.json"); const m = await r.json(); await c.addAll(Object.values(m).map((a) => "assets/audio/" + a.file)); } catch (err) {}
  })());
  self.skipWaiting();
});
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // never touch Google Sheet sync or other sites
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then((r) => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || new Response("offline", { status: 503 });
  })());
});
