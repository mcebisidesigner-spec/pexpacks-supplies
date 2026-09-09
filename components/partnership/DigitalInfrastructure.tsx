import React from "react";
import { Globe, Lock, Smartphone, Headphones, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./Partnership.module.css";

const INFRA_FEATURES = [
  {
    icon: Smartphone,
    title: "Mobile-First Parent Portal",
    desc: "Parents navigate clear, teacher-approved stationery packs with one-tap checkout, instant receipts, and delivery choice.",
  },
  {
    icon: Globe,
    title: "School-Branded Digital Presence",
    desc: "A custom web experience honoring your school’s crest, color palette, and official announcements at zero development cost.",
  },
  {
    icon: Lock,
    title: "Managed SSL & Secure Cloud Hosting",
    desc: "Fast, reliable cloud infrastructure with end-to-end encryption, automated backups, and 99.9% availability.",
  },
  {
    icon: Headphones,
    title: "Dedicated Parent Customer Support",
    desc: "Pexpacks helpdesk directly resolves parent queries regarding tracking, returns, and payment options.",
  },
];

export function DigitalInfrastructure() {
  return (
    <section className={styles.section} aria-labelledby="digital-infra-heading">
      <div className={styles.container}>
        <div className={styles.infraCard}>
          <div className={styles.infraGrid}>
            <div>
              <p className={styles.eyebrowLight}>Digital infrastructure suite</p>
              <h2 id="digital-infra-heading" className={styles.sectionTitleLight}>
                A Digital Front Door Built Around Your School.
              </h2>
              <p className={styles.sectionLeadLight}>
                A complimentary 12-month digital infrastructure package included with
                qualifying institutional partnerships. We build, host, and maintain
                a professional digital portal tailored to your school's procurement
                calendar.
              </p>
              <div style={{ marginTop: 28 }}>
                <Button href="#partnership-enquiry" variant="primary" size="md">
                  <span>Inquire About Digital Infrastructure</span>
                  <ArrowUpRight size={16} style={{ marginLeft: 6, display: "inline" }} />
                </Button>
              </div>
            </div>

            <div className={styles.infraPillList}>
              {INFRA_FEATURES.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className={styles.infraPill}>
                    <h3 className={styles.infraPillTitle}>
                      <Icon size={18} style={{ color: "#5eead4" }} />
                      <span>{item.title}</span>
                    </h3>
                    <p className={styles.infraPillDesc}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
