import { Search, SlidersHorizontal, Truck, ChevronRight } from "lucide-react";
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
            <Search className="w-5 h-5" />
          </div>
          <div className={homeStyles.howItWorksStepContent}>
            <span className={homeStyles.howItWorksStepTitle}>Find your school</span>
            <span className={homeStyles.howItWorksStepDesc}>Search our directory of SA schools</span>
          </div>
        </div>
        <div className={homeStyles.howItWorksArrow}>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
        <div className={homeStyles.howItWorksStep}>
          <div className={homeStyles.howItWorksIcon}>
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div className={homeStyles.howItWorksStepContent}>
            <span className={homeStyles.howItWorksStepTitle}>Add or remove items</span>
            <span className={homeStyles.howItWorksStepDesc}>Customise quantities before checkout</span>
          </div>
        </div>
        <div className={homeStyles.howItWorksArrow}>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
        <div className={homeStyles.howItWorksStep}>
          <div className={homeStyles.howItWorksIcon}>
            <Truck className="w-5 h-5" />
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
