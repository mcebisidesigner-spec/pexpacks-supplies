import { slugify } from "@/lib/slugify";
import type { GradePack, School } from "@/data/schools";
import { isPackItemIconKey } from "./itemIcons";
import type { GradePackForCustomisation, PackItem } from "./types";

const quantityPattern = /^(\d+)\s*(?:x|X)\s+(.+)$/;

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

function inferIcon(name: string) {
  const value = name.toLowerCase();

  if (/(book|scrapbook)/.test(value)) {
    return "notebook";
  }

  if (/(pad|paper)/.test(value)) {
    return "pad";
  }

  if (/(file|sleeve|folder)/.test(value)) {
    return "file";
  }

  if (/(pen|marker)/.test(value)) {
    return "pen";
  }

  if (/(pencil|crayon|colour|color)/.test(value)) {
    return "pencil";
  }

  if (/glue/.test(value)) {
    return "glue";
  }

  if (/scissor/.test(value)) {
    return "scissors";
  }

  if (/ruler/.test(value)) {
    return "ruler";
  }

  if (/eraser/.test(value)) {
    return "eraser";
  }

  if (/sharpener/.test(value)) {
    return "sharpener";
  }

  if (/highlighter/.test(value)) {
    return "highlighter";
  }

  if (/calculator/.test(value)) {
    return "calculator";
  }

  return "notebook";
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
      icon: inferIcon(name),
      requiredQuantity: Number.isFinite(requiredQuantity)
        ? requiredQuantity
        : 1,
      isRequired: true,
    };
  });
}

export function createSchoolGradePack(
  school: School,
  grade: GradePack,
  descriptions?: Record<string, string>
): GradePackForCustomisation {
  const items = grade.packItems
    ? grade.packItems.map((item) => ({
        id: `${grade.id}-${slugify(item.name) || 0}`,
        name: item.name,
        category: inferCategory(item.name),
        icon: item.icon && isPackItemIconKey(item.icon) ? item.icon : inferIcon(item.name),
        requiredQuantity: item.quantity,
        specification: item.specification ?? undefined,
        isRequired: true,
      }))
    : normalisePackItems(grade.contents, grade.id);
  const totalRequiredQuantity = items.reduce(
    (total, item) => total + item.requiredQuantity,
    0
  );
  const estimatedUnitPrice =
    grade.price && totalRequiredQuantity ? grade.price / totalRequiredQuantity : 0;

  return {
    id: grade.id,
    schoolId: school.id,
    schoolSlug: school.slug,
    schoolName: school.name,
    grade: grade.grade,
    gradeSlug: grade.gradeSlug,
    packName: `${grade.grade} Stationery Pack`,
    slug: `${school.slug}/${grade.gradeSlug}`,
    items: items.map((item) => {
      const description = descriptions?.[item.name]?.trim();
      return {
        ...item,
        unitPrice: estimatedUnitPrice,
        description: description || undefined,
      };
    }),
    fullPackPrice: grade.price,
    deliveryNote: grade.deliveryNote,
    isCustomisable: true,
  };
}
