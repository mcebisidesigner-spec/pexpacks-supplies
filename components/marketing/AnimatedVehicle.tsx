"use client";

import styles from "./AnimatedVehicle.module.css";

type AnimatedVehicleProps = {
  position: number;
};

export function AnimatedVehicle({ position }: AnimatedVehicleProps) {
  const isFull = position > 50;

  return (
    <div className={styles.trackContainer} aria-hidden="true">
      <div className={styles.track}>
        <div
          className={styles.vehicleWrapper}
          style={{ left: `${position}%` }}
        >
          <svg
            className={styles.vehicleSvg}
            viewBox="0 0 130 60"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Cargo Boxes */}
            <g
              className={`${styles.cargo} ${
                isFull ? styles.cargoFull : styles.cargoEmpty
              }`}
            >
              {/* Box 1 */}
              <rect x="15" y="10" width="20" height="15" fill="#f4a261" stroke="#e76f51" strokeWidth="1.5" rx="1" />
              <line x1="15" y1="17" x2="35" y2="17" stroke="#e76f51" strokeWidth="1.5" />
              {/* Box 2 */}
              <rect x="38" y="15" width="25" height="10" fill="#e9c46a" stroke="#f4a261" strokeWidth="1.5" rx="1" />
              <line x1="50" y1="15" x2="50" y2="25" stroke="#f4a261" strokeWidth="1.5" />
              {/* Box 3 */}
              <rect x="25" y="0" width="15" height="10" fill="var(--pex-keppel)" stroke="#264653" strokeWidth="1.5" rx="1" />
            </g>

            {/* Bed / Tailgate */}
            <path
              d="M 10 25 L 70 25 L 70 40 L 10 40 C 7 40 5 38 5 35 L 5 25 Z"
              fill="var(--pex-primary)"
            />

            {/* Cab */}
            <path
              d="M 70 30 L 70 15 C 70 12 72 10 75 10 L 95 10 C 98 10 100 12 105 20 L 115 20 C 118 20 120 22 120 25 L 120 40 L 70 40 Z"
              fill="var(--pex-keppel)"
            />
            
            {/* Cab Window */}
            <path d="M 75 13 L 93 13 L 98 20 L 75 20 Z" fill="#ffffff" opacity="0.9" />

            {/* Wheels */}
            <circle cx="30" cy="40" r="10" fill="#1a2a40" />
            <circle cx="30" cy="40" r="4" fill="#ffffff" />
            
            <circle cx="95" cy="40" r="10" fill="#1a2a40" />
            <circle cx="95" cy="40" r="4" fill="#ffffff" />

            {/* Speed Lines (appear when moving fast, but static for now) */}
            <g className={`${styles.speedLines} ${position > 50 ? styles.movingRight : styles.movingLeft}`}>
              <line x1="125" y1="35" x2="135" y2="35" stroke="#ccc" strokeWidth="2" strokeLinecap="round" />
              <line x1="122" y1="28" x2="130" y2="28" stroke="#ccc" strokeWidth="2" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
