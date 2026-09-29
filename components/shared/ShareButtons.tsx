"use client";

import { Link2 } from "lucide-react";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/ui/icons";

type ShareButtonsProps = {
  text: string;
  className?: string;
};

export function ShareButtons({ text, className = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";

  function shareWhatsApp() {
    const waText = encodeURIComponent(`${text}\n${url}`);
    window.open(`https://wa.me/?text=${waText}`, "_blank", "noopener");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className={`flex flex-col gap-2 mt-5 pt-4 border-t border-pex-border ${className}`}>
      <span className="text-[0.6875rem] font-bold text-pex-muted tracking-wide">Share this list:</span>
      <div className="flex gap-2 flex-wrap max-md:gap-1.5">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 max-md:px-3 max-md:text-xs border border-pex-border rounded-full bg-pex-bg-soft text-pex-navy text-[0.6875rem] font-semibold cursor-pointer transition-all hover:bg-pex-keppel hover:text-white hover:border-pex-keppel hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-pex-coral focus-visible:outline-offset-2 motion-reduce:transition-none [&>svg]:shrink-0"
          onClick={shareWhatsApp}
          aria-label="Share via WhatsApp"
        >
          <WhatsAppIcon className="size-[18px]" />
          <span>WhatsApp</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 max-md:px-3 max-md:text-xs border border-pex-border rounded-full bg-pex-bg-soft text-pex-navy text-[0.6875rem] font-semibold cursor-pointer transition-all hover:bg-pex-keppel hover:text-white hover:border-pex-keppel hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-pex-coral focus-visible:outline-offset-2 motion-reduce:transition-none [&>svg]:shrink-0"
          onClick={copyLink}
          aria-label="Copy link to clipboard"
        >
          <Link2 className="size-[18px]" strokeWidth={2} aria-hidden="true" />
          <span>{copied ? "Copied!" : "Copy link"}</span>
        </button>
      </div>
    </div>
  );
}
