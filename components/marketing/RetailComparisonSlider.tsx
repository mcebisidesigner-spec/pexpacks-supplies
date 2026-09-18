"use client";

import type { CSSProperties, ChangeEvent } from "react";
import { useState } from "react";
import { AnimatedVehicle } from "./AnimatedVehicle";
import { ChevronLeft, ChevronRight } from "lucide-react";

const retailPoints = [
  { stat: "3-4 hrs", text: "Driving, parking, queuing" },
  { stat: "Risk", text: "Missing or sold-out items" },
  { stat: "Extra", text: "Impulse buys and repeat trips" },
];

const pexpacksPoints = [
  { stat: "2 min", text: "Find the school pack online" },
  { stat: "Exact", text: "Packed to the grade list" },
  { stat: "Ready", text: "Labelled, checked, and delivered" },
];

export function RetailComparisonSlider() {
  const [position, setPosition] = useState(52);
  const sliderStyle = {
    "--comparison-position": `${position}%`,
  } as CSSProperties;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setPosition(Number(event.target.value));
  }

  const retailScale =
    position < 50 ? 1 : Math.max(0.9, 1 - (position - 50) * 0.005);
  const pexpacksScale =
    position > 50 ? 1 : Math.max(0.9, 1 - (50 - position) * 0.005);

  return (
    <div
      className="mt-8 md:mt-[34px] border border-[rgba(26,42,64,0.12)] rounded-[var(--radius-image)] p-4 sm:p-5 md:p-6 bg-background shadow-[0_22px_52px_rgba(26,42,64,0.1)]"
      style={sliderStyle}
    >
      <div className="grid gap-2 mb-4 md:flex md:items-end md:justify-between md:gap-4 md:mb-[18px]">
        <p className="m-0 text-[#219e9a] text-xs font-extrabold tracking-[0.08em] uppercase">
          Drag the line
        </p>
        <strong className="text-primary text-xl sm:text-2xl md:text-3xl font-heading leading-tight text-left md:text-right font-extrabold">
          Retail run vs. Pexpacks ready
        </strong>
      </div>

      <div className="relative min-h-[430px] md:min-h-[320px] rounded-[var(--radius-card-compact)] overflow-hidden bg-primary isolate group/stage">
        {/* Retail Pane */}
        <div
          className="absolute inset-0 p-5 md:p-8 lg:p-[42px] grid content-end md:content-center gap-4 md:gap-[18px] transition-transform duration-150 ease-out bg-[linear-gradient(90deg,rgba(255,111,89,0.14),transparent_46%),linear-gradient(135deg,#fff7f2,#ffffff)] text-primary"
          style={{ transform: `scale(${retailScale})` }}
        >
          <span className="w-fit rounded-full px-3 py-1.5 bg-white/90 text-primary text-xs font-extrabold shadow-[0_10px_24px_rgba(26,42,64,0.08)]">
            Retail shopping
          </span>
          <h3 className="max-w-[620px] m-0 font-heading text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-extrabold leading-tight tracking-normal">
            More trips. More gaps. More last-minute stress.
          </h3>
          <ul className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 max-w-[760px]">
            {retailPoints.map((point) => (
              <li
                key={point.text}
                className="grid grid-cols-[68px_1fr] md:grid-cols-1 items-center md:items-start gap-1.5 md:gap-2 min-h-auto md:min-h-[82px] border border-[rgba(26,42,64,0.12)] rounded-lg p-2.5 md:p-3 bg-white/90 text-primary text-xs font-bold leading-snug"
              >
                <span className="text-[#ff6f59] font-heading text-base md:text-lg font-black leading-none">
                  {point.stat}
                </span>
                <span>{point.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pexpacks Pane */}
        <div
          className="absolute inset-0 p-5 md:p-8 lg:p-[42px] grid content-end md:content-center gap-4 md:gap-[18px] bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.16)),linear-gradient(135deg,#168f84,var(--pex-primary))] text-white [clip-path:inset(0_0_0_var(--comparison-position))] transition-[clip-path,transform] duration-200 ease-out"
          style={{ transform: `scale(${pexpacksScale})` }}
        >
          <span className="w-fit rounded-full px-3 py-1.5 bg-white/20 text-white text-xs font-extrabold">
            Pexpacks experience
          </span>
          <h3 className="max-w-[620px] m-0 font-heading text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-extrabold leading-tight tracking-normal">
            The correct pack, sorted before school starts.
          </h3>
          <ul className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 max-w-[760px]">
            {pexpacksPoints.map((point) => (
              <li
                key={point.text}
                className="grid grid-cols-[68px_1fr] md:grid-cols-1 items-center md:items-start gap-1.5 md:gap-2 min-h-auto md:min-h-[82px] border border-white/15 rounded-lg p-2.5 md:p-3 bg-white/15 text-white text-xs font-bold leading-snug"
              >
                <span className="text-white font-heading text-base md:text-lg font-black leading-none">
                  {point.stat}
                </span>
                <span>{point.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Handle */}
        <div
          className="absolute z-[3] top-0 bottom-0 left-[var(--comparison-position)] w-[3px] bg-white -translate-x-1/2 shadow-[0_0_0_1px_rgba(26,42,64,0.16)] pointer-events-none"
          aria-hidden="true"
        >
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[54px] h-[54px] rounded-full bg-white shadow-[0_18px_34px_rgba(26,42,64,0.22)] transition-all duration-200 flex items-center justify-center gap-0.5 group-hover/stage:scale-105 group-focus-within/stage:scale-105 group-focus-within/stage:ring-4 group-focus-within/stage:ring-[#219e9a]/30">
            <ChevronLeft className="w-4 h-4 text-primary stroke-[2.5]" />
            <ChevronRight className="w-4 h-4 text-primary stroke-[2.5]" />
          </span>
        </div>

        {/* Range input */}
        <input
          id="retail-comparison-position"
          name="comparisonPosition"
          className="absolute z-[4] inset-0 w-full h-full opacity-[0.001] cursor-ew-resize focus:outline-none"
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={handleChange}
          aria-label="Compare retail shopping with the Pexpacks experience"
        />
      </div>

      <AnimatedVehicle position={position} />

      <div className="mt-3 flex justify-between gap-4 text-muted-foreground text-xs font-extrabold">
        <span>Retail stress</span>
        <span>Pexpacks ready</span>
      </div>
    </div>
  );
}
