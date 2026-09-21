import React from "react";

const STEPS = [
  {
    number: "1",
    title: "Institutional Onboarding & List Verification",
    desc: "Submit your SGB- or school-approved stationery requirements and school identity guidelines. Our procurement specialists verify list accuracy, item quantities, and brand specifications.",
  },
  {
    number: "2",
    title: "Portal Deployment & Packaging Customisation",
    desc: "Your dedicated school ordering portal is configured while Pexpacks sets up classroom-grade packaging, barcode logistics, and parent communication templates for distribution.",
  },
  {
    number: "3",
    title: "Parent Launch & Annual Rebate Settlement",
    desc: "Parents order verified packs online with direct support and flexible payment options. Following the seasonal campaign, your school's development rebate is itemised and remitted.",
  },
];

export function OnboardingSteps() {
  return (
    <section className="py-12 sm:py-20 bg-[var(--pex-bg-soft,#f4f5f7)] border-y border-slate-200/80" id="how-it-works" aria-labelledby="onboarding-steps-title">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[760px] mb-[34px] text-left flex flex-col items-start">
          <p className="mb-3 text-pex-keppel text-sm font-extrabold text-left">Structured implementation</p>
          <h2 id="onboarding-steps-title" className="mb-3 text-pex-navy font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-left">
            From Approval to Launch in Three Steps.
          </h2>
          <p className="max-w-[760px] mb-[34px] text-slate-600 text-lg leading-[1.45] text-left">
            A streamlined onboarding pathway designed to fit effortlessly into your school's
            term calendar without taking teachers away from the classroom.
          </p>
        </div>

        <div className="grid grid-cols-1 min-[861px]:grid-cols-3 gap-6 max-[860px]:gap-5">
          {STEPS.map((step) => (
            <div key={step.number} className="bg-white border border-slate-200/80 rounded-2xl p-[28px_24px] shadow-[0_12px_32px_rgba(26,42,64,0.05)] flex flex-col relative">
              <div className="w-11 h-11 rounded-xl bg-pex-navy text-white text-lg font-extrabold flex items-center justify-center mb-[18px]">{step.number}</div>
              <h3 className="text-[17.5px] font-extrabold text-pex-navy m-0 mb-2.5 leading-[1.3]">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-[1.6] m-0">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
