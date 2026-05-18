"use client";

import { useState } from "react";
import styles from "./SavingsCalculator.module.css";
import { SectionHeader } from "./SectionHeader";

const GRADES = [
  { id: "grade-rr", label: "Grade RR", avgRetail: 1200, pexpacks: 950, hours: 3 },
  { id: "grade-r", label: "Grade R", avgRetail: 1400, pexpacks: 1100, hours: 3 },
  { id: "grade-1", label: "Grade 1", avgRetail: 1800, pexpacks: 1450, hours: 4 },
  { id: "grade-2", label: "Grade 2", avgRetail: 1750, pexpacks: 1400, hours: 4 },
  { id: "grade-3", label: "Grade 3", avgRetail: 1600, pexpacks: 1300, hours: 4 },
  { id: "grade-4", label: "Grade 4", avgRetail: 2100, pexpacks: 1750, hours: 5 },
  { id: "grade-5", label: "Grade 5", avgRetail: 1950, pexpacks: 1600, hours: 5 },
  { id: "grade-6", label: "Grade 6", avgRetail: 1800, pexpacks: 1500, hours: 4 },
  { id: "grade-7", label: "Grade 7", avgRetail: 2200, pexpacks: 1850, hours: 5 },
  { id: "high-school", label: "High School", avgRetail: 2500, pexpacks: 2100, hours: 6 },
];

export function SavingsCalculator() {
  const [selectedGrade, setSelectedGrade] = useState(GRADES[2]); // Default Grade 1

  const savings = selectedGrade.avgRetail - selectedGrade.pexpacks;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <SectionHeader
          eyebrow="Calculate Your Savings"
          title="See how much you save"
          text="Shopping retail means driving to multiple stores, dealing with out-of-stock items, and paying premium prices. See what Pexpacks saves you."
        />
        
        <div className={styles.calculatorWrapper}>
          <div className={styles.controls}>
            <label htmlFor="grade-select" className={styles.label}>Select your child's grade:</label>
            <div className={styles.selectWrapper}>
              <select 
                id="grade-select"
                className={styles.select}
                value={selectedGrade.id}
                onChange={(e) => {
                  const grade = GRADES.find(g => g.id === e.target.value);
                  if (grade) setSelectedGrade(grade);
                }}
              >
                {GRADES.map(grade => (
                  <option key={grade.id} value={grade.id}>{grade.label}</option>
                ))}
              </select>
              <svg className={styles.selectIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <div className={styles.resultsGrid}>
            <div className={styles.resultCard}>
              <div className={styles.resultIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className={styles.resultContent}>
                <span className={styles.resultLabel}>Money Saved</span>
                <strong className={styles.resultValue}>R {savings}</strong>
                <span className={styles.resultContext}>Avg. retail: R {selectedGrade.avgRetail}</span>
              </div>
            </div>

            <div className={styles.resultCard}>
              <div className={styles.resultIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className={styles.resultContent}>
                <span className={styles.resultLabel}>Time Saved</span>
                <strong className={styles.resultValue}>{selectedGrade.hours} Hours</strong>
                <span className={styles.resultContext}>No queues, no driving</span>
              </div>
            </div>
          </div>

          <div className={styles.ctaWrapper}>
            <a href="/schools" className={styles.ctaButton}>
              Find Your School Pack
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
