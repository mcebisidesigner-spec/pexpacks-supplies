import { Button } from "@/components/ui/Button";

type CTASectionProps = {
  eyebrow?: string;
  title: string;
  text: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function CTASection({
  eyebrow,
  title,
  text,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: CTASectionProps) {
  return (
    <section className="bg-pex-navy text-white py-[clamp(52px,8vw,92px)]">
      <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">
        <div>
          {eyebrow ? (
            <p className="m-0 mb-2.5 text-pex-coral text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="m-0 font-heading text-[clamp(34px,5vw,62px)] font-extrabold leading-none text-white">
            {title}
          </h2>
          <p className="m-0 mt-3.5 max-w-[580px] text-white/85 text-base sm:text-lg leading-relaxed">
            {text}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
          <Button
            href={primaryHref}
            variant="white"
            size="lg"
            data-conversion-event={`cta_${primaryLabel.toLowerCase().replaceAll(" ", "_")}`}
            className="w-full sm:w-auto"
          >
            {primaryLabel}
          </Button>
          {secondaryHref && secondaryLabel ? (
            <Button
              href={secondaryHref}
              variant="primary"
              size="lg"
              data-conversion-event={`cta_${secondaryLabel.toLowerCase().replaceAll(" ", "_")}`}
              className="w-full sm:w-auto"
            >
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
