# Pexpacks Performance & Optimization Guide

This guide establishes the performance engineering standards, bundle budgets, caching architectures, and diagnostic tooling implemented across the Pexpacks application.

---

## 1. Bundle Optimization & Package Treeshaking

Next.js is configured with experimental package import optimization in `next.config.ts` to automatically tree-shake large libraries down to only the symbols used:

```ts
experimental: {
  optimizePackageImports: [
    "lucide-react",
    "@supabase/ssr",
    "@supabase/supabase-js",
    "clsx",
    "papaparse",
    "zod",
    "swr",
    "@tanstack/react-table",
    "tailwind-merge",
    "class-variance-authority",
    "zustand",
    "sonner",
  ],
}
```

### Heavy Dependency Segregation
- **`@react-pdf/renderer`**:
  - Contains large PDF font embedding and layout engines (~500KB+ minified).
  - **Rule**: NEVER import synchronously into client-side pages or root layouts.
  - **Pattern**: Always load on-demand via `const { pdf } = await import("@react-pdf/renderer")` inside server actions, route handlers (`/api/admin/letters/[id]/pdf`), or client click handlers.
- **`papaparse` & `read-excel-file`**:
  - Dynamic import loaded only when the user uploads a CSV/XLS file (`const Papa = (await import("papaparse")).default`).
- **Modals & Dialogs**:
  - Security modals such as `MustChangePasswordModal` are rendered conditionally on server-verified session state rather than mounted globally for every user.

---

## 2. Image Optimization & Budgets

Static assets and images are enforced with strict size budgets via automated preflight checks.

| Constraint | Limit | Description |
| :--- | :--- | :--- |
| **Max Single Image Weight** | `300 KB` | No individual image in `public/images` may exceed 300 KB. |
| **Total Images Weight** | `3072 KB` (3 MB) | The aggregate static image folder payload must stay within 3 MB. |
| **Supported Formats** | `AVIF`, `WebP` | Configured in `next.config.ts` for automatic browser negotiation. |
| **Minimum Cache TTL** | `2,678,400 s` (31 days) | Images are cached at the CDN edge for 31 days. |

### Core Web Vitals: Largest Contentful Paint (LCP)
- All above-the-fold hero images MUST include:
  1. `priority` attribute (disables lazy-loading, sets `fetchpriority="high"`).
  2. `placeholder="blur"` and `blurDataURL={IMAGE_BLUR_DATA_URL}` (eliminates layout shifts / CLS).
  3. Responsive `sizes` attribute matching layout breakpoints (e.g., `sizes="(min-width: 1024px) 44vw, 100vw"`).
- All below-the-fold images (e.g. avatars, footer logos, product gallery thumbnails) MUST use `loading="lazy"`.

---

## 3. HTTP Caching Architecture

Header policies are centralized in `next.config.ts`:

| Route Pattern | `Cache-Control` Header | Rationale |
| :--- | :--- | :--- |
| `/fonts/:path*` | `public, max-age=31536000, immutable` | Static font files never change once hashed; 1 year browser cache. |
| `/icons/:path*` | `public, max-age=31536000, immutable` | PWA and system icons; 1 year browser cache. |
| `/images/:path*` | `public, max-age=604800, stale-while-revalidate=2592000` | 7-day browser cache with 30-day stale-while-revalidate for background updates. |
| `/admin/:path*` | `no-store, no-cache, must-revalidate, max-age=0` | Prevents caching of authenticated administrative data and customer PII. |
| `/pex-console-secure` | `no-store, no-cache, must-revalidate, max-age=0` | Protects privileged staff authentication consoles. |

---

## 4. Performance Commands

Run performance audits locally or in CI:

```bash
# 1. Run complete performance & asset verification suite
npm run audit:perf

# 2. Check static image budgets
npm run check:images

# 3. Analyze production bundle chunks with Webpack Bundle Analyzer
npm run analyze
```
