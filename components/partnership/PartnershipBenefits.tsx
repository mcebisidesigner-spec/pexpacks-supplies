import React from "react";
import { Check } from "lucide-react";

const ADVANTAGES = [
  {
    number: "01",
    title: "Exact School-List Procurement",
    description:
      "Every grade stationery list is meticulously audited and digitised into an approved scholastic pack, guaranteeing full curriculum alignment and uniform classroom readiness.",
    points: [
      "Official teacher-approved grade specifications",
      "Department of Basic Education compliance checks",
      "Strict premium brand vetting with zero unapproved substitutions",
      "Parent convenience with exact curriculum parity",
    ],
  },
  {
    number: "02",
    title: "Managed Parent Fulfilment",
    description:
      "Eliminate manual paper order collection, cash handling, and frantic January stationery queues with an enterprise logistics ecosystem built around your school schedule.",
    points: [
      "Direct-to-learner or scheduled school-drop distribution",
      "Individually pre-labelled and sorted by grade & student",
      "Integrated Happy Pay BNPL interest-free split payment",
      "Optional durable Pexcover™ protective book covering",
    ],
  },
  {
    number: "03",
    title: "12-Month Digital Infrastructure Package",
    description:
      "Qualifying partner institutions receive an integrated digital presence featuring high-performance hosting, mobile optimization, and dedicated parent communication channels.",
    points: [
      "School-branded modern digital storefront",
      "Secure SSL infrastructure & reliable uptime",
      "Seamless integration with Pexpacks ordering systems",
      "Zero monthly maintenance or server administration fees",
    ],
  },
  {
    number: "04",
    title: "Institutional Development Rebate",
    description:
      "Turn routine annual stationery purchasing into an ongoing financial asset that reinvests directly into your school development fund, bursaries, or sports facilities.",
    points: [
      "Up to 3.0% rebate returned on qualifying completed sales",
      "Deterministic adoption thresholds with transparent accounting",
      "Annual settlement report provided directly to the Bursar / SGB",
      "Zero financial risk, inventory liability, or upfront capital",
    ],
  },
];

export function PartnershipBenefits() {
  return (
    <section className="py-[clamp(54px,7vw,96px)] relative bg-[var(--pex-bg-soft,#f4f5f7)] border-y border-[var(--pex-border,#e1e7ea)]" aria-labelledby="advantages-title">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="max-w-[760px] mb-[34px] text-left flex flex-col items-start">
          <p className="mb-[14px] text-[var(--pex-keppel,#1a7a77)] text-sm font-extrabold text-left">The institutional proposition</p>
          <h2 id="advantages-title" className="mb-[14px] text-[var(--pex-navy,#1a2a40)] font-heading text-[clamp(32px,4.6vw,56px)] font-extrabold leading-[1.05] tracking-[-0.01em] text-left">
            One Partnership. Four Institutional Advantages.
          </h2>
          <p className="max-w-[760px] mb-[34px] text-[var(--pex-text-muted,#64748b)] text-lg leading-[1.45] text-left">
            A comprehensive operational and financial model engineered specifically
            for leading South African educational institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-md:gap-[18px]">
          {ADVANTAGES.map((adv) => (
            <div key={adv.number} className="bg-white border border-[#e1e7ea] rounded-[24px] p-[clamp(24px,4vw,36px)] shadow-[0_12px_32px_rgba(26,42,64,0.05)] transition-all duration-180 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(26,42,64,0.08)] flex flex-col">
              <div className="text-[13px] font-extrabold text-[var(--pex-keppel,#1a7a77)] tracking-[0.05em] mb-3 uppercase">ADVANTAGE {adv.number}</div>
              <h3 className="text-[clamp(19px,2.2vw,23px)] font-extrabold text-[var(--pex-navy,#1a2a40)] m-0 mb-3 leading-[1.25]">{adv.title}</h3>
              <p className="text-[var(--pex-muted,#4d5a5d)] text-[15px] leading-[1.6] m-0 mb-5 grow">{adv.description}</p>
              <ul className="list-none p-0 m-0 flex flex-col gap-[9px] border-t border-[var(--pex-border,#e1e7ea)] pt-[18px]" aria-label={`${adv.title} key highlights`}>
                {adv.points.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-[13.5px] font-semibold text-[var(--pex-navy,#1a2a40)]">
                    <Check size={16} className="text-[var(--pex-keppel,#1a7a77)] shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
