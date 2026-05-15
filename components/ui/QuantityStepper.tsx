"use client";

import styles from "./QuantityStepper.module.css";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  ariaLabel: string;
};

export function QuantityStepper({ value, onChange, min = 0, max = 99, ariaLabel }: QuantityStepperProps) {
  return (
    <div className={styles.stepperContainer}>
      <button
        type="button"
        className={styles.stepperButton}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${ariaLabel}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
      <span className={styles.stepperValue} aria-hidden="true">{value}</span>
      <input 
        type="number" 
        className={styles.visuallyHidden} 
        value={value} 
        readOnly 
        aria-label={ariaLabel}
        min={min}
        max={max}
      />
      <button
        type="button"
        className={styles.stepperButton}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${ariaLabel}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
    </div>
  );
}
