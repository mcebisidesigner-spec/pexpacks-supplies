import { RetailComparisonSlider } from "@/components/marketing/RetailComparisonSlider";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { orderingWorksSteps } from "@/data/packs";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";

export function OrderingWorksSection() {
  return (
    <section
      className={sectionStyles.sectionCream}
      aria-labelledby="how-it-works-heading"
    >
      <div className={sectionStyles.inner}>
        <SectionHeader
          eyebrow="School-ready support"
          title="How ordering works"
          text="Pexpacks keeps the school list searchable so parents do not need to scroll through hundreds of schools. The average parent saves 4 hours of driving, queuing, and crossing off lists."
          headingId="how-it-works-heading"
        />
        <div className={cardStyles.gridThree}>
          {orderingWorksSteps.map((step, idx) => (
            <div className={cardStyles.stepCard} key={step.title}>
              <div className={cardStyles.stepNumber}>{idx + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
        <RetailComparisonSlider />
      </div>
    </section>
  );
}
