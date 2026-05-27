import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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

    const { error: upsertError } = await supabase
      .from("form_submissions")
      .upsert(
        {
          form_type: "checkout-draft",
          status: "draft",
          source_url: device_id,
          data: state,
        },
        {
          onConflict: "form_type, source_url",
          ignoreDuplicates: false,
        }
      );

    if (upsertError) {
      console.error("[checkout-draft] Upsert failed:", upsertError);
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
