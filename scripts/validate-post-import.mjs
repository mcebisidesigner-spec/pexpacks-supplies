import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envText = fs.readFileSync(".env.local", "utf8");
const supabaseUrl = envText.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const serviceRoleKey = envText.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(supabaseUrl, serviceRoleKey);
const existingProducts = JSON.parse(fs.readFileSync("scripts/existing-products.json", "utf8"));

async function validate() {
  console.log("=== POST-IMPORT VALIDATION ===");

  // 1. Total row count
  const { data: allProducts, count: totalCount } = await supabase
    .from("master_products")
    .select("id, sku, name, latest_verified_cost, current_selling_price, calculated_selling_price, pricing_status, visibility, requires_pexcover, pexco_code, category, brand", { count: "exact" });

  console.log(`1. Total master_products in DB: ${totalCount} (Expected: 318)`);
  if (totalCount !== 318) {
    throw new Error(`Expected 318 products, got ${totalCount}`);
  }

  // 2. Verify all 53 original products are 100% intact
  console.log("\n2. Verifying original 53 products...");
  const dbSkuMap = new Map(allProducts.map(p => [p.sku, p]));
  for (const orig of existingProducts) {
    const found = dbSkuMap.get(orig.sku);
    if (!found) {
      throw new Error(`Original product SKU "${orig.sku}" is MISSING!`);
    }
    if (found.id !== orig.id) {
      throw new Error(`Product ID changed for SKU "${orig.sku}"!`);
    }
    if (found.latest_verified_cost !== orig.latest_verified_cost) {
      throw new Error(`Verified cost changed for SKU "${orig.sku}"! Expected ${orig.latest_verified_cost}, got ${found.latest_verified_cost}`);
    }
    if (found.current_selling_price !== orig.current_selling_price) {
      throw new Error(`Selling price changed for SKU "${orig.sku}"! Expected ${orig.current_selling_price}, got ${found.current_selling_price}`);
    }
  }
  console.log("   ✓ All 53 original products verified intact with exact IDs, SKUs, costs, and selling prices!");

  // 3. Verify commercial safeguards on new items
  console.log("\n3. Verifying commercial safeguards on new products...");
  const newProducts = allProducts.filter(p => !existingProducts.some(e => e.id === p.id));
  console.log(`   New products found: ${newProducts.length} (Expected: 265)`);

  const unquotedWithCost = newProducts.filter(p => p.latest_verified_cost !== null && p.latest_verified_cost !== 0);
  if (unquotedWithCost.length > 0) {
    throw new Error(`Found ${unquotedWithCost.length} new products with populated cost price!`);
  }
  console.log("   ✓ Zero new products have fabricated cost prices (all null/0)!");

  const unquotedWithSellingPrice = newProducts.filter(p => p.current_selling_price !== 0);
  if (unquotedWithSellingPrice.length > 0) {
    throw new Error(`Found ${unquotedWithSellingPrice.length} new products with non-zero selling price!`);
  }
  console.log("   ✓ Zero new products have fabricated selling prices!");

  const unquotedPublic = newProducts.filter(p => p.visibility === "public");
  if (unquotedPublic.length > 0) {
    throw new Error(`Found ${unquotedPublic.length} new products marked as public!`);
  }
  console.log("   ✓ All new products default to visibility = 'internal'!");

  // 4. Verify school pack items
  console.log("\n4. Verifying school_pack_items relationships...");
  const { data: packItems, count: packItemCount } = await supabase
    .from("school_pack_items")
    .select("id, pack_id, product_id", { count: "exact" });
  console.log(`   school_pack_items count: ${packItemCount} (Expected: 4)`);
  if (packItemCount !== 4) {
    throw new Error(`Expected 4 school_pack_items, found ${packItemCount}`);
  }
  for (const pi of packItems) {
    const targetProduct = dbSkuMap.get(allProducts.find(p => p.id === pi.product_id)?.sku);
    if (!targetProduct) {
      throw new Error(`school_pack_item ${pi.id} references missing master_product ${pi.product_id}!`);
    }
  }
  console.log("   ✓ All school pack items intact and referencing valid master products!");

  // 5. Check Pexcover counts
  const pexcoverTrue = allProducts.filter(p => p.requires_pexcover);
  console.log(`\n5. Products requiring Pexcover: ${pexcoverTrue.length}`);
  console.log(`   Sample Pexcover products:`, pexcoverTrue.slice(0, 5).map(p => ({ name: p.name, code: p.pexco_code })));

  // 6. Check Categories
  const categories = [...new Set(allProducts.map(p => p.category))].sort();
  console.log(`\n6. Distinct categories in DB (${categories.length}):`, categories);

  console.log("\n=== POST-IMPORT VALIDATION PASSED COMPLETELY! ===");
}

validate().catch(err => {
  console.error("VALIDATION FAILED:", err);
  process.exit(1);
});
