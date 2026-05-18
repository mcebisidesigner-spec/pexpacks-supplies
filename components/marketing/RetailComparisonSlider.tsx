"use client";

import type { CSSProperties, ChangeEvent } from "react";
import { useState } from "react";
import styles from "./RetailComparisonSlider.module.css";

const retailPoints = ["Long queues", "Out-of-stock items", "4+ hours lost"];
const pexpacksPoints = ["One click", "Exact list match", "Delivered ready"];

export function RetailComparisonSlider() {
  const [position, setPosition] = useState(52);
  const sliderStyle = {
    "--comparison-position": `${position}%`,
  } as CSSProperties;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setPosition(Number(event.target.value));
  }

  return (
    <div className={styles.comparison} style={sliderStyle}>
      <div className={styles.header}>
        <p>Drag to compare</p>
        <strong>Retail vs. Pexpacks</strong>
      </div>

      <div className={styles.stage}>
        <div className={`${styles.pane} ${styles.retailPane}`}>
          <span className={styles.paneLabel}>Retail experience</span>
          <h3>Drive, queue, check every shelf.</h3>
          <ul>
            {retailPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className={`${styles.pane} ${styles.pexpacksPane}`}>
          <span className={styles.paneLabel}>Pexpacks experience</span>
          <h3>Search, choose, get it packed.</h3>
          <ul>
            {pexpacksPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className={styles.handle} aria-hidden="true">
          <span />
        </div>
        <input
          className={styles.range}
          type="range"
          min="12"
          max="88"
          value={position}
          onChange={handleChange}
          aria-label="Compare retail shopping with the Pexpacks experience"
        />
      </div>

      <div className={styles.caption}>
        <span>Retail stress</span>
        <span>Pexpacks ready</span>
      </div>
    </div>
  );
}
