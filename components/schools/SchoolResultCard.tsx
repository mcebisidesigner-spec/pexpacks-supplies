import Link from "next/link";
import type { SchoolSearchRecord } from "@/lib/schools/types";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "./SchoolResultCard.module.css";

function gradeLabel(grades: string[]) {
  if (grades.length <= 4) {
    return grades.join(", ");
  }

  return `${grades.slice(0, 3).join(", ")} +${grades.length - 3} more`;
}

type SchoolResultCardProps = {
  school: SchoolSearchRecord;
};

export function SchoolResultCard({ school }: SchoolResultCardProps) {
  return (
    <article className={styles.resultCard}>
      <div>
        <h3>
          <Link href={`/schools/${school.slug}`}>{school.name}</Link>
        </h3>
        <p>
          {school.region}
          {school.metro ? `, City of ${school.metro}` : school.province ? `, ${school.province}` : ""}
        </p>
      </div>
      <span>{gradeLabel(school.grades)}</span>
      <div className={styles.resultMeta}>
        {school.lowestPrice ? (
          <span className={styles.resultPrice}>
            Packs from {formatCurrency(school.lowestPrice)}
          </span>
        ) : null}
        <div className={styles.resultBadges}>
          {school.isFeatured ? <span>Featured</span> : null}
          {school.isPartner ? <span>Partner</span> : null}
        </div>
      </div>
      <Link href={`/schools/${school.slug}`} className={styles.resultLink}>
        View packs
      </Link>
    </article>
  );
}
