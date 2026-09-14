import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { reportException } from "@/lib/observability/sentry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReconciliationReport = {
  draftsPruned: number;
  schools: { total: number; missingOrBlankSlug: number; duplicateSlugValues: number };
  payments: { total: number; missingRequiredFields: number };
  quotations: { total: number; invalidPrecision: number };
  testimonials: { total: number; missingSchoolContext: number };
};

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (!secret || !header?.startsWith("Bearer ")) return false;

  const provided = header.slice("Bearer ".length);
  const expectedBuffer = Buffer.from(secret);
  const providedBuffer = Buffer.from(provided);
  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer);
}

async function allRows<T>(table: string, columns: string): Promise<T[]> {
  const client = createSupabaseAdminClient();
  const pageSize = 1000;
  const all: T[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client
      .from(table as never)
      .select(columns)
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);

    const page = (data ?? []) as T[];
    all.push(...page);
    if (page.length < pageSize) return all;
  }
}

async function pruneExpiredDrafts(): Promise<number> {
  const client = createSupabaseAdminClient();
  const rpc = client.rpc.bind(client) as unknown as (
    name: string,
    args: Record<string, never>,
  ) => Promise<{ data: number | null; error: { message: string } | null }>;
  const { data, error } = await rpc("prune_expired_draft_carts", {});
  if (error) throw new Error(`draft_carts cleanup: ${error.message}`);
  return data ?? 0;
}
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const draftsPruned = await pruneExpiredDrafts();
    const [schools, payments, quotations, testimonials] = await Promise.all([
      allRows<{ slug: string | null }>("schools", "slug"),
      allRows<{ amount: number | null; currency: string | null; payment_gateway: string | null; status: string | null; created_at: string | null }>("payments", "amount,currency,payment_gateway,status,created_at"),
      allRows<{ delivery_fee: number | null; discount_amount: number | null }>("quotations", "delivery_fee,discount_amount"),
      allRows<{ school_id: string | null; school_name: string | null }>("cms_testimonials", "school_id,school_name"),
    ]);

    const slugs = schools.map((row) => row.slug?.trim().toLowerCase() ?? "");
    const counts = new Map<string, number>();
    for (const slug of slugs) if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
    const invalidPrecision = (value: number | null) => value !== null && !Number.isInteger(value * 100);

    const report: ReconciliationReport = {
      draftsPruned,
      schools: {
        total: schools.length,
        missingOrBlankSlug: slugs.filter((slug) => !slug).length,
        duplicateSlugValues: [...counts.values()].filter((count) => count > 1).length,
      },
      payments: {
        total: payments.length,
        missingRequiredFields: payments.filter((row) =>
          row.amount === null || !row.currency || !row.payment_gateway || !row.status || !row.created_at,
        ).length,
      },
      quotations: {
        total: quotations.length,
        invalidPrecision: quotations.filter((row) => invalidPrecision(row.delivery_fee) || invalidPrecision(row.discount_amount)).length,
      },
      testimonials: {
        total: testimonials.length,
        missingSchoolContext: testimonials.filter((row) => !row.school_id && !row.school_name?.trim()).length,
      },
    };

    const healthy =
      report.schools.missingOrBlankSlug === 0 &&
      report.schools.duplicateSlugValues === 0 &&
      report.payments.missingRequiredFields === 0 &&
      report.quotations.invalidPrecision === 0 &&
      report.testimonials.missingSchoolContext === 0;

    if (!healthy) {
      console.error("[cron/reconciliation] Integrity discrepancies detected:", report);
      reportException(new Error("Reconciliation integrity discrepancies detected: " + JSON.stringify(report)), "cron.reconciliation.discrepancy");
    }
    return NextResponse.json({ healthy, report }, { status: healthy ? 200 : 500 });
  } catch (error) {
    console.error("[cron/reconciliation] Audit failed:", error);
    reportException(error, "cron.reconciliation.audit-fail");
    return NextResponse.json({ error: "Reconciliation audit failed." }, { status: 500 });
  }
}