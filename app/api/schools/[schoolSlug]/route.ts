import { NextRequest, NextResponse } from "next/server";
import { getSchoolBySlug } from "@/data/schools";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    schoolSlug: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { schoolSlug } = await params;
  const school = await getSchoolBySlug(schoolSlug);

  if (!school) {
    return NextResponse.json(
      { success: false, message: "School not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    school: {
      id: school.id,
      name: school.name,
      slug: school.slug,
      city: school.city,
      province: school.province,
      grades: school.grades.map((grade) => ({
        id: grade.id,
        grade: grade.grade,
        gradeSlug: grade.gradeSlug,
        price: grade.price,
        contents: grade.contents,
        deliveryNote: grade.deliveryNote,
      })),
    },
  });
}
