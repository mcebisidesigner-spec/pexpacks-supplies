import { NextRequest } from "next/server";
import { handlePexpacksFormRequest } from "@/lib/forms/routeHandler";

export async function POST(request: NextRequest) {
  return handlePexpacksFormRequest(request, "newsletter");
}
