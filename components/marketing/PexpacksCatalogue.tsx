"use client";

import { useMemo, useState } from "react";
import { pexpacks, pexpacksCategories } from "@/data/packs";
import { PackCard } from "./PackCard";
import styles from "./Marketing.module.css";

export function PexpacksCatalogue() {
  const [activeCategory, setActiveCategory] = useState("All");

  const visiblePacks = useMemo(
    () => pexpacks.filter((pack) => activeCategory === "All" || pack.subcategory === activeCategory),
    [activeCategory]
  );

  return (
    <>
      <div className={styles.filterBar} role="list" aria-label="Filter PexPacks by category">
        {pexpacksCategories.map((category) => (
          <button
            className={[styles.filterChip, activeCategory === category ? styles.filterChipActive : ""].filter(Boolean).join(" ")}
            type="button"
            onClick={() => setActiveCategory(category)}
            aria-pressed={activeCategory === category}
            key={category}
          >
            {category}
          </button>
        ))}
      </div>
      <div className={styles.packGrid}>
        {visiblePacks.map((pack) => (
          <PackCard pack={pack} key={pack.id} />
        ))}
      </div>
    </>
  );
}
