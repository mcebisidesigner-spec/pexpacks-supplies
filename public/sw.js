const APP_VERSION = "pexpacks-pwa-v1";
const STATIC_CACHE = `${APP_VERSION}-static`;
const PAGE_CACHE = `${APP_VERSION}-pages`;

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

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:avif|css|gif|ico|jpg|jpeg|js|png|svg|webp|woff2?)$/i.test(
      url.pathname,
    )
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
            .filter((key) => key !== STATIC_CACHE && key !== PAGE_CACHE)
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

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
