"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GradePackItemSelector, {
  type PackLine,
} from "@/components/grade-packs/GradePackItemSelector";
import { savePackItemsAction } from "@/app/admin/items/actions";
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
          onSave={handleSave}
        />
        {message ? (
          <p className={styles.importSuccess} role="status">
            {message}
          </p>
        ) : null}
      </section>
      <ItemsManager packId={packId} items={items} />
    </>
  );
}
