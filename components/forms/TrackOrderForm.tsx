"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { splitContactInput } from "@/lib/forms/contact";
import page from "@/styles/Page.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
};

export function TrackOrderForm() {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    setPending(true);
    setStatus(null);

    const orderNumber =
      typeof fd.get("orderNumber") === "string"
        ? (fd.get("orderNumber") as string)
        : "";
    const contact =
      typeof fd.get("contact") === "string"
        ? (fd.get("contact") as string)
        : "";
    const contactParts = splitContactInput(contact);

    const payload = {
      formType: "track-order-interest" as const,
      fullName: orderNumber || "Track order request",
      ...contactParts,
      contactDetail: contact,
      message: `Order tracking request.\nOrder Number: ${orderNumber || "Not provided"}\nContact: ${contact || "Not provided"}`,
      packType: "track-order",
      consent: true,
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
      <label>
        Order number
        <input name="orderNumber" placeholder="PEX-2026-001" required />
      </label>
      <label>
        Phone or email
        <input
          name="contact"
          placeholder="Phone number or email address"
          required
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Track order"}
      </Button>
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
            color: status.success ? "var(--pex-success)" : "var(--pex-error)",
          }}
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
