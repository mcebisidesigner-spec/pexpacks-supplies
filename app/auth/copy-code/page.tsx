"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Copy, ArrowRight, ShieldCheck } from "lucide-react";

function CopyCodeContent() {
  const searchParams = useSearchParams();
  const rawCode = searchParams.get("code") || "";
  const email = searchParams.get("email") || "";
  const cleanCode = rawCode.replace(/\D/g, "").slice(0, 6);

  const [copied, setCopied] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  function executeCopy(text: string) {
    if (!text) return false;
    let success = false;

    // 1. Try modern async Clipboard API
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        navigator.clipboard.writeText(text);
        success = true;
      } catch {
        success = false;
      }
    }

    // 2. Fallback to execCommand('copy') for webviews / iOS Safari / older browsers
    if (!success && typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        textarea.style.top = (window.pageYOffset || document.documentElement.scrollTop) + "px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        success = false;
      }
    }

    // 3. Persist to cross-tab storage for automatic prefill on login tab
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(
          "pex_copied_otp",
          JSON.stringify({
            code: text,
            email: email.trim().toLowerCase(),
            timestamp: Date.now(),
          })
        );
      } catch {
        // ignore storage errors
      }
    }

    return success;
  }

  useEffect(() => {
    if (cleanCode && cleanCode.length === 6) {
      const res = executeCopy(cleanCode);
      setCopied(true);
      setCopyFeedback(res ? "Copied to clipboard!" : "Ready to copy");
    }
  }, [cleanCode]);

  const handleManualCopy = () => {
    executeCopy(cleanCode);
    setCopied(true);
    setCopyFeedback("Copied to clipboard!");
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const loginUrl = cleanCode
    ? `/pex-console-secure?otp=${cleanCode}${email ? `&email=${encodeURIComponent(email)}` : ""}`
    : "/pex-console-secure";

  return (
    <div className="min-h-screen bg-[#070b12] text-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-[#0c1424] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Shield Icon */}
        <div className="w-14 h-14 rounded-full bg-[#0876ad]/20 border border-[#0876ad]/40 flex items-center justify-center text-[#38bdf8] mb-4">
          <ShieldCheck size={28} />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Security Token Copied
        </h1>
        <p className="text-sm text-[#94a3b8] mb-6">
          Your 6-digit Pexpacks security code has been copied to your clipboard on this device.
        </p>

        {/* 6 Digit Display Tiles */}
        <div className="flex justify-center gap-2 mb-6">
          {(cleanCode ? cleanCode.split("") : ["-", "-", "-", "-", "-", "-"]).map(
            (digit, idx) => (
              <span
                key={idx}
                className="w-11 h-13 sm:w-12 sm:h-14 bg-[#ffffff] text-[#20252b] font-mono font-bold text-2xl flex items-center justify-center rounded-md shadow select-all"
              >
                {digit}
              </span>
            )
          )}
        </div>

        {/* Status indicator */}
        <div className="inline-flex items-center gap-2 bg-[#064e3b]/40 border border-[#059669]/50 text-[#34d399] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6">
          <Check size={14} />
          {copyFeedback || (copied ? "Copied to clipboard" : "Ready to copy")}
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href={loginUrl}
            className="w-full h-12 bg-[#0876ad] hover:bg-[#066594] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-lg hover:shadow-cyan-900/30"
          >
            Paste &amp; Open Back-Office Login
            <ArrowRight size={16} />
          </Link>

          <button
            type="button"
            onClick={handleManualCopy}
            className="w-full h-11 bg-[#1e293b] hover:bg-[#334155] text-[#cbd5e1] font-semibold rounded-xl flex items-center justify-center gap-2 text-xs transition-colors"
          >
            <Copy size={14} />
            Copy Code Again
          </button>
        </div>

        <p className="text-[11px] text-[#64748b] mt-6">
          This code expires in <strong>5 minutes</strong> and can only be used once.
        </p>
      </div>
    </div>
  );
}

export default function CopyCodePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070b12] flex items-center justify-center text-[#94a3b8] text-sm">
          Loading security token...
        </div>
      }
    >
      <CopyCodeContent />
    </Suspense>
  );
}
