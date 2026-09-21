import React from "react";
import { Check, School, ShieldCheck } from "lucide-react";

const SCHOOL_PROVIDES = [
  "Approved academic grade stationery lists and textbook specifications",
  "High-resolution school crest, badge, and institutional colour codes",
  "Designated school liaison (Principal, Bursar, or SGB representative)",
  "Distribution of the official ordering link to school parents",
  "Final partnership approval and agreement sign-off",
];

const PEXPACKS_MANAGES = [
  "Comprehensive list audit, brand vetting, and digital cataloguing",
  "Inventory reservation with Tier-1 certified educational manufacturers",
  "Tailored e-commerce portal with mobile responsiveness and SSL",
  "Secure payment gateway integration including Happy Pay BNPL split payment",
  "Warehouse pack assembly, barcode labelling, and custom school bag packaging",
  "Complete delivery logistics to school campus or parent residential addresses",
  "Dedicated parent customer service, returns, and pack query resolution",
  "Annual rebate calculation, itemised auditing, and direct fund remittance",
  "12-month managed digital infrastructure and continuous server maintenance",
];

export function ManagedPartnership() {
  return (
    <section className="py-12 sm:py-20 bg-[var(--pex-bg-soft,#f4f5f7)] border-y border-slate-200/80" aria-labelledby="managed-model-heading">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[760px] mb-[34px] text-left flex flex-col items-start">
          <p className="mb-3 text-pex-keppel text-sm font-extrabold text-left">Operational division of responsibility</p>
          <h2 id="managed-model-heading" className="mb-3 text-pex-navy font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-left">
            Zero Administrative Load for Your Academic Staff.
          </h2>
          <p className="max-w-[760px] mb-[34px] text-slate-600 text-lg leading-[1.45] text-left">
            We handle the heavy lifting of inventory, eCommerce, packaging, parent support,
            and logistics so your faculty and finance teams can focus 100% on education.
          </p>
        </div>

        <div className="grid grid-cols-1 min-[821px]:grid-cols-2 gap-7">
          {/* What School Provides */}
          <div className="rounded-2xl p-[clamp(24px,4vw,36px)] flex flex-col bg-white border border-slate-200/80 shadow-[0_12px_32px_rgba(26,42,64,0.05)]">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200/80">
              <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center bg-[rgba(26,42,64,0.08)] text-pex-navy">
                <School size={22} />
              </div>
              <div>
                <h3 className="text-[19px] font-extrabold text-pex-navy m-0">What the School Provides</h3>
                <span className="text-[12.5px] text-slate-600">
                  Under 2 hours of total administrative time
                </span>
              </div>
            </div>
            <ul className="list-none p-0 m-0 flex flex-col gap-3" aria-label="Responsibilities provided by school">
              {SCHOOL_PROVIDES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[14.5px] text-slate-700 leading-[1.45]">
                  <Check size={18} className="shrink-0 mt-0.5 text-pex-navy" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What Pexpacks Manages */}
          <div className="rounded-2xl p-[clamp(24px,4vw,36px)] flex flex-col bg-[rgba(26,122,119,0.04)] border border-[rgba(26,122,119,0.28)] shadow-[0_14px_36px_rgba(26,122,119,0.08)]">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200/80">
              <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center bg-[var(--pex-keppel,#1a7a77)] text-white">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-[19px] font-extrabold text-pex-navy m-0">What Pexpacks Manages</h3>
                <span className="text-[12.5px] text-pex-keppel font-bold">
                  End-to-end operational execution
                </span>
              </div>
            </div>
            <ul className="list-none p-0 m-0 flex flex-col gap-3" aria-label="Responsibilities managed by Pexpacks">
              {PEXPACKS_MANAGES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[14.5px] text-slate-700 leading-[1.45]">
                  <Check size={18} className="shrink-0 mt-0.5 text-pex-keppel" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
