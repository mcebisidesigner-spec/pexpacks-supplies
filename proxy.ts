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

export async function proxy(request: NextRequest) {
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

  // 1. Handle Legacy /login Route by safely redirecting to the console gateway
  if (pathname === "/login") {
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet, nocache",
    );
    return copyCookies(
      response,
      applySecurityHeaders(
        NextResponse.redirect(new URL("/pex-console-secure", request.url), {
          headers: response.headers,
        }),
      ),
    );
  }

  // 2. Protect Back-Office /admin and Sub-Routes (/admin/*)
  if (pathname.startsWith("/admin")) {
    let user = null;
    try {
      const authResult = await supabase.auth.getUser();
      user = authResult.data?.user ?? null;
    } catch (err) {
      console.error("[proxy] auth check failed:", err);
    }

    // Redirect unauthenticated back-office requests to secure gateway
    if (!user) {
      return copyCookies(
        response,
        applySecurityHeaders(
          NextResponse.redirect(new URL("/pex-console-secure", request.url), {
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

    return response;
  }

  // 3. Handle Hidden Gateway Route (/pex-console-secure & /pex-console)
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
  matcher: [
    "/admin/:path*",
    "/admin",
    "/login",
    "/pex-console-secure",
    "/pex-console",
  ],
};
