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
    const from = process.env.RESEND_FROM_EMAIL || "Pexpacks <orders@pexpacks.co.za>";
    
    // Digits array for 3x2 grid matching exact sample spec
    const digits = otpCode.split("");

    const htmlBody = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your Pexpacks Security Token</title>
</head>
<body style="margin:0;padding:0;background:#05080f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05080f;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#0b111e;border:1px solid #162032;border-radius:20px;overflow:hidden;box-shadow:0 24px 50px rgba(0,0,0,0.6);">
          <!-- Header Card Content -->
          <tr>
            <td style="padding:40px 32px 20px;text-align:center;background:#0b111e;">
              <!-- Capsule Top Badge -->
              <div style="display:inline-block;padding:6px 18px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.4);border-radius:999px;color:#2dd4bf;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;">
                TWO-FACTOR AUTHENTICATION
              </div>

              <!-- Main Title -->
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;font-family:Arial,Helvetica,sans-serif;">
                Your Security Token
              </h1>

              <!-- Subtitle -->
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">
                Enter this 6-digit code on the <strong style="color:#ffffff;">/pex-console-secure</strong> login gateway:
              </p>
            </td>
          </tr>

          <!-- Inner Code Box (Exact 3x2 Grid Matching Sample Image) -->
          <tr>
            <td style="padding:0 32px 24px;">
              <div style="background:#060a14;border:1px solid #182438;border-radius:16px;padding:32px 24px;text-align:center;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 auto;max-width:260px;">
                  <tr>
                    <td align="center" width="33%" style="padding:12px 0;font-size:36px;font-weight:800;color:#10b981;font-family:'Courier New',Courier,monospace,sans-serif;letter-spacing:2px;user-select:all;-webkit-user-select:all;">${digits[0]}</td>
                    <td align="center" width="33%" style="padding:12px 0;font-size:36px;font-weight:800;color:#10b981;font-family:'Courier New',Courier,monospace,sans-serif;letter-spacing:2px;user-select:all;-webkit-user-select:all;">${digits[1]}</td>
                    <td align="center" width="33%" style="padding:12px 0;font-size:36px;font-weight:800;color:#10b981;font-family:'Courier New',Courier,monospace,sans-serif;letter-spacing:2px;user-select:all;-webkit-user-select:all;">${digits[2]}</td>
                  </tr>
                  <tr>
                    <td align="center" width="33%" style="padding:12px 0;font-size:36px;font-weight:800;color:#10b981;font-family:'Courier New',Courier,monospace,sans-serif;letter-spacing:2px;user-select:all;-webkit-user-select:all;">${digits[3]}</td>
                    <td align="center" width="33%" style="padding:12px 0;font-size:36px;font-weight:800;color:#10b981;font-family:'Courier New',Courier,monospace,sans-serif;letter-spacing:2px;user-select:all;-webkit-user-select:all;">${digits[4]}</td>
                    <td align="center" width="33%" style="padding:12px 0;font-size:36px;font-weight:800;color:#10b981;font-family:'Courier New',Courier,monospace,sans-serif;letter-spacing:2px;user-select:all;-webkit-user-select:all;">${digits[5]}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Expiration Notice -->
          <tr>
            <td style="padding:0 32px 28px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#64748b;font-family:Arial,Helvetica,sans-serif;">
                This code expires in <strong style="color:#ffffff;">5 minutes</strong> and can only be used once.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background:rgba(10,16,28,0.8);border-top:1px solid rgba(255,255,255,0.06);text-align:center;font-size:11px;color:#64748b;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 8px;">
                If you did not request this administrative login token, please ignore this email or contact system security immediately.
              </p>
              <p style="margin:0;">
                &copy; Pexpacks Supplies &bull; Back-Office Security
              </p>
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
