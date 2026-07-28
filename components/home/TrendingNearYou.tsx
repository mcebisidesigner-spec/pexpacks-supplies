"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { reverseGeocode } from "@/lib/geocoding";
import type { SchoolSearchRecord } from "@/lib/schools/types";
import styles from "./TrendingNearYou.module.css";

type LocationSource = "initial" | "gps" | "ip" | "default";

type NearbyResponse = {
  schools: SchoolSearchRecord[];
  city: string | null;
  source: string;
};

type TrendingNearYouProps = {
  initialSchools: SchoolSearchRecord[];
};

function gradeRangeLabel(grades: string[]) {
  if (grades.length === 0) return "Grades available";
  if (grades.length === 1) return grades[0];
  return `${grades[0]} to ${grades[grades.length - 1]}`;
}

function Badge({
  source,
  city,
}: {
  source: LocationSource;
  city: string | null;
}) {
  if (source === "gps" && city) {
    return (
      <span className={`${styles.badge} ${styles.badgeGps}`}>
        <span aria-hidden="true">📍</span> In {city}
      </span>
    );
  }

  if (source === "ip" && city) {
    return (
      <span className={`${styles.badge} ${styles.badgeIp}`}>
        <span aria-hidden="true">🌆</span> {city} area
      </span>
    );
  }

  return (
    <span className={`${styles.badge} ${styles.badgeDefault}`}>
      <span aria-hidden="true">⭐</span> Popular in Gauteng
    </span>
  );
}

function SkeletonCards() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div className={styles.skeleton} key={i}>
          <div
            className={`${styles.skelBlock} ${styles.skelIcon}`}
          />
          <div className={`${styles.skelBlock} ${styles.skelLineShort}`} />
          <div className={`${styles.skelBlock} ${styles.skelLineTitle}`} />
          <div className={`${styles.skelBlock} ${styles.skelLine}`} />
          <div className={`${styles.skelBlock} ${styles.skelCta}`} />
        </div>
      ))}
    </>
  );
}

function SchoolCard({ school }: { school: SchoolSearchRecord }) {
  return (
    <Link href={`/schools/${school.slug}`} className={styles.card}>
      <div className={styles.cardHeader}>
        {school.image ? (
          <Image
            src={school.image}
            alt={`${school.name} logo`}
            className={styles.cardLogo}
            width={50}
            height={50}
          />
        ) : (
          <span className={styles.cardIcon}>
            {school.name.charAt(0)}
          </span>
        )}
        {school.isPartner && (
          <span className={styles.partnerBadge}>★ Official Partner</span>
        )}
      </div>
      <span className={styles.cardCity}>{school.city}</span>
      <h3>{school.name}</h3>
      <p className={styles.cardGrades}>{gradeRangeLabel(school.grades)}</p>
      <span className={styles.cardCta}>
        View packs
        <span className={styles.cardCtaArrow} aria-hidden="true" />
      </span>
    </Link>
  );
}

export function TrendingNearYou({ initialSchools }: TrendingNearYouProps) {
  const [schools, setSchools] =
    useState<SchoolSearchRecord[]>(initialSchools);
  const [source, setSource] = useState<LocationSource>("initial");
  const [city, setCity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [showBtn, setShowBtn] = useState(true);

  const fetchByCity = useCallback(async (targetCity: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/nearby-schools?city=${encodeURIComponent(targetCity)}`
      );
      if (!res.ok) throw new Error("Failed to fetch nearby schools");
      const data: NearbyResponse = await res.json();
      if (data.schools.length > 0) {
        setSchools(data.schools);
        setCity(data.city);
        setSource(data.source === "city" ? "ip" : "default");
      }
    } catch {
      // Graceful: keep current schools
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchByIp = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/nearby-schools");
      if (!res.ok) throw new Error("Failed to fetch nearby schools");
      const data: NearbyResponse = await res.json();
      if (data.schools.length > 0) {
        setSchools(data.schools);
        setCity(data.city);
        setSource(data.source === "default" ? "default" : "ip");
      }
    } catch {
      // Graceful: keep current schools
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUseLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setShowBtn(false);
      await fetchByIp();
      return;
    }

    setBtnDisabled(true);
    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const resolvedCity = await reverseGeocode(latitude, longitude);

        if (resolvedCity) {
          await fetchByCity(resolvedCity);
        } else {
          // GPS worked but reverse geocode failed — fall back to IP
          await fetchByIp();
        }

        setBtnDisabled(false);
      },
      async () => {
        // GPS denied or timed out — fall back to IP
        await fetchByIp();
        setBtnDisabled(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 300_000,
      }
    );
  }, [fetchByCity, fetchByIp]);

  // On mount: check if geolocation permission is already granted
  useEffect(() => {
    if (!navigator.permissions) return;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "granted") {
          handleUseLocation();
          setShowBtn(false);
        }
      })
      .catch(() => {
        // Permissions API not supported — show button
      });
  }, [handleUseLocation]);

  return (
    <section
      className={styles.section}
      aria-labelledby="trending-near-you-heading"
    >
      <div className={styles.headerRow}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Schools near you</p>
          <h2 id="trending-near-you-heading">Trending near you</h2>
          <p>
            Find your school and order the exact stationery pack your child
            needs.
          </p>
        </div>

        <div className={styles.controls}>
          <Badge source={source} city={city} />

          {showBtn && (
            <button
              type="button"
              className={styles.locationBtn}
              onClick={handleUseLocation}
              disabled={btnDisabled}
            >
              {isLoading ? (
                <span className={styles.locationBtnSpinner} />
              ) : (
                <span className={styles.locationBtnIcon} aria-hidden="true">
                  📍
                </span>
              )}
              Use my current location
            </button>
          )}
        </div>
      </div>

      <div className={styles.grid} role="list">
        {isLoading ? (
          <SkeletonCards />
        ) : (
          schools.map((school) => (
            <div role="listitem" key={school.id}>
              <SchoolCard school={school} />
            </div>
          ))
        )}
      </div>

      {!isLoading && source !== "initial" && source !== "default" && (
        <p className={styles.microText}>
          Showing schools in your area
        </p>
      )}
    </section>
  );
}
