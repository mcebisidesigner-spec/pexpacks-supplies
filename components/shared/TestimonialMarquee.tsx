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
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TestimonialMarquee({ items }: TestimonialMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepSize, setStepSize] = useState(0);
  const [maxScrollOffset, setMaxScrollOffset] = useState(0);

  const maxIndex = maxScrollOffset > 0 ? Math.max(0, items.length - 1) : 0;
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
    const cardWidth = firstSlide.getBoundingClientRect().width;
    const step = cardWidth + gap;
    setStepSize(step);

    const viewportWidth =
      track.parentElement?.getBoundingClientRect().width || 0;
    const trackScrollWidth = track.scrollWidth;
    const maxScroll = Math.max(0, trackScrollWidth - viewportWidth + 8);
    setMaxScrollOffset(maxScroll);
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

  const getTranslateX = (index: number) => {
    if (maxScrollOffset <= 0) return 0;
    if (index >= maxIndex) {
      return maxScrollOffset;
    }
    return Math.min(index * stepSize, maxScrollOffset);
  };

  function goPrevious() {
    setActiveIndex((current) => Math.max(0, current - 1));
  }

  function goNext() {
    setActiveIndex((current) => Math.min(maxIndex, current + 1));
  }

  const handleDotClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const index = Number(event.currentTarget.dataset.index);
    setActiveIndex(index);
  };

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current;
    if (!start) {
      return;
    }
    const touch = event.changedTouches[0];
    touchStartRef.current = null;

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
        aria-label="Previous testimonial"
      >
        <ChevronLeftIcon />
      </button>

      <div
        className={styles.viewport}
        aria-live="polite"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={styles.track}
          ref={trackRef}
          style={{
            transform: `translate3d(-${getTranslateX(activeIndex)}px, 0, 0)`,
          }}
        >
          {items.map((item) => (
            <article className={styles.testimonialCard} key={item.id}>
              {/* Decorative subtle quote watermark */}
              <div className={styles.quoteWatermark} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              <div className={styles.testimonialTop}>
                {item.avatar ? (
                  <Image
                    src={item.avatar}
                    width={48}
                    height={48}
                    alt={`${item.name} avatar`}
                    className={styles.avatar}
                    placeholder="blur"
                    blurDataURL={IMAGE_BLUR_DATA_URL}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.avatarFallback} aria-hidden="true">
                    {getInitials(item.name)}
                  </div>
                )}
                <div className={styles.testimonialAuthor}>
                  <h3 className={styles.testimonialName}>{item.name}</h3>
                  <span className={styles.testimonialRole}>{item.role}</span>
                  {item.schoolName || item.context ? (
                    <span className={styles.testimonialSchool}>
                      <svg
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className={styles.schoolIcon}
                        aria-hidden="true"
                      >
                        <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.915l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0 1 1h.5a.5.5 0 0 0 0-1H15V6.784a.5.5 0 0 0-.211-.409l-6.578-4.328zM8 3.293 13.736 6 8 8.293 2.264 6 8 3.293zM2.5 7.747l5.289 2.116a.5.5 0 0 0 .422 0L13.5 7.747V10.5a.5.5 0 0 1-.223.416l-5 3.333a.5.5 0 0 1-.554 0l-5-3.333A.5.5 0 0 1 2.5 10.5V7.747z" />
                      </svg>
                      {item.schoolName || item.context}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className={styles.ratingRow}>
                <div
                  className={styles.stars}
                  aria-label={`${item.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 20 20"
                      className={
                        i < item.rating ? styles.starFilled : styles.starEmpty
                      }
                    >
                      <path d="M10 1.5l2.5 5.1 5.6.8-4 3.9.9 5.6L10 14.1l-5 2.6.9-5.6-4-3.9 5.6-.8z" />
                    </svg>
                  ))}
                </div>
                <span className={styles.ratingScore}>{item.rating}.0</span>
              </div>

              <blockquote className={styles.quote}>
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <div className={styles.cardFooter}>
                <span className={styles.verifiedBadge}>
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className={styles.verifiedIcon}
                    aria-hidden="true"
                  >
                    <path d="M13.485 1.431a1.473 1.473 0 0 0-2.104-.955.712.712 0 0 1-.773-.105 1.474 1.474 0 0 0-2.216 0 .712.712 0 0 1-.773.105 1.474 1.474 0 0 0-2.104.955.713.713 0 0 1-.618.497 1.473 1.473 0 0 0-1.848 1.488.712.712 0 0 1-.362.705 1.473 1.473 0 0 0-.825 2.067.712.712 0 0 1 0 .774 1.473 1.473 0 0 0 .825 2.067.712.712 0 0 1 .362.705 1.473 1.473 0 0 0 1.848 1.488.713.713 0 0 1 .618.497 1.474 1.474 0 0 0 2.104.955.712.712 0 0 1 .773.105 1.474 1.474 0 0 0 2.216 0 .712.712 0 0 1 .773-.105 1.474 1.474 0 0 0 2.104-.955.713.713 0 0 1 .618-.497 1.473 1.473 0 0 0 1.848-1.488.712.712 0 0 1 .362-.705 1.473 1.473 0 0 0 .825-2.067.712.712 0 0 1 0-.774 1.473 1.473 0 0 0-.825-2.067.712.712 0 0 1-.362-.705 1.473 1.473 0 0 0-1.848-1.488.713.713 0 0 1-.618-.497zM6.924 10.636 4.364 8.076l.99-.99 1.57 1.57 4.1-4.1.99.99-5.09 5.09z" />
                  </svg>
                  Verified Experience
                </span>
              </div>
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
        aria-label="Next testimonial"
      >
        <ChevronRightIcon />
      </button>

      {maxIndex > 0 ? (
        <div
          className={styles.trackingBar}
          role="tablist"
          aria-label="Testimonial slides"
        >
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to testimonial ${i + 1}`}
              className={[
                styles.trackingDot,
                i === activeIndex ? styles.trackingDotActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-index={i}
              onClick={handleDotClick}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
