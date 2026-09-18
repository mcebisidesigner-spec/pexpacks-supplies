import { Search, SlidersHorizontal, Truck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SchoolsHowItWorksProps = {
  className?: string;
};

export function SchoolsHowItWorks({ className }: SchoolsHowItWorksProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[var(--layout-max-width)] my-6 mx-auto mb-5 px-4 md:px-8",
        className
      )}
    >
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 sm:gap-3 p-3 sm:py-3.5 sm:px-5 rounded-[var(--radius-card)] bg-[var(--pex-bg)] border border-[var(--pex-border)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-full bg-[var(--color-teal-subtle)] text-[var(--pex-keppel)] grid place-items-center">
            <Search className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="flex flex-col gap-px">
            <span className="text-xs sm:text-[13px] font-extrabold text-[var(--pex-primary)] leading-[1.2] whitespace-nowrap">
              Find your school
            </span>
            <span className="hidden md:block text-[11px] text-[var(--pex-text-muted)] leading-[1.3] whitespace-nowrap">
              Search our directory of SA schools
            </span>
          </div>
        </div>
        <div className="hidden sm:grid shrink-0 text-[var(--pex-border)] place-items-center">
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-full bg-[var(--color-teal-subtle)] text-[var(--pex-keppel)] grid place-items-center">
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="flex flex-col gap-px">
            <span className="text-xs sm:text-[13px] font-extrabold text-[var(--pex-primary)] leading-[1.2] whitespace-nowrap">
              Add or remove items
            </span>
            <span className="hidden md:block text-[11px] text-[var(--pex-text-muted)] leading-[1.3] whitespace-nowrap">
              Customise quantities before checkout
            </span>
          </div>
        </div>
        <div className="hidden sm:grid shrink-0 text-[var(--pex-border)] place-items-center">
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-full bg-[var(--color-teal-subtle)] text-[var(--pex-keppel)] grid place-items-center">
            <Truck className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="flex flex-col gap-px">
            <span className="text-xs sm:text-[13px] font-extrabold text-[var(--pex-primary)] leading-[1.2] whitespace-nowrap">
              We pack &amp; deliver
            </span>
            <span className="hidden md:block text-[11px] text-[var(--pex-text-muted)] leading-[1.3] whitespace-nowrap">
              Straight to your door, term-ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

