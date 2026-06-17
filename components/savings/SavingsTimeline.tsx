import styles from "./SavingsTimeline.module.css";

const steps = [
  { date: "June", title: "Start your savings plan", text: "Choose your pack and activate your savings plan." },
  { date: "Jul–Sep", title: "Top up when you can", text: "Add money toward your pack during the savings period." },
  { date: "1 October", title: "Balance check", text: "We check whether your selected pack is fully covered." },
  { date: "1–15 Oct", title: "Resolve shortfall", text: "Pay the balance, customise down, or request a refund." },
  { date: "After confirmation", title: "Packing begins", text: "Once settled, Pexpacks prepares your pack." },
];

const badgeStyles = ["badgeCoral", "badgeTeal", "badgeNavy", "badgeCoral", "badgeTeal"] as const;

export function SavingsTimeline() {
  return (
    <div className={styles.timeline} role="list" aria-label="Savings plan timeline">
      {steps.map((step, i) => (
        <div className={styles.step} role="listitem" key={step.date}>
          <span className={`${styles.badge} ${styles[badgeStyles[i]]}`}>
            {i + 1}
          </span>
          <div className={styles.stepBody}>
            <div className={styles.stepTitle}>{step.date}</div>
            <p className={styles.stepText}>{step.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
