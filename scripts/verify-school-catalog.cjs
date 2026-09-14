#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const strict = process.argv.includes("--strict");

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1).replace(/^["']|["']$/g, "")];
    }),
);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase URL or service-role key in .env.local.");

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

function loadJson(file) {
  const raw = fs.readFileSync(path.join(process.cwd(), "data", file), "utf8");
  const value = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error(`${file} does not contain an array.`);
  return value;
}

(async () => {
  const recordsFile = "school-records.json";
  const indexFile = "school-index.json";

  const [dbSchools, records, index] = await Promise.all([
    rows("schools", "id,name,slug,status"),
    loadJson(recordsFile),
    loadJson(indexFile),
  ]);

  const dbActive = dbSchools.filter((s) => s.status !== "archived");
  const dbBySlug = new Map(dbActive.map((s) => [s.slug, s]));

  const recordBySlug = new Map(records.map((s) => [s.slug, s]));
  const indexBySlug = new Map(index.map((s) => [s.slug, s]));

  const dbSlugs = new Set(dbBySlug.keys());
  const recordSlugs = new Set(recordBySlug.keys());
  const indexSlugs = new Set(indexBySlug.keys());

  const drift = [];
  const inRecordsNotDb = [];
  const inDbNotRecords = [];
  const nameMismatches = [];

  for (const slug of recordSlugs) {
    const db = dbBySlug.get(slug);
    if (!db) {
      inRecordsNotDb.push(slug);
      continue;
    }
    const record = recordBySlug.get(slug);
    if (record && record.name !== db.name) {
      nameMismatches.push({ slug, jsonName: record.name, dbName: db.name });
    }
  }

  for (const slug of indexSlugs) {
    if (!recordSlugs.has(slug)) drift.push(`${slug} present in ${indexFile} but missing from ${recordsFile}`);
  }

  for (const slug of dbSlugs) {
    if (!recordSlugs.has(slug)) inDbNotRecords.push(slug);
  }

  const header = [
    "=".repeat(56),
    "School catalog reconciliation",
    "=".repeat(56),
  ].join("\n");

  console.log(header);
  console.log(`DB active schools        : ${dbActive.length}`);
  console.log(`JSON records (${recordsFile}) : ${records.length}`);
  console.log(`JSON index (${indexFile})     : ${index.length}`);
  console.log("");
  console.log(`Records missing from DB   : ${inRecordsNotDb.length}`);
  console.log(`DB schools missing from JSON: ${inDbNotRecords.length}`);
  console.log(`Name mismatches (same slug): ${nameMismatches.length}`);
  console.log(`Index/record drift        : ${drift.length}`);
  console.log("");

  const sample = (list, label, max = 15) => {
    if (list.length === 0) return;
    console.log(`${label} (${list.length}):`);
    list.slice(0, max).forEach((item) => console.log(`  - ${item}`));
    if (list.length > max) console.log(`  ... and ${list.length - max} more`);
    console.log("");
  };

  sample(inRecordsNotDb, "In JSON records but not in DB schools");
  sample(inDbNotRecords, "In DB schools but not in JSON records");
  nameMismatches.slice(0, 15).forEach(({ slug, jsonName, dbName }) => {
    console.log(`Name mismatch for "${slug}": JSON="${jsonName}" DB="${dbName}"`);
  });
  sample(drift, "Index/record drift");

  const anomalies =
    inRecordsNotDb.length + inDbNotRecords.length + nameMismatches.length + drift.length;

  if (anomalies === 0) {
    console.log(`[verify-school-catalog] OK — ${records.length} records reconciled with ${dbActive.length} active DB schools.`);
    process.exit(0);
  }

  console.log(`[verify-school-catalog] ${anomalies} discrepancy(ies) found.`);
  process.exit(strict ? 1 : 0);
})().catch((err) => {
  console.error("[verify-school-catalog]", err instanceof Error ? err.message : err);
  process.exit(1);
});