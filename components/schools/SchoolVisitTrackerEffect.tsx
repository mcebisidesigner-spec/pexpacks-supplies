"use client";

import { useEffect } from "react";
import { saveSchoolVisit } from "./schoolVisitTracker";

type SchoolVisitTrackerEffectProps = {
  schoolName: string;
  schoolSlug: string;
  image?: string | null;
  city?: string | null;
};

export function SchoolVisitTrackerEffect({
  schoolName,
  schoolSlug,
  image,
  city,
}: SchoolVisitTrackerEffectProps) {
  useEffect(() => {
    saveSchoolVisit({
      schoolName,
      schoolSlug,
      image: image || null,
      city: city || undefined,
    });
  }, [schoolName, schoolSlug, image, city]);

  return null;
}
