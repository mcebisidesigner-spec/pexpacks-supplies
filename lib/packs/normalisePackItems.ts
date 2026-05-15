import type { GradePack, School } from "@/data/schools";
import type { GradePackForCustomisation, PackItem } from "./types";

const quantityPattern = /^(\d+)\s*(?:x|X|×)?\s+(.+)$/;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferCategory(name: string) {
  const value = name.toLowerCase();

  if (/(book|pad|paper|file|sleeve|folder)/.test(value)) {
    return "Books & paper";
  }

  if (/(pen|pencil|crayon|highlighter|marker)/.test(value)) {
    return "Writing tools";
  }

  if (/(ruler|eraser|sharpener|scissor|calculator|set)/.test(value)) {
    return "Tools";
  }

  if (/(glue|paint|colour|color|art)/.test(value)) {
    return "Creative supplies";
  }

  return "Stationery";
}

export function normalisePackItems(
  contents: string[],
  packId: string
): PackItem[] {
  return contents.map((content, index) => {
    const trimmed = content.trim();
    const match = trimmed.match(quantityPattern);
    const requiredQuantity = match ? Number(match[1]) : 1;
    const name = match ? match[2].trim() : trimmed;

    return {
      id: `${packId}-${slugify(name) || index}`,
      name,
      category: inferCategory(name),
      requiredQuantity: Number.isFinite(requiredQuantity)
        ? requiredQuantity
        : 1,
      isRequired: true,
    };
  });
}

export function createSchoolGradePack(
  school: School,
  grade: GradePack
): GradePackForCustomisation {
  return {
    id: grade.id,
    schoolId: school.id,
    schoolSlug: school.slug,
    schoolName: school.name,
    grade: grade.grade,
    gradeSlug: grade.gradeSlug,
    packName: `${grade.grade} Stationery Pack`,
    slug: `${school.slug}/${grade.gradeSlug}`,
    items: normalisePackItems(grade.contents, grade.id),
    fullPackPrice: grade.price,
    deliveryNote: grade.deliveryNote,
    isCustomisable: true,
  };
}
