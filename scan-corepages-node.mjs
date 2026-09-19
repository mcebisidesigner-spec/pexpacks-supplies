import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = "E:\\WORK-FOLDER\\WEB-DESIGN-PROJECTS\\pexpacks-supplies";

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const consumers = new Set();
const classUsage = new Map(); // class -> set of consumer files

function scanFile(p) {
  let src;
  try {
    src = readFileSync(p, "utf8");
  } catch {
    return;
  }
  if (!src.includes("CorePagesView.module.css")) return;
  consumers.add(p);
  const localSet = new Map();
  const re = /styles\.([A-Za-z][A-Za-z0-9_]*)/g;
  let m;
  while ((m = re.exec(src))) {
    const k = m[1];
    localSet.set(k, (localSet.get(k) || 0) + 1);
    if (!classUsage.has(k)) classUsage.set(k, new Set());
    classUsage.get(k).add(p);
  }
  const rel = p.slice(root.length).replace(/^\\/, "");
  const list = [...localSet.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\n${rel}`);
  console.log(`  total uses=${[...localSet.values()].reduce((a, b) => a + b, 0)} distinct=${localSet.size}`);
  console.log(`  ` + list.map(([k, n]) => `${k}(${n})`).join(" "));
}

// 1) all .tsx/.ts under components/admin
for (const f of walk(join(root, "components", "admin"))) {
  if (/\.tsx?$/.test(f)) scanFile(f);
}
// 2) all page.tsx under app/admin
for (const f of walk(join(root, "app", "admin"))) {
  if (/page\.tsx?$/.test(f)) scanFile(f);
}

console.log(`\n=== ${consumers.size} consumers ===`);
console.log(`=== ${classUsage.size} distinct styles.X classes used ===`);
const sorted = [...classUsage.entries()].sort((a, b) => b[1].size - a[1].size);
for (const [k, files] of sorted) {
  console.log(`${String(files.size).padStart(3)}  ${k}`);
}
