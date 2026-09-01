const fs = require("fs");
const path = require("path");

const projectRef = process.env.SUPABASE_PROJECT_REF || "rjuvicgqwryztwytnauo";
const tempDir = path.join(__dirname, "..", "supabase", ".temp");
const refFile = path.join(tempDir, "project-ref");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

fs.writeFileSync(refFile, `${projectRef.trim()}\n`, "utf8");
console.log(`[supabase-link] Successfully linked Supabase project ref: ${projectRef} at ${refFile}`);
