import Link from "next/link";
import styles from "./InteractiveDemoSection.module.css";

const demoSite = {
  title: "Primrose Hill Primary School Demo",
  schoolName: "Primrose Hill Primary School",
  url: "https://primrosehillprimary.co.za",
  displayUrl: "primrosehillprimary.co.za",
  description:
    "Preview a real school website experience with school updates, parent information, newsletters, events, contact details and a mobile-friendly structure.",
};

const demoFeatures = [
  "Home",
  "About",
  "Academics",
  "Events",
  "Newsletter",
];

const proofPoints = [
  "Principal welcome note",
  "Vision and mission",
  "Updates and events",
  "Newsletter area",
  "Gallery",
  "Quick links",
  "Contact and location",
];

const benefits = [
  {
    title: "Custom School Website",
    text: "A website designed around your school's identity, communication needs and parent community.",
    icon: "monitor",
  },
  {
    title: "Mobile-Ready Design",
    text: "Parents can access key information easily from phones, tablets and desktops.",
    icon: "phone",
  },
  {
    title: "Parent Communication",
    text: "Share newsletters, events, announcements and school updates in one central place.",
    icon: "message",
  },
  {
    title: "Hosting & Support",
    text: "Reliable hosting and ongoing support to keep the school's website active and professional.",
    icon: "support",
  },
];

function DemoIcon({ name }: { name: string }) {
  if (name === "phone") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="7" y="2.75" width="10" height="18.5" rx="2.5" />
        <path d="M10 18.25h4" />
      </svg>
    );
  }

  if (name === "message") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 6.75A3.25 3.25 0 0 1 7.25 3.5h9.5A3.25 3.25 0 0 1 20 6.75v5.5a3.25 3.25 0 0 1-3.25 3.25H12l-4.5 4v-4h-.25A3.25 3.25 0 0 1 4 12.25v-5.5Z" />
        <path d="M8 8h8M8 11h5.5" />
      </svg>
    );
  }

  if (name === "support") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 3.25 18.5 6v5.25c0 4.1-2.6 7.85-6.5 9.5-3.9-1.65-6.5-5.4-6.5-9.5V6L12 3.25Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="4.5" width="17" height="11" rx="2" />
      <path d="M8.5 20h7M12 15.5V20" />
    </svg>
  );
}

export function InteractiveDemoSection() {
  return (
    <section className={styles.section} id="interactive-demo" aria-labelledby="interactive-demo-heading">
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Interactive Demo</p>
          <h2 id="interactive-demo-heading">
            See What Your School Website Could Look Like
          </h2>
          <p>
            Explore a live school website demo and see how Pexpacks can help
            schools create a professional digital presence for parents,
            learners, staff and the wider community.
          </p>
        </div>

        <div className={styles.demoGrid}>
          <div className={styles.contentColumn}>
            <div className={styles.messageCard}>
              <span className={styles.liveBadge}>
                <span aria-hidden="true" />
                Live school website demo
              </span>
              <h3>A modern school website, built for everyday communication</h3>
              <p>
                From school updates and newsletters to contact details,
                galleries and parent communication, we help schools become
                easier to find, easier to trust and easier to engage with
                online.
              </p>
              <div className={styles.proofGrid} aria-label="Demo website features">
                {proofPoints.map((point) => (
                  <span key={point}>{point}</span>
                ))}
              </div>
            </div>

            <div className={styles.benefitGrid}>
              {benefits.map((benefit) => (
                <article className={styles.benefitCard} key={benefit.title}>
                  <span className={styles.benefitIcon}>
                    <DemoIcon name={benefit.icon} />
                  </span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className={styles.demoCard} aria-label="Primrose Hill Primary School live demo">
            <div className={styles.browserFrame}>
              <div className={styles.browserTop}>
                <span className={styles.browserDots} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span className={styles.urlPill}>{demoSite.displayUrl}</span>
              </div>

              <a
                className={styles.previewArea}
                href={demoSite.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Primrose Hill Primary School live demo website in a new tab"
              >
                <div className={styles.previewHero}>
                  <span className={styles.previewBadge}>Live Demo</span>
                  <h3>{demoSite.schoolName}</h3>
                  <p>Building a better world one learner at a time.</p>
                </div>
                <nav className={styles.previewNav} aria-label="Demo preview navigation">
                  {demoFeatures.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </nav>
                <div className={styles.previewBody}>
                  <div className={styles.previewPanel}>
                    <span>Updates</span>
                    <strong>Events, notices and school news</strong>
                  </div>
                  <div className={styles.previewPanel}>
                    <span>Newsletter</span>
                    <strong>Parent communication in one place</strong>
                  </div>
                  <div className={styles.previewPanel}>
                    <span>Contact</span>
                    <strong>Location, phone and email visibility</strong>
                  </div>
                </div>
              </a>
            </div>

            <div className={styles.demoCardBody}>
              <div>
                <h3>{demoSite.title}</h3>
                <p>{demoSite.description}</p>
              </div>
              <div className={styles.demoActions}>
                <a
                  className={styles.primaryLink}
                  href={demoSite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Primrose Hill Primary School live demo website in a new tab"
                >
                  View Live Demo
                  <span aria-hidden="true">-&gt;</span>
                </a>
                <Link className={styles.secondaryLink} href="#partner-form">
                  Request a School Website
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <div className={styles.ctaCard}>
          <div>
            <p className={styles.ctaEyebrow}>Website, hosting and support</p>
            <h3>Ready to give your school a stronger online presence?</h3>
            <p>
              Partner with Pexpacks and let us help your school create a clean,
              modern and parent-friendly website.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link className={styles.ctaPrimary} href="#partner-form">
              Request a School Website Demo
              <span aria-hidden="true">-&gt;</span>
            </Link>
            <a
              className={styles.ctaSecondary}
              href={demoSite.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Primrose Hill Primary School live demo website in a new tab"
            >
              View Live Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
