import fs from "fs";
import { listMasterProducts } from "../lib/admin/operations.ts";

const queries = [
  "exercise",
  "feint",
  "pencil",
  "calculator",
  "glue",
  "geometry",
  "scissors",
  "graph",
  "accounting",
  "file",
  "tracing",
  "USB"
];

const categories = [
  "Exercise Books",
  "Hardcover Books",
  "Pens",
  "Pencils",
  "Adhesives",
  "Calculators",
  "Mathematics",
  "Measurement",
  "Filing",
  "Art Supplies",
  "Cutting",
  "Paper",
  "Digital"
];

async function runValidation() {
  console.log("=== SEARCH QUERY VALIDATION ===");
  for (const q of queries) {
    const res = await listMasterProducts({ query: q, pageSize: 5 });
    console.log(`Query: "${q.padEnd(12)}" -> Found: ${String(res.total).padStart(3)} products | Top: "${res.products[0]?.name || "None"}"`);
    if (res.total === 0) {
      throw new Error(`Search failed for query "${q}"`);
    }
  }

  console.log("\n=== CATEGORY FILTER VALIDATION ===");
  for (const cat of categories) {
    const res = await listMasterProducts({ category: cat, pageSize: 5 });
    console.log(`Category: "${cat.padEnd(18)}" -> Found: ${String(res.total).padStart(3)} products | Top: "${res.products[0]?.name || "None"}"`);
    if (res.total === 0) {
      throw new Error(`Category filter failed for "${cat}"`);
    }
  }

  console.log("\n=== ALL SEARCH & CATEGORY VALIDATIONS PASSED! ===");
}

runValidation().catch(err => {
  console.error("Validation error:", err);
  process.exit(1);
});
