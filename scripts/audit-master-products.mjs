import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envText = fs.readFileSync(".env.local", "utf8");
const supabaseUrl = envText.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const serviceRoleKey = envText.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const { data: masterProducts } = await supabase
    .from("master_products")
    .select("*")
    .order("name", { ascending: true });

  fs.writeFileSync("scripts/existing-products.json", JSON.stringify(masterProducts, null, 2));
  console.log(`Exported ${masterProducts.length} master products to scripts/existing-products.json`);

  console.log("Sample product row structure:");
  console.log(JSON.stringify(masterProducts[0], null, 2));

  // Check unique constraints or indexes
  const categories = [...new Set(masterProducts.map(p => p.category))];
  const brands = [...new Set(masterProducts.map(p => p.brand))];
  console.log("Distinct Categories:", categories);
  console.log("Distinct Brands:", brands);
}

run();
