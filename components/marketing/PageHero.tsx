import type { ReactNode } from "react";
import styles from "./HeroBase.module.css";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  text?: string;
  panelTitle?: string;
  panelText?: string;
  panelChildren?: ReactNode;
  children?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  text,
  panelTitle,
  panelText,
  panelChildren,
  children,
}: PageHeroProps) {
  return (
    <section className={styles.pageHero}>
      <div className={styles.pageHeroInner}>
        <div className={styles.pageHeroCompact}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.pageTitle}>{title}</h1>
          {text ? <p className={styles.pageLead}>{text}</p> : null}
          {children}
        </div>
        {panelChildren || panelTitle || panelText ? (
          <aside className={styles.heroPanel} aria-label={`${eyebrow} summary`}>
            {panelChildren || (
              <>
                {panelText ? <p>{panelText}</p> : null}
                {panelTitle ? <strong>{panelTitle}</strong> : null}
              </>
            )}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
