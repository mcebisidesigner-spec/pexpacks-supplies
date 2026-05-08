"use client";

import { useEffect } from "react";
import Script from "next/script";
import styles from "@/components/marketing/Marketing.module.css";

type CaptchaFieldProps = {
  siteKey?: string;
  token: string;
  callbackName: string;
  onTokenChange: (token: string) => void;
};

export function CaptchaField({ siteKey, token, callbackName, onTokenChange }: CaptchaFieldProps) {
  useEffect(() => {
    if (!siteKey) {
      return;
    }

    const globalWindow = window as unknown as Record<string, unknown>;
    globalWindow[callbackName] = (nextToken: string) => onTokenChange(nextToken);

    return () => {
      delete globalWindow[callbackName];
    };
  }, [callbackName, onTokenChange, siteKey]);

  if (!siteKey) {
    return <input type="hidden" name="captchaToken" value="" readOnly />;
  }

  return (
    <div className={styles.captchaField}>
      <Script src="https://js.hcaptcha.com/1/api.js" strategy="afterInteractive" />
      <div className="h-captcha" data-sitekey={siteKey} data-callback={callbackName} />
      <input type="hidden" name="captchaToken" value={token} readOnly />
    </div>
  );
}
