const sharp = require("sharp");
const { readFileSync, writeFileSync } = require("fs");

const files = [
  "public\\images\\unboxing-items.webp",
  "public\\images\\pexcover-banner.webp",
  "public\\images\\hero-school-delivery.webp",
  "public\\images\\pexcover-img-01.webp",
  "public\\images\\pexcover-img-02.webp",
  "public\\images\\pexcover-img-03.webp",
  "public\\images\\pexcover-img-04.webp",
  "public\\images\\pexcover-img.webp",
  "public\\images\\office-packs.webp",
];

(async () => {
  for (const file of files) {
    const input = readFileSync(file);
    const before = input.length;
    const output = await sharp(input).webp({ quality: 75, effort: 6 }).toBuffer();
    const after = output.length;
    const saved = ((before - after) / before * 100).toFixed(1);
    writeFileSync(file, output);
    console.log(`${file.split("\\").pop()}: ${(before/1024).toFixed(0)} KB → ${(after/1024).toFixed(0)} KB (${saved}% saved)`);
  }
})();
