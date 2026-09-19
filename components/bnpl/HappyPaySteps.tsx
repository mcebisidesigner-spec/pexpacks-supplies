import { cn } from "@/lib/utils";

const steps = [
  {
    step: "01",
    title: "Choose your packs",
    text: "Pick your school and grade packs, or build your own tray. Add Pexcover book covering if you’d like.",
  },
  {
    step: "02",
    title: "Pay 50% today",
    text: "At checkout, choose Happy Pay and approve your split. Your first instalment is paid securely.",
  },
  {
    step: "03",
    title: "Pay the rest in 30 days",
    text: "Happy Pay settles your full order now, so your packs are dispatched right away. You pay the remaining 50% in 30 days.",
  },
] as const;

export function HappyPaySteps({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6", className)}
      role="list"
      aria-label="How Happy Pay works"
    >
      {steps.map((step) => (
        <div
          className="relative flex flex-row md:flex-col items-start gap-3 sm:gap-4 p-5 sm:p-6 rounded-2xl border border-pex-border border-t-[3px] border-t-pex-keppel bg-white shadow-sm"
          role="listitem"
          key={step.step}
        >
          <span
            className="inline-flex items-center justify-center w-9 h-9 md:w-[42px] md:h-[42px] min-w-9 md:min-w-[42px] shrink-0 aspect-square rounded-full bg-gradient-to-br from-pex-coral to-pex-coral-hover text-white text-xs md:text-sm font-extrabold leading-none tracking-wide shadow-[0_10px_20px_rgba(255,111,89,0.3)]"
            aria-hidden="true"
          >
            {step.step}
          </span>
          <div className="flex flex-col gap-1.5 min-w-0">
            <h3 className="m-0 text-pex-navy text-base sm:text-[17px] font-extrabold leading-snug">
              {step.title}
            </h3>
            <p className="m-0 text-pex-muted text-sm leading-relaxed">
              {step.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
