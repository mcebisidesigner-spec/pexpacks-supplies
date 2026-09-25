"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ExternalLink, Truck } from "lucide-react";
import { useNotification } from "@/components/ui/NotificationProvider";
import { cn } from "@/lib/utils";

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
    <div className="mx-auto grid w-full max-w-[860px] gap-8">
      {/* Manual Search Form */}
      <form className="rounded-[24px] sm:rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs grid gap-4.5" onSubmit={handleSubmit}>
        <p className="text-xs font-extrabold uppercase tracking-wider text-teal-600 m-0 mb-1">Order tracking</p>
        <h2>Track your stationery order</h2>
        <p className="-mt-1 text-sm text-pex-muted">
          Enter the details from your receipt to check your order status.
        </p>

        <div className="grid items-end gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <div className="flex flex-col items-center justify-end">
            <label htmlFor="trackOrderRef" className="mb-1.5 block text-center text-[13px] font-bold">
              Order Reference
            </label>
            <input
              id="trackOrderRef"
              name="ref"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="PEX-XXXXX"
              className="w-full text-center"
              required
            />
          </div>

          <div className="flex flex-col items-center justify-end">
            <label htmlFor="trackEmail" className="mb-1.5 block text-center text-[13px] font-bold">
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
              className="w-full text-center"
              required
            />
          </div>

          <div className="flex flex-col items-center justify-end">
            <label htmlFor="trackUniqueId" className="mb-1.5 block text-center text-[13px] font-bold">
              Customer ID from receipt
            </label>
            <input
              id="trackUniqueId"
              name="uniqueId"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              placeholder="CUST-XXXXX"
              className="w-full text-center"
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} variant="primary" className="mt-2">
          {loading ? "Checking your order..." : "Track my order"}
        </Button>

        {error && (
          <div
            role="alert"
            className="mt-3 rounded-[14px] border border-red-700/20 bg-red-700/10 px-4 py-3.5 text-sm font-semibold text-pex-error"
          >
            {error}
          </div>
        )}
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="rounded-3xl border border-pex-border bg-white p-8">
          <div className="mb-6 h-6 w-48 rounded-lg bg-slate-100" />
          <div className="flex justify-between gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 flex-1 rounded-xl bg-slate-50" />
            ))}
          </div>
        </div>
      )}

      {/* Order Progress Visualization */}
      {trackingData && !loading && (
        <div className="grid gap-7 rounded-3xl border border-pex-border bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          {/* Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wide text-pex-keppel">
                Order status
              </span>
              <h3 className="mt-1 text-2xl font-extrabold text-pex-navy">
                Order #{trackingData.orderReference}
              </h3>
            </div>
            <div className="text-right">
              <span className="block text-[13px] text-pex-muted">Estimated Delivery</span>
              <strong className="text-base font-extrabold text-pex-primary">
                {formatDateDisplay(trackingData.estimatedDelivery)}
              </strong>
            </div>
          </div>

          {/* Visual 5-Stage Stepper Graph */}
          <div className="my-3">
            <div className="relative grid grid-cols-5 gap-2">
              {TRACKING_STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stage.key} className="relative flex flex-col items-center text-center">
                    {/* Circle Badge */}
                    <div
                      className={cn(
                        "z-10 flex size-[38px] items-center justify-center rounded-full text-[15px] font-extrabold transition-all duration-300",
                        isCompleted || isCurrent
                          ? "bg-pex-keppel text-white"
                          : "bg-slate-200 text-slate-500",
                        isCurrent && "scale-110 shadow-[0_0_0_4px_rgba(33,158,155,0.25)]"
                      )}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </div>

                    {/* Step Title */}
                    <span
                      className={cn(
                        "mt-2.5 text-center text-[13px] leading-tight",
                        isCurrent
                          ? "font-extrabold text-pex-primary"
                          : isCompleted
                            ? "font-bold text-slate-700"
                            : "font-semibold text-slate-400"
                      )}
                    >
                      {stage.label}
                    </span>

                    {/* Step Description */}
                    <span className="mt-1 text-center text-[11px] text-slate-400">
                      {stage.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier Details Card */}
          {trackingData.courier || trackingData.waybillNumber ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <span className="text-xs font-bold uppercase text-slate-500">
                  Delivery details
                </span>
                <p className="mt-1 text-base font-extrabold text-slate-900">
                  {trackingData.courier || "Courier details not yet available"}
                </p>
              </div>

              {trackingData.waybillNumber ? (
                <div>
                  <span className="block text-xs text-slate-500">Courier reference</span>
                  <a
                    href={`https://thecourierguy.co.za/tracking?waybill=${encodeURIComponent(trackingData.waybillNumber)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-block text-[15px] font-extrabold text-pex-keppel underline underline-offset-2 transition-colors hover:text-pex-keppel-dark"
                  >
                    {trackingData.waybillNumber} <ExternalLink size={14} className="ml-1 inline-block" aria-hidden="true" />
                  </a>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-[13px] font-semibold text-pex-keppel">
              <span className="inline-flex items-center gap-2"><Truck size={16} aria-hidden="true" /> Courier details will appear when your parcel is dispatched.</span>
            </div>
          )}

          <p className="m-0 text-center text-xs text-slate-400">
            Last updated: {new Date(trackingData.updatedAt).toLocaleString("en-ZA")}
          </p>
        </div>
      )}
    </div>
  );
}
