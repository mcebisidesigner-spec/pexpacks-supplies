"use client";

import { formatCurrency } from "@/lib/formatCurrency";
import { Input } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import clsx from "clsx";
import styles from "./PexcoverAddOn.module.css";

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
  eligibleCount?: number;
  hasEligibleBooks?: boolean;
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
  eligibleCount,
  hasEligibleBooks = true,
}: PexcoverAddOnProps) {
  const isEligible = hasEligibleBooks && (eligibleCount === undefined || eligibleCount > 0);

  return (
    <section
      className={clsx(
        styles.addonCard,
        selected && isEligible && styles.addonCardActive,
        !isEligible && styles.addonCardDisabled
      )}
      aria-labelledby="pexcover-heading"
    >
      <div className={styles.addonHeaderRow}>
        <div className={styles.addonInfo}>
          <h3 id="pexcover-heading">Pexcover™ Book Covering Service</h3>
          <p>
            {isEligible
              ? `Add durable protective plastic covering & custom printed learner labels for ${eligibleCount ? `${eligibleCount} books` : "all books"} in this pack.`
              : "No coverable books found in this pack. Stationery-only packs do not require book covering."}
          </p>
        </div>
        <div className={styles.addonPriceFarRight} id="pexcover-price">
          {isEligible ? formatCurrency(price) : "R0.00"}
        </div>
      </div>

      <label className={clsx(styles.addonCheckbox, !isEligible && styles.addonCheckboxDisabled)}>
        <Input
          type="checkbox"
          checked={selected && isEligible}
          disabled={!isEligible}
          onChange={(event) => {
            if (isEligible) {
              onToggle(event.target.checked);
            }
          }}
          aria-describedby="pexcover-price"
          wrapperClassName="!contents"
          className="!w-[22px] !h-[22px] !min-h-0"
        />
        <span>
          {isEligible ? (
            <>
              Add Pexcover covering service for <strong>{formatCurrency(price)}</strong>
            </>
          ) : (
            <span>No coverable books in this pack</span>
          )}
        </span>
      </label>

      {selected && isEligible ? (
        <div className={styles.formGrid}>
          <Input
            id="pexcover-name"
            label="Learner name for labels"
            autoComplete="off"
            value={pexcoverName}
            placeholder="e.g. John Doe"
            onChange={(event) => onNameChange(event.target.value)}
          />
          <Select
            id="pexcover-format"
            label="Label format"
            value={pexcoverLabelFormat}
            onChange={(event) => onLabelFormatChange(event.target.value)}
            options={[
              "First Name + Surname",
              "First Name + Initial",
              "Initials + Surname",
            ]}
          />
          <Input
            id="pexcover-subjects"
            label="Subject names (optional)"
            value={pexcoverSubjects}
            placeholder="e.g. English, Mathematics, Life Skills"
            onChange={(event) => onSubjectsChange(event.target.value)}
          />
          <Input
            id="pexcover-notes"
            label="Special covering instructions (optional)"
            value={pexcoverNotes}
            placeholder="e.g. Please use blue labels if available"
            onChange={(event) => onNotesChange(event.target.value)}
          />
        </div>
      ) : null}
    </section>
  );
}
