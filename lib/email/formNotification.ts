import { Resend } from "resend";
import type { FormSubmission } from "@/lib/forms/types";
import type { SubmittedFormAttachment } from "@/lib/forms/validation";
import { emailLegalNoticeHtml } from "@/lib/email/legalNotice";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveSourceContext(data: FormSubmission): {
  sectionName: string;
  sectionBadge: string;
  url: string;
  displayUrl: string;
} {
  const rawUrl = data.pageUrl || data.sourceUrl || "https://pexpacks.co.za";
  let url = rawUrl;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://pexpacks.co.za${url.startsWith("/") ? url : `/${url}`}`;
  }

  let pathname = "/";
  try {
    const parsed = new URL(url);
    pathname = parsed.pathname;
  } catch {
    pathname = rawUrl;
  }

  let sectionName = "Pexpacks Web App";
  let sectionBadge = "Website Portal";

  if (pathname.includes("/schools/")) {
    const schoolSlug = pathname.split("/schools/")[1]?.split("/")[0] || "";
    const cleanSchool =
      data.schoolName ||
      schoolSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    sectionName = `School Stationery Page — ${cleanSchool}`;
    sectionBadge = "School List Hub";
  } else if (pathname === "/schools" || pathname === "/schools/") {
    sectionName = "School Directory & Search Hub";
    sectionBadge = "Schools Index";
  } else if (pathname.includes("/order")) {
    sectionName = "Stationery List Upload & Order Builder";
    sectionBadge = "Direct Order Builder";
  } else if (pathname.includes("/partner") || pathname.includes("/partnership")) {
    sectionName = "School & Supplier Partnership Portal";
    sectionBadge = "Partner Programme";
  } else if (pathname.includes("/add-your-school")) {
    sectionName = "Add Your School Request Form";
    sectionBadge = "School Request";
  } else if (pathname.includes("/contact")) {
    sectionName = "Contact & Help Centre";
    sectionBadge = "Support Form";
  } else if (pathname.includes("/blog")) {
    sectionName = "Blog & Parent Resource Guides";
    sectionBadge = "Resource Hub";
  } else if (pathname === "/" || pathname === "") {
    sectionName = "Homepage (Quick Quote & Search)";
    sectionBadge = "Homepage Action";
  } else {
    sectionName = `Web App Section (${pathname})`;
    sectionBadge = "App Section";
  }

  return {
    sectionName,
    sectionBadge,
    url,
    displayUrl: url.replace(/^https?:\/\//, ""),
  };
}

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
  const configuredFrom = "Pexpacks <orders@pexpacks.co.za>";

  const formTypeTitles: Record<string, string> = {
    quote: "Custom Stationery Quote Request",
    "school-pack-enquiry": "School Stationery Pack Enquiry",
    "full-pack-enquiry": "Full School Pack Enquiry",
    "custom-pack-enquiry": "Custom School Pack Enquiry",
    "school-partnership": "School Partnership Enquiry",
    contact: "Contact Form Query",
    "newsletter-subscribe": "Newsletter Subscriber Update",
  };

  const title = formTypeTitles[data.formType] || "New Form Submission Query";
  const customerName = data.fullName || "Customer";
  const subject = `[Pexpacks ${title}] ${customerName}${data.schoolName ? ` — ${data.schoolName}` : ""}`;

  const source = resolveSourceContext(data);
  const rawPhone = (data.phone || "").replace(/\D/g, "");
  const waUrl = rawPhone ? `https://wa.me/${rawPhone}` : null;
  const mailtoUrl = data.email ? `mailto:${data.email}` : null;
  const messageContent = data.message || data.notes || "No message content provided.";

  const formattedDate = new Date().toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1329; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0b1329; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 620px; background-color: #ffffff; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #1a2a40; padding: 28px 32px; text-align: left; border-bottom: 3px solid #219e9a;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Pexpacks</span>
                    <span style="font-size: 22px; font-weight: 800; color: #219e9a; letter-spacing: -0.5px;">.</span>
                    <span style="display: block; margin-top: 4px; font-size: 13px; color: rgba(255, 255, 255, 0.75); font-weight: 500;">
                      Supplies &amp; Custom School Packs Hub
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(33, 158, 154, 0.18); border: 1px solid rgba(33, 158, 154, 0.45); color: #219e9a; border-radius: 9999px; padding: 5px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${escapeHtml(source.sectionBadge)}
                    </span>
                  </td>
                </tr>
              </table>
              <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                  ${escapeHtml(title)}
                </h1>
              </div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 32px; background-color: #ffffff;">

              <!-- Web App Origin / Section Box -->
              <div style="margin-bottom: 24px; padding: 18px 20px; background-color: #f0fbfa; border: 1px solid #cdeeea; border-radius: 14px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="vertical-align: top; width: 28px;">
                      <span style="font-size: 18px;">📍</span>
                    </td>
                    <td style="vertical-align: top;">
                      <span style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #1a7a77;">
                        Submission Source &amp; App Section
                      </span>
                      <strong style="display: block; font-size: 15px; color: #1a2a40; margin-top: 3px;">
                        ${escapeHtml(source.sectionName)}
                      </strong>
                      <div style="margin-top: 8px;">
                        <a href="${escapeHtml(source.url)}" target="_blank" style="display: inline-block; background-color: #219e9a; color: #ffffff; text-decoration: none; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700;">
                          Open Section on Web App &rarr;
                        </a>
                        <span style="display: block; margin-top: 6px; font-size: 11px; color: #64748b; word-break: break-all;">
                          URL: ${escapeHtml(source.displayUrl)}
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Customer Details Card -->
              <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
                <div style="background-color: #f8fafc; padding: 10px 18px; border-bottom: 1px solid #e2e8f0;">
                  <span style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
                    Customer &amp; Enquiry Details
                  </span>
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 18px; font-size: 13px; color: #64748b; font-weight: 600; width: 35%; border-bottom: 1px solid #f1f5f9;">
                      Customer Name
                    </td>
                    <td style="padding: 12px 18px; font-size: 14px; color: #1a2a40; font-weight: 700; border-bottom: 1px solid #f1f5f9;">
                      ${escapeHtml(customerName)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 18px; font-size: 13px; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">
                      WhatsApp Phone
                    </td>
                    <td style="padding: 12px 18px; font-size: 14px; font-weight: 700; border-bottom: 1px solid #f1f5f9;">
                      ${data.phone ? `
                        <a href="${waUrl || `tel:${data.phone}`}" style="color: #16a34a; text-decoration: none;">
                          ${escapeHtml(data.phone)} ↗
                        </a>
                      ` : `<span style="color: #94a3b8; font-weight: 500;">Not provided</span>`}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 18px; font-size: 13px; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">
                      Email Address
                    </td>
                    <td style="padding: 12px 18px; font-size: 14px; font-weight: 700; border-bottom: 1px solid #f1f5f9;">
                      ${data.email ? `
                        <a href="${mailtoUrl || `mailto:${data.email}`}" style="color: #0284c7; text-decoration: none;">
                          ${escapeHtml(data.email)} ↗
                        </a>
                      ` : `<span style="color: #94a3b8; font-weight: 500;">Not provided</span>`}
                    </td>
                  </tr>
                  ${data.schoolName ? `
                  <tr>
                    <td style="padding: 12px 18px; font-size: 13px; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">
                      School Name
                    </td>
                    <td style="padding: 12px 18px; font-size: 14px; color: #1a2a40; font-weight: 700; border-bottom: 1px solid #f1f5f9;">
                      ${escapeHtml(data.schoolName)}
                    </td>
                  </tr>` : ""}
                  ${data.grade ? `
                  <tr>
                    <td style="padding: 12px 18px; font-size: 13px; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">
                      Target Grade
                    </td>
                    <td style="padding: 12px 18px; font-size: 14px; color: #1a2a40; font-weight: 700; border-bottom: 1px solid #f1f5f9;">
                      ${escapeHtml(data.grade)}
                    </td>
                  </tr>` : ""}
                  ${data.quoteType || data.packType ? `
                  <tr>
                    <td style="padding: 12px 18px; font-size: 13px; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">
                      Category / Type
                    </td>
                    <td style="padding: 12px 18px; font-size: 14px; color: #1a2a40; font-weight: 600; border-bottom: 1px solid #f1f5f9;">
                      ${escapeHtml(data.quoteType || data.packType || "")}
                    </td>
                  </tr>` : ""}
                  ${data.orderQuantity || data.quantity ? `
                  <tr>
                    <td style="padding: 12px 18px; font-size: 13px; color: #64748b; font-weight: 600;">
                      Order Quantity
                    </td>
                    <td style="padding: 12px 18px; font-size: 14px; color: #1a2a40; font-weight: 700;">
                      ${escapeHtml(String(data.orderQuantity || data.quantity))} packs
                    </td>
                  </tr>` : ""}
                </table>
              </div>

              <!-- Message / Stationery List Specification Box -->
              <div style="margin-bottom: 24px; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #219e9a; border-radius: 12px;">
                <span style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 8px;">
                  📝 Customer Message / Pack Specification
                </span>
                <div style="font-size: 14.5px; line-height: 1.65; color: #1e293b; white-space: pre-wrap;">
                  ${escapeHtml(messageContent)}
                </div>
              </div>

              <!-- Attachments Box (if any) -->
              ${attachments.length > 0 ? `
              <div style="margin-bottom: 24px; padding: 16px 20px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 14px;">
                <span style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0369a1; margin-bottom: 8px;">
                  📎 Attached Files (${attachments.length})
                </span>
                <div style="font-size: 13.5px; color: #0c4a6e; font-weight: 600; line-height: 1.6;">
                  ${attachments.map((att) => `📄 <strong>${escapeHtml(att.filename)}</strong> (${(att.size / 1024).toFixed(1)} KB)`).join("<br/>")}
                </div>
              </div>` : ""}

              <!-- Quick Action Buttons for Admin Staff -->
              <div style="padding: 18px 20px; background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; text-align: center;">
                <span style="display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                  Quick Admin Actions
                </span>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    ${waUrl ? `
                    <td align="center" style="padding: 4px;">
                      <a href="${waUrl}" target="_blank" style="display: inline-block; width: 100%; max-width: 160px; padding: 10px 14px; background-color: #25d366; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 700; text-align: center;">
                        💬 WhatsApp
                      </a>
                    </td>` : ""}
                    ${mailtoUrl ? `
                    <td align="center" style="padding: 4px;">
                      <a href="${mailtoUrl}" target="_blank" style="display: inline-block; width: 100%; max-width: 160px; padding: 10px 14px; background-color: #1a2a40; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 700; text-align: center;">
                        ✉️ Email Reply
                      </a>
                    </td>` : ""}
                    <td align="center" style="padding: 4px;">
                      <a href="${escapeHtml(source.url)}" target="_blank" style="display: inline-block; width: 100%; max-width: 160px; padding: 10px 14px; background-color: #219e9a; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 700; text-align: center;">
                        🌐 View Page
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Metadata & POPIA Audit Line -->
              <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid #f1f5f9; font-size: 11.5px; color: #94a3b8; line-height: 1.6;">
                Submitted at: <strong>${formattedDate} SAST</strong> &middot; POPIA Consent: <strong>${data.consent ? "Granted" : "Not granted"}</strong><br/>
                Routed Inboxes: <strong>orders@pexpacks.co.za</strong>, <strong>helpme@pexpacks.co.za</strong>, <strong>pexpacks@gmail.com</strong>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; font-size: 11.5px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0;">
              This notification was automatically generated by Pexpacks Supplies in-app portal via Resend API.<br/>
              Customer care: <a href="mailto:care@pexpacks.co.za" style="color: #219e9a; text-decoration: none; font-weight: 600;">care@pexpacks.co.za</a>
              ${emailLegalNoticeHtml}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    // Quote requests and enquiries route to orders@pexpacks.co.za, helpme@pexpacks.co.za & pexpacks@gmail.com
    const recipients =
      data.formType === "quote" || data.formType.includes("enquiry") || data.formType === "bulk-order"
        ? ["orders@pexpacks.co.za", "helpme@pexpacks.co.za", "pexpacks@gmail.com"]
        : ["helpme@pexpacks.co.za", "pexpacks@gmail.com"];
    const uniqueRecipients = [...new Set(recipients.filter(Boolean))];

    const resendAttachments = attachments.map((att) => ({
      filename: att.filename,
      content: att.content,
    }));

    // Attempt 1: Verified domain from address
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

    return { success: true };
  } catch (err) {
    console.error("[email] Unexpected error sending Resend notification:", err);
    return { success: false, error: "Email delivery failed" };
  }
}
