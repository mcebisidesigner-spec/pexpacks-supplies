"use client";

import Link from "next/link";
import { MessageCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppHref } from "@/data/contact";
import {
  trackConciergeCtaClicked,
  trackWhatsAppClicked,
} from "@/lib/analytics";

const WHATSAPP_LINK = buildWhatsAppHref(
  "Hi Pexpacks, I want to send my school stationery list for packing.",
);

export function ConciergeSection() {
  return (
    <section
      className="py-12 sm:py-16 md:py-20 bg-transparent"
      aria-labelledby="concierge-heading"
    >
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-pex-border rounded-card lg:rounded-3xl bg-[radial-gradient(circle_at_10%_90%,rgba(255,107,89,0.06),transparent_40%)] bg-card shadow-lg grid grid-cols-1 lg:grid-cols-[1fr_0.72fr] gap-7 sm:gap-10 lg:gap-14 items-center p-6 sm:p-8 lg:p-12 xl:p-14">
          <div className="max-w-[620px]">
            <p className="m-0 mb-3 text-pex-keppel text-sm font-semibold leading-tight normal-case">
              Edge case? Covered.
            </p>
            <h2
              id="concierge-heading"
              className="m-0 text-pex-navy font-heading text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.02] tracking-normal text-balance"
            >
              Don&rsquo;t see your school?
              <br />
              <span className="text-pex-coral">
                We&rsquo;ll pack it anyway.
              </span>
            </h2>
            <p className="mt-3 sm:mt-4 text-pex-muted text-sm sm:text-base md:text-lg leading-relaxed">
              If your school isn&rsquo;t listed yet, no problem. Upload or
              WhatsApp us your school&rsquo;s stationery list and we&rsquo;ll
              pack every item — exactly as specified, with the same 100% match
              guarantee.
            </p>
            <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row flex-wrap gap-3.5">
              <Button
                href="/order"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                data-conversion-event="homepage_concierge_upload"
                onClick={() =>
                  trackConciergeCtaClicked({
                    cta: "upload",
                    sourcePath: "/schools",
                  })
                }
              >
                <Upload className="size-5 shrink-0" aria-hidden="true" />
                <span>Upload Your School List</span>
              </Button>
              <Button
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                variant="keppel"
                size="lg"
                className="w-full sm:w-auto"
                data-conversion-event="homepage_concierge_whatsapp"
                onClick={() => {
                  trackConciergeCtaClicked({
                    cta: "whatsapp",
                    sourcePath: "/schools",
                  });
                  trackWhatsAppClicked({
                    sourcePath: "/schools",
                    label: "concierge_whatsapp",
                  });
                }}
              >
                <MessageCircle className="size-5 shrink-0" aria-hidden="true" />
                <span>WhatsApp Us Your List</span>
              </Button>
            </div>
          </div>
          <div className="grid gap-5 justify-items-center">
            <div
              className="w-16 h-16 rounded-2xl grid place-items-center bg-pex-keppel/10 text-pex-keppel"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
                <path d="M3 9h18" />
                <path d="M3 15h18" />
                <path d="M15 3v18" />
              </svg>
            </div>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {[
                "Upload your list",
                "We pack every item",
                "100% match guarantee",
                "Delivered to you",
              ].map((item, idx) => (
                <span
                  key={idx}
                  className="py-1.5 px-3.5 rounded-full bg-pex-bg text-pex-navy text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                    className="w-3.5 h-3.5 fill-none stroke-pex-keppel stroke-[2.6] stroke-linecap-round stroke-linejoin-round shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-5 text-center">
          <Link
            href="/add-your-school"
            className="text-pex-muted text-xs sm:text-sm font-bold no-underline hover:text-pex-keppel transition-colors"
          >
            Is your school not an official partner yet? Let us know{" "}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
