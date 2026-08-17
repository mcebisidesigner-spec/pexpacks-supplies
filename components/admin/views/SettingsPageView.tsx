"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Database,
  FileText,
  Key,
  Lock,
  Mail,
  Receipt,
  Server,
  Settings,
  Shield,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import styles from "./CorePagesView.module.css";

export function SettingsPageView() {
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Settings</h1>
          <p className={styles.headerSubtitle}>Manage system configuration and preferences.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 16, alignItems: "start" }}>
        {/* Left Section: System Configuration (8 Cards) */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginBottom: 12 }}>
            System Configuration
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { title: "General", desc: "Company details, time zone and preferences", icon: Settings },
              { title: "Users & Roles", desc: "Manage users, roles and permissions", icon: Users },
              { title: "Notifications", desc: "Email, SMS and in-app notification settings", icon: Bell },
              { title: "Integrations", desc: "Payment gateways and third-party tools", icon: Key },
              { title: "Financial", desc: "Tax, invoices, payment terms", icon: Receipt },
              { title: "Warehouse", desc: "Locations, warehouses and inventory rules", icon: Warehouse },
              { title: "Templates", desc: "Document and email templates", icon: FileText },
              { title: "Audit Logs", desc: "System activity and audit trail", icon: Shield },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className={styles.tableCard}
                  style={{ padding: 16, cursor: "pointer", transition: "all 140ms ease" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(45, 212, 191, 0.15)", color: "#2dd4bf", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <strong style={{ color: "#ffffff", fontSize: 13 }}>{card.title}</strong>
                      <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: 11 }}>{card.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Quick Settings & System Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Quick Settings */}
          <div className={styles.tableCard} style={{ padding: 18 }}>
            <strong style={{ color: "#ffffff", fontSize: 13, marginBottom: 12, display: "block" }}>Quick Settings</strong>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Payment Providers", active: true },
                { label: "Shipping Carriers", active: true },
                { label: "Email Settings", active: true },
                { label: "Document Settings", active: false },
                { label: "Data Backup", active: true },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: "#cbd5e1" }}>{item.label}</span>
                  <input type="checkbox" defaultChecked={item.active} style={{ accentColor: "#0d9488", cursor: "pointer", width: 16, height: 16 }} />
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className={styles.tableCard} style={{ padding: 18 }}>
            <strong style={{ color: "#ffffff", fontSize: 13, marginBottom: 10, display: "block" }}>System Status</strong>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
              <strong style={{ color: "#ffffff", fontSize: 12 }}>All Systems Operational</strong>
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 14 }}>Last checked: 2 mins ago</div>
            <button className={styles.secondaryBtn} style={{ width: "100%", justifyContent: "center" }}>
              View Status Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
