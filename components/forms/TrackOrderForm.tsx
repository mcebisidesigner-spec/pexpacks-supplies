"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Check, ExternalLink, Truck } from "lucide-react";
import { useNotification } from "@/components/ui/NotificationProvider";

type TrackingResult = {
  orderReference: string;
  status: "placed" | "processing" | "shipped" | "out_for_delivery" | "delivered";
  estimatedDelivery: string | null;
  courier: string | null;
  waybillNumber: string | null;
  updatedAt: string;
};

const TRACKING_STAGES = [
  { key: "placed", label: "Order Placed", desc: "Order received & verified" },
  { key: "processing", label: "Processing & Packed", desc: "Stationery kit assembled" },
  { key: "shipped", label: "Handed to Courier", desc: "In transit with courier" },
  { key: "out_for_delivery", label: "Out for Delivery", desc: "Arriving today" },
  { key: "delivered", label: "Delivered", desc: "Delivered & confirmed" },
] as const;

function getStageIndex(status: string): number {
  switch (status) {
    case "placed":
      return 0;
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "out_for_delivery":
      return 3;
    case "delivered":
      return 4;
    default:
      return 0;
  }
}

function formatDateDisplay(value: string | null): string {
  if (!value) return "To be confirmed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function TrackOrderForm() {
  const searchParams = useSearchParams();
  const { notify } = useNotification();

  const [orderRef, setOrderRef] = useState("");
  const [email, setEmail] = useState("");
  const [uniqueId, setUniqueId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);

  const executeLookup = async (params: { ref?: string; email?: string; uniqueId?: string; token?: string }) => {
    setLoading(true);
    setError(null);
    setTrackingData(null);

    const query = new URLSearchParams();
    if (params.ref) query.set("ref", params.ref);
    if (params.email) query.set("email", params.email);
    if (params.uniqueId) query.set("uniqueId", params.uniqueId);
    if (params.token) query.set("token", params.token);

    try {
      const res = await fetch(`/api/track-order?${query.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.orderReference) {
        setError(
          data.message ||
            "I could not find that order yet. Please check the details on your receipt and try again."
        );
        return;
      }

      setTrackingData(data);
      notify({
        tone: "success",
        title: "Order details found",
        message: "Your latest order status is ready to review.",
      });
      if (data.orderReference) setOrderRef(data.orderReference);
    } catch {
      setError("Unable to connect to order tracking service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // URL Auto-Fill & Execution on page mount
  useEffect(() => {
    const refParam = searchParams.get("ref") || "";
    const emailParam = searchParams.get("email") || "";
    const tokenParam = searchParams.get("token") || "";
    const uniqueIdParam = searchParams.get("uniqueId") || "";

    if (refParam) setOrderRef(refParam);
    if (emailParam) setEmail(emailParam);
    if (uniqueIdParam) setUniqueId(uniqueIdParam);

    if (tokenParam || (refParam && emailParam && uniqueIdParam)) {
      executeLookup({
        ref: refParam,
        email: emailParam,
        token: tokenParam,
        uniqueId: uniqueIdParam,
      });
    }
  }, [searchParams]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orderRef.trim() || !email.trim() || !uniqueId.trim()) {
      setError("Please enter your order reference, email, and customer ID from the receipt.");
      return;
    }

    executeLookup({
      ref: orderRef.trim(),
      email: email.trim(),
      uniqueId: uniqueId.trim(),
    });
  };

  const currentStageIndex = trackingData ? getStageIndex(trackingData.status) : 0;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gap: 32 }}>
      {/* Manual Search Form */}
      <form className="rounded-[24px] sm:rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs grid gap-4.5" onSubmit={handleSubmit}>
        <p className="text-xs font-extrabold uppercase tracking-wider text-teal-600 m-0 mb-1">Order tracking</p>
        <h2>Track your stationery order</h2>
        <p style={{ fontSize: 14, color: "var(--pex-text-muted)", marginTop: -4 }}>
          Enter the details from your receipt to check your order status.
        </p>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", alignItems: "end" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}>
            <label htmlFor="trackOrderRef" style={{ fontWeight: 700, fontSize: 13, display: "block", marginBottom: 6, textAlign: "center" }}>
              Order Reference
            </label>
            <input
              id="trackOrderRef"
              name="ref"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="PEX-XXXXX"
              style={{ width: "100%", textAlign: "center" }}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}>
            <label htmlFor="trackEmail" style={{ fontWeight: 700, fontSize: 13, display: "block", marginBottom: 6, textAlign: "center" }}>
              Email used for order
            </label>
            <input
              id="trackEmail"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{ width: "100%", textAlign: "center" }}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}>
            <label htmlFor="trackUniqueId" style={{ fontWeight: 700, fontSize: 13, display: "block", marginBottom: 6, textAlign: "center" }}>
              Customer ID from receipt
            </label>
            <input
              id="trackUniqueId"
              name="uniqueId"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              placeholder="CUST-XXXXX"
              style={{ width: "100%", textAlign: "center" }}
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} variant="primary" style={{ marginTop: 8 }}>
          {loading ? "Checking your order..." : "Track my order"}
        </Button>

        {error && (
          <div
            role="alert"
            style={{
              marginTop: 12,
              padding: "14px 16px",
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 600,
              background: "rgba(185, 28, 28, 0.08)",
              color: "var(--pex-error)",
              border: "1px solid rgba(185, 28, 28, 0.2)",
            }}
          >
            {error}
          </div>
        )}
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ background: "#ffffff", borderRadius: 24, padding: 32, border: "1px solid var(--pex-border)" }}>
          <div style={{ height: 24, width: 200, background: "#f1f5f9", borderRadius: 8, marginBottom: 24 }} />
          <div style={{ display: "flex", gap: 16, justifyContent: "space-between" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ flex: 1, height: 48, background: "#f8fafc", borderRadius: 12 }} />
            ))}
          </div>
        </div>
      )}

      {/* Order Progress Visualization */}
      {trackingData && !loading && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 24,
            padding: 32,
            border: "1px solid var(--pex-border)",
            boxShadow: "0 12px 32px rgba(15,23,42,0.06)",
            display: "grid",
            gap: 28,
          }}
        >
          {/* Status Header */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 800, color: "var(--pex-keppel)" }}>
                Order status
              </span>
              <h3 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800, color: "var(--pex-navy)" }}>
                Order #{trackingData.orderReference}
              </h3>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 13, color: "var(--pex-text-muted)", display: "block" }}>Estimated Delivery</span>
              <strong style={{ fontSize: 16, color: "var(--pex-primary)", fontWeight: 800 }}>
                {formatDateDisplay(trackingData.estimatedDelivery)}
              </strong>
            </div>
          </div>

          {/* Visual 5-Stage Stepper Graph */}
          <div style={{ margin: "12px 0" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 8,
                position: "relative",
              }}
            >
              {TRACKING_STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div
                    key={stage.key}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    {/* Circle Badge */}
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 15,
                        zIndex: 2,
                        transition: "all 0.3s ease",
                        background: isCompleted || isCurrent ? "var(--pex-keppel)" : "#e2e8f0",
                        color: isCompleted || isCurrent ? "#ffffff" : "#64748b",
                        boxShadow: isCurrent ? "0 0 0 4px rgba(33,158,155,0.25)" : "none",
                        transform: isCurrent ? "scale(1.1)" : "none",
                      }}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </div>

                    {/* Step Title */}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: isCurrent ? 800 : isCompleted ? 700 : 600,
                        color: isCurrent ? "var(--pex-primary)" : isCompleted ? "#334155" : "#94a3b8",
                        marginTop: 10,
                        textAlign: "center",
                        lineHeight: 1.2,
                      }}
                    >
                      {stage.label}
                    </span>

                    {/* Step Description */}
                    <span
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        marginTop: 4,
                        textAlign: "center",
                      }}
                    >
                      {stage.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier Details Card */}
          {trackingData.courier || trackingData.waybillNumber ? (
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 16,
                padding: 20,
                border: "1px solid #e2e8f0",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <span style={{ fontSize: 12, textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
                  Delivery details
                </span>
                <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                  {trackingData.courier || "Courier details not yet available"}
                </p>
              </div>

              {trackingData.waybillNumber ? (
                <div>
                  <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Courier reference</span>
                  <a
                    href={`https://thecourierguy.co.za/tracking?waybill=${encodeURIComponent(trackingData.waybillNumber)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: 2,
                      fontSize: 15,
                      fontWeight: 800,
                      color: "var(--pex-keppel)",
                      textDecoration: "underline",
                    }}
                  >
                    {trackingData.waybillNumber} <ExternalLink size={14} className="ml-1 inline-block" aria-hidden="true" />
                  </a>
                </div>
              ) : null}
            </div>
          ) : (
            <div
              style={{
                background: "#f0fbfa",
                borderRadius: 16,
                padding: 16,
                border: "1px solid #cdeeea",
                fontSize: 13,
                color: "#1a7a77",
                fontWeight: 600,
              }}
            >
              <span className="inline-flex items-center gap-2"><Truck size={16} aria-hidden="true" /> Courier details will appear when your parcel is dispatched.</span>
            </div>
          )}

          <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", margin: 0 }}>
            Last updated: {new Date(trackingData.updatedAt).toLocaleString("en-ZA")}
          </p>
        </div>
      )}
    </div>
  );
}
