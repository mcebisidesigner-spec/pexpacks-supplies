import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = (__ENV.BASE_URL || "https://staging.pexpacks.co.za").replace(/\/$/, "");
const INCLUDE_SEARCH = __ENV.LOAD_TEST_INCLUDE_SEARCH === "true";
const PROFILE = (__ENV.LOAD_TEST_PROFILE || "pilot").toLowerCase();
const IS_ENTERPRISE_PROFILE = PROFILE === "enterprise";
const REQUESTED_PILOT_VUS = Number(__ENV.LOAD_TEST_TARGET_VUS || 50);
const PILOT_TARGET_VUS = Number.isFinite(REQUESTED_PILOT_VUS)
  ? Math.min(Math.max(Math.round(REQUESTED_PILOT_VUS), 10), 100)
  : 50;

export const options = {
  scenarios: {
    public_storefront: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: IS_ENTERPRISE_PROFILE
        ? [
            { duration: "1m", target: 100 },
            { duration: "2m", target: 500 },
            { duration: "2m", target: 1000 },
            { duration: "1m", target: 1000 },
            { duration: "1m", target: 0 },
          ]
        : [
            { duration: "30s", target: Math.ceil(PILOT_TARGET_VUS / 2) },
            { duration: "1m", target: PILOT_TARGET_VUS },
            { duration: "2m", target: PILOT_TARGET_VUS },
            { duration: "30s", target: 0 },
          ],
      gracefulRampDown: "30s",
      tags: { profile: PROFILE },
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800", "p(99)<1500"],
    checks: ["rate>0.99"],
  },
};

const PUBLIC_ROUTES = [
  "/",
  "/schools",
  "/order",
  "/pexcover",
  "/checkout",
  "/blog",
  "/contact",
];

export default function () {
  const route = PUBLIC_ROUTES[(__VU + __ITER) % PUBLIC_ROUTES.length];
  const response = http.get(BASE_URL + route, {
    tags: { flow: "public-page", route },
    redirects: 2,
  });

  check(response, {
    "public route returns 2xx": (result) => result.status >= 200 && result.status < 300,
  });

  if (INCLUDE_SEARCH && (__VU + __ITER) % 5 === 0) {
    const search = http.get(
      BASE_URL + "/api/schools/search?q=primrose&limit=3",
      { tags: { flow: "school-search" } },
    );
    check(search, {
      "school search returns 2xx or intentional rate limit": (result) =>
        (result.status >= 200 && result.status < 300) || result.status === 429,
    });
  }

  sleep(0.2 + Math.random() * 0.6);
}