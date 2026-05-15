import type { School } from "@/data/schools";
import { GradePackActions } from "@/components/packs/GradePackActions";
import { ItemIcon } from "@/components/ui/ItemIcon";
import { formatCurrency } from "@/lib/formatCurrency";
import { createSchoolGradePack } from "@/lib/packs/normalisePackItems";
import styles from "./Schools.module.css";

type GradeSelectorProps = {
  school: School;
};

export function GradeSelector({ school }: GradeSelectorProps) {
  return (
    <div className={styles.gradeSelector}>
      {school.grades.map((grade) => {
        const pack = createSchoolGradePack(school, grade);
        const previewItems = pack.items.slice(0, 5);
        const remainingItems = Math.max(pack.items.length - previewItems.length, 0);

        return (
          <article key={grade.id} className={styles.gradeCard}>
            <div className={styles.gradeCardMedia}>
              <span>{grade.grade}</span>
            </div>
            <div className={styles.gradeCardBody}>
              <p className={styles.gradeBestFor}>Best for: {grade.grade} learners</p>
              <h3>{grade.grade} Stationery Pack</h3>
              <p className={styles.gradeSummary}>
                Prepared according to the official school list.
              </p>
              <ul
                className={styles.gradeItemList}
                aria-label={`${grade.grade} stationery list preview`}
              >
                {previewItems.map((item) => (
                  <li key={item.id}>
                    <ItemIcon
                      name={item.icon}
                      size={16}
                      className={styles.gradeItemIcon}
                    />
                    {item.name}
                  </li>
                ))}
                {remainingItems ? (
                  <li className={styles.moreItems}>
                    + {remainingItems} more essentials
                  </li>
                ) : null}
              </ul>
            </div>
            <div className={styles.gradeCardFooter}>
              <strong>From {formatCurrency(grade.price)}</strong>
              <GradePackActions
                pack={pack}
                showDownloadLink={true}
                showMicrocopy={false}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
