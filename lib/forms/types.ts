export const formTypes = [
  "school-pack-enquiry",
  "full-pack-enquiry",
  "custom-pack-enquiry",
  "office-pack-enquiry",
  "brand-package-enquiry",
  "bulk-order",
  "school-partnership",
  "readiness-quiz",
  "contact",
  "track-order-interest",
  "quote",
] as const;

export const formEndpointKinds = [
  "contact",
  "order",
  "office-pack",
  "school-partnership",
  "quote",
] as const;

export type FormType = (typeof formTypes)[number];
export type FormEndpointKind = (typeof formEndpointKinds)[number];

export type FormSubmission = {
  formType: FormType;
  fullName: string;
  consent: boolean;
  phone?: string;
  email?: string;
  contactDetail?: string;
  preferredContactMethod?: string;
  enquiryType?: string;
  customerType?: string;
  parentName?: string;
  customerName?: string;
  contactName?: string;
  contactPerson?: string;
  role?: string;
  learnerName?: string;
  schoolId?: string;
  schoolName?: string;
  schoolOrBusinessName?: string;
  grade?: string;
  businessName?: string;
  businessDescription?: string;
  brandingPreferences?: string;
  existingBranding?: string;
  targetAudience?: string;
  website?: string;
  deadline?: string;
  brandAssetSummary?: string;
  suburb?: string;
  city?: string;
  province?: string;
  learnerCount?: string;
  orderQuantity?: number;
  quantity?: string;
  pack?: string;
  packType?: string;
  packId?: string;
  packName?: string;
  quoteType?: string;
  deliveryMethod?: string;
  address?: string;
  selectedItems?: string;
  removedItems?: string;
  estimatedTotal?: number;
  orderReference?: string;
  orderDraftId?: string;
  message?: string;
  notes?: string;
  sourceUrl?: string;
  pageUrl?: string;
  userAgent?: string;
  submittedAt?: string;
  botcheck?: string;
  companyWebsite?: string;
  company_website?: string;
  honeypot?: string;
};

export const FORM_SUCCESS_MESSAGE =
  "Thank you. Your message has been sent successfully.";

export const FORM_VALIDATION_MESSAGE = "Please check the form and try again.";

export const FORM_ERROR_MESSAGE =
  "We could not send your message right now. Please contact Pexpacks directly.";

export function formTypeLabel(formType: FormType) {
  return formType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function endpointForFormType(formType: FormType): FormEndpointKind {
  if (
    formType === "school-pack-enquiry" ||
    formType === "full-pack-enquiry" ||
    formType === "custom-pack-enquiry" ||
    formType === "track-order-interest"
  ) {
    return "order";
  }

  if (formType === "office-pack-enquiry" || formType === "brand-package-enquiry") {
    return "office-pack";
  }

  if (formType === "school-partnership") {
    return "school-partnership";
  }

  if (formType === "bulk-order" || formType === "quote") {
    return "quote";
  }

  return "contact";
}

export function endpointPathForFormType(formType: FormType) {
  return `/api/forms/${endpointForFormType(formType)}`;
}
