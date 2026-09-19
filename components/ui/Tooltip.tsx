import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export type TooltipProps = {
  content: ReactNode;
  position?: TooltipPosition;
  children: ReactNode;
  className?: string;
  delay?: boolean;
};

const positionClasses: Record<TooltipPosition, { bubble: string; arrow: string }> = {
  bottom: {
    bubble: "top-[calc(100%+8px)] left-1/2 -translate-x-1/2 -translate-y-1 group-hover:translate-y-0 group-focus-within:translate-y-0",
    arrow: "-top-1 left-[calc(50%-3.5px)] border-b-0 border-r-0",
  },
  top: {
    bubble: "bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-1 group-hover:translate-y-0 group-focus-within:translate-y-0",
    arrow: "-bottom-1 left-[calc(50%-3.5px)] border-t-0 border-l-0",
  },
  left: {
    bubble: "right-[calc(100%+8px)] top-1/2 -translate-y-1/2 translate-x-1 group-hover:translate-x-0 group-focus-within:translate-x-0",
    arrow: "-right-1 top-[calc(50%-3.5px)] border-b-0 border-l-0",
  },
  right: {
    bubble: "left-[calc(100%+8px)] top-1/2 -translate-y-1/2 -translate-x-1 group-hover:translate-x-0 group-focus-within:translate-x-0",
    arrow: "-left-1 top-[calc(50%-3.5px)] border-t-0 border-r-0",
  },
};

export function Tooltip({
  content,
  position = "bottom",
  children,
  className,
  delay = false,
}: TooltipProps) {
  if (!content) return <>{children}</>;

  const { bubble, arrow } = positionClasses[position] ?? positionClasses.bottom;

  return (
    <span
      className={cn(
        "group relative inline-flex items-center justify-center",
        className
      )}
    >
      {children}
      <span
        className={cn(
          "absolute z-[200] inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-[var(--pex-navy,#1a2a40)] text-white text-xs font-bold leading-tight tracking-tight whitespace-nowrap border border-white/15 shadow-[0_8px_24px_rgba(15,35,58,0.28),0_2px_6px_rgba(0,0,0,0.12)] pointer-events-none opacity-0 invisible transition-all duration-150 group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible max-md:[@media(hover:none)]:hidden",
          bubble,
          delay && "delay-75"
        )}
        role="tooltip"
        aria-hidden="true"
      >
        <span>{content}</span>
        <span
          className={cn(
            "absolute w-[7px] h-[7px] bg-[var(--pex-navy,#1a2a40)] border border-white/15 rotate-45",
            arrow
          )}
        />
      </span>
    </span>
  );
}
