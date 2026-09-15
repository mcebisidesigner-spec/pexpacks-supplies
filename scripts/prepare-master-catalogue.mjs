import fs from "fs";
import { generateSkuFromName } from "../lib/sku-generator.ts";
import { inferIcon } from "../lib/packs/normalisePackItems.ts";

const existing = JSON.parse(fs.readFileSync("scripts/existing-products.json", "utf8"));
const catalogue308 = JSON.parse(fs.readFileSync("scripts/catalogue-308-clean.json", "utf8"));

// Category mapping helper
function deriveCategory(pdfGroup, name) {
  const n = name.toLowerCase();
  if (/exercise book|handwriting book|music manuscript|nature study|spelling/.test(n)) {
    return "Exercise Books";
  }
  if (/hard cover|counter book|visual diary|index book|project book/.test(n)) {
    return "Hardcover Books";
  }
  if (/ballpoint|gel pen|pen -/.test(n)) {
    return "Pens";
  }
  if (/graphite pencil|beginner pencil|mechanical pencil|pencil leads/.test(n)) {
    return "Pencils";
  }
  if (/fineliner/.test(n)) {
    return "Fineliners";
  }
  if (/highlighter/.test(n)) {
    return "Highlighters";
  }
  if (/marker|chalk/.test(n)) {
    return "Markers";
  }
  if (/colouring pencil|crayon|oil pastel|chalk pastel|charcoal/.test(n)) {
    return "Colouring";
  }
  if (/sharpener/.test(n)) {
    return "Sharpeners";
  }
  if (/eraser|correction|erasing shield/.test(n)) {
    return "Erasers";
  }
  if (/glue|prestik|adhesive|tape dispenser|double-sided tape|masking tape|clear adhesive tape/.test(n)) {
    return "Adhesives";
  }
  if (/ruler|metre ruler|scale ruler/.test(n)) {
    return "Measurement";
  }
  if (/geometry|compass|divider|french curve|circle template|lettering stencil|t-square|drawing board/.test(n)) {
    return "Mathematics";
  }
  if (/calculator/.test(n)) {
    return "Calculators";
  }
  if (/file|ring binder|lever arch|sleeve|divider|clipboard|document|quotation folder|portfolio file|expanding/.test(n)) {
    return "Filing";
  }
  if (/pencil case|pencil bag/.test(n)) {
    return "Pencil Cases";
  }
  if (/book cover|kraft book|labels|stickers|sticky notes|page flags|laminating/.test(n)) {
    return "Book Covering";
  }
  if (/paper|board|card|tissue|crepe|cellophane|foam sheet|felt sheet|newsprint/.test(n)) {
    return "Paper";
  }
  if (/paint|palette|water pot|apron|modelling clay|play dough|canvas|sketching.*ink/.test(n)) {
    return "Art Supplies";
  }
  if (/scissor|cutter|cutting|knife/.test(n)) {
    return "Cutting";
  }
  if (/stapler|staples|staple remover|punch|paper clip|binder clip|rubber band|push pin|split pin|whiteboard \/ writing slate|pipe cleaner|pom pom|feather|googly eye|sucker stick|cotton wool|wool|string|twine|button|sequin|glitter -|colouring book|envelope|presentation folder|report cover/.test(n)) {
    return "Stationery";
  }
  if (/usb|flash drive|earphone|headphone|mouse/.test(n)) {
    return "Digital";
  }
  return "Stationery";
}

// Unit & packaging helper
function deriveUnitAndPackaging(name) {
  const n = name.toLowerCase();
  if (/pack\s*(\d+)/.test(n)) {
    const qty = n.match(/pack\s*(\d+)/)[1];
    return { unit: "pack", packaging: `pack of ${qty}` };
  }
  if (/(\d+)[ -]pack/.test(n)) {
    const qty = n.match(/(\d+)[ -]pack/)[1];
    return { unit: "pack", packaging: `pack of ${qty}` };
  }
  if (/set\s*-?\s*(\d+)/.test(n)) {
    const qty = n.match(/set\s*-?\s*(\d+)/)[1];
    return { unit: "set", packaging: `set of ${qty}` };
  }
  if (/box\s*(\d+)/.test(n)) {
    const qty = n.match(/box\s*(\d+)/)[1];
    return { unit: "box", packaging: `box of ${qty}` };
  }
  if (/box/.test(n)) return { unit: "box", packaging: "box" };
  if (/set/.test(n)) return { unit: "set", packaging: "set" };
  if (/roll/.test(n)) return { unit: "roll", packaging: "single roll" };
  if (/pad/.test(n)) return { unit: "pad", packaging: "pad" };
  if (/ream/.test(n)) return { unit: "ream", packaging: "ream of 500" };
  if (/bottle/.test(n)) return { unit: "bottle", packaging: "bottle" };
  if (/tube/.test(n)) return { unit: "tube", packaging: "tube" };
  return { unit: "each", packaging: "single" };
}

// Pexcover classification helper
function derivePexcover(name, category) {
  const n = name.toLowerCase();
  if (!/exercise book|counter book|hard cover|hardcover|graph book|handwriting book|music manuscript|nature study|spelling|homework diary|index book|project book/.test(n)) {
    return { requires_pexcover: false, pexco_code: null };
  }
  if (/pad|loose|refill|carry cover/.test(n)) {
    return { requires_pexcover: false, pexco_code: null };
  }

  // Softcover A5 / A4 thin (32, 48, 72 pages)
  if (/a5.*soft cover|a5l.*soft cover|a4.*soft cover.*(32|48|72)|a5.*handwriting|a5.*spelling/.test(n)) {
    return { requires_pexcover: true, pexco_code: "PEXCO01" };
  }
  // Softcover A4 96 pages
  if (/a4.*soft cover.*96|nature study|music manuscript|a4 handwriting/.test(n)) {
    return { requires_pexcover: true, pexco_code: "PEXCO02" };
  }
  // Hardcover / Counter book 96 - 192 pages
  if (/hard cover.*(96|192)|counter book.*(96|192)|homework diary|project book/.test(n)) {
    return { requires_pexcover: true, pexco_code: "PEXCO04" };
  }
  // Heavy hardcovers 288 - 384 pages
  if (/hard cover.*(288|384)|counter book.*(288|384)|index book/.test(n)) {
    return { requires_pexcover: true, pexco_code: "PEXCO05" };
  }
  return { requires_pexcover: true, pexco_code: "PEXCO01" };
}

// Icon helper
function deriveIcon(name, category) {
  const n = name.toLowerCase();
  if (/exercise book|counter book|hard cover|hardcover|handwriting|music manuscript|nature study|spelling|homework diary|index book|project book|colouring book/.test(n)) return "book";
  if (/pad|paper|ream/.test(n)) return "pad";
  if (/ballpoint|gel pen|pen -|fineliner/.test(n)) return "pen";
  if (/pencil|crayon|pastels|charcoal/.test(n)) return "pencil";
  if (/highlighter/.test(n)) return "highlighter";
  if (/marker|chalk/.test(n)) return "marker";
  if (/eraser|correction|erasing/.test(n)) return "eraser";
  if (/sharpener/.test(n)) return "sharpener";
  if (/ruler|metre ruler|scale ruler/.test(n)) return "ruler";
  if (/geometry|compass|divider|french curve|circle template|lettering stencil|t-square|drawing board/.test(n)) return "compass";
  if (/calculator/.test(n)) return "calculator";
  if (/glue stick/.test(n)) return "stick";
  if (/glue|adhesive|prestik/.test(n)) return "glue";
  if (/tape/.test(n)) return "tack";
  if (/scissor|cutter|knife|cutting/.test(n)) return "scissors";
  if (/pencil case|pencil bag/.test(n)) return "case";
  if (/file|folder|sleeve|binder|divider|clipboard|box \/ archive/.test(n)) return "file";
  if (/paint|brush|palette|canvas|air-dry|clay|dough|ink/.test(n)) return "palette";
  if (/usb|flash drive|earphone|headphone|mouse/.test(n)) return "box";
  const inferred = inferIcon(name);
  return inferred || "box";
}

// Check reconciliation
const exactMap = {
  "SA-0013": "PEX-EX-A4-72FM",
  "SA-0017": "PEX-EX-A4-72IM",
  "SA-0016": "PEX-EX-A4-72QM",
  "SA-0018": "PEX-EX-A4-72UN",
  "SA-0023": "PEX-EX-A4-192HC",
  "SA-0025": "PEX-EX-A4-288HC",
  "SA-0022": "PEX-EX-A4-96HC",
  "SA-0051": "PEX-EX-A4-MUS",
  "SA-0034": "PEX-EX-A4-NS",
  "SA-0005": "PEX-EX-A5-72FM",
  "SA-0181": "PEX-FL-LEV-ARCH",
  "SA-0171": "PEX-PC-DENIM",
  "SA-0076": "PEX-PN-BIC-BLK",
  "SA-0075": "PEX-PN-BIC-BLU",
  "SA-0077": "PEX-PN-BIC-RED",
  "SA-0129": "PEX-GL-BLUTACK",
  "SA-0127": "PEX-GL-WOOD-100",
  "SA-0183": "PEX-FL-DISP-20",
  "SA-0184": "PEX-FL-DISP-30",
  "SA-0185": "PEX-FL-DISP-50",
  "SA-0163": "PEX-CALC-CASIO",
  "SA-0170": "PEX-PC-PVC-33",
  "SA-0096": "PEX-CP-FC-12",
  "SA-0097": "PEX-CP-FC-24",
  "SA-0150": "PEX-MT-OXFORD",
  "SA-0283": "PEX-SC-MAP-SHARP",
  "SA-0117": "PEX-SH-DBL-MET",
  "SA-0280": "PEX-SC-MAP-BLUNT",
  "SA-0111": "PEX-ER-MAP-SOFT",
  "SA-0139": "PEX-RL-MAR-30",
  "SA-0102": "PEX-CR-MON-12",
  "SA-0104": "PEX-CR-PNT-16",
  "SA-0090": "PEX-MK-WB-BLK",
  "SA-0200": "PEX-BK-COVER-10",
  "SA-0198": "PEX-BK-ROLL-2M",
  "SA-0124": "PEX-GL-PRITT-22",
  "SA-0125": "PEX-GL-PRITT-43",
  "SA-0167": "PEX-CALC-SHARP",
  "SA-0087": "PEX-MK-PM-BLK",
  "SA-0085": "PEX-MK-HL-4PK",
  "SA-0062": "PEX-PC-STAD-2B",
  "SA-0060": "PEX-PC-STAD-HB",
  "SA-0214": "PEX-PP-TYP-A4"
};

const existingSkuMap = new Map(existing.map(e => [e.sku, e]));
const usedSkus = new Set(existing.map(e => e.sku));

const finalMapping = [];
let createCount = 0;
let keepCount = 0;

for (const it of catalogue308) {
  const matchedSku = exactMap[it.id];
  const matchedProduct = matchedSku ? existingSkuMap.get(matchedSku) : null;
  const category = deriveCategory(it.group, it.name);
  const { unit, packaging } = deriveUnitAndPackaging(it.name);
  const pexcover = derivePexcover(it.name, category);
  const icon = deriveIcon(it.name, category);

  if (matchedProduct) {
    keepCount++;
    finalMapping.push({
      pdfId: it.id,
      name: it.name,
      action: "KEEP_EXISTING",
      existingId: matchedProduct.id,
      sku: matchedProduct.sku,
      category: matchedProduct.category,
      brand: matchedProduct.brand,
      unit: matchedProduct.unit || unit,
      packaging: matchedProduct.packaging || packaging,
      costPrice: matchedProduct.latest_verified_cost,
      sellingPrice: matchedProduct.current_selling_price,
      supplier: matchedProduct.preferred_supplier_id ? "Assigned" : "Unassigned",
      visibility: matchedProduct.visibility,
      requires_pexcover: matchedProduct.requires_pexcover,
      pexco_code: matchedProduct.pexco_code,
      icon: matchedProduct.icon || icon,
    });
  } else {
    createCount++;
    // Generate clean unique SKU
    let genSku = generateSkuFromName(it.name, category, "Add-Brand-Name");
    if (usedSkus.has(genSku)) {
      // Append deterministic counter
      let counter = 2;
      while (usedSkus.has(`${genSku}-${counter}`)) {
        counter++;
      }
      genSku = `${genSku}-${counter}`;
    }
    usedSkus.add(genSku);

    finalMapping.push({
      pdfId: it.id,
      name: it.name,
      description: it.description,
      action: "CREATE_NEW",
      existingId: null,
      sku: genSku,
      category,
      brand: "Add-Brand-Name",
      unit,
      packaging,
      costPrice: null,
      sellingPrice: 0,
      supplier: "Unassigned",
      visibility: "internal",
      requires_pexcover: pexcover.requires_pexcover,
      pexco_code: pexcover.pexco_code,
      icon,
      typicalGrades: it.typicalGrades.replace(/\s+/g, " "),
      pdfCostRange: it.cost
    });
  }
}

console.log(`Mapping complete:`);
console.log(`Total PDF items: ${catalogue308.length}`);
console.log(`Keep existing: ${keepCount}`);
console.log(`Create new: ${createCount}`);

fs.writeFileSync("scripts/final-mapping.json", JSON.stringify(finalMapping, null, 2));
console.log("Wrote scripts/final-mapping.json");
