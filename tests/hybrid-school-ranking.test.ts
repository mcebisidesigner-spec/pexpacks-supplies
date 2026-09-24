import { describe, expect, it } from "vitest";
import {
  rankHybridSchools,
  type HybridSchoolItem,
  type RecentVisitItem,
} from "@/lib/schools/hybridSchoolRanking";

describe("Hybrid School Ranking Engine", () => {
  const mockServerSchools: HybridSchoolItem[] = [
    {
      name: "Midstream College",
      slug: "midstream-college",
      city: "Centurion",
      metro: "City of Tshwane",
      image: "/logos/midstream.png",
    },
    {
      name: "Bryanston High School",
      slug: "bryanston-high",
      city: "Sandton",
      metro: "City of Johannesburg",
      image: "/logos/bryanston.png",
    },
    {
      name: "Cornwall Hill College",
      slug: "cornwall-hill",
      city: "Centurion",
      metro: "City of Tshwane",
      image: null,
    },
    {
      name: "Rand Park High School",
      slug: "rand-park-high",
      city: "Randburg",
      metro: "City of Johannesburg",
      image: "/logos/randpark.png",
    },
    {
      name: "Pretoria Boys High",
      slug: "pretoria-boys",
      city: "Pretoria",
      metro: "City of Tshwane",
      image: "/logos/pretoria-boys.png",
    },
    {
      name: "Parktown Boys High",
      slug: "parktown-boys",
      city: "Johannesburg",
      metro: "City of Johannesburg",
      image: "/logos/parktown.png",
    },
    {
      name: "Affies Seuns",
      slug: "affies-seuns",
      city: "Pretoria",
      metro: "City of Tshwane",
      image: "/logos/affies.png",
    },
    {
      name: "St Stithians College",
      slug: "st-stithians",
      city: "Sandton",
      metro: "City of Johannesburg",
      image: "/logos/saints.png",
    },
    {
      name: "Crawford International",
      slug: "crawford-sandton",
      city: "Sandton",
      metro: "City of Johannesburg",
      image: "/logos/crawford.png",
    },
  ];

  it("handles cold-start visitors with 0 recent visits cleanly", () => {
    const result = rankHybridSchools(mockServerSchools, [], 8);

    expect(result.hasRecent).toBe(false);
    expect(result.rankedSchools).toHaveLength(8);
    expect(result.rankedSchools.every((s) => s.isRecent === false)).toBe(true);
    expect(result.rankedSchools[0].slug).toBe("midstream-college");
  });

  it("pins the user's most recent school to position #1 with isRecent: true", () => {
    const recentVisits: RecentVisitItem[] = [
      {
        schoolName: "Rand Park High School",
        schoolSlug: "rand-park-high",
        city: "Randburg",
        timestamp: Date.now() - 5000,
      },
    ];

    const result = rankHybridSchools(mockServerSchools, recentVisits, 8);

    expect(result.hasRecent).toBe(true);
    expect(result.rankedSchools).toHaveLength(8);

    // Position 1 must be the recent school
    const firstSchool = result.rankedSchools[0];
    expect(firstSchool.slug).toBe("rand-park-high");
    expect(firstSchool.isRecent).toBe(true);

    // Deduplication check: rand-park-high must only appear once in the entire list
    const occurrences = result.rankedSchools.filter(
      (s) => s.slug === "rand-park-high",
    );
    expect(occurrences).toHaveLength(1);
  });

  it("enriches recent visit with server image when recent visit has no image", () => {
    const recentVisits: RecentVisitItem[] = [
      {
        schoolName: "Midstream College",
        schoolSlug: "midstream-college",
        city: "Centurion",
        image: null,
      },
    ];

    const result = rankHybridSchools(mockServerSchools, recentVisits, 8);
    expect(result.rankedSchools[0].image).toBe("/logos/midstream.png");
  });

  it("boosts same-city / same-cluster server schools right behind the recent school", () => {
    const recentVisits: RecentVisitItem[] = [
      {
        schoolName: "Cornwall Hill College",
        schoolSlug: "cornwall-hill",
        city: "Centurion",
        timestamp: Date.now(),
      },
    ];

    const result = rankHybridSchools(mockServerSchools, recentVisits, 8);

    expect(result.rankedSchools[0].slug).toBe("cornwall-hill");
    expect(result.rankedSchools[0].isRecent).toBe(true);

    // Midstream College is in Centurion, so it should be boosted to position #2
    expect(result.rankedSchools[1].slug).toBe("midstream-college");
    expect(result.rankedSchools[1].city).toBe("Centurion");
    expect(result.rankedSchools[1].isRecent).toBe(false);
  });

  it("caps recent pinned schools to at most 2 to preserve space for trending schools", () => {
    const recentVisits: RecentVisitItem[] = [
      { schoolName: "School 1", schoolSlug: "school-1", timestamp: 100 },
      { schoolName: "School 2", schoolSlug: "school-2", timestamp: 90 },
      { schoolName: "School 3", schoolSlug: "school-3", timestamp: 80 },
    ];

    const result = rankHybridSchools(mockServerSchools, recentVisits, 8);

    const recentsInList = result.rankedSchools.filter((s) => s.isRecent);
    expect(recentsInList).toHaveLength(2);
    expect(result.rankedSchools).toHaveLength(8);
  });

  it("gracefully handles empty server schools", () => {
    const recentVisits: RecentVisitItem[] = [
      { schoolName: "Solo School", schoolSlug: "solo-school", timestamp: 100 },
    ];

    const result = rankHybridSchools([], recentVisits, 8);

    expect(result.hasRecent).toBe(true);
    expect(result.rankedSchools).toHaveLength(1);
    expect(result.rankedSchools[0].slug).toBe("solo-school");
  });
});
