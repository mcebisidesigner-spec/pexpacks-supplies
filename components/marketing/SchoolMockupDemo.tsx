"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import styles from "./SchoolMockupDemo.module.css";

type DemoView = "home" | "portal" | "updates";
type FeatureKey = "brand" | "orders" | "documents" | "rebates";

const views: Array<{ key: DemoView; label: string }> = [
  { key: "home", label: "School website" },
  { key: "portal", label: "Parent portal" },
  { key: "updates", label: "News desk" },
];

const featureContent: Record<
  FeatureKey,
  {
    title: string;
    body: string;
    metric: string;
    label: string;
  }
> = {
  brand: {
    title: "Built around the school's real identity",
    body: "Colours, crest, motto, leadership messages, admissions copy, and contact details are tailored for each partner school.",
    metric: "Custom domain, SSL, hosting",
    label: "Brand and website",
  },
  orders: {
    title: "Parents order correct stationery packs fast",
    body: "Each grade has its own stationery list, pack price, add-ons, and collection or delivery options without school admin chasing forms.",
    metric: "Grade packs in 3 clicks",
    label: "Stationery portal",
  },
  documents: {
    title: "Documents stay easy to find",
    body: "Prospectus files, policies, calendars, newsletters, and forms can be published in one mobile-friendly school hub.",
    metric: "Downloads, calendars, notices",
    label: "School documents",
  },
  rebates: {
    title: "Partnership value stays visible",
    body: "The site can show parent convenience, order progress, and the school development-fund value created by the stationery partnership.",
    metric: "Annual rebate reporting",
    label: "Partner reporting",
  },
};

const quickLinks = [
  "Admissions",
  "Calendar",
  "Stationery Packs",
  "Newsletters",
];

const newsItems = [
  {
    tag: "Academics",
    title: "Term 2 assessment calendar published",
    body: "Families can download grade-specific timetables and preparation notes.",
  },
  {
    tag: "Development Fund",
    title: "New reading corner opened",
    body: "Partner rebates helped refresh the junior phase library space.",
  },
];

export function SchoolMockupDemo() {
  const [activeView, setActiveView] = useState<DemoView>("home");
  const [activeFeature, setActiveFeature] = useState<FeatureKey>("orders");

  const feature = featureContent[activeFeature];
  const previewTitle = useMemo(() => {
    if (activeView === "portal") {
      return "Parent Stationery Portal";
    }

    if (activeView === "updates") {
      return "School News and Events";
    }

    return "Greenwood Academy";
  }, [activeView]);

  return (
    <section className={styles.container} aria-label="Interactive partner website demo">
      <div className={styles.demoShell}>
        <aside className={styles.controlPanel}>
          <div>
            <p className={styles.eyebrow}>Live school partner preview</p>
            <h2>Show the exact value every school receives</h2>
            <p>
              Switch between the school website, parent ordering portal, and update desk.
              Each view shows how Pexpacks can turn a school partnership into a
              polished public website parents can actually use on mobile.
            </p>
          </div>

          <div className={styles.segmentedControl} aria-label="Choose demo view">
            {views.map((view) => (
              <button
                className={`${styles.segmentButton} ${
                  activeView === view.key ? styles.segmentButtonActive : ""
                }`}
                key={view.key}
                type="button"
                onClick={() => setActiveView(view.key)}
              >
                {view.label}
              </button>
            ))}
          </div>

          <div className={styles.featureButtons} aria-label="Choose partner feature">
            {(Object.keys(featureContent) as FeatureKey[]).map((key) => (
              <button
                className={`${styles.featureButton} ${
                  activeFeature === key ? styles.featureButtonActive : ""
                }`}
                key={key}
                type="button"
                onClick={() => setActiveFeature(key)}
              >
                <span>{featureContent[key].label}</span>
              </button>
            ))}
          </div>

          <div className={styles.featureReadout} aria-live="polite">
            <span>{feature.metric}</span>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </div>
        </aside>

        <div className={styles.demoStage}>
          <div className={styles.browserFrame}>
            <div className={styles.browserChrome} aria-hidden="true">
              <div className={styles.browserDots}>
                <span />
                <span />
                <span />
              </div>
              <div className={styles.addressBar}>
                greenwoodacademy.co.za/{activeView === "home" ? "" : activeView}
              </div>
            </div>

            <div className={styles.schoolSite}>
              <header className={styles.schoolHeader}>
                <a className={styles.schoolBrand} href="#partner-form">
                  <Image
                    src="/images/greenwood-academy-crest.svg"
                    alt="Greenwood Academy crest"
                    width={50}
                    height={50}
                  />
                  <span>
                    <strong>Greenwood Academy</strong>
                    <small>Learn. Lead. Serve.</small>
                  </span>
                </a>
                <nav className={styles.schoolNav} aria-label="Demo school navigation">
                  <button type="button" onClick={() => setActiveView("home")}>
                    Home
                  </button>
                  <button type="button" onClick={() => setActiveView("updates")}>
                    News
                  </button>
                  <button type="button" onClick={() => setActiveView("portal")}>
                    Order Packs
                  </button>
                </nav>
              </header>

              <main className={styles.siteContent}>
                <section className={styles.heroPanel}>
                  <div>
                    <p className={styles.schoolEyebrow}>{previewTitle}</p>
                    <h3>
                      {activeView === "portal"
                        ? "Grade stationery packs ready for parents"
                        : activeView === "updates"
                          ? "A central notice board for the whole school"
                          : "A premium school website, hosted and maintained for free"}
                    </h3>
                    <p>
                      {activeView === "portal"
                        ? "Parents choose a grade, confirm approved list items, and check out without school staff handling manual orders."
                        : activeView === "updates"
                          ? "Publish events, term dates, policies, and newsletters in a format families can scan quickly from any phone."
                          : "A custom school site with a proper crest, admissions content, documents, news, and a built-in stationery ordering path."}
                    </p>
                    <div className={styles.heroActions}>
                      <button type="button" onClick={() => setActiveView("portal")}>
                        View parent portal
                      </button>
                      <button type="button" onClick={() => setActiveFeature("brand")}>
                        See website value
                      </button>
                    </div>
                  </div>

                  <div className={styles.statStack}>
                    <div>
                      <span>R35k</span>
                      <small>Website value</small>
                    </div>
                    <div>
                      <span>0</span>
                      <small>Monthly hosting fee</small>
                    </div>
                    <div>
                      <span>24/7</span>
                      <small>Parent access</small>
                    </div>
                  </div>
                </section>

                <section className={styles.quickAccess} aria-label="Demo school quick links">
                  {quickLinks.map((link) => (
                    <button
                      key={link}
                      type="button"
                      onClick={() =>
                        setActiveFeature(link === "Stationery Packs" ? "orders" : "documents")
                      }
                    >
                      {link}
                    </button>
                  ))}
                </section>

                {activeView === "portal" ? (
                  <section className={styles.portalGrid}>
                    <div className={styles.gradePicker}>
                      <p className={styles.panelLabel}>Choose a grade</p>
                      {["Grade R", "Grade 1", "Grade 4", "Grade 7"].map((grade) => (
                        <button key={grade} type="button">
                          <span>{grade}</span>
                          <small>Approved 2026 pack</small>
                        </button>
                      ))}
                    </div>
                    <div className={styles.orderSummary}>
                      <p className={styles.panelLabel}>Pack summary</p>
                      <h4>Grade 4 Essential Pack</h4>
                      <ul>
                        <li>Exercise books and covers</li>
                        <li>Writing tools and stationery basics</li>
                        <li>Optional Pexcover protection</li>
                      </ul>
                      <button type="button">Continue order</button>
                    </div>
                  </section>
                ) : activeView === "updates" ? (
                  <section className={styles.newsGrid}>
                    {newsItems.map((item) => (
                      <article key={item.title}>
                        <span>{item.tag}</span>
                        <h4>{item.title}</h4>
                        <p>{item.body}</p>
                      </article>
                    ))}
                    <div className={styles.eventPanel}>
                      <p className={styles.panelLabel}>Next events</p>
                      <div>
                        <strong>24 May</strong>
                        <span>Parent evening in the school hall</span>
                      </div>
                      <div>
                        <strong>02 Jun</strong>
                        <span>Winter sport fixtures published</span>
                      </div>
                    </div>
                  </section>
                ) : (
                  <section className={styles.homeGrid}>
                    <article>
                      <span>Admissions</span>
                      <h4>Open day bookings</h4>
                      <p>Prospective families can enquire, download forms, and request a school tour.</p>
                    </article>
                    <article>
                      <span>Documents</span>
                      <h4>One document hub</h4>
                      <p>Policies, calendars, supply lists, and newsletters remain easy to find.</p>
                    </article>
                    <article>
                      <span>Parents</span>
                      <h4>Stationery ordering</h4>
                      <p>Approved packs connect directly to the Pexpacks fulfilment workflow.</p>
                    </article>
                  </section>
                )}
              </main>
            </div>
          </div>

          <div className={styles.mobilePreview} aria-label="Mobile preview">
            <div className={styles.phoneFrame}>
              <div className={styles.phoneTop} />
              <div className={styles.phoneContent}>
                <Image
                  src="/images/greenwood-academy-crest.svg"
                  alt=""
                  width={62}
                  height={62}
                  aria-hidden="true"
                />
                <strong>Greenwood Academy</strong>
                <span>Parent portal</span>
                <button type="button" onClick={() => setActiveView("portal")}>
                  Order Grade Packs
                </button>
                <small>Mobile-first pages for parents on the move.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
