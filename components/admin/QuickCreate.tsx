"use client";

import Link from "next/link";
import { Plus, FileSpreadsheet, Briefcase, Package, ShoppingCart } from "lucide-react";
import styles from "./DashboardClient.module.css";
import adminStyles from "@/app/admin/admin.module.css";

export function QuickCreate() {
  return (
    <div className={adminStyles.buttonGroup} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      <Link
        href="/admin/quotations/new"
        className={adminStyles.button}
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "#ffffff",
          borderColor: "rgba(16, 185, 129, 0.4)",
          fontWeight: 600,
        }}
      >
        <Plus size={14} /> New Quotation
      </Link>
      <Link
        href="/admin/packs"
        className={adminStyles.button}
      >
        <Briefcase size={14} /> School Packs
      </Link>
      <Link
        href="/admin/orders"
        className={adminStyles.button}
      >
        <ShoppingCart size={14} /> Orders
      </Link>
    </div>
  );
}
