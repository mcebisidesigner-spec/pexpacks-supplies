import React from "react";
import styles from "./Partnership.module.css";

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
    <section className={styles.sectionAlt} id="how-it-works" aria-labelledby="onboarding-steps-title">
      <div className={styles.container}>
        <div className={styles.sectionHeaderCenter}>
          <p className={styles.eyebrow}>Structured implementation</p>
          <h2 id="onboarding-steps-title" className={styles.sectionTitle}>
            From Approval to Launch in Three Steps.
          </h2>
          <p className={styles.sectionLead}>
            A streamlined onboarding pathway designed to fit effortlessly into your school's
            term calendar without taking teachers away from the classroom.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          {STEPS.map((step) => (
            <div key={step.number} className={styles.stepCard}>
              <div className={styles.stepBadge}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
