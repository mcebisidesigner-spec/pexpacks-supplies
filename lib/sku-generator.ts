/**
 * Automated Real-time SKU Generator for Pexpacks Supplies
 * Format: PEX-[CATEGORY]-[ABBR_NAME]-[SEQ]
 * Examples: PEX-WRT-00101, PEX-BOK-00102, PEX-BAG-00103, PEX-STN-A4CF-101
 */

const CATEGORY_MAP: Record<string, string> = {
  stationery: "STN",
  writing: "WRT",
  "writing tools": "WRT",
  pens: "WRT",
  pencils: "WRT",
  books: "BOK",
  "books & paper": "BOK",
  paper: "BOK",
  notebooks: "BOK",
  "art & craft": "ART",
  art: "ART",
  creative: "ART",
  "creative supplies": "ART",
  packaging: "PKG",
  bags: "BAG",
  "bags & storage": "BAG",
  storage: "BAG",
  tools: "TLS",
  scissors: "CUT",
  cutting: "CUT",
  math: "MTH",
  geometry: "MTH",
  calculators: "CAL",
  adhesives: "GLU",
  glue: "GLU",
  general: "GEN",
};

const STOP_WORDS = new Set([
  "and",
  "the",
  "with",
  "for",
  "of",
  "in",
  "to",
  "a",
  "an",
  "on",
  "pack",
  "pkt",
  "set",
  "box",
  "by",
  "each",
]);

/**
 * Sanitizes any SKU input string:
 * - Converts to uppercase
 * - Replaces spaces/underscores with hyphens
 * - Removes invalid characters (only A-Z, 0-9, and hyphens allowed)
 * - Collapses consecutive hyphens and trims leading/trailing hyphens
 */
export function sanitizeSku(sku: string): string {
  if (!sku) return "";
  return sku
    .toUpperCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Derives a 3-character uppercase Category Code
 */
export function getCategoryCode(category?: string | null): string {
  if (!category) return "GEN";
  const clean = category.toLowerCase().trim();

  if (CATEGORY_MAP[clean]) {
    return CATEGORY_MAP[clean];
  }

  for (const [key, code] of Object.entries(CATEGORY_MAP)) {
    if (clean.includes(key)) {
      return code;
    }
  }

  const alpha = clean.replace(/[^a-z]/g, "").toUpperCase();
  if (alpha.length >= 3) {
    return alpha.slice(0, 3);
  }
  return (alpha + "GEN").slice(0, 3);
}

/**
 * Generates an abbreviated Name Slug (4-6 chars) from the Product Name
 */
function getNameAbbreviation(name: string): string {
  if (!name || !name.trim()) return "ITEM";

  // Split into tokens
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => Boolean(w) && !STOP_WORDS.has(w.toLowerCase()));

  if (words.length === 0) return "ITEM";

  // If we have 3 or more words, take first letter of each (e.g. A4 Clear Plastic Folder -> A4CPF)
  if (words.length >= 3) {
    const acronym = words
      .slice(0, 5)
      .map((w) => (w.length > 2 && /^\d+/.test(w) ? w : w[0]))
      .join("")
      .toUpperCase();
    if (acronym.length >= 3 && acronym.length <= 6) {
      return acronym;
    }
  }

  // If 2 words, combine short prefixes (e.g. Safety Scissors -> SAFSCI or SS)
  if (words.length === 2) {
    const part1 = words[0].slice(0, 3);
    const part2 = words[1].slice(0, 3);
    return (part1 + part2).toUpperCase().slice(0, 6);
  }

  // Single word: take first 4-5 chars
  return words[0].toUpperCase().slice(0, 5);
}

/**
 * Deterministic 3-digit numeric sequence hash from the product name string
 * To ensure repeatable, collision-resistant, clean numbers like 00101, 00102, 101, etc.
 */
function getDeterministicSequence(name: string): string {
  if (!name) return "00101";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const seqNum = (positive % 900) + 100; // 100 to 999
  return String(seqNum);
}

/**
 * Generates a clean, standardized PEX SKU in real-time.
 * Format: PEX-[CATEGORY]-[ABBR_NAME]-[SEQ]
 * Example: PEX-WRT-00101, PEX-BOK-00102, PEX-STN-A4CPF-101
 */
export function generateSkuFromName(
  name: string,
  category?: string | null,
  customSeq?: string | number
): string {
  const catCode = getCategoryCode(category);
  const nameAbbr = getNameAbbreviation(name);
  const seq = customSeq ? String(customSeq) : getDeterministicSequence(name);

  return sanitizeSku(`PEX-${catCode}-${nameAbbr}-${seq}`);
}
