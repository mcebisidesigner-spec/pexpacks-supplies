"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import { updateSetting, type SettingFormState } from "@/lib/admin/settings";

export async function updateSettingsAction(
  section: string,
  _prev: SettingFormState,
  formData: FormData
): Promise<SettingFormState> {
  await requireAdmin({ permission: "settings.manage" });
  const result = await updateSetting(section, formData);
  if (result.ok) {
    revalidatePath("/admin/settings");
  }
  return result;
}
