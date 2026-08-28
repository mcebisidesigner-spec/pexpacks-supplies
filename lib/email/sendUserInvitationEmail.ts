import { Resend } from "resend";

export interface UserInvitationEmailParams {
  toEmail: string;
  fullName: string;
  department?: string;
  roles: { slug: string; name: string; description: string }[];
  notes?: string;
  invitedByName?: string;
  tempPassword?: string;
  actionUrl?: string;
}

export async function sendUserInvitationEmail({
  toEmail,
  fullName,
  department,
  roles,
  notes,
  invitedByName,
  tempPassword,
  actionUrl,
}: UserInvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[invite-email] RESEND_API_KEY is not configured; skipping email dispatch.");
      return { success: false, error: "RESEND_API_KEY is not configured." };
    }

    const resend = new Resend(apiKey);
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || "Pexpacks Supplies <admin@pexpacks.co.za>";
    const loginLink =
      actionUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL || "https://pexpacks.co.za"}/pex-console-secure`;

    const rolesListHtml =
      roles.length > 0
        ? roles
            .map(
              (r) => `
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px;">
            <div style="font-weight: 700; color: #10b981; font-size: 14px; margin-bottom: 4px;">${r.name}</div>
            <div style="color: #94a3b8; font-size: 13px; line-height: 1.4;">${r.description}</div>
          </div>
        `
            )
            .join("")
        : `
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px;">
            <div style="font-weight: 700; color: #10b981; font-size: 14px;">Staff Member</div>
            <div style="color: #94a3b8; font-size: 13px;">General back-office system access</div>
          </div>
        `;

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Pexpacks Supplies</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #090e17; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Branding -->
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 1px solid #1e293b; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.03em; margin-bottom: 4px;">
                PEXPACKS <span style="color: #10b981;">SUPPLIES</span>
              </div>
              <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b;">
                Back-Office Control Centre
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 16px;">
                Welcome to the team, ${fullName}!
              </h1>
              
              <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin: 0 0 20px;">
                ${invitedByName ? `<strong>${invitedByName}</strong> has` : "You have been"} invited to join the Pexpacks Supplies administrative management portal. You now have official access to manage school packs, orders, quotations, and operational workflows.
              </p>

              ${
                department
                  ? `<div style="display: inline-block; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 600; color: #34d399; margin-bottom: 24px;">
                      Department: ${department}
                    </div>`
                  : ""
              }

              <!-- Credentials Box -->
              <div style="background: #060d1b; border: 1.5px solid #0284c7; border-radius: 12px; padding: 22px 24px; margin-bottom: 26px; box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.2);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding-bottom: 10px;">
                  <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #38bdf8;">
                    🔐 Your Temporary Login Credentials:
                  </div>
                </div>

                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                  <tr>
                    <td style="font-size: 13px; color: #94a3b8; padding: 7px 0; width: 140px; font-weight: 600;">Console Portal:</td>
                    <td style="font-size: 13px; font-weight: 700; color: #38bdf8; padding: 7px 0;">
                      <a href="${loginLink}" style="color: #38bdf8; text-decoration: underline;">${loginLink}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #94a3b8; padding: 7px 0; font-weight: 600;">Username:</td>
                    <td style="font-size: 14px; font-weight: 800; color: #ffffff; padding: 7px 0;">${toEmail}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #94a3b8; padding: 7px 0; font-weight: 600;">Temporary Password:</td>
                    <td style="font-size: 15px; font-weight: 800; font-family: 'Courier New', Courier, monospace; color: #34d399; padding: 7px 0;">
                      <span style="background: #020617; border: 1px solid #10b981; padding: 5px 12px; border-radius: 6px; letter-spacing: 0.08em; display: inline-block;">${tempPassword || "Supplied by Administrator"}</span>
                    </td>
                  </tr>
                </table>

                <div style="background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; border-radius: 4px; padding: 10px 14px; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                  <strong style="color: #ffffff;">📋 Next Steps on First Sign-In:</strong>
                  <ol style="margin: 6px 0 0 0; padding-left: 18px;">
                    <li style="margin-bottom: 3px;">Sign in using your <strong>Username</strong> and <strong>Temporary Password</strong> above.</li>
                    <li style="margin-bottom: 3px;">You will be prompted immediately to create your private <strong>Permanent Password</strong>.</li>
                    <li>Once saved, the system will automatically redirect you to <strong>re-login</strong> with your new permanent password.</li>
                  </ol>
                </div>
              </div>

              <!-- Roles & Responsibilities Section -->
              <div style="margin-bottom: 24px;">
                <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 10px;">
                  Your Assigned Roles &amp; Responsibilities:
                </div>
                ${rolesListHtml}
              </div>

              ${
                notes
                  ? `<div style="background: #0b1329; border-left: 3px solid #3b82f6; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                      <div style="font-size: 12px; font-weight: 600; color: #60a5fa; margin-bottom: 2px;">Note from Administrator:</div>
                      <div style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">${notes}</div>
                    </div>`
                  : ""
              }

              <!-- Call to Action Button -->
              <div style="text-align: center; margin: 32px 0 24px;">
                <a href="${loginLink}" style="display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 34px; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">
                  Sign In with Temporary Password &rarr;
                </a>
              </div>

              <p style="font-size: 12px; color: #64748b; text-align: center; line-height: 1.5; margin: 0;">
                If you were not expecting this invitation, please ignore this email or reach out to security@pexpacks.co.za.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #050a12; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #475569;">
              &copy; ${new Date().getFullYear()} Pexpacks Supplies (Pty) Ltd. Confidential Administrative Communication.
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
      to: [toEmail],
      subject: `Welcome to Pexpacks Supplies – Administrative Access Invitation`,
      html: htmlBody,
    });

    if (error) {
      console.error("[invite-email] Resend API error:", error);
      // Fallback try with test onboarding sender if production domain is pending verification
      try {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: [toEmail],
          subject: `Welcome to Pexpacks Supplies – Administrative Access Invitation`,
          html: htmlBody,
        });
        return { success: true };
      } catch {
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("[invite-email] Unexpected error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to dispatch email." };
  }
}
