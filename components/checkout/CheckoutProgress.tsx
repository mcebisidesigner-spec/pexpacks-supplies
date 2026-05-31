import styles from "./CheckoutProgress.module.css";

type Step = {
  id: string;
  label: string;
  title: string;
};

type CheckoutProgressProps = {
  steps: Step[];
  activeStep: number;
};

export function CheckoutProgress({ steps, activeStep }: CheckoutProgressProps) {
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
              key={step.id}
              className={[
                isComplete ? styles.progressActive : "",
                isCurrent ? styles.progressCurrent : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span aria-hidden="true">
                {isComplete ? "\u2713" : index + 1}
              </span>
              <strong>{step.label}</strong>
              <small>
                {isCurrent
                  ? "Current step"
                  : isComplete
                    ? "Completed"
                    : "Upcoming"}
              </small>
            </li>
          );
        })}
      </ol>
      <div
        className={styles.mobileProgress}
        role="group"
        aria-label={`Step ${activeStep + 1} of ${steps.length}: ${currentStep.title}`}
      >
        <p className={styles.mobileProgressLabel}>
          Step {activeStep + 1} of {steps.length}:{" "}
          <strong>{currentStep.title}</strong>
        </p>
        <div
          className={styles.mobileProgressBar}
          role="progressbar"
          aria-valuenow={activeStep + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
        >
          <i style={{ width: `${progressValue}%` }} />
        </div>
      </div>
    </>
  );
}
