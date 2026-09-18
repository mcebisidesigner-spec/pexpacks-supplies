import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";

const root = "E:\\WORK-FOLDER\\WEB-DESIGN-PROJECTS\\pexpacks-supplies";

const consumers = new Set();
const classCount = new Map(); // className -> #consumer files using it

function scanFile(p) {
  const src = readFileSync(p, "utf8");
  if (!src.includes("CorePagesView.module.css")) return;
  consumers.add(p);
  const seen = new Set();
  const re = /styles\.([A-Za-z][A-Za-z0-9_]*)/g;
  let m;
  while ((m = re.exec(src))) {
    seen.add(m[1]);
  }
  const classes = [...seen].sort();
  classCount.set(
    p.replace(root + "\\", ""),
    { classes, n: classes.length },
  );
}

// directory scanner (no bracket globs, no wildcards)
function walk(dir, filter) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full, filter));
    else if (filter(full)) out.push(full);
  }
  return out;
}

const viewsDir = join(root, "components", "admin", "views");
if (existsSync(viewsDir)) {
  for (const f of readdirSync(viewsDir)) {
    if (f.endsWith(".tsx") || f.endsWith(".ts")) scanFile(join(viewsDir, f));
  }
}

// all admin components + app/admin pages
const allFiles = [
  ...walk(join(root, "components", "admin"), (f) => /\.tsx?$/.test(f)),
  ...walk(join(root, "app", "admin"), (f) => f.endsWith(".tsx") || f.endsWith(".ts")),
];
for (const f of allFiles) scanFile(f);

console.log(`=== ${consumers.size} consumers ===`);
for (const [file, { classes, n }] of classCount) {
  console.log(`${n}  ${file}\n      ${classes.join(" ")}`);
}

// combined inventory sorted by frequency
const freq = new Map();
for (const { classes } of classCount.values()) {
  for (const c of classes) freq.set(c, (freq.get(c) || 0) + 1);
}
console.log(`\n=== distinct classes: ${freq.size} ===`);
console.log("=== freq (how many consumer files use each class) ===");
for (const [c, n] of [...freq.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`${String(n).padStart(3)}  ${c}`);
}
