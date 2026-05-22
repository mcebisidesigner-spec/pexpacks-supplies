"use client";

import { useState } from "react";
import styles from "./SchoolMockupDemo.module.css";

type DemoView = "website" | "portal" | "updates";

const views: Array<{
  key: DemoView;
  label: string;
  title: string;
  text: string;
  features: string[];
}> = [
  {
    key: "website",
    label: "School Website",
    title: "A professional site built around your brand",
    text: "Custom domain, SSL hosting, admissions content, crest and colours — all maintained free for partner schools.",
    features: [
      "Custom domain (yourschool.co.za)",
      "SSL certificate and hosting included",
      "Admissions, prospectus, and calendar pages",
      "Mobile-responsive design",
    ],
  },
  {
    key: "portal",
    label: "Parent Portal",
    title: "Grade packs parents can order in 3 clicks",
    text: "Each grade has a pre-packed stationery list. Parents choose a grade, confirm items, and check out — no school admin involved.",
    features: [
      "Packs built from official grade lists",
      "Card, EFT, and WhatsApp ordering",
      "Home delivery or school drop-off",
      "Optional add-ons like Pexcover",
    ],
  },
  {
    key: "updates",
    label: "News Desk",
    title: "A central notice board for the school community",
    text: "Publish events, term dates, policies, and newsletters in a format families can scan quickly from any phone.",
    features: [
      "Publish news and event notices",
      "Term calendars and sports fixtures",
      "Policy and newsletter downloads",
      "Development fund updates",
    ],
  },
];

export function SchoolMockupDemo() {
  const [activeView, setActiveView] = useState<DemoView>("website");
  const current = views.find((v) => v.key === activeView)!;

  return (
    <div className={styles.container} aria-label="Interactive partner website demo">
      <div className={styles.demoShell}>
        {/* View switcher */}
        <div className={styles.segmentedControl} role="tablist" aria-label="Choose demo view">
          {views.map((view) => (
            <button
              className={`${styles.segmentButton} ${
                activeView === view.key ? styles.segmentButtonActive : ""
              }`}
              key={view.key}
              type="button"
              role="tab"
              aria-selected={activeView === view.key}
              onClick={() => setActiveView(view.key)}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className={styles.contentPanel} role="tabpanel">
          <div className={styles.copyBlock}>
            <p className={styles.eyebrow}>{current.label}</p>
            <h3>{current.title}</h3>
            <p>{current.text}</p>
          </div>

          <ul className={styles.featureList}>
            {current.features.map((feat) => (
              <li key={feat}>{feat}</li>
            ))}
          </ul>
        </div>

        {/* Visual bar — key stats */}
        <div className={styles.statBar}>
          <div>
            <strong>R35k</strong>
            <span>Website value</span>
          </div>
          <div>
            <strong>R0</strong>
            <span>Monthly fee</span>
          </div>
          <div>
            <strong>3 clicks</strong>
            <span>Parent checkout</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>Always online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
