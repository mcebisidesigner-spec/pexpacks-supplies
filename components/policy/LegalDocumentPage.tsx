import type { ReactNode } from "react";
import { PageHero } from "@/components/marketing/PageHero";
import page from "@/styles/Page.module.css";
import { PolicyContentBar } from "./PolicyContentBar";
import styles from "./LegalDocumentPage.module.css";

export type LegalDocumentHighlightTone = "default" | "accent" | "warning";

export type LegalDocumentHighlight = {
  title: string;
  content: ReactNode;
  tone?: LegalDocumentHighlightTone;
};

export type LegalDocumentSection = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  content: ReactNode;
};

export type LegalDocumentConfig = {
  route: string;
  pageTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroText: string;
  heroPanelTitle: string;
  heroPanelText: string;
  tocHeading: string;
  tocAriaLabel: string;
  summaryKicker: string;
  summaryTitle: string;
  summaryText: string;
  highlights?: LegalDocumentHighlight[];
  sections: LegalDocumentSection[];
  notice?: ReactNode;
};

function highlightToneClass(tone: LegalDocumentHighlightTone | undefined) {
  if (tone === "accent") {
    return styles.highlightCardAccent;
  }

  if (tone === "warning") {
    return styles.highlightCardWarning;
  }

  return "";
}

export function LegalDocumentPage({
  heroEyebrow,
  heroTitle,
  heroText,
  heroPanelTitle,
  heroPanelText,
  tocHeading,
  tocAriaLabel,
  summaryKicker,
  summaryTitle,
  summaryText,
  highlights = [],
  sections,
  notice,
}: LegalDocumentConfig) {
  const topics = sections.map(({ id, title }) => ({ id, title }));
  const headingId = `${tocHeading.toLowerCase().replace(/\s+/g, "-")}-title`;

  return (
    <>
      <PageHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        text={heroText}
        panelTitle={heroPanelTitle}
        panelText={heroPanelText}
      />

      <section className={`${page.section} ${styles.documentSection}`}>
        <div className={`${page.sectionInner} ${styles.documentInner}`}>
          <PolicyContentBar
            ariaLabel={tocAriaLabel}
            classNames={{
              tocCard: styles.tocCard,
              tocEyebrow: styles.tocEyebrow,
              tocShell: styles.tocShell,
            }}
            heading={tocHeading}
            headingId={headingId}
            topics={topics}
          />

          <div className={styles.documentContent}>
            <div className={styles.summaryPanel}>
              <p className={styles.summaryKicker}>{summaryKicker}</p>
              <h2>{summaryTitle}</h2>
              <p className={styles.summaryText}>{summaryText}</p>
              {highlights.length > 0 ? (
                <div className={styles.highlightGrid}>
                  {highlights.map((highlight) => (
                    <div
                      className={`${styles.highlightCard} ${highlightToneClass(
                        highlight.tone
                      )}`.trim()}
                      key={highlight.title}
                    >
                      <strong>{highlight.title}</strong>
                      <span>{highlight.content}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {sections.map((section) => (
              <article className={styles.documentCard} id={section.id} key={section.id}>
                <div className={styles.sectionHeader}>
                  <p>{section.eyebrow}</p>
                  <h2>{section.title}</h2>
                  <span>{section.summary}</span>
                </div>
                <div className={styles.sectionBody}>{section.content}</div>
              </article>
            ))}

            {notice ? (
              <aside className={styles.noticePanel}>
                <p className={styles.noticeEyebrow}>Important note</p>
                <div>{notice}</div>
              </aside>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
