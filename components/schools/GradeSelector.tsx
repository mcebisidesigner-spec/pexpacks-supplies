"use client";

import { useCallback, useRef, useState, type MouseEvent } from "react";
import type { GradePack, School } from "@/data/schools";
import { ArticlePackCard } from "@/components/packs/ArticlePackCard";
import { CompleteListModal } from "@/components/packs/CompleteListModal";
import { GradePackActions } from "@/components/packs/GradePackActions";
import { formatCurrency } from "@/lib/formatCurrency";
import { createSchoolGradePack } from "@/lib/packs/normalisePackItems";
import type { GradePackForCustomisation } from "@/lib/packs/types";
import type { CompleteListPack, PackListItem } from "@/components/packs/packListTypes";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { createFullTrayPack } from "@/lib/order/createTrayPack";
import styles from "./GradeSelector.module.css";

type GradeSelectorProps = {
  school: School;
  gradeDescriptions?: Record<string, Record<string, string>>;
  onGradeIntent?: () => void;
};

function toSchoolListItems(pack: GradePackForCustomisation): PackListItem[] {
  return pack.items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.requiredQuantity,
    icon: item.icon,
    category: item.category,
    description: item.description,
  }));
}

function buildCompleteListPack(
  grade: GradePack,
  pack: GradePackForCustomisation
): CompleteListPack {
  return {
    id: `school-${pack.id}`,
    gradeLabel: grade.grade,
    modalTitle: `${grade.grade} Stationery List`,
    contentHeading: "Official school stationery list",
    description: `Prepared according to the official school list for ${grade.grade}.`,
    priceLabel: `From ${formatCurrency(grade.price)}`,
    items: toSchoolListItems(pack),
    customiseTargetId: `customise-${pack.id}`,
    footerActions: (
      <GradePackActions
        pack={pack}
        showDownloadLink={false}
        showMicrocopy={false}
      />
    ),
  };
}

export function GradeSelector({ school, gradeDescriptions, onGradeIntent }: GradeSelectorProps) {
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const viewListTriggerRef = useRef<HTMLButtonElement | null>(null);

  const closeCompleteList = useCallback(() => {
    setSelectedGradeId(null);
    window.setTimeout(() => {
      viewListTriggerRef.current?.focus();
    }, 0);
  }, []);

  const handleAddToOrder = useCallback((grade: GradePack, pack: GradePackForCustomisation) => {
    const trayPack = createFullTrayPack({
      packId: pack.id,
      basePackId: pack.id,
      packName: pack.packName || `${grade.grade} Stationery Pack`,
      schoolId: school.id,
      schoolSlug: school.slug,
      schoolName: school.name,
      grade: grade.grade,
      gradeSlug: grade.gradeSlug,
      items: pack.items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.requiredQuantity,
        unitPrice: item.unitPrice,
      })),
      totalPrice: grade.price ?? 0,
      sourcePath: window.location.pathname,
    });
    usePackTrayStore.getState().addPack(trayPack);
    usePackTrayStore.getState().openTray();
    closeCompleteList();
  }, [school, closeCompleteList]);

  const selectedGrade = selectedGradeId
    ? school.grades.find((grade) => grade.id === selectedGradeId)
    : undefined;
  const selectedPack = selectedGrade
    ? createSchoolGradePack(
        school,
        selectedGrade,
        gradeDescriptions?.[selectedGrade.gradeSlug]
      )
    : null;
  const selectedListPack =
    selectedGrade && selectedPack
      ? buildCompleteListPack(selectedGrade, selectedPack)
      : null;

  const handleGradeInteraction = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target;

      if (
        onGradeIntent &&
        target instanceof HTMLElement &&
        target.closest("a,button")
      ) {
        onGradeIntent();
      }
    },
    [onGradeIntent]
  );

  return (
    <>
      <div
        className={styles.gradeSelector}
        onClickCapture={handleGradeInteraction}
      >
        {school.grades.map((grade) => {
          const pack = createSchoolGradePack(
            school,
            grade,
            gradeDescriptions?.[grade.gradeSlug]
          );

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
        onAddToOrder={
          selectedGrade && selectedPack
            ? () => handleAddToOrder(selectedGrade, selectedPack)
            : undefined
        }
      />
    </>
  );
}
