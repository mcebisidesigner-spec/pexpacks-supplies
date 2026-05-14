"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./StickyMobileCTA.module.css";

const hiddenRoutes = ["/schools", "/order", "/contact", "/office-packs"];

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
    let isFooterVisible = false;

    const observer = new IntersectionObserver(
      (entries) => {
        isFooterVisible = entries[0].isIntersecting;
        updateVisibility();
      },
      { rootMargin: "0px" }
    );

    const footer = document.getElementById("site-footer");
    if (footer) {
      observer.observe(footer);
    }

    function updateVisibility() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setVisible(window.scrollY > 420 && !isFooterVisible);
      });
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateVisibility);
      observer.disconnect();
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
