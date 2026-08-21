import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Security Headers Enforcement
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
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
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 1. Mask Legacy /login Route with Stealth 404
  if (pathname === "/login") {
    return NextResponse.rewrite(new URL("/not-found", request.url), {
      status: 404,
      headers: response.headers,
    });
  }

  // 2. Protect Back-Office /admin and Sub-Routes (/admin/*)
  if (pathname.startsWith("/admin")) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isStaff =
      user &&
      ((user.app_metadata as Record<string, unknown> | undefined)?.role === "admin" ||
        Array.isArray(
          (user.app_metadata as Record<string, unknown> | undefined)?.roles
        ));

    // Stealth Edge Masking: Return 404 rewrite if unauthenticated or not staff
    if (!user || !isStaff) {
      return NextResponse.rewrite(new URL("/not-found", request.url), {
        status: 404,
        headers: response.headers,
      });
    }

    return response;
  }

  // 3. Handle Hidden Gateway Route (/pex-console)
  if (pathname === "/pex-console") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isStaff =
      user &&
      ((user.app_metadata as Record<string, unknown> | undefined)?.role === "admin" ||
        Array.isArray(
          (user.app_metadata as Record<string, unknown> | undefined)?.roles
        ));

    // If already authenticated as staff, redirect directly to /admin
    if (user && isStaff) {
      return NextResponse.redirect(new URL("/admin", request.url), {
        headers: response.headers,
      });
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/login",
    "/pex-console",
  ],
};
