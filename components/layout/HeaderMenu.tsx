"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import styles from "./Header.module.css";

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
        className={[
          styles.menuButton,
          showCloseIcon ? styles.menuButtonOpen : "",
          iconClosing ? styles.menuButtonClosing : "",
        ]
          .filter(Boolean)
          .join(" ")}
        type="button"
        onClick={() => (mobileOpen ? closeMobileMenu() : openMobileMenu())}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-controls="mobile-menu"
        aria-expanded={mobileOpen}
      >
        <span />
        <span />
        <span />
      </button>
      <MobileMenu
        open={mobileOpen}
        onClose={closeMobileMenu}
        pathname={pathname}
      />
    </>
  );
}
