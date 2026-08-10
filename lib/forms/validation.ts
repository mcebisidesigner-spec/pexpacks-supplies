import { z } from "zod";
import {
  isValidEmailAddress,
  isValidSouthAfricanPhone,
} from "@/lib/forms/contact";
import {
  type FormEndpointKind,
  type FormSubmission,
  formTypes,
} from "@/lib/forms/types";

const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(max).optional()
  );

const consentSchema = z.preprocess(
  (value) =>
    value === true || value === "true" || value === "on" || value === "1",
  z.boolean().refine((value) => value === true, "Consent is required.")
);

const emailSchema = optionalText(160).refine(
  (value) => !value || isValidEmailAddress(value),
  "Please enter a valid email address."
);

const phoneSchema = optionalText(40).refine(
  (value) => !value || isValidSouthAfricanPhone(value),
  "Please enter a valid South African phone number."
);

const contactDetailSchema = optionalText(160).refine(
  (value) =>
    !value || isValidEmailAddress(value) || isValidSouthAfricanPhone(value),
  "Please enter a valid phone number or email address."
);

const quantitySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value;
}, z.number().positive("Order quantity must be a positive number.").optional());

const formSubmissionSchema = z.object({
  formType: z.enum(formTypes, "Please choose a valid enquiry type."),
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(120, "Name is too long."),
  consent: consentSchema,
  phone: phoneSchema,
  email: emailSchema,
  contactDetail: contactDetailSchema,
  preferredContactMethod: optionalText(40),
  enquiryType: optionalText(160),
  customerType: optionalText(120),
  parentName: optionalText(120),
  customerName: optionalText(120),
  contactName: optionalText(120),
  contactPerson: optionalText(120),
  role: optionalText(120),
  learnerName: optionalText(120),
  schoolId: optionalText(120),
  schoolName: optionalText(160),
  schoolOrBusinessName: optionalText(160),
  grade: optionalText(160),
  businessName: optionalText(160),
  businessDescription: optionalText(1200),
  brandingPreferences: optionalText(1200),
  existingBranding: optionalText(500),
  targetAudience: optionalText(500),
  website: optionalText(300),
  deadline: optionalText(120),
  brandAssetSummary: optionalText(1200),
  suburb: optionalText(120),
  city: optionalText(120),
  province: optionalText(120),
  learnerCount: optionalText(40),
  orderQuantity: quantitySchema,
  quantity: optionalText(40),
  pack: optionalText(160),
  packType: optionalText(160),
  packId: optionalText(160),
  packName: optionalText(160),
  quoteType: optionalText(160),
  deliveryMethod: optionalText(160),
  address: optionalText(500),
  selectedItems: optionalText(3000),
  removedItems: optionalText(2000),
  estimatedTotal: z.number().nonnegative().optional(),
  orderReference: optionalText(80),
  orderDraftId: optionalText(120),
  message: optionalText(3000),
  notes: optionalText(3000),
  sourceUrl: optionalText(500),
  pageUrl: optionalText(500),
  userAgent: optionalText(500),
  submittedAt: optionalText(80),
  botcheck: optionalText(200),
  companyWebsite: optionalText(200),
  company_website: optionalText(200),
  honeypot: optionalText(200),
});

function clean(value: unknown) {
  if (typeof value !== "string") return value;
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanRecord(raw: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, clean(value)])
  ) as Record<string, unknown>;
}

function getString(raw: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function getNumber(raw: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function normalisePhone(value?: string) {
  if (!value) return undefined;

  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    return `+27${digits.slice(1)}`;
  }
  if (digits.startsWith("27") && digits.length === 11) {
    return `+${digits}`;
  }

  return value.trim();
}

function inferFormType(
  endpoint: FormEndpointKind,
  rawType?: string
): FormSubmission["formType"] {
  if (rawType && formTypes.includes(rawType as FormSubmission["formType"])) {
    return rawType as FormSubmission["formType"];
  }

  if (endpoint === "order") return "school-pack-enquiry";
  if (endpoint === "school-partnership") return "school-partnership";
  if (endpoint === "quote") return "quote";

  return "contact";
}

function normaliseSubmission(
  rawInput: Record<string, unknown>,
  endpoint: FormEndpointKind
) {
  const raw = cleanRecord(rawInput);
  const contactDetail = getString(raw, "contactDetail", "contact");
  const email =
    getString(raw, "email") ||
    (contactDetail && isValidEmailAddress(contactDetail)
      ? contactDetail
      : undefined);
  const phone =
    getString(raw, "phone") ||
    (contactDetail && !isValidEmailAddress(contactDetail)
      ? contactDetail
      : undefined);
  const fullName =
    getString(
      raw,
      "fullName",
      "name",
      "parentName",
      "customerName",
      "contactName",
      "contactPerson"
    ) || "";
  const message = getString(raw, "message", "notes") || "";
  const schoolName = getString(raw, "schoolName", "school");
  const businessName = getString(raw, "businessName", "schoolOrBusinessName");
  const packType = getString(raw, "packType", "pack", "quoteType");

  return {
    ...raw,
    formType: inferFormType(endpoint, getString(raw, "formType")),
    fullName,
    consent: raw.consent,
    phone: normalisePhone(phone),
    email,
    contactDetail,
    preferredContactMethod: getString(raw, "preferredContactMethod"),
    enquiryType: getString(raw, "enquiryType"),
    customerType: getString(raw, "customerType"),
    parentName: getString(raw, "parentName"),
    customerName: getString(raw, "customerName"),
    contactName: getString(raw, "contactName"),
    contactPerson: getString(raw, "contactPerson"),
    role: getString(raw, "role"),
    learnerName: getString(raw, "learnerName"),
    schoolId: getString(raw, "schoolId"),
    schoolName,
    schoolOrBusinessName: getString(raw, "schoolOrBusinessName"),
    grade: getString(raw, "grade"),
    businessName,
    businessDescription: getString(raw, "businessDescription"),
    brandingPreferences: getString(raw, "brandingPreferences"),
    existingBranding: getString(raw, "existingBranding"),
    targetAudience: getString(raw, "targetAudience"),
    website: getString(raw, "website"),
    deadline: getString(raw, "deadline"),
    brandAssetSummary: getString(raw, "brandAssetSummary"),
    suburb: getString(raw, "suburb"),
    city: getString(raw, "city"),
    province: getString(raw, "province"),
    learnerCount: getString(raw, "learnerCount"),
    orderQuantity: getNumber(raw, "orderQuantity"),
    quantity: getString(raw, "quantity"),
    pack: getString(raw, "pack"),
    packType,
    packId: getString(raw, "packId"),
    packName: getString(raw, "packName"),
    quoteType: getString(raw, "quoteType"),
    deliveryMethod: getString(raw, "deliveryMethod", "delivery"),
    address: getString(raw, "address"),
    selectedItems: getString(raw, "selectedItems"),
    removedItems: getString(raw, "removedItems"),
    estimatedTotal: getNumber(raw, "estimatedTotal"),
    orderReference: getString(raw, "orderReference"),
    orderDraftId: getString(raw, "orderDraftId"),
    message,
    notes: getString(raw, "notes"),
    sourceUrl: getString(raw, "sourceUrl", "pageUrl"),
    pageUrl: getString(raw, "pageUrl", "sourceUrl"),
    userAgent: getString(raw, "userAgent"),
    submittedAt: getString(raw, "submittedAt") || new Date().toISOString(),
    botcheck: getString(raw, "botcheck"),
    companyWebsite: getString(raw, "companyWebsite"),
    company_website: getString(raw, "company_website"),
    honeypot: getString(raw, "honeypot"),
  };
}

function addIssue(
  errors: Record<string, string>,
  key: string,
  message: string
) {
  if (!errors[key]) {
    errors[key] = message;
  }
}

function hasContact(data: FormSubmission) {
  return Boolean(data.phone || data.email || data.contactDetail);
}

function validateEndpointRules(
  data: FormSubmission,
  endpoint: FormEndpointKind
) {
  const errors: Record<string, string> = {};
  const add = (key: string, message: string) => addIssue(errors, key, message);

  if (!hasContact(data)) {
    add("contact", "Please provide a phone number or email address.");
  }

  if (!data.message) {
    add("message", "Please tell us what you need.");
  }

  if (endpoint === "order") {
    if (!data.phone) add("phone", "Phone number is required.");
    if (!data.email) add("email", "Email address is required.");
    if (!data.schoolName) add("schoolName", "School name is required.");
    if (!data.grade) add("grade", "Grade is required.");
    if (!data.packType && !data.packName) add("packType", "Pack is required.");
  }

  if (endpoint === "school-partnership") {
    if (!data.schoolName && !data.businessName) {
      add("schoolName", "School or organisation name is required.");
    }
    if (!data.fullName) add("fullName", "Contact person is required.");
    if (!data.phone) add("phone", "Phone number is required.");
  }

  if (endpoint === "quote") {
    if (!data.fullName) add("fullName", "Name is required.");
    if (!data.phone) add("phone", "Phone number is required.");
    if (!data.packType && !data.quoteType) {
      add("quoteType", "Quote type is required.");
    }
  }

  if (data.packType === "add-school") {
    if (!data.schoolName) add("schoolName", "School name is required.");
    if (!data.city) add("city", "City or area is required.");
    if (!data.grade) add("grade", "Grade is required.");
  }

  if (data.formType === "readiness-quiz" && !data.email) {
    add("email", "Email address is required.");
  }

  return errors;
}

export function isHoneypotSubmission(raw: Record<string, unknown>) {
  return Boolean(
    getString(raw, "botcheck", "companyWebsite", "company_website", "honeypot")
  );
}

export type SubmittedFormAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
  size: number;
};

type ReadFormBodyResult = {
  raw: Record<string, unknown>;
  attachments: SubmittedFormAttachment[];
  fileError?: string;
};

const MAX_ATTACHMENT_COUNT = 5;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_SIZE = 25 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export async function readFormBody(
  request: Request
): Promise<ReadFormBodyResult> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return {
      raw: (await request.json()) as Record<string, unknown>,
      attachments: [],
    };
  }

  const formData = await request.formData();
  const raw: Record<string, unknown> = {};
  const attachments: SubmittedFormAttachment[] = [];
  const fileSummaries: string[] = [];
  let totalSize = 0;
  let fileError: string | undefined;

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      raw[key] = value;
      continue;
    }

    if (!value.size) {
      continue;
    }

    if (attachments.length >= MAX_ATTACHMENT_COUNT) {
      fileError = `Please upload no more than ${MAX_ATTACHMENT_COUNT} files.`;
      continue;
    }

    if (value.size > MAX_ATTACHMENT_SIZE) {
      fileError = `Each upload must be ${formatFileSize(MAX_ATTACHMENT_SIZE)} or smaller.`;
      continue;
    }

    if (totalSize + value.size > MAX_TOTAL_ATTACHMENT_SIZE) {
      fileError = `Total uploads must be ${formatFileSize(MAX_TOTAL_ATTACHMENT_SIZE)} or smaller.`;
      continue;
    }

    const filename = value.name || `${key}-upload`;
    totalSize += value.size;
    fileSummaries.push(
      `${filename} (${formatFileSize(value.size)}${value.type ? `, ${value.type}` : ""})`
    );
    attachments.push({
      filename,
      content: Buffer.from(await value.arrayBuffer()),
      contentType: value.type || undefined,
      size: value.size,
    });
  }

  if (fileSummaries.length) {
    raw.brandAssetSummary = fileSummaries.join("; ");
  }

  return { raw, attachments, fileError };
}

export function validateFormSubmission(
  raw: Record<string, unknown>,
  endpoint: FormEndpointKind
) {
  const normalised = normaliseSubmission(raw, endpoint);
  const parsed = formSubmissionSchema.safeParse(normalised);
  const errors: Record<string, string> = {};

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() || "form";
      addIssue(errors, key, issue.message);
    }
  }

  const data = (parsed.success ? parsed.data : normalised) as FormSubmission;
  const endpointErrors = validateEndpointRules(data, endpoint);

  for (const [key, value] of Object.entries(endpointErrors)) {
    addIssue(errors, key, value);
  }

  if (Object.keys(errors).length) {
    return { success: false, errors } as const;
  }

  return { success: true, data: parsed.data as FormSubmission } as const;
}
