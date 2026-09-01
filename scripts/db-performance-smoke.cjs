const fs = require("node:fs");
const { performance } = require("node:perf_hooks");
const { createClient } = require("@supabase/supabase-js");

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [
        line.slice(0, index),
        line.slice(index + 1).replace(/^["']|["']$/g, ""),
      ];
    }),
);

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const schoolSlug =
  process.env.DB_SMOKE_SCHOOL_SLUG || "primrose-hill-primary-school";
const searchQuery = process.env.DB_SMOKE_SEARCH_QUERY || "primrose";
const packBudgetMs = Number(process.env.DB_SMOKE_PACK_BUDGET_MS || 750);
const searchBudgetMs = Number(process.env.DB_SMOKE_SEARCH_BUDGET_MS || 750);
const dbExecutionBudgetMs = Number(process.env.DB_SMOKE_DB_EXECUTION_BUDGET_MS || 100);

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

async function timed(label, fn, budgetMs) {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  const rounded = Math.round(duration * 10) / 10;
  console.log(`${label}: ${rounded}ms`);
  if (duration > budgetMs) {
    fail(`${label} exceeded ${budgetMs}ms budget.`);
  }
  return result;
}

function collectSeqScans(plan, found = []) {
  if (!plan || typeof plan !== "object") return found;
  if (plan["Node Type"] === "Seq Scan") {
    found.push({ relation: plan["Relation Name"], alias: plan.Alias });
  }
  for (const child of plan.Plans || []) collectSeqScans(child, found);
  return found;
}

function explainEntries(payload) {
  if (!payload || typeof payload !== "object") return [];
  return Object.entries(payload).flatMap(([label, entry]) => {
    if (!Array.isArray(entry)) return [];
    return entry.map((row) => ({ label, row })).filter((entry) => entry.row.Plan);
  });
}

function executionMs(row) {
  return Number(row["Execution Time"] || 0);
}

(async () => {
  const pack = await timed(
    "get_public_school_pack",
    () => supabase.rpc("get_public_school_pack", { school_slug: schoolSlug }),
    packBudgetMs,
  );
  if (pack.error) fail(`get_public_school_pack failed: ${pack.error.message}`);
  if (!pack.data)
    fail(`get_public_school_pack returned no data for ${schoolSlug}.`);

  const search = await timed(
    "search_public_schools",
    () =>
      supabase.rpc("search_public_schools", {
        search_query: searchQuery,
        grade_filter: "",
        phase_filter: "",
        region_filter: "",
        result_limit: 12,
        result_offset: 0,
      }),
    searchBudgetMs,
  );
  if (search.error)
    fail(`search_public_schools failed: ${search.error.message}`);

  const explain = await supabase.rpc("explain_public_read_paths", {
    school_slug: schoolSlug,
    search_query: searchQuery,
  });
  if (explain.error) {
    fail(`explain_public_read_paths failed: ${explain.error.message}`);
  } else {
    const criticalTables = new Set([
      "schools",
      "school_packs",
      "school_pack_items",
    ]);
    const entries = explainEntries(explain.data);
    const seqScans = entries
      .flatMap(({ row }) => collectSeqScans(row.Plan))
      .filter((scan) => criticalTables.has(scan.relation));

    for (const { label, row } of entries) {
      const duration = executionMs(row);
      console.log(`${label} db execution: ${Math.round(duration * 10) / 10}ms`);
      if (duration > dbExecutionBudgetMs) {
        fail(`${label} exceeded ${dbExecutionBudgetMs}ms database execution budget.`);
      }
    }

    if (seqScans.length > 0) {
      fail(`Critical public path seq scans found: ${JSON.stringify(seqScans)}`);
    } else {
      console.log("public read plans: no critical seq scans");
    }
  }
})();
