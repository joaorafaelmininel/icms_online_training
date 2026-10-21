/* Mapa de Estudos service worker: keeps the app available offline and receives files shared from other apps (Android). */
const VERSION = "2026-10-21.1";
const CACHE = "mapa-estudos-" + VERSION;
const INBOX = "mapa-estudos-inbox";
const ASSETS = [
  "./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./vendor/jszip.min.js",
  "./fonts/newsreader-latin-400-normal.woff2", "./fonts/newsreader-latin-500-normal.woff2",
  "./fonts/newsreader-latin-400-italic.woff2", "./fonts/newsreader-latin-500-italic.woff2",
  "./fonts/figtree-latin-400-normal.woff2", "./fonts/figtree-latin-500-normal.woff2",
  "./fonts/figtree-latin-600-normal.woff2", "./fonts/figtree-latin-700-normal.woff2",
  "./fonts/ibm-plex-mono-latin-500-normal.woff2",
  "./icons/favicon.svg", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: "reload" })))));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("mapa-estudos-") && k !== CACHE && k !== INBOX) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("message", e => { if (e.data === "skip-waiting") self.skipWaiting(); });

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method === "POST" && url.pathname.endsWith("/share-target")) { e.respondWith(receiveShare(e.request)); return; }
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (e.request.mode === "navigate") {
    // the app shell always comes from the cache, so it opens without a connection
    e.respondWith(caches.match("./index.html", { cacheName: CACHE }).then(r => r || fetch(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request, { cacheName: CACHE, ignoreSearch: true }).then(r => r || fetch(e.request).then(res => {
    if (res.ok && res.type === "basic") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  })));
});

async function receiveShare(request) {
  try {
    const form = await request.formData();
    const inbox = await caches.open(INBOX);
    let i = 0;
    for (const f of form.getAll("files")) {
      if (!(f instanceof File)) continue;
      await inbox.put(new Request(`./inbox/file-${Date.now()}-${i++}`), new Response(f, {
        headers: { "Content-Type": f.type || "application/octet-stream", "X-Filename": encodeURIComponent(f.name || "arquivo") }
      }));
    }
    const text = [form.get("title"), form.get("text")].filter(Boolean).join("\n");
    if (!i && text) await inbox.put(new Request("./inbox/text"), new Response(text));
  } catch (err) { /* the app shows a message if nothing arrives */ }
  return Response.redirect("./?shared=1", 303);
}
