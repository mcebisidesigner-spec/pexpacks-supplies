"use client";

import { useHideHeaderOnScroll } from "@/hooks/useHideHeaderOnScroll";
import { cn } from "@/lib/utils";

type HeaderScrollWrapperProps = {
  children: React.ReactNode;
};

export function HeaderScrollWrapper({ children }: HeaderScrollWrapperProps) {
  const { isHidden, isAtTop } = useHideHeaderOnScroll();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 w-full z-[100] bg-white/95 backdrop-blur-md border-b border-transparent translate-y-0 opacity-100 will-change-[transform,opacity] transition-[transform,opacity,box-shadow,border-color] duration-200",
        isHidden
          ? "-translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100 pointer-events-auto",
        isAtTop
          ? "shadow-none border-b-transparent"
          : "shadow-[0_4px_20px_rgba(26,42,64,0.06)] border-b-[rgba(26,42,64,0.06)]"
      )}
    >
      {children}
    </header>
  );
}