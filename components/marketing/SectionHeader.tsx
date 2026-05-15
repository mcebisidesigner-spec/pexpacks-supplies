import styles from "./SectionHeader.module.css";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  text?: string;
  headingId?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  text,
  headingId,
}: SectionHeaderProps) {
  return (
    <div className={styles.sectionHeader}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h2 id={headingId}>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
