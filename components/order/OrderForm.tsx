"use client";

import { useMemo, useState } from "react";
import { schools } from "@/data/schools";
import { Button } from "@/components/ui/Button";
import { OrderProgress } from "./OrderProgress";
import { OrderSummary } from "./OrderSummary";
import styles from "./Order.module.css";

const steps = ["Select school", "Select grade", "Confirm pack", "Enter details", "Confirm order"];

type OrderFormProps = {
  initialSchool?: string;
  initialGrade?: string;
};

export function OrderForm({ initialSchool = "", initialGrade = "" }: OrderFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [schoolSlug, setSchoolSlug] = useState(initialSchool || schools[0]?.slug || "");
  const [gradeSlug, setGradeSlug] = useState(initialGrade || schools[0]?.grades[0]?.gradeSlug || "");

  const selectedSchool = useMemo(() => schools.find((school) => school.slug === schoolSlug) ?? schools[0], [schoolSlug]);
  const selectedGrade = useMemo(
    () => selectedSchool?.grades.find((grade) => grade.gradeSlug === gradeSlug) ?? selectedSchool?.grades[0],
    [gradeSlug, selectedSchool]
  );

  function nextStep() {
    setActiveStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function previousStep() {
    setActiveStep((step) => Math.max(step - 1, 0));
  }

  return (
    <section className={styles.orderShell}>
      <div className={styles.orderPanel}>
        <OrderProgress steps={steps} activeStep={activeStep} />
        <form className={styles.form}>
          {activeStep === 0 ? (
            <label>
              <span>Select school</span>
              <select
                value={schoolSlug}
                onChange={(event) => {
                  const nextSchool = schools.find((school) => school.slug === event.target.value);
                  setSchoolSlug(event.target.value);
                  setGradeSlug(nextSchool?.grades[0]?.gradeSlug ?? "");
                }}
              >
                {schools.map((school) => (
                  <option value={school.slug} key={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {activeStep === 1 ? (
            <label>
              <span>Select grade</span>
              <select value={gradeSlug} onChange={(event) => setGradeSlug(event.target.value)}>
                {selectedSchool?.grades.map((grade) => (
                  <option value={grade.gradeSlug} key={grade.id}>
                    {grade.grade}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {activeStep === 2 ? (
            <div className={styles.confirmPack}>
              <h2>{selectedGrade?.grade} stationery pack</h2>
              <p>{selectedGrade?.deliveryNote}</p>
              <ul>
                {selectedGrade?.contents.slice(0, 5).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {activeStep === 3 ? (
            <div className={styles.detailGrid}>
              <label>
                <span>Parent or buyer name</span>
                <input name="name" placeholder="Your full name" />
              </label>
              <label>
                <span>Phone number</span>
                <input name="phone" placeholder="+27" />
              </label>
              <label>
                <span>Email address</span>
                <input name="email" type="email" placeholder="name@example.com" />
              </label>
              <label>
                <span>Delivery preference</span>
                <select name="delivery">
                  <option>School collection</option>
                  <option>Home delivery</option>
                  <option>Office delivery</option>
                </select>
              </label>
            </div>
          ) : null}

          {activeStep === 4 ? (
            <div className={styles.confirmPack}>
              <h2>Confirm order</h2>
              <p>
                Your order request is ready. Pexpacks Supplies will confirm availability, delivery details and payment options.
              </p>
            </div>
          ) : null}

          <div className={styles.formActions}>
            <button type="button" onClick={previousStep} disabled={activeStep === 0}>
              Back
            </button>
            <Button type="button" onClick={activeStep === steps.length - 1 ? undefined : nextStep}>
              {activeStep === steps.length - 1 ? "Submit order" : "Continue"}
            </Button>
          </div>
        </form>
      </div>
      <OrderSummary schoolSlug={schoolSlug} gradeSlug={selectedGrade?.gradeSlug ?? gradeSlug} />
    </section>
  );
}
