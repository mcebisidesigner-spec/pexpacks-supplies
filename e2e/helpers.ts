import type { Page } from "@playwright/test";

/**
 * The production service worker (public/sw.js) intentionally self-deregisters
 * and navigates every open window client on localhost. Running against
 * `next start` triggers a perpetual register -> unregister -> navigate reload
 * loop, which breaks long-running page analysis. Registration is patched out
 * here so tests run against a stable page; SW behaviour stays covered in
 * production/preview deployments.
 */
export async function blockServiceWorker(page: Page) {
  await page.addInitScript(() => {
    const sw = navigator.serviceWorker;
    if (sw && typeof sw.register === "function") {
      sw.register = () =>
        Promise.resolve({
          update: () => Promise.resolve(),
          unregister: () => Promise.resolve(true),
        }) as unknown as Promise<ServiceWorkerRegistration>;
    }
  });
}