import type { GradePack, School } from "@/data/schools";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "./Schools.module.css";

type GradePackDetailsProps = {
  school: School;
  grade: GradePack;
};

export function GradePackDetails({ school, grade }: GradePackDetailsProps) {
  return (
    <article className={styles.gradeDetails}>
      <div>
        <p className={styles.kicker}>
          Skip the January rush. Order your ready-to-use pack today.
        </p>
        <h1>
          {school.name}
          <br />
          {grade.grade} Pack
        </h1>
        <p className={styles.price}>{formatCurrency(grade.price)}</p>
        <p>{grade.deliveryNote}</p>
      </div>
      <div className={styles.contentsCard}>
        <p className={styles.kicker}>Pack list</p>
        <h2>Pack contents</h2>
        <ul>
          {grade.contents.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Button href={`/order?school=${school.slug}&grade=${grade.gradeSlug}`}>
          Order This Pack
        </Button>
      </div>
    </article>
  );
}
