"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnnouncementBarProps {
  id?: string;
  text?: string;
  badge?: string;
  linkUrl?: string | null;
  linkLabel?: string | null;
}

export function AnnouncementBar({
  id,
  text,
  badge,
  linkUrl,
  linkLabel,
}: AnnouncementBarProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const barRef = useRef<HTMLElement | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = `pexpacks_banner_dismissed_${id || text || "active"}`;

  const setCssHeight = useCallback((heightPx: number) => {
    document.documentElement.style.setProperty(
      "--announcement-bar-height",
      `${heightPx}px`
    );
  }, []);

  useEffect(() => {
    if (!text) return;

    try {
      const dismissed = sessionStorage.getItem(storageKey);
      if (dismissed === "true") {
        setIsDismissed(true);
        setCssHeight(0);
        return;
      }
    } catch {
      // Ignore sessionStorage access errors
    }

    setIsDismissed(false);
    setIsExiting(false);

    const measureAndSetHeight = () => {
      if (barRef.current) {
        const height = barRef.current.offsetHeight;
        setCssHeight(height > 0 ? height : 44);
      } else {
        setCssHeight(44);
      }
    };

    // Defer measurement until paint
    const rafId = requestAnimationFrame(measureAndSetHeight);
    window.addEventListener("resize", measureAndSetHeight, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measureAndSetHeight);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
      setCssHeight(0);
    };
  }, [storageKey, text, setCssHeight]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setCssHeight(0);

    try {
      sessionStorage.setItem(storageKey, "true");
    } catch {
      // Ignore quota or private-browsing errors
    }

    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }

    dismissTimerRef.current = setTimeout(() => {
      setIsDismissed(true);
    }, 240);
  }, [storageKey, setCssHeight]);

  if (!text) {
    return null;
  }

  const isExternalLink =
    Boolean(linkUrl) &&
    (linkUrl!.startsWith("http://") || linkUrl!.startsWith("https://"));

  return (
    <aside
      ref={barRef}
      className={cn(
        "w-full relative z-[99] bg-[#121f30] text-white border-t border-[#1a2a40]/10 border-b border-white/10 shadow-[0_4px_20px_-2px_rgba(16,28,45,0.28)] max-h-[90px] opacity-100 translate-y-0 transition-[max-height,opacity,transform] duration-240 ease-[cubic-bezier(0.4,0,0.2,1)] bg-[radial-gradient(ellipse_65%_100%_at_50%_-20%,rgba(255,111,89,0.16),transparent_70%),radial-gradient(ellipse_45%_100%_at_15%_120%,rgba(26,122,119,0.12),transparent_60%),linear-gradient(90deg,#101c2d_0%,#17273d_50%,#101c2d_100%)]",
        isExiting && "max-h-0 opacity-0 -translate-y-full overflow-hidden pointer-events-none border-b-transparent shadow-none",
        isDismissed && "hidden !max-h-0 !opacity-0 !pointer-events-none !invisible"
      )}
      role="region"
      aria-label="Storefront announcement"
      aria-hidden={isDismissed}
    >
      {/* Luminous multi-stop accent light at the bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-[linear-gradient(90deg,transparent_0%,rgba(255,111,89,0)_15%,rgba(255,111,89,0.55)_45%,rgba(26,122,119,0.6)_55%,rgba(255,111,89,0.35)_85%,transparent_100%)] opacity-90 pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-[1280px] mx-auto min-h-[42px] sm:min-h-[44px] py-1.5 px-3 pr-10 sm:py-2 sm:px-[clamp(16px,4vw,56px)] flex items-center justify-center relative">
        <div className="inline-flex items-center justify-start text-left sm:justify-center sm:text-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
          {Boolean(badge) ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full bg-gradient-to-br from-[#ff6f59] to-[#f45037] text-white shadow-[0_2px_8px_rgba(255,111,89,0.36),inset_0_1px_0_rgba(255,255,255,0.3)] text-[10px] sm:text-[10.5px] md:text-[11px] font-extrabold uppercase tracking-[0.055em] whitespace-nowrap shrink-0 select-none font-sans">
              <span className="relative inline-flex items-center justify-center w-2 h-2 mr-0.5" aria-hidden="true">
                <span className="absolute -inset-0.5 rounded-full bg-white/60 animate-ping" />
                <span className="relative w-[5px] h-[5px] rounded-full bg-white shadow-[0_0_5px_#ffffff]" />
              </span>
              <span className="leading-none">{badge}</span>
            </span>
          ) : null}

          <span className="text-[12px] sm:text-[12.5px] md:text-[13.5px] font-semibold leading-[1.3] sm:leading-[1.35] md:leading-[1.4] text-white/95 tracking-[-0.01em] inline font-sans">
            {text}
          </span>

          {Boolean(linkUrl) ? (
            isExternalLink ? (
              <a
                href={linkUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-sans text-[11px] sm:text-[11.5px] md:text-[12px] font-bold no-underline whitespace-nowrap backdrop-blur-md transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#ff6f59]/25 hover:border-[#ff6f59]/65 hover:text-white hover:shadow-[0_2px_10px_rgba(255,111,89,0.28)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#ff6f59] focus-visible:outline-offset-2 cursor-pointer"
              >
                <span>{linkLabel || "Learn more"}</span>
                <ArrowRight size={12} className="inline-block transition-transform duration-180 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            ) : (
              <Link
                href={linkUrl!}
                className="group inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-sans text-[11px] sm:text-[11.5px] md:text-[12px] font-bold no-underline whitespace-nowrap backdrop-blur-md transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#ff6f59]/25 hover:border-[#ff6f59]/65 hover:text-white hover:shadow-[0_2px_10px_rgba(255,111,89,0.28)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#ff6f59] focus-visible:outline-offset-2 cursor-pointer"
              >
                <span>{linkLabel || "Learn more"}</span>
                <ArrowRight size={12} className="inline-block transition-transform duration-180 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            )
          ) : null}
        </div>

        <button
          type="button"
          className="absolute right-2.5 sm:right-[clamp(12px,3vw,36px)] top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full border border-white/15 bg-white/10 backdrop-blur-md text-white/75 hover:bg-white/20 hover:border-white/35 hover:text-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-[#ff6f59] focus-visible:outline-offset-2 before:content-[''] before:absolute before:-inset-2 before:rounded-full"
          onClick={handleDismiss}
          aria-label="Dismiss announcement banner"
          title="Dismiss banner"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
