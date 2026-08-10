import { Resend } from "resend";
import type { FormSubmission } from "@/lib/forms/types";
import type { SubmittedFormAttachment } from "@/lib/forms/validation";

export async function sendFormNotificationEmail(
  data: FormSubmission,
  attachments: SubmittedFormAttachment[] = []
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY is not configured. Skipping form notification for:",
      data.formType
    );
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const resend = new Resend(apiKey);
  const officialEmail = process.env.RESEND_REPLY_TO_EMAIL || "helpme@pexpacks.co.za";
  const configuredFrom = process.env.RESEND_FROM_EMAIL || "Pexpacks <orders@pexpacks.co.za>";

  const formTypeTitles: Record<string, string> = {
    quote: "Custom Stationery Quote Request",
    "school-pack-enquiry": "School Stationery Pack Enquiry",
    "full-pack-enquiry": "Full School Pack Enquiry",
    "custom-pack-enquiry": "Custom School Pack Enquiry",
    "school-partnership": "School Partnership Enquiry",
    contact: "Contact Form Query",
  };

  const title = formTypeTitles[data.formType] || "New Form Submission Query";
  const subject = `[Pexpacks ${title}] ${data.fullName || "Customer Query"}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #23b4b0; }
    .content { padding: 24px; }
    .field-card { background: #f1f5f9; padding: 16px; border-radius: 12px; margin-bottom: 16px; }
    .field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700; margin-bottom: 4px; }
    .field-value { font-size: 15px; color: #0f172a; font-weight: 600; }
    .message-box { background: #fffbeb; border: 1px solid #fef3c7; padding: 16px; border-radius: 12px; font-size: 14px; white-space: pre-wrap; color: #92400e; }
    .footer { padding: 16px 24px; background: #f8fafc; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Pexpacks Supplies</h1>
      <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">${title}</p>
    </div>
    <div class="content">
      <div class="field-card">
        <div class="field-label">Customer Name</div>
        <div class="field-value">${data.fullName || "Not provided"}</div>
      </div>
      <div class="field-card">
        <div class="field-label">WhatsApp Phone</div>
        <div class="field-value">${data.phone ? `<a href="https://wa.me/${data.phone.replace(/\D/g, "")}">${data.phone}</a>` : "Not provided"}</div>
      </div>
      <div class="field-card">
        <div class="field-label">Email Address</div>
        <div class="field-value">${data.email ? `<a href="mailto:${data.email}">${data.email}</a>` : "Not provided"}</div>
      </div>
      ${data.quoteType ? `
      <div class="field-card">
        <div class="field-label">Category / School Type</div>
        <div class="field-value">${data.quoteType}</div>
      </div>` : ""}
      ${data.schoolName ? `
      <div class="field-card">
        <div class="field-label">School Name</div>
        <div class="field-value">${data.schoolName}</div>
      </div>` : ""}
      <div class="field-card">
        <div class="field-label">Stationery List / Message</div>
        <div class="message-box">${data.message || data.notes || "No message content"}</div>
      </div>
      ${attachments.length > 0 ? `
      <div class="field-card" style="background: #e0f2fe; border: 1px solid #bae6fd;">
        <div class="field-label" style="color: #0369a1;">Attached Files (${attachments.length})</div>
        <div class="field-value" style="color: #0c4a6e;">
          ${attachments.map((att) => `📎 <strong>${att.filename}</strong> (${(att.size / 1024).toFixed(1)} KB)`).join("<br/>")}
        </div>
      </div>` : ""}
      <div style="font-size: 12px; color: #64748b; margin-top: 16px;">
        Submitted at: ${data.submittedAt || new Date().toISOString()}<br/>
        POPIA Consent: ${data.consent ? "Granted" : "Not granted"}
      </div>
    </div>
    <div class="footer">
      This notification was automatically sent by Pexpacks Web App via Resend.
    </div>
  </div>
</body>
</html>
`;

  try {
    // Primary attempt: Send to official email + account email
    const recipients = ["orders@pexpacks.co.za", officialEmail, "pexpacks@gmail.com"];
    const uniqueRecipients = [...new Set(recipients.filter(Boolean))];

    const resendAttachments = attachments.map((att) => ({
      filename: att.filename,
      content: att.content,
    }));

    // Attempt 1: Custom domain from address
    let sendResult = await resend.emails.send({
      from: configuredFrom,
      to: uniqueRecipients,
      replyTo: data.email || officialEmail,
      subject,
      html,
      attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
    });

    // Attempt 2: Fallback to test onboarding sender if domain is unverified on Resend
    if (sendResult.error && sendResult.error.message.includes("domain is not verified")) {
      sendResult = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: ["mcebisidesigner@gmail.com"],
        replyTo: data.email || officialEmail,
        subject,
        html,
        attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
      });
    }

    if (sendResult.error) {
      console.error("[email] Resend form notification failed:", JSON.stringify(sendResult.error));
      return { success: false, error: sendResult.error.message };
    }

    console.log(`[email] Resend notification sent successfully:`, sendResult.data);
    return { success: true };
  } catch (err) {
    console.error("[email] Unexpected error sending Resend notification:", err);
    return { success: false, error: "Email delivery failed" };
  }
}
