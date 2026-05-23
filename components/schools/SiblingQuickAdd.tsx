"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GradePack, School } from "@/data/schools";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import { saveOrderDraft } from "@/lib/order/orderDraft";
import styles from "./SiblingQuickAdd.module.css";

const SIBLING_SELECTION_COUNT_KEY = "Pexpacks:sibling-selection-count";
const SIBLING_SELECTION_EVENT = "pexpacks:sibling-selection";

function updateSiblingSelectionCount(count: number) {
  try {
    sessionStorage.setItem(SIBLING_SELECTION_COUNT_KEY, String(count));
    window.dispatchEvent(
      new CustomEvent(SIBLING_SELECTION_EVENT, { detail: { count } }),
    );
  } catch {
    // Session storage is an enhancement only.
  }
}

function gradeLine(grade: GradePack) {
  return `${grade.grade} full stationery pack - ${formatCurrency(grade.price)}`;
}

type SiblingQuickAddProps = {
  school: School;
};

export function SiblingQuickAdd({ school }: SiblingQuickAddProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);

  const selectedGrades = useMemo(
    () => school.grades.filter((grade) => selectedGradeIds.includes(grade.id)),
    [school.grades, selectedGradeIds],
  );
  const subtotal = selectedGrades.reduce((sum, grade) => sum + grade.price, 0);
  const discount = selectedGrades.length >= 2 ? subtotal * 0.05 : 0;
  const total = subtotal - discount;

  function readSelectedGradeIds() {
    if (!formRef.current) {
      return selectedGradeIds;
    }

    return new FormData(formRef.current)
      .getAll("siblingGrade")
      .map((value) => String(value));
  }

  function syncSelectedGrades() {
    const next = readSelectedGradeIds();
    setSelectedGradeIds(next);
    updateSiblingSelectionCount(next.length);
  }

  function continueWithSelectedGrades() {
    const currentGrades = school.grades.filter((grade) =>
      readSelectedGradeIds().includes(grade.id),
    );

    if (!currentGrades.length) {
      return;
    }

    const currentSubtotal = currentGrades.reduce(
      (sum, grade) => sum + grade.price,
      0,
    );
    const currentDiscount =
      currentGrades.length >= 2 ? currentSubtotal * 0.05 : 0;
    const currentTotal = currentSubtotal - currentDiscount;
    const firstGrade = currentGrades[0];
    const draft = saveOrderDraft({
      type: "multi-school",
      schoolSlug: school.slug,
      gradeSlug: firstGrade.gradeSlug,
      grade: currentGrades.map((grade) => grade.grade).join(", "),
      siblingGrades: currentGrades.map((grade) => grade.grade).join(", "),
      siblingPackCount: currentGrades.length,
      selectedItems: currentGrades.map(gradeLine).join("; "),
      estimatedTotal: currentTotal,
      subtotal: currentSubtotal,
      discount: currentDiscount,
    });
    const params = new URLSearchParams({
      school: school.slug,
      grade: firstGrade.gradeSlug,
      type: "multi-school",
      draft: draft.id,
    });

    router.push(`/order?${params.toString()}#checkout-form`);
  }

  if (school.grades.length < 2) {
    return null;
  }

  return (
    <section className={styles.quickAdd} aria-labelledby="sibling-quick-add">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Sibling Quick-Add</p>
          <h2 id="sibling-quick-add">Order multiple grades at once</h2>
        </div>
        <div className={styles.totalPanel} aria-live="polite">
          <span>{selectedGrades.length || "No"} packs selected</span>
          <strong>
            {selectedGrades.length ? formatCurrency(total) : "Select grades"}
          </strong>
        </div>
      </div>

      <form className={styles.gradeOptions} ref={formRef}>
        {school.grades.map((grade) => (
          <label className={styles.gradeOption} key={grade.id}>
            <input
              type="checkbox"
              name="siblingGrade"
              value={grade.id}
              onChange={syncSelectedGrades}
            />
            <span>
              <strong>{grade.grade}</strong>
              <small>{formatCurrency(grade.price)}</small>
            </span>
          </label>
        ))}
      </form>

      <div className={styles.footer}>
        <p>
          {selectedGrades.length >= 2
            ? `Sibling discount active: 5% off applied (${formatCurrency(
                discount,
              )} saved).`
            : "Select two or more grades to apply the sibling discount."}
        </p>
        <Button type="button" onClick={continueWithSelectedGrades}>
          Continue with selected packs
        </Button>
      </div>
    </section>
  );
}

export { SIBLING_SELECTION_COUNT_KEY, SIBLING_SELECTION_EVENT };
