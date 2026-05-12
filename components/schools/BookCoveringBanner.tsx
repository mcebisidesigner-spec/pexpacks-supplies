import Image from "next/image";
import styles from "./Schools.module.css";
import { Button } from "@/components/ui/Button";

export function BookCoveringBanner() {
  return (
    <section className={styles.bookCoveringBanner} aria-labelledby="book-covering-heading">
      <div className={styles.bookCoveringInner}>
        <div className={styles.bookCoveringContent}>
          <p className={styles.bookCoveringEyebrow}>Premium Add-on</p>
          <h2 id="book-covering-heading">Hate covering books? We'll do it for you.</h2>
          <p className={styles.bookCoveringLead}>
            Skip the late-night plastic wrap battles. Add our <strong>Full Preparation Service</strong> at checkout and receive your pack 100% classroom-ready.
          </p>
          <ul className={styles.bookCoveringList}>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Heavy-duty plastic book covering</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Personalised name labels on every item</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Color-coded subject labels</span>
            </li>
          </ul>
          <div className={styles.bookCoveringActions}>
            <Button href="/blog/what-is-pexcover-book-covering" variant="white">
              Learn about Pexcover
            </Button>
          </div>
        </div>
        <div className={styles.bookCoveringVisual}>
          <div className={styles.visualBadge}>Saves you 5+ hours!</div>
          <Image 
            src="/images/unboxing-G7.webp" 
            alt="Perfectly covered school books" 
            fill 
            className={styles.bookCoveringImage}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
