import Link from "next/link";
import type { School } from "@/data/schools";
import styles from "./Schools.module.css";

type GradeSelectorProps = {
  school: School;
};

export function GradeSelector({ school }: GradeSelectorProps) {
  return (
    <div className={styles.gradeSelector}>
      {school.grades.map((grade) => (
        <Link
          href={`/schools/${school.slug}/${grade.gradeSlug}`}
          key={grade.id}
          className={styles.gradeCard}
        >
          <span>{grade.grade}</span>
          <strong>Select grade</strong>
        </Link>
      ))}
    </div>
  );
}
