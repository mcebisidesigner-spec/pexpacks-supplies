import React from "react";
import { ShieldCheck, CheckCircle2, Lock, Users, ReceiptText, CreditCard } from "lucide-react";

const TRUST_POINTS = [
  {
    icon: CheckCircle2,
    title: "100% Curriculum List Compliance",
    desc: "Every item in every pack matches official teacher requirements without unauthorized cheaper substitutes.",
  },
  {
    icon: ShieldCheck,
    title: "Warehouse Quality Packing",
    desc: "Double-checked barcode-scanned pack assembly prevents missing pens, wrong ruled margins, or omitted textbooks.",
  },
  {
    icon: Lock,
    title: "POPIA-Compliant Data Handling",
    desc: "Learner data and school lists are processed strictly under South African POPIA regulations with restricted access controls.",
  },
  {
    icon: Users,
    title: "Direct Parent Helpdesk",
    desc: "School secretaries are relieved of customer calls. Pexpacks provides full phone, email, and WhatsApp parent support.",
  },
  {
    icon: ReceiptText,
    title: "Audited Annual Statements",
    desc: "School SGB finance committees receive transparent sales breakdowns and verified electronic fund remittance.",
  },
  {
    icon: CreditCard,
    title: "Affordable Parent Options",
    desc: "Supports all major credit/debit cards, instant EFT, and verified Happy Pay interest-free split payments.",
  },
];

export function InstitutionalTrust() {
  return (
    <section className="py-[clamp(54px,7vw,96px)] relative bg-[var(--pex-bg-soft,#f4f5f7)] border-y border-[var(--pex-border,#e1e7ea)]" aria-labelledby="trust-section-title">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="max-w-[760px] mb-[34px] text-left flex flex-col items-start">
          <p className="mb-[14px] text-[var(--pex-keppel,#1a7a77)] text-sm font-extrabold text-left">Operational excellence</p>
          <h2 id="trust-section-title" className="mb-[14px] text-[var(--pex-navy,#1a2a40)] font-heading text-[clamp(32px,4.6vw,56px)] font-extrabold leading-[1.05] tracking-[-0.01em] text-left">
            Built for Schools. Managed by Pexpacks.
          </h2>
          <p className="max-w-[760px] mb-[34px] text-[var(--pex-text-muted,#64748b)] text-lg leading-[1.45] text-left">
            Grounded in rigorous logistics, dependable institutional governance, and
            uncompromising educational standards.
          </p>
        </div>

        <div className="grid grid-cols-1 min-[861px]:grid-cols-3 gap-5">
          {TRUST_POINTS.map((pt) => {
            const Icon = pt.icon;
            return (
              <div key={pt.title} className="bg-white border border-[var(--pex-border,#e1e7ea)] rounded-2xl p-[22px_20px] flex gap-3.5 items-start">
                <Icon size={22} className="text-[var(--pex-keppel,#1a7a77)] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--pex-navy,#1a2a40)] m-0 mb-1">{pt.title}</h3>
                  <p className="text-[13px] text-[var(--pex-muted,#4d5a5d)] leading-[1.5] m-0">{pt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
