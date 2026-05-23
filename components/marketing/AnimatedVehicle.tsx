"use client";

import styles from "./AnimatedVehicle.module.css";

type AnimatedVehicleProps = {
  position: number;
};

export function AnimatedVehicle({ position }: AnimatedVehicleProps) {
  const isPacked = position >= 50;

  return (
    <div className={styles.trackContainer} aria-hidden="true">
      <div className={styles.track}>
        <div className={styles.vehicleWrapper} style={{ left: `${position}%` }}>
          <svg
            className={styles.vehicleSvg}
            viewBox="0 0 150 66"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              className={`${styles.cargo} ${
                isPacked ? styles.cargoPacked : styles.cargoLoose
              }`}
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

            <g className={styles.speedLines}>
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
