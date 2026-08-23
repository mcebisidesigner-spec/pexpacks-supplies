"use client";

import React, { useState, useTransition } from "react";
import { ShieldAlert, Lock, X, AlertTriangle } from "lucide-react";
import { verifyStepUpAction } from "@/app/actions/verify-step-up";

interface StepUpModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  actionName?: string;
  onSuccess: (token: string) => void;
  onCancel: () => void;
}

export function StepUpModal({
  isOpen,
  title = "Security Verification Required",
  description = "This is a high-risk administrative operation. Please re-enter your account password to authorize execution.",
  actionName = "Authorize Action",
  onSuccess,
  onCancel,
}: StepUpModalProps) {
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg("Please enter your administrator password.");
      return;
    }
    setErrorMsg(null);

    startTransition(async () => {
      const result = await verifyStepUpAction(password);
      if (result.ok) {
        setPassword("");
        onSuccess(result.token);
      } else {
        setErrorMsg(result.message);
      }
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(7, 11, 18, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "16px",
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#0c1322",
          border: "1px solid rgba(51, 65, 85, 0.9)",
          borderRadius: "14px",
          padding: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            padding: "4px",
          }}
          disabled={isPending}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f59e0b",
            }}
          >
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
              {title}
            </h3>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#f59e0b",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}
            >
              Step-Up Authorization
            </span>
          </div>
        </div>

        <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.5", margin: "0 0 18px" }}>
          {description}
        </p>

        {errorMsg && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 12px",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              color: "#f87171",
              fontSize: "12px",
              marginBottom: "16px",
            }}
          >
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="stepup-password"
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#cbd5e1",
                marginBottom: "6px",
              }}
            >
              Administrator Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="stepup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your current password"
                autoFocus
                required
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  fontSize: "13px",
                  color: "#f8fafc",
                  backgroundColor: "#070b12",
                  border: "1px solid rgba(51, 65, 85, 0.8)",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <Lock
                size={15}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              style={{
                padding: "9px 16px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#94a3b8",
                backgroundColor: "transparent",
                border: "1px solid rgba(51, 65, 85, 0.8)",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: "9px 18px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: "#10b981",
                border: "none",
                borderRadius: "8px",
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.7 : 1,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
            >
              {isPending ? "Verifying..." : actionName}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
