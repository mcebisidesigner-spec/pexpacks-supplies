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
    <section className="py-12 sm:py-20 bg-slate-50/50 border-y border-slate-200/80" aria-labelledby="advantages-title">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-8 text-left flex flex-col items-start">
          <p className="mb-3 text-pex-keppel text-sm font-extrabold text-left">The institutional proposition</p>
          <h2 id="advantages-title" className="mb-3 text-pex-navy font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-left">
            One Partnership. Four Institutional Advantages.
          </h2>
          <p className="max-w-3xl mb-8 text-slate-600 text-base sm:text-lg leading-relaxed text-left">
            A comprehensive operational and financial model engineered specifically
            for leading South African educational institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {ADVANTAGES.map((adv) => (
            <div key={adv.number} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md flex flex-col">
              <div className="text-xs font-extrabold text-pex-keppel tracking-wider mb-3 uppercase">ADVANTAGE {adv.number}</div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-pex-navy m-0 mb-3 leading-tight">{adv.title}</h3>
              <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed m-0 mb-5 grow">{adv.description}</p>
              <ul className="list-none p-0 m-0 flex flex-col gap-2 border-t border-slate-200 pt-4" aria-label={`${adv.title} key highlights`}>
                {adv.points.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm font-semibold text-pex-navy">
                    <Check size={16} className="text-pex-keppel shrink-0" />
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
