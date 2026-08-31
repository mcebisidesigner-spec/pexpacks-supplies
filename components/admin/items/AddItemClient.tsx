"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ItemForm } from "@/components/admin/items/ItemForm";
import type { MasterPricingConfig } from "@/lib/admin/items";

interface AddItemClientProps {
  pricingConfig: MasterPricingConfig;
}

export function AddItemClient({ pricingConfig }: AddItemClientProps) {
  const [liveTitle, setLiveTitle] = useState("");
  const [liveSku, setLiveSku] = useState("");
  const [liveCategory, setLiveCategory] = useState("Stationery");

  return (
    <>
      <AdminPageHeader
        backHref="/admin/products"
        backLabel="Back to Products"
        title={liveTitle || "New Product"}
        badge={
          <StatusBadge
            status={liveCategory || "Stationery"}
            tone="emerald"
            showDot
          />
        }
        subtitle={
          liveSku
            ? `SKU: ${liveSku} • Create a new master catalogue product.`
            : "Create a new master catalogue product for school packs."
        }
      />

      <ItemForm
        item={null}
        packs={[]}
        masterMode
        pricingConfig={pricingConfig}
        submitLabel="Add Product"
        returnTo="/admin/products"
        onNameChange={setLiveTitle}
        onSkuChange={setLiveSku}
        onCategoryChange={setLiveCategory}
      />
    </>
  );
}
