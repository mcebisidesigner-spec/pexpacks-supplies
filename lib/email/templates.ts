import { formTypeLabel, type FormEndpointKind } from "@/lib/forms/types";
import type { FormSubmission } from "@/lib/forms/types";

type TemplateResult = {
  subject: string;
  text: string;
  html: string;
};

type Field = {
  label: string;
  value?: string | number | boolean;
};

const subjectByEndpoint: Record<FormEndpointKind, string> = {
  contact: "New PexPacks Contact Enquiry",
  order: "New PexPacks Order Request",
  "office-pack": "New PexPacks Office Pack Enquiry",
  "school-partnership": "New PexPacks School Partnership Request",
  quote: "New PexPacks Quote Request",
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function present(value: Field["value"]) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function renderText(fields: Field[]) {
  return fields
    .filter((field) => present(field.value))
    .map((field) => `${field.label}: ${field.value}`)
    .join("\n");
}

function renderHtmlRows(fields: Field[]) {
  return fields
    .filter((field) => present(field.value))
    .map(
      (field) => `
        <tr>
          <th align="left" style="padding:8px 12px;border-bottom:1px solid #e6edf0;color:#24434a;width:210px;">${escapeHtml(
            field.label
          )}</th>
          <td style="padding:8px 12px;border-bottom:1px solid #e6edf0;color:#17323a;">${escapeHtml(
            field.value
          )}</td>
        </tr>`
    )
    .join("");
}

function baseFields(data: FormSubmission): Field[] {
  return [
    { label: "Form type", value: formTypeLabel(data.formType) },
    { label: "Submitted at", value: data.submittedAt },
    { label: "Source URL", value: data.sourceUrl || data.pageUrl },
    { label: "Full name", value: data.fullName },
    { label: "Phone", value: data.phone || data.contactDetail },
    { label: "Email", value: data.email },
    { label: "Preferred contact", value: data.preferredContactMethod },
  ];
}

function contactFields(data: FormSubmission): Field[] {
  return [
    ...baseFields(data),
    { label: "Enquiry type", value: data.enquiryType || data.packType },
    { label: "School name", value: data.schoolName },
    { label: "Grade", value: data.grade },
    { label: "Business name", value: data.businessName },
    { label: "City", value: data.city },
    { label: "Province", value: data.province },
    { label: "Message", value: data.message },
  ];
}

function orderFields(data: FormSubmission): Field[] {
  return [
    ...baseFields(data),
    { label: "Order reference", value: data.orderReference },
    { label: "Customer type", value: data.customerType },
    { label: "Learner name", value: data.learnerName },
    { label: "School ID", value: data.schoolId },
    { label: "School", value: data.schoolName },
    { label: "Grade", value: data.grade },
    { label: "Pack", value: data.packName || data.packType || data.pack },
    { label: "Selected items", value: data.selectedItems },
    { label: "Removed items", value: data.removedItems },
    { label: "Estimated total", value: data.estimatedTotal },
    { label: "Delivery method", value: data.deliveryMethod },
    { label: "Address", value: data.address },
    { label: "Notes", value: data.message || data.notes },
  ];
}

function officePackFields(data: FormSubmission): Field[] {
  return [
    ...baseFields(data),
    { label: "Business name", value: data.businessName },
    { label: "Pack type", value: data.packType || data.pack },
    { label: "Quantity", value: data.orderQuantity || data.quantity },
    { label: "Message", value: data.message },
  ];
}

function partnershipFields(data: FormSubmission): Field[] {
  return [
    ...baseFields(data),
    {
      label: "School / organisation",
      value: data.schoolName || data.businessName,
    },
    { label: "Role", value: data.role },
    { label: "City", value: data.city },
    { label: "Learner count", value: data.learnerCount },
    { label: "Partner type", value: data.packType },
    { label: "Message", value: data.message },
  ];
}

function quoteFields(data: FormSubmission): Field[] {
  return [
    ...baseFields(data),
    { label: "Quote type", value: data.quoteType || data.packType },
    {
      label: "School / business",
      value: data.schoolOrBusinessName || data.schoolName || data.businessName,
    },
    { label: "Quantity", value: data.orderQuantity || data.quantity },
    { label: "Message", value: data.message },
  ];
}

function fieldsForEndpoint(endpoint: FormEndpointKind, data: FormSubmission) {
  if (endpoint === "order") return orderFields(data);
  if (endpoint === "office-pack") return officePackFields(data);
  if (endpoint === "school-partnership") return partnershipFields(data);
  if (endpoint === "quote") return quoteFields(data);
  return contactFields(data);
}

export function createEmailTemplate(
  endpoint: FormEndpointKind,
  data: FormSubmission
): TemplateResult {
  const subject = subjectByEndpoint[endpoint];
  const fields = fieldsForEndpoint(endpoint, data);
  const text = [
    subject,
    "",
    "PexPacks website form submission",
    "",
    renderText(fields),
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#17323a;">
      <h1 style="font-size:22px;margin:0 0 8px;">${escapeHtml(subject)}</h1>
      <p style="margin:0 0 18px;color:#49616a;">PexPacks website form submission</p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:760px;border:1px solid #e6edf0;">
        <tbody>${renderHtmlRows(fields)}</tbody>
      </table>
    </div>
  `;

  return { subject, text, html };
}
