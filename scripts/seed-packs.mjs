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

async function seedPacks() {
  console.log("Fetching ALL schools from Supabase DB...");
  let allSchools = [];
  let from = 0;
  const PAGE_SIZE = 1000;

  while (true) {
    const { data: page, error } = await supabase
      .from("schools")
      .select("id, slug")
      .range(from, from + PAGE_SIZE - 1);

    if (error || !page || page.length === 0) break;
    allSchools = allSchools.concat(page);
    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const schoolMap = new Map(allSchools.map((s) => [s.slug, s.id]));
  console.log(`Mapped ALL ${schoolMap.size} schools by slug.`);

  console.log("Reading data/school-records.json...");
  const rawRecords = fs.readFileSync("./data/school-records.json", "utf8");
  const schoolsWithGrades = JSON.parse(rawRecords);

  const packRows = [];
  for (const s of schoolsWithGrades) {
    const schoolId = schoolMap.get(s.slug);
    if (!schoolId || !Array.isArray(s.grades)) continue;

    for (const g of s.grades) {
      const packSlug = `${s.slug}-${g.gradeSlug}`;
      packRows.push({
        school_id: schoolId,
        title: `${s.name} ${g.grade} Pack`,
        slug: packSlug,
        description: g.deliveryNote || `${g.grade} Stationery Pack for ${s.name}`,
        price: g.price || 0,
        stock: 50,
        featured: false,
        visible: true,
        academic_year: "2026",
        delivery_type: "School collection",
      });
    }
  }

  console.log(`Prepared ${packRows.length} stationery packs to seed.`);

  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < packRows.length; i += BATCH_SIZE) {
    const batch = packRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("stationery_packs")
      .upsert(batch, { onConflict: "slug" });

    if (error) {
      console.error(`Packs batch ${i / BATCH_SIZE + 1} error:`, error);
    } else {
      inserted += batch.length;
      console.log(`Seeded packs batch ${i / BATCH_SIZE + 1}: ${inserted}/${packRows.length} packs.`);
    }
  }

  console.log(`🎉 Pack seeding complete! Total ${inserted} stationery packs in Supabase.`);
}

seedPacks().catch(console.error);
