import styles from "./Marketing.module.css";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  text?: string;
  centered?: boolean;
};

export function SectionHeader({ eyebrow, title, text, centered = false }: SectionHeaderProps) {
  return (
    <div className={centered ? styles.sectionHeaderCentered : styles.sectionHeader}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
