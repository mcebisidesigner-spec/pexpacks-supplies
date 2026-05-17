/**
 * Standardize grades for all schools:
 * - Primary schools → Grade R, Grade 1 through Grade 7 (8 grades)
 * - High schools → Grade 8 through Grade 12 (5 grades)
 *
 * Uses existing grade data as templates for contents/price where available,
 * and generates sensible defaults for missing grades.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

const indexPath = join(dataDir, "school-index.json");
const recordsPath = join(dataDir, "school-records.json");

const indexData = JSON.parse(readFileSync(indexPath, "utf-8"));
const recordsData = JSON.parse(readFileSync(recordsPath, "utf-8"));

// --- Grade definitions ---

const PRIMARY_GRADES = [
  { grade: "Grade R", gradeSlug: "grade-r" },
  { grade: "Grade 1", gradeSlug: "grade-1" },
  { grade: "Grade 2", gradeSlug: "grade-2" },
  { grade: "Grade 3", gradeSlug: "grade-3" },
  { grade: "Grade 4", gradeSlug: "grade-4" },
  { grade: "Grade 5", gradeSlug: "grade-5" },
  { grade: "Grade 6", gradeSlug: "grade-6" },
  { grade: "Grade 7", gradeSlug: "grade-7" },
];

const HIGH_GRADES = [
  { grade: "Grade 8", gradeSlug: "grade-8" },
  { grade: "Grade 9", gradeSlug: "grade-9" },
  { grade: "Grade 10", gradeSlug: "grade-10" },
  { grade: "Grade 11", gradeSlug: "grade-11" },
  { grade: "Grade 12", gradeSlug: "grade-12" },
];

// --- Default pack templates per grade ---

const gradeTemplates = {
  "grade-r": {
    price: 649,
    contents: [
      "Exercise books",
      "Wax crayons",
      "Glue stick",
      "Safety scissors",
      "Scrapbook",
      "Pencils",
    ],
  },
  "grade-1": {
    price: 689,
    contents: [
      "Exercise books",
      "Pencils",
      "Crayons",
      "Glue stick",
      "Scissors",
      "Eraser",
    ],
  },
  "grade-2": {
    price: 709,
    contents: [
      "Exercise books",
      "Pencils",
      "Crayons",
      "Glue stick",
      "Eraser",
      "Sharpener",
    ],
  },
  "grade-3": {
    price: 739,
    contents: [
      "Exercise books",
      "HB pencils",
      "Colour pencils",
      "Glue stick",
      "30 cm ruler",
      "Eraser",
    ],
  },
  "grade-4": {
    price: 789,
    contents: [
      "Exercise books",
      "Blue pens",
      "HB pencils",
      "30 cm ruler",
      "Colour pencils",
      "Glue stick",
      "Eraser",
    ],
  },
  "grade-5": {
    price: 829,
    contents: [
      "Exercise books",
      "Blue pens",
      "Pencils",
      "Colour pencils",
      "Files",
      "Glue stick",
    ],
  },
  "grade-6": {
    price: 849,
    contents: [
      "Exercise books",
      "Blue pens",
      "Pencils",
      "Exam pad",
      "Files",
      "Mathematical set",
    ],
  },
  "grade-7": {
    price: 869,
    contents: [
      "Exercise books",
      "Pens",
      "Pencils",
      "Mathematical set",
      "Colour pencils",
      "Files",
    ],
  },
  "grade-8": {
    price: 899,
    contents: [
      "Exercise books",
      "Blue and black pens",
      "Pencils",
      "Mathematical set",
      "Exam pad",
      "Files",
      "Calculator",
    ],
  },
  "grade-9": {
    price: 929,
    contents: [
      "Exercise books",
      "Blue and black pens",
      "Pencils",
      "Mathematical set",
      "Exam pad",
      "Files",
      "Calculator",
    ],
  },
  "grade-10": {
    price: 969,
    contents: [
      "A4 exercise books",
      "Blue and black pens",
      "Pencils",
      "Mathematical set",
      "Exam pads",
      "Lever arch files",
      "Scientific calculator",
    ],
  },
  "grade-11": {
    price: 999,
    contents: [
      "A4 exercise books",
      "Blue and black pens",
      "Pencils",
      "Mathematical set",
      "Exam pads",
      "Lever arch files",
      "Scientific calculator",
    ],
  },
  "grade-12": {
    price: 1049,
    contents: [
      "A4 exercise books",
      "Blue and black pens",
      "Pencils",
      "Mathematical set",
      "Exam pads",
      "Lever arch files",
      "Scientific calculator",
      "Highlighters",
    ],
  },
};

const deliveryNotes = [
  "Prepared for delivery before school starts.",
  "Availability confirmed during order follow-up.",
];

const availabilities = ["in-stock", "pre-order", "seasonal"];

// Known edge-case overrides
const KNOWN_HIGH = ["King Edward VII"];
const KNOWN_PRIMARY = ["Benoni Junior"];

function isPrimary(name) {
  if (KNOWN_PRIMARY.some((n) => name.includes(n))) return true;
  return /primary|junior/i.test(name);
}

function isHigh(name) {
  if (KNOWN_HIGH.some((n) => name.includes(n))) return true;
  return /high|secondary|hoerskool|hoër|hoer/i.test(name);
}

function getSchoolType(name) {
  if (isPrimary(name)) return "primary";
  if (isHigh(name)) return "high";
  return "unknown";
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Add slight price variation (+/- up to R30) to avoid identical prices
function varyPrice(base) {
  const offset = Math.round((Math.random() * 60 - 30) / 10) * 10;
  return base + offset;
}

/**
 * Build the full grade list for a school record (with full pack data).
 */
function buildFullGrades(school, gradeList) {
  const slug = school.slug;
  const existingMap = new Map();
  for (const g of school.grades) {
    existingMap.set(g.gradeSlug, g);
  }

  return gradeList.map((gradeDef) => {
    const existing = existingMap.get(gradeDef.gradeSlug);
    if (existing) {
      // Keep existing data, just ensure id format is consistent
      return {
        ...existing,
        id: `${slug}-${gradeDef.gradeSlug}`,
        grade: gradeDef.grade,
        gradeSlug: gradeDef.gradeSlug,
      };
    }

    // Generate new grade pack from template
    const template = gradeTemplates[gradeDef.gradeSlug];
    return {
      id: `${slug}-${gradeDef.gradeSlug}`,
      grade: gradeDef.grade,
      gradeSlug: gradeDef.gradeSlug,
      price: varyPrice(template.price),
      contents: [...template.contents],
      deliveryNote: randomChoice(deliveryNotes),
      availability: randomChoice(availabilities),
    };
  });
}

/**
 * Build the index grade list (without pack data).
 */
function buildIndexGrades(slug, gradeList) {
  return gradeList.map((gradeDef) => ({
    id: `${slug}-${gradeDef.gradeSlug}`,
    grade: gradeDef.grade,
    gradeSlug: gradeDef.gradeSlug,
  }));
}

// --- Process school-records.json ---
let primaryCount = 0;
let highCount = 0;
let unknownCount = 0;

for (const school of recordsData) {
  const type = getSchoolType(school.name);
  if (type === "primary") {
    school.grades = buildFullGrades(school, PRIMARY_GRADES);
    primaryCount++;
  } else if (type === "high") {
    school.grades = buildFullGrades(school, HIGH_GRADES);
    highCount++;
  } else {
    unknownCount++;
    console.log(`⚠ Unknown school type: "${school.name}" — skipped`);
  }
}

// --- Process school-index.json ---
for (const school of indexData) {
  const type = getSchoolType(school.name);
  if (type === "primary") {
    school.grades = buildIndexGrades(school.slug, PRIMARY_GRADES);
  } else if (type === "high") {
    school.grades = buildIndexGrades(school.slug, HIGH_GRADES);
  }
}

// --- Write files ---
writeFileSync(recordsPath, JSON.stringify(recordsData, null, 2) + "\n");
writeFileSync(indexPath, JSON.stringify(indexData, null, 2) + "\n");

console.log(`\n✅ Done!`);
console.log(`   Primary schools updated: ${primaryCount}`);
console.log(`   High schools updated: ${highCount}`);
console.log(`   Unknown/skipped: ${unknownCount}`);
