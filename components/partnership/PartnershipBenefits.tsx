import React from "react";
import { Check } from "lucide-react";

const ADVANTAGES = [
  {
    number: "01",
    title: "Teacher-verified stationery packs",
    description:
      "Pexpacks helps turn the official school list into a clear stationery pack that parents can review and order.",
    points: [
      "Official school-list requirements",
      "Clear grade-by-grade pack information",
      "Personal help when an item needs a closer look",
      "Parents can order without working through a long list alone",
    ],
  },
  {
    number: "02",
    title: "Less stationery admin for the school",
    description:
      "Parents can choose and pay online while Pexpacks helps prepare and organise the stationery packs.",
    points: [
      "Home delivery or a participating school drop",
      "Packs organised for the learner and grade",
      "Card, Ozow Instant EFT, and Happy Pay options",
      "Optional durable Pexcover™ protective book covering",
    ],
  },
  {
    number: "03",
    title: "A simpler school ordering experience",
    description:
      "Partner schools can give parents a clear online place to find the right pack and understand what happens next.",
    points: [
      "A school-branded ordering page",
      "Secure online ordering",
      "A direct path into Pexpacks ordering",
      "Less manual stationery administration for the school",
    ],
  },
  {
    number: "04",
    title: "A rebate that supports the school",
    description:
      "Qualifying school partnerships can return a rebate to support school priorities, with the details agreed in the partnership terms.",
    points: [
      "A clear rebate structure for qualifying completed sales",
      "Transparent reporting for the agreed arrangement",
      "A statement can be provided for the school records",
      "No need for the school to hold stationery stock",
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
