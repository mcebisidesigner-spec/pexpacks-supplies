import { Resend } from "resend";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function generateAndSendOtpEmail(
  email: string
): Promise<{ success: boolean; otpCode?: string; error?: string }> {
  try {
    const adminClient = createSupabaseAdminClient();
    let otpCode = "";

    // 1. Try native Supabase Auth generateLink to obtain official 6-digit email_otp
    try {
      const { data: linkData, error: linkError } =
        await adminClient.auth.admin.generateLink({
          type: "magiclink",
          email: email.trim().toLowerCase(),
        });

      if (!linkError && linkData?.properties?.email_otp) {
        otpCode = linkData.properties.email_otp;
      }
    } catch (err) {
      console.warn("[otp-email] Supabase generateLink warning:", err);
    }

    // 2. Fallback to random 6-digit numeric generator if generateLink did not return email_otp
    if (!otpCode || otpCode.length !== 6) {
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    // 3. Store OTP token in public.auth_otp_tokens (valid for 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await adminClient.from("auth_otp_tokens").insert({
      email: email.trim().toLowerCase(),
      otp_code: otpCode,
      expires_at: expiresAt,
      used: false,
    });

    // 4. Send physical 6-digit OTP code via Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[otp-email] RESEND_API_KEY is missing. Code generated:", otpCode);
      return { success: true, otpCode };
    }

    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL || "Pexpacks Security <orders@pexpacks.co.za>";
    const formattedDigits = otpCode.split("").join(" &nbsp; ");

    const htmlBody = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pexpacks Security Token</title>
</head>
<body style="margin:0;padding:0;background:#070b12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#070b12;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#0c1322;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 24px 20px;text-align:center;background:#0c1322;">
              <div style="display:inline-block;padding:4px 12px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);border-radius:999px;color:#2dd4bf;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:12px;">
                TWO-FACTOR AUTHENTICATION
              </div>
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">
                Your Security Token
              </h1>
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;">
                Enter this 6-digit code on the <strong>/pex-console</strong> login gateway:
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td style="padding:10px 24px 24px;text-align:center;">
              <div style="background:#070b12;border:1.5px solid #1e293b;border-radius:12px;padding:20px 12px;margin:8px 0;font-size:32px;font-weight:800;color:#10b981;letter-spacing:8px;font-family:'Courier New',Courier,monospace;">
                [ &nbsp;${formattedDigits}&nbsp; ]
              </div>
              <p style="margin:14px 0 0;font-size:12px;color:#64748b;">
                This code expires in <strong style="color:#cbd5e1;">5 minutes</strong> and can only be used once.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 24px;background:rgba(15,23,42,0.6);border-top:1px solid rgba(255,255,255,0.05);text-align:center;font-size:11px;color:#64748b;line-height:1.4;">
              If you did not request this administrative login token, please ignore this email or contact system security immediately.
              <br /><br />
              &copy; Pexpacks Supplies &bull; Back-Office Security
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const { error: emailError } = await resend.emails.send({
      from,
      to: [email.trim()],
      subject: `[ ${otpCode} ] Your Pexpacks 6-Digit Security Token`,
      html: htmlBody,
    });

    if (emailError) {
      console.error("[otp-email] Resend error:", JSON.stringify(emailError));
      return { success: false, error: emailError.message };
    }

    return { success: true, otpCode };
  } catch (err) {
    console.error("[otp-email] Exception sending OTP email:", err);
    return { success: false, error: (err as Error).message };
  }
}
