import { NextRequest, NextResponse } from "next/server";
import { searchSchoolRecords } from "@/lib/schools/schoolSearchData";

export const runtime = "nodejs";

function numberParam(value: string | null, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const limit = Math.min(Math.max(numberParam(params.get("limit"), 12), 1), 24);
  const offset = Math.max(numberParam(params.get("offset"), 0), 0);
  const results = searchSchoolRecords(
    {
      query: params.get("q") ?? "",
      grade: params.get("grade") ?? "",
      region: params.get("region") ?? ""
    },
    limit,
    offset
  );

  return NextResponse.json({
    success: true,
    ...results,
    limit,
    offset
  });
}
