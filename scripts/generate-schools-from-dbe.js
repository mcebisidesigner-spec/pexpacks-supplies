/**
 * Generates school-index.json and school-records.json from the DBE 2025 masterlist XLSX.
 *
 * Usage:
 *   1. Download the latest Gauteng XLSX from https://www.education.gov.za/Programmes/EMIS/EMISDownloads.aspx
 *      (Look for the most recent "Quarter X of YYYY" → "Gauteng" link)
 *   2. Save it as tmp/gauteng-dbe-2025.xlsx
 *   3. Run: node scripts/generate-schools-from-dbe.js
 *
 * The XLSX contains the official DBE EMIS masterlist with fields:
 *   Official_Institution_Name, Status, Phase_PED, EIDistrict, DMunName,
 *   Town_City, Quintile, Learners2025, Educators2025, and more.
 *
 * Schools are mapped to city/area using DMunName (metro) + Town_City + EIDistrict.
 */

const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// ── 1. Read DBE XLSX ──
const xlsxPath = path.join(__dirname, "..", "tmp", "gauteng-dbe-2025.xlsx");
const wb = XLSX.readFile(xlsxPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(ws, { defval: "" });

const active = raw.filter((r) => String(r.Status) === "OPEN");
console.log(`Total OPEN schools: ${active.length}`);

// ── 2. Town → City mapping ──
const townToCity = {
  JOHANNESBURG: "Johannesburg",
  SOWETO: "Soweto",
  SANDTON: "Sandton",
  ROODEPOORT: "Roodepoort",
  RANDBURG: "Randburg",
  FOURWAYS: "Sandton",
  BRYANSTON: "Sandton",
  MEADOWLANDS: "Soweto",
  DOBSONVILLE: "Soweto",
  FLORIDA: "Roodepoort",
  LENASIA: "Lenasia",
  // Ekurhuleni
  BENONI: "Benoni",
  BOKSBURG: "Boksburg",
  KEMPTON_PARK: "Kempton Park",
  GERMISTON: "Germiston",
  EDENVALE: "Edenvale",
  ALBERTON: "Alberton",
  SPRINGS: "Springs",
  BRAKPAN: "Brakpan",
  NIGEL: "Nigel",
  TEMBISA: "Tembisa",
  DAVEYTON: "Daveyton",
  TSAKANE: "Tsakane",
  THOKOZA: "Thokoza",
  OLIFANTSFONTEIN: "Olifantsfontein",
  // Tshwane
  PRETORIA: "Pretoria",
  CENTURION: "Centurion",
  MIDRAND: "Midrand",
  MAMELODI: "Mamelodi",
  SOSHANGUVE: "Soshanguve",
  ATTERIDGEVILLE: "Atteridgeville",
  TEMBA: "Temba",
  MABOPANE: "Soshanguve",
  HAMMANSKRAAL: "Pretoria",
  EKANGALA: "Pretoria",
  CULLINAN: "Cullinan",
  RAYTON: "Rayton",
  BRONKHORSTSPRUIT: "Pretoria",
  GA_RANKUWA: "Ga-Rankuwa",
  // Sedibeng
  VEREENIGING: "Vereeniging",
  VANDERBIJLPARK: "Vanderbijlpark",
  HEIDELBERG: "Heidelberg",
  MEYERTON: "Meyerton",
  SEBOKENG: "Sebokeng",
  EVATON: "Evaton",
  RANDVAAL: "Vereeniging",
  // Typos
  JOHAANESBURG: "Johannesburg",
  JOHHANESBURG: "Johannesburg",
  JOHHANES_BURG: "Johannesburg",
  BRONKHORSTPRUIT: "Pretoria",
  BRONKHOSTSPRUIT: "Pretoria",
  BRONKHORSPRUIT: "Pretoria",
  MEADOWLANDS: "Soweto",
  DOBSONVILLE: "Soweto",
  HAMMASKRAAL: "Pretoria",
  // West Rand
  KRUGERSDORP: "Krugersdorp",
  RANDFONTEIN: "Randfontein",
  CARLETONVILLE: "Carletonville",
  WESTONARIA: "Westonaria",
  MOGALE_CITY: "Mogale City",
  FOCHVILLE: "Fochville",
  MAGALIESBURG: "Magaliesburg",
  MERAFONG: "Merafong",
};

// ── 3. Map DMunName → Metro region key ──
const dmunToMetro = {
  "CITY OF JOHANNESBURG METROPOLITAN MUNICIPALITY": "Johannesburg",
  "EKURHULENI METROPOLITAN MUNICIPALITY": "Ekurhuleni",
  "CITY OF TSHWANE METROPOLITAN MUNICIPALITY": "Tshwane",
  "SEDIBENG DISTRICT MUNICIPALITY": "Sedibeng",
  "WEST RAND DISTRICT MUNICIPALITY": "West Rand",
};

function normalizeTown(t) {
  if (!t) return "";
  return t
    .trim()
    .toUpperCase()
    .replace(/'/g, "")
    .replace(/\./g, "")
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Map Ekurhuleni districts to city when Town_City is a Johannesburg variant
const ekurhuleniDistrictCity = {
  "EKURHULENI NORTH": "Kempton Park",
  "EKURHULENI SOUTH": "Germiston",
  "GAUTENG EAST": "Springs",
};

function mapCity(row) {
  const dmun = (row.DMunName || "").trim().toUpperCase();
  const metro = dmunToMetro[dmun] || "Other";
  const town = normalizeTown(row.Town_City);
  const dist = (row.EIDistrict || "").trim().toUpperCase();

  // Direct town match
  if (townToCity[town]) {
    const city = townToCity[town];

    // Fix: schools in Ekurhuleni DMun should NOT be "Johannesburg" even if Town_City says so
    if (city === "Johannesburg" && dmun.includes("EKURHULENI")) {
      return { city: ekurhuleniDistrictCity[dist] || "Germiston", metro: "Ekurhuleni" };
    }
    if (city === "Johannesburg" && dmun.includes("WEST RAND")) {
      return { city: "Krugersdorp", metro: "West Rand" };
    }
    if (city === "Johannesburg" && dmun.includes("SEDIBENG")) {
      return { city: "Vereeniging", metro: "Sedibeng" };
    }
    return { city, metro };
  }

  // Handle Johannesburg variants in non-CoJ metros using EIDistrict
  const isJohannesburgVariant = town === "JHB" || /^JOH.*BURG$/i.test(town.replace(/_/g, ""));
  if (isJohannesburgVariant || town === "" || town === "UNKNOWN") {
    if (dmun.includes("EKURHULENI")) {
      return { city: ekurhuleniDistrictCity[dist] || "Germiston", metro: "Ekurhuleni" };
    }
    if (dmun.includes("WEST RAND")) return { city: "Krugersdorp", metro: "West Rand" };
    if (dmun.includes("SEDIBENG")) return { city: "Vereeniging", metro: "Sedibeng" };
    if (dmun.includes("TSHWANE")) return { city: "Pretoria", metro: "Tshwane" };
    if (dmun.includes("JOHANNESBURG")) return { city: "Johannesburg", metro };
  }

  // Fallback by DMun
  if (dmun.includes("JOHANNESBURG")) return { city: "Johannesburg", metro };
  if (dmun.includes("EKURHULENI")) return { city: ekurhuleniDistrictCity[dist] || "Germiston", metro: "Ekurhuleni" };
  if (dmun.includes("TSHWANE")) return { city: "Pretoria", metro };
  if (dmun.includes("SEDIBENG")) return { city: "Vereeniging", metro };
  if (dmun.includes("WEST RAND")) return { city: "Krugersdorp", metro };
  return { city: "Gauteng", metro: "Other" };
}

// ── 4. Grade templates (from original generator) ──
const primaryGrades = [
  { grade: "Grade R", price: 679, contents: ["Exercise books", "Wax crayons", "Glue stick", "Safety scissors", "Scrapbook", "Pencils"] },
  { grade: "Grade 1", price: 699, contents: ["Exercise books", "Pencils", "Crayons", "Glue stick", "Scissors", "Eraser"] },
  { grade: "Grade 2", price: 719, contents: ["Exercise books", "Pencils", "Crayons", "Glue stick", "Eraser", "Sharpener"] },
  { grade: "Grade 3", price: 749, contents: ["Exercise books", "HB pencils", "Colour pencils", "Glue stick", "30 cm ruler", "Eraser"] },
  { grade: "Grade 4", price: 799, contents: ["Exercise books", "Blue pens", "HB pencils", "30 cm ruler", "Colour pencils", "Glue stick", "Eraser"] },
  { grade: "Grade 5", price: 819, contents: ["Exercise books", "Blue pens", "Pencils", "Colour pencils", "Files", "Glue stick"] },
  { grade: "Grade 6", price: 829, contents: ["Exercise books", "Blue pens", "Pencils", "Exam pad", "Files", "Mathematical set"] },
  { grade: "Grade 7", price: 849, contents: ["Exercise books", "Pens", "Pencils", "Mathematical set", "Colour pencils", "Files"] },
];

const highGrades = [
  { grade: "Grade 8", price: 899, contents: ["Exercise books", "Blue pens", "Pencils", "Highlighters", "Files", "Exam pad"] },
  { grade: "Grade 9", price: 919, contents: ["Exercise books", "Blue pens", "Pencils", "Highlighters", "Files", "Exam pad", "Mathematical set"] },
  { grade: "Grade 10", price: 949, contents: ["Exercise books", "Pens", "Pencils", "Exam pad", "Files", "Mathematical set", "Calculator"] },
  { grade: "Grade 11", price: 979, contents: ["Exercise books", "Pens", "Pencils", "Exam pad", "Files", "Mathematical set", "Highlighters"] },
  { grade: "Grade 12", price: 999, contents: ["Exercise books", "Pens", "Pencils", "Exam pad", "Files", "Mathematical set", "Calculator", "Highlighters"] },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── 5. Build school data ──
let seed = 42;
function seededRandom() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

// Assign grades deterministically for reproducibility
// For real schools, assign ALL grade packs for their phase (or most of them)
function getSchoolGrades(phase) {
  if (phase === "PRIMARY SCHOOL" || phase === "INTERMEDIATE SCHOOL") return primaryGrades;
  if (phase === "SECONDARY SCHOOL") return highGrades;
  if (phase === "COMBINED SCHOOL") {
    // Combined: pick a mix of primary and high grades
    return [
      ...primaryGrades.slice(0, 4), // Grade R-4
      ...highGrades.slice(2, 5), // Grade 10-12
    ];
  }
  if (phase === "SPECIAL NEEDS EDUCATION SCHOOL") return primaryGrades.slice(0, 4);
  return primaryGrades;
}

const schoolIndex = [];
const schoolRecords = [];
const usedSlugs = new Set();

for (const row of active) {
  const rawName = row.Official_Institution_Name || "";
  // Clean up the name: title case
  const name = rawName
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  if (!name) continue;

  const { city, metro } = mapCity(row);
  const phase = row.Phase_PED || "";

  let slug = slugify(name);
  if (usedSlugs.has(slug)) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  usedSlugs.add(slug);

  const grades = getSchoolGrades(phase).map((g) => ({
    id: `${slug}-${slugify(g.grade)}`,
    grade: g.grade,
    gradeSlug: slugify(g.grade),
    price: g.price + Math.floor(seededRandom() * 6) * 10 - 20,
    contents: g.contents,
    deliveryNote:
      seededRandom() < 0.3
        ? "Prepared for delivery before school starts."
        : "Availability confirmed during order follow-up.",
    availability: seededRandom() < 0.15
      ? "in-stock"
      : seededRandom() < 0.3
        ? "seasonal"
        : "pre-order",
  }));

  const id = `school-${slug}`;
  const isPartner = seededRandom() < (phase === "SECONDARY SCHOOL" ? 0.05 : 0.08);
  const lowestPrice = Math.min(...grades.map((g) => g.price));

  schoolIndex.push({
    id,
    name,
    slug,
    city,
    metro,
    province: "Gauteng",
    isPartnerSchool: isPartner,
    grades: grades.map((g) => ({
      id: g.id,
      grade: g.grade,
      gradeSlug: g.gradeSlug,
    })),
    lowestPrice,
  });

  schoolRecords.push({
    id,
    name,
    slug,
    city,
    metro,
    province: "Gauteng",
    isPartnerSchool: isPartner,
    grades,
  });
}

// ── 6. Write output files ──
const dataDir = path.join(__dirname, "..", "data");

fs.writeFileSync(
  path.join(dataDir, "school-index.json"),
  JSON.stringify(schoolIndex, null, 2),
  "utf-8"
);

fs.writeFileSync(
  path.join(dataDir, "school-records.json"),
  JSON.stringify(schoolRecords, null, 2),
  "utf-8"
);

console.log(`\n✅ Generated ${schoolIndex.length} schools`);
console.log(`   Cities: ${[...new Set(schoolIndex.map((s) => s.city))].join(", ")}`);
console.log(`   Metro: ${[...new Set(schoolIndex.map((s) => s.metro))].join(", ")}`);

// Stats by city
const cityStats = {};
schoolIndex.forEach((s) => {
  if (!cityStats[s.city]) cityStats[s.city] = { primary: 0, high: 0, combined: 0 };
  const rec = schoolRecords.find((r) => r.id === s.id);
  if (rec) {
    const grades = rec.grades.map((g) => g.grade);
    const hasPrimary = grades.some((g) => g.startsWith("Grade ") && parseInt(g.split(" ")[1]) <= 7);
    const hasHigh = grades.some((g) => parseInt(g.split(" ")[1]) >= 8);
    if (hasPrimary && hasHigh) cityStats[s.city].combined++;
    else if (hasHigh) cityStats[s.city].high++;
    else cityStats[s.city].primary++;
  }
});

console.log(`\n   Breakdown:`);
Object.entries(cityStats)
  .sort((a, b) => b[1].primary + b[1].high + b[1].combined - (a[1].primary + a[1].high + a[1].combined))
  .forEach(([city, stats]) => {
    const total = stats.primary + stats.high + stats.combined;
    console.log(`   ${city}: ${total} (P:${stats.primary} H:${stats.high} C:${stats.combined})`);
  });
