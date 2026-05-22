import { PEXCOVER_PRICE } from "@/lib/constants";
import { customPackAddOns } from "@/data/packAddOns";
import { phasePacks } from "@/data/phasePacks";
import { getFullSchoolRecords } from "@/data/schools";
import { normalisePackItems } from "@/lib/packs/normalisePackItems";
import type { FormSubmission } from "@/lib/forms/types";

type ParsedLineItem = {
  name: string;
  quantity: number;
};

const itemPattern = /^(\d+(?:\.\d+)?)\s*x\s+(.+)$/i;

function normaliseName(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function parseLineItems(value?: string): ParsedLineItem[] {
  if (!value) {
    return [];
  }

  return value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(itemPattern);

      if (!match) {
        return { name: part, quantity: 1 };
      }

      const quantity = Number(match[1]);

      return {
        name: match[2].trim(),
        quantity: Number.isFinite(quantity) ? Math.max(0, quantity) : 1,
      };
    });
}

function quantityByName(items: ParsedLineItem[]) {
  return items.reduce<Map<string, number>>((map, item) => {
    const key = normaliseName(item.name);
    map.set(key, (map.get(key) ?? 0) + item.quantity);
    return map;
  }, new Map());
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

async function calculateSchoolPackTotal(data: FormSubmission) {
  const schools = await getFullSchoolRecords();
  const school = schools.find(
    (record) =>
      record.id === data.schoolId ||
      normaliseName(record.name) === normaliseName(data.schoolName ?? "")
  );
  const grade = school?.grades.find(
    (record) => normaliseName(record.grade) === normaliseName(data.grade ?? "")
  );

  if (!grade) {
    return undefined;
  }

  if (data.formType === "full-pack-enquiry") {
    return roundCurrency(grade.price);
  }

  if (data.formType !== "custom-pack-enquiry") {
    return undefined;
  }

  const selected = quantityByName(parseLineItems(data.selectedItems));
  const items = normalisePackItems(grade.contents, grade.id);
  const totalQuantity = items.reduce(
    (total, item) => total + item.requiredQuantity,
    0
  );
  const estimatedUnitPrice = totalQuantity ? grade.price / totalQuantity : 0;

  return roundCurrency(
    items.reduce((total, item) => {
      const quantity = selected.get(normaliseName(item.name)) ?? 0;
      return total + quantity * estimatedUnitPrice;
    }, 0)
  );
}

function calculateStandardPackTotal(data: FormSubmission) {
  const pack = phasePacks
    .flatMap((phase) => phase.gradePacks)
    .find((gradePack) => {
      const packType = normaliseName(data.packType ?? "");
      const grade = normaliseName(data.grade ?? "");

      return (
        packType.includes(normaliseName(gradePack.title)) ||
        normaliseName(gradePack.grade) === grade
      );
    });

  if (!pack) {
    return undefined;
  }

  const selected = quantityByName(parseLineItems(data.selectedItems));
  const standardTotal = pack.items.reduce((total, item) => {
    const quantity = selected.get(normaliseName(item.name));
    const effectiveQuantity = quantity ?? item.quantity;
    return total + (effectiveQuantity - item.quantity) * (item.unitPrice ?? 0);
  }, pack.priceFrom);
  const addOnsTotal = customPackAddOns.reduce((total, item) => {
    const quantity =
      selected.get(normaliseName(`Add-on: ${item.name}`)) ??
      selected.get(normaliseName(item.name)) ??
      0;
    return total + quantity * (item.unitPrice ?? 0);
  }, 0);

  return roundCurrency(Math.max(0, standardTotal + addOnsTotal));
}

export async function normaliseSubmittedTotal(data: FormSubmission) {
  const calculated =
    data.formType === "school-pack-enquiry" &&
    data.schoolName === "Standard school phase pack"
      ? calculateStandardPackTotal(data)
      : await calculateSchoolPackTotal(data);

  if (typeof calculated !== "number") {
    return {
      estimatedTotal: data.estimatedTotal,
      source: "client",
      changed: false,
    };
  }

  const addOnsTotal = /pexcover add-on requested/i.test(data.message ?? "")
    ? PEXCOVER_PRICE
    : 0;
  const estimatedTotal = roundCurrency(calculated + addOnsTotal);

  return {
    estimatedTotal,
    source: "server",
    changed:
      typeof data.estimatedTotal === "number"
        ? Math.abs(data.estimatedTotal - estimatedTotal) > 0.01
        : false,
  };
}
