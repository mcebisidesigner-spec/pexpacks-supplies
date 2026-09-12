const fs = require("node:fs");
const { createClient } = require("@supabase/supabase-js");

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1).replace(/^["']|["']$/g, "")];
    }),
);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase URL or service-role key.");

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function rows(table, columns) {
  const pageSize = 1000;
  const all = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);

    const page = data || [];
    all.push(...page);
    if (page.length < pageSize) return all;
  }
}

function countBy(values) {
  return values.reduce((counts, value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  }, new Map());
}

(async () => {
  const [schools, payments, quotations, testimonials] = await Promise.all([
    rows("schools", "slug"),
    rows("payments", "amount,currency,payment_gateway,status,created_at,updated_at"),
    rows("quotations", "delivery_fee,discount_amount"),
    rows("cms_testimonials", "school_id,school_name"),
  ]);

  const slugs = schools.map((row) => String(row.slug || "").trim().toLowerCase());
  const slugCounts = countBy(slugs.filter(Boolean));
  const duplicateSlugs = [...slugCounts.values()].filter((count) => count > 1).length;
  const missingSchoolNames = testimonials.filter(
    (row) => !row.school_id && !String(row.school_name || "").trim(),
  ).length;
  const hasMoreThanTwoDecimals = (value) => {
    if (value == null) return false;
    return !Number.isInteger(Number(value) * 100);
  };

  console.log(JSON.stringify({
    schools: {
      total: schools.length,
      missing_or_blank_slug: slugs.filter((slug) => !slug).length,
      duplicate_slug_values: duplicateSlugs,
    },
    payments: {
      total: payments.length,
      missing_amount: payments.filter((row) => row.amount == null).length,
      missing_currency: payments.filter((row) => !row.currency).length,
      missing_gateway: payments.filter((row) => !row.payment_gateway).length,
      missing_status: payments.filter((row) => !row.status).length,
      missing_created_at: payments.filter((row) => !row.created_at).length,
    },
    quotations: {
      total: quotations.length,
      missing_delivery_fee: quotations.filter((row) => row.delivery_fee == null).length,
      missing_discount_amount: quotations.filter((row) => row.discount_amount == null).length,
      delivery_fee_over_two_decimals: quotations.filter((row) => hasMoreThanTwoDecimals(row.delivery_fee)).length,
      discount_amount_over_two_decimals: quotations.filter((row) => hasMoreThanTwoDecimals(row.discount_amount)).length,
    },
    testimonials: {
      total: testimonials.length,
      missing_school_context: missingSchoolNames,
    },
  }, null, 2));
})().catch((error) => {
  console.error(`Reconciliation audit failed: ${error.message}`);
  process.exit(1);
});