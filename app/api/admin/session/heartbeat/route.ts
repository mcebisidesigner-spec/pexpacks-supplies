import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionValue,
  verifyAdminSessionValue,
} from "@/lib/admin/session-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { ok: false },
      { status: 403, headers: noStoreHeaders },
    );
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    return NextResponse.json(
      { ok: false },
      { status: 401, headers: noStoreHeaders },
    );
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const currentValue = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1);
  const session = await verifyAdminSessionValue(currentValue, user.id);
  if (!session) {
    return NextResponse.json(
      { ok: false },
      { status: 401, headers: noStoreHeaders },
    );
  }

  const response = NextResponse.json(
    { ok: true, mode: session.mode },
    { headers: noStoreHeaders },
  );
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    await createAdminSessionValue(user.id, session.mode),
    adminSessionCookieOptions,
  );
  return response;
}
