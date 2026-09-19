import { Button } from "@/components/ui/Button";
import { HappyPayLogo } from "@/components/bnpl/HappyPayLogo";
import { cn } from "@/lib/utils";

type HappyPayBannerProps = {
  variant?: "homepage" | "schoolPage";
  className?: string;
};

const copy = {
  homepage: {
    eyebrow: "Happy Pay · Buy Now Pay Later",
    title: "Split your school shop in 2. Pay 50% today, the rest in 30 days.",
    text: "Get your child’s full stationery pack now and pay half today. Happy Pay settles your order with Pexpacks straight away — interest-free and no application fees.",
  },
  schoolPage: {
    eyebrow: "Happy Pay · Buy Now Pay Later",
    title: "Pay for this pack in 2 easy, interest-free payments.",
    text: "Order your child’s school pack now and pay just 50% today. Happy Pay covers the balance, and you settle the rest in 30 days — no fees, no impact on your credit score.",
  },
} as const;

const badges = [
  "0% interest",
  "No application fees",
  "Approval in under 60 seconds",
  "No impact on your credit score",
] as const;

export function HappyPayBanner({
  variant = "homepage",
  className = "",
}: HappyPayBannerProps) {
  const content = copy[variant];

  return (
    <section
      id="happy-pay-banner"
      className={cn(
        "relative overflow-hidden rounded-[24px] p-6 sm:p-10 lg:p-14 text-white shadow-[0_24px_64px_rgba(21,105,102,0.28)] bg-[radial-gradient(900px_420px_at_88%_-12%,rgba(255,111,89,0.42),transparent_62%),radial-gradient(760px_420px_at_-12%_115%,rgba(129,212,181,0.22),transparent_58%),linear-gradient(135deg,var(--pex-keppel-dark)_0%,var(--pex-keppel)_48%,var(--pex-navy)_100%)]",
        className
      )}
      aria-labelledby="happy-pay-banner-title"
    >
      <span className="pointer-events-none absolute w-[340px] h-[340px] -top-40 -right-20 rounded-full border border-white/15" aria-hidden="true" />
      <span className="pointer-events-none absolute w-[260px] h-[260px] -bottom-[140px] -left-[60px] rounded-full border border-white/15" aria-hidden="true" />

      <div className="relative z-[1] grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] gap-8 sm:gap-10 lg:gap-14 items-center">
        <div className="flex flex-col gap-4">
          <p className="inline-flex items-center gap-2.5 m-0 text-[#ffd9d0] text-sm font-extrabold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-pex-coral shadow-[0_0_0_4px_rgba(255,111,89,0.28)]" aria-hidden="true" />
            {content.eyebrow}
          </p>
          <h2 id="happy-pay-banner-title" className="m-0 font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-[1.12] text-white">
            {content.title}
          </h2>
          <p className="m-0 max-w-[560px] text-white/85 text-base leading-relaxed">{content.text}</p>

          <ul className="flex flex-wrap gap-2 list-none m-0 mt-1 p-0">
            {badges.map((badge) => (
              <li key={badge} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/12 border border-white/18 text-white text-[13px] font-bold leading-snug">
                <span className="inline-flex items-center justify-center w-4 h-4 shrink-0 rounded-full bg-pex-coral text-white" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-2.5 h-2.5"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                {badge}
              </li>
            ))}
          </ul>

          <div className="flex items-center flex-wrap gap-3 mt-2">
            <Button
              href="/happy-pay"
              variant="primary"
              size="md"
              iconDirection="right"
              data-conversion-event={`${variant === "homepage" ? "homepage" : "school"}_happy_pay_learn_more`}
              className="w-full sm:w-auto"
            >
              Learn How It Works
            </Button>
            <Button
              href="/checkout"
              variant="white"
              size="md"
              data-conversion-event={`${variant === "homepage" ? "homepage" : "school"}_happy_pay_split`}
              className="w-full sm:w-auto"
            >
              Split my pack in 2
            </Button>
          </div>
        </div>

        <div className="relative flex items-center justify-center py-6 order-first lg:order-none" aria-hidden="true">
          <span className="absolute w-[220px] lg:w-[260px] h-[220px] lg:h-[260px] rounded-full bg-[radial-gradient(circle,rgba(255,111,89,0.35),rgba(255,111,89,0)_68%)]" />
          <div className="relative z-[1] w-full max-w-[300px] sm:max-w-[320px] rounded-2xl bg-white shadow-[0_24px_48px_rgba(26,42,64,0.3)] p-5 sm:p-[20px_22px_16px] text-pex-navy">
            <div className="flex items-center justify-between gap-3 mb-4">
              <HappyPayLogo tone="dark" />
              <span className="px-2.5 py-1 rounded-full bg-pex-keppel/10 text-pex-keppel text-[11px] font-extrabold tracking-wider uppercase">BNPL</span>
            </div>

            <div className="flex items-center justify-between gap-3 py-3">
              <span className="text-pex-muted text-[13px] font-bold">Payment 1</span>
              <span className="inline-flex items-baseline gap-2.5">
                <strong className="text-pex-navy text-[13px] font-extrabold">Today</strong>
                <em className="not-italic font-extrabold text-[15px] text-pex-coral">50%</em>
              </span>
            </div>

            <div className="h-px border-t-2 border-dashed border-pex-navy/15" />

            <div className="flex items-center justify-between gap-3 py-3">
              <span className="text-pex-muted text-[13px] font-bold">Payment 2</span>
              <span className="inline-flex items-baseline gap-2.5">
                <strong className="text-pex-navy text-[13px] font-extrabold">In 30 days</strong>
                <em className="not-italic font-extrabold text-[15px] text-pex-coral">50%</em>
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-pex-border text-pex-muted text-xs font-bold">
              <svg
                className="w-4 h-4 shrink-0 text-pex-keppel"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Secure checkout powered by Ozow
            </div>
          </div>

          <span className="absolute z-[2] px-4 py-2 rounded-full text-[13px] font-extrabold shadow-[0_12px_24px_rgba(26,42,64,0.28)] top-1.5 right-1 bg-pex-coral text-white rotate-4">
            0% interest
          </span>
          <span className="absolute z-[2] px-4 py-2 rounded-full text-[13px] font-extrabold shadow-[0_12px_24px_rgba(26,42,64,0.28)] bottom-1 left-0.5 bg-white text-pex-keppel-dark -rotate-4">
            No fees
          </span>
        </div>
      </div>
    </section>
  );
}
