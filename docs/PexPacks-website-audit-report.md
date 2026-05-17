# PexPacks Website Audit Report

Audit date: 2026-05-17  
Project: `pexpacks-supplies`  
Stack: Next.js 16.2.5, React 19.2.5, TypeScript 5.9, App Router, CSS Modules, global CSS tokens, local WOFF2 fonts.

## 1. Executive Summary

The app is in a strong functional state. It uses the App Router, strict TypeScript, local fonts, `next/image` for major raster media, route-level metadata, sitemap and robots generation, form validation, same-origin checks, rate limiting, and accessible dialog foundations for pack lists.

The biggest immediate risk is security: `npm audit` reports one high-severity Next.js advisory affecting the installed 16.2.5 range. This should be fixed before production release.

The biggest performance risk is scale-related. Current school data has 685 schools and 4,715 grade routes. Turbopack generated 5,431 static pages in 4.4 minutes. This is good for SEO, but CI and deploy time will grow quickly as the catalogue expands.

The school search experience is already optimized better than the original baseline: it uses debounced input, asynchronous requests, request aborting, API result limits, offset pagination, a singleton `SchoolSearchIndex`, pre-normalised searchable fields, a grade index, and a small in-memory LRU cache. The next improvements should be edge/CDN cache verification, optional infinite-scroll loading in the result drawer, and a real database index when school data moves out of JSON.

The biggest maintainability risks are oversized files: `components/schools/Schools.module.css` is over 1,300 lines, `components/marketing/Marketing.module.css` is over 950 lines, and `components/order/OrderForm.tsx` is over 1,000 lines.

## 2. Priority Matrix

| Priority | Issue | Location | Impact | Recommended Fix |
|---|---|---|---|---|
| Critical | High-severity Next.js advisory from `npm audit` | `package.json`, `package-lock.json` | Security risk in App Router middleware/proxy segment-prefetch handling | Run `npm audit fix`, update Next.js, rebuild and smoke test |
| High | Static generation scale is already large | `app/sitemap.ts`, `app/schools/**`, `data/school-index.json` | Slower CI/deploys as school/grade pages grow | Keep SEO pages, but plan ISR/on-demand generation or split build strategy if catalogue grows |
| High | CSS module exceeds critical maintainability threshold | `components/schools/Schools.module.css` | Hard to reason about mobile/search/card regressions | Split into `SchoolSearch`, `ResultsPanel`, `FeaturedSchools`, `SchoolCards` CSS modules |
| High | Main order form is too large | `components/order/OrderForm.tsx` | Higher regression risk in checkout/customisation work | Extract school selection, pack summary, add-ons, buyer details, confirm step |
| High | Sitewide header/footer are client components | `components/layout/Header.tsx`, `Footer.tsx` | Extra JS on every route | Split static shell/server nav from small client active-state/menu islands |
| High | Carousel pagination dots are clickable `div`s | `components/shared/TestimonialMarquee.tsx`, `components/schools/FeaturedSchoolsBanner.tsx` | Keyboard and screen-reader users cannot operate all controls | Replace dots with real buttons and labels |
| Medium | Large unused PNG/JPG assets remain in `public/images` | `public/images/pexcover-img-*.png`, `unboxing-G7.png`, `hero-school-delivery.jpg` | Repo and deployment artifact bloat | Remove unused legacy images after confirming no CMS/static references |
| Medium | Raw `<img>` warning for logo | `components/ui/Logo.tsx` | Lint warning and possible missed optimization | Use `next/image` for SVG logo or document an intentional exception |
| Medium | Form errors are visible but not fully associated | Form components | Assistive tech may not connect fields and errors | Add stable error IDs and `aria-describedby` |
| Medium | In-memory rate limit is not distributed | `lib/security/requestGuards.ts` | Weak at multi-instance production scale | Move to Redis/Edge Config/KV when traffic grows |
| Medium | Duplicate FAQ/customiser patterns | `components/shared`, `components/marketing`, `components/order`, `components/packs` | Inconsistent behavior and maintenance cost | Consolidate into shared primitives |
| Low | Encoding artifacts in comments/text | Several files show mojibake in comments and at least one partner badge string | Polish and trust issue if visible | Normalize source encoding to UTF-8 and clean visible copy |

## 3. Performance Findings

### Finding: School search is mostly well optimized, with one remaining scalability path

Evidence/location: `lib/hooks/usePaginatedSchoolSearch.ts`, `app/api/schools/search/route.ts`, `lib/schools/SearchIndex.ts`, `lib/schools/schoolSearchData.ts`.

Current strengths:
- 275ms debounce before API calls.
- Stale requests are cancelled with `AbortController`.
- Results are limited to 8 on home and 12 on `/schools`, with API cap at 24.
- Pagination uses `limit` and `offset`.
- Search runs against `school-index.json`, not full school records.
- `SchoolSearchIndex` pre-normalises names/regions/provinces, builds a grade index, and caches recent results.
- Local API smoke checks returned 200 with low response times for sampled queries.

Recommended fix:
- Verify successful search API responses expose the intended `Cache-Control` header after a fresh production rebuild.
- Add optional IntersectionObserver-based "load more as drawer nears bottom" for mobile.
- If school data moves to a database, index `normalized_name`, `city`, `province`, `grade`, and `slug`.

Expected impact: Lower server CPU per keystroke, smoother mobile search, and better scaling beyond the current 685 schools.

### Finding: Static generation volume is high

Evidence/location: Turbopack build generated 5,431 static pages; current data has 685 schools and 4,715 school-grade routes.

Why it matters: Excellent for SEO, but build time already reached 4.4 minutes for static page generation in Turbopack. This will grow with every new school and grade list.

Recommended fix: Keep static generation for launch if deploy time is acceptable. Before scaling, evaluate ISR or on-demand generation for long-tail grade pages while keeping top school pages prebuilt.

Expected impact: Faster deploys and less CI pressure without sacrificing crawlability.

### Finding: Sitewide client JS can be reduced

Evidence/location: 31 client files; `Header`, `Footer`, active nav, mobile menu, sticky CTA and multiple interactive widgets.

Why it matters: Header/footer are present on every page. Making large layout pieces client-side increases hydration work and route JS.

Recommended fix: Convert static parts of `Header` and `Footer` to Server Components. Keep `HeaderMenu`, active link state and scroll-hide behavior as smaller client islands.

Expected impact: Lower JS overhead, better INP, less hydration work.

### Finding: CSS bloat creates regression risk

Evidence/location:
- `components/schools/Schools.module.css`: 1,322 lines.
- `components/marketing/Marketing.module.css`: 954 lines.
- `components/order/Order.module.css`: 512 lines.
- `components/layout/Header.module.css`: 479 lines.

Recommended fix: Split by component and route surface, preserving tokens and class names in small batches.

Expected impact: Easier mobile QA, lower accidental cascade conflicts, faster feature work.

### Finding: Image storage contains large unused legacy assets

Evidence/location:
- `pexcover-img-03.png`: 2.3 MB.
- `pexcover-img-01.png`: 2.2 MB.
- `pexcover-img-02.png`: 2.1 MB.
- `pexcover-img.png`: 1.9 MB.
- `unboxing-G7.png`: 1.8 MB.
- `hero-school-delivery.jpg`: 1.0 MB.

Current code references WebP versions for these surfaces, not the large PNG/JPG files.

Recommended fix: Remove or archive unused PNG/JPG originals outside the deployed app. Keep source masters outside `public`.

Expected impact: Smaller repo/deploy footprint and less chance of accidentally serving oversized images.

## 4. Google, Lighthouse, and Core Web Vitals Findings

### LCP

The home hero uses `next/image`, `fill`, `priority`, and `sizes`, which is correct for the likely LCP image. The logo still uses raw `<img>`, which triggers a Next lint warning but is lower risk because it is an SVG with explicit dimensions.

Risk: Large WebP images such as `unboxing-items.webp` and `pexcover-banner.webp` should be checked in Lighthouse for mobile transfer size.

### INP

Risk areas:
- Header scroll listener and sticky mobile CTA scroll listener.
- Featured schools scroll handler computes children on every scroll.
- Testimonial slider measures layout with ResizeObserver and state updates.
- Large order form client component.

Most handlers are scoped and passive where appropriate. Featured slider scroll work should be throttled or computed from known slide width.

### CLS

Strengths:
- Major images use `next/image` or explicit SVG dimensions.
- Cards and panels mostly have stable dimensions.

Risks:
- Dynamic search results drawer can change layout on mobile.
- Sticky mobile CTA can cover content if route hiding misses a page.
- Font swap should be checked visually because the local font stack uses display fonts heavily.

### Lighthouse readiness

Expected status from local audit:
- Performance: good foundation, but static JS and image weight need measurement.
- Accessibility: good foundation, with carousel dot controls and form error association needing fixes.
- Best Practices: blocked by current `npm audit` high advisory.
- SEO: strong, with generated sitemap, robots, metadata, and indexable school/grade pages.

## 5. SEO Findings

Strengths:
- App Router metadata is used on main routes.
- Canonical URLs are generated by `buildMetadata`.
- `robots.ts` exists and allows crawling while disallowing `/api/` and `/admin/`.
- `sitemap.ts` includes static pages, blog posts, school pages and grade pages.
- Dynamic school and grade pages generate metadata.
- Organization, OnlineStore, WebSite, breadcrumb and product JSON-LD exist.

Issues and recommendations:
- School page title format is currently `{School Name} School Stationery Packs | Pexpacks`; align with the desired keyword pattern if needed: `{School Name} Stationery Pack | PexPacks`.
- Add `FAQPage` schema only on pages where those FAQs are visibly rendered.
- Ensure all blog markdown images keep descriptive alt text.
- Consider LocalBusiness schema if PexPacks has a public service location.
- Keep grade pages with meaningful visible copy, not only product cards.

## 6. Accessibility Findings

Strengths:
- Skip link exists.
- Header uses semantic navigation.
- Mobile menu trigger is a real button with `aria-expanded` and `aria-controls`.
- Complete list modal uses `role="dialog"`, `aria-modal`, focus trapping, Escape close, backdrop close and focus return.
- Search helper pill uses non-disruptive status messaging.

Issues:
- `TestimonialMarquee` tracking dots are `div` elements with `onClick`; use buttons.
- `FeaturedSchoolsBanner` tracking dots are `div` elements with `onClick`; use buttons.
- Form validation messages are visible but should be connected to inputs using `aria-describedby`.
- Hero search input should expose combobox/listbox semantics like the order form search does.
- Mobile menu does not behave like a modal dialog or trapped drawer; ensure focus cannot move behind it while open.
- Testimonial avatar alt text is generic and misspelled (`testmonials`); use an empty alt for decorative avatars or meaningful names.

## 7. Codebase Findings

Project structure is generally clean:
- `app/` routes are organized by page.
- `components/` is split by domain.
- `lib/` has useful utility boundaries.
- `data/` keeps static school, pack and content data out of components.
- Tokens exist in `styles/tokens.css`.

Maintainability concerns:
- `OrderForm.tsx` is 1,039 lines and should be split.
- `Schools.module.css` is 1,322 lines and should be split first.
- `Marketing.module.css` is 954 lines and still hosts multiple page/component concerns.
- Duplicate FAQ components exist: `components/shared/FaqAccordion.tsx` and `components/marketing/FAQAccordion.tsx`.
- Pack customisation appears in both order and pack-specific areas; continue moving toward shared `PackActionButtons` and shared modal/drawer primitives.
- `Footer.tsx` is client-side mainly for pathname/year/social rendering; split static and active-state pieces.

## 8. Broken Links, Dead Routes, and Dead Code

| Type | Location | Problem | Fix |
|---|---|---|---|
| Broken route | Repo-wide link scan | No obvious empty `href`, `href="#"`, or invalid internal literal route found | Keep automated route/link smoke checks |
| Redirects | `/school`, `/office`, `/deliveries`, `/about`, `/partner`, `/copex`, `/standard-packs` | All sampled legacy routes return 308 redirects | Good; keep redirects while old URLs exist |
| Dead import | `app/order/page.tsx` | `ordersEmailHref`, `phoneHref` unused | Remove imports |
| Dead import | `app/page.tsx` | `Link` unused | Remove import |
| Dead helper | `scripts/generate-schools.js` | `pickGrades` unused | Remove or wire it |
| Type cleanup | `lib/debounce.ts` | Uses `any` | Replace with generic tuple type |
| Duplicate component | `components/shared/FaqAccordion.tsx`, `components/marketing/FAQAccordion.tsx` | Two FAQ renderers | Standardize on one |
| Dead assets | `public/images/*.png`, old JPGs | Large unreferenced assets | Archive outside `public` |

## 9. Design System Consistency Findings

Strengths:
- `components/ui/Button.tsx` exists and is widely used.
- Tokens exist for colours, radii, shadows, spacing, typography, and touch targets.
- Pack card/modal components were moved into `components/packs`.

Issues:
- Some pages still use inline styles for card padding and layout in `app/page.tsx`.
- Cards are styled across several modules rather than a small set of shared card primitives.
- Modal logic is better than before, but customiser drawers and complete-list modals should share one dialog foundation where practical.
- Icons are mostly inline SVGs. This avoids dependency bloat, but naming and sizing should be standardised.

## 10. Security and Privacy Findings

Strengths:
- `.env.local` is ignored.
- `.env.example` contains no secrets.
- Current `.env.local` only exposes `NEXT_PUBLIC_SITE_URL`.
- Forms use server-side Zod validation.
- Same-origin checks are implemented.
- In-memory rate limiting exists.
- Honeypot fields exist.
- Consent checkbox and privacy wording are present.
- API errors do not leak stack traces to users.
- Security headers are configured: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy and X-Frame-Options.

Issues:
- `npm audit --audit-level=high` reports one high vulnerability in Next.js.
- Rate limiting is in-memory, so it is not reliable across serverless instances or multiple Node processes.
- SMTP credentials are not present in `.env.local`, so real form email delivery depends on deployment environment configuration.
- CSP allows `script-src 'unsafe-inline'` and `style-src 'unsafe-inline'`. This is common in Next apps but should be tightened with nonces/hashes later if threat model requires it.

## 11. Recommended Implementation Roadmap

### Immediate Fixes

1. Update Next.js to resolve the high-severity audit advisory.
2. Remove lint warnings: unused imports, `any` in debounce, unused generator helper.
3. Replace carousel dot `div`s with buttons.
4. Verify search API `Cache-Control` after a fresh production rebuild.
5. Keep the school search `SchoolSearchIndex` path; do not regress to per-request full normalization.

### Short-Term Optimisations

1. Split `Schools.module.css`.
2. Split `OrderForm.tsx` into step components.
3. Convert footer/static header shell to Server Components.
4. Improve form error `aria-describedby`.
5. Remove unused large images from `public`.

### Medium-Term Improvements

1. Add optional infinite-scroll lazy loading to mobile search result drawers.
2. Add bundle analyzer script.
3. Add automated route/link smoke checks.
4. Consolidate FAQ and card primitives.
5. Add a shared analytics event helper for search, pack clicks, customiser clicks and form submissions.

### Long-Term Platform Improvements

1. Move school data to a database when editing/admin workflows are needed.
2. Add database indexes on normalized school name, city/province, grade and slug.
3. Use Redis/KV rate limiting for distributed deployments.
4. Add admin workflow for school pack updates.
5. Add checkout/payment only after product and fulfillment data are stable.

## 12. Expected Impact

| Recommendation | Expected Impact |
|---|---|
| Next.js security update | Removes known high-severity production risk |
| Preserve and extend `SchoolSearchIndex` | Faster search, lower CPU per keystroke, smoother mobile UX |
| CDN/cache verification for search API | Lower repeat-query latency and server load |
| Split large CSS modules | Fewer visual regressions and faster maintenance |
| Split `OrderForm.tsx` | Safer checkout/customisation changes |
| Reduce sitewide client components | Lower hydration cost and better INP |
| Button-based carousel dots | Better keyboard and screen-reader accessibility |
| Remove large unused assets | Smaller deploy artifact and lower accidental bandwidth risk |

## 13. Safe Refactor Plan

1. Create a branch.
2. Run baseline `npm.cmd run lint`, `npx.cmd next build --webpack`, and `npm.cmd run build`.
3. Capture desktop/mobile screenshots for `/`, `/schools`, a school page, a grade page, `/order`, `/office-packs`, `/contact`, `/privacy-policy`.
4. Keep search behaviour unchanged while adding tests around debounce, pagination and API limits.
5. Fix critical security update first.
6. Remove lint warnings.
7. Replace carousel dots with buttons.
8. Split `Schools.module.css` one component area at a time.
9. Split `OrderForm.tsx` into isolated step components.
10. Convert static layout pieces back to Server Components.
11. Remove unused large image assets.
12. Retest search, forms, modals, mobile menu and pack customisation.
13. Run final lint, webpack build, Turbopack build, route smoke and browser console checks.

## 14. Final Checklist

| Check | Current Result |
|---|---|
| `npm.cmd run lint` | Passed with 6 warnings |
| `npx.cmd next build --webpack` | Passed |
| `npm.cmd run build` Turbopack | Passed |
| `npm.cmd audit --audit-level=high` | Failed with 1 high Next.js advisory |
| Route smoke on fresh production server | Sampled routes returned 200 |
| Legacy redirects | Sampled redirects returned 308 |
| Browser smoke | Home, schools, school page, grade page, order, privacy: visible main, one H1, no console errors |
| Search smoke | Home and `/schools` returned visible results for sample query |
| Broken literal internal links | None found in static scan |
| School data integrity | 685 schools, 4,715 grade routes, no duplicate IDs/slugs, no empty grade contents |

## Commands Run

```powershell
npm.cmd run lint
npm.cmd audit --audit-level=high
npx.cmd next build --webpack
npm.cmd run build
Invoke-WebRequest http://localhost:3102/<sample-routes>
Invoke-WebRequest http://localhost:3102/api/schools/search?q=park&limit=12
```

## Assumptions and Limitations

- Lighthouse CLI was not installed or run, so Core Web Vitals are risk-assessed from code, build output, browser smoke checks and local route checks.
- Local timings are not production Web Vitals.
- `next start` served a built production output; source changes made after a build require rebuilding before runtime headers can be verified.
- Cross-browser testing was not run in real Safari, Firefox, Edge, Android Chrome, Samsung Internet or iPhone Safari during this audit.
- External links were not fetched over the public internet except npm audit advisory lookup.
