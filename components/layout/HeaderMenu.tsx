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

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
    document.body.classList.toggle("menu-open", mobileOpen);
    return () => document.body.classList.remove("menu-open");
  }, [mobileOpen]);

  useEffect(() => {
    resetMobileMenu();
  }, [pathname, resetMobileMenu]);

  useEffect(() => {
    return () => clearClosingTimer();
  }, [clearClosingTimer]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    function onDocumentClick(event: MouseEvent) {
      const target = event.target;

      if (target instanceof Element && target.closest("[data-mobile-menu-close]")) {
        closeMobileMenu();
      }
    }

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [mobileOpen, closeMobileMenu]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMobileMenu]);

  useEffect(() => {
    if (mobileOpen) {
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
      <MobileMenu open={mobileOpen} onClose={closeMobileMenu} pathname={pathname} />
    </>
  );
}
