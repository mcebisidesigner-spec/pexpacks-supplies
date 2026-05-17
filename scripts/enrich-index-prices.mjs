/**
 * Enrich school-index.json with lowestPrice from school-records.json
 * Run: node scripts/enrich-index-prices.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../data");

const records = JSON.parse(
  readFileSync(resolve(DATA_DIR, "school-records.json"), "utf-8")
);
const index = JSON.parse(
  readFileSync(resolve(DATA_DIR, "school-index.json"), "utf-8")
);

// Build price lookup from full records
const priceMap = new Map();
for (const school of records) {
  if (school.grades && school.grades.length > 0) {
    const lowest = Math.min(...school.grades.map((g) => g.price));
    priceMap.set(school.id, lowest);
  }
}

// Enrich index
let enriched = 0;
for (const entry of index) {
  const price = priceMap.get(entry.id);
  if (price != null) {
    entry.lowestPrice = price;
    enriched++;
  }
}

writeFileSync(
  resolve(DATA_DIR, "school-index.json"),
  JSON.stringify(index, null, 2) + "\n"
);

console.log(`✅ Enriched ${enriched} of ${index.length} schools with lowestPrice`);
