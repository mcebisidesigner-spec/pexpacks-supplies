import { NextRequest, NextResponse } from "next/server";
import { schools } from "@/data/schools";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    schoolSlug: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { schoolSlug } = await params;
  const school = schools.find((item) => item.slug === schoolSlug);

  if (!school) {
    return NextResponse.json({ success: false, message: "School not found." }, { status: 404 });
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
        deliveryNote: grade.deliveryNote
      }))
    }
  });
}
