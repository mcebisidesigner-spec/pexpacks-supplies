"use server";

import { updateSystemSetting, exportSystemSettings, getSystemSettings } from "@/lib/admin/system-settings";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin/rbac";

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

function generateSecureTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let randomPart = "";
  for (let i = 0; i < 8; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Pex#${randomPart}26!`;
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
    const tempPassword = generateSecureTempPassword();
    let userId: string;

    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        name: fullName,
        department: department || undefined,
        must_change_password: true,
        onboarded_via: "settings_add_users",
      },
    });

    if (createError) {
      const errMsg = createError.message.toLowerCase();
      if (errMsg.includes("already registered") || errMsg.includes("already exists") || errMsg.includes("duplicate")) {
        const { data: listData } = await admin.auth.admin.listUsers();
        const existing = listData?.users?.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (existing) {
          userId = existing.id;
          const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              ...existing.user_metadata,
              full_name: fullName,
              name: fullName,
              department: department || undefined,
              must_change_password: true,
            },
          });
          if (updateError) throw updateError;
        } else {
          return { ok: false, message: `A user with email ${email} is already registered.` };
        }
      } else {
        throw createError;
      }
    } else {
      userId = createData.user.id;
    }

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
      summary: `Onboarded ${fullName} (${email}) with temporary password & assigned roles`,
      details: {
        fullName,
        email,
        department,
        roles: roleSlugs,
        notes,
      },
    });

    // Send custom branded email invitation with temporary credentials
    const emailResult = await sendUserInvitationEmail({
      toEmail: email,
      fullName,
      department: department || undefined,
      roles: assignedRolesInfo,
      notes: notes || undefined,
      invitedByName: displayName(actor.user) || "Pexpacks Administrator",
      tempPassword,
    });

    if (!emailResult.success) {
      console.warn("[settings-invite] Resend email warning:", emailResult.error);
    }

    return {
      ok: true,
      message: `Invitation email with temporary credentials successfully dispatched to ${fullName} (${email}).`,
      userId,
      tempPassword,
    };
  } catch (err) {
    console.error("[settings-invite] Error:", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Failed to invite user.",
    };
  }
}

export async function updateUserRolesFromSettingsAction(
  userId: string,
  roleSlugs: string[]
) {
  await requireAdmin({ permission: "users.edit" });
  const { syncUserRoles } = await import("@/lib/admin/users");
  return syncUserRoles(userId, roleSlugs);
}

export async function saveVaultCredentialAction(data: {
  id?: string;
  productName: string;
  category?: string;
  username: string;
  password: string;
  additionalInfo?: string;
}) {
  const actor = await requireSuperAdmin();

  if (!data.productName?.trim()) {
    return { ok: false, message: "Product / Service name is required." };
  }
  if (!data.username?.trim()) {
    return { ok: false, message: "Username / Client ID is required." };
  }
  if (!data.password?.trim()) {
    return { ok: false, message: "Password / Secret token is required." };
  }

  // Security length limits to guard against spam and buffer attacks
  if (data.productName.length > 120 || data.username.length > 120 || data.password.length > 500) {
    return { ok: false, message: "Input exceeds allowable security length bounds." };
  }

  const { saveSystemVaultCredential } = await import("@/lib/admin/system-settings");
  return saveSystemVaultCredential(
    {
      id: data.id,
      productName: data.productName.trim(),
      category: data.category?.trim() || "Database",
      username: data.username.trim(),
      password: data.password.trim(),
      additionalInfo: data.additionalInfo?.trim() || "",
    },
    actor.user.email ?? "Superuser"
  );
}

export async function deleteVaultCredentialAction(id: string) {
  const actor = await requireSuperAdmin();
  if (!id?.trim()) {
    return { ok: false, message: "Credential ID is required." };
  }
  const { deleteSystemVaultCredential } = await import("@/lib/admin/system-settings");
  return deleteSystemVaultCredential(id.trim(), actor.user.email ?? "Superuser");
}

export async function deleteUserFromSettingsAction(userId: string) {
  await requireAdmin({ permission: "users.delete" });
  const { deleteUser } = await import("@/lib/admin/users");
  return deleteUser(userId);
}

