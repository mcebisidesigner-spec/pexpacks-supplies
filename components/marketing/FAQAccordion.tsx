import type { FAQ } from "@/data/faqs";
import styles from "./Marketing.module.css";

export function FAQAccordion({ items }: { items: FAQ[] }) {
  return (
    <div className={styles.faqList}>
      {items.map((item, index) => (
        <details className={styles.faqItem} key={item.id} open={index === 0}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
