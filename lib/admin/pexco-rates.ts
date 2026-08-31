import { createSupabaseAdminClient } from "../supabase/admin";
import { PEXCO_CLASSIFICATIONS } from "./system-settings-shared";
import { revalidateCatalog } from "./catalog-revalidate";
import { writeAuditLog } from "./rbac";

type DbError = { message?: string } | null;

type PexcoRatesQuery = Promise<{ data: unknown[] | null; error: DbError }> & {
  order(
    column: string,
    options?: { ascending?: boolean },
  ): Promise<{ data: unknown[] | null; error: DbError }>;
};

type PexcoRatesTable = {
  select(columns: string): PexcoRatesQuery;
  insert(
    values: Record<string, unknown>,
    options?: { onConflict?: string },
  ): Promise<{ data: unknown[] | null; error: DbError }>;
  update(values: Record<string, unknown>): {
    eq(
      column: string,
      value: string,
    ): Promise<{ data: unknown[] | null; error: DbError }>;
  };
};

function pexcoRatesTable(
  admin: ReturnType<typeof createSupabaseAdminClient>,
): PexcoRatesTable {
  return (admin.from as unknown as (table: string) => PexcoRatesTable)(
    "pexco_rates",
  );
}

export type PexcoAdminRate = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  coveringPriceCents: number;
  costPriceCents: number | null;
  marginRate: number;
  isActive: boolean;
};

type PexcoRateRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  covering_price_cents: number;
  cost_price_cents: number | null;
  is_active: boolean;
};

function toAdminRate(row: PexcoRateRow): PexcoAdminRate {
  const cost = row.cost_price_cents ?? 0;
  const marginRate =
    cost > 0 && row.covering_price_cents > 0
      ? row.covering_price_cents / cost
      : 2;

  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description ?? null,
    coveringPriceCents: row.covering_price_cents,
    costPriceCents: row.cost_price_cents,
    marginRate,
    isActive: row.is_active,
  };
}

export async function listPexcoRates(): Promise<PexcoAdminRate[]> {
  const admin = createSupabaseAdminClient();
  try {
    const query = pexcoRatesTable(admin).select(
      "id,code,title,description,covering_price_cents,cost_price_cents,is_active",
    );
    const { data, error } = await query.order("code", { ascending: true });

    if (error) {
      console.error("[pexco-rates] list failed:", error.message);
      return [];
    }

    return (data ?? []).map((row) =>
      toAdminRate(row as unknown as PexcoRateRow),
    );
  } catch (err) {
    console.error("[pexco-rates] list failed:", err);
    return [];
  }
}

export async function savePexcoCoveringRates(
  coveringUpdates: { code: string; coveringPriceCents: number }[],
  actor: { id?: string; email?: string | null },
  reason?: string,
): Promise<{
  ok: boolean;
  message?: string;
  rates: PexcoAdminRate[];
  updatedCount: number;
}> {
  const admin = createSupabaseAdminClient();
  const { data, error: listErr } = await pexcoRatesTable(admin)
    .select(
      "id,code,title,description,covering_price_cents,cost_price_cents,is_active",
    )
    .order("code", { ascending: true });

  if (listErr) {
    console.error("[pexco-rates] save failed:", listErr.message);
    return {
      ok: false,
      message: "Could not load existing Pexcover rates.",
      rates: [],
      updatedCount: 0,
    };
  }

  const rows = (data ?? []) as unknown as PexcoRateRow[];
  const existingByCode = new Map(rows.map((r) => [r.code, r]));
  const classificationByCode = new Map(
    PEXCO_CLASSIFICATIONS.map((c) => [c.code, c]),
  );
  const now = new Date().toISOString();

  const updates: { code: string; coveringPriceCents: number }[] = [];

  for (const update of coveringUpdates) {
    const code = String(update.code).trim().toUpperCase();
    const covering = Math.round(Number(update.coveringPriceCents));
    if (!Number.isFinite(covering) || covering < 0) {
      return {
        ok: false,
        message: `PEXCO ${code}: Covering Rate must be a valid amount of R0.00 or more.`,
        rates: rows.map((r) => toAdminRate(r)),
        updatedCount: 0,
      };
    }
    const classification = classificationByCode.get(code);
    if (!classification) {
      return {
        ok: false,
        message: `PEXCO code "${code}" is not a recognised covering classification.`,
        rates: rows.map((r) => toAdminRate(r)),
        updatedCount: 0,
      };
    }
    const existing = existingByCode.get(code);
    if (existing === undefined || existing.covering_price_cents !== covering) {
      updates.push({ code, coveringPriceCents: covering });
    }
  }

  let updatedCount = 0;
  if (updates.length > 0) {
    for (const u of updates) {
      const existing = existingByCode.get(u.code);
      if (existing) {
        const { error: updateErr } = await pexcoRatesTable(admin)
          .update({
            covering_price_cents: u.coveringPriceCents,
            updated_at: now,
            updated_by: actor.id ?? null,
          })
          .eq("code", u.code);
        if (updateErr) {
          console.error(
            "[pexco-rates] covering write failed:",
            updateErr.message,
          );
          return {
            ok: false,
            message:
              updateErr.message ||
              "Failed to write the Pexcover covering rate to the database.",
            rates: rows.map((r) => toAdminRate(r)),
            updatedCount,
          };
        }
      } else {
        const classification = classificationByCode.get(u.code)!;
        const { error: insertErr } = await pexcoRatesTable(admin).insert({
          code: u.code,
          title: classification.label,
          description: null,
          covering_price_cents: u.coveringPriceCents,
          cost_price_cents: null,
          is_active: true,
          updated_at: now,
          updated_by: actor.id ?? null,
        });
        if (insertErr) {
          console.error(
            "[pexco-rates] covering insert failed:",
            insertErr.message,
          );
          return {
            ok: false,
            message:
              insertErr.message ||
              "Failed to create the Pexcover covering rate in the database.",
            rates: rows.map((r) => toAdminRate(r)),
            updatedCount,
          };
        }
      }
      updatedCount++;
    }

    void writeAuditLog({
      actorId: actor.id,
      actorName: actor.email ?? "Superuser",
      action: "pexco_rates.covering_update",
      entityType: "pexco_rate",
      entityId: "PEXCO-ALL",
      summary: `Updated ${updatedCount} Pexcover covering rate(s)`,
      details: {
        reason: reason ?? "Pricing & Margin control centre",
        updates,
      },
    });

    revalidateCatalog();
  }

  const refreshed = await listPexcoRates();

  return {
    ok: true,
    message:
      updatedCount > 0
        ? `Saved ${updatedCount} Pexcover covering rate(s).`
        : "Pexcover covering rates already up to date.",
    rates: refreshed.length > 0 ? refreshed : rows.map((r) => toAdminRate(r)),
    updatedCount,
  };
}
