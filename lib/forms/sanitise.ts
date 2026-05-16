import type { FormSubmission } from "./schema";

function clean(value: unknown) {
  if (typeof value !== "string") return value;
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalisePhone(value: string) {
  const d = value.replace(/\D/g, "");
  if (d.startsWith("0") && d.length === 10) return `+27${d.slice(1)}`;
  if (d.startsWith("27") && d.length === 11) return `+${d}`;
  return value.trim();
}

export function sanitise(data: FormSubmission) {
  return {
    ...data,
    fullName: clean(data.fullName) as string,
    email: clean(data.email) as string | undefined,
    contactDetail: clean(data.contactDetail) as string | undefined,
    message: clean(data.message) as string | undefined,
    schoolName: clean(data.schoolName) as string | undefined,
    schoolId: clean(data.schoolId) as string | undefined,
    grade: clean(data.grade) as string | undefined,
    learnerName: clean(data.learnerName) as string | undefined,
    businessName: clean(data.businessName) as string | undefined,
    suburb: clean(data.suburb) as string | undefined,
    city: clean(data.city) as string | undefined,
    province: clean(data.province) as string | undefined,
    packType: clean(data.packType) as string | undefined,
    selectedItems: clean(data.selectedItems) as string | undefined,
    removedItems: clean(data.removedItems) as string | undefined,
    orderReference: clean(data.orderReference) as string | undefined,
    orderDraftId: clean(data.orderDraftId) as string | undefined,
    pageUrl: clean(data.pageUrl) as string | undefined,
    userAgent: clean(data.userAgent) as string | undefined,
    phone: data.phone ? normalisePhone(data.phone) : undefined,
  };
}

export function isSpam(data: Record<string, unknown>) {
  const hp1 =
    typeof data.companyWebsite === "string" ? data.companyWebsite.trim() : "";
  const hp2 = typeof data.honeypot === "string" ? data.honeypot.trim() : "";
  if (hp1 || hp2) return true;

  const text = [
    data.message,
    data.schoolName,
    data.businessName,
    data.city,
    data.province,
    data.contactDetail,
  ]
    .filter(Boolean)
    .join(" ");

  if (/<\s*script|javascript:/i.test(text)) return true;
  if ((text.match(/https?:\/\/|www\./gi) ?? []).length > 4) return true;

  return false;
}
