"use client";

import type { CSSProperties, ChangeEvent } from "react";
import { useState } from "react";
import { AnimatedVehicle } from "./AnimatedVehicle";
import clsx from "clsx";
import styles from "./RetailComparisonSlider.module.css";

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
    <div className={styles.comparison} style={sliderStyle}>
      <div className={styles.header}>
        <p>Drag the line</p>
        <strong>Retail run vs. Pexpacks ready</strong>
      </div>

      <div className={styles.stage}>
        <div
          className={clsx(styles.pane, styles.retailPane)}
          style={{ transform: `scale(${retailScale})` }}
        >
          <span className={styles.paneLabel}>Retail shopping</span>
          <h3>More trips. More gaps. More last-minute stress.</h3>
          <ul>
            {retailPoints.map((point) => (
              <li key={point.text}>
                <span className={styles.pointStat}>{point.stat}</span>
                <span>{point.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={clsx(styles.pane, styles.pexpacksPane)}
          style={{ transform: `scale(${pexpacksScale})` }}
        >
          <span className={styles.paneLabel}>Pexpacks experience</span>
          <h3>The correct pack, sorted before school starts.</h3>
          <ul>
            {pexpacksPoints.map((point) => (
              <li key={point.text}>
                <span className={styles.pointStat}>{point.stat}</span>
                <span>{point.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.handle} aria-hidden="true">
          <span />
        </div>
        <input
          id="retail-comparison-position"
          name="comparisonPosition"
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
