"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, CheckCircle2 } from "lucide-react";
import type { GradePack, School } from "@/data/schools";
import { Button } from "@/components/ui/Button";
import { calculatePexcoverTotal } from "@/lib/pricing/pexcover";
import { formatCurrency } from "@/lib/formatCurrency";
import { saveOrderDraft } from "@/lib/checkout/draft";
import styles from "./GradePackDetails.module.css";

type PexcoverGradeUpsellProps = {
  school: School;
  grade: GradePack;
  pexcoverPrice?: number;
};

export function PexcoverGradeUpsell({
  school,
  grade,
  pexcoverPrice,
}: PexcoverGradeUpsellProps) {
  const router = useRouter();
  const [learnerName, setLearnerName] = useState("");

  const pexcoverInfo = calculatePexcoverTotal(grade.packItems);
  const effectivePexcoverPrice =
    pexcoverInfo.hasEligibleBooks
      ? pexcoverInfo.pexcoverTotalRands
      : (pexcoverPrice ?? 0);

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
        <p className={styles.kicker} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
          <Sparkles className="w-4 h-4 text-amber-500" /> Pexcover add-on
        </p>
        <h3 id="pexcover-upsell-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BookOpen className="w-5 h-5 text-emerald-600 inline" /> Add covered books and printed labels
        </h3>
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
        <strong style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          {learnerName.trim() || "Child Name"}
        </strong>
        <small>
          {grade.grade} | {school.name}
        </small>
      </div>
      <Button type="button" onClick={continueWithPexcover}>
        Enable Pexcover (+{formatCurrency(effectivePexcoverPrice)})
      </Button>
    </section>
  );
}
