import { NextRequest } from "next/server";
import {
  handlePexpacksFormRequest,
  methodNotAllowed,
} from "@/lib/forms/routeHandler";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handlePexpacksFormRequest(request, "order");
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
