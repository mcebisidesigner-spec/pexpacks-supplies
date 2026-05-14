"use client";

import Image from "next/image";
import {
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Testimonial } from "@/data/testimonials";
import { debounce } from "@/lib/debounce";
import styles from "./Marquee.module.css";

type TestimonialMarqueeProps = {
  items: Testimonial[];
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

export function TestimonialMarquee({ items }: TestimonialMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepSize, setStepSize] = useState(0);
  const [visibleCards, setVisibleCards] = useState(1);

  const maxIndex = Math.max(0, items.length - visibleCards);
  const previousDisabled = activeIndex <= 0;
  const nextDisabled = activeIndex >= maxIndex;

  const measureStep = useCallback(() => {
    const track = trackRef.current;
    const firstSlide = track?.querySelector<HTMLElement>("article");

    if (!track || !firstSlide) {
      return;
    }

    const computed = window.getComputedStyle(track);
    const gap =
      Number.parseFloat(computed.columnGap || computed.gap || "0") || 0;
    setStepSize(firstSlide.getBoundingClientRect().width + gap);

    const viewportWidth =
      track.parentElement?.getBoundingClientRect().width || 0;
    const cards = Math.floor(
      viewportWidth / (firstSlide.getBoundingClientRect().width + gap),
    );
    setVisibleCards(Math.max(1, cards));
  }, []);

  useEffect(() => {
    const debouncedMeasureStep = debounce(measureStep, 150);

    measureStep();
    window.addEventListener("resize", debouncedMeasureStep);

    const resizeObserver = new ResizeObserver(debouncedMeasureStep);
    if (trackRef.current) {
      resizeObserver.observe(trackRef.current);
    }

    return () => {
      window.removeEventListener("resize", debouncedMeasureStep);
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
    <div className={styles.slider} aria-label="Pexpacks testimonials">
      <button
        type="button"
        className={[styles.arrow, styles.arrowPrevious].join(" ")}
        onClick={goPrevious}
        disabled={previousDisabled}
        aria-disabled={previousDisabled}
        aria-label="Previous testimonial">
        <ChevronLeftIcon />
      </button>

      <div
        className={styles.viewport}
        aria-live="polite"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}>
        <div
          className={styles.track}
          ref={trackRef}
          style={{
            transform: `translate3d(-${activeIndex * stepSize}px, 0, 0)`,
          }}>
          {items.map((item) => (
            <article className={styles.testimonialCard} key={item.id}>
              <div className={styles.testimonialTop}>
                {item.avatar ?
                  <Image
                    src={item.avatar}
                    width={54}
                    height={54}
                    alt="testmonials"
                    className={styles.avatar}
                    loading="lazy"
                  />
                : null}
                <div>
                  <h3 className={styles.testimonialName}>{item.name}</h3>
                  <span className={styles.testimonialRole}>{item.role}</span>
                  <span className={styles.testimonialContext}>
                    {item.context}
                  </span>
                </div>
              </div>
              <p className={styles.quote}>&ldquo;{item.quote}&rdquo;</p>
            </article>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={[styles.arrow, styles.arrowNext].join(" ")}
        onClick={goNext}
        disabled={nextDisabled}
        aria-disabled={nextDisabled}
        aria-label="Next testimonial">
        <ChevronRightIcon />
      </button>
      <div className={styles.trackingBar} aria-hidden="true">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <div
            key={i}
            className={[
              styles.trackingDot,
              i === activeIndex ? styles.trackingDotActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setActiveIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
