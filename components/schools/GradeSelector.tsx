"use client";

import { useCallback, useRef, useState } from "react";
import type { GradePack, School } from "@/data/schools";
import { ArticlePackCard } from "@/components/packs/ArticlePackCard";
import { CompleteListModal } from "@/components/packs/CompleteListModal";
import { GradePackActions } from "@/components/packs/GradePackActions";
import { formatCurrency } from "@/lib/formatCurrency";
import { createSchoolGradePack } from "@/lib/packs/normalisePackItems";
import type { GradePackForCustomisation } from "@/lib/packs/types";
import type { CompleteListPack, PackListItem } from "@/components/packs/packListTypes";
import styles from "./Schools.module.css";

type GradeSelectorProps = {
  school: School;
};

function toSchoolListItems(pack: GradePackForCustomisation): PackListItem[] {
  return pack.items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.requiredQuantity,
    icon: item.icon,
    category: item.category,
  }));
}

function buildCompleteListPack(
  grade: GradePack,
  pack: GradePackForCustomisation,
  footerActions?: CompleteListPack["footerActions"]
): CompleteListPack {
  return {
    id: `school-${pack.id}`,
    gradeLabel: grade.grade,
    modalTitle: `${grade.grade} Stationery List`,
    contentHeading: "Official school stationery list",
    description: `Prepared according to the official school list for ${grade.grade}.`,
    priceLabel: `From ${formatCurrency(grade.price)}`,
    items: toSchoolListItems(pack),
    footerActions,
  };
}

export function GradeSelector({ school }: GradeSelectorProps) {
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const viewListTriggerRef = useRef<HTMLButtonElement | null>(null);

  const closeCompleteList = useCallback(() => {
    setSelectedGradeId(null);
    window.setTimeout(() => {
      viewListTriggerRef.current?.focus();
    }, 0);
  }, []);

  const selectedGrade = selectedGradeId
    ? school.grades.find((grade) => grade.id === selectedGradeId)
    : undefined;
  const selectedPack = selectedGrade
    ? createSchoolGradePack(school, selectedGrade)
    : null;
  const selectedListPack =
    selectedGrade && selectedPack
      ? buildCompleteListPack(
          selectedGrade,
          selectedPack,
          <GradePackActions
            pack={selectedPack}
            showDownloadLink={true}
            showMicrocopy={false}
          />
        )
      : null;

  return (
    <>
      <div className={styles.gradeSelector}>
        {school.grades.map((grade) => {
          const pack = createSchoolGradePack(school, grade);

          return (
            <ArticlePackCard
              key={grade.id}
              gradeLabel={grade.grade}
              bestFor={`Best for ${grade.grade} learners`}
              title={`${grade.grade} Stationery Pack`}
              description="Prepared according to the official school list."
              priceLabel={`From ${formatCurrency(grade.price)}`}
              items={toSchoolListItems(pack)}
              viewCompleteAriaLabel={`View complete ${grade.grade} stationery list`}
              onViewCompleteList={(event) => {
                viewListTriggerRef.current = event.currentTarget;
                setSelectedGradeId(grade.id);
              }}
              actions={
                <GradePackActions
                  pack={pack}
                  showDownloadLink={true}
                  showMicrocopy={false}
                />
              }
            />
          );
        })}
      </div>

      <CompleteListModal
        pack={selectedListPack}
        onClose={closeCompleteList}
      />
    </>
  );
}
