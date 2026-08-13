import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_IDLE_MS,
  ADMIN_LAST_ACTIVITY_COOKIE,
} from "@/lib/admin/idle";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Guard all /admin routes. Auth is only needed for the admin panel, so the
  // getUser() network round-trip is skipped for every public page/API request.
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // IMPORTANT: Avoid writing logic between createServerClient and getUser.
    // getUser() refreshes expired tokens and retrieves authenticated user metadata.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const appMeta = user?.app_metadata as Record<string, unknown> | undefined;
    const role = appMeta?.role;
    const roles = Array.isArray(appMeta?.roles) ? appMeta.roles : [];
    const isStaff =
      role === "admin" ||
      roles.some((r) =>
        [
          "super_admin",
          "administrator",
          "content_manager",
          "school_manager",
          "office_manager",
          "order_manager",
          "viewer",
        ].includes(r as string)
      );

    // If the user is not logged in OR is not staff, mask the route with 404.
    if (!user || !isStaff) {
      const url = request.nextUrl.clone();
      url.pathname = "/404";
      const masked = NextResponse.rewrite(url);
      masked.cookies.set(ADMIN_LAST_ACTIVITY_COOKIE, "", { path: "/", maxAge: 0 });
      return masked;
    }

    // Auto sign-out after 15 minutes of continuous inactivity so the admin
    // panel does not stay logged in on unattended or shared browsers.
    const now = Date.now();
    const lastRaw = request.cookies.get(ADMIN_LAST_ACTIVITY_COOKIE)?.value;
    const last = lastRaw ? Number(lastRaw) : NaN;
    if (Number.isFinite(last) && now - last > ADMIN_IDLE_MS) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("[auth] idle sign out failed:", err);
      }
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      const redirected = NextResponse.redirect(loginUrl);
      response.cookies.getAll().forEach((cookie: { name: string; value: string; httpOnly?: boolean; secure?: boolean; sameSite?: true | false | "lax" | "strict" | "none"; maxAge?: number }) =>
        redirected.cookies.set(cookie.name, cookie.value, {
          path: "/",
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: cookie.sameSite,
          maxAge: cookie.maxAge,
        })
      );
      return redirected;
    }

    response.cookies.set(ADMIN_LAST_ACTIVITY_COOKIE, String(now), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    // Inject Vercel Edge CDN Caching Directives with Strict Session Isolation
    response.headers.set(
      "Cache-Control",
      "private, s-maxage=10, stale-while-revalidate=59"
    );
    response.headers.set("Vary", "Cookie, Authorization");
  }

  return response;
}
