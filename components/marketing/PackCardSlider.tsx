"use client";

import { Children, type ReactNode, type TouchEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "@/lib/debounce";
import styles from "./PackCardSlider.module.css";

type PackCardSliderProps = {
  children: ReactNode;
};

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function getCardsPerView() {
  if (typeof window === "undefined") {
    return 3;
  }

  if (window.matchMedia("(min-width: 1024px)").matches) {
    return 3;
  }

  if (window.matchMedia("(min-width: 768px)").matches) {
    return 2;
  }

  return 1;
}

export function PackCardSlider({ children }: PackCardSliderProps) {
  const slides = useMemo(() => Children.toArray(children), [children]);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [stepSize, setStepSize] = useState(0);
  const maxIndex = Math.max(0, slides.length - cardsPerView);
  const isStatic = maxIndex === 0;
  const previousDisabled = activeIndex <= 0;
  const nextDisabled = activeIndex >= maxIndex;

  const measureStep = useCallback(() => {
    const track = trackRef.current;
    const firstSlide = track?.querySelector<HTMLElement>("[data-pack-slide]");

    if (!track || !firstSlide) {
      return;
    }

    const computed = window.getComputedStyle(track);
    const gap = Number.parseFloat(computed.columnGap || computed.gap || "0") || 0;
    setStepSize(firstSlide.getBoundingClientRect().width + gap);
  }, []);

  useEffect(() => {
    const updateLayout = () => {
      setCardsPerView(getCardsPerView());
      window.requestAnimationFrame(measureStep);
    };
    const debouncedUpdateLayout = debounce(updateLayout, 150);
    const debouncedMeasureStep = debounce(measureStep, 150);

    updateLayout();
    window.addEventListener("resize", debouncedUpdateLayout);

    const resizeObserver = new ResizeObserver(debouncedMeasureStep);
    if (trackRef.current) {
      resizeObserver.observe(trackRef.current);
    }

    return () => {
      window.removeEventListener("resize", debouncedUpdateLayout);
      resizeObserver.disconnect();
    };
  }, [measureStep]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  function goPrevious() {
    setActiveIndex((current) => Math.max(0, current - 1));
  }

  function goNext() {
    setActiveIndex((current) => Math.min(maxIndex, current + 1));
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;

    if (!start) {
      return;
    }

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      goNext();
    } else {
      goPrevious();
    }
  }

  return (
    <div className={[styles.packSlider, isStatic ? styles.packSliderStatic : ""].filter(Boolean).join(" ")}>
      <button
        type="button"
        className={[styles.packSliderArrow, styles.packSliderArrowPrevious].join(" ")}
        onClick={goPrevious}
        disabled={previousDisabled}
        aria-disabled={previousDisabled}
        aria-label="Previous pack"
      >
        <ChevronLeftIcon />
      </button>

      <div
        className={styles.packSliderViewport}
        aria-live="polite"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <span className="sr-only">
          Showing pack {Math.min(activeIndex + 1, slides.length)} of {slides.length}
        </span>
        <div
          className={styles.packSliderTrack}
          ref={trackRef}
          style={{ transform: `translate3d(-${activeIndex * stepSize}px, 0, 0)` }}
        >
          {slides.map((slide, index) => (
            <div className={styles.packSlide} data-pack-slide key={index}>
              {slide}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={[styles.packSliderArrow, styles.packSliderArrowNext].join(" ")}
        onClick={goNext}
        disabled={nextDisabled}
        aria-disabled={nextDisabled}
        aria-label="Next pack"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
