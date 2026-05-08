import { logger } from "@/lib/logger";

type CaptchaResult = {
  ok: boolean;
  reason?: string;
};

export async function verifyCaptcha(token: string | undefined, remoteIp?: string): Promise<CaptchaResult> {
  if (process.env.CAPTCHA_ENABLED !== "true") {
    return { ok: true };
  }

  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret || !token) {
    logger.warn("Captcha configuration or token missing", { hasSecret: Boolean(secret), hasToken: Boolean(token) });
    return { ok: false, reason: "captcha_missing" };
  }

  const body = new URLSearchParams({
    secret,
    response: token
  });

  if (remoteIp && remoteIp !== "unknown") {
    body.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    const result = (await response.json()) as { success?: boolean };
    return { ok: result.success === true, reason: result.success ? undefined : "captcha_failed" };
  } catch (error) {
    logger.error("Captcha verification failed", { error });
    return { ok: false, reason: "captcha_error" };
  }
}
