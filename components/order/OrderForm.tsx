"use client";

import { useMemo, useRef, useState } from "react";
import { ordersEmail, ordersEmailHref } from "@/data/contact";
import { schools } from "@/data/schools";
import { Button } from "@/components/ui/Button";
import { OrderProgress } from "./OrderProgress";
import { OrderSummary } from "./OrderSummary";
import styles from "./Order.module.css";

const steps = ["Select school", "Select grade", "Confirm pack", "Enter details", "Confirm order"];

type ApiResponse = {
  success: boolean;
  message: string;
  submissionId?: string;
  errors?: Record<string, string>;
};

type OrderFormProps = {
  initialSchool?: string;
  initialGrade?: string;
};

export function OrderForm({ initialSchool = "", initialGrade = "" }: OrderFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [schoolSlug, setSchoolSlug] = useState(initialSchool || schools[0]?.slug || "");
  const [gradeSlug, setGradeSlug] = useState(initialGrade || schools[0]?.grades[0]?.gradeSlug || "");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [deliveryPreference, setDeliveryPreference] = useState("School collection");
  const [preferredContactMethod, setPreferredContactMethod] = useState("whatsapp");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<ApiResponse | null>(null);

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

  function continueOrder() {
    if (activeStep === 3 && !formRef.current?.reportValidity()) {
      return;
    }

    nextStep();
  }

  async function submitOrder() {
    if (!formRef.current?.reportValidity()) {
      return;
    }

    if (!selectedSchool || !selectedGrade) {
      setSubmitStatus({
        success: false,
        message: "Please select a school and grade before submitting your order enquiry."
      });
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData(formRef.current);
    const payload = {
      formType: "school-pack-enquiry",
      fullName: buyerName,
      phone: buyerPhone,
      email: buyerEmail,
      schoolName: selectedSchool.name,
      grade: selectedGrade.grade,
      packType: `${selectedGrade.grade} stationery pack`,
      preferredContactMethod,
      message: `Delivery preference: ${deliveryPreference}. Please confirm availability, delivery or collection options, and payment instructions.`,
      consent,
      companyWebsite: typeof formData.get("companyWebsite") === "string" ? formData.get("companyWebsite") : "",
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString()
    };

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as ApiResponse;
      setSubmitStatus(result);
    } catch {
      setSubmitStatus({
        success: false,
        message: "We could not submit your enquiry right now. Please try again or contact us directly."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.orderShell}>
      <div className={styles.orderPanel}>
        <OrderProgress steps={steps} activeStep={activeStep} />
        <form className={styles.form} ref={formRef}>
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
                <input
                  name="name"
                  placeholder="Your full name"
                  required
                  value={buyerName}
                  onChange={(event) => setBuyerName(event.target.value)}
                />
              </label>
              <label>
                <span>Phone number</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+27"
                  required
                  value={buyerPhone}
                  onChange={(event) => setBuyerPhone(event.target.value)}
                />
              </label>
              <label>
                <span>Email address</span>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={buyerEmail}
                  onChange={(event) => setBuyerEmail(event.target.value)}
                />
              </label>
              <label>
                <span>Delivery preference</span>
                <select
                  name="delivery"
                  value={deliveryPreference}
                  onChange={(event) => setDeliveryPreference(event.target.value)}
                >
                  <option>School collection</option>
                  <option>Home delivery</option>
                  <option>Office delivery</option>
                </select>
              </label>
              <label>
                <span>Preferred contact method</span>
                <select
                  name="preferredContactMethod"
                  value={preferredContactMethod}
                  onChange={(event) => setPreferredContactMethod(event.target.value)}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                </select>
              </label>
              <label className={styles.consentField}>
                <input
                  name="consent"
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <span>
                  I agree that PexPacks may use my information to contact me about this enquiry, prepare my stationery
                  pack request, and provide related support.
                </span>
              </label>
              <p className={styles.privacyNotice}>
                We only use your details to respond to your enquiry and manage your stationery pack request.
              </p>
            </div>
          ) : null}

          {activeStep === 4 ? (
            <div className={styles.confirmPack}>
              <h2>Confirm order</h2>
              <p>
                This is an enquiry order. No online payment is taken here. PexPacks will confirm availability, delivery
                details and payment options. Order support is available at <a href={ordersEmailHref}>{ordersEmail}</a>.
              </p>
              {submitStatus ? (
                <p
                  className={submitStatus.success ? styles.formStatusSuccess : styles.formStatusError}
                  role={submitStatus.success ? "status" : "alert"}
                  aria-live="polite"
                >
                  {submitStatus.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <label className={styles.honeypot} aria-hidden="true">
            Company website
            <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
          </label>

          <div className={styles.formActions}>
            <button type="button" onClick={previousStep} disabled={activeStep === 0}>
              Back
            </button>
            <Button
              type="button"
              onClick={activeStep === steps.length - 1 ? submitOrder : continueOrder}
              disabled={submitting}
            >
              {activeStep === steps.length - 1 ? (submitting ? "Preparing email" : "Submit order enquiry") : "Continue"}
            </Button>
          </div>
        </form>
      </div>
      <OrderSummary schoolSlug={schoolSlug} gradeSlug={selectedGrade?.gradeSlug ?? gradeSlug} />
    </section>
  );
}
