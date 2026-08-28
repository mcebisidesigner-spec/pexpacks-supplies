"use server";

import { updateSystemSetting, exportSystemSettings, getSystemSettings } from "@/lib/admin/system-settings";
import { requireAdmin } from "@/lib/admin/rbac";

export async function updateSystemSettingAction(
  key: string,
  rawValue: unknown,
  reason?: string
) {
  await requireAdmin({ permission: "settings.manage" });
  return updateSystemSetting(key, rawValue, reason);
}

export async function updateSettingsAction(
  section: string,
  _prevState: unknown,
  formData: FormData
) {
  await requireAdmin({ permission: "settings.manage" });
  const key = formData.get("key") ? String(formData.get("key")) : section;
  const val = formData.get("value") ?? "";
  const res = await updateSystemSetting(key, val);
  return { ok: res.ok, message: res.message, errors: res.errors };
}

export async function exportSettingsAction() {
  await requireAdmin({ permission: "settings.manage" });
  const json = await exportSystemSettings();
  return { ok: true, json };
}

export async function restoreSettingsAction(
  jsonContent: string,
  reason?: string
) {
  await requireAdmin({ permission: "settings.manage" });
  try {
    const parsed = JSON.parse(jsonContent);
    if (!parsed || typeof parsed !== "object" || !parsed.settings) {
      return { ok: false, message: "Invalid settings export payload format." };
    }

    const settingsMap = parsed.settings as Record<string, { value: unknown }>;
    let updatedCount = 0;

    for (const [key, item] of Object.entries(settingsMap)) {
      if (item && item.value !== undefined) {
        const res = await updateSystemSetting(
          key,
          item.value,
          reason || "Restored from system backup snapshot"
        );
        if (res.ok) updatedCount++;
      }
    }

    return {
      ok: true,
      message: `Restored ${updatedCount} settings from data snapshot.`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Failed to parse JSON file.",
    };
  }
}

export async function inviteUserFromSettingsAction(formData: FormData) {
  const actor = await requireAdmin({ permission: "users.create" });
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const { listRoles } = await import("@/lib/admin/users");
  const { writeAuditLog, displayName } = await import("@/lib/admin/rbac");
  const { sendUserInvitationEmail } = await import("@/lib/email/sendUserInvitationEmail");

  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const department = String(formData.get("department") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const roleSlugs = formData.getAll("roles").map((r) => String(r)).filter(Boolean);

  if (!fullName) {
    return { ok: false, message: "Please enter the user's full name." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { ok: false, message: "Please provide a valid email address." };
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          full_name: fullName,
          name: fullName,
          department: department || undefined,
          onboarded_via: "settings_add_users",
        },
      }
    );

    if (inviteError) {
      if (inviteError.message.includes("already registered")) {
        return { ok: false, message: `A user with email ${email} is already registered.` };
      }
      throw inviteError;
    }

    const userId = inviteData?.user?.id;
    if (!userId) {
      throw new Error("No user record returned from authentication gateway.");
    }

    // Grant roles
    const allRoles = await listRoles();
    const assignedRolesInfo: { slug: string; name: string; description: string }[] = [];

    for (const slug of roleSlugs) {
      try {
        await admin.rpc("grant_role", {
          target_user_id: userId,
          role_slug: slug,
          granted_by: actor.user.id,
        });
        const matched = allRoles.find((r) => r.slug === slug);
        if (matched) {
          assignedRolesInfo.push({
            slug: matched.slug,
            name: matched.name,
            description: matched.description || "",
          });
        }
      } catch (roleErr) {
        console.error(`[settings-invite] grant_role ${slug} failed:`, roleErr);
      }
    }

    // Write audit log
    void writeAuditLog({
      actorId: actor.user.id,
      actorName: displayName(actor.user) || actor.user.email,
      action: "users.create",
      entityType: "user",
      entityId: userId,
      summary: `Onboarded & invited ${fullName} (${email}) via Settings Add Users`,
      details: {
        fullName,
        email,
        department,
        roles: roleSlugs,
        notes,
      },
    });

    // Send custom branded email invitation
    void sendUserInvitationEmail({
      toEmail: email,
      fullName,
      department: department || undefined,
      roles: assignedRolesInfo,
      notes: notes || undefined,
      invitedByName: displayName(actor.user) || "Pexpacks Administrator",
    });

    return {
      ok: true,
      message: `Invitation email successfully dispatched to ${fullName} (${email}).`,
      userId,
    };
  } catch (err) {
    console.error("[settings-invite] Error:", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Failed to invite user.",
    };
  }
}

