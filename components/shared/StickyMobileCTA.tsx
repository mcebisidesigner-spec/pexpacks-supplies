"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./StickyMobileCTA.module.css";

const hiddenRoutes = ["/schools", "/order", "/contact"];

export function StickyMobileCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const hiddenOnRoute = hiddenRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    if (hiddenOnRoute) {
      setVisible(false);
      return;
    }

    let frame = 0;

    function updateVisibility() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setVisible(window.scrollY > 420);
      });
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateVisibility);
    };
  }, [hiddenOnRoute]);

  if (hiddenOnRoute) {
    return null;
  }

  return (
    <Link
      href="/schools"
      className={[styles.stickyCta, visible ? styles.stickyCtaVisible : ""]
        .filter(Boolean)
        .join(" ")}
      aria-label="Find your Pexpacks school stationery pack"
    >
      <span>Find Your Pack</span>
      <span className={styles.stickyCtaIcon} aria-hidden="true">
        &rarr;
      </span>
    </Link>
  );
}
