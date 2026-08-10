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
      className={clsx(styles.addonCard, selected && styles.addonCardActive)}
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
        <Input
          type="checkbox"
          checked={selected}
          onChange={(event) => onToggle(event.target.checked)}
          aria-describedby="pexcover-price"
          wrapperClassName="!contents"
          className="!w-[22px] !h-[22px] !min-h-0"
        />
        <span>
          Add Pexcover for <strong id="pexcover-price">{formatCurrency(price)}</strong>
        </span>
      </label>
      {selected ? (
        <div className={styles.formGrid}>
          <Input
            id="pexcover-name"
            label="Learner name for labels"
            autoComplete="off"
            value={pexcoverName}
            placeholder="Optional"
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
              "Initials + Surname"
            ]}
          />
          <Input
            id="pexcover-subjects"
            label="Subject names optional"
            value={pexcoverSubjects}
            placeholder="English, Maths, Life Skills"
            onChange={(event) => onSubjectsChange(event.target.value)}
          />
          <Input
            id="pexcover-notes"
            label="Special notes optional"
            value={pexcoverNotes}
            placeholder="Any covering instructions?"
            onChange={(event) => onNotesChange(event.target.value)}
          />
        </div>
      ) : null}
    </section>
  );
}
