const IS_LOCAL_DEV_HOST = ["localhost", "127.0.0.1", "::1"].includes(self.location.hostname);

if (IS_LOCAL_DEV_HOST) {
  self.addEventListener("install", (event) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(
      Promise.all([
        self.registration.unregister(),
        caches.keys().then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("pexpacks-pwa-"))
              .map((key) => caches.delete(key)),
          ),
        ),
        self.clients.claim(),
      ]).then(() =>
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) =>
          clients.forEach((client) => client.navigate(client.url)),
        ),
      ),
    );
  });
} else {
  const APP_VERSION = "pexpacks-pwa-v4";
  const STATIC_CACHE = `${APP_VERSION}-static`;
  const IMAGE_CACHE = `${APP_VERSION}-images`;
  const DATA_CACHE = `${APP_VERSION}-data`;

  const PRECACHE_URLS = [
    "/offline",
    "/schools",
    "/manifest.webmanifest",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/icons/icon-maskable-512.png",
    "/images/logo.svg",
  ];

  const MAX_IMAGE_CACHE_ENTRIES = 80;
  const MAX_IMAGE_CACHE_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  function isSameOrigin(url) {
    return url.origin === self.location.origin;
  }

  function isSensitivePath(url) {
    return (
      url.pathname.startsWith("/api/checkout") ||
      url.pathname.startsWith("/api/admin") ||
      url.pathname.startsWith("/admin") ||
      url.pathname.startsWith("/pex-console-secure")
    );
  }

  function isNextFlightRequest(request, url) {
    return (
      request.headers.get("RSC") === "1" ||
      request.headers.has("Next-Router-Prefetch") ||
      url.searchParams.has("_rsc")
    );
  }

  function isImageAsset(url) {
    return (
      url.hostname.includes("supabase.co") ||
      url.pathname.startsWith("/images/") ||
      url.pathname.startsWith("/icons/") ||
      /\.(?:avif|gif|jpg|jpeg|png|svg|webp)$/i.test(url.pathname)
    );
  }

  function isStaticAsset(url) {
    return (
      url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/fonts/") ||
      url.pathname.startsWith("/icons/") ||
      /\.(?:woff2?|css|js)$/i.test(url.pathname)
    );
  }

  function canCache(response) {
    return response && response.ok && response.type !== "opaque";
  }

  async function cacheFirst(request, cacheName = STATIC_CACHE) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (canCache(response)) {
        const cache = await caches.open(cacheName);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return cached || Response.error();
    }
  }

  async function staleWhileRevalidate(request, cacheName = STATIC_CACHE) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const network = fetch(request)
      .then(async (response) => {
        if (!canCache(response)) return response;
        await cache.put(request, response.clone());
        return response;
      })
      .catch(() => undefined);

    return cached || (await network) || Response.error();
  }

  async function staleWhileRevalidateImage(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);
    const network = fetch(request)
      .then(async (response) => {
        if (!canCache(response)) return response;
        const keys = await cache.keys();
        if (keys.length >= MAX_IMAGE_CACHE_ENTRIES) {
          await Promise.all(
            keys.slice(0, keys.length - MAX_IMAGE_CACHE_ENTRIES + 1).map((key) =>
              cache.delete(key),
            ),
          );
        }
        await cache.put(request, response.clone());
        return response;
      })
      .catch(() => undefined);

    return cached || (await network) || new Response("Image unavailable", { status: 503 });
  }

  async function networkNavigation(request) {
    try {
      const response = await fetch(request);
      if (canCache(response)) {
        const cache = await caches.open(DATA_CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;

      const offlineShell = await caches.match("/offline");
      return (
        offlineShell ||
        new Response("Pexpacks is offline. Please reconnect and try again.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        })
      );
    }
  }

  async function deleteExpiredImages() {
    const cache = await caches.open(IMAGE_CACHE);
    const now = Date.now();
    const keys = await cache.keys();
    await Promise.all(
      keys.map(async (request) => {
        const response = await cache.match(request);
        const cachedAt = response?.headers.get("date");
        if (cachedAt && now - new Date(cachedAt).getTime() > MAX_IMAGE_CACHE_AGE_MS) {
          await cache.delete(request);
        }
      }),
    );
  }

  self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open(STATIC_CACHE).then((cache) =>
        Promise.all(PRECACHE_URLS.map((url) => cache.add(url).catch(() => undefined))),
      ),
    );
    self.skipWaiting();
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("pexpacks-pwa-"))
              .filter((key) => key !== STATIC_CACHE && key !== IMAGE_CACHE && key !== DATA_CACHE)
              .map((key) => caches.delete(key)),
          ),
        )
        .then(() => self.clients.claim()),
    );
  });

  self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== "GET" || isSensitivePath(url) || isNextFlightRequest(request, url)) {
      return;
    }

    if (request.mode === "navigate") {
      event.respondWith(networkNavigation(request));
    } else if (isImageAsset(url)) {
      event.respondWith(staleWhileRevalidateImage(request));
    } else if (isStaticAsset(url)) {
      event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    }
  });

  self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING") self.skipWaiting();
    if (event.data === "CLEAN_IMAGE_CACHE") event.waitUntil(deleteExpiredImages());
  });
}
