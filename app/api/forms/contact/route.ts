import { NextRequest } from "next/server";
import {
  handlePexPacksFormRequest,
  methodNotAllowed,
} from "@/lib/forms/routeHandler";

export const runtime = "nodejs";

export function POST(request: NextRequest) {
  return handlePexPacksFormRequest(request, "contact");
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
