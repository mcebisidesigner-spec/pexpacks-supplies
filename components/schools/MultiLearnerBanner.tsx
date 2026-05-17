import styles from "./Schools.module.css";

export function MultiLearnerBanner() {
  return (
    <div className={styles.multiLearnerBanner}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <div>
        <strong>Ordering for more than one child?</strong>
        <span>
          {" "}Get 5% off when you order 2 or more packs from the same school.
        </span>
      </div>
    </div>
  );
}
