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
const required = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"];
const missing = required.filter((key) => !(process.env[key] || local[key]));

if (missing.length > 0) {
  console.error(
    `Distributed rate limiting is not configured. Missing: ${missing.join(", ")}.`,
  );
  process.exit(1);
}

console.log("Distributed rate limiting: verified");
