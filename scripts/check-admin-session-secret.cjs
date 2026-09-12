const fs = require("node:fs");
const path = require("node:path");

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [
          line.slice(0, index),
          line.slice(index + 1).replace(/^['\"]|['\"]$/g, ""),
        ];
      }),
  );
}

const local = readEnvFile(path.join(process.cwd(), ".env.local"));
const secret = process.env.ADMIN_SESSION_SECRET || local.ADMIN_SESSION_SECRET || "";

if (
  secret.length < 32 ||
  secret === "generate-a-random-32-plus-character-secret"
  ) {
  console.error(
    "ADMIN_SESSION_SECRET must be a dedicated non-placeholder secret with at least 32 characters.",
  );
  process.exit(1);
}

console.log("ADMIN_SESSION_SECRET: verified");
