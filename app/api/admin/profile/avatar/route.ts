import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin/rbac";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "school-assets";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function authenticatedUser() {
  const session = await getAdminUser();
  if (!session || (!session.isSuperAdmin && session.roles.length === 0)) return null;
  return session;
}

export async function POST(request: Request) {
  const session = await authenticatedUser();
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!ALLOWED_TYPES[file.type]) {
    return NextResponse.json({ error: "Use a JPG, PNG or WebP image." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Profile images must be 2 MB or smaller." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const folder = `admin-avatars/${session.user.id}`;
  const path = `${folder}/profile-${Date.now()}.${ALLOWED_TYPES[file.type]}`;
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) {
    console.error("[profile-avatar] upload failed:", uploadError.message);
    return NextResponse.json({ error: "The profile image could not be uploaded." }, { status: 500 });
  }

  const { data: publicUrl } = admin.storage.from(BUCKET).getPublicUrl(path);
  const metadata = { ...(session.user.user_metadata ?? {}), avatar_url: publicUrl.publicUrl };
  const { error: updateError } = await admin.auth.admin.updateUserById(session.user.id, {
    user_metadata: metadata,
  });
  if (updateError) {
    await admin.storage.from(BUCKET).remove([path]);
    console.error("[profile-avatar] user update failed:", updateError.message);
    return NextResponse.json({ error: "The profile image could not be saved." }, { status: 500 });
  }

  const { data: priorFiles } = await admin.storage.from(BUCKET).list(folder);
  const oldPaths = (priorFiles ?? [])
    .filter((entry) => entry.name !== path.split("/").at(-1))
    .map((entry) => `${folder}/${entry.name}`);
  if (oldPaths.length) await admin.storage.from(BUCKET).remove(oldPaths);

  return NextResponse.json(
    { avatarUrl: publicUrl.publicUrl },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function DELETE() {
  const session = await authenticatedUser();
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const folder = `admin-avatars/${session.user.id}`;
  const metadata = { ...(session.user.user_metadata ?? {}), avatar_url: null };
  const { error } = await admin.auth.admin.updateUserById(session.user.id, {
    user_metadata: metadata,
  });
  if (error) {
    console.error("[profile-avatar] removal failed:", error.message);
    return NextResponse.json({ error: "The profile image could not be removed." }, { status: 500 });
  }

  const { data: files } = await admin.storage.from(BUCKET).list(folder);
  const paths = (files ?? []).map((entry) => `${folder}/${entry.name}`);
  if (paths.length) await admin.storage.from(BUCKET).remove(paths);

  return NextResponse.json({ avatarUrl: null }, { headers: { "Cache-Control": "private, no-store" } });
}
