import { z } from "zod";
import {
  isValidEmailAddress,
  isValidSouthAfricanPhone,
} from "@/lib/forms/contact";

export const formTypes = [
  "school-pack-enquiry",
  "full-pack-enquiry",
  "custom-pack-enquiry",
  "office-pack-enquiry",
  "bulk-order",
  "school-partnership",
  "contact",
  "track-order-interest",
] as const;

export const preferredContactMethods = ["phone", "whatsapp", "email"] as const;

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

const baseFormSubmissionSchema = z.object({
  formType: z.enum(formTypes, "Please choose a valid enquiry type."),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(120, "Full name is too long."),
  phone: phoneSchema,
  contactDetail: contactDetailSchema,
  consent: consentSchema,
  email: emailSchema,
  schoolName: optionalText(160),
  schoolId: optionalText(120),
  grade: optionalText(40),
  learnerName: optionalText(120),
  businessName: optionalText(160),
  orderQuantity: quantitySchema,
  preferredContactMethod: z.enum(preferredContactMethods).optional(),
  message: optionalText(1500),
  packType: optionalText(120),
  selectedItems: optionalText(3000),
  removedItems: optionalText(2000),
  estimatedTotal: z.number().nonnegative().optional(),
  orderReference: optionalText(80),
  orderDraftId: optionalText(120),
  suburb: optionalText(120),
  city: optionalText(120),
  province: optionalText(120),
  companyWebsite: optionalText(200),
  honeypot: optionalText(200),
  pageUrl: optionalText(500),
  userAgent: optionalText(500),
  submittedAt: optionalText(80),
});

export const formSubmissionSchema = baseFormSubmissionSchema.superRefine(
  (data, ctx) => {
    const issue = (path: string, message: string) => {
      ctx.addIssue({ code: "custom", path: [path], message });
    };
    const isAddSchoolRequest = data.packType === "add-school";
    const hasReachableContact = Boolean(
      data.phone || data.email || data.contactDetail
    );

    if (!hasReachableContact) {
      issue(
        isAddSchoolRequest || data.formType === "track-order-interest"
          ? "contactDetail"
          : "phone",
        "Please provide a phone number or email address."
      );
    }

    if (!data.message) {
      issue("message", "Please tell us what you need.");
    }

    if (isAddSchoolRequest) {
      if (!data.schoolName) {
        issue("schoolName", "School name is required.");
      }
      if (!data.city) {
        issue("city", "City or area is required.");
      }
      if (!data.grade) {
        issue("grade", "Grade is required.");
      }
    }

    if (
      data.formType === "school-partnership" &&
      !data.businessName &&
      !data.schoolName
    ) {
      issue("businessName", "Organisation or school name is required.");
    }

    if (
      (data.formType === "office-pack-enquiry" ||
        data.formType === "bulk-order") &&
      !data.businessName
    ) {
      issue("businessName", "Business name is required.");
    }

    if (
      data.formType === "school-pack-enquiry" &&
      (!data.schoolName || !data.grade)
    ) {
      issue("schoolName", "School and grade are required.");
    }

    if (
      (data.formType === "full-pack-enquiry" ||
        data.formType === "custom-pack-enquiry") &&
      (!data.schoolName || !data.grade)
    ) {
      issue("schoolName", "School and grade are required.");
    }
  }
);

export type ValidatedFormSubmission = z.infer<typeof formSubmissionSchema>;
export type FormSubmission = ValidatedFormSubmission;
export type FormType = ValidatedFormSubmission["formType"];

export function flattenValidationErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
}

export const flattenErrors = flattenValidationErrors;

export function getFormTypeLabel(formType: FormType) {
  return formType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const formTypeLabel = getFormTypeLabel;
