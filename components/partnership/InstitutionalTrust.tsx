import React from "react";
import { ShieldCheck, CheckCircle2, Lock, Users, ReceiptText, CreditCard } from "lucide-react";
import styles from "./Partnership.module.css";

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
    <section className={styles.sectionAlt} aria-labelledby="trust-section-title">
      <div className={styles.container}>
        <div className={styles.sectionHeaderCenter}>
          <p className={styles.eyebrow}>Operational excellence</p>
          <h2 id="trust-section-title" className={styles.sectionTitle}>
            Built for Schools. Managed by Pexpacks.
          </h2>
          <p className={styles.sectionLead}>
            Grounded in rigorous logistics, dependable institutional governance, and
            uncompromising educational standards.
          </p>
        </div>

        <div className={styles.trustGrid}>
          {TRUST_POINTS.map((pt) => {
            const Icon = pt.icon;
            return (
              <div key={pt.title} className={styles.trustItem}>
                <Icon size={22} className={styles.trustIcon} />
                <div>
                  <h3 className={styles.trustTitle}>{pt.title}</h3>
                  <p className={styles.trustDesc}>{pt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
