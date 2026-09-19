const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dirsToScan = [
  path.join(rootDir, 'app'),
  path.join(rootDir, 'components')
];

function scanDir(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        scanDir(fullPath, fileList);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

let modifiedCount = 0;

for (const dir of dirsToScan) {
  const files = scanDir(dir);
  for (const file of files) {
    // skip adminStyles.ts itself and scripts
    if (file.endsWith('adminStyles.ts')) continue;

    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('admin.module.css')) {
      const updated = content.replace(/(['"][^'"]*?)admin\.module\.css(['"])/g, '$1adminStyles$2');
      fs.writeFileSync(file, updated, 'utf8');
      console.log(`Updated: ${path.relative(rootDir, file)}`);
      modifiedCount++;
    }
  }
}

console.log(`\nMigration complete. Updated ${modifiedCount} files.`);
