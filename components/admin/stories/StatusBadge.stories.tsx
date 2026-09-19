import React from "react";
import { StatusBadge } from "../ui/StatusBadge";

export default {
  title: "Admin/Primitives/StatusBadge",
  component: StatusBadge,
};

export function Success() {
  return <StatusBadge status="paid" tone="emerald" showDot />;
}

export function Warning() {
  return <StatusBadge status="processing" tone="amber" showDot />;
}

export function Danger() {
  return <StatusBadge status="cancelled" tone="red" showDot />;
}

export function Info() {
  return <StatusBadge status="in_transit" tone="blue" showDot />;
}

export function Neutral() {
  return <StatusBadge status="draft" tone="slate" showDot />;
}
