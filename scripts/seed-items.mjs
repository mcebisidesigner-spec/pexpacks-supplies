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

function inferIcon(name) {
  const value = name.toLowerCase();
  if (/(book|scrapbook)/.test(value)) return "notebook";
  if (/(pad|paper)/.test(value)) return "pad";
  if (/(file|sleeve|folder)/.test(value)) return "file";
  if (/(pen|marker)/.test(value)) return "pen";
  if (/(pencil|crayon|colour|color)/.test(value)) return "pencil";
  if (/glue/.test(value)) return "glue";
  if (/scissor/.test(value)) return "scissors";
  if (/ruler/.test(value)) return "ruler";
  if (/eraser/.test(value)) return "eraser";
  if (/sharpener/.test(value)) return "sharpener";
  if (/highlighter/.test(value)) return "highlighter";
  if (/calculator/.test(value)) return "calculator";
  return "box";
}

async function seedItems() {
  console.log("Fetching ALL stationery packs from Supabase DB to map pack slug -> pack ID...");
  let allPacks = [];
  let from = 0;
  const PAGE_SIZE = 1000;

  while (true) {
    const { data: page, error } = await supabase
      .from("stationery_packs")
      .select("id, slug")
      .range(from, from + PAGE_SIZE - 1);

    if (error || !page || page.length === 0) break;
    allPacks = allPacks.concat(page);
    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const packMap = new Map(allPacks.map((p) => [p.slug, p.id]));
  console.log(`Mapped ${packMap.size} packs by slug.`);

  console.log("Reading data/school-records.json...");
  const rawRecords = fs.readFileSync("./data/school-records.json", "utf8");
  const schoolsWithGrades = JSON.parse(rawRecords);

  const itemRows = [];
  for (const s of schoolsWithGrades) {
    if (!Array.isArray(s.grades)) continue;

    for (const g of s.grades) {
      const packSlug = `${s.slug}-${g.gradeSlug}`;
      const packId = packMap.get(packSlug);
      if (!packId || !Array.isArray(g.contents)) continue;

      g.contents.forEach((itemName, index) => {
        itemRows.push({
          pack_id: packId,
          name: itemName,
          quantity: 1,
          visible: true,
          sort_order: index,
          icon: inferIcon(itemName),
        });
      });
    }
  }

  console.log(`Prepared ${itemRows.length} stationery items to seed.`);

  const BATCH_SIZE = 1000;
  let inserted = 0;

  for (let i = 0; i < itemRows.length; i += BATCH_SIZE) {
    const batch = itemRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("stationery_items")
      .insert(batch);

    if (error) {
      console.error(`Items batch ${i / BATCH_SIZE + 1} error:`, error);
    } else {
      inserted += batch.length;
      if (inserted % 5000 === 0 || inserted === itemRows.length) {
        console.log(`Seeded ${inserted}/${itemRows.length} items into Supabase.`);
      }
    }
  }

  console.log(`🎉 Item seeding complete! Total ${inserted} stationery items in Supabase.`);
}

seedItems().catch(console.error);
