"use client";

import { formatCurrency } from "@/lib/formatCurrency";
import styles from "@/app/checkout/Checkout.module.css";

type PexcoverAddOnProps = {
  selected: boolean;
  onToggle: (selected: boolean) => void;
  pexcoverName: string;
  onNameChange: (name: string) => void;
  pexcoverSubjects: string;
  onSubjectsChange: (subjects: string) => void;
  pexcoverLabelFormat: string;
  onLabelFormatChange: (format: string) => void;
  pexcoverNotes: string;
  onNotesChange: (notes: string) => void;
  price: number;
};

export function PexcoverAddOn({
  selected,
  onToggle,
  pexcoverName,
  onNameChange,
  pexcoverSubjects,
  onSubjectsChange,
  pexcoverLabelFormat,
  onLabelFormatChange,
  pexcoverNotes,
  onNotesChange,
  price,
}: PexcoverAddOnProps) {
  return (
    <section
      className={`${styles.addonCard} ${selected ? styles.addonCardActive : ""}`}
      aria-labelledby="pexcover-heading"
    >
      <div>
        <h3 id="pexcover-heading">Pexcover book covering</h3>
        <p>
          Add covered and labelled exercise books so the pack arrives closer to
          first-day ready.
        </p>
      </div>
      <label className={styles.addonCheckbox}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onToggle(event.target.checked)}
          aria-describedby="pexcover-price"
        />
        <span>
          Add Pexcover for <strong id="pexcover-price">{formatCurrency(price)}</strong>
        </span>
      </label>
      {selected ? (
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label htmlFor="pexcover-name">Learner name for labels</label>
            <input
              id="pexcover-name"
              value={pexcoverName}
              placeholder="Optional"
              onChange={(event) => onNameChange(event.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="pexcover-format">Label format</label>
            <select
              id="pexcover-format"
              value={pexcoverLabelFormat}
              onChange={(event) => onLabelFormatChange(event.target.value)}
            >
              <option>First Name + Surname</option>
              <option>First Name + Initial</option>
              <option>Initials + Surname</option>
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="pexcover-subjects">Subject names optional</label>
            <input
              id="pexcover-subjects"
              value={pexcoverSubjects}
              placeholder="English, Maths, Life Skills"
              onChange={(event) => onSubjectsChange(event.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="pexcover-notes">Special notes optional</label>
            <input
              id="pexcover-notes"
              value={pexcoverNotes}
              placeholder="Any covering instructions?"
              onChange={(event) => onNotesChange(event.target.value)}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
