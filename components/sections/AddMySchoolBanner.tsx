"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import styles from "./AddMySchoolBanner.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
};

export function AddMySchoolBanner() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    setPending(true);
    setStatus(null);

    const parentName =
      typeof fd.get("parentName") === "string"
        ? (fd.get("parentName") as string)
        : "";
    const schoolAndCity =
      typeof fd.get("schoolAndCity") === "string"
        ? (fd.get("schoolAndCity") as string)
        : "";
    const grade =
      typeof fd.get("grade") === "string" ? (fd.get("grade") as string) : "";

    const payload = {
      formType: "contact" as const,
      fullName: parentName || "School list upload",
      phone: "Via Add-My-School banner",
      schoolName: schoolAndCity,
      grade,
      message: `School list upload request.\nParent: ${parentName}\nSchool & City: ${schoolAndCity}\nGrade: ${grade}`,
      packType: "add-school",
      consent: true,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await res.json()) as ApiResponse;
      setStatus(result);
      if (result.success) {
        form.reset();
      }
    } catch {
      setStatus({
        success: false,
        message:
          "We could not submit your request right now. Please try again or contact us directly.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.bannerContent}>
        <p className={styles.eyebrow}>School-specific lists</p>
        <h2>Need your exact school stationery list?</h2>
        <p>
          If your school is not in the database yet, send us the school name,
          city and grade list. We can help prepare a school-specific pack path
          or recommend the closest standard combo.
        </p>

        <div className={styles.incentiveBox}>
          <p>
            🎁 Tell us your school, and we'll offer you 5% off your next order
            once the official list is confirmed.
          </p>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <Button href="/contact" variant="outline">
            Contact Support
          </Button>
        </div>
      </div>

      <div className={styles.interactionPanel}>
        <h3 className={styles.panelTitle}>
          {showRequestForm
            ? "Submit your school details"
            : "Is your school already on our list?"}
        </h3>

        {!showRequestForm ? (
          <div className={styles.searchForm}>
            <label>
              Search School Name
              <input type="text" placeholder="e.g. Parktown Primary" />
            </label>
            <Button onClick={() => setShowRequestForm(true)}>
              Search Directory
            </Button>

            <div
              style={{
                textAlign: "center",
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--pex-text-muted)",
                  margin: "0 0 12px",
                }}
              >
                Can't find your school in the search?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRequestForm(true)}
              >
                Upload Your School List
              </Button>
            </div>
          </div>
        ) : (
          <form
            className={styles.searchForm}
            onSubmit={handleSubmit}
          >
            <label>
              Parent / Guardian Name
              <input name="parentName" type="text" required placeholder="e.g. Jane Doe" />
            </label>
            <label>
              School Name &amp; City
              <input
                name="schoolAndCity"
                type="text"
                placeholder="e.g. Parktown Primary, Johannesburg"
                required
              />
            </label>
            <label>
              Grade Needed
              <input name="grade" type="text" placeholder="e.g. Grade R" required />
            </label>
            <label>
              Upload Stationery List (PDF or Photo)
              <label className={styles.fileUpload}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>
                  <strong>Click to browse</strong> or drag your PDF/image here
                </span>
                {/* TODO: implement actual file upload to cloud storage */}
                <input type="file" accept=".pdf,image/*" />
              </label>
            </label>
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRequestForm(false)}
              >
                Back
              </Button>
              <Button type="submit" style={{ flex: 1 }} disabled={pending}>
                {pending ? "Submitting..." : "Submit List for 5% Off"}
              </Button>
            </div>
            {status ? (
              <p
                role={status.success ? "status" : "alert"}
                aria-live="polite"
                style={{
                  marginTop: 12,
                  padding: "12px 14px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 800,
                  background: status.success
                    ? "rgba(47, 133, 90, 0.12)"
                    : "rgba(185, 28, 28, 0.1)",
                  color: status.success
                    ? "var(--pex-success)"
                    : "var(--pex-error)",
                }}
              >
                {status.message}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}
