import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionValue,
  verifyAdminSessionValue,
} from "@/lib/admin/session-policy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const currentValue = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1);
  const session = await verifyAdminSessionValue(currentValue, user.id);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, mode: session.mode });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    await createAdminSessionValue(user.id, session.mode),
    adminSessionCookieOptions,
  );
  return response;
}