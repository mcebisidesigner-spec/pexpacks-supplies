import type { ReactNode } from "react";
import styles from "./HeroBase.module.css";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  text: string;
  panelTitle?: string;
  panelText?: string;
  panelImage?: string;
  panelChildren?: ReactNode;
  children?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  text,
  panelTitle,
  panelText,
  panelImage,
  panelChildren,
  children,
}: PageHeroProps) {
  return (
    <section className={styles.pageHero}>
      <div className={styles.pageHeroInner}>
        <div className={styles.pageHeroCompact}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.pageTitle}>{title}</h1>
          <p className={styles.pageLead}>{text}</p>
          {children}
        </div>
        {panelChildren || panelTitle || panelText || panelImage ? (
          <aside className={styles.heroPanel} aria-label={`${eyebrow} summary`}>
            {panelChildren || (
              <div className={styles.heroPanelContent}>
                <div className={styles.heroPanelText}>
                  {panelText ? <p>{panelText}</p> : null}
                  {panelTitle ? <strong>{panelTitle}</strong> : null}
                </div>
                {panelImage ? (
                  <div className={styles.heroPanelImage}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={panelImage} alt="School Logo" width={72} height={72} />
                  </div>
                ) : null}
              </div>
            )}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
