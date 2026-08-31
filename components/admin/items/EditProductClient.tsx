"use client";

import { useState } from "react";
import type { ItemRow, MasterPricingConfig } from "@/lib/admin/items";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ItemForm } from "@/components/admin/items/ItemForm";

interface EditProductClientProps {
  item: ItemRow | null;
  initialName: string;
  initialSku: string;
  initialCategory: string;
  productSlug: string;
  returnTo: string;
  pricingConfig: MasterPricingConfig;
}

export function EditProductClient({
  item,
  initialName,
  initialSku,
  initialCategory,
  productSlug,
  returnTo,
  pricingConfig,
}: EditProductClientProps) {
  const [liveTitle, setLiveTitle] = useState(initialName);
  const [liveSku, setLiveSku] = useState(initialSku);
  const [liveCategory, setLiveCategory] = useState(initialCategory);

  return (
    <>
      <AdminPageHeader
        backHref={returnTo}
        backLabel="Back to Product"
        title={liveTitle || "New Product"}
        badge={
          <StatusBadge
            status={liveCategory || "Stationery"}
            tone="emerald"
            showDot
          />
        }
        subtitle={`SKU: ${liveSku || productSlug} • Manage pricing, cost verification, and master catalogue metadata.`}
      />

      <ItemForm
        item={item}
        packs={[]}
        masterMode
        pricingConfig={pricingConfig}
        submitLabel="Save product"
        returnTo={returnTo}
        onNameChange={setLiveTitle}
        onSkuChange={setLiveSku}
        onCategoryChange={setLiveCategory}
      />
    </>
  );
}
