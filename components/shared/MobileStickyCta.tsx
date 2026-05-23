"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import styles from "./MobileStickyCta.module.css";
import btnStyles from "@/components/ui/Button.module.css";

export function MobileStickyCta() {
  const [visible, setVisible] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("schools-search");
    const threshold = hero ? hero.offsetHeight - 100 : 400;

    function handleScroll() {
      setVisible(window.scrollY > threshold);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.02 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const show = visible && !isFooterVisible;

  return (
    <div className={`${styles.stickyCta} ${show ? styles.visible : ""}`}>
      <Button
        href="#schools-search"
        variant="navy"
        className={btnStyles.fullWidth}
      >
        Find Your School Pack
      </Button>
    </div>
  );
}
