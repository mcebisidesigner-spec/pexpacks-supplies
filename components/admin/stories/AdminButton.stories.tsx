import React from "react";
import { AdminButton } from "../ui/AdminButton";
import { Plus, Trash2, Check } from "lucide-react";

export default {
  title: "Admin/Primitives/AdminButton",
  component: AdminButton,
};

export function Primary() {
  return (
    <AdminButton variant="primary" size="md" icon={<Plus size={16} />}>
      Add New Item
    </AdminButton>
  );
}

export function Secondary() {
  return (
    <AdminButton variant="secondary" size="md">
      Cancel Operation
    </AdminButton>
  );
}

export function Danger() {
  return (
    <AdminButton variant="danger" size="md" icon={<Trash2 size={16} />}>
      Delete Record
    </AdminButton>
  );
}

export function Ghost() {
  return (
    <AdminButton variant="ghost" size="md">
      Dismiss
    </AdminButton>
  );
}

export function Loading() {
  return (
    <AdminButton variant="primary" size="md" loading>
      Saving Record…
    </AdminButton>
  );
}

export function Disabled() {
  return (
    <AdminButton variant="primary" size="md" disabled icon={<Check size={16} />}>
      Changes Saved
    </AdminButton>
  );
}
