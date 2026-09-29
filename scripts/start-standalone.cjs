const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const standaloneRoot = path.join(root, ".next", "standalone");
const copies = [
  [path.join(root, "public"), path.join(standaloneRoot, "public")],
  [path.join(root, ".next", "static"), path.join(standaloneRoot, ".next", "static")],
  [path.join(root, ".env.local"), path.join(standaloneRoot, ".env.local")],
];

for (const [source, destination] of copies) {
  if (fs.existsSync(source)) {
    fs.cpSync(source, destination, { recursive: true, force: true });
  }
}

process.chdir(standaloneRoot);
require(path.join(standaloneRoot, "server.js"));