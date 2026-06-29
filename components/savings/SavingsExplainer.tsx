import styles from "./SavingsExplainer.module.css";

const steps = [
  {
    date: "Start in June",
    text: "Choose your pack and activate your savings plan.",
    style: "stepNumberCoral" as const,
  },
  {
    date: "Top up before October",
    text: "Add money toward your pack during July, August and September.",
    style: "stepNumberTeal" as const,
  },
  {
    date: "Balance check on 1 October",
    text: "We check whether your selected pack is fully covered.",
    style: "stepNumberNavy" as const,
  },
  {
    date: "Resolve by 15 October",
    text: "Pay the balance, customise down to your saved amount, or request a refund according to the plan terms.",
    style: "stepNumberCoral" as const,
  },
  {
    date: "Packing begins after confirmation",
    text: "Once your pack is paid or value-matched, Pexpacks prepares it for delivery or collection.",
    style: "stepNumberTeal" as const,
  },
];

export function SavingsExplainer() {
  return (
    <section className={styles.section} aria-labelledby="savings-explain-heading">
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Pre-Purchase Savings Plan</p>
          <h2 id="savings-explain-heading" className={styles.heading}>
            How the Pexpacks Savings Plan works
          </h2>
          <p className={styles.intro}>
            Start saving early toward your child&rsquo;s stationery pack. Your money builds
            toward your selected pack, and we only prepare goods once your balance is ready
            or your value-matched pack is confirmed.
          </p>
        </div>
        <div className={styles.steps}>
          {steps.map((step, i) => (
            <div className={styles.stepCard} key={step.date}>
              <span className={`${styles.stepNumber} ${styles[step.style]}`}>
                {i + 1}
              </span>
              <div className={styles.stepTitle}>{step.date}</div>
              <p className={styles.stepText}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
