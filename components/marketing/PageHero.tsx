import type { ReactNode } from "react";
import styles from "./HeroBase.module.css";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  text?: string;
  panelTitle?: string;
  panelText?: string;
  panelChildren?: ReactNode;
  panelClassName?: string;
  children?: ReactNode;
  variant?: "default" | "navy";
};

export function PageHero({
  eyebrow,
  title,
  text,
  panelTitle,
  panelText,
  panelChildren,
  panelClassName,
  children,
  variant = "default",
}: PageHeroProps) {
  return (
    <section className={variant === "navy" ? styles.heroNavy : styles.pageHero}>
      <div className={styles.pageHeroInner}>
        <div className={styles.pageHeroCompact}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.pageTitle}>{title}</h1>
          {text ? <p className={styles.pageLead}>{text}</p> : null}
          {children}
        </div>
        {panelChildren || panelTitle || panelText ? (
          <aside
            className={[styles.heroPanel, panelClassName]
              .filter(Boolean)
              .join(" ")}
            aria-label={`${eyebrow} summary`}
          >
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
