import Link from "next/link";
import { ArrowLeft, AlertCircle, LayoutDashboard } from "lucide-react";
import styles from "./admin.module.css";

export default function AdminNotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          backgroundColor: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ef4444",
          marginBottom: "20px",
        }}
      >
        <AlertCircle size={28} />
      </div>

      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: "#ffffff",
          margin: "0 0 8px 0",
          letterSpacing: "-0.02em",
        }}
      >
        Admin Resource Not Found
      </h1>

      <p
        style={{
          fontSize: "0.875rem",
          color: "#94a3b8",
          maxWidth: "440px",
          margin: "0 0 24px 0",
          lineHeight: 1.6,
        }}
      >
        The requested admin record, school, order, or setting could not be found or you do not have permission to view it.
      </p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/admin"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            height: "38px",
            padding: "0 16px",
            background: "#10b981",
            color: "#ffffff",
            borderRadius: "8px",
            fontSize: "0.8125rem",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 2px 10px rgba(16, 185, 129, 0.25)",
          }}
        >
          <LayoutDashboard size={14} />
          Back to Dashboard
        </Link>

        <Link
          href="/admin/schools"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            height: "38px",
            padding: "0 16px",
            background: "#090e17",
            color: "#cbd5e1",
            border: "1px solid rgba(51, 65, 85, 0.6)",
            borderRadius: "8px",
            fontSize: "0.8125rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} />
          Back to Schools
        </Link>
      </div>
    </div>
  );
}
