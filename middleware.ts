import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = applySecurityHeaders(
    NextResponse.next({
      request: {
        headers: request.headers,
      },
    }),
  );

  // Initialize Supabase Server Client for Cookie Checks
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
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

  // 1. Mask Legacy /login Route with Stealth 404
  if (pathname === "/login") {
    return copyCookies(
      response,
      applySecurityHeaders(
        NextResponse.rewrite(new URL("/not-found", request.url), {
          status: 404,
          headers: response.headers,
        }),
      ),
    );
  }

  // 2. Protect Back-Office /admin and Sub-Routes (/admin/*)
  if (pathname.startsWith("/admin")) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Stealth Edge Masking: Return 404 rewrite if unauthenticated
    if (!user) {
      return copyCookies(
        response,
        applySecurityHeaders(
          NextResponse.rewrite(new URL("/not-found", request.url), {
            status: 404,
            headers: response.headers,
          }),
        ),
      );
    }

    return response;
  }

  // 3. Handle Hidden Gateway Route (/pex-console-secure)
  if (pathname === "/pex-console-secure") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If already authenticated, redirect directly to /admin
    if (user) {
      return copyCookies(
        response,
        applySecurityHeaders(
          NextResponse.redirect(new URL("/admin", request.url), {
            headers: response.headers,
          }),
        ),
      );
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
  matcher: ["/admin/:path*", "/admin", "/login", "/pex-console-secure"],
};
