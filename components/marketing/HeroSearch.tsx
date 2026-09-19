"use client";

import { SchoolSearchBox } from "@/components/ui/SchoolSearchBox";

type HeroSearchProps = {
  onResultClick?: () => void;
  source?: "home" | "tray";
};

/**
 * HeroSearch — thin wrapper around the shared SchoolSearchBox.
 * Used on the homepage hero and inside the pack tray drawer.
 */
export function HeroSearch({
  onResultClick,
  source = "home",
}: HeroSearchProps = {}) {
  return (
    <SchoolSearchBox
      source={source}
      onResultClick={onResultClick}
    />
  );
}
