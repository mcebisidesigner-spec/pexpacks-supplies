import React from "react";
import { AdminInfoPanel } from "../ui/AdminInfoPanel";
import { AdminButton } from "../ui/AdminButton";

export default {
  title: "Admin/Compound/AdminInfoPanel",
  component: AdminInfoPanel,
};

export function Default() {
  return (
    <AdminInfoPanel tone="info" title="Automatic Pricing Engine Active">
      All grade pack subtotals and retail margins are synchronized dynamically
      with the central supplier catalog rates.
    </AdminInfoPanel>
  );
}

export function Warning() {
  return (
    <AdminInfoPanel tone="warning" title="Inventory Depletion Alert">
      3 master product SKUs have fallen below their 10-unit minimum buffer threshold.
    </AdminInfoPanel>
  );
}

export function Success() {
  return (
    <AdminInfoPanel tone="success" title="Database Reconciliation Complete">
      All 129 database migrations have executed cleanly without schema drift.
    </AdminInfoPanel>
  );
}

export function WithAction() {
  return (
    <AdminInfoPanel
      tone="neutral"
      title="Scheduled Maintenance Notice"
      action={
        <AdminButton variant="outline" size="sm">
          Review Schedule
        </AdminButton>
      }
    >
      The database connection pool will undergo routine health diagnostics tonight at 02:00 SAST.
    </AdminInfoPanel>
  );
}
