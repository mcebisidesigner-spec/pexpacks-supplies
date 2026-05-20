import styles from "./Order.module.css";

type OrderProgressProps = {
  steps: string[];
  activeStep: number;
};

export function OrderProgress({ steps, activeStep }: OrderProgressProps) {
  const currentStep = steps[activeStep] ?? steps[0];
  const progressValue = ((activeStep + 1) / steps.length) * 100;

  return (
    <>
      <ol className={styles.progress} aria-label="Checkout progress">
        {steps.map((step, index) => {
          const isComplete = index < activeStep;
          const isCurrent = index === activeStep;

          return (
            <li
              className={[
                isComplete ? styles.progressActive : "",
                isCurrent ? styles.progressCurrent : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isCurrent ? "step" : undefined}
              key={step}
            >
              <span>{isComplete ? "✓" : index + 1}</span>
              {step}
            </li>
          );
        })}
      </ol>
      <div
        className={styles.mobileProgress}
        role="group"
        aria-label={`Step ${activeStep + 1} of ${steps.length}: ${currentStep}`}
      >
        <span>
          Step {activeStep + 1} of {steps.length}
        </span>
        <strong>{currentStep}</strong>
        <div className={styles.mobileProgressBar} aria-hidden="true">
          <i style={{ width: `${progressValue}%` }} />
        </div>
      </div>
    </>
  );
}
