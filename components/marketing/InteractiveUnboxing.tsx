"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import styles from "./InteractiveUnboxing.module.css";

const hotspots = [
  {
    id: "books",
    title: "Pre-covered Books",
    description: "Exercise books can be covered with heavy-duty plastic and labelled via Pexcover.",
    top: "35%",
    left: "40%",
  },
  {
    id: "stationery",
    title: "Premium Quality",
    description: "Only trusted brand-name stationery exactly matching the school's requirements.",
    top: "60%",
    left: "65%",
  },
  {
    id: "box",
    title: "Eco-friendly Box",
    description: "Sturdy, protective packaging ensuring items arrive in pristine condition.",
    top: "75%",
    left: "30%",
  },
  {
    id: "labels",
    title: "Subject Labels",
    description: "Colour-coded subject labels so learners are ready from day one.",
    top: "45%",
    left: "75%",
  },
];

export function InteractiveUnboxing() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>The Pexpacks box</p>
          <h2>Experience the Unboxing</h2>
          <p>
            Hover or tap the pulsing hotspots below to discover what makes a Pexpacks stationery box the ultimate convenience for parents.
          </p>
        </div>

        <div className={styles.interactiveArea}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/unboxing-items.webp"
              alt="Pexpacks stationery box contents"
              fill
              className={styles.image}
              sizes="(min-width: 1024px) 80vw, 100vw"
            />
            
            {hotspots.map((hotspot) => (
              <div 
                key={hotspot.id}
                className={`${styles.hotspot} ${activeHotspot === hotspot.id ? styles.active : ""}`}
                style={{ top: hotspot.top, left: hotspot.left }}
                onMouseEnter={() => setActiveHotspot(hotspot.id)}
                onMouseLeave={() => setActiveHotspot(null)}
                onClick={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
              >
                <button className={styles.hotspotPulse} aria-label={hotspot.title}>
                  <div className={styles.pulseRing}></div>
                  <div className={styles.pulseDot}>+</div>
                </button>
                
                <div className={styles.tooltip}>
                  <h4>{hotspot.title}</h4>
                  <p>{hotspot.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.mobileDetails}>
            {hotspots.map((hotspot) => (
              <div 
                key={`mobile-${hotspot.id}`} 
                className={`${styles.mobileCard} ${activeHotspot === hotspot.id ? styles.activeCard : ""}`}
              >
                <h4>{hotspot.title}</h4>
                <p>{hotspot.description}</p>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <Button href="/schools">Find Your School Pack</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
