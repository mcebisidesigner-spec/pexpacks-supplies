import Link from "next/link";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import styles from "./ConciergeSection.module.css";

const WHATSAPP_LINK = "https://wa.me/27791234567?text=Hi%20Pexpacks%2C%20I%20want%20to%20send%20my%20school%20stationery%20list%20for%20packing.";

export function ConciergeSection() {
  return (
    <section className={sectionStyles.section} aria-labelledby="concierge-heading">
      <div className={sectionStyles.inner}>
        <div className={styles.panel}>
          <div className={styles.copy}>
            <p className={sectionStyles.sectionEyebrow}>Edge case? Covered.</p>
            <h2 id="concierge-heading">
              Don&rsquo;t see your school?
              <br />
              <span className={styles.highlight}>We&rsquo;ll pack it anyway.</span>
            </h2>
            <p className={styles.lead}>
              If your school isn&rsquo;t listed yet, no problem. Upload or WhatsApp us your
              school&rsquo;s stationery list and we&rsquo;ll pack every item — exactly as
              specified, with the same 100% match guarantee.
            </p>
            <div className={styles.actionRow}>
              <Link href="/order" className={styles.uploadBtn}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.btnIcon}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Your School List
              </Link>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.btnIcon}>
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  <path d="M16 16s-1.5 1-4 1-4-1-4-1" />
                </svg>
                WhatsApp Us Your List
              </a>
            </div>
          </div>
          <div className={styles.visual}>
            <div className={styles.visualIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
                <path d="M3 9h18" />
                <path d="M3 15h18" />
                <path d="M15 3v18" />
              </svg>
            </div>
            <div className={styles.visualGrid}>
              {[
                "Upload your list",
                "We pack every item",
                "100% match guarantee",
                "Delivered to you",
              ].map((item, idx) => (
                <span key={idx} className={styles.visualChip}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className={styles.schoolLink}>
          <Link href="/add-your-school">
            Is your school not listed? Let us know <span aria-hidden="true">&rarr;</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
