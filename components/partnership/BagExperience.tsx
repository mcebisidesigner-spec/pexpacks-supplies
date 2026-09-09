import React from "react";
import Image from "next/image";
import { UserCheck, Sparkles, Shield, Award } from "lucide-react";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import styles from "./Partnership.module.css";

const GALLERY_IMAGES = [
  {
    src: "/images/hero-school-delivery-packs.webp",
    alt: "Institutional school delivery packs arranged by grade",
    caption: "Bulk Campus Delivery — Sorted & Labeled per Learner",
  },
  {
    src: "/images/pex-stationery-box-v2.webp",
    alt: "Learners receiving their official Pexpacks stationery packs",
    caption: "Learner Distribution — Classroom Ready from Day One",
  },
  {
    src: "/images/unboxing-G7.webp",
    alt: "Unboxing verified Grade 7 stationery pack contents",
    caption: "Curriculum Compliance — Verified Brand & Quality Standards",
  },
  {
    src: "/images/office-packs.webp",
    alt: "School pack assembly and administrative supply bundles",
    caption: "Pack Collation — Sealed Durable Packaging",
  },
];

export function BagExperience() {
  return (
    <section className={styles.sectionAlt} aria-labelledby="brand-experience-title">
      <div className={styles.container}>
        <div className={styles.brandExpGrid}>
          {/* Feature Highlights */}
          <div>
            <p className={styles.eyebrow}>The physical brand experience</p>
            <h2 id="brand-experience-title" className={styles.sectionTitle}>
              From Classroom Essential to Walking Brand Asset.
            </h2>
            <p className={styles.sectionLead} style={{ marginBottom: "28px" }}>
              Pexpacks delivery packaging is purpose-designed for long-term scholastic
              utility rather than disposable waste. Every pack serves as a durable,
              functional extension of your school’s pride and identity.
            </p>

            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIconBox}>
                  <UserCheck size={20} />
                </div>
                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>Clear Learner ID Window</h3>
                  <p className={styles.featureDesc}>
                    Allows rapid teacher identification and classroom bag allocation on day one,
                    preventing mix-ups and ensuring smooth desk distribution.
                  </p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIconBox}>
                  <Shield size={20} />
                </div>
                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>Reflective Safety Detailing</h3>
                  <p className={styles.featureDesc}>
                    Subtle reflective piping enhances learner visibility during early-morning
                    winter drop-offs and everyday transport to campus.
                  </p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIconBox}>
                  <Sparkles size={20} />
                </div>
                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>Water-Resistant Construction</h3>
                  <p className={styles.featureDesc}>
                    Constructed with heavy-gauge protective fabrics and reinforced seams
                    to protect costly exercise books and stationery against inclement weather.
                  </p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIconBox}>
                  <Award size={20} />
                </div>
                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>School Identity &amp; Crest Integration</h3>
                  <p className={styles.featureDesc}>
                    Your institutional crest and school colours are professionally integrated,
                    providing proud visual cohesion throughout the academic year.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Showcase */}
          <div className={styles.galleryGrid} aria-label="Physical stationery pack gallery">
            {GALLERY_IMAGES.map((img) => (
              <div key={img.src} className={styles.galleryCard}>
                <div className={styles.galleryImageContainer}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 980px) 280px, 50vw"
                    placeholder="blur"
                    blurDataURL={IMAGE_BLUR_DATA_URL}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <p className={styles.galleryCaption}>{img.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
