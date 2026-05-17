"use client";

import type { GradePack, School } from "@/data/schools";
import { GradePackActions } from "@/components/packs/GradePackActions";
import { ShareButtons } from "@/components/shared/ShareButtons";
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
        {/* Strategy 3.2: Verified badge */}
        <div className={styles.verifiedBadge}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>Verified against {school.name}&apos;s official stationery list</span>
        </div>

        <p className={styles.kicker}>
          Prepared according to the official school list.
        </p>
        <h1>
          {school.name}
          <br />
          {grade.grade} Stationery Pack
        </h1>
        <p className={styles.price}>{formatCurrency(grade.price)}</p>

        {/* Strategy 1.2: Urgency signal */}
        <div className={styles.urgencyBadge}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span>Pre-order now — packs are prepared before school starts</span>
        </div>

        <p>
          Already have some items? Customise this pack and only buy what your
          child still needs.
        </p>
        <div className={styles.gradeActionPanel}>
          <GradePackActions pack={pack} />
        </div>

        {/* Strategy 4.2: Share buttons */}
        <ShareButtons
          title={`${school.name} — ${grade.grade} Stationery Pack`}
          text={`Check out the ${grade.grade} stationery pack for ${school.name} on Pexpacks!`}
          className={styles.shareSection}
        />

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
