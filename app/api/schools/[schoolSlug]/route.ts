import { NextRequest, NextResponse } from "next/server";
import { getCachedSchoolBySlug } from "@/lib/school-utils";
import { rateLimitRequest } from "@/lib/security/requestGuards";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    schoolSlug: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const limitStatus = rateLimitRequest(_request, {
    keyPrefix: "school-detail",
    windowMs: 60 * 1000,
    max: 90,
  });

  if (!limitStatus.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many school detail requests. Please try again shortly.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limitStatus.retryAfter) },
      }
    );
  }

  const { schoolSlug } = await params;
  const school = await getCachedSchoolBySlug(schoolSlug);

  if (!school) {
    return NextResponse.json(
      { success: false, message: "School not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
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
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}
