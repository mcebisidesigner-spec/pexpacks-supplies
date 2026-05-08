import nodemailer from "nodemailer";
import type { FormSubmission } from "./schema";
import { formTypeLabel } from "./schema";

/* ── Build email body from submission ── */
function buildHtml(data: FormSubmission) {
  const rows = [
    ["Form type", formTypeLabel(data.formType)],
    ["Full name", data.fullName],
    ["Phone", data.phone],
    ["Email", data.email],
    ["Preferred contact", data.preferredContactMethod],
    ["School name", data.schoolName],
    ["Grade", data.grade],
    ["Learner name", data.learnerName],
    ["Business name", data.businessName],
    ["Order qty", data.orderQuantity],
    ["Pack type", data.packType],
    ["Message", data.message],
    ["Consent", data.consent ? "Yes" : "No"],
    ["Page URL", data.pageUrl],
    ["Submitted at", data.submittedAt]
  ];

  const escape = (v: unknown) =>
    String(v ?? "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:6px 10px;border-bottom:1px solid #dde2e6">${escape(label)}</th><td style="padding:6px 10px;border-bottom:1px solid #dde2e6">${escape(value)}</td></tr>`
    )
    .join("");

  return `<div style="font-family:Arial,sans-serif;color:#192a3e"><h2 style="margin:0 0 12px">New Pexpacks enquiry</h2><table cellspacing="0" style="border-collapse:collapse;width:100%;max-width:700px">${htmlRows}</table></div>`;
}

function buildText(data: FormSubmission) {
  return [
    `Form type: ${formTypeLabel(data.formType)}`,
    `Name: ${data.fullName}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email ?? "-"}`,
    `School: ${data.schoolName ?? "-"}`,
    `Grade: ${data.grade ?? "-"}`,
    `Business: ${data.businessName ?? "-"}`,
    `Message: ${data.message ?? "-"}`,
    `Submitted: ${data.submittedAt ?? "-"}`
  ].join("\n");
}

/* ── Send via Gmail SMTP ── */
export async function sendEmail(data: FormSubmission) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.PEXPACKS_NOTIFICATION_EMAIL || user;

  if (!user || !pass) {
    console.warn("Gmail SMTP not configured — skipping email.");
    return { ok: false, reason: "missing_gmail_config" };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });

  try {
    await transporter.sendMail({
      from: `Pexpacks <${user}>`,
      to,
      subject: `[Pexpacks] New ${formTypeLabel(data.formType)} from ${data.fullName}`,
      html: buildHtml(data),
      text: buildText(data)
    });
    return { ok: true };
  } catch (error) {
    console.error("Email send failed:", error);
    return { ok: false, reason: "smtp_error" };
  }
}
