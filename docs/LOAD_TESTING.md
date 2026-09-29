# Staging Load Test

This runbook uses k6 against a production-like staging deployment. The default profile is a realistic pilot benchmark of 50 concurrent virtual users. It is designed to model parents browsing schools, packs, Pexcover, checkout, blog and contact pages during a campaign or newsletter spike.

The 1,000-VU profile remains available as a non-blocking enterprise-capacity test. It should not delay a localized pilot launch and should only be run when staging observability, distributed runners, seeded data and provider sandbox credentials are ready.

## Pilot benchmark

Run the default 50-user profile:

    $env:BASE_URL = "https://staging.pexpacks.co.za"
    $env:LOAD_TEST_PROFILE = "pilot"
    k6 run scripts/load-test.k6.js

For a larger campaign rehearsal, run up to 100 VUs:

    $env:LOAD_TEST_TARGET_VUS = "100"
    k6 run scripts/load-test.k6.js

The pilot profile ramps up, holds the target for two minutes, then ramps down. It exercises cacheable public pages only. To include school search requests:

    $env:LOAD_TEST_INCLUDE_SEARCH = "true"
    k6 run scripts/load-test.k6.js

Search rate limiting is expected for a single load-generator IP. Measure search capacity from distributed, allow-listed staging runners and model one request per typing pause rather than a request on every keystroke.

## Enterprise capacity profile

Run the deferred 1,000-VU profile explicitly:

    $env:LOAD_TEST_PROFILE = "enterprise"
    k6 run scripts/load-test.k6.js

This profile is for capacity planning and release confidence, not a pilot launch gate. Do not interpret its result as a forecast of daily visitors without matching CDN caching, distinct client IPs, database pooling, and production infrastructure.

## Release thresholds

For the pilot benchmark:

- HTTP failure rate below 1%.
- p95 response time below 800 ms.
- p99 response time below 1.5 s.
- Check success above 99%.

Record p50, p95 and p99 separately for public pages and school search. Treat intentional 429 responses from the configured search limiter as a rate-limit observation, not a server failure, and confirm that normal typing pauses are not blocked.

## Operational checks

A passing k6 run is necessary but not sufficient. During the pilot run, capture:

- Supabase query latency, PgBouncer pool usage, connection errors and `remaining connection slots` events.
- Upstash Redis rate-limit latency, rejected requests and false-positive 429 responses.
- Checkout page and order-tray hydration timings. Payment-provider handoff checks must use Ozow sandbox credentials and must never create real orders.
- Vercel function duration, cold starts, memory, 5xx responses and cache-hit ratio for the tested routes.
- Browser traces for mobile school search, pack selection, drawer opening and checkout navigation.

Do not enable checkout, payment, list-conversion, or draft-cart mutations in a shared staging environment without seeded test identities, explicit cleanup, and provider sandbox credentials. Add those workflows as separate opt-in scenarios after the staging data contract is approved.