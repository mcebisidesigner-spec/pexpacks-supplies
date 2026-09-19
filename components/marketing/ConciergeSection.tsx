"use client";

import Link from "next/link";
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
            <p className="m-0 mb-2 text-pex-keppel font-bold text-xs uppercase tracking-wider">
              Edge case? Covered.
            </p>
            <h2
              id="concierge-heading"
              className="m-0 text-pex-navy font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight"
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
              <Link
                href="/order"
                className="w-full sm:w-auto min-h-[50px] sm:min-h-[54px] px-6 sm:px-7 rounded-full inline-flex items-center justify-center gap-2.5 font-heading text-sm sm:text-base font-extrabold !text-white no-underline whitespace-nowrap bg-pex-coral hover:bg-pex-coral-hover shadow-[0_4px_14px_rgba(255,111,89,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                data-conversion-event="homepage_concierge_upload"
                onClick={() =>
                  trackConciergeCtaClicked({
                    cta: "upload",
                    sourcePath: "/schools",
                  })
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                  className="w-5 h-5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round shrink-0"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Your School List
              </Link>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[50px] sm:min-h-[54px] px-6 sm:px-7 rounded-full inline-flex items-center justify-center gap-2.5 font-heading text-sm sm:text-base font-extrabold !text-white no-underline whitespace-nowrap bg-[#25d366] hover:bg-[#20bd5a] shadow-[0_4px_14px_rgba(37,211,102,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                  className="w-5 h-5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round shrink-0"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  <path d="M16 16s-1.5 1-4 1-4-1-4-1" />
                </svg>
                WhatsApp Us Your List
              </a>
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
