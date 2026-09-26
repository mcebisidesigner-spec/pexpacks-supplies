import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SLIDING_SESSION_TTL_SECONDS,
  isSessionActiveInRedis,
  touchAdminSessionRedis,
  verifyAdminSessionValue,
} from "@/lib/admin/session-policy";

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  return response;
}

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  return target;
}

// ─── Edge Rate Limiting via Upstash Redis ───
let edgeRedis: Redis | null | undefined;
let authLimiter: Ratelimit | null = null;
let adminLimiter: Ratelimit | null = null;

function getEdgeLimiters() {
  if (edgeRedis !== undefined) {
    return { authLimiter, adminLimiter };
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    edgeRedis = new Redis({ url, token });
    // Tier 1: Auth & Stealth Login - Strict 5 attempts per 10 minutes sliding window
    authLimiter = new Ratelimit({
      redis: edgeRedis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "pexpacks:edge:auth",
      analytics: false,
    });
    // Tier 2: Back-office Admin Console - Operational 60 requests per 1 minute sliding window
    adminLimiter = new Ratelimit({
      redis: edgeRedis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "pexpacks:edge:admin",
      analytics: false,
    });
  } else {
    edgeRedis = null;
    authLimiter = null;
    adminLimiter = null;
  }

  return { authLimiter, adminLimiter };
}

function isLoopbackIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "localhost" ||
    ip === "0.0.0.0" ||
    ip.startsWith("127.")
  );
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");
  return (
    forwardedFor?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    cfIp?.trim() ||
    "127.0.0.1"
  );
}

function createRateLimit429Response(
  limit: number,
  remaining: number,
  reset: number,
): NextResponse {
  const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  const rateLimitResponse = new NextResponse(
    JSON.stringify({
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please wait before retrying.",
      retryAfter: retryAfterSeconds,
    }),
    {
      status: 429,
      statusText: "Too Many Requests",
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfterSeconds.toString(),
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, nocache",
      },
    },
  );

  return applySecurityHeaders(rateLimitResponse);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIp = getClientIp(request);
  const { authLimiter: authGate, adminLimiter: adminGate } = getEdgeLimiters();

  // 1. Terminate legacy /login and /admin/login routes with 404
  if (pathname === "/login" || pathname === "/admin/login") {
    const deadRouteResponse = new NextResponse(null, {
      status: 404,
      statusText: "Not Found",
      headers: {
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, nocache",
      },
    });
    return applySecurityHeaders(deadRouteResponse);
  }

  // 2. Edge Rate Limiting: Strict Auth / Stealth Gateway Tier (5 attempts / 10 min)
  // Auth submissions (POST) & /api/auth use strict 5 attempts / 10 min window.
  // Page views (GET) on console gateway use the back-office 60 req / 1 min window to prevent false lockouts.
  const isDev = process.env.NODE_ENV === "development";
  const isLocalClient = isDev && isLoopbackIp(clientIp);

  const isAuthSubmission =
    pathname.startsWith("/api/auth") ||
    ((pathname === "/pex-console-secure" || pathname === "/pex-console") &&
      request.method !== "GET");

  const isConsolePageView =
    (pathname === "/pex-console-secure" || pathname === "/pex-console") &&
    request.method === "GET";

  if (isAuthSubmission) {
    if (authGate && !isLocalClient) {
      try {
        const rateResult = await authGate.limit(clientIp);
        if (!rateResult.success) {
          return createRateLimit429Response(
            rateResult.limit,
            rateResult.remaining,
            rateResult.reset,
          );
        }
      } catch (err) {
        console.warn("[proxy] Upstash auth rate limit check failed:", err);
      }
    }
  }

  // 3. Edge Rate Limiting: Back-office Admin Tier (60 req / 1 min)
  if (pathname.startsWith("/admin") || isConsolePageView) {
    if (adminGate && !isLocalClient) {
      try {
        const rateResult = await adminGate.limit(clientIp);
        if (!rateResult.success) {
          return createRateLimit429Response(
            rateResult.limit,
            rateResult.remaining,
            rateResult.reset,
          );
        }
      } catch (err) {
        console.warn("[proxy] Upstash admin rate limit check failed:", err);
      }
    }
  }

  let response = applySecurityHeaders(
    NextResponse.next({
      request: {
        headers: request.headers,
      },
    }),
  );

  // Return immediately for API routes and non-admin routes once rate limiting checks pass
  if (
    !pathname.startsWith("/admin") &&
    pathname !== "/pex-console-secure" &&
    pathname !== "/pex-console"
  ) {
    return response;
  }

  // Initialize Supabase Server Client for Cookie Checks on admin/console routes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = applySecurityHeaders(
            NextResponse.next({
              request: {
                headers: request.headers,
              },
            }),
          );

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 4. Protect Back-Office /admin and Sub-Routes (/admin/*)
  if (pathname.startsWith("/admin")) {
    try {
      let user = null;
      try {
        const authResult = await supabase.auth.getUser();
        user = authResult.data?.user ?? null;
      } catch (err) {
        console.error("[proxy] auth check failed:", err);
      }

      const sessionCookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

      // Cryptographic signature check
      const adminSession = user
        ? await verifyAdminSessionValue(sessionCookieValue, user.id)
        : null;

      // In-Memory Sliding Expiration check in Upstash Redis (auto-eviction past 20 minutes idle)
      const sessionActiveInRedis = sessionCookieValue
        ? await isSessionActiveInRedis(sessionCookieValue)
        : false;

      // Redirect unauthenticated, tampered, or idle-expired requests to secure gateway
      if (!user || !adminSession || !sessionActiveInRedis) {
        if (user) {
          try {
            await supabase.auth.signOut();
          } catch {
            // Cookie clearing below still blocks another admin request.
          }
        }
        response.cookies.set(ADMIN_SESSION_COOKIE, "", {
          path: "/",
          expires: new Date(0),
        });
        return copyCookies(
          response,
          applySecurityHeaders(
            NextResponse.redirect(new URL("/pex-console-secure", request.url), {
              headers: response.headers,
            }),
          ),
        );
      }

      // Slide session expiration in Redis by 20 minutes on active administrative navigation
      if (sessionCookieValue) {
        touchAdminSessionRedis(
          sessionCookieValue,
          ADMIN_SLIDING_SESSION_TTL_SECONDS,
        ).catch(() => {});
      }

      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      response.headers.set("Surrogate-Control", "no-store");

      return response;
    } catch (err) {
      console.error("[proxy] unexpected admin route error:", err);
      return copyCookies(
        response,
        applySecurityHeaders(
          NextResponse.redirect(new URL("/pex-console-secure", request.url), {
            headers: response.headers,
          }),
        ),
      );
    }
  }

  // 5. Handle Hidden Gateway Route (/pex-console-secure & /pex-console)
  if (pathname === "/pex-console-secure" || pathname === "/pex-console") {
    if (pathname === "/pex-console") {
      const targetUrl = new URL("/pex-console-secure", request.url);
      targetUrl.search = request.nextUrl.search;
      return NextResponse.redirect(targetUrl);
    }

    let user = null;
    try {
      const authResult = await supabase.auth.getUser();
      user = authResult.data?.user ?? null;
    } catch (err) {
      console.error("[proxy] console auth check failed:", err);
    }

    const sessionCookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const adminSession = user
      ? await verifyAdminSessionValue(sessionCookieValue, user.id)
      : null;

    const sessionActiveInRedis = sessionCookieValue
      ? await isSessionActiveInRedis(sessionCookieValue)
      : false;

    // Only active OTP-created browser session with valid Redis state may bypass gateway
    if (user && adminSession && sessionActiveInRedis) {
      return copyCookies(
        response,
        applySecurityHeaders(
          NextResponse.redirect(new URL("/admin", request.url), {
            headers: response.headers,
          }),
        ),
      );
    }

    if (user) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Clearing the gate below still requires a fresh OTP login.
      }
      response.cookies.set(ADMIN_SESSION_COOKIE, "", {
        path: "/",
        expires: new Date(0),
      });
    }
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet, nocache",
    );

    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/login",
    "/pex-console-secure",
    "/pex-console",
    "/api/auth/:path*",
  ],
};
