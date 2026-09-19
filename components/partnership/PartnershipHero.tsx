import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ShieldCheck, TrendingUp, Laptop, PackageCheck } from "lucide-react";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";

interface PartnershipHeroProps {
  eyebrow?: string;
  title?: string;
  onScheduleBriefing?: () => void;
  onRequestBrochure?: () => void;
}

export function PartnershipHero({
  eyebrow = "FOR GAUTENG SCHOOLS & INSTITUTIONAL LEADERS",
  title = "The Elite Standard in Scholastic Fulfilment & Digital Infrastructure.",
  onScheduleBriefing,
  onRequestBrochure,
}: PartnershipHeroProps) {
  return (
    <section className="py-[clamp(54px,7vw,96px)] relative" aria-labelledby="partnership-hero-title">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 min-[981px]:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.9fr)] gap-10 min-[981px]:gap-[clamp(32px,5vw,68px)] items-center">
          <div className="flex flex-col items-start">
            <p className="mb-[14px] text-[var(--pex-keppel,#1a7a77)] text-sm font-extrabold text-left">
              {eyebrow}
            </p>

            <h1 id="partnership-hero-title" className="m-0 mb-5 text-[var(--pex-navy,#1a2a40)] font-heading text-[clamp(36px,5.2vw,64px)] font-extrabold leading-[1.04] tracking-[-0.02em]">
              {title}
            </h1>

            <p className="m-0 mb-[18px] text-[var(--pex-text,#172326)] text-[clamp(16px,1.8vw,18.5px)] leading-[1.55] font-medium">
              Transform seasonal back-to-school administration into an automated
              revenue generator for your campus.
            </p>

            <p className="m-0 mb-8 text-[var(--pex-muted,#4d5a5d)] text-[clamp(14px,1.5vw,15.5px)] leading-[1.6]">
              Pexpacks Supplies digitises your school-approved stationery requirements,
              deploys a tailored parent ordering portal, delivers custom-packaged
              stationery directly to learners, and returns up to 3% of qualifying
              turnover to your school development fund — with zero administrative
              friction for your staff.
            </p>

            <div className="flex flex-wrap gap-2.5 mb-[34px]" aria-label="Partnership guarantees">
              <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-white border border-[var(--pex-border,#e1e7ea)] text-[var(--pex-navy,#1a2a40)] text-[13px] font-bold shadow-[0_2px_8px_rgba(26,42,64,0.04)]">
                <span className="text-[var(--pex-keppel,#1a7a77)] inline-flex">
                  <ShieldCheck size={16} />
                </span>
                <span>0% School Setup Cost</span>
              </div>
              <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-white border border-[var(--pex-border,#e1e7ea)] text-[var(--pex-navy,#1a2a40)] text-[13px] font-bold shadow-[0_2px_8px_rgba(26,42,64,0.04)]">
                <span className="text-[var(--pex-keppel,#1a7a77)] inline-flex">
                  <TrendingUp size={16} />
                </span>
                <span>Up to 3% Institutional Rebate</span>
              </div>
              <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-white border border-[var(--pex-border,#e1e7ea)] text-[var(--pex-navy,#1a2a40)] text-[13px] font-bold shadow-[0_2px_8px_rgba(26,42,64,0.04)]">
                <span className="text-[var(--pex-keppel,#1a7a77)] inline-flex">
                  <Laptop size={16} />
                </span>
                <span>12-Month Digital Infrastructure Package</span>
              </div>
              <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-white border border-[var(--pex-border,#e1e7ea)] text-[var(--pex-navy,#1a2a40)] text-[13px] font-bold shadow-[0_2px_8px_rgba(26,42,64,0.04)]">
                <span className="text-[var(--pex-keppel,#1a7a77)] inline-flex">
                  <PackageCheck size={16} />
                </span>
                <span>Managed Stationery Fulfilment</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              <Button
                href="#partnership-enquiry"
                variant="primary"
                size="lg"
                onClick={onScheduleBriefing}
              >
                Schedule a 10-Minute SGB Briefing
              </Button>
              <Button
                href="#partnership-enquiry"
                variant="outline"
                size="lg"
                onClick={onRequestBrochure}
              >
                Request Institutional Overview
              </Button>
            </div>
          </div>

          <div className="relative rounded-[24px] overflow-hidden border border-[rgba(225,231,234,0.8)] shadow-[0_24px_54px_rgba(26,42,64,0.12)] bg-white">
            <div className="relative w-full aspect-[4/3.4] overflow-hidden">
              <Image
                src="/images/hero-school-stationery-delivery.webp"
                alt="Pexpacks stationery delivery packs for partner schools"
                fill
                priority
                sizes="(min-width: 1280px) 560px, (min-width: 980px) 45vw, 100vw"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-[rgba(26,42,64,0.94)] backdrop-blur-[10px] p-[14px_18px] rounded-[14px] border border-white/[0.14] text-white flex items-center justify-between gap-3.5">
              <div>
                <p className="text-[13.5px] font-bold text-white m-0">Institutional Supply Assurance</p>
                <p className="text-xs text-[#94a3b8] m-0">100% Grade-list compliance &amp; quality guarantee</p>
              </div>
              <CheckCircle2 size={24} className="text-[var(--pex-coral,#ff6f59)] shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
