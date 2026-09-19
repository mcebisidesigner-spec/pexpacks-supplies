"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type HomepageStickyCtaProps = {
  targetSelector: string;
};

export function HomepageStickyCta({ targetSelector }: HomepageStickyCtaProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.boundingClientRect.y < 0 && !entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-90px 0px 0px 0px" },
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [targetSelector]);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 w-full bg-pex-navy text-white z-50 transition-transform duration-300 ease-out shadow-[0_-4px_20px_rgba(0,0,0,0.15)] pb-[env(safe-area-inset-bottom,0px)] md:hidden",
        isVisible ? "translate-y-0" : "translate-y-[110%]"
      )}
      aria-hidden={!isVisible}
    >
      <div className="max-w-[var(--layout-max-width)] mx-auto flex items-stretch gap-2.5 p-3 px-4">
        <Link
          href="/schools"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3.5 bg-pex-coral hover:bg-pex-coral-hover !text-white font-heading font-extrabold text-sm sm:text-base whitespace-nowrap transition-all shadow-sm active:scale-[0.98]"
          data-conversion-event="homepage_sticky_find_school"
          tabIndex={isVisible ? 0 : -1}
        >
          Find my school pack
        </Link>
        <Link
          href="/happy-pay"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3.5 bg-white/12 hover:bg-white/20 !text-white border border-white/35 font-heading font-extrabold text-sm sm:text-base whitespace-nowrap transition-all active:scale-[0.98]"
          data-conversion-event="homepage_sticky_split"
          tabIndex={isVisible ? 0 : -1}
        >
          Split in 2
        </Link>
      </div>
    </div>
  );
}
