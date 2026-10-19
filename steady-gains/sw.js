// Steady Gains - offline support. Serves the app shell from cache, and
// refreshes the cache in the background so the next launch picks up updates.

const CACHE = "steady-gains-cc792858";
const SHELL = [
    "./", "index.html", "manifest.webmanifest", "css/app.css",
    "icons/icon.svg", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png",
    "js/main.js", "js/db.js", "js/coach.js", "js/dates.js", "js/engine.js", "js/equipment.js",
    "js/library.js", "js/programme.js", "js/safety.js",
    "js/ui/dom.js", "js/ui/profile-form.js", "js/ui/setup.js", "js/ui/today.js", "js/ui/session.js",
    "js/ui/summary.js", "js/ui/plan.js", "js/ui/progress.js", "js/ui/library.js", "js/ui/settings.js"
];

self.addEventListener("install", e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
    e.waitUntil(caches.keys()
        .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
        .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
    if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
    e.respondWith(caches.open(CACHE).then(async cache => {
        const cached = await cache.match(e.request, { ignoreSearch: true });
        const fresh = fetch(e.request).then(res => {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
        }).catch(() => cached);
        return cached || fresh;
    }));
});
