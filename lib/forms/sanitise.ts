import type { FormSubmission } from "./schema";

/* ── Strip HTML / scripts from user input ── */
function clean(value: unknown) {
  if (typeof value !== "string") return value;
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ── Normalise SA phone to +27 format ── */
export function normalisePhone(value: string) {
  const d = value.replace(/\D/g, "");
  if (d.startsWith("0") && d.length === 10) return `+27${d.slice(1)}`;
  if (d.startsWith("27") && d.length === 11) return `+${d}`;
  return value.trim();
}

/* ── Clean all text fields ── */
export function sanitise(data: FormSubmission) {
  return {
    ...data,
    fullName: clean(data.fullName) as string,
    email: clean(data.email) as string | undefined,
    message: clean(data.message) as string | undefined,
    schoolName: clean(data.schoolName) as string | undefined,
    businessName: clean(data.businessName) as string | undefined,
    phone: normalisePhone(data.phone),
  };
}

/* ── Basic spam detection (honeypot + link spam) ── */
export function isSpam(data: FormSubmission) {
  const hp1 =
    typeof data.companyWebsite === "string" ? data.companyWebsite.trim() : "";
  const hp2 = typeof data.honeypot === "string" ? data.honeypot.trim() : "";
  if (hp1 || hp2) return true;

  const text = [data.message, data.schoolName, data.businessName]
    .filter(Boolean)
    .join(" ");
  if (/<\s*script|javascript:/i.test(text)) return true;
  if ((text.match(/https?:\/\/|www\./gi) ?? []).length > 4) return true;

  return false;
}
