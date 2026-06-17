"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { splitContactInput, isValidEmailAddress, isValidSouthAfricanPhone } from "@/lib/forms/contact";
import page from "@/styles/Page.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
};

export function TrackOrderForm() {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);
  const [consent, setConsent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);

    const contact =
      typeof fd.get("contact") === "string"
        ? (fd.get("contact") as string).trim()
        : "";

    if (!isValidEmailAddress(contact) && !isValidSouthAfricanPhone(contact)) {
      setStatus({
        success: false,
        message: "Please enter a valid South African phone number (e.g., 072 123 4567) or email address (e.g., name@example.com).",
      });
      return;
    }

    setPending(true);
    setStatus(null);

    const orderNumber =
      typeof fd.get("orderNumber") === "string"
        ? (fd.get("orderNumber") as string)
        : "";
    const contactParts = splitContactInput(contact);

    const payload = {
      formType: "track-order-interest" as const,
      fullName: orderNumber || "Track order request",
      ...contactParts,
      contactDetail: contact,
      message: `Order tracking request.\nOrder Number: ${orderNumber || "Not provided"}\nContact: ${contact || "Not provided"}`,
      packType: "track-order",
      consent,
      sourceUrl: window.location.href,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/forms/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await res.json()) as ApiResponse;
      setStatus(result);
      if (result.success) {
        form.reset();
        setConsent(false);
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
    <form
      className={`${page.formCard} ${page.formStack}`}
      onSubmit={handleSubmit}
    >
      <p className={page.kicker}>Order tracking</p>
      <h2>Tracking form</h2>
      <label htmlFor="trackOrderNumber">
        Order number
      </label>
      <input 
        id="trackOrderNumber" 
        name="orderNumber" 
        placeholder="PEX-2026-001" 
        required 
        aria-invalid={status && !status.success ? "true" : "false"}
        aria-describedby={status && !status.success ? "track-status-message" : undefined}
      />
      
      <label htmlFor="trackContact">
        Phone or email
      </label>
      <input
        id="trackContact"
        name="contact"
        placeholder="Phone number or email address"
        required
        aria-invalid={status && !status.success ? "true" : "false"}
        aria-describedby={status && !status.success ? "track-status-message" : undefined}
      />
      
      <label htmlFor="trackConsent" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
        <input 
          id="trackConsent" 
          type="checkbox" 
          checked={consent} 
          onChange={(e) => setConsent(e.target.checked)} 
          required 
          aria-invalid={status && !status.success ? "true" : "false"}
          aria-describedby={status && !status.success ? "track-status-message" : undefined}
        />
        <span style={{ fontSize: 13, color: "var(--pex-text-muted)" }}>
          I consent to Pexpacks processing my information to handle this request.
        </span>
      </label>
      <Button type="submit" disabled={pending || !consent}>
        {pending ? "Submitting..." : "Track order"}
      </Button>
      {status ? (
        <p
          id="track-status-message"
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
            color: status.success ? "var(--pex-success)" : "var(--pex-error)",
          }}
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
