import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";
import {
  getAdminUser,
  hasPermission,
  writeAuditLog,
  type PermissionKey,
  type AdminSession,
} from "@/lib/admin/rbac";

/**
 * System-wide configuration stored in `system_settings`.
 * `system_settings` is the only active settings source of truth.
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
      site_name: z
        .string()
        .trim()
        .min(1, "Site name is required")
        .max(80, "Too long"),
      support_email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Enter a valid email")
        .max(200),
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
    support_email: "helpme@pexpacks.co.za",
    support_phone: "",
    site_url: "https://pexpacks.co.za",
  },
  ordering: {
    default_fulfilment_option: "School collection",
    pexcover_enabled: true,
    currency: "ZAR",
  },
};

type SystemSettingPointer = {
  key: string;
  category: string;
  valueType: "string" | "boolean" | "email";
  description: string;
  isPublic?: boolean;
};

type SystemSettingRow = {
  key: string;
  value: unknown;
};

type SystemSettingUpsertRow = {
  key: string;
  category: string;
  value: Json;
  value_type: SystemSettingPointer["valueType"];
  scope: "global";
  description: string;
  is_sensitive: boolean;
  is_public: boolean;
  requires_approval: boolean;
  updated_by: string;
  updated_at: string;
};

type SystemSettingsTable = {
  select(columns: string): {
    in(
      column: string,
      values: string[],
    ): Promise<{
      data: SystemSettingRow[] | null;
      error: { message?: string } | null;
    }>;
  };
  upsert(
    rows: SystemSettingUpsertRow[],
    options: { onConflict: string },
  ): Promise<{ error: { message?: string } | null }>;
};

function systemSettingsTable(
  admin: ReturnType<typeof createSupabaseAdminClient>,
) {
  return (admin.from as unknown as (table: string) => SystemSettingsTable)(
    "system_settings",
  );
}

const SYSTEM_SETTING_MAP: {
  [K in SettingKey]: Record<
    keyof AppSettings[K] & string,
    SystemSettingPointer
  >;
} = {
  general: {
    site_name: {
      key: "general.site_name",
      category: "general",
      valueType: "string",
      description: "Primary customer-facing brand name",
      isPublic: true,
    },
    support_email: {
      key: "business.support_email",
      category: "business",
      valueType: "email",
      description: "Primary customer support contact email",
      isPublic: true,
    },
    support_phone: {
      key: "business.support_phone",
      category: "business",
      valueType: "string",
      description: "Customer support helpline telephone number",
      isPublic: true,
    },
    site_url: {
      key: "general.site_url",
      category: "general",
      valueType: "string",
      description: "Official web application canonical URL",
      isPublic: true,
    },
  },
  ordering: {
    default_fulfilment_option: {
      key: "orders.default_fulfilment",
      category: "orders",
      valueType: "string",
      description: "Default selected fulfilment method at checkout",
      isPublic: true,
    },
    pexcover_enabled: {
      key: "orders.pexcover_enabled",
      category: "orders",
      valueType: "boolean",
      description: "Offer PexCover protection at checkout",
    },
    currency: {
      key: "orders.currency",
      category: "orders",
      valueType: "string",
      description: "Default checkout and reporting currency",
    },
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
  const result = structuredClone(DEFAULTS);

  const systemKeys = Object.values(SYSTEM_SETTING_MAP).flatMap((section) =>
    Object.values(section).map((setting) => setting.key),
  );

  try {
    const { data, error } = await systemSettingsTable(admin)
      .select("key,value")
      .in("key", systemKeys);

    if (!error) {
      const values = new Map((data ?? []).map((row) => [row.key, row.value]));

      for (const sectionKey of Object.keys(
        SYSTEM_SETTING_MAP,
      ) as SettingKey[]) {
        const current = result[sectionKey] as Record<string, unknown>;
        for (const [fieldKey, pointer] of Object.entries(
          SYSTEM_SETTING_MAP[sectionKey],
        )) {
          if (values.has(pointer.key))
            current[fieldKey] = values.get(pointer.key);
        }
      }

      return result;
    }
  } catch {
    // Table query failed — return defaults.
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
  formData: FormData,
): Promise<SettingFormState> {
  const actor = await assertCan("settings.manage");
  const def = settingDefs[section as SettingKey];
  if (!def) return { ok: false, message: "Unknown settings section." };

  const input: Record<string, unknown> = {};
  for (const key of Object.keys(
    def.schema.shape,
  ) as (keyof typeof def.schema.shape)[]) {
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
    const sectionMap = SYSTEM_SETTING_MAP[section as SettingKey] as Record<
      string,
      SystemSettingPointer
    >;
    const systemRows: SystemSettingUpsertRow[] = Object.entries(
      parsed.data as Record<string, unknown>,
    ).map(([fieldKey, value]) => {
      const pointer = sectionMap[fieldKey];
      return {
        key: pointer.key,
        category: pointer.category,
        value: value as Json,
        value_type: pointer.valueType,
        scope: "global",
        description: pointer.description,
        is_sensitive: false,
        is_public: pointer.isPublic ?? false,
        requires_approval: false,
        updated_by: actor.user.id,
        updated_at: new Date().toISOString(),
      };
    });

    const { error } = await systemSettingsTable(admin).upsert(systemRows, {
      onConflict: "key",
    });
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
