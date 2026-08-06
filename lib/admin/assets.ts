import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import {
  getAdminUser,
  hasPermission,
  writeAuditLog,
  type PermissionKey,
  type AdminSession,
} from "@/lib/admin/rbac";

/**
 * Media library backed by the `school-assets` storage bucket and the `assets`
 * table. Uploads follow the same convention as school logos / pack images
 * (path = <folder>/<uuid>.<ext>), tracked via upsert on `path`.
 */

export type AssetRow = Database["public"]["Tables"]["assets"]["Row"];

export type AssetFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

const ACCEPTED_MIME_TYPES = new Set([
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/jpeg",
  "image/gif",
  "application/pdf",
]);
const MAX_BYTES = 10 * 1024 * 1024;

async function assertCan(permission: PermissionKey): Promise<AdminSession> {
  const session = await getAdminUser();
  if (!session || !hasPermission(session, permission)) {
    const err = new Error("You don't have permission to do that.");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return session;
}

function extFor(mime: string): string {
  switch (mime) {
    case "image/svg+xml":
      return "svg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "application/pdf":
      return "pdf";
    default:
      return "jpg";
  }
}

export async function listAssets(folder?: string): Promise<AssetRow[]> {
  const admin = createSupabaseAdminClient();
  let query = admin.from("assets").select("*");
  if (folder) query = query.eq("folder", folder);
  query = query.order("created_at", { ascending: false });
  const { data, error } = await query;
  if (error) {
    console.error("[assets] list failed:", error);
    return [];
  }
  return data ?? [];
}

export async function listAssetFolders(): Promise<string[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("assets").select("folder");
  if (error || !data) return ["uploads"];
  const folders = [...new Set(data.map((a) => a.folder).filter(Boolean))].sort();
  return folders.length > 0 ? folders : ["uploads"];
}

export async function uploadAsset(file: File, altText: string): Promise<AssetFormState> {
  const actor = await assertCan("assets.upload");
  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    return { ok: false, message: "File type not allowed. Use PNG, WebP, SVG, JPG, GIF or PDF." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "File exceeds the 10 MB limit." };
  }
  if (file.size === 0) {
    return { ok: false, message: "File is empty." };
  }

  const ext = extFor(file.type);
  const folder = "uploads";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("school-assets").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    console.error("[assets] storage upload failed:", error);
    return { ok: false, message: "Failed to upload file." };
  }

  const { data: urlData } = admin.storage.from("school-assets").getPublicUrl(data.path);

  const { error: dbError } = await admin.from("assets").upsert(
    {
      name: file.name,
      bucket: "school-assets",
      folder,
      path: data.path,
      public_url: urlData.publicUrl,
      mime_type: file.type,
      size_bytes: file.size,
      alt_text: altText.trim() || null,
      uploaded_by: actor.user.id,
    },
    { onConflict: "path" }
  );
  if (dbError) {
    console.error("[assets] db insert failed:", dbError);
    return { ok: false, message: "Uploaded but failed to record the asset." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "assets.upload",
    entityType: "asset",
    entityId: data.path,
    summary: `Uploaded asset ${file.name}`,
  });
  return { ok: true, message: "Asset uploaded." };
}

export async function updateAsset(
  id: string,
  patch: { name?: string; alt_text?: string }
): Promise<AssetFormState> {
  const actor = await assertCan("assets.manage");
  const admin = createSupabaseAdminClient();
  try {
    const { data, error } = await admin
      .from("assets")
      .update({
        name: patch.name?.trim() || undefined,
        alt_text: patch.alt_text?.trim() || null,
      })
      .eq("id", id)
      .select("name")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, message: "Asset not found." };

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "assets.update",
      entityType: "asset",
      entityId: id,
      summary: `Updated asset ${data.name}`,
    });
    return { ok: true, message: "Asset updated." };
  } catch (err) {
    console.error("[assets] update failed:", err);
    return { ok: false, message: "Failed to update asset." };
  }
}

export async function deleteAsset(id: string): Promise<AssetFormState> {
  const actor = await assertCan("assets.manage");
  const admin = createSupabaseAdminClient();
  try {
    const { data, error } = await admin
      .from("assets")
      .select("path, name")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, message: "Asset not found." };

    const { error: storageError } = await admin.storage
      .from("school-assets")
      .remove([data.path]);
    if (storageError) {
      console.error("[assets] storage remove failed:", storageError);
    }

    const { error: dbError } = await admin.from("assets").delete().eq("id", id);
    if (dbError) throw dbError;

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "assets.delete",
      entityType: "asset",
      entityId: id,
      summary: `Deleted asset ${data.name}`,
    });
    return { ok: true, message: "Asset deleted." };
  } catch (err) {
    console.error("[assets] delete failed:", err);
    return { ok: false, message: "Failed to delete asset." };
  }
}
