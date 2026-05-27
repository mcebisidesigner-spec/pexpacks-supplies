import { createSupabaseServerClient } from "./server";
import type { FormSubmission } from "@/lib/forms/types";

export async function saveFormSubmission(
  data: FormSubmission
): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("[supabase] Missing env vars — skipping form submission insert");
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("form_submissions").insert({
      form_type: data.formType,
      status: "new",
      data: data as unknown as Record<string, unknown>,
      source_url: data.sourceUrl || data.pageUrl || null,
      user_agent: data.userAgent || null,
    });

    if (error) {
      console.error("[supabase] Failed to insert form submission:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[supabase] Unexpected error inserting form submission:", err);
    return { success: false, error: "Unexpected error" };
  }
}
