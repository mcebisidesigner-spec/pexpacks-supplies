import Image from "next/image";
import Link from "next/link";
import type { School } from "@/data/schools";
import { Button } from "@/components/ui/Button";
import styles from "./Schools.module.css";

type SchoolCardProps = {
  school: School;
};

export function SchoolCard({ school }: SchoolCardProps) {
  const isPlaceholder = !school.logo || school.logo.includes('placeholder');
  const initial = school.name.charAt(0).toUpperCase();

  return (
    <article className={styles.schoolCard}>
      <div 
        className={styles.schoolLogo} 
        style={isPlaceholder ? { background: 'var(--pex-illustration-soft)', color: 'var(--pex-primary)', fontSize: '2rem', fontWeight: 'bold' } : {}}
      >
        {!isPlaceholder ? (
          <Image src={school.logo} alt={`${school.name} crest`} width={78} height={78} />
        ) : (
          <span>{initial}</span>
        )}
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
