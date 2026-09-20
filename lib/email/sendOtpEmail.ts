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
    
    // Keep each digit in its own tile so the code is easy to scan and copy.
    const digits = otpCode.split("");
    const digitCells = digits
      .map(
        (digit) =>
          `<td align="center" width="${Math.floor(100 / digits.length)}%" style="padding:0 4px;"><span style="display:block;background:#ffffff;border-radius:4px;color:#20252b;font-size:25px;line-height:46px;font-family:'Courier New',Courier,monospace;min-width:36px;height:46px;text-align:center;">${digit}</span></td>`
      )
      .join("");

    const htmlBody = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your Pexpacks verification code</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#20252b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:14px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:1080px;background:#edf2f8;border-radius:14px;">
          <tr>
            <td style="padding:16px 20px 20px;text-align:left;">
              <p style="margin:0 0 16px;font-size:18px;line-height:24px;color:#20252b;font-family:Arial,Helvetica,sans-serif;">Code Requested</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>${digitCells}</tr>
              </table>
              <a href="#copy-code" role="button" aria-label="Copy verification code" onclick="event.preventDefault();navigator.clipboard&amp;&amp;navigator.clipboard.writeText('${otpCode}').then(function(){this.textContent='Code copied';}.bind(this));return false;" style="display:inline-block;background:#0876ad;border-radius:999px;color:#ffffff;font-size:16px;font-weight:700;line-height:50px;padding:0 30px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Copy code</a>
            </td>
          </tr>
        </table>
        <p style="max-width:1080px;margin:14px auto 0;text-align:left;font-size:12px;line-height:18px;color:#64748b;font-family:Arial,Helvetica,sans-serif;">This code expires in <strong>5 minutes</strong> and can only be used once. If you did not request it, you can safely ignore this email.</p>
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
