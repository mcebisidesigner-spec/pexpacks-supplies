import { z } from "zod";
import { normaliseSouthAfricanPhone } from "./sanitise";

export const formTypes = [
  "school-pack-enquiry",
  "office-pack-enquiry",
  "bulk-order",
  "school-partnership",
  "contact",
  "track-order-interest"
] as const;

export const preferredContactMethods = ["phone", "whatsapp", "email"] as const;

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional()
  );

function isValidSouthAfricanPhone(value: string) {
  const normalised = normaliseSouthAfricanPhone(value);
  return /^\+27\d{9}$/.test(normalised);
}

const consentSchema = z.preprocess(
  (value) => value === true || value === "true" || value === "on" || value === "1",
  z.boolean().refine((value) => value === true, "Consent is required.")
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

export const formSubmissionSchema = z.object({
  formType: z.enum(formTypes, "Please choose a valid enquiry type."),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters.").max(120, "Full name is too long."),
  phone: z.string().trim().refine(isValidSouthAfricanPhone, "Please enter a valid South African phone number."),
  consent: consentSchema,
  email: optionalText(160).refine((value) => !value || z.email().safeParse(value).success, "Please enter a valid email address."),
  schoolName: optionalText(160),
  grade: optionalText(40),
  learnerName: optionalText(120),
  businessName: optionalText(160),
  orderQuantity: quantitySchema,
  preferredContactMethod: z.enum(preferredContactMethods).optional(),
  message: optionalText(1500),
  packType: optionalText(120),
  suburb: optionalText(120),
  city: optionalText(120),
  province: optionalText(120),
  companyWebsite: optionalText(200),
  honeypot: optionalText(200),
  captchaToken: optionalText(2000),
  pageUrl: optionalText(500),
  userAgent: optionalText(500),
  submittedAt: optionalText(80)
});

export type ValidatedFormSubmission = z.infer<typeof formSubmissionSchema>;
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

export function getFormTypeLabel(formType: FormType) {
  return formType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
