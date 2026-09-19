import React from "react";
import { AdminEmptyState } from "../ui/AdminEmptyState";
import { AdminButton } from "../ui/AdminButton";
import { Search, Plus } from "lucide-react";

export default {
  title: "Admin/Compound/AdminEmptyState",
  component: AdminEmptyState,
};

export function Default() {
  return (
    <AdminEmptyState
      title="No Products Found"
      description="There are currently no items matching the selected inventory criteria."
    />
  );
}

export function SearchResultsEmpty() {
  return (
    <AdminEmptyState
      icon={<Search size={24} />}
      title="No Matching Search Results"
      description="We couldn't find any products matching your query. Try broadening your keywords."
    />
  );
}

export function WithAction() {
  return (
    <AdminEmptyState
      title="No Suppliers Configured"
      description="Get started by registering your first supplier partner to enable catalog procurement."
      action={
        <AdminButton variant="primary" size="md" icon={<Plus size={16} />}>
          Register Supplier
        </AdminButton>
      }
    />
  );
}
