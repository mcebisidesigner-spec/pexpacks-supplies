import { createSupabaseAdminClient } from "../supabase/admin";
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

export async function updatePexcoRate(
  input: {
    code: string;
    costPriceCents: number;
    marginRate: number;
    isActive: boolean;
  },
  actor: { id?: string; email?: string | null },
): Promise<{ ok: boolean; message?: string; rate?: PexcoAdminRate }> {
  const code = input.code.trim().toUpperCase();
  if (!code) {
    return { ok: false, message: "PEXCO code is required." };
  }

  const costPriceCents = Math.round(input.costPriceCents);
  if (!Number.isFinite(costPriceCents) || costPriceCents < 0) {
    return {
      ok: false,
      message:
        "Cost Price must be a valid amount greater than or equal to R0.00.",
    };
  }

  const marginRate = Number(input.marginRate);
  if (!Number.isFinite(marginRate) || marginRate <= 0 || marginRate > 100) {
    return {
      ok: false,
      message: "Margin Rate must be a positive multiplier between 0 and 100.",
    };
  }

  const coveringPriceCents = Math.round(costPriceCents * marginRate);

  const admin = createSupabaseAdminClient();
  const { data, error: listErr } = await pexcoRatesTable(admin)
    .select(
      "id,code,title,description,covering_price_cents,cost_price_cents,is_active",
    )
    .order("code", { ascending: true });

  if (listErr) {
    console.error("[pexco-rates] find failed:", listErr.message);
    return { ok: false, message: "Could not locate the Pexcover rate record." };
  }

  const row = (data ?? []).find(
    (r) => (r as unknown as PexcoRateRow).code === code,
  ) as unknown as PexcoRateRow | undefined;

  if (!row) {
    return { ok: false, message: `PEXCO code "${code}" not found.` };
  }

  const prev = toAdminRate(row);
  const { data: updatedRows, error: updateErr } = await pexcoRatesTable(admin)
    .update({
      covering_price_cents: coveringPriceCents,
      cost_price_cents: costPriceCents,
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
      updated_by: actor.id ?? null,
    })
    .eq("code", code);

  if (updateErr) {
    console.error("[pexco-rates] update failed:", updateErr.message);
    return {
      ok: false,
      message: updateErr.message || "Failed to update the Pexcover rate.",
    };
  }

  const updatedRow = updatedRows?.[0] as unknown as PexcoRateRow | undefined;
  const rate = updatedRow ? toAdminRate(updatedRow) : prev;

  void writeAuditLog({
    actorId: actor.id,
    actorName: actor.email ?? "Superuser",
    action: "pexco_rates.update",
    entityType: "pexco_rate",
    entityId: code,
    summary: `Updated PEXCO ${code} ${rate.title} — covering R${(
      coveringPriceCents / 100
    ).toFixed(2)} at ${marginRate}× cost`,
    details: {
      code,
      costPriceCents,
      coveringPriceCents,
      marginRate,
      isActive: input.isActive,
      prevCostPriceCents: prev.costPriceCents,
      prevCoveringPriceCents: prev.coveringPriceCents,
      prevIsActive: prev.isActive,
    },
  });

  revalidateCatalog();

  return {
    ok: true,
    message: `PEXCO ${code} updated. New covering rate R${(
      coveringPriceCents / 100
    ).toFixed(2)} (cost R${(costPriceCents / 100).toFixed(
      2,
    )} × ${marginRate}).`,
    rate,
  };
}
