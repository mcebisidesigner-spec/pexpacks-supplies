const APP_VERSION = "pexpacks-pwa-v1";
const STATIC_CACHE = `${APP_VERSION}-static`;
const PAGE_CACHE = `${APP_VERSION}-pages`;
const IMAGE_CACHE = `${APP_VERSION}-images`;

const PRECACHE_URLS = [
  "/",
  "/schools",
  "/office",
  "/contact",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/images/logo.svg",
];

const MAX_IMAGE_CACHE_ENTRIES = 60;
const MAX_IMAGE_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isImageAsset(url) {
  return /\.(?:avif|gif|jpg|jpeg|png|svg|webp)$/i.test(url.pathname) && !url.pathname.startsWith("/icons/");
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

async function putCache(cacheName, request, response) {
  if (!canCache(response)) {
    return;
  }

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  await putCache(STATIC_CACHE, request, response);
  return response;
}

async function staleWhileRevalidateWithLimit(request, cacheName, maxEntries) {
  const cached = await caches.match(request);

  const networkResponse = fetch(request)
    .then(async (response) => {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      if (keys.length >= maxEntries) {
        const oldest = keys.slice(0, keys.length - maxEntries + 1);
        await Promise.all(oldest.map((key) => cache.delete(key)));
      }

      await cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    return cached;
  }

  return (
    (await networkResponse) ||
    new Response("This resource is not available offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  );
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    await putCache(PAGE_CACHE, request, response);
    return response;
  } catch {
    return (
      (await caches.match(request)) ||
      (await caches.match("/offline")) ||
      (await caches.match("/")) ||
      new Response("Pexpacks is offline. Please reconnect and try again.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const networkResponse = fetch(request)
    .then(async (response) => {
      await putCache(PAGE_CACHE, request, response);
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    return cached;
  }

  return (
    (await networkResponse) ||
    new Response("This resource is not available offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  );
}

async function deleteExpiredEntries(cacheName, maxAgeMs) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const now = Date.now();

  await Promise.all(
    keys.map(async (request) => {
      const cached = await cache.match(request);
      if (cached) {
        const dateHeader = cached.headers.get("date");
        if (dateHeader) {
          const cachedTime = new Date(dateHeader).getTime();
          if (now - cachedTime > maxAgeMs) {
            await cache.delete(request);
          }
        }
      }
    })
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        Promise.all(
          PRECACHE_URLS.map((url) => cache.add(url).catch(() => undefined)),
        ),
      ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("pexpacks-pwa-"))
            .filter((key) => key !== STATIC_CACHE && key !== PAGE_CACHE && key !== IMAGE_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || !isSameOrigin(url) || isApiRequest(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isImageAsset(url)) {
    event.respondWith(staleWhileRevalidateWithLimit(request, IMAGE_CACHE, MAX_IMAGE_CACHE_ENTRIES));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

// Periodic cache cleanup — runs when the SW wakes up
self.addEventListener("message", (event) => {
  if (event.data === "CLEAN_IMAGE_CACHE") {
    deleteExpiredEntries(IMAGE_CACHE, MAX_IMAGE_CACHE_AGE_MS);
  }
});
