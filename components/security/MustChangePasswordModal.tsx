"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { setPermanentPasswordAction } from "@/app/actions/auth";

interface MustChangePasswordModalProps {
  userEmail: string;
  mustChangePassword?: boolean;
}

export function MustChangePasswordModal({
  userEmail,
  mustChangePassword = false,
}: MustChangePasswordModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(mustChangePassword);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isMinLength = password.length >= 8;
  const isMatching = password.length > 0 && password === confirmPassword;
  const canSubmit = isMinLength && isMatching && !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isMinLength) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!isMatching) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    startTransition(async () => {
      const res = await setPermanentPasswordAction(password, confirmPassword);
      if (res.ok) {
        setSuccessMessage("Your permanent password has been established! Redirecting you to sign in with your new password...");
        setTimeout(() => {
          setIsOpen(false);
          router.push("/pex-console-secure?status=password_updated");
        }, 1400);
      } else {
        setErrorMessage(res.message || "Failed to set permanent password.");
      }
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(3, 7, 18, 0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#090e17",
          border: "1px solid rgba(59, 130, 246, 0.4)",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "24px 28px",
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(9, 14, 23, 0.95) 100%)",
            borderBottom: "1px solid rgba(51, 65, 85, 0.5)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              color: "#38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <KeyRound size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#ffffff", margin: "0 0 2px" }}>
              Create Permanent Password
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: 0 }}>
              First-time setup for <span style={{ color: "#38bdf8", fontWeight: 600 }}>{userEmail}</span>
            </p>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#fca5a5",
                fontSize: "0.8125rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#6ee7b7",
                fontSize: "0.8125rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          <p style={{ fontSize: "0.8125rem", color: "#cbd5e1", lineHeight: 1.5, margin: "0 0 18px" }}>
            You signed in using a temporary onboarding password. For your security and compliance, please establish your permanent private password.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
            {/* New Password */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                New Permanent Password *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter at least 8 characters"
                  disabled={isPending}
                  style={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: "#0c1322",
                    border: "1px solid rgba(51, 65, 85, 0.8)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    padding: "0 40px 0 14px",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
                Confirm New Password *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your new password"
                  disabled={isPending}
                  style={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: "#0c1322",
                    border: "1px solid rgba(51, 65, 85, 0.8)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    padding: "0 40px 0 14px",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Validation Checklist */}
            <div style={{ backgroundColor: "#040914", borderRadius: "8px", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: isMinLength ? "#34d399" : "#64748b" }}>
                <Check size={14} style={{ color: isMinLength ? "#10b981" : "#475569" }} />
                <span>At least 8 characters</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: isMatching ? "#34d399" : "#64748b" }}>
                <Check size={14} style={{ color: isMatching ? "#10b981" : "#475569" }} />
                <span>Passwords match</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: "100%",
              height: "44px",
              backgroundColor: canSubmit ? "#10b981" : "rgba(16, 185, 129, 0.3)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: canSubmit ? "pointer" : "not-allowed",
              transition: "all 0.15s ease",
            }}
          >
            {isPending ? "Establishing Password..." : "Set Permanent Password & Continue →"}
          </button>
        </form>
      </div>
    </div>
  );
}
