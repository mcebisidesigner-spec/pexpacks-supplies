# Staging Load Test

This profile uses k6 and is intentionally pointed at staging. It ramps to 1,000 virtual users over six minutes, holds the peak for one minute, then ramps down.

Run:

    $env:BASE_URL = "https://staging.pexpacks.co.za"
    k6 run scripts/load-test.k6.js

The default scenario exercises cacheable public pages only. To include school search:

    $env:LOAD_TEST_INCLUDE_SEARCH = "true"
    k6 run scripts/load-test.k6.js

Search rate limiting is expected for a single load-generator IP. Run search capacity from a distributed, allow-listed staging runner when measuring the search backend itself.

Release thresholds:

- HTTP failure rate below 1%.
- p95 response time below 800 ms.
- p99 response time below 1.5 s.
- Check success above 99%.

Do not enable checkout, payment, list-conversion, or draft-cart mutations in a shared staging environment without seeded test identities, explicit cleanup, and provider sandbox credentials. Those workflows should be added as separate opt-in scenarios after the staging data contract is approved.