import type { GradePack, School } from "@/data/schools";
import { GradePackActions } from "@/components/packs/GradePackActions";
import { formatCurrency } from "@/lib/formatCurrency";
import { createSchoolGradePack } from "@/lib/packs/normalisePackItems";
import styles from "./Schools.module.css";

type GradePackDetailsProps = {
  school: School;
  grade: GradePack;
};

export function GradePackDetails({ school, grade }: GradePackDetailsProps) {
  const pack = createSchoolGradePack(school, grade);

  return (
    <article className={styles.gradeDetails}>
      <div>
        <p className={styles.kicker}>
          Prepared according to the official school list.
        </p>
        <h1>
          {school.name}
          <br />
          {grade.grade} Stationery Pack
        </h1>
        <p className={styles.price}>{formatCurrency(grade.price)}</p>
        <p>
          Already have some items? Customise this pack and only buy what your
          child still needs.
        </p>
        <div className={styles.gradeActionPanel}>
          <GradePackActions pack={pack} />
        </div>
        <div className={styles.deliveryPanel}>
          <p className={styles.kicker}>Delivery or collection</p>
          <p>{grade.deliveryNote}</p>
        </div>
      </div>
      <div className={styles.contentsCard} id={`pack-list-${grade.id}`}>
        <p className={styles.kicker}>Pack list</p>
        <h2>What&apos;s Included</h2>
        {grade.contents.length ? (
          <ul>
            {grade.contents.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>
            Pack details are being finalised. Request this pack and we&apos;ll
            confirm the list with you.
          </p>
        )}
      </div>
    </article>
  );
}
