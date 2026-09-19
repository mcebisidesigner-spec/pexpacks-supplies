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
    <div className="grid grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-5 relative max-md:flex max-md:flex-col max-md:gap-4" aria-label="Pexpacks testimonials">
      <button
        type="button"
        className="w-[46px] h-[46px] border-[1.5px] border-[rgba(26,42,64,0.12)] rounded-full bg-[var(--pex-bg)] text-[var(--pex-navy)] shadow-[0_4px_14px_rgba(26,42,64,0.07)] grid place-items-center cursor-pointer transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 z-[2] max-md:hidden hover:not(:disabled):bg-[var(--pex-navy)] hover:not(:disabled):text-white hover:not(:disabled):border-[var(--pex-navy)] hover:not(:disabled):scale-105 hover:not(:disabled):shadow-[0_8px_24px_rgba(26,42,64,0.18)] hover:not(:disabled):[&>svg]:-translate-x-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:border-[rgba(26,42,64,0.06)] disabled:bg-[rgba(26,42,64,0.03)] focus-visible:outline-3 focus-visible:outline-[rgba(26,122,119,0.55)] focus-visible:outline-offset-3 [&>svg]:w-[22px] [&>svg]:h-[22px] [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:stroke-[2.4] [&>svg]:transition-transform"
        onClick={goPrevious}
        disabled={previousDisabled}
        aria-disabled={previousDisabled}
        aria-label="Previous testimonial"
      >
        <ChevronLeftIcon />
      </button>

      <div
        className="min-w-0 overflow-hidden py-5 px-3.5 -my-5 -mx-3.5 max-md:w-[calc(100%+28px)] max-md:-my-3.5 max-md:-mx-3.5 max-md:p-3.5"
        aria-live="polite"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex gap-5 touch-pan-y will-change-transform transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] w-max motion-reduce:transition-none"
          ref={trackRef}
          style={{
            transform: `translate3d(-${getTranslateX(activeIndex)}px, 0, 0)`,
          }}
        >
          {items.map((item) => (
            <article className="group w-[min(380px,84vw)] max-md:w-[min(320px,82vw)] min-h-[280px] max-md:min-h-[260px] p-[clamp(22px,3.5vw,26px)] border border-[rgba(26,42,64,0.08)] rounded-[var(--radius-card)] bg-[var(--pex-bg)] shadow-[0_10px_30px_rgba(26,42,64,0.05)] text-[var(--pex-text)] flex flex-col gap-3.5 relative overflow-hidden transition-all duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(26,42,64,0.1)] hover:border-[rgba(26,122,119,0.24)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3.5px] before:bg-gradient-to-r before:from-[var(--pex-keppel)] before:to-[var(--pex-coral)] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-[280ms]" key={item.id}>
              {/* Decorative subtle quote watermark */}
              <div className="absolute top-[18px] right-5 w-8 h-8 text-[rgba(26,122,119,0.09)] pointer-events-none transition-all duration-[280ms] ease-out group-hover:text-[rgba(26,122,119,0.16)] group-hover:scale-110 group-hover:-rotate-4 [&>svg]:w-full [&>svg]:h-full" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              <div className="flex items-center gap-3.5 pr-9">
                {item.avatar ? (
                  <Image
                    src={item.avatar}
                    width={48}
                    height={48}
                    alt={`${item.name} avatar`}
                    className="shrink-0 w-12 h-12 rounded-full object-cover border-2 border-[var(--pex-keppel)] shadow-[0_2px_8px_rgba(26,122,119,0.18)]"
                    placeholder="blur"
                    blurDataURL={IMAGE_BLUR_DATA_URL}
                    loading="lazy"
                  />
                ) : (
                  <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[rgba(26,122,119,0.12)] to-[rgba(26,122,119,0.22)] text-[var(--pex-keppel)] font-extrabold text-base tracking-tight grid place-items-center border-2 border-[rgba(26,122,119,0.28)] shadow-[0_2px_8px_rgba(26,122,119,0.1)] select-none" aria-hidden="true">
                    {getInitials(item.name)}
                  </div>
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <h3 className="m-0 text-lg font-extrabold text-[var(--pex-navy)] leading-tight tracking-tight">{item.name}</h3>
                  <span className="block text-[var(--pex-keppel)] text-[13px] font-bold leading-snug tracking-tight">{item.role}</span>
                  {item.schoolName || item.context ? (
                    <span className="inline-flex items-center gap-1 text-[var(--pex-text-muted)] text-xs font-semibold leading-snug mt-px">
                      <svg
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="w-[13px] h-[13px] text-[var(--pex-keppel)] shrink-0"
                        aria-hidden="true"
                      >
                        <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.915l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0 1 1h.5a.5.5 0 0 0 0-1H15V6.784a.5.5 0 0 0-.211-.409l-6.578-4.328zM8 3.293 13.736 6 8 8.293 2.264 6 8 3.293zM2.5 7.747l5.289 2.116a.5.5 0 0 0 .422 0L13.5 7.747V10.5a.5.5 0 0 1-.223.416l-5 3.333a.5.5 0 0 1-.554 0l-5-3.333A.5.5 0 0 1 2.5 10.5V7.747z" />
                      </svg>
                      {item.schoolName || item.context}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="flex gap-[3px] items-center [&>svg]:w-[17px] [&>svg]:h-[17px]"
                  role="img"
                  aria-label={`${item.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 20 20"
                      className={
                        i < item.rating ? "fill-[var(--pex-sme-amber,#f59e0b)]" : "fill-[rgba(26,42,64,0.12)]"
                      }
                    >
                      <path d="M10 1.5l2.5 5.1 5.6.8-4 3.9.9 5.6L10 14.1l-5 2.6.9-5.6-4-3.9 5.6-.8z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-extrabold text-[#a86c00] bg-[rgba(245,166,35,0.14)] px-[7px] py-px rounded-full leading-normal">{item.rating}.0</span>
              </div>

              <blockquote className="m-0 text-[var(--pex-text)] text-[14.5px] leading-relaxed font-normal flex-1">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <div className="flex items-center justify-between pt-3 border-t border-[rgba(26,42,64,0.06)] mt-auto">
                <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--pex-keppel)] bg-[rgba(26,122,119,0.08)] px-2.5 py-[3px] rounded-full">
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-[13px] h-[13px]"
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
        className="w-[46px] h-[46px] border-[1.5px] border-[rgba(26,42,64,0.12)] rounded-full bg-[var(--pex-bg)] text-[var(--pex-navy)] shadow-[0_4px_14px_rgba(26,42,64,0.07)] grid place-items-center cursor-pointer transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 z-[2] max-md:hidden hover:not(:disabled):bg-[var(--pex-navy)] hover:not(:disabled):text-white hover:not(:disabled):border-[var(--pex-navy)] hover:not(:disabled):scale-105 hover:not(:disabled):shadow-[0_8px_24px_rgba(26,42,64,0.18)] hover:not(:disabled):[&>svg]:translate-x-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:border-[rgba(26,42,64,0.06)] disabled:bg-[rgba(26,42,64,0.03)] focus-visible:outline-3 focus-visible:outline-[rgba(26,122,119,0.55)] focus-visible:outline-offset-3 [&>svg]:w-[22px] [&>svg]:h-[22px] [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:stroke-[2.4] [&>svg]:transition-transform"
        onClick={goNext}
        disabled={nextDisabled}
        aria-disabled={nextDisabled}
        aria-label="Next testimonial"
      >
        <ChevronRightIcon />
      </button>

      {maxIndex > 0 ? (
        <div
          className="flex justify-center items-center gap-1.5 w-full mt-3.5 col-span-full"
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
              className={`relative w-8 h-7 border-none p-0 appearance-none bg-transparent transition-all duration-200 cursor-pointer before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-3.5 before:h-1 before:rounded-full before:bg-[rgba(26,42,64,0.15)] hover:before:bg-[rgba(26,122,119,0.4)] before:transition-all before:duration-200 ${
                i === activeIndex ? "before:!w-7 before:!bg-[var(--pex-keppel)]" : ""
              }`}
              data-index={i}
              onClick={handleDotClick}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
