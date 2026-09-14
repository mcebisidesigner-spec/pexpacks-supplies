import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ShieldCheck, TrendingUp, Laptop, PackageCheck } from "lucide-react";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import styles from "./Partnership.module.css";

interface PartnershipHeroProps {
  eyebrow?: string;
  title?: string;
  onScheduleBriefing?: () => void;
  onRequestBrochure?: () => void;
}

export function PartnershipHero({
  eyebrow = "FOR GAUTENG SCHOOLS & INSTITUTIONAL LEADERS",
  title = "The Elite Standard in Scholastic Fulfilment & Digital Infrastructure.",
  onScheduleBriefing,
  onRequestBrochure,
}: PartnershipHeroProps) {
  return (
    <section className={styles.section} aria-labelledby="partnership-hero-title">
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>
              {eyebrow}
            </p>

            <h1 id="partnership-hero-title" className={styles.heroTitle}>
              {title}
            </h1>

            <p className={styles.heroLead}>
              Transform seasonal back-to-school administration into an automated
              revenue generator for your campus.
            </p>

            <p className={styles.heroSupporting}>
              Pexpacks Supplies digitises your school-approved stationery requirements,
              deploys a tailored parent ordering portal, delivers custom-packaged
              stationery directly to learners, and returns up to 3% of qualifying
              turnover to your school development fund — with zero administrative
              friction for your staff.
            </p>

            <div className={styles.heroChips} aria-label="Partnership guarantees">
              <div className={styles.heroChip}>
                <span className={styles.heroChipIcon}>
                  <ShieldCheck size={16} />
                </span>
                <span>0% School Setup Cost</span>
              </div>
              <div className={styles.heroChip}>
                <span className={styles.heroChipIcon}>
                  <TrendingUp size={16} />
                </span>
                <span>Up to 3% Institutional Rebate</span>
              </div>
              <div className={styles.heroChip}>
                <span className={styles.heroChipIcon}>
                  <Laptop size={16} />
                </span>
                <span>12-Month Digital Infrastructure Package</span>
              </div>
              <div className={styles.heroChip}>
                <span className={styles.heroChipIcon}>
                  <PackageCheck size={16} />
                </span>
                <span>Managed Stationery Fulfilment</span>
              </div>
            </div>

            <div className={styles.heroCtaRow}>
              <Button
                href="#partnership-enquiry"
                variant="primary"
                size="lg"
                onClick={onScheduleBriefing}
              >
                Schedule a 10-Minute SGB Briefing
              </Button>
              <Button
                href="#partnership-enquiry"
                variant="outline"
                size="lg"
                onClick={onRequestBrochure}
              >
                Request Institutional Overview
              </Button>
            </div>
          </div>

          <div className={styles.heroMediaWrapper}>
            <div className={styles.heroMediaContainer}>
              <Image
                src="/images/hero-school-stationery-delivery.webp"
                alt="Pexpacks stationery delivery packs for partner schools"
                fill
                priority
                sizes="(min-width: 1280px) 560px, (min-width: 980px) 45vw, 100vw"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className={styles.heroMediaBadge}>
              <div>
                <p className={styles.heroBadgeTitle}>Institutional Supply Assurance</p>
                <p className={styles.heroBadgeSub}>100% Grade-list compliance &amp; quality guarantee</p>
              </div>
              <CheckCircle2 size={24} className={styles.heroBadgeIcon} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
