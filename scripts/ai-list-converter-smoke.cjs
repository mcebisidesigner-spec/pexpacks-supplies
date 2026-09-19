const fs = require("node:fs");
const { performance } = require("node:perf_hooks");
const { createClient } = require("@supabase/supabase-js");

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1).replace(/^['\"]|['\"]$/g, "")];
      }),
  );
}

const local = readEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || local.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || local.SUPABASE_SERVICE_ROLE_KEY;
const budgetMs = Number(process.env.AI_MATCH_SMOKE_BUDGET_MS || 2000);

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const queries = [
  "A4 Exercise Book 72 Page Feint & Margin",
  "Pritt Glue Stick 43g Jumbo",
  "Marlin 30cm Clear Shatterproof Ruler",
];

(async () => {
  const started = performance.now();
  const { data, error } = await client.rpc("match_stationery_products", {
    query_texts: queries,
    match_threshold: 0.55,
  });
  const elapsed = performance.now() - started;

  if (error) throw new Error(`match_stationery_products failed: ${error.message}`);
  if (!Array.isArray(data) || data.length !== queries.length) {
    throw new Error("Batch matcher did not return one result for each query.");
  }
  for (const [index, row] of data.entries()) {
    if (row.query_index !== index || !row.id || Number(row.current_selling_price) <= 0) {
      throw new Error(`Catalogue match ${index} is missing an authoritative product or selling price.`);
    }
    if ("latest_verified_cost" in row || "cost_price" in row) {
      throw new Error("Matcher returned a sensitive cost field.");
    }
  }
  if (elapsed > budgetMs) {
    throw new Error(`Batch matcher exceeded ${budgetMs}ms (${Math.round(elapsed)}ms).`);
  }
  console.log(`AI catalogue batch matcher: ${Math.round(elapsed)}ms, ${data.length} verified products`);
})().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});