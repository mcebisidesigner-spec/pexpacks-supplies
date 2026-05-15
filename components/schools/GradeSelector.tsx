import type { School } from "@/data/schools";
import { GradePackActions } from "@/components/packs/GradePackActions";
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

        return (
          <article key={grade.id} className={styles.gradeCard}>
            <div>
              <span>{grade.grade}</span>
              <h3>{grade.grade} Stationery Pack</h3>
              <p>Prepared according to the official school list.</p>
              <strong>{formatCurrency(grade.price)}</strong>
            </div>
            <GradePackActions pack={pack} showDownloadLink={false} />
          </article>
        );
      })}
    </div>
  );
}
