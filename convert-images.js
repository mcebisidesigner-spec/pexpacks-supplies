const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const imgDir = path.join(__dirname, "public", "images");
const filesToConvert = [
  "pexcover-img-01.png",
  "pexcover-img-02.png",
  "pexcover-img-03.png",
  "pexcover-img-04.png",
  "pexcover-img.png",
];

async function convert() {
  for (const file of filesToConvert) {
    const inputPath = path.join(imgDir, file);
    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${file}, does not exist`);
      continue;
    }
    const outputPath = path.join(imgDir, file.replace(".png", ".webp"));
    console.log(`Converting ${file}...`);
    try {
      await sharp(inputPath).webp({ quality: 80 }).toFile(outputPath);
      console.log(`Successfully converted to ${outputPath}`);
    } catch (e) {
      console.error(`Error converting ${file}`, e);
    }
  }
}

convert();
