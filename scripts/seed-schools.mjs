import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Read environment variables
const envText = fs.readFileSync(".env.local", "utf8");
const supabaseUrl = envText.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const serviceRoleKey = envText.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log("Reading data/school-index.json...");
  const rawData = fs.readFileSync("./data/school-index.json", "utf8");
  const schools = JSON.parse(rawData);

  console.log(`Found ${schools.length} schools to seed.`);

  // Map JSON objects to DB row format
  const rows = schools.map((s) => ({
    name: s.name,
    slug: s.slug,
    city: s.city || null,
    district: s.metro || null,
    province: s.province || null,
    logo: s.logo || null,
    is_partner: Boolean(s.isPartnerSchool),
    is_featured: Boolean(s.isFeatured),
    lowest_price: s.lowestPrice ?? null,
    status: "active",
    published: true,
  }));
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("schools")
      .upsert(batch, { onConflict: "slug" });

    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error);
    } else {
      inserted += batch.length;
      console.log(`Seeded batch ${i / BATCH_SIZE + 1}: ${inserted}/${rows.length} schools inserted.`);
    }
  }

  console.log(`🎉 Seeding completed! Total ${inserted} schools in Supabase public.schools.`);
}

seed().catch(console.error);
