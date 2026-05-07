import Image from "next/image";
import Link from "next/link";
import type { School } from "@/data/schools";
import { Button } from "@/components/ui/Button";
import styles from "./Schools.module.css";

type SchoolCardProps = {
  school: School;
};

export function SchoolCard({ school }: SchoolCardProps) {
  return (
    <article className={styles.schoolCard}>
      <div className={styles.schoolLogo}>
        <Image src={school.logo} alt={`${school.name} crest`} width={78} height={78} />
      </div>
      <div className={styles.schoolCardBody}>
        <p>{school.isPartnerSchool ? "Partner school" : "Available pack"}</p>
        <h3>
          <Link href={`/schools/${school.slug}`}>{school.name}</Link>
        </h3>
        <span>
          {school.city}, {school.province}
        </span>
        <div className={styles.gradeChips}>
          {school.grades.map((grade) => (
            <Link href={`/schools/${school.slug}/${grade.gradeSlug}`} key={grade.id}>
              {grade.grade}
            </Link>
          ))}
        </div>
      </div>
      <Button href={`/schools/${school.slug}`} variant="white" size="sm">
        Find your school pack
      </Button>
    </article>
  );
}
