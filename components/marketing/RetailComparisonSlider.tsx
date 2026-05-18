"use client";

import type { CSSProperties, ChangeEvent } from "react";
import { useState } from "react";
import { AnimatedVehicle } from "./AnimatedVehicle";
import styles from "./RetailComparisonSlider.module.css";

const retailPoints = [
  { text: "Long queues", icon: "🛒" },
  { text: "Out-of-stock items", icon: "🚫" },
  { text: "4+ hours lost", icon: "⏳" },
];

const pexpacksPoints = [
  { text: "One click", icon: "🖱️" },
  { text: "Exact list match", icon: "✅" },
  { text: "Delivered ready", icon: "📦" },
];

export function RetailComparisonSlider() {
  const [position, setPosition] = useState(52);
  const sliderStyle = {
    "--comparison-position": `${position}%`,
  } as CSSProperties;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setPosition(Number(event.target.value));
  }

  // Calculate dynamic scales based on position (0 to 100)
  // When position is near 0, retail is 1 (fully visible/scaled), pexpacks is 0.8
  const retailScale = position < 50 ? 1 : Math.max(0.9, 1 - (position - 50) * 0.005);
  const pexpacksScale = position > 50 ? 1 : Math.max(0.9, 1 - (50 - position) * 0.005);

  return (
    <div className={styles.comparison} style={sliderStyle}>
      <div className={styles.header}>
        <p>Drag to compare</p>
        <strong>Retail vs. Pexpacks</strong>
      </div>

      <div className={styles.stage}>
        <div 
          className={`${styles.pane} ${styles.retailPane}`}
          style={{ transform: `scale(${retailScale})`, transition: 'transform 0.1s ease-out' }}
        >
          <span className={styles.paneLabel}>Retail experience</span>
          <h3>Drive, queue, check every shelf.</h3>
          <ul>
            {retailPoints.map((point) => (
              <li key={point.text}>
                <span className={styles.pointIcon} aria-hidden="true">{point.icon}</span> {point.text}
              </li>
            ))}
          </ul>
        </div>

        <div 
          className={`${styles.pane} ${styles.pexpacksPane}`}
          style={{ transform: `scale(${pexpacksScale})`, transition: 'transform 0.1s ease-out' }}
        >
          <span className={styles.paneLabel}>Pexpacks experience</span>
          <h3>Search, choose, get it packed.</h3>
          <ul>
            {pexpacksPoints.map((point) => (
              <li key={point.text}>
                <span className={styles.pointIcon} aria-hidden="true">{point.icon}</span> {point.text}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.handle} aria-hidden="true">
          <span />
        </div>
        <input
          className={styles.range}
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={handleChange}
          aria-label="Compare retail shopping with the Pexpacks experience"
        />
      </div>

      <AnimatedVehicle position={position} />

      <div className={styles.caption}>
        <span>Retail stress</span>
        <span>Pexpacks ready</span>
      </div>
    </div>
  );
}
