import { RetailComparisonSlider } from "@/components/marketing/RetailComparisonSlider";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { orderingWorksSteps } from "@/data/packs";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";

export function OrderingWorksSection() {
  return (
    <section
      className={sectionStyles.section}
      aria-labelledby="how-it-works-heading"
    >
      <div className={sectionStyles.inner}>
        <ScrollReveal>
          <SectionHeader
            eyebrow="Order in minutes"
            title="How ordering works"
            text="Pexpacks keeps the school list searchable so parents do not need to scroll through endless stationsery shops. No driving, no queuing, no crossing off lists by hand."
            headingId="how-it-works-heading"
          />
        </ScrollReveal>
        <div className={cardStyles.gridThree}>
          <div className={cardStyles.stepConnector} aria-hidden="true" />
          {orderingWorksSteps.map((step, idx) => (
            <ScrollReveal key={step.title} delay={idx * 120} as="article">
              <div className={cardStyles.stepCard}>
                <div className={cardStyles.stepNumber}>{idx + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={200}>
          <RetailComparisonSlider />
        </ScrollReveal>
      </div>
    </section>
  );
}
