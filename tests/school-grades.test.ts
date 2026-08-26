import { describe, it, expect } from "vitest";
import {
  isPrimarySchool,
  isHighSchool,
  getTailoredGradesForSchool,
  buildTailoredAdminPacks,
  buildTailoredPublicGrades,
} from "@/lib/schools/school-grade-packs";

describe("School Grade Ranges and Packs Tailoring", () => {
  it("correctly classifies primary schools to Grades R - 7", () => {
    expect(isPrimarySchool("A Re Thabang Primary School")).toBe(true);
    expect(isPrimarySchool("Crescent Primary School")).toBe(true);
    expect(isHighSchool("A Re Thabang Primary School")).toBe(false);

    const grades = getTailoredGradesForSchool("A Re Thabang Primary School");
    expect(grades).toEqual([
      "Grade R",
      "Grade 1",
      "Grade 2",
      "Grade 3",
      "Grade 4",
      "Grade 5",
      "Grade 6",
      "Grade 7",
    ]);
  });

  it("correctly classifies high schools to Grades 8 - 12", () => {
    expect(isHighSchool("Buhle High School")).toBe(true);
    expect(isHighSchool("Daleview Secondary School")).toBe(true);
    expect(isPrimarySchool("Buhle High School")).toBe(false);

    const grades = getTailoredGradesForSchool("Buhle High School");
    expect(grades).toEqual([
      "Grade 8",
      "Grade 9",
      "Grade 10",
      "Grade 11",
      "Grade 12",
    ]);
  });

  it("correctly classifies 3d Christian Academy and other secondary academies as High Schools (Grades 8 - 12)", () => {
    expect(isHighSchool("3d Christian Academy")).toBe(true);
    expect(isPrimarySchool("3d Christian Academy")).toBe(false);

    const grades = getTailoredGradesForSchool("3d Christian Academy");
    expect(grades).toEqual([
      "Grade 8",
      "Grade 9",
      "Grade 10",
      "Grade 11",
      "Grade 12",
    ]);
  });

  it("correctly classifies combined/comprehensive schools to Grades R - 12", () => {
    expect(isHighSchool("Curro Roodeplaat Combined School")).toBe(false);
    expect(isPrimarySchool("Curro Roodeplaat Combined School")).toBe(false);

    const grades = getTailoredGradesForSchool("Curro Roodeplaat Combined School");
    expect(grades).toHaveLength(13);
    expect(grades[0]).toBe("Grade R");
    expect(grades[12]).toBe("Grade 12");
  });

  it("merges tailored grade packs accurately for 3d Christian Academy (Grades 8 - 12)", () => {
    const school = {
      id: "29a6b115-0658-49ea-9438-f5dcdf976462",
      name: "3d Christian Academy",
      slug: "3d-christian-academy",
    };

    const dbPacks = [
      {
        id: "pack-g8-id",
        title: "3d Christian Academy Grade 8 Pack",
        slug: "3d-christian-academy-grade-8",
        price: 350,
        item_count: 8,
        visible: true,
      },
    ];

    const adminPacks = buildTailoredAdminPacks(school, dbPacks);
    expect(adminPacks).toHaveLength(5);

    // Grade 8 configured
    expect(adminPacks[0].is_configured).toBe(true);
    expect(adminPacks[0].price).toBe(350);
    expect(adminPacks[0].grade_label).toBe("Grade 8 – Stationery Pack");

    // Grade 9 unconfigured
    expect(adminPacks[1].is_configured).toBe(false);
    expect(adminPacks[1].price).toBe(0);
    expect(adminPacks[1].grade_label).toBe("Grade 9 – Stationery Pack");

    // Public grades: when DB packs exist, only visible configured packs are shown
    const publicGrades = buildTailoredPublicGrades(school, [
      {
        id: "pack-g8-id",
        grade: "Grade 8",
        gradeSlug: "grade-8",
        price: 350,
        contents: ["8 items"],
        packItems: [],
        deliveryNote: "Prepared according to official school list.",
        availability: "in-stock",
      },
    ]);

    expect(publicGrades).toHaveLength(1);
    expect(publicGrades[0].grade).toBe("Grade 8");
    expect(publicGrades[0].price).toBe(350);

    // When 0 DB packs exist, all tailored placeholders are generated
    const placeholderGrades = buildTailoredPublicGrades(school, []);
    expect(placeholderGrades).toHaveLength(5);
    expect(placeholderGrades[0].grade).toBe("Grade 8");
    expect(placeholderGrades[4].grade).toBe("Grade 12");
  });
});
