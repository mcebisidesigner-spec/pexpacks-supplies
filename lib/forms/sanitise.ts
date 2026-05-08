import type { ValidatedFormSubmission } from "./schema";

export type SanitisedFormSubmission = ValidatedFormSubmission & {
  phone: string;
  submittedAt: string;
  status: "new";
  source: "website";
};

const textFields: Array<keyof ValidatedFormSubmission> = [
  "fullName",
  "email",
  "schoolName",
  "grade",
  "learnerName",
  "businessName",
  "preferredContactMethod",
  "message",
  "packType",
  "suburb",
  "city",
  "province",
  "pageUrl",
  "userAgent"
];

export function normaliseSouthAfricanPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("0027") && digits.length === 13) {
    return `+27${digits.slice(4)}`;
  }

  if (digits.startsWith("27") && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `+27${digits.slice(1)}`;
  }

  return value.trim();
}

function cleanText(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitiseSubmission(data: ValidatedFormSubmission, submittedAt: string): SanitisedFormSubmission {
  const cleaned: Record<string, unknown> = { ...data };

  for (const key of textFields) {
    cleaned[key] = cleanText(data[key]);
  }

  cleaned.phone = normaliseSouthAfricanPhone(data.phone);
  cleaned.submittedAt = submittedAt;
  cleaned.status = "new";
  cleaned.source = "website";

  return cleaned as SanitisedFormSubmission;
}

export function hasSuspiciousContent(data: ValidatedFormSubmission) {
  const searchable = [data.message, data.pageUrl, data.userAgent, data.schoolName, data.businessName]
    .filter(Boolean)
    .join(" ");

  const urlMatches = searchable.match(/https?:\/\/|www\./gi) ?? [];
  const hasScript = /<\s*script|javascript:/i.test(searchable);
  const hasRepeatedCharacters = /(.)\1{39,}/.test(searchable);

  return hasScript || hasRepeatedCharacters || urlMatches.length > 4;
}
