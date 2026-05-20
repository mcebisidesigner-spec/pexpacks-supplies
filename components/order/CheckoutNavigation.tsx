import { Button } from "@/components/ui/Button";
import styles from "./Order.module.css";

type CheckoutNavigationProps = {
  activeStep: number;
  primaryLabel: string;
  primaryDisabled: boolean;
  onBack: () => void;
  onPrimary: () => void;
};

export function CheckoutNavigation({
  activeStep,
  primaryLabel,
  primaryDisabled,
  onBack,
  onPrimary,
}: CheckoutNavigationProps) {
  return (
    <div className={styles.formActions}>
      <button type="button" onClick={onBack} disabled={activeStep === 0}>
        Back
      </button>
      <Button type="button" onClick={onPrimary} disabled={primaryDisabled}>
        {primaryLabel}
      </Button>
    </div>
  );
}
