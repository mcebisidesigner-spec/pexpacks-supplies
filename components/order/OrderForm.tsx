"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ordersEmail, ordersEmailHref } from "@/data/contact";
import { Button } from "@/components/ui/Button";

import { OrderProgress } from "./OrderProgress";
import { OrderSummary } from "./OrderSummary";
import styles from "./Order.module.css";

const steps = ["Select school", "Select grade", "Confirm pack", "Add-ons", "Enter details", "Confirm order"];

type ApiResponse = {
  success: boolean;
  message: string;
  submissionId?: string;
  errors?: Record<string, string>;
};

type GradeOption = {
  id: string;
  grade: string;
  gradeSlug: string;
  price: number;
  contents: string[];
  deliveryNote: string;
};

type SchoolSearchResult = {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
};

type SchoolDetails = SchoolSearchResult & {
  grades: GradeOption[];
};

type OrderFormProps = {
  initialSchool?: string;
  initialGrade?: string;
};

async function fetchSchoolDetails(slug: string) {
  const response = await fetch(`/api/schools/${encodeURIComponent(slug)}`);

  if (!response.ok) {
    throw new Error("School not found");
  }

  return (await response.json()) as { success: true; school: SchoolDetails };
}

export function OrderForm({ initialSchool = "", initialGrade = "" }: OrderFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState<SchoolDetails | null>(null);
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolResults, setSchoolResults] = useState<SchoolSearchResult[]>([]);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [schoolTouched, setSchoolTouched] = useState(Boolean(initialSchool));
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [schoolError, setSchoolError] = useState("");
  const [gradeSlug, setGradeSlug] = useState(initialGrade);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [deliveryPreference, setDeliveryPreference] = useState("School collection");
  const [preferredContactMethod, setPreferredContactMethod] = useState("whatsapp");
  const [consent, setConsent] = useState(false);
  
  // Pexcover state
  const [hasPexcover, setHasPexcover] = useState(false);
  const [pexcoverName, setPexcoverName] = useState("");
  const [pexcoverSubjects, setPexcoverSubjects] = useState("");
  const [pexcoverLabelFormat, setPexcoverLabelFormat] = useState("First Name + Surname");
  const [pexcoverNotes, setPexcoverNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<ApiResponse | null>(null);

  const selectedGrade = useMemo(
    () => selectedSchool?.grades.find((grade) => grade.gradeSlug === gradeSlug) ?? null,
    [gradeSlug, selectedSchool]
  );

  useEffect(() => {
    if (!initialSchool) {
      return;
    }

    let cancelled = false;
    setSchoolLoading(true);
    fetchSchoolDetails(initialSchool)
      .then(({ school }) => {
        if (cancelled) {
          return;
        }
        setSelectedSchool(school);
        setSchoolQuery(school.name);
        setGradeSlug(initialGrade || school.grades[0]?.gradeSlug || "");
      })
      .catch(() => {
        if (!cancelled) {
          setSchoolError("We could not load that school. Search for it below.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSchoolLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialGrade, initialSchool]);

  useEffect(() => {
    if (!schoolTouched) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSchoolLoading(true);
      setSchoolError("");

      try {
        const params = new URLSearchParams({
          q: schoolQuery.trim(),
          limit: "10"
        });
        const response = await fetch(`/api/schools/search?${params.toString()}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = (await response.json()) as { success: true; results: SchoolSearchResult[] };
        setSchoolResults(data.results);
      } catch (error) {
        if (!controller.signal.aborted) {
          setSchoolResults([]);
          setSchoolError("We could not search schools right now. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setSchoolLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [schoolQuery, schoolTouched]);

  function nextStep() {
    setActiveStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function previousStep() {
    setActiveStep((step) => Math.max(step - 1, 0));
  }

  async function selectSchool(result: SchoolSearchResult) {
    setSchoolLoading(true);
    setSchoolError("");

    try {
      const { school } = await fetchSchoolDetails(result.slug);
      setSelectedSchool(school);
      setSchoolQuery(school.name);
      setSchoolOpen(false);
      setGradeSlug(school.grades[0]?.gradeSlug || "");
    } catch {
      setSchoolError("We could not load that school. Please search again.");
    } finally {
      setSchoolLoading(false);
    }
  }

  function continueOrder() {
    if (activeStep === 0 && !selectedSchool) {
      setSchoolError("Please search and select a school before continuing.");
      return;
    }

    if (activeStep === 1 && !selectedGrade) {
      setSchoolError("Please select a grade before continuing.");
      return;
    }

    if (activeStep === 4 && !formRef.current?.reportValidity()) {
      return;
    }

    setSchoolError("");
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
      message: `Delivery preference: ${deliveryPreference}. Please confirm availability, delivery or collection options, and payment instructions. ${
        hasPexcover 
          ? `\n\n--- PEXCOVER ADD-ON REQUESTED ---\nLearner: ${pexcoverName || buyerName}\nSubjects: ${pexcoverSubjects || "Standard"}\nLabel Format: ${pexcoverLabelFormat}\nNotes: ${pexcoverNotes || "None"}`
          : ""
      }`,
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
            <div className={styles.schoolSearch}>
              <label htmlFor="order-school-search">
                <span>Select school</span>
              </label>
              <input
                id="order-school-search"
                name="orderSchoolSearch"
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={schoolOpen}
                aria-controls="order-school-results"
                autoComplete="off"
                placeholder="Start typing your school name"
                value={schoolQuery}
                onFocus={() => {
                  setSchoolTouched(true);
                  setSchoolOpen(true);
                }}
                onChange={(event) => {
                  setSchoolQuery(event.target.value);
                  setSelectedSchool(null);
                  setGradeSlug("");
                  setSchoolTouched(true);
                  setSchoolOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSchoolOpen(false);
                  }
                }}
              />
              {schoolOpen ? (
                <div className={styles.schoolResults} id="order-school-results" role="listbox">
                  {schoolLoading ? <p className={styles.schoolEmpty}>Searching schools...</p> : null}
                  {!schoolLoading && schoolResults.length ? (
                    schoolResults.map((result) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedSchool?.slug === result.slug}
                        className={styles.schoolResult}
                        key={result.id}
                        onClick={() => selectSchool(result)}
                      >
                        <strong>{result.name}</strong>
                        <span>
                          {result.city}, {result.province}
                        </span>
                      </button>
                    ))
                  ) : null}
                  {!schoolLoading && !schoolResults.length ? (
                    <p className={styles.schoolEmpty}>No matching schools found. Try a different name.</p>
                  ) : null}
                </div>
              ) : null}
              {selectedSchool ? (
                <p className={styles.selectedSchool}>
                  Selected: <strong>{selectedSchool.name}</strong>
                </p>
              ) : null}
              {schoolError ? (
                <p className={styles.formStatusError} role="alert">
                  {schoolError}
                </p>
              ) : null}
            </div>
          ) : null}

          {activeStep === 1 ? (
            <label htmlFor="order-grade-select">
              <span>Select grade</span>
              <select id="order-grade-select" name="orderGrade" value={gradeSlug} onChange={(event) => setGradeSlug(event.target.value)} required>
                <option value="">Choose a grade</option>
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
              <p className={styles.confirmKicker}>Selected pack</p>
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
            <div className={styles.addonSection}>
              <p className={styles.confirmKicker}>Optional Add-On Services</p>
              
              <div className={`${styles.addonCard} ${hasPexcover ? styles.addonCardActive : ""}`}>
                <div className={styles.addonHeader}>
                  <div className={styles.addonTitle}>
                    <h3>Add Pexcover</h3>
                    <span className={styles.addonPrice}>+R120 per pack</span>
                  </div>
                  <p>Exercise books covered, labelled, and ready from day one.</p>
                  <p className={styles.addonSubtext}>Save time, protect schoolwork, and help your child start organised.</p>
                </div>
                
                <label className={styles.addonCheckbox}>
                  <input 
                    type="checkbox" 
                    checked={hasPexcover} 
                    onChange={(e) => setHasPexcover(e.target.checked)} 
                  />
                  <span>Yes, add Pexcover to this pack</span>
                </label>
                
                <p className={styles.addonNote}>Pexcover applies to exercise books included in the selected school pack.</p>

                {hasPexcover && (
                  <div className={styles.addonDetails} aria-expanded={hasPexcover}>
                    <p className={styles.addonDetailsHelper}>
                      Only complete these fields if you want specific name or subject details written on the books.
                    </p>
                    <div className={styles.detailGrid}>
                      <label>
                        <span>Learner name to write on books</span>
                        <input
                          placeholder="e.g. John Doe"
                          value={pexcoverName}
                          onChange={(e) => setPexcoverName(e.target.value)}
                        />
                      </label>
                      <label>
                        <span>Preferred label format</span>
                        <select 
                          value={pexcoverLabelFormat}
                          onChange={(e) => setPexcoverLabelFormat(e.target.value)}
                        >
                          <option>First Name + Surname</option>
                          <option>First Name + Initial</option>
                          <option>Initials + Surname</option>
                        </select>
                      </label>
                      <label className={styles.fullWidthField}>
                        <span>Subject names (if required by school)</span>
                        <input
                          placeholder="e.g. English, Maths, Life Skills"
                          value={pexcoverSubjects}
                          onChange={(e) => setPexcoverSubjects(e.target.value)}
                        />
                      </label>
                      <label className={styles.fullWidthField}>
                        <span>Special notes</span>
                        <input
                          placeholder="Any specific covering instructions?"
                          value={pexcoverNotes}
                          onChange={(e) => setPexcoverNotes(e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activeStep === 4 ? (
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
              {deliveryPreference === "Home delivery" && (
                <div className={styles.deliveryNotice}>
                  <p>
                    Home delivery incurs an additional delivery fee based on your location. Please{" "}
                    <Link href="/delivery-policy" className={styles.deliveryPolicyLink} target="_blank" rel="noopener noreferrer">
                      Read our Delivery Policy
                    </Link>{" "}
                    for more details on pricing and schedules.
                  </p>
                </div>
              )}
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
                  I consent to Pexpacks using my information to contact me about this enquiry and provide related
                  support.{" "}
                  <Link href="/privacy-policy" className={styles.privacyLink}>
                    privacy-policy
                  </Link>
                </span>
              </label>
              <p className={styles.privacyNotice}>
                We only use your details to respond to your enquiry and manage your stationery pack request. We collect
                only the information needed to assist you. You may contact Pexpacks to update, correct, or request
                deletion of your information.
              </p>
            </div>
          ) : null}

          {activeStep === 5 ? (
            <div className={styles.confirmPack}>
              <p className={styles.confirmKicker}>Final check</p>
              <h2>Confirm order</h2>
              <p>
                This is an enquiry order. No online payment is taken here. Pexpacks will confirm availability, delivery
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
              disabled={submitting || (activeStep === 0 && schoolLoading)}
            >
              {activeStep === steps.length - 1 ? (submitting ? "Submitting enquiry" : "Submit order enquiry") : "Continue"}
            </Button>
          </div>
        </form>
      </div>
      <OrderSummary
        schoolName={selectedSchool?.name}
        gradeName={selectedGrade?.grade}
        gradePrice={selectedGrade?.price}
        hasPexcover={hasPexcover}
      />
    </section>
  );
}
