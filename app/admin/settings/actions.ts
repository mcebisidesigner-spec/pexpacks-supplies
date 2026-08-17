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
