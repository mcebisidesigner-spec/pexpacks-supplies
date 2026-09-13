const fs = require("node:fs");
const { createClient } = require("@supabase/supabase-js");

function readLocalEnv() {
  if (!fs.existsSync(".env.local")) return {};
  return Object.fromEntries(
    fs
      .readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [
          line.slice(0, index),
          line.slice(index + 1).replace(/^["']|["']$/g, ""),
        ];
      }),
  );
}

function megabytes(bytes) {
  return `${(Number(bytes) / 1024 / 1024).toFixed(2)} MB`;
}

(async () => {
  const env = readLocalEnv();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc("get_database_storage_metrics");

  if (error) throw new Error(error.message);

  console.table(
    (data || []).map((row) => ({
      table: row.table_name,
      liveRows: row.live_rows,
      deadRows: row.dead_rows,
      total: megabytes(row.total_bytes),
      tableData: megabytes(row.table_bytes),
      indexes: megabytes(row.index_bytes),
    })),
  );
})();