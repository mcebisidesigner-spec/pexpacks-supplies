"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { mainNavLinks } from "@/data/navigation";
import { isActivePath } from "@/lib/isActivePath";
import { TrackPackIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  pathname: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function MobileMenu({ open, onClose, pathname }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    const menu = menuRef.current;
    if (!menu) return;

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      const el = menuRef.current;
      if (!el) return;

      const focusable = [
        ...el.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleTab);

    const firstFocusable = menu.querySelector<HTMLElement>(FOCUSABLE);
    firstFocusable?.focus();

    return () => document.removeEventListener("keydown", handleTab);
  }, [open]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current!;

    if (deltaX > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      onClose();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      ref={menuRef}
      id="mobile-menu"
      role="dialog"
      aria-modal={open ? "true" : "false"}
      aria-label="Navigation menu"
      className={cn(
        "fixed z-[1] top-[68px] sm:top-[70px] left-0 right-0 h-[calc(100vh-68px)] sm:h-[calc(100vh-70px)] h-[calc(100dvh-68px)] sm:h-[calc(100dvh-70px)] bottom-0 bg-white text-pex-navy translate-x-full opacity-100 invisible pointer-events-none overflow-y-auto overscroll-contain transition-[transform,visibility] duration-260 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
        open && "translate-x-0 visible pointer-events-auto"
      )}
      inert={!open}
      aria-hidden={!open ? "true" : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="p-4 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] flex flex-col min-h-full gap-0">
        <nav className="grid gap-1.5 sm:gap-2" aria-label="Mobile navigation">
          {mainNavLinks.map((link) => {
            const active = isActivePath(link.href, pathname);

            return (
              <Link
                href={link.href}
                key={link.href}
                onClick={onClose}
                className={cn(
                  "w-full text-pex-navy py-3 sm:py-3.5 px-4 rounded-xl font-sans text-base sm:text-lg font-bold leading-none min-h-[48px] sm:min-h-[52px] flex items-center bg-[#fbfdfd] border border-pex-border transition-all hover:text-pex-keppel hover:border-pex-keppel hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
                  active && "text-pex-keppel bg-pex-keppel/10 border-pex-keppel font-bold"
                )}
                aria-current={active ? "page" : undefined}
                data-conversion-event={`mobile_nav_${link.label.toLowerCase().replaceAll(" ", "_")}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="h-[1px] bg-pex-border my-3 sm:my-4 shrink-0" role="separator" />

        <div className="flex flex-col gap-2.5 sm:gap-3 mt-auto pt-1">
          <Link
            href="/track-order"
            className="min-h-[48px] sm:min-h-[52px] py-1.5 pr-2 pl-5 rounded-full flex items-center justify-center gap-2.5 bg-pex-navy text-white font-sans text-base font-bold leading-none shadow-[0_10px_20px_rgba(26,42,64,0.12)] transition-all hover:brightness-110 active:brightness-100 group"
            onClick={onClose}
            data-conversion-event="mobile_track_pack"
          >
            <span>Track Your Pack</span>
            <span className="w-7 h-7 rounded-full bg-pex-coral text-white inline-grid place-items-center shrink-0 transition-transform duration-200 group-hover:scale-105 [&_svg]:w-[15px] [&_svg]:h-[15px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.8]">
              <TrackPackIcon aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

