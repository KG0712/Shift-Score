// Shift Score service worker: makes the app load instantly and work offline.
// Bump VERSION on every deploy so phones pick up the new files.
const VERSION = "shiftscore-v15-market";
const SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "vendor/xlsx.full.min.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/v2-icon-192.png",
  "icons/v2-icon-512.png",
  "icons/v2-icon-maskable-512.png",
  "fonts/source-serif-4.woff2",
  "fonts/ibm-plex-mono-latin-400-normal.woff2",
  "fonts/ibm-plex-mono-latin-500-normal.woff2",
  "icons/apple-touch-icon.png",
  "icons/favicon-48.png",
  "icons/wordmark.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  // Pages: try the network first so updates show up, fall back to the cached app offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put("index.html", copy)); return res; })
        .catch(() => caches.match("index.html"))
    );
    return;
  }
  // Everything else: cache first, then network.
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});

// Tapping a floor alert opens the app.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) { if ("focus" in c) return c.focus(); }
    return self.clients.openWindow ? self.clients.openWindow("./") : undefined;
  }));
});
