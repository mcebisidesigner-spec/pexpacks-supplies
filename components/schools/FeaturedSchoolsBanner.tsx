import { SectionHeader } from "@/components/marketing/SectionHeader";
import type { SchoolSearchRecord } from "@/lib/schools/types";
import { FeaturedSchoolCard } from "./FeaturedSchoolCard";
import styles from "./FeaturedSchools.module.css";

type FeaturedSchoolsBannerProps = {
  schools: SchoolSearchRecord[];
};

export function FeaturedSchoolsBanner({ schools }: FeaturedSchoolsBannerProps) {
  return (
    <section
      className={styles.featuredSection}
      aria-labelledby="featured-schools-heading"
    >
      <div className={styles.featuredIntro}>
        <SectionHeader
          eyebrow="Most popular"
          title="Popular schools"
          text="Start with one of our popular school pack pages, or search for your school above."
          headingId="featured-schools-heading"
        />
      </div>
      <div className={styles.featuredGrid}>
        {schools.map((school, index) => (
          <FeaturedSchoolCard
            school={school}
            position={index + 1}
            key={school.id}
          />
        ))}
      </div>
    </section>
  );
}
