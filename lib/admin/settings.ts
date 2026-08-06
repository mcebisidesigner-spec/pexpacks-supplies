import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";
import { getAdminUser, hasPermission, writeAuditLog, type PermissionKey, type AdminSession } from "@/lib/admin/rbac";

/**
 * System-wide configuration stored in `app_settings` (key → jsonb value).
 * Each section has a zod schema; the UI renders one form per section.
 */

export type SettingField = {
  key: string;
  label: string;
  type: "text" | "email" | "url" | "select" | "checkbox";
  options?: string[];
  help?: string;
};

const settingDefs = {
  general: {
    label: "General",
    description: "Store identity and contact details.",
    fields: [
      { key: "site_name", label: "Site name", type: "text" },
      { key: "support_email", label: "Support email", type: "email" },
      { key: "support_phone", label: "Support phone", type: "text" },
      { key: "site_url", label: "Site URL", type: "url" },
    ] as SettingField[],
    schema: z.object({
      site_name: z.string().trim().min(1, "Site name is required").max(80, "Too long"),
      support_email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
      support_phone: z.string().trim().max(40, "Too long"),
      site_url: z.string().trim().url("Enter a valid URL").max(200, "Too long"),
    }),
  },
  ordering: {
    label: "Ordering",
    description: "Defaults applied to new orders and checkout.",
    fields: [
      {
        key: "default_fulfilment_option",
        label: "Default fulfilment option",
        type: "select",
        options: ["School collection", "Home delivery"],
      },
      {
        key: "pexcover_enabled",
        label: "PexCover insurance",
        type: "checkbox",
        help: "Offer PexCover protection at checkout.",
      },
      {
        key: "currency",
        label: "Currency",
        type: "select",
        options: ["ZAR"],
      },
    ] as SettingField[],
    schema: z.object({
      default_fulfilment_option: z.enum(["School collection", "Home delivery"]),
      pexcover_enabled: z.boolean(),
      currency: z.enum(["ZAR"]),
    }),
  },
} as const;

/** Form fields that are checkboxes (presence = true). */
const BOOLEAN_FIELDS: Record<SettingKey, string[]> = {
  general: [],
  ordering: ["pexcover_enabled"],
};

type SettingKey = keyof typeof settingDefs;

export type AppSettings = {
  [K in SettingKey]: z.infer<(typeof settingDefs)[K]["schema"]>;
};

const DEFAULTS: AppSettings = {
  general: {
    site_name: "Pexpacks",
    support_email: "hello@pexpacks.co.za",
    support_phone: "",
    site_url: "https://pexpacks.co.za",
  },
  ordering: {
    default_fulfilment_option: "School collection",
    pexcover_enabled: true,
    currency: "ZAR",
  },
};

async function assertCan(permission: PermissionKey): Promise<AdminSession> {
  const session = await getAdminUser();
  if (!session || !hasPermission(session, permission)) {
    const err = new Error("You don't have permission to do that.");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return session;
}

export type SettingSection = {
  key: SettingKey;
  label: string;
  description: string;
  fields: SettingField[];
};

export function settingSections(): SettingSection[] {
  return (Object.keys(settingDefs) as SettingKey[]).map((key) => ({
    key,
    label: settingDefs[key].label,
    description: settingDefs[key].description,
    fields: settingDefs[key].fields,
  }));
}

export function settingFields(section: SettingKey): SettingField[] {
  return settingDefs[section].fields;
}

export async function getSettings(): Promise<AppSettings> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("app_settings").select("key, value");
  if (error) return DEFAULTS;

  const result = structuredClone(DEFAULTS);
  for (const row of data ?? []) {
    const key = row.key as SettingKey;
    if (!(key in settingDefs)) continue;
    const value = row.value as Record<string, unknown>;
    const current = result[key] as Record<string, unknown>;
    for (const field of Object.keys(current)) {
      if (value[field] !== undefined) {
        current[field] = value[field];
      }
    }
  }
  return result;
}

export type SettingFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

function raw(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export async function updateSetting(
  section: string,
  formData: FormData
): Promise<SettingFormState> {
  const actor = await assertCan("settings.manage");
  const def = settingDefs[section as SettingKey];
  if (!def) return { ok: false, message: "Unknown settings section." };

  const input: Record<string, unknown> = {};
  for (const key of Object.keys(def.schema.shape) as (keyof typeof def.schema.shape)[]) {
    if (BOOLEAN_FIELDS[section as SettingKey].includes(String(key))) {
      input[key] = formData.has(String(key));
    } else {
      input[key] = raw(formData, String(key));
    }
  }

  const parsed = def.schema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("app_settings").upsert(
      {
        key: section,
        value: parsed.data as unknown as Json,
        updated_by: actor.user.id,
      },
      { onConflict: "key" }
    );
    if (error) throw error;

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "settings.update",
      entityType: "settings",
      entityId: section,
      summary: `Updated ${def.label} settings`,
    });

    return { ok: true, message: `${def.label} settings saved.` };
  } catch (err) {
    console.error("[settings] update failed:", err);
    return { ok: false, message: "Failed to save settings." };
  }
}
