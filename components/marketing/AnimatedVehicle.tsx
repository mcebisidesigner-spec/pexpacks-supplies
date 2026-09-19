import type { CSSProperties } from "react";

type AnimatedVehicleProps = {
  position: number;
};

export function AnimatedVehicle({ position }: AnimatedVehicleProps) {
  const cargoProgress = Math.min(1, Math.max(0, position / 50));
  const cargoStyle = {
    "--cargo-opacity": cargoProgress.toFixed(2),
    "--cargo-y": `${Math.round((1 - cargoProgress) * 10)}px`,
    "--cargo-scale": (0.82 + cargoProgress * 0.18).toFixed(2),
  } as CSSProperties;

  return (
    <div
      className="relative mt-[var(--space-4)] pt-[14px] border-t-2 border-dashed border-[rgba(26,42,64,0.1)]"
      aria-hidden="true"
    >
      {/* Track */}
      <div className="relative w-[calc(100%-150px)] h-[66px] mx-auto max-[480px]:w-[calc(100%-116px)] max-[480px]:h-[52px]">
        {/* Vehicle wrapper — position is driven by the parent slider's `position` prop */}
        <div
          className="absolute top-0 w-[150px] -translate-x-1/2 transition-[left] duration-[160ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none max-[480px]:w-[116px]"
          style={{ left: `${position}%` }}
        >
          <svg
            className="block w-full h-auto [filter:drop-shadow(0_12px_18px_rgba(26,42,64,0.16))]"
            viewBox="0 0 150 66"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Cargo — CSS custom properties applied inline via cargoStyle */}
            <g
              style={{
                ...cargoStyle,
                opacity: "var(--cargo-opacity)",
                transform: "translateY(var(--cargo-y)) scale(var(--cargo-scale))",
                transformOrigin: "48px 28px",
                transition:
                  "opacity 0.24s ease, transform 0.24s cubic-bezier(0.2,0.8,0.2,1)",
              }}
            >
              <rect
                x="18"
                y="8"
                width="24"
                height="18"
                rx="2"
                fill="#f4a261"
                stroke="#d95f45"
                strokeWidth="1.5"
              />
              <path d="M18 17H42" stroke="#d95f45" strokeWidth="1.5" />
              <rect
                x="46"
                y="13"
                width="30"
                height="13"
                rx="2"
                fill="#e9c46a"
                stroke="#d99f35"
                strokeWidth="1.5"
              />
              <path d="M61 13V26" stroke="#d99f35" strokeWidth="1.5" />
              <rect
                x="32"
                y="0"
                width="20"
                height="12"
                rx="2"
                fill="var(--pex-keppel)"
                stroke="var(--pex-primary)"
                strokeWidth="1.5"
              />
            </g>

            <path
              d="M10 28H82V45H14C9.6 45 7 42.4 7 38V31C7 29.3 8.3 28 10 28Z"
              fill="var(--pex-primary)"
            />
            <path
              d="M82 45V22C82 17.6 85.6 14 90 14H112C117 14 120.2 17.2 125 25H135C139.4 25 143 28.6 143 33V45H82Z"
              fill="var(--pex-keppel)"
            />
            <path
              d="M90 18H110C113.2 18 115.2 20 118 25H90V18Z"
              fill="#ffffff"
              opacity="0.92"
            />
            <path
              d="M122 29H139"
              stroke="#ffffff"
              strokeOpacity="0.72"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <circle cx="36" cy="46" r="11" fill="var(--pex-primary)" />
            <circle cx="36" cy="46" r="4.5" fill="#ffffff" />
            <circle cx="112" cy="46" r="11" fill="var(--pex-primary)" />
            <circle cx="112" cy="46" r="4.5" fill="#ffffff" />

            {/* Speed lines — vehiclePulse keyframe is defined in globals.css */}
            <g
              style={{
                opacity: 0.72,
                transformOrigin: "center",
                animation: "vehiclePulse 1.4s ease-in-out infinite",
              }}
              className="motion-reduce:[animation:none]"
            >
              <path
                d="M145 38H156"
                stroke="rgba(26, 42, 64, 0.32)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M142 31H151"
                stroke="rgba(26, 42, 64, 0.24)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
