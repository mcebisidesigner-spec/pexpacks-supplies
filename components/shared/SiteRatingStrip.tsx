"use client";

import { usePathname } from "next/navigation";
import { RatingStrip } from "@/components/shared/RatingStrip";

export function SiteRatingStrip() {
  const pathname = usePathname();
  const text = pathname === "/office" ? "Entrepreneurs love the convenience" : undefined;

  return (
    <div className="site-rating-strip" aria-label="Pexpacks parent rating">
      <RatingStrip text={text} />
    </div>
  );
}