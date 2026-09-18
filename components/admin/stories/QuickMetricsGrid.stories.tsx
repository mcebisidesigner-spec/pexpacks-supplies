import React from "react";
import { QuickMetricsGrid, type QuickMetricItem } from "../ui/QuickMetricsGrid";
import { DollarSign, ShoppingCart, School, AlertTriangle } from "lucide-react";

export default {
  title: "Admin/Domain/QuickMetricsGrid",
  component: QuickMetricsGrid,
};

export function Default() {
  const sampleMetrics: QuickMetricItem[] = [
    {
      label: "Total Revenue",
      value: "R 284,950",
      trend: "+18.4% vs last month",
      trendDirection: "up",
      tone: "emerald",
      icon: <DollarSign size={16} />,
    },
    {
      label: "Active Orders",
      value: 142,
      trend: "34 awaiting packing",
      trendDirection: "neutral",
      tone: "blue",
      icon: <ShoppingCart size={16} />,
    },
    {
      label: "Partner Schools",
      value: 28,
      trend: "94.2% catalog coverage",
      trendDirection: "up",
      tone: "purple",
      icon: <School size={16} />,
    },
    {
      label: "Low Stock Items",
      value: 5,
      trend: "Restock required",
      trendDirection: "down",
      tone: "red",
      icon: <AlertTriangle size={16} />,
    },
  ];

  return <QuickMetricsGrid metrics={sampleMetrics} />;
}
