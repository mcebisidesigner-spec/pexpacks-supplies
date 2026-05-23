"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import styles from "./UnboxingAccordion.module.css";

const features = [
  {
    id: "exact-match",
    title: "Exact List Match",
    text: "We cross-reference every item with official school lists. No substitutions, no missing items, just exactly what your child needs.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    imageSrc: "/images/unboxing-items.webp",
  },
  {
    id: "pexcover",
    title: "Pre-covered Books",
    text: "Skip the plastic wrap struggle. Add Pexcover at checkout and all exercise books arrive heavy-duty covered and perfectly labelled.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    imageSrc: "/images/pexcover-img-01.webp",
  },
  {
    id: "labels",
    title: "Colour-Coded Labels",
    text: "Each item is individually labelled with the learner's name and specific subject colours, ensuring nothing gets lost in the classroom.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    imageSrc: "/images/pexcover-img-02.webp",
  },
  {
    id: "brands",
    title: "Premium Brands",
    text: "We only pack trusted, high-quality stationery brands that teachers recommend and learners love.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    imageSrc: "/images/unboxing-G7.webp",
  },
];

export function UnboxingAccordion() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.contentSide}>
          <SectionHeader
            eyebrow="The unboxing experience"
            title="What's in the box?"
            text="Everything your child needs to start school ready, meticulously packed and delivered to your door."
          />
          <div className={styles.accordion}>
            {features.map((feature, index) => {
              const isActive = activeIndex === index;

              return (
                <div
                  key={feature.id}
                  className={`${styles.accordionItem} ${
                    isActive ? styles.active : ""
                  }`}
                >
                  <button
                    className={styles.accordionHeader}
                    onClick={() => setActiveIndex(index)}
                    aria-expanded={isActive}
                    aria-controls={`accordion-panel-${feature.id}`}
                  >
                    <span className={styles.iconWrapper}>{feature.icon}</span>
                    <h3>{feature.title}</h3>
                    <span className={styles.chevron}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>
                  <div className={styles.accordionBody} id={`accordion-panel-${feature.id}`}>
                    <div className={styles.accordionBodyInner}>
                      <div className={styles.mobileImageWrapper}>
                        <Image
                          src={feature.imageSrc}
                          alt={`Pexpacks ${feature.title}`}
                          fill
                          className={styles.mobileImage}
                          sizes="100vw"
                        />
                        <div className={styles.mobileFeatureBadge}>
                          <span className={styles.badgeIcon}>{feature.icon}</span>
                          <span className={styles.badgeText}>{feature.title}</span>
                        </div>
                      </div>
                      <p>{feature.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.actions}>
            <Button href="/schools">Find Your School Pack</Button>
            <p className={styles.actionsNote}>
              From R 659 per pack &middot; Free school delivery
            </p>
          </div>
        </div>

        <div className={styles.imageSide}>
          <div className={styles.imageWrapper}>
            {features.map((feature, index) => (
              <Image
                key={`img-${feature.id}`}
                src={feature.imageSrc}
                alt={`Pexpacks ${feature.title}`}
                fill
                className={`${styles.image} ${
                  activeIndex === index ? styles.imageActive : ""
                }`}
                sizes="(max-width: 960px) 100vw, 50vw"
              />
            ))}

            <div className={styles.featureBadge} key={`badge-${activeIndex}`}>
              <span className={styles.badgeIcon}>
                {features[activeIndex].icon}
              </span>
              <span className={styles.badgeText}>
                {features[activeIndex].title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
