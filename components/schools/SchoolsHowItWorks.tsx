import homeStyles from "@/components/marketing/MarketingHome.module.css";

type SchoolsHowItWorksProps = {
  className?: string;
};

export function SchoolsHowItWorks({ className }: SchoolsHowItWorksProps) {
  return (
    <div className={[homeStyles.howItWorks, className].filter(Boolean).join(" ")}>
      <div className={homeStyles.howItWorksInner}>
        <div className={homeStyles.howItWorksStep}>
          <div className={homeStyles.howItWorksIcon}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <div className={homeStyles.howItWorksStepContent}>
            <span className={homeStyles.howItWorksStepTitle}>Find your school</span>
            <span className={homeStyles.howItWorksStepDesc}>Search our directory of SA schools</span>
          </div>
        </div>
        <div className={homeStyles.howItWorksArrow}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
        <div className={homeStyles.howItWorksStep}>
          <div className={homeStyles.howItWorksIcon}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </div>
          <div className={homeStyles.howItWorksStepContent}>
            <span className={homeStyles.howItWorksStepTitle}>Add or remove items</span>
            <span className={homeStyles.howItWorksStepDesc}>Customise quantities before checkout</span>
          </div>
        </div>
        <div className={homeStyles.howItWorksArrow}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
        <div className={homeStyles.howItWorksStep}>
          <div className={homeStyles.howItWorksIcon}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div className={homeStyles.howItWorksStepContent}>
            <span className={homeStyles.howItWorksStepTitle}>We pack &amp; deliver</span>
            <span className={homeStyles.howItWorksStepDesc}>Straight to your door, term-ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
