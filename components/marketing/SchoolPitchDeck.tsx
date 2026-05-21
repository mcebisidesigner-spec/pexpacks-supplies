"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import styles from "./SchoolPitchDeck.module.css";

type SlideId = "promise" | "website" | "portal" | "value" | "launch";
type JourneyStep = "find" | "select" | "checkout";

type Slide = {
  id: SlideId;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  stat: string;
  statLabel: string;
};

const slides: Slide[] = [
  {
    id: "promise",
    label: "The offer",
    eyebrow: "Partner pitch",
    title: "A premium school website, stationery portal, and rebate engine at no setup cost.",
    body: "Pexpacks gives schools a stronger digital presence while removing one of the most frustrating annual admin jobs: stationery list ordering.",
    bullets: [
      "Custom school website designed around the school's identity.",
      "Managed hosting, SSL, maintenance, and content support.",
      "Parent ordering journey connected to approved grade stationery packs.",
    ],
    stat: "R35k",
    statLabel: "estimated yearly website value",
  },
  {
    id: "website",
    label: "Website",
    eyebrow: "Digital presence",
    title: "A real school website parents can trust, not a template placeholder.",
    body: "The school gets a modern public hub for admissions, calendars, newsletters, policies, leadership messages, and contact details.",
    bullets: [
      "School crest, colours, motto, and tone carried through the site.",
      "Mobile-first pages for families searching from a phone.",
      "Documents and updates organised so parents can find them quickly.",
    ],
    stat: "0",
    statLabel: "monthly hosting fee for partner schools",
  },
  {
    id: "portal",
    label: "Portal",
    eyebrow: "Parent convenience",
    title: "Parents buy the correct grade pack without school staff chasing forms.",
    body: "Every grade can have a verified stationery list, clear pricing, add-ons, and delivery or collection options.",
    bullets: [
      "Grade-specific packs reduce wrong-item buying.",
      "Card, instant EFT, and WhatsApp-assisted ordering options.",
      "Bulk school drop-off or direct home delivery workflows.",
    ],
    stat: "3",
    statLabel: "clicks to a parent-ready pack path",
  },
  {
    id: "value",
    label: "Value",
    eyebrow: "Financial impact",
    title: "The partnership creates visible value beyond a free website.",
    body: "Use the calculator to model rebates, admin time saved, and the annual website package value.",
    bullets: [
      "Estimated development-fund rebate on pack sales.",
      "Reduced admin time spent handling stationery queries.",
      "A measurable partner benefit the school can report internally.",
    ],
    stat: "5%",
    statLabel: "sample development rebate model",
  },
  {
    id: "launch",
    label: "Launch",
    eyebrow: "Easy rollout",
    title: "A clean handover from interest to launch-ready partner site.",
    body: "Pexpacks handles the technical build and pack setup. The school shares brand assets, lists, and approval feedback.",
    bullets: [
      "Submit the partnership enquiry.",
      "Share approved stationery lists and school brand assets.",
      "Review the site, launch the portal, and start partner ordering.",
    ],
    stat: "4",
    statLabel: "simple rollout stages",
  },
];

const journeyCopy: Record<JourneyStep, { title: string; body: string; tag: string }> = {
  find: {
    tag: "Step 1",
    title: "Find the school",
    body: "Parents land on the school website, see official pack links, and know they are ordering from the approved path.",
  },
  select: {
    tag: "Step 2",
    title: "Choose the grade",
    body: "Each grade opens a verified list with the correct items, optional extras, and clear pricing.",
  },
  checkout: {
    tag: "Step 3",
    title: "Confirm and pay",
    body: "The order is sent to Pexpacks for fulfilment, reducing school-side stationery admin.",
  },
};

const launchSteps = [
  "Enquiry",
  "Lists",
  "Website",
  "Parent launch",
];

export function SchoolPitchDeck() {
  const [activeSlide, setActiveSlide] = useState<SlideId>("promise");
  const [journeyStep, setJourneyStep] = useState<JourneyStep>("select");
  const [enrollment, setEnrollment] = useState(650);
  const [adoption, setAdoption] = useState(72);

  const activeIndex = slides.findIndex((slide) => slide.id === activeSlide);
  const slide = slides[activeIndex];
  const parentPacks = Math.round(enrollment * (adoption / 100));
  const rebate = parentPacks * 850 * 0.05;
  const adminHours = Math.round(parentPacks * 0.5);
  const totalValue = rebate + 35000 + adminHours * 160;

  const progress = useMemo(
    () => `${((activeIndex + 1) / slides.length) * 100}%`,
    [activeIndex],
  );

  const goToOffset = (offset: number) => {
    const nextIndex = (activeIndex + offset + slides.length) % slides.length;
    setActiveSlide(slides[nextIndex].id);
  };

  return (
    <section className={styles.deck} aria-label="Interactive school partner pitch deck">
      <div className={styles.deckTopbar}>
        <div>
          <p>School partner presentation</p>
          <strong>Click through the pitch</strong>
        </div>
        <div className={styles.progressTrack} aria-hidden="true">
          <span style={{ width: progress }} />
        </div>
        <span className={styles.slideCount}>
          {activeIndex + 1}/{slides.length}
        </span>
      </div>

      <div className={styles.deckGrid}>
        <nav className={styles.slideNav} aria-label="Pitch deck slides">
          {slides.map((item, index) => (
            <button
              className={`${styles.slideNavButton} ${
                activeSlide === item.id ? styles.slideNavButtonActive : ""
              }`}
              key={item.id}
              type="button"
              onClick={() => setActiveSlide(item.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <article className={styles.slidePanel}>
          <div className={styles.slideCopy}>
            <p className={styles.slideEyebrow}>{slide.eyebrow}</p>
            <h3>{slide.title}</h3>
            <p>{slide.body}</p>
            <ul>
              {slide.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>

          <div className={styles.slideVisual}>
            <div className={styles.metricSpotlight}>
              <span>{slide.stat}</span>
              <small>{slide.statLabel}</small>
            </div>

            {activeSlide === "value" ? (
              <div className={styles.calculator}>
                <label>
                  <span>Learners</span>
                  <strong>{enrollment}</strong>
                  <input
                    type="range"
                    min="150"
                    max="1600"
                    step="50"
                    value={enrollment}
                    onChange={(event) => setEnrollment(Number(event.target.value))}
                  />
                </label>
                <label>
                  <span>Expected pack adoption</span>
                  <strong>{adoption}%</strong>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="4"
                    value={adoption}
                    onChange={(event) => setAdoption(Number(event.target.value))}
                  />
                </label>
                <div className={styles.valueGrid}>
                  <div>
                    <span>Pack orders</span>
                    <strong>{parentPacks}</strong>
                  </div>
                  <div>
                    <span>Admin hours saved</span>
                    <strong>{adminHours}</strong>
                  </div>
                  <div className={styles.totalValue}>
                    <span>Total estimated value</span>
                    <strong>
                      R{totalValue.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}
                    </strong>
                  </div>
                </div>
              </div>
            ) : activeSlide === "portal" ? (
              <div className={styles.journeyCard}>
                <div className={styles.journeyTabs}>
                  {(Object.keys(journeyCopy) as JourneyStep[]).map((step) => (
                    <button
                      className={journeyStep === step ? styles.journeyTabActive : ""}
                      key={step}
                      type="button"
                      onClick={() => setJourneyStep(step)}
                    >
                      {journeyCopy[step].tag}
                    </button>
                  ))}
                </div>
                <div>
                  <span>{journeyCopy[journeyStep].tag}</span>
                  <h4>{journeyCopy[journeyStep].title}</h4>
                  <p>{journeyCopy[journeyStep].body}</p>
                </div>
              </div>
            ) : activeSlide === "launch" ? (
              <div className={styles.launchFlow}>
                {launchSteps.map((step, index) => (
                  <div key={step}>
                    <span>{index + 1}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.previewStack}>
                <div>
                  <span>Website</span>
                  <strong>Admissions, news, documents</strong>
                </div>
                <div>
                  <span>Portal</span>
                  <strong>Grade packs and checkout</strong>
                </div>
                <div>
                  <span>Partnership</span>
                  <strong>Rebates and less admin</strong>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>

      <div className={styles.deckControls}>
        <button
          className={styles.deckNavButton}
          type="button"
          onClick={() => goToOffset(-1)}
        >
          Previous
        </button>
        <Button href="#partner-form">Start partnership</Button>
        <button
          className={styles.deckNavButton}
          type="button"
          onClick={() => goToOffset(1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
