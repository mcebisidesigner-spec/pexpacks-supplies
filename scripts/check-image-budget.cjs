const { readdirSync, statSync } = require("fs");
const { join, relative } = require("path");

const dir = process.env.IMAGE_DIR || "public/images";
const maxKb = Number(process.env.IMAGE_MAX_KB || 300);
const totalKb = Number(process.env.IMAGE_TOTAL_KB || 3072);

function walk(root) {
  const out = [];
  for (const entry of readdirSync(root)) {
    const full = join(root, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(dir);
const violations = [];
let totalBytes = 0;

for (const file of files) {
  const size = statSync(file).size;
  totalBytes += size;
  if (size / 1024 > maxKb) {
    violations.push(
      `${relative(process.cwd(), file)}: ${(size / 1024).toFixed(0)} KB (limit ${maxKb} KB)`,
    );
  }
}

const total = totalBytes / 1024;
console.log(
  `Image budget check: ${files.length} files, ${total.toFixed(0)} KB total (limit ${totalKb} KB)`,
);

if (violations.length > 0) {
  console.error(`\nFAIL: ${violations.length} image(s) exceed ${maxKb} KB:`);
  for (const v of violations) console.error(`  - ${v}`);
  process.exitCode = 1;
}

if (total > totalKb) {
  console.error(
    `\nFAIL: total image weight ${total.toFixed(0)} KB exceeds ${totalKb} KB`,
  );
  process.exitCode = 1;
}

if (!process.exitCode) {
  console.log("PASS: image budget within limits");
}
