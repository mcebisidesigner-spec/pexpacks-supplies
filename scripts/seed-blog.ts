import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/supabase/types.ts";
import { blogPosts } from "../data/blog.ts";

/**
 * Backfills the shipped static blog posts (data/blog.ts) into the
 * `blog_posts` table so the admin editor can take over from there.
 *
 * Idempotent: upserts by id (id = slug). Run with:
 *   node scripts/seed-blog.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  const supabase = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const rows = blogPosts.map((post) => ({
    id: post.slug,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author,
    category: post.category,
    image: post.image,
    published: true,
    created_at: `${post.date}T00:00:00Z`,
  }));

  const { data, error } = await supabase
    .from("blog_posts")
    .upsert(rows, { onConflict: "id", ignoreDuplicates: true })
    .select("id, title");

  if (error) {
    console.error("Seed failed:", error.message);
    if (error.code === "42P01") {
      console.error(
        "The blog_posts table does not exist yet. Apply supabase/migrations/00013_blog_posts.sql first."
      );
    }
    process.exit(1);
  }

  console.log(`Seeded ${data?.length ?? 0} blog post(s):`);
  for (const row of data ?? []) {
    console.log(`  - ${row.title} (${row.id})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
