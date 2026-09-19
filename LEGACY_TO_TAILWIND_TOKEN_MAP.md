# PEXPACKS LEGACY TO TAILWIND TOKEN MAP
**Document:** `LEGACY_TO_TAILWIND_TOKEN_MAP.md`  
**Reference Authoritative Source:** `pexpacks-OLD-WEBAPP/styles/tokens.css` & `styles/admin-dark.css`  
**Target Application:** `pexpacks-supplies` (`styles/globals.css` `@theme`)  
**Author:** Principal Frontend Architect & Design Systems Specialist  
**Date:** September 2026  
**Status:** COMPLETE INITIAL AUDIT TOKEN MAP — AWAITING PHASE EXECUTION  

---

## 1. Palette & Brand Color Tokens

| Legacy Token / Raw Value | Rendered Visual Purpose | Pexpacks Semantic Token | Tailwind v4 Utility Class |
| :--- | :--- | :--- | :--- |
| `--pex-navy: #1a2a40` | Brand Primary, Hero background, headings, dark badges | `--color-pex-navy` | `bg-pex-navy`, `text-pex-navy`, `border-pex-navy` |
| `--pex-keppel: #1a7a77` | Brand Primary Accent, active nav link, highlights, focus | `--color-pex-keppel` | `bg-pex-keppel`, `text-pex-keppel`, `border-pex-keppel`, `ring-pex-keppel` |
| `--pex-keppel-dark: #156966` | Hover state for keppel buttons, active pills | `--color-pex-keppel-dark` | `hover:bg-pex-keppel-dark`, `text-pex-keppel-dark` |
| `--pex-coral: #ff6f59` | Primary CTA, cart badge, discount tags, conversion pills | `--color-pex-coral` | `bg-pex-coral`, `text-pex-coral`, `border-pex-coral` |
| `--pex-coral-hover: #e85e4b` | Hover state for primary action buttons | `--color-pex-coral-hover` | `hover:bg-pex-coral-hover` |
| `--pex-bg: #ffffff` | Surface, card background, modal canvas, popup surface | `--color-surface` / `--color-card` | `bg-white`, `bg-card`, `bg-surface` |
| `--pex-body-bg: #f8f9fa` | Neutral page backdrop, off-white container canvas | `--color-background` / `--color-page-bg`| `bg-background`, `bg-page-bg` |
| `--pex-bg-soft: #f4f5f7` | Secondary surface, subtle contrast, item list zebra | `--color-secondary` / `--color-pex-bg-soft`| `bg-secondary`, `bg-pex-bg-soft` |
| `--pex-text: #172326` | High-contrast primary copy, body paragraphs | `--color-foreground` / `--color-ink` | `text-foreground`, `text-ink` |
| `--pex-muted: #4d5a5d` | Secondary copy, helper text, form placeholders, metadata | `--color-muted-foreground` | `text-muted-foreground`, `text-pex-muted` |
| `--pex-border: #e1e7ea` | Light structural dividers, input borders, card outlines | `--color-border` / `--color-pex-border` | `border-border`, `border-pex-border` |
| `--pex-success: #2f855a` | Stock confirmation, successful payment pill | `--color-success` | `bg-emerald-600`, `text-emerald-700` |
| `--pex-error: #b91c1c` | Validation error, alert banners, missing pack notices | `--color-destructive` | `bg-destructive`, `text-destructive` |
| `--pex-sme-amber: #f5a623` | Warning notices, pending approval indicators | `--color-warning` | `bg-amber-500`, `text-amber-600` |
| `--color-whatsapp: #25D366` | WhatsApp AI escalation button, direct contact pill | `--color-whatsapp` | `bg-[#25D366]`, `text-[#25D366]` |

---

## 2. Admin & Back-Office Color Tokens (`styles/admin-dark.css` & `db-tokens.css`)

| Legacy Token / Raw Value | Rendered Purpose | Pexpacks Admin Token | Tailwind v4 Utility Class |
| :--- | :--- | :--- | :--- |
| `--a-bg: #070b12` | Admin root canvas, dark viewport backdrop | `--admin-bg` | `bg-[#070b12]` |
| `--a-surface: #0c1322` | Admin card canvas, navigation sidebar | `--admin-surface` | `bg-[#0c1322]` |
| `--a-surface-2: #090e17` | Inner card wells, search bar input background | `--admin-surface-2` | `bg-[#090e17]` |
| `--a-surface-3: #1e293b` | Elevated panels, active popover menus | `--admin-surface-3` | `bg-[#1e293b]` |
| `--a-border: rgba(30,41,59,0.9)` | Admin subtle divider, table row borders | `--admin-border` | `border-slate-800` |
| `--a-accent: #10b981` | Admin primary emerald, active nav indicators, KPIs | `--admin-accent` | `text-emerald-500`, `bg-emerald-500` |
| `--a-accent-strong: #059669` | Highlight stat cards (e.g. Schools 3 342 card) | `--admin-accent-strong` | `bg-[#059669]`, `bg-emerald-600` |
| `--a-text: #ffffff` | Admin headings, primary labels, white icons | `--admin-text` | `text-white` |
| `--a-text-2: #cbd5e1` | Admin secondary body, table cell text | `--admin-text-2` | `text-slate-300` |
| `--a-text-3: #94a3b8` | Admin table headers, timestamp labels | `--admin-text-3` | `text-slate-400` |
| `--a-text-4: #64748b` | Admin subtle placeholders, inactive icons | `--admin-text-4` | `text-slate-500` |

---

## 3. Typography Tokens

| Legacy Typography Property | Authoritative Value | Pexpacks Token | Tailwind v4 Utility |
| :--- | :--- | :--- | :--- |
| **Heading Font Family** | `PexSans Alt`, Arial, sans-serif | `--font-heading` | `font-heading` |
| **Body Font Family** | `PexSans`, Arial, sans-serif | `--font-body` | `font-body` |
| **Hero Heading H1** | `clamp(36px, 5vw, 56px)`, weight 800, leading 1.1 | `--text-hero` | `text-[36px] md:text-[48px] lg:text-[56px] font-extrabold leading-[1.1]` |
| **Section Heading H2** | `clamp(24px, 3.5vw, 36px)`, weight 800 | `--text-h2` | `text-[24px] md:text-[32px] lg:text-[36px] font-extrabold` |
| **Card Title H3** | `20px`, weight 700, leading 1.3 | `--text-h3` | `text-[20px] font-bold leading-tight` |
| **Eyebrow / Kicker** | `13px`–`14px`, weight 700, tracking `0.04em` | `--text-eyebrow` | `text-[13px] md:text-[14px] font-bold uppercase tracking-wider` |
| **Standard Body** | `15px`–`16px`, weight 400, leading 1.5 | `--text-body` | `text-[15px] md:text-[16px] leading-relaxed` |
| **Form Label** | `14px`, weight 800, color `#1a2a40` | `--form-label-size` | `text-[14px] font-extrabold text-pex-navy` |
| **Helper / Caption** | `12px`–`13px`, weight 500, color `#4d5a5d` | `--text-caption` | `text-[12px] md:text-[13px] font-medium text-muted-foreground` |
| **Button Text** | `15px`, weight 700, tracking `0.02em` | `--text-btn` | `text-[15px] font-bold tracking-wide` |

---

## 4. Spacing, Heights & Geometry Tokens

| Legacy Dimension | Authoritative Value | Pexpacks Semantic Purpose | Tailwind v4 Class Equivalent |
| :--- | :--- | :--- | :--- |
| **Header Height (Desktop)** | `80px` | Desktop fixed global navigation | `h-[80px]` |
| **Header Height (Mobile)** | `64px` | Mobile fixed global navigation | `h-[64px]` |
| **Search Input Height** | `54px` | Customer school search and primary form inputs | `h-[54px]` |
| **Admin Input Height** | `36px` | Compact back-office form fields | `h-[36px]` |
| **Admin Button Height** | `40px` | Action controls in toolbar and table actions | `h-[40px]` |
| **Touch Target Minimum** | `48px` | Mobile buttons, hamburger menu, pills | `min-h-[48px]` |
| **Container Max-Width** | `1280px` (or `1440px` broad) | Site content bounds | `max-w-7xl` / `max-w-[1440px]` |
| **Mobile Gutter** | `16px` (`1rem`) | Lateral padding on viewports `< 768px` | `px-4` |
| **Tablet Gutter** | `24px` (`1.5rem`) | Lateral padding on 768px–1024px | `px-6` |
| **Desktop Gutter** | `32px` (`2rem`) | Lateral padding on viewports `> 1024px` | `px-8` |
| **Card Padding (Customer)** | `24px` to `32px` | Search cards, hero feature blocks | `p-6 md:p-8` |

---

## 5. Border Radii Tokens

| Legacy Token | Exact Measured Value | Usage Context | Tailwind v4 Utility Class |
| :--- | :--- | :--- | :--- |
| `--radius-pill` | `999px` | Buttons, CTAs, search helper chips, badges | `rounded-full` |
| `--radius-card-lg` | `30px` | Desktop search card, hero delivery image | `rounded-[30px]` |
| `--radius-card` | `24px` | Mobile search card, feature cards, product cards | `rounded-[24px]` |
| `--radius-image` | `20px` | Secondary hero visual assets, school badges | `rounded-[20px]` |
| `--radius-field` | `18px` | Customer form inputs, school search bar | `rounded-[18px]` |
| `--radius-card-compact`| `18px` | Compact pack cards, tray preview cards | `rounded-[18px]` |
| `--radius-md` | `16px` | Admin dashboard cards, dialog containers | `rounded-[16px]` |
| `--radius-sm` | `12px` | Dropdown menus, modal interior cards | `rounded-[12px]` |
| `--radius-xs` | `8px` | Tooltips, admin table badges, admin inputs | `rounded-[8px]` |

---

## 6. Shadows & Elevation Tokens

| Legacy Elevation | Exact Computed Value | Visual Purpose | Tailwind Utility Equivalent |
| :--- | :--- | :--- | :--- |
| `--shadow-card` | `0 12px 32px rgba(26, 42, 64, 0.05)` | Default white card elevation on off-white/navy bg | `shadow-[0_12px_32px_rgba(26,42,64,0.05)]` |
| `--shadow-card-hover` | `0 20px 48px rgba(26, 42, 64, 0.12)` | Interactive card hover state | `hover:shadow-[0_20px_48px_rgba(26,42,64,0.12)]` |
| `--shadow-pill` | `0 9px 18px rgba(26, 42, 64, 0.22)` | Primary CTA button drop shadow | `shadow-[0_9px_18px_rgba(26,42,64,0.22)]` |
| `--shadow-drawer` | `-24px 0 60px rgba(15, 37, 55, 0.22)` | GlobalPackTray slide-out drawer elevation | `shadow-[-24px_0_60px_rgba(15,37,55,0.22)]` |
| `--shadow-dropdown` | `0 18px 42px rgba(15, 35, 58, 0.14)` | Header user popover, school autocomplete list | `shadow-[0_18px_42px_rgba(15,35,58,0.14)]` |
| `--focus-ring` | `3px solid rgba(33, 158, 154, 0.55)` | Keyboard focus-visible accessibility ring | `focus-visible:ring-3 focus-visible:ring-pex-keppel/55` |
