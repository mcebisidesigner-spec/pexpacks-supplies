import styles from "./Order.module.css";

type OrderProgressProps = {
  steps: string[];
  activeStep: number;
};

export function OrderProgress({ steps, activeStep }: OrderProgressProps) {
  return (
    <ol className={styles.progress} aria-label="Order progress">
      {steps.map((step, index) => (
        <li
          className={index <= activeStep ? styles.progressActive : ""}
          key={step}
        >
          <span>{index + 1}</span>
          {step}
        </li>
      ))}
    </ol>
  );
}
