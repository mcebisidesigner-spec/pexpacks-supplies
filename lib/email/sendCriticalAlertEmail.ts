import { Resend } from "resend";

export interface CriticalAlertEmailParams {
  action: string;
  entityType: string;
  entityId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  summary: string;
  details?: Record<string, unknown> | null;
  timestamp?: string;
}

const CRITICAL_ALERT_RECIPIENT = "pexpacks@gmail.com";

export async function sendCriticalAlertEmail({
  action,
  entityType,
  entityId,
  actorName,
  actorEmail,
  summary,
  details,
  timestamp = new Date().toISOString(),
}: CriticalAlertEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[critical-alert] RESEND_API_KEY not configured; skipping email dispatch.");
      return { success: false, error: "RESEND_API_KEY not configured." };
    }

    const resend = new Resend(apiKey);
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || "Pexpacks Security Alert <admin@pexpacks.co.za>";

    const detailsJson = details ? JSON.stringify(details, null, 2) : "None provided";

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DB Critical Update Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #090e17; border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 12px; overflow: hidden;">
          
          <!-- Alert Header -->
          <tr>
            <td style="padding: 24px 28px; background-color: rgba(239, 68, 68, 0.1); border-bottom: 1px solid rgba(239, 68, 68, 0.25);">
              <div style="display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.05em; margin-bottom: 8px;">
                SECURITY ALERT
              </div>
              <h1 style="font-size: 18px; font-weight: 700; color: #ffffff; margin: 0;">
                Critical DB Update by Non-Superuser
              </h1>
              <p style="font-size: 13px; color: #fca5a5; margin: 4px 0 0;">
                Action: <strong style="color: #ffffff;">${action}</strong> on <strong style="color: #ffffff;">${entityType}</strong>
              </p>
            </td>
          </tr>

          <!-- Summary Details -->
          <tr>
            <td style="padding: 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="font-size: 12px; color: #94a3b8; padding: 6px 0; width: 140px;">Actor:</td>
                  <td style="font-size: 13px; font-weight: 600; color: #f8fafc; padding: 6px 0;">${actorName || "Unknown"} (${actorEmail || "no-email"})</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #94a3b8; padding: 6px 0;">Entity Target:</td>
                  <td style="font-size: 13px; color: #f8fafc; padding: 6px 0;">${entityType} ${entityId ? `[ID: ${entityId}]` : ""}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #94a3b8; padding: 6px 0;">Timestamp:</td>
                  <td style="font-size: 13px; color: #f8fafc; padding: 6px 0;">${timestamp}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #94a3b8; padding: 6px 0;">Summary:</td>
                  <td style="font-size: 13px; font-weight: 600; color: #38bdf8; padding: 6px 0;">${summary}</td>
                </tr>
              </table>

              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;">
                Payload / Modification Details:
              </div>
              <pre style="background: #030712; border: 1px solid #1e293b; border-radius: 6px; padding: 14px; color: #cbd5e1; font-size: 12px; font-family: monospace; overflow-x: auto; white-space: pre-wrap; margin: 0 0 24px;">${detailsJson}</pre>

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://pexpacks.co.za"}/admin/audit" style="display: inline-block; background-color: #0f172a; border: 1px solid #334155; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 6px;">
                  Review Audit Logs &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 28px; background-color: #050a12; border-top: 1px solid #1e293b; font-size: 11px; color: #475569; text-align: center;">
              Pexpacks Supplies Security Governance &bull; Automated notification sent to ${CRITICAL_ALERT_RECIPIENT}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: [CRITICAL_ALERT_RECIPIENT],
      subject: `[CRITICAL DB UPDATE ALERT] ${action} by ${actorName || actorEmail || "Staff"}`,
      html: htmlBody,
    });

    if (error) {
      // Fallback try with test onboarding sender
      try {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: [CRITICAL_ALERT_RECIPIENT],
          subject: `[CRITICAL DB UPDATE ALERT] ${action} by ${actorName || actorEmail || "Staff"}`,
          html: htmlBody,
        });
        return { success: true };
      } catch {
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("[critical-alert] Unexpected error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to dispatch alert." };
  }
}
