import { getGradeOrder } from "@/lib/grade-utils";
import type { GradePack } from "@/data/schools";

export function isHighSchool(name: string): boolean {
  if (!name) return false;
  // High schools, secondary schools, hoërskole, colleges, academies without primary in name
  return (
    /\b(high(\s*school)?|ho[eë]rskool|secondary(\s*school)?|academy|college)\b/i.test(name) &&
    !/\b(primary|laerskool|prep|preparatory|pre-primary)\b/i.test(name)
  );
}

export function isPrimarySchool(name: string): boolean {
  if (!name) return false;
  // Primary schools, laerskole, preparatory schools, junior schools
  return (
    /\b(primary(\s*school)?|laerskool|prep|preparatory|pre-primary|junior(\s*school)?)\b/i.test(name) &&
    !/\b(high|ho[eë]rskool|secondary)\b/i.test(name)
  );
}

export function getTailoredGradesForSchool(
  schoolOrName: { name: string; grades?: unknown } | string
): string[] {
  if (typeof schoolOrName === "object" && schoolOrName !== null) {
    if (Array.isArray(schoolOrName.grades) && schoolOrName.grades.length > 0) {
      const list = schoolOrName.grades
        .map((g) => {
          if (typeof g === "string") return g;
          if (g && typeof g === "object" && "grade" in g) return String((g as { grade?: unknown }).grade);
          return "";
        })
        .filter(Boolean);
      if (list.length > 0) return list;
    }
    return getTailoredGradesForSchool(schoolOrName.name);
  }

  const name = schoolOrName;
  if (isHighSchool(name)) {
    return ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  }
  if (isPrimarySchool(name)) {
    return [
      "Grade R",
      "Grade 1",
      "Grade 2",
      "Grade 3",
      "Grade 4",
      "Grade 5",
      "Grade 6",
      "Grade 7",
    ];
  }
  // Academies, Colleges, Combined, All-through, or general schools offer full Grades R-12
  return [
    "Grade R",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
  ];
}

export interface TailoredAdminPack {
  id: string;
  title: string;
  slug: string;
  price: number;
  item_count: number;
  total_quantity: number;
  visible: boolean;
  featured?: boolean;
  updated_at?: string;
  is_configured: boolean;
  grade_label: string;
}

export function matchGrade(gradeA: string, gradeB: string): boolean {
  return getGradeOrder(gradeA) === getGradeOrder(gradeB);
}

export function buildTailoredAdminPacks(
  school: { id: string; name: string; slug?: string | null; grades?: unknown },
  dbPacks: {
    id: string;
    title: string;
    slug?: string | null;
    price: number | null;
    item_count?: number;
    total_quantity?: number;
    visible?: boolean;
    featured?: boolean;
    updated_at?: string;
  }[],
): TailoredAdminPack[] {
  const tailoredGrades = getTailoredGradesForSchool(school);
  const matchedPacks: TailoredAdminPack[] = [];
  const usedDbPackIds = new Set<string>();

  for (const gradeLabel of tailoredGrades) {
    const existing = dbPacks.find(
      (p) =>
        !usedDbPackIds.has(p.id) &&
        (matchGrade(p.title, gradeLabel) ||
          matchGrade(p.slug ?? "", gradeLabel)),
    );

    if (existing) {
      usedDbPackIds.add(existing.id);
      matchedPacks.push({
        id: existing.id,
        title: existing.title,
        slug: existing.slug || `${school.slug || school.id}-${gradeLabel.toLowerCase().replace(/\s+/g, "-")}`,
        price: existing.price ?? 0,
        item_count: existing.item_count ?? 0,
        total_quantity: existing.total_quantity ?? 0,
        visible: Boolean(existing.visible),
        featured: existing.featured,
        updated_at: existing.updated_at,
        is_configured: true,
        grade_label: `${gradeLabel} – Stationery Pack`,
      });
    } else {
      const slugKey = gradeLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      matchedPacks.push({
        id: `unassigned-${school.id}-${slugKey}`,
        title: `${school.name} ${gradeLabel} Pack`,
        slug: `${school.slug || school.id}-${slugKey}`,
        price: 0,
        item_count: 0,
        visible: false,
        is_configured: false,
        grade_label: `${gradeLabel} – Stationery Pack`,
      });
    }
  }

  // Include any extra DB packs that didn't match standard grade ranges
  for (const extra of dbPacks) {
    if (!usedDbPackIds.has(extra.id)) {
      matchedPacks.push({
        id: extra.id,
        title: extra.title,
        slug: extra.slug || extra.id,
        price: extra.price ?? 0,
        item_count: extra.item_count ?? 0,
        visible: Boolean(extra.visible),
        featured: extra.featured,
        updated_at: extra.updated_at,
        is_configured: true,
        grade_label: extra.title,
      });
    }
  }

  return matchedPacks.sort((a, b) => getGradeOrder(a.grade_label) - getGradeOrder(b.grade_label));
}

export function buildTailoredPublicGrades(
  school: { id: string; name: string; slug?: string | null; grades?: unknown },
  existingGrades: GradePack[] = [],
): GradePack[] {
  // If the school has visible configured grade packs in DB, ONLY show the visible grade packs
  if (existingGrades && existingGrades.length > 0) {
    return [...existingGrades].sort(
      (a, b) => getGradeOrder(a.grade) - getGradeOrder(b.grade),
    );
  }

  // If no DB packs exist at all for this school, return the tailored placeholders for the school's grade range
  const tailoredGrades = getTailoredGradesForSchool(school);
  return tailoredGrades.map((gradeLabel, idx) => {
    const slug = gradeLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return {
      id: `std-${school.id}-${slug}-${idx}`,
      grade: gradeLabel,
      gradeSlug: slug,
      price: 0,
      contents: [],
      packItems: [],
      deliveryNote: "Prepared according to official school list.",
      availability: "in-stock" as const,
    };
  });
}
