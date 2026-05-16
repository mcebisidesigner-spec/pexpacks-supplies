"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { splitContactInput } from "@/lib/forms/contact";
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
    const schoolName =
      typeof fd.get("schoolName") === "string"
        ? (fd.get("schoolName") as string)
        : "";
    const city =
      typeof fd.get("city") === "string" ? (fd.get("city") as string) : "";
    const grade =
      typeof fd.get("grade") === "string" ? (fd.get("grade") as string) : "";
    const contact =
      typeof fd.get("contact") === "string"
        ? (fd.get("contact") as string)
        : "";
    const notes =
      typeof fd.get("notes") === "string" ? (fd.get("notes") as string) : "";
    const contactParts = splitContactInput(contact);

    const payload = {
      formType: "contact" as const,
      fullName: parentName || "School details request",
      ...contactParts,
      contactDetail: contact,
      schoolName,
      city,
      grade,
      message: `School details request.\nParent: ${parentName}\nContact: ${contact}\nSchool: ${schoolName}\nCity: ${city}\nGrade: ${grade}\nNotes: ${notes || "None"}`,
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
                Send Your School Details
              </Button>
            </div>
          </div>
        ) : (
          <form className={styles.searchForm} onSubmit={handleSubmit}>
            <label>
              Parent / Guardian Name
              <input
                name="parentName"
                type="text"
                required
                placeholder="e.g. Jane Doe"
              />
            </label>
            <label>
              Phone or email
              <input
                name="contact"
                type="text"
                required
                placeholder="078 003 6048 or name@example.com"
              />
            </label>
            <label>
              School Name
              <input
                name="schoolName"
                type="text"
                placeholder="e.g. Parktown Primary"
                required
              />
            </label>
            <label>
              City or area
              <input
                name="city"
                type="text"
                placeholder="e.g. Johannesburg"
                required
              />
            </label>
            <label>
              Grade Needed
              <input
                name="grade"
                type="text"
                placeholder="e.g. Grade R"
                required
              />
            </label>
            <label>
              Stationery list notes
              <textarea
                name="notes"
                placeholder="Paste key list items or special requirements."
              />
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
