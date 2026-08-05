import styles from "./HappyPaySteps.module.css";

const steps = [
  {
    step: "01",
    title: "Choose your packs",
    text: "Pick your school and grade packs, or build your own tray. Add Pexcover book covering if you\u2019d like.",
  },
  {
    step: "02",
    title: "Pay 50% today",
    text: "At checkout, choose Happy Pay and approve your split. Your first instalment is paid securely.",
  },
  {
    step: "03",
    title: "Pay the rest in 30 days",
    text: "Happy Pay settles your full order now, so your packs are dispatched right away. You pay the remaining 50% in 30 days.",
  },
] as const;

export function HappyPaySteps() {
  return (
    <div className={styles.steps} role="list" aria-label="How Happy Pay works">
      {steps.map((step) => (
        <div className={styles.step} role="listitem" key={step.step}>
          <span className={styles.stepNum} aria-hidden="true">
            {step.step}
          </span>
          <div className={styles.stepBody}>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepText}>{step.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
