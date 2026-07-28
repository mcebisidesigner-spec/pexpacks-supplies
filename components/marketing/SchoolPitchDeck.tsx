"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import styles from "./SchoolPitchDeck.module.css";
import { Button } from "@/components/ui/Button";

type SlideId = "overview" | "website" | "calculator" | "parents" | "roadmap";

interface SlideInfo {
  id: SlideId;
  label: string;
}

const slides: SlideInfo[] = [
  { id: "overview", label: "Partnership Overview" },
  { id: "website", label: "Free Website & Hosting" },
  { id: "calculator", label: "Value Calculator" },
  { id: "parents", label: "Parent Convenience" },
  { id: "roadmap", label: "Launch Roadmap" },
];

const journeyTabsData = [
  {
    label: "Accuracy",
    title: "100% Grade List Accuracy",
    text: "Stationery bundles are packed specifically according to the official lists verified by your school. Parents never buy the wrong items.",
  },
  {
    label: "Checkout",
    title: "Instant 3-Click Checkout",
    text: "Smooth buying experience with Card, Instant EFT, and WhatsApp ordering capabilities. No queues, no retail hopping.",
  },
  {
    label: "Delivery",
    title: "Direct & Organised Delivery",
    text: "Choose direct-to-home delivery or a bulk drop-off directly to the school at the start of the year.",
  },
];

export function SchoolPitchDeck() {
  const [activeSlide, setActiveSlide] = useState<SlideId>("overview");
  const [, startTransition] = useTransition();
  const [activeJourneyTab, setActiveJourneyTab] = useState(0);

  // Calculator state
  const [enrollment, setEnrollment] = useState<number>(600);
  const [adoption, setAdoption] = useState<number>(70);

  // Derived calculations
  const averagePackCost = 850;
  const rebateRate = 0.05;
  const hourlyRate = 160;

  const estimatedPacks = Math.round(enrollment * (adoption / 100));
  const annualRebate = estimatedPacks * averagePackCost * rebateRate;
  const adminHoursSaved = estimatedPacks * 0.5;
  const websiteHostingSaving = 35000;
  const adminLaborSaving = adminHoursSaved * hourlyRate;
  const totalValue = annualRebate + websiteHostingSaving + adminLaborSaving;

  const currentIndex = slides.findIndex((s) => s.id === activeSlide);
  const progress = ((currentIndex + 1) / slides.length) * 100;

  const handleSlideChange = (id: SlideId) => {
    startTransition(() => {
      setActiveSlide(id);
    });
  };

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      handleSlideChange(slides[currentIndex + 1].id);
    } else {
      handleSlideChange(slides[0].id);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      handleSlideChange(slides[currentIndex - 1].id);
    } else {
      handleSlideChange(slides[slides.length - 1].id);
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-ZA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const fmtCurrency = (n: number) =>
    n.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className={styles.deck} id="pitch-presentation">
      {/* ── Top bar ── */}
      <div className={styles.deckTopbar}>
        <div>
          <p>School Partnership</p>
          <strong>{slides[currentIndex].label}</strong>
        </div>
        <div className={styles.progressTrack}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.slideCount}>
          {currentIndex + 1} / {slides.length}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className={styles.deckGrid}>
        {/* Slide navigation */}
        <nav className={styles.slideNav}>
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              className={clsx(styles.slideNavButton, activeSlide === slide.id && styles.slideNavButtonActive)}
              onClick={() => handleSlideChange(slide.id)}
            >
              <span>0{idx + 1}</span>
              {slide.label}
            </button>
          ))}
        </nav>

        {/* ── SLIDE 1: OVERVIEW ── */}
        {activeSlide === "overview" && (
          <div className={styles.slidePanel}>
            <div className={styles.slideCopy}>
              <p className={styles.slideEyebrow}>School program</p>
              <h3>Modern School Web Design &amp; Free Hosting</h3>
              <p>
                Elevate your school&apos;s digital presence and streamline
                stationery list ordering. We design, host, and maintain a
                professional school site completely free of charge.
              </p>
              <ul>
                <li>Custom domain and SSL certificate included</li>
                <li>Parent stationery portal with 3-click ordering</li>
                <li>5% annual development fund rebate on pack sales</li>
                <li>Zero setup, license, or monthly fees</li>
              </ul>
            </div>
            <div className={styles.slideVisual}>
              <div className={styles.metricSpotlight}>
                <span>R35k</span>
                <small>
                  Web development &amp; hosting package value per year
                </small>
              </div>
              <div className={styles.metricSpotlight}>
                <span>R0</span>
                <small>Setup, license, or monthly school fees</small>
              </div>
              <div className={styles.metricSpotlight}>
                <span>5%</span>
                <small>Annual development rebate on all packs sold</small>
              </div>
            </div>
          </div>
        )}

        {/* ── SLIDE 2: WEBSITE FEATURES ── */}
        {activeSlide === "website" && (
          <div className={styles.slidePanel}>
            <div className={styles.slideCopy}>
              <p className={styles.slideEyebrow}>Free website</p>
              <h3>Everything Your School Needs Online</h3>
              <p>
                We handle the design, server management, security, and updates.
                You get a modern online hub customised for your brand, badges,
                and school identity.
              </p>
              <ul>
                <li>Custom domain connection (yourschool.co.za)</li>
                <li>Prospectus, newsletters, and document hub</li>
                <li>Integrated parent stationery portal</li>
                <li>News board, term dates, and event updates</li>
              </ul>
            </div>
            <div className={styles.slideVisual}>
              <div className={styles.previewStack}>
                <div>
                  <span>Domain &amp; Hosting</span>
                  <strong>
                    Custom domain with premium SSL certificate and hosting
                    included free
                  </strong>
                </div>
                <div>
                  <span>Prospectus &amp; News Hub</span>
                  <strong>
                    Term dates, events, newsletters, and supply lists in one
                    place
                  </strong>
                </div>
                <div>
                  <span>Parent Portal</span>
                  <strong>
                    Stationery ordering with secure payment channels configured
                    per grade
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SLIDE 3: VALUE CALCULATOR ── */}
        {activeSlide === "calculator" && (
          <div className={styles.slidePanel}>
            <div className={styles.slideCopy}>
              <p className={styles.slideEyebrow}>See the value</p>
              <h3>Calculate Your School Benefits</h3>
              <p>
                Adjust the sliders to estimate your school&apos;s annual
                rebates, admin hours saved, and overall partnership value.
              </p>
              <ul>
                <li>Based on average pack value of R850</li>
                <li>5% development rebate structure</li>
                <li>Admin labour valued at R160/hour</li>
              </ul>
            </div>
            <div className={styles.slideVisual}>
              <div className={styles.calculator}>
                <label>
                  <span>School Enrollment</span>
                  <strong>{enrollment} students</strong>
                  <input
                    id="school-pitch-enrollment"
                    name="enrollment"
                    type="range"
                    min="100"
                    max="1500"
                    step="50"
                    value={enrollment}
                    onChange={(e) => setEnrollment(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  <span>Pack Adoption Rate</span>
                  <strong>{adoption}%</strong>
                  <input
                    id="school-pitch-adoption"
                    name="adoption"
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={adoption}
                    onChange={(e) => setAdoption(parseInt(e.target.value))}
                  />
                </label>
              </div>
              <div className={styles.valueGrid}>
                <div>
                  <span>Annual Rebate</span>
                  <strong>R {fmtCurrency(annualRebate)}</strong>
                </div>
                <div>
                  <span>Free Website &amp; Hosting Value</span>
                  <strong>R {fmt(websiteHostingSaving)}</strong>
                </div>
                <div>
                  <span>Admin Labour Saved</span>
                  <strong>{fmt(adminHoursSaved)} hrs</strong>
                </div>
                <div className={styles.totalValue}>
                  <span>Total Projected Partner Value</span>
                  <strong>R {fmt(totalValue)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SLIDE 4: PARENT CONVENIENCE ── */}
        {activeSlide === "parents" && (
          <div className={styles.slidePanel}>
            <div className={styles.slideCopy}>
              <p className={styles.slideEyebrow}>Parent perk</p>
              <h3>Parents Buy Correct Grade Packs Fast</h3>
              <p>
                No retail hopping or long queues in January. Parents get exactly
                what teachers require for the academic year, delivered to their
                door or the school gate.
              </p>
              <ul>
                <li>100% grade list accuracy verified by schools</li>
                <li>Card, Instant EFT, and WhatsApp ordering</li>
                <li>Home delivery or bulk school drop-off</li>
              </ul>
            </div>
            <div className={styles.slideVisual}>
              <div className={styles.journeyCard}>
                <div className={styles.journeyTabs}>
                  {journeyTabsData.map((tab, idx) => (
                    <button
                      key={tab.label}
                      className={
                        activeJourneyTab === idx
                          ? styles.journeyTabActive
                          : undefined
                      }
                      onClick={() => setActiveJourneyTab(idx)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <h4>{journeyTabsData[activeJourneyTab].title}</h4>
                <p>{journeyTabsData[activeJourneyTab].text}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── SLIDE 5: ROADMAP ── */}
        {activeSlide === "roadmap" && (
          <div className={styles.slidePanel}>
            <div className={styles.slideCopy}>
              <p className={styles.slideEyebrow}>Quick setup</p>
              <h3>How We Launch Your Portal</h3>
              <p>
                Our team does the heavy lifting, taking you from request to live
                portal in days, not months.
              </p>
              <ul>
                <li>No heavy IT project required</li>
                <li>Pexpacks handles design and deployment</li>
                <li>Parents order from day one</li>
              </ul>
            </div>
            <div className={styles.slideVisual}>
              <div className={styles.launchFlow}>
                <div>
                  <span>1</span>
                  <strong>
                    Submit your school details via the enquiry form
                  </strong>
                </div>
                <div>
                  <span>2</span>
                  <strong>
                    Share grade stationery lists for digitisation
                  </strong>
                </div>
                <div>
                  <span>3</span>
                  <strong>We build the website and parent portal</strong>
                </div>
                <div>
                  <span>4</span>
                  <strong>
                    Parents order hassle-free, school earns rebates
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom controls ── */}
      <div className={styles.deckControls}>
        <button className={styles.deckNavButton} onClick={prevSlide}>
          ← Previous
        </button>
        <Button href="#partner-form" variant="primary">
          Apply Today
        </Button>
        <button className={styles.deckNavButton} onClick={nextSlide}>
          Next →
        </button>
      </div>
    </div>
  );
}
