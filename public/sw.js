const APP_VERSION = "pexpacks-pwa-v2";
const STATIC_CACHE = `${APP_VERSION}-static`;
const IMAGE_CACHE = `${APP_VERSION}-images`;

const PRECACHE_URLS = [
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/images/logo.svg",
];

const MAX_IMAGE_CACHE_ENTRIES = 60;
const MAX_IMAGE_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isSensitivePath(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/checkout")
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
  return /\.(?:avif|gif|jpg|jpeg|png|svg|webp)$/i.test(url.pathname);
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:css|js|woff2?)$/i.test(url.pathname)
  );
}

function canCache(response) {
  return response && response.ok && response.type !== "opaque";
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (canCache(response)) {
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
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
    return await fetch(request);
  } catch {
    return (
      (await caches.match("/offline")) ||
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
            .filter((key) => key !== STATIC_CACHE && key !== IMAGE_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    !isSameOrigin(url) ||
    isSensitivePath(url) ||
    isNextFlightRequest(request, url)
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkNavigation(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  } else if (isImageAsset(url)) {
    event.respondWith(staleWhileRevalidateImage(request));
  }
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
  if (event.data === "CLEAN_IMAGE_CACHE") event.waitUntil(deleteExpiredImages());
});
