"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import { getSchoolPhaseLabel, isSchoolPhase, schoolPhaseOptions } from "@/lib/schools/schoolPhase";
import styles from "@/components/marketing/HeroSearch.module.css";

type SchoolPhaseSelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function SchoolPhaseSelect({
  id,
  value,
  onChange,
  className = "",
}: SchoolPhaseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const phaseRef = useRef<HTMLDivElement>(null);
  const labelId = `${id}-label`;
  const selectedLabel = isSchoolPhase(value)
    ? getSchoolPhaseLabel(value)
    : "Choose phase";

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!phaseRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  return (
    <div
      ref={phaseRef}
      className={`${styles.field} ${styles.phaseField} ${className}`}
      onBlur={handleBlur}
    >
      <span id={labelId}>School Phase</span>
      <button
        className={styles.phaseButton}
        type="button"
        aria-labelledby={`${labelId} ${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span
          id={`${id}-value`}
          className={isSchoolPhase(value) ? styles.phaseButtonValue : styles.phaseButtonPlaceholder}
        >
          {selectedLabel}
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m7 10 5 5 5-5" />
        </svg>
      </button>
      {isOpen ? (
        <div className={styles.phaseMenu} role="listbox" aria-labelledby={labelId}>
          {schoolPhaseOptions.map((phaseOption) => (
            <button
              className={styles.phaseOption}
              type="button"
              role="option"
              aria-selected={value === phaseOption.value}
              key={phaseOption.value}
              onClick={() => {
                onChange(phaseOption.value);
                setIsOpen(false);
              }}
            >
              <span>{phaseOption.label}</span>
              <small>
                {phaseOption.value === "high-schools"
                  ? "Grade 8 to Grade 12"
                  : phaseOption.value === "primary-schools"
                    ? "Grade R to Grade 7"
                    : "Creches and named pre-schools"}
              </small>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
