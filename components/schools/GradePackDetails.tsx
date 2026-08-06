"use client";

import type { GradePack, School } from "@/data/schools";
import { GradePackActions } from "@/components/packs/GradePackActions";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { ChecklistExitCapture } from "@/components/schools/ChecklistExitCapture";
import { PexcoverGradeUpsell } from "@/components/schools/PexcoverGradeUpsell";
import { StickyOrderBar } from "@/components/schools/StickyOrderBar";
import { HappyPayGradePackWidget } from "@/components/packs/HappyPayGradePackWidget";
import { formatCurrency } from "@/lib/formatCurrency";
import { createSchoolGradePack } from "@/lib/packs/normalisePackItems";
import styles from "./GradePackDetails.module.css";

type GradePackDetailsProps = {
  school: School;
  grade: GradePack;
  descriptions?: Record<string, string>;
  autoCustomise?: boolean;
};

function teacherPreferredBadge(item: string) {
  if (
    /(bostik|pritt|staedtler|faber|pilot|bic|crayola|carlton|marlin|croxley)/i.test(
      item,
    )
  ) {
    return "Teacher-preferred brand";
  }

  if (/(calculator|scissor|geometry|dictionary|atlas)/i.test(item)) {
    return "Reusable item";
  }

  return "";
}

export function GradePackDetails({ school, grade, descriptions, autoCustomise }: GradePackDetailsProps) {
  const pack = createSchoolGradePack(school, grade, descriptions);

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
          <span>
            Verified against {school.name}&apos;s official stationery list
          </span>
        </div>

        <p className={styles.kicker}>
          Prepared according to the official school list.
        </p>
        <h2 className={styles.gradeTitle}>
          {school.name}
          <br />
          {grade.grade} Stationery Pack
        </h2>

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

        <div className={styles.gradeActionPanel} id="grade-actions">
          <GradePackActions pack={pack} layout="detail" autoCustomise={autoCustomise} />
          <HappyPayGradePackWidget pack={pack} amount={grade.price} />
        </div>

        <PexcoverGradeUpsell school={school} grade={grade} />

        {/* Strategy 4.2: Share buttons */}
        <ShareButtons
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
            {grade.contents.map((item) => {
              const badge = teacherPreferredBadge(item);
              const description = descriptions?.[item];

              return (
                <li key={item}>
                  <span>{item}</span>
                  {description ? (
                    <span className={styles.itemDescription}>{description}</span>
                  ) : null}
                  {badge ? (
                    <span className={styles.itemBadge}>{badge}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>
            Pack details are being finalised. Request this pack and we&apos;ll
            confirm the list with you.
          </p>
        )}
        <ChecklistExitCapture school={school} grade={grade} />
      </div>
      <StickyOrderBar
        schoolName={school.name}
        gradeLabel={grade.grade}
        priceLabel={formatCurrency(grade.price)}
        targetSelector="#grade-actions"
      />
    </article>
  );
}
