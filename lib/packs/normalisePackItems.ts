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

export function inferIcon(name: string) {
  const value = name.toLowerCase();

  if (/(folder|wallet|sleeve|envelope)/.test(value)) {
    return "folder";
  }

  if (/(file|document)/.test(value)) {
    return "file";
  }

  if (/(pad|examination|exam)/.test(value)) {
    return "pad";
  }

  if (/(book|scrapbook|journal)/.test(value)) {
    return "notebook";
  }

  if (/(marker|felt-tip|fibre)/.test(value)) {
    return "marker";
  }

  if (/(crayon|monami|wax)/.test(value)) {
    return "crayon";
  }

  if (/(paint|watercolour|water color|palette)/.test(value)) {
    return "paint";
  }

  if (/(paintbrush|brush)/.test(value)) {
    return "paintbrush";
  }

  if (/(pen|ballpoint|fineliner)/.test(value)) {
    return "pen";
  }

  if (/(pencil|clutch|koki)/.test(value)) {
    return "pencil";
  }

  if (/glue/.test(value)) {
    return "glue";
  }

  if (/(scissor|cutting)/.test(value)) {
    return "scissors";
  }

  if (/(ruler|scale)/.test(value)) {
    return "ruler";
  }

  if (/(eraser|rubber)/.test(value)) {
    return "eraser";
  }

  if (/(sharpener|geometry|math set)/.test(value)) {
    return "sharpener";
  }

  if (/highlighter/.test(value)) {
    return "highlighter";
  }

  if (/calculator/.test(value)) {
    return "calculator";
  }

  if (/(clip|paperclip)/.test(value)) {
    return "paperclip";
  }

  if (/(pin|pushpin)/.test(value)) {
    return "pin";
  }

  if (/(bag|case|pouch)/.test(value)) {
    return "bag";
  }

  if (/(board|cardboard|construction paper|sheet)/.test(value)) {
    return "layers";
  }

  if (/(tag|label)/.test(value)) {
    return "tag";
  }

  if (/(globe|atlas|map)/.test(value)) {
    return "globe";
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
        icon:
          item.icon &&
          isPackItemIconKey(item.icon) &&
          item.icon !== "box" &&
          item.icon !== "package"
            ? item.icon
            : inferIcon(item.name),
        requiredQuantity: item.quantity,
        unitPrice: item.unitPrice ?? undefined,
        specification: item.specification ?? undefined,
        description: item.description ?? undefined,
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
      const description =
        descriptions?.[item.name]?.trim() || item.description?.trim();
      return {
        ...item,
        unitPrice: item.unitPrice ?? estimatedUnitPrice,
        description: description || undefined,
      };
    }),
    fullPackPrice: grade.price,
    deliveryNote: grade.deliveryNote,
    isCustomisable: true,
  };
}
