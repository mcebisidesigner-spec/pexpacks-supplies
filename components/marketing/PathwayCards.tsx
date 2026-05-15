import Link from "next/link";
import type { MainCategory } from "@/data/packs";
import { mainCategories } from "@/data/packs";
import styles from "./Marketing.module.css";

function CategoryIcon({ icon }: { icon: MainCategory["icon"] }) {
  return (
    <span className={styles.iconBadge} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {icon === "school" ? (
          <path d="M4 10.2 12 6l8 4.2-8 4.2-8-4.2Zm3 2.5v4.2c1.4 1 3 1.5 5 1.5s3.6-.5 5-1.5v-4.2" />
        ) : null}
        {icon === "office" ? (
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m-9 4.5h12M5 7h14v11H5V7Z" />
        ) : null}
        {icon === "package" ? (
          <path d="m12 3.8 7 3.7v8.8l-7 3.9-7-3.9V7.5l7-3.7Zm0 0 7 3.7-7 3.8-7-3.8m7 3.8v8.9" />
        ) : null}
      </svg>
    </span>
  );
}

export function PathwayCards() {
  return (
    <div className={styles.gridThree}>
      {mainCategories.map((category) => (
        <Link
          className={styles.pathCard}
          href={category.href}
          key={category.title}
        >
          <div>
            <CategoryIcon icon={category.icon} />
            <h3>{category.title}</h3>
            <p>{category.description}</p>
          </div>
          <span className={styles.cardLink}>{category.cta}</span>
        </Link>
      ))}
    </div>
  );
}
