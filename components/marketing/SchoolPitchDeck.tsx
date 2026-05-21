"use client";

import { useState, useTransition } from "react";
import styles from "./SchoolPitchDeck.module.css";
import { Button } from "@/components/ui/Button";

type SlideId = "overview" | "website" | "calculator" | "parents" | "roadmap";

interface SlideInfo {
  id: SlideId;
  label: string;
  title: string;
}

const slides: SlideInfo[] = [
  { id: "overview", label: "Partnership Overview", title: "Free Modern School Website & Easy Stationery" },
  { id: "website", label: "Free Website & Hosting", title: "Complete Managed Digital Presence" },
  { id: "calculator", label: "Value Calculator", title: "Interactive Rebate & Savings Calculator" },
  { id: "parents", label: "Parent Convenience", title: "Zero Admin Stationery Ordering" },
  { id: "roadmap", label: "Launch Roadmap", title: "Launch in 4 Simple Steps" },
];

export function SchoolPitchDeck() {
  const [activeSlide, setActiveSlide] = useState<SlideId>("overview");
  const [, startTransition] = useTransition();

  // Calculator State
  const [enrollment, setEnrollment] = useState<number>(600);
  const [adoption, setAdoption] = useState<number>(70);

  // Derived Calculations
  const averagePackCost = 850; // ZAR
  const rebateRate = 0.05; // 5%
  const hourlyRate = 160; // ZAR/hr value of admin labor
  
  const estimatedPacks = Math.round(enrollment * (adoption / 100));
  const annualRebate = estimatedPacks * averagePackCost * rebateRate;
  const adminHoursSaved = estimatedPacks * 0.5; // 30 mins per pack
  const websiteHostingSaving = 35000; // R35k standard web package value
  const adminLaborSaving = adminHoursSaved * hourlyRate;
  const totalValue = annualRebate + websiteHostingSaving + adminLaborSaving;

  const handleSlideChange = (id: SlideId) => {
    startTransition(() => {
      setActiveSlide(id);
    });
  };

  const nextSlide = () => {
    const currentIndex = slides.findIndex(s => s.id === activeSlide);
    if (currentIndex < slides.length - 1) {
      handleSlideChange(slides[currentIndex + 1].id);
    } else {
      handleSlideChange(slides[0].id); // Loop back
    }
  };

  const prevSlide = () => {
    const currentIndex = slides.findIndex(s => s.id === activeSlide);
    if (currentIndex > 0) {
      handleSlideChange(slides[currentIndex - 1].id);
    } else {
      handleSlideChange(slides[slides.length - 1].id); // Loop to end
    }
  };

  return (
    <div className={styles.deckContainer} id="pitch-presentation">
      {/* Presentation Header */}
      <div className={styles.deckHeader}>
        <div className={styles.headerIndicator}>
          <span className={styles.livePulse}></span>
          <span>SCHOOL PARTNERSHIP PITCH DECK</span>
        </div>
        <div className={styles.slideTracker}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={`${styles.trackerDot} ${activeSlide === slide.id ? styles.trackerDotActive : ""}`}
              onClick={() => handleSlideChange(slide.id)}
              aria-label={`Go to slide ${index + 1}: ${slide.label}`}
            />
          ))}
        </div>
      </div>

      {/* Main Slide Window */}
      <div className={styles.deckWindow}>
        {/* Navigation Sidebar */}
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>Key Highlights</p>
          <nav className={styles.navMenu}>
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                className={`${styles.navItem} ${activeSlide === slide.id ? styles.navItemActive : ""}`}
                onClick={() => handleSlideChange(slide.id)}
              >
                <span className={styles.navIndex}>0{idx + 1}</span>
                <span className={styles.navLabel}>{slide.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Slide Content Display */}
        <div className={styles.contentArea}>
          {/* SLIDE 1: OVERVIEW */}
          {activeSlide === "overview" && (
            <div className={`${styles.slide} ${styles.fadeIn}`}>
              <span className={styles.slideEyebrow}>Exclusive School Program</span>
              <h2 className={styles.slideTitle}>Modern School Web Design & Free Hosting</h2>
              <p className={styles.slideText}>
                Elevate your school’s digital presence and streamline stationery list ordering. We design, host, and maintain a professional school site completely free of charge—saving admin costs while giving parents a simple web portal to buy correct stationery packs in 3 clicks.
              </p>

              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <h3>R35,000 /yr</h3>
                  <p>Web Development & Hosting Package Value</p>
                </div>
                <div className={styles.metricCard}>
                  <h3>R0.00</h3>
                  <p>Setup, License, or Monthly Fees</p>
                </div>
                <div className={styles.metricCard}>
                  <h3>5% Rebate</h3>
                  <p>Annual Development Rebate on all packs sold</p>
                </div>
              </div>

              <div className={styles.slideActions}>
                <Button onClick={nextSlide} variant="primary">
                  Explore Website Value
                </Button>
                <Button href="#partner-form" variant="outline">
                  Apply Today
                </Button>
              </div>
            </div>
          )}

          {/* SLIDE 2: WEBSITE FEATURES */}
          {activeSlide === "website" && (
            <div className={`${styles.slide} ${styles.fadeIn}`}>
              <span className={styles.slideEyebrow}>No-Cost Managed Platform</span>
              <h2 className={styles.slideTitle}>Everything Your School Needs Online</h2>
              <p className={styles.slideText}>
                We handle the design, server management, security, and updates. You get a modern online hub customized for your brand, badges, and school identity.
              </p>

              <div className={styles.featuresList}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <h4>Custom Domain Connection</h4>
                    <p>Hook up yourschool.co.za with premium, secure SSL certificate and hosting included free.</p>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h4>Prospectus & News Hub</h4>
                    <p>Keep your community updated on term dates, events, newsletters, and supply lists.</p>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h4>Integrated Parent Portal</h4>
                    <p>Stationery list pages configured for simple parent ordering with secure payment channels.</p>
                  </div>
                </div>
              </div>

              <div className={styles.slideActions}>
                <Button onClick={nextSlide} variant="primary">
                  Calculate Partnership Value
                </Button>
                <button className={styles.textButton} onClick={prevSlide}>
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* SLIDE 3: VALUE CALCULATOR */}
          {activeSlide === "calculator" && (
            <div className={`${styles.slide} ${styles.fadeIn}`}>
              <span className={styles.slideEyebrow}>Interactive Projection</span>
              <h2 className={styles.slideTitle}>Calculate School Benefits Dynamically</h2>
              <p className={styles.slideText}>
                Adjust the sliders below to estimate your school's annual rebates, admin hours saved, and overall value.
              </p>

              <div className={styles.calcGrid}>
                {/* Sliders Block */}
                <div className={styles.calcInputs}>
                  <div className={styles.inputGroup}>
                    <div className={styles.sliderLabel}>
                      <span>School Enrollment Size</span>
                      <strong>{enrollment} Students</strong>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="1500"
                      step="50"
                      value={enrollment}
                      onChange={(e) => setEnrollment(parseInt(e.target.value))}
                      className={styles.rangeSlider}
                    />
                    <div className={styles.rangeLimits}>
                      <span>100</span>
                      <span>1,500</span>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <div className={styles.sliderLabel}>
                      <span>Stationery Pack Adoption Rate</span>
                      <strong>{adoption}%</strong>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="5"
                      value={adoption}
                      onChange={(e) => setAdoption(parseInt(e.target.value))}
                      className={styles.rangeSlider}
                    />
                    <div className={styles.rangeLimits}>
                      <span>20%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className={styles.calcDisclaimer}>
                    *Based on average stationery pack value of R850.00 and 5% development rebate structure.
                  </div>
                </div>

                {/* Outputs Block */}
                <div className={styles.calcOutputs}>
                  <div className={styles.outputItem}>
                    <span>Estimated Annual Rebate Check</span>
                    <strong>R {annualRebate.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </div>
                  <div className={styles.outputItem}>
                    <span>Free Website Package Value</span>
                    <strong>R {websiteHostingSaving.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </div>
                  <div className={styles.outputItem}>
                    <span>Staff Admin Labor Saved</span>
                    <span>{adminHoursSaved} hours (~R {adminLaborSaving.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                  </div>
                  <div className={styles.totalValCard}>
                    <span>TOTAL ECONOMIC VALUE</span>
                    <strong>R {totalValue.toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.slideActions}>
                <Button onClick={nextSlide} variant="primary">
                  See Parent Convenience
                </Button>
                <button className={styles.textButton} onClick={prevSlide}>
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* SLIDE 4: PARENT CONVENIENCE */}
          {activeSlide === "parents" && (
            <div className={`${styles.slide} ${styles.fadeIn}`}>
              <span className={styles.slideEyebrow}>Stress-Free Back-to-School</span>
              <h2 className={styles.slideTitle}>Parents Buy Correct Grade Packs Fast</h2>
              <p className={styles.slideText}>
                No retail hopping or long queues in January. Parents get exactly what teachers require for the academic year.
              </p>

              <div className={styles.benefitsGridMini}>
                <div className={styles.benefitBox}>
                  <div className={styles.benefitIconWrapper}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4>100% Grade List Accuracy</h4>
                  <p>Stationery bundles are packed specifically according to the official lists verified by your school.</p>
                </div>

                <div className={styles.benefitBox}>
                  <div className={styles.benefitIconWrapper}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4>Instant 3-Click Checkout</h4>
                  <p>Smooth buying experience with Card, Instant EFT, and WhatsApp ordering capabilities.</p>
                </div>

                <div className={styles.benefitBox}>
                  <div className={styles.benefitIconWrapper}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 4h-2a2 2 0 00-2 2v3H6V17a2 2 0 00-2-2H2" />
                    </svg>
                  </div>
                  <h4>Direct & Organized Delivery</h4>
                  <p>Choose direct-to-home delivery or a bulk drop-off directly to the school at the start of the year.</p>
                </div>
              </div>

              <div className={styles.slideActions}>
                <Button onClick={nextSlide} variant="primary">
                  Review Onboarding Steps
                </Button>
                <button className={styles.textButton} onClick={prevSlide}>
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* SLIDE 5: ROADMAP */}
          {activeSlide === "roadmap" && (
            <div className={`${styles.slide} ${styles.fadeIn}`}>
              <span className={styles.slideEyebrow}>Simple Setup Process</span>
              <h2 className={styles.slideTitle}>How We Launch Your Portal</h2>
              <p className={styles.slideText}>
                Our team does the heavy lifting, taking you from request to live portal in days.
              </p>

              <div className={styles.roadmapFlow}>
                <div className={styles.roadmapStep}>
                  <div className={styles.stepNum}>1</div>
                  <h4>Submit Request</h4>
                  <p>Fill out our short enquiry form below with your school details.</p>
                </div>
                <div className={styles.roadmapStep}>
                  <div className={styles.stepNum}>2</div>
                  <h4>Share Lists</h4>
                  <p>Send your grade stationery requirements; we digitize them.</p>
                </div>
                <div className={styles.roadmapStep}>
                  <div className={styles.stepNum}>3</div>
                  <h4>Launch Site</h4>
                  <p>We build your website, set up branding, and open the parent store.</p>
                </div>
                <div className={styles.roadmapStep}>
                  <div className={styles.stepNum}>4</div>
                  <h4>Earn Rebates</h4>
                  <p>Parents order hassle-free and the school gains development funds.</p>
                </div>
              </div>

              <div className={styles.slideActions}>
                <Button href="#partner-form" variant="primary">
                  Start Application
                </Button>
                <button className={styles.textButton} onClick={() => handleSlideChange("overview")}>
                  Restart Show
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className={styles.deckFooter}>
        <button className={styles.navArrow} onClick={prevSlide} aria-label="Previous Slide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className={styles.slideInfoLabel}>
          Slide {slides.findIndex(s => s.id === activeSlide) + 1} of {slides.length} — {slides.find(s => s.id === activeSlide)?.label}
        </div>
        <button className={styles.navArrow} onClick={nextSlide} aria-label="Next Slide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
