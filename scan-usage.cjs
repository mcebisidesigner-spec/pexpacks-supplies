'use strict';
const { readFileSync, readdirSync, statSync, existsSync } = require('node:fs');
const { join, relative } = require('node:path');

const ROOT = 'E:\\WORK-FOLDER\\WEB-DESIGN-PROJECTS\\pexpacks-supplies';

function walk(dir, acc) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) walk(f, acc);
    else acc.push(f);
  }
  return acc;
}

const files = [];
walk(join(ROOT, 'components', 'admin'), files);
walk(join(ROOT, 'app', 'admin'), files);

const consumers = [];
for (const f of files) {
  if (!/\.(tsx|ts|jsx|js)$/.test(f)) continue;
  let src;
  try { src = readFileSync(f, 'utf8'); } catch { continue; }
  if (src.includes('CorePagesView.module.css')) consumers.push(f);
}

const perFile = [];
const globalCount = new Map(); // key -> total usages

for (const f of consumers) {
  const src = readFileSync(f, 'utf8');
  const local = new Map();
  const re = /styles\.([A-Za-z][A-Za-z0-9_]*)/g;
  let m;
  while ((m = re.exec(src))) {
    const k = m[1];
    local.set(k, (local.get(k) || 0) + 1);
    globalCount.set(k, (globalCount.get(k) || 0) + 1);
  }
  const keys = [...local.keys()].sort();
  perFile.push({ rel: relative(ROOT, f), keys, total: [...local.values()].reduce((a, b) => a + b, 0) });
}

console.log('CONSUMERS: ' + consumers.length);
for (const p of perFile) {
  console.log(p.rel + '  [' + keyscount(p) + ' keys / ' + p.total + ' uses]');
  console.log('    ' + p.keys.join(' '));
}

function keyscount(p) { return p.keys.length; }

console.log('\nDISTINCT KEYS: ' + globalCount.size);
const sorted = [...globalCount.entries()].sort((a, b) => b[1] - a[1]);
for (const [k, n] of sorted) console.log(String(n).padStart(4) + '  ' + k-intercept(k));
function intercept(k) { return ''; }
