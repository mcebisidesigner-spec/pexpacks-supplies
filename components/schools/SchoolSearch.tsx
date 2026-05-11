"use client";

import { useMemo, useState } from "react";
import { filterSchools } from "@/lib/school-utils";
import { SchoolCard } from "./SchoolCard";
import styles from "./Schools.module.css";

type SchoolSearchProps = {
  initialQuery?: string;
  initialCity?: string;
  initialGrade?: string;
};

export function SchoolSearch({ initialQuery = "", initialCity = "all", initialGrade = "all" }: SchoolSearchProps) {
  const [query] = useState(initialQuery);
  const [city] = useState(initialCity);
  const [grade] = useState(initialGrade);

  const results = useMemo(() => filterSchools(query, city, grade), [query, city, grade]);

  return (
    <section className={styles.searchPanel} aria-labelledby="school-results-title">
      <div className={styles.resultHeader}>
        <div>
          <p className={styles.schoolEyebrow}>Search results</p>
          <h2 id="school-results-title">Find your school pack</h2>
        </div>
        <p>{results.length} school pack matches</p>
      </div>
      <div className={styles.schoolGrid}>
        {results.map((school) => (
          <SchoolCard school={school} key={school.id} />
        ))}
      </div>
    </section>
  );
}
