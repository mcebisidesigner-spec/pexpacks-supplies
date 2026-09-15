import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envText = fs.readFileSync(".env.local", "utf8");
const supabaseUrl = envText.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const serviceRoleKey = envText.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const finalMapping = JSON.parse(fs.readFileSync("scripts/final-mapping.json", "utf8"));
const existingProducts = JSON.parse(fs.readFileSync("scripts/existing-products.json", "utf8"));

const isExecute = process.argv.includes("--execute");

async function run() {
  console.log("==================================================================");
  console.log(`MODE: ${isExecute ? "EXECUTE (WRITING TO DB)" : "DRY RUN (READ ONLY)"}`);
  console.log("==================================================================");

  // 1. Verify current database state
  const { data: currentRows, count: initialCount } = await supabase
    .from("master_products")
    .select("id, sku, name, latest_verified_cost, current_selling_price", { count: "exact" });

  console.log(`Initial master_products in DB: ${initialCount}`);

  const toCreate = finalMapping.filter(m => m.action === "CREATE_NEW");
  const toKeep = finalMapping.filter(m => m.action === "KEEP_EXISTING");

  console.log(`Catalogue plan:`);
  console.log(`- Keep existing matched: ${toKeep.length}`);
  console.log(`- Create new:             ${toCreate.length}`);
  console.log(`- Expected final total:   ${initialCount + toCreate.length}`);

  // Category breakdown
  const catBreakdown = {};
  for (const item of finalMapping) {
    const cat = item.category;
    if (!catBreakdown[cat]) {
      catBreakdown[cat] = { total: 0, existing: 0, created: 0 };
    }
    catBreakdown[cat].total++;
    if (item.action === "KEEP_EXISTING") catBreakdown[cat].existing++;
    else catBreakdown[cat].created++;
  }

  console.log("\nCategory breakdown of 308 PDF items:");
  console.table(catBreakdown);

  // Safety checks on new items:
  console.log("\n--- Commercial Safety Validations ---");
  const badCostItems = toCreate.filter(i => i.costPrice !== null && i.costPrice !== 0);
  console.log(`New items with non-null/non-zero cost: ${badCostItems.length} (MUST BE 0)`);
  if (badCostItems.length > 0) {
    throw new Error("Financial safety rule violation: cost price is populated on new placeholder!");
  }

  const badPriceItems = toCreate.filter(i => i.sellingPrice !== 0);
  console.log(`New items with non-zero selling price: ${badPriceItems.length} (MUST BE 0)`);
  if (badPriceItems.length > 0) {
    throw new Error("Financial safety rule violation: selling price is populated on new placeholder!");
  }

  const badVisibilityItems = toCreate.filter(i => i.visibility !== "internal");
  console.log(`New items with visibility !== internal: ${badVisibilityItems.length} (MUST BE 0)`);
  if (badVisibilityItems.length > 0) {
    throw new Error("Safeguard violation: new unquoted placeholder is public!");
  }

  console.log("All safety validations PASSED!\n");

  if (!isExecute) {
    console.log("DRY RUN finished successfully. To execute live inserts, pass --execute.");
    return;
  }

  // Live execution in batches by category
  console.log("Beginning category-by-category batch insertion...");
  const categories = Object.keys(catBreakdown);
  let totalInserted = 0;

  for (const cat of categories) {
    const itemsInCat = toCreate.filter(i => i.category === cat);
    if (itemsInCat.length === 0) continue;

    console.log(`Inserting category "${cat}" (${itemsInCat.length} items)...`);

    const payload = itemsInCat.map(it => ({
      sku: it.sku,
      name: it.name,
      description: it.description || null,
      specification: it.packaging ? `${it.unit} (${it.packaging})` : it.unit,
      category: it.category,
      brand: it.brand || "Add-Brand-Name",
      unit: it.unit || "each",
      packaging: it.packaging || "single",
      visibility: "internal",
      availability: "available",
      current_selling_price: 0,
      calculated_selling_price: 0,
      latest_verified_cost: null,
      pricing_status: "unpriced",
      active: true,
      requires_pexcover: it.requires_pexcover,
      pexco_code: it.pexco_code || null,
      icon: it.icon || "box"
    }));

    const { data, error } = await supabase
      .from("master_products")
      .insert(payload)
      .select("id");

    if (error) {
      console.error(`Error inserting category "${cat}":`, error);
      throw error;
    }

    totalInserted += data.length;
    console.log(`  ✓ Inserted ${data.length} items in "${cat}". Total so far: ${totalInserted}`);
  }

  // Verify final count in DB
  const { count: finalCount } = await supabase
    .from("master_products")
    .select("id", { count: "exact" });

  console.log(`\n==================================================================`);
  console.log(`DATABASE SEEDING COMPLETE!`);
  console.log(`Initial rows:   ${initialCount}`);
  console.log(`Newly inserted: ${totalInserted}`);
  console.log(`Final DB count: ${finalCount}`);
  console.log(`==================================================================`);
}

run().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
