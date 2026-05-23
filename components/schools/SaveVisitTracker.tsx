"use client";

import { useEffect } from "react";
import { saveSchoolVisit } from "./ReturningParentBanner";

type SaveVisitTrackerProps = {
  schoolName: string;
  schoolSlug: string;
  grade: string;
  gradeSlug: string;
};

/**
 * Invisible component that saves the current school/grade visit
 * to localStorage so RecentlyViewedSchools can offer a quick re-order.
 */
export function SaveVisitTracker({
  schoolName,
  schoolSlug,
  grade,
  gradeSlug,
}: SaveVisitTrackerProps) {
  useEffect(() => {
    saveSchoolVisit({ schoolName, schoolSlug, grade, gradeSlug });
  }, [schoolName, schoolSlug, grade, gradeSlug]);

  return null;
}
