"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GradePackItemSelector, {
  type PackLine,
  type StationeryItem,
} from "@/components/grade-packs/GradePackItemSelector";
import { savePackItemsAction, createItemAction } from "@/app/admin/items/actions";
import { ItemsManager } from "./ItemsManager";
import type { ItemRow } from "@/lib/admin/items";
import styles from "./ItemsManager.module.css";

interface PackItemsSectionProps {
  packId: string;
  items: ItemRow[];
}

export function PackItemsSection({ packId, items }: PackItemsSectionProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const signature = useMemo(
    () => items.map((item) => `${item.id}:${item.quantity}:${item.unit_price}`).join("|"),
    [items]
  );

  const initialItems: PackLine[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    unit_price: item.unit_price,
    quantity: item.quantity,
  }));

  async function handleSelectItem(item: StationeryItem) {
    setBusy(true);
    setMessage(null);
    try {
      const priceVal = item.unit_price ?? item.price ?? 0;
      const titleVal = item.title || item.name || "Stationery Item";

      const formData = new FormData();
      formData.set("pack_id", packId);
      formData.set("name", titleVal);
      if (item.description) formData.set("description", item.description);
      if (item.category) formData.set("category", item.category);
      formData.set("price", String(priceVal));
      formData.set("quantity", "1");
      formData.set("sort_order", String(items.length + 1));
      formData.set("visible", "on");

      const result = await createItemAction({ ok: false }, formData);
      if (result.ok) {
        setMessage(`Added "${titleVal}" to pack.`);
        router.refresh();
      } else {
        setMessage(result.message ?? "Could not add item.");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not add item.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(lines: PackLine[]) {
    setBusy(true);
    setMessage(null);
    try {
      const result = await savePackItemsAction(packId, lines);
      if (result.ok) {
        setMessage("Items saved and synced to the public pages.");
        router.refresh();
      } else {
        setMessage(result.message ?? "Could not save items.");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save items.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section aria-label="Quick item editor">
        <GradePackItemSelector
          key={signature}
          initialItems={initialItems}
          submitLabel="Save items"
          busy={busy}
          showSave={false}
          hideList={true}
          onSelectItem={handleSelectItem}
          onSave={handleSave}
        />
        {message ? (
          <p className={styles.importSuccess} role="status" style={{ marginTop: "8px" }}>
            {message}
          </p>
        ) : null}
      </section>
      <ItemsManager packId={packId} items={items} />
    </>
  );
}
