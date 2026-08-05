import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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

  // Guard all /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
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
      return NextResponse.rewrite(url);
    }
  }

  return response;
}
