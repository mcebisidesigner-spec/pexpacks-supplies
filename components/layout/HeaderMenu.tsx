"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/utils";

export function HeaderMenu() {
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileOpenRef = useRef(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [iconClosing, setIconClosing] = useState(false);

  const clearClosingTimer = useCallback(() => {
    if (closingTimerRef.current) {
      clearTimeout(closingTimerRef.current);
      closingTimerRef.current = null;
    }
  }, []);

  const openMobileMenu = useCallback(() => {
    clearClosingTimer();
    mobileOpenRef.current = true;
    setIconClosing(false);
    setMobileOpen(true);
  }, [clearClosingTimer]);

  const closeMobileMenu = useCallback(() => {
    clearClosingTimer();

    if (mobileOpenRef.current) {
      mobileOpenRef.current = false;
      setIconClosing(true);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const closeIconDelay = prefersReducedMotion ? 0 : 220;

      closingTimerRef.current = setTimeout(() => {
        setIconClosing(false);
        closingTimerRef.current = null;
      }, closeIconDelay);
    }

    setMobileOpen(false);
  }, [clearClosingTimer]);

  const resetMobileMenu = useCallback(() => {
    clearClosingTimer();
    mobileOpenRef.current = false;
    setMobileOpen(false);
    setIconClosing(false);
  }, [clearClosingTimer]);

  /* ── Body scroll lock (iOS-safe) ── */
  useEffect(() => {
    mobileOpenRef.current = mobileOpen;

    if (mobileOpen) {
      const scrollY = window.scrollY;

      document.body.classList.add("menu-open");
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.width = "100%";
    } else {
      const prevTop = document.body.style.top;
      const scrollY = prevTop ? parseInt(prevTop) * -1 : 0;

      document.body.classList.remove("menu-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.width = "";

      if (scrollY) window.scrollTo(0, scrollY);
    }

    return () => {
      document.body.classList.remove("menu-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.width = "";
    };
  }, [mobileOpen]);

  /* ── Reset on route change ── */
  useEffect(() => {
    resetMobileMenu();
  }, [pathname, resetMobileMenu]);

  /* ── Cleanup closing timer on unmount ── */
  useEffect(() => {
    return () => clearClosingTimer();
  }, [clearClosingTimer]);

  /* ── Logo click closes menu (targeted, only when open) ── */
  useEffect(() => {
    if (!mobileOpen) return;

    const logoLink = document.querySelector<HTMLElement>(
      "[data-mobile-menu-close]"
    );
    if (!logoLink) return;

    const handler = () => closeMobileMenu();
    logoLink.addEventListener("click", handler);
    return () => logoLink.removeEventListener("click", handler);
  }, [mobileOpen, closeMobileMenu]);

  /* ── Escape key closes menu ── */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMobileMenu]);

  /* ── Focus management ── */
  useEffect(() => {
    if (mobileOpen) {
      const menu = document.getElementById("mobile-menu");
      const firstLink = menu?.querySelector<HTMLElement>("a");
      firstLink?.focus();
    } else {
      menuButtonRef.current?.focus();
    }
  }, [mobileOpen]);

  const showCloseIcon = mobileOpen || iconClosing;

  return (
    <>
      <button
        ref={menuButtonRef}
        className="relative grid lg:hidden place-items-center w-10 h-10 min-w-10 min-h-10 !border-0 border-none p-0 bg-transparent rounded-full text-pex-navy cursor-pointer z-10 select-none transition-colors !outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none active:ring-0 !shadow-none [-webkit-tap-highlight-color:transparent]"
        type="button"
        onClick={() => (mobileOpen ? closeMobileMenu() : openMobileMenu())}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-controls="mobile-menu"
        aria-expanded={mobileOpen}
      >
        <span
          className={cn(
            "absolute top-1/2 left-1/2 w-5 h-0.5 rounded-full bg-current origin-center will-change-[transform,opacity] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
            showCloseIcon
              ? "-translate-x-1/2 -translate-y-1/2 rotate-45 delay-90"
              : "-translate-x-1/2 -translate-y-[calc(50%+6.5px)] delay-0"
          )}
        />
        <span
          className={cn(
            "absolute top-1/2 left-1/2 w-5 h-0.5 rounded-full bg-current origin-center will-change-[transform,opacity] transition-all duration-200 ease-[cubic-bezier(0.4,0,1,1)] motion-reduce:transition-none",
            showCloseIcon
              ? "-translate-x-1/2 -translate-y-1/2 opacity-0 scale-x-[0.2] delay-90"
              : "-translate-x-1/2 -translate-y-1/2 opacity-100 scale-x-100 delay-0"
          )}
        />
        <span
          className={cn(
            "absolute top-1/2 left-1/2 w-5 h-0.5 rounded-full bg-current origin-center will-change-[transform,opacity] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
            showCloseIcon
              ? "-translate-x-1/2 -translate-y-1/2 -rotate-45 delay-90"
              : "-translate-x-1/2 -translate-y-[calc(50%-6.5px)] delay-0"
          )}
        />
      </button>
      <MobileMenu
        open={mobileOpen}
        onClose={closeMobileMenu}
        pathname={pathname}
      />
    </>
  );
}

