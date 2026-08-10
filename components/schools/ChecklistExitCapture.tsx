"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { GradePack, School } from "@/data/schools";
import { useDialogFocusTrap } from "@/components/packs/useDialogFocusTrap";
import styles from "./ChecklistExitCapture.module.css";

const DISMISSED_PREFIX = "Pexpacks:checklist-capture:";

type ChecklistExitCaptureProps = {
  school: School;
  grade: GradePack;
};

export function ChecklistExitCapture({
  school,
  grade,
}: ChecklistExitCaptureProps) {
  const storageKey = `${DISMISSED_PREFIX}${school.slug}:${grade.gradeSlug}`;
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const dialogRef = useRef<HTMLDivElement>(null);

  function dismiss() {
    try {
      sessionStorage.setItem(storageKey, "dismissed");
    } catch {
      // Ignore storage failures.
    }
    setIsOpen(false);
  }

  useDialogFocusTrap({
    isOpen,
    dialogRef,
    onClose: dismiss,
  });

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(storageKey) === "dismissed";
    } catch {
      dismissed = false;
    }

    if (dismissed) {
      return;
    }

    function handleMouseOut(event: MouseEvent) {
      if (event.clientY <= 0 && !isOpen) {
        setIsOpen(true);
      }
    }

    document.addEventListener("mouseout", handleMouseOut);
    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, [isOpen, storageKey]);

  async function submitChecklistRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !consent || status === "sending") {
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "school-pack-enquiry",
          fullName: "Checklist request",
          email,
          schoolName: school.name,
          grade: grade.grade,
          message: `Email me the ${school.name} ${grade.grade} stationery checklist.`,
          consent,
          sourceUrl: window.location.href,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          submittedAt: new Date().toISOString(),
          companyWebsite: "",
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("sent");
      window.setTimeout(dismiss, 1200);
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.inlineTrigger}
        onClick={() => setIsOpen(true)}
      >
        Email me this checklist
      </button>

      {isOpen ? (
        <div className={styles.overlay} role="presentation">
          <section
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checklist-capture-title"
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={dismiss}
              aria-label="Close checklist email form"
            >
              &times;
            </button>
            <p className={styles.eyebrow}>Not ready to order?</p>
            <h2 id="checklist-capture-title">
              Get the {grade.grade} checklist by email
            </h2>
            <p>
              We will send the {school.name} stationery checklist so you can
              compare it before buying.
            </p>
            <form onSubmit={submitChecklistRequest} className={styles.form}>
              <label>
                <span>Email address</span>
                <input
                  id="checklist-capture-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className={styles.consent}>
                <input
                  id="checklist-capture-consent"
                  name="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  required
                />
                <span>
                  I agree that Pexpacks may email me this checklist and follow
                  up about this school pack.
                </span>
              </label>
              <button
                type="submit"
                disabled={!email.trim() || !consent || status === "sending"}
              >
                {status === "sending" ? "Sending..." : "Email checklist"}
              </button>
              {status === "sent" ? (
                <p className={styles.success}>Checklist request received.</p>
              ) : null}
              {status === "error" ? (
                <p className={styles.error}>
                  We could not send this right now. Please try again.
                </p>
              ) : null}
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
