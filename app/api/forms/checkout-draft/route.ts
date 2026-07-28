import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isSameOriginRequest,
  rateLimitRequest,
} from "@/lib/security/requestGuards";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Invalid request origin." },
      { status: 403 }
    );
  }

  const limit = rateLimitRequest(request, {
    keyPrefix: "draft-write",
    windowMs: 10 * 60 * 1000,
    max: 5,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const { device_id, state } = body;

    if (!device_id || !state) {
      return NextResponse.json(
        { success: false, message: "Missing device_id or state." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Check if a draft already exists for this device_id
    const { data: existing, error: selectError } = await supabase
      .from("form_submissions")
      .select("id")
      .eq("form_type", "checkout-draft")
      .eq("source_url", device_id)
      .maybeSingle();

    if (selectError) {
      console.error("[checkout-draft] Pre-upsert select failed:", selectError);
      return NextResponse.json(
        { success: false, message: "Failed to query existing draft." },
        { status: 500 }
      );
    }

    let dbError;

    if (existing) {
      // Update existing draft
      const { error: updateError } = await supabase
        .from("form_submissions")
        .update({
          data: state,
          status: "draft",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      dbError = updateError;
    } else {
      // Insert new draft
      const { error: insertError } = await supabase
        .from("form_submissions")
        .insert({
          form_type: "checkout-draft",
          status: "draft",
          source_url: device_id,
          data: state,
        });
      dbError = insertError;
    }

    if (dbError) {
      console.error("[checkout-draft] Save failed:", dbError);
      return NextResponse.json(
        { success: false, message: "Failed to save draft." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Invalid request origin." },
      { status: 403 }
    );
  }

  const limit = rateLimitRequest(request, {
    keyPrefix: "draft-read",
    windowMs: 10 * 60 * 1000,
    max: 10,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("device_id");

  if (!deviceId) {
    return NextResponse.json(
      { success: false, message: "Missing device_id." },
      { status: 400 }
    );
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("form_submissions")
      .select("data")
      .eq("form_type", "checkout-draft")
      .eq("source_url", deviceId)
      .maybeSingle();

    if (error) {
      console.error("[checkout-draft] Select failed:", error);
      return NextResponse.json(
        { success: false, message: "Failed to load draft." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, state: data?.data ?? null });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to load draft." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Invalid request origin." },
      { status: 403 }
    );
  }

  const limit = rateLimitRequest(request, {
    keyPrefix: "draft-delete",
    windowMs: 10 * 60 * 1000,
    max: 3,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("device_id");

  if (!deviceId) {
    return NextResponse.json(
      { success: false, message: "Missing device_id." },
      { status: 400 }
    );
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("form_submissions")
      .delete()
      .eq("form_type", "checkout-draft")
      .eq("source_url", deviceId);

    if (error) {
      console.error("[checkout-draft] Delete failed:", error);
      return NextResponse.json(
        { success: false, message: "Failed to delete draft." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete draft." },
      { status: 500 }
    );
  }
}
