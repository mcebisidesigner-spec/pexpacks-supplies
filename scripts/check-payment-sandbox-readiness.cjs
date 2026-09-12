const { existsSync, readFileSync } = require("node:fs");

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.trimStart().startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [
          line.slice(0, index),
          line.slice(index + 1).replace(/^["']|["']$/g, ""),
        ];
      }),
  );
}

const local = readEnvFile(".env.local");
const get = (key) => process.env[key] || local[key] || "";
const required = [
  "OZOW_SITE_CODE",
  "OZOW_PRIVATE_KEY",
  "OZOW_API_KEY",
  "NEXT_PUBLIC_APP_URL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "RESEND_REPLY_TO_EMAIL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const missing = required.filter((key) => !get(key));
if (missing.length > 0) {
  console.error(
    "Payment sandbox preflight failed. Missing: " + missing.join(", "),
  );
  process.exit(1);
}

if (get("OZOW_IS_TEST") !== "true") {
  console.error(
    "Payment sandbox preflight failed. Set OZOW_IS_TEST=true before initiating a sandbox payment.",
  );
  process.exit(1);
}

if (get("OZOW_TEST_MODE_APPROVED") !== "true") {
  console.error(
    "Payment sandbox preflight failed. Set OZOW_TEST_MODE_APPROVED=true to approve test mode execution in non-production.",
  );
  process.exit(1);
}

console.log(
  "Payment sandbox preflight passed: Ozow test mode, receipt delivery, and Supabase order persistence are configured.",
);