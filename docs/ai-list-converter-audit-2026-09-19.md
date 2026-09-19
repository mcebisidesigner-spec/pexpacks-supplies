# AI List Converter Audit

Date: 2026-09-19
Status: READY WITH MINOR FOLLOW-UP

## Executive summary

The AI List Converter is wired into the existing Pexpacks commerce path. It is an input and matching service only: Gemini extracts requirements, Supabase resolves authoritative catalogue products, the existing persisted pack tray holds the reviewed selection, and the existing checkout/Ozow workflow creates and pays the order.

The audit repaired two P0 risks: unmatched requirements no longer receive an invented R25 price, and converted catalogue packs now use an authoritative server-side checkout branch rather than being rejected as a school-grade pack. No supplier cost, margin, or payment secret is returned to the browser.

## Actual architecture

```text
/order (Server page)
  -> components/AiListDropzone.tsx (client upload/paste UX)
  -> POST /api/ai-convert-list
       -> server-only Gemini 2.5 Flash extraction
       -> Zod schema validation
       -> match_stationery_products(text[]) service-role RPC
       -> short-lived private draft_carts row
  -> /cart/review?draft_id=...
       -> CartReviewClient
       -> existing Zustand persisted Global Pack Tray
  -> /checkout
       -> POST /api/checkout
       -> lib/checkout/trayCheckout.ts
            -> re-read master_products and pexco_rates
            -> create normal multi-pack order snapshots
            -> server-side Ozow handoff
```

## Input and privacy controls

- Supported upload formats: JPG/JPEG, PNG, WEBP, HEIC/HEIF, BMP, PDF; pasted text is also supported.
- Server limits: 10 MB file and 10,000 pasted characters.
- Server validation checks filename allow-list, declared MIME allow-list, and file signatures before AI processing.
- Uploaded bytes are sent inline to Gemini only for conversion. They are not written to Supabase Storage.
- `draft_carts` stores only the reviewed item summary, counts, subtotal and Pexcover preference. It does not retain learner details, document name/type, raw extraction, or metadata. Expired drafts are pruned by the existing cron/RPC.
- Gemini keys use server-only environment variables: `GEMINI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, or `GOOGLE_AI_API_KEY`. No `NEXT_PUBLIC_*` AI key is used.
- The system prompt explicitly treats uploaded/pasted content as untrusted data and prohibits it from setting products, prices, discounts, or commercial decisions.

## Commercial integrity

- AI output is validated with Zod: 1 to 200 items, non-empty names, quantities 1 to 99, and bounded string fields.
- The AI cannot create product IDs or prices. `match_stationery_products` returns only active `master_products` rows and public sales/Pexcover fields.
- Unmatched items have no price and block the review CTA until removed or the list is clarified. They cannot reach checkout.
- At checkout, an `ai-list` tray pack is re-resolved from `master_products` and `pexco_rates`. Browser product names, prices, totals, and Pexcover rates are ignored.
- Pexcover uses current active `pexco_rates` values on the server. The normal multi-pack order and Ozow payment paths are reused.

## Matching and performance

Migrations `00130_harden_ai_list_converter_matching.sql` and `00131_batch_ai_list_converter_matching.sql` are deployed to the linked Supabase project.

`00131` replaces serial per-item RPC calls with one `match_stationery_products(text[])` call per conversion. It uses the existing `master_products.name` `pg_trgm` GIN index as a candidate filter and applies an explicit `0.55` similarity floor before exposing a match. This lowers request count, avoids a separate converter catalogue, and keeps match quality conservative.

Live smoke result: 3 authoritative product matches completed in **812 ms**, under the 2,000 ms target. The smoke test also verifies that no cost-price fields are returned.

Run it with:

```powershell
npm.cmd run ai:converter:smoke
```

## Findings and resolutions

| ID | Severity | Finding | Resolution |
| --- | --- | --- | --- |
| ALC-01 | Critical | Unmatched lines had an R25 placeholder and could appear commercial. | Removed placeholder pricing; unresolved lines are unpriced and checkout-blocking. |
| ALC-02 | Critical | Converted packs lacked school-grade IDs and were rejected by the school-pack checkout validator. | Added the narrow `ai-list` source path, which revalidates canonical master product IDs server-side. |
| ALC-03 | High | File extension/client `accept` was insufficient to validate uploads. | Added server MIME allow-list and file-signature validation. |
| ALC-04 | High | AI documents could contain prompt-injection text. | Added explicit untrusted-data instruction and Zod output validation. |
| ALC-05 | Medium | One database RPC was executed per extracted line. | Added a single indexed batch matching RPC. |
| ALC-06 | Medium | Review UI carried legacy document metadata and a hard-coded Pexcover rate. | Uses privacy-safe draft fields and catalogue-provided Pexcover fields; checkout re-reads the rate. |

## Verification

| Check | Result |
| --- | --- |
| TypeScript | PASS (`npx tsc --noEmit`) |
| Converter focused tests | PASS, 11 tests |
| Remote batch matcher | PASS, 812 ms for 3 verified products |
| Migration deployment | PASS, `00130` and `00131` applied |
| Local Supabase lint | NOT RUN: Docker Desktop daemon was unavailable on this machine |
| Authenticated browser conversion, mixed tray, checkout, and live Ozow transaction | NOT RUN in this audit: requires a controlled operator session and payment-safe test path |

## Intentionally unchanged

- The existing Global Pack Tray, checkout UI, order persistence, payment gateway, and receipt workflow remain the only commerce path.
- No parallel AI cart, pricing engine, payment provider, public storage bucket, or catalogue was introduced.

## Remaining follow-up

1. Start Docker Desktop and run `npm.cmd run db:lint` for local schema linting.
2. Perform the authenticated operator smoke flow: `/order` -> review -> tray -> checkout -> Ozow controlled payment confirmation.
3. Keep `ai:converter:smoke` in release checks. Do not cache product prices in the converter: authoritative checkout revalidation is required when product pricing changes.