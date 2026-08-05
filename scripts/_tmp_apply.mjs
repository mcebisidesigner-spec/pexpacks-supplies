import { readFileSync } from "fs";
const PAT = "sbp_v0_b39f5b7a9511e22a0a95bbb1a222935839fd94bd";
const ref = "rjuvicgqwryztwytnauo";
const sql = readFileSync("supabase/migrations/00008_users_settings_audit.sql", "utf8");
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});
const text = await res.text();
console.log("STATUS:", res.status);
console.log(text.slice(0, 300));
