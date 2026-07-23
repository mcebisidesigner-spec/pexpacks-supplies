'use server';

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { saveFormSubmission } from "@/lib/supabase/forms";

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return redirect("/login?error=Please+provide+both+email+and+password.");
  }

  let isSuccess = false;
  let errorMessage = "";

  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // ignore — called from Server Action
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      errorMessage = error.message || "Invalid credentials";
    } else {
      isSuccess = true;
    }
  } catch (err: any) {
    errorMessage = err?.message || "Invalid login credentials";
  }

  if (isSuccess) {
    redirect("/admin");
  } else {
    redirect(`/login?error=${encodeURIComponent(errorMessage || "Invalid credentials")}`);
  }
}

export async function logout() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore — called from Server Action
          }
        },
      },
    }
  );

  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(email: string) {
  const targetEmail = email.trim();
  if (!targetEmail) {
    return { success: false, error: "Please enter your account email address." };
  }

  // 1. Log password renewal request into Supabase form_submissions table
  await saveFormSubmission({
    formType: "password_reset_request",
    fullName: "Password Reset Requester",
    email: targetEmail,
    notes: `Password renewal request sent for ${targetEmail} to IT Admin (pexpacks@gmail.com)`,
    targetAdmin: "pexpacks@gmail.com",
    requestedAt: new Date().toISOString(),
  } as any);

  // 2. Trigger standard Supabase Auth reset email if configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {
              // ignore
            },
          },
        }
      );
      await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pexpacks.co.za'}/login`,
      });
    } catch (err) {
      console.warn("[auth] Supabase resetPasswordForEmail skipped or error:", err);
    }
  }

  return {
    success: true,
    message: "Your password renewal request has been sent to Administrator. They will respond ASAP.",
  };
}
