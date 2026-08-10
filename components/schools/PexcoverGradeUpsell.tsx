"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GradePack, School } from "@/data/schools";
import { Button } from "@/components/ui/Button";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatCurrency";
import { saveOrderDraft } from "@/lib/checkout/draft";
import styles from "./GradePackDetails.module.css";

type PexcoverGradeUpsellProps = {
  school: School;
  grade: GradePack;
};

export function PexcoverGradeUpsell({
  school,
  grade,
}: PexcoverGradeUpsellProps) {
  const router = useRouter();
  const [learnerName, setLearnerName] = useState("");

  function continueWithPexcover() {
    const draft = saveOrderDraft({
      type: "full-school",
      schoolSlug: school.slug,
      gradeSlug: grade.gradeSlug,
      grade: grade.grade,
      estimatedTotal: grade.price,
      pexcoverRequested: true,
      pexcoverName: learnerName.trim(),
    });
    router.push(`/checkout/${encodeURIComponent(school.slug)}+${encodeURIComponent(grade.gradeSlug)}?draft=${encodeURIComponent(draft.id)}`);
  }

  return (
    <section
      className={styles.pexcoverPanel}
      aria-labelledby="pexcover-upsell-title"
    >
      <div>
        <p className={styles.kicker}>Pexcover add-on</p>
        <h3 id="pexcover-upsell-title">Add covered books and printed labels</h3>
        <p>
          Add the learner name now and checkout will keep the Pexcover option
          ready for this pack.
        </p>
      </div>
      <label className={styles.pexcoverField}>
        <span>Child&apos;s name for labels</span>
        <input
          id="pexcover-grade-upsell-learner-name"
          name="learnerName"
          autoComplete="off"
          value={learnerName}
          onChange={(event) => setLearnerName(event.target.value)}
          placeholder="e.g. John Doe"
        />
      </label>
      <div className={styles.labelPreview} aria-live="polite">
        <span>Label preview</span>
        <strong>{learnerName.trim() || "Child Name"}</strong>
        <small>
          {grade.grade} | {school.name}
        </small>
      </div>
      <Button type="button" onClick={continueWithPexcover}>
        Enable Pexcover (+{formatCurrency(PEXCOVER_PRICE)})
      </Button>
    </section>
  );
}
