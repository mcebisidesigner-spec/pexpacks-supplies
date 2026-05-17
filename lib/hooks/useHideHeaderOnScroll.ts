"use client";

import { useEffect, useRef, useState } from "react";

type UseHideHeaderOnScrollOptions = {
  topThreshold?: number;
  hideAfter?: number;
  directionThreshold?: number;
  disabled?: boolean;
};

export function useHideHeaderOnScroll({
  topThreshold = 24,
  hideAfter = 100,
  directionThreshold = 10,
  disabled = false,
}: UseHideHeaderOnScrollOptions = {}) {
  const [isHidden, setIsHidden] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (
      disabled ||
      document.body.classList.contains("menu-open") ||
      document.body.style.overflow === "hidden"
    ) {
      setIsHidden(false);
      return;
    }

    lastScrollY.current = window.scrollY;

    function updateHeaderState() {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= topThreshold) {
        setIsAtTop(true);
        setIsHidden(false);
        setScrollDirection(null);
      } else {
        setIsAtTop(false);
        if (currentScrollY > lastScrollY.current && currentScrollY > hideAfter) {
          setIsHidden(true);
          setScrollDirection("down");
        } else if (currentScrollY < lastScrollY.current) {
          setIsHidden(false);
          setScrollDirection("up");
        }
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    }

    function onScroll() {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(updateHeaderState);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [topThreshold, hideAfter, directionThreshold, disabled]);

  useEffect(() => {
    if (disabled) {
      setIsHidden(false);
    }
  }, [disabled]);

  return { isHidden, isAtTop, scrollDirection };
}
