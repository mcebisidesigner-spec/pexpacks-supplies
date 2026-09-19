import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type HappyPayLogoProps = {
  tone?: "light" | "dark";
  showLabel?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function HappyPayLogo({
  tone = "light",
  showLabel = true,
  className = "",
  style,
}: HappyPayLogoProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 leading-none whitespace-nowrap", className)}
      style={style}
      aria-label="Happy Pay"
    >
      <svg
        className="w-[17px] h-[17px] sm:w-[22px] sm:h-[22px] shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="11" className="fill-pex-coral" />
        <circle cx="8.2" cy="9.8" r="1.35" className="fill-white" />
        <circle cx="15.8" cy="9.8" r="1.35" className="fill-white" />
        <path
          d="M7.2 14.2c1.3 1.6 3 2.4 4.8 2.4s3.5-.8 4.8-2.4"
          className="stroke-white stroke-[1.9] [stroke-linecap:round]"
        />
      </svg>
      {showLabel ? (
        <span
          className={cn(
            "font-extrabold text-xs sm:text-[15px] tracking-tight",
            tone === "light" ? "text-white" : "text-pex-keppel"
          )}
        >
          Happy&nbsp;Pay
        </span>
      ) : null}
    </span>
  );
}
