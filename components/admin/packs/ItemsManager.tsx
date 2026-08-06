"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ItemRow, ItemFormState } from "@/lib/admin/items";
import {
  createItemAction,
  updateItemAction,
  deleteItemAction,
  reorderItemsAction,
  importItemsAction,
} from "@/app/admin/items/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import styles from "./ItemsManager.module.css";

function str(v: string | number | null | undefined): string {
  return v == null ? "" : String(v);
}

interface ItemFormProps {
  packId: string;
  item: ItemRow | null;
  onDone: () => void;
  onSuccess: () => void;
}

function ItemForm({ packId, item, onDone, onSuccess }: ItemFormProps) {
  const action =
    item == null
      ? createItemAction
      : updateItemAction.bind(null, item.id);

  const [state, formAction] = useActionState<ItemFormState, FormData>(action, {
    ok: false,
  });
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state?.ok) onSuccess();
  }, [state, onSuccess]);

  const err = (field: string) =>
    state?.errors?.[field] ? (
      <span className={styles.error} role="alert">
        {state.errors[field]}
      </span>
    ) : null;

  return (
    <form
      action={async (formData) => {
        formAction(formData);
      }}
      className={styles.itemForm}
    >
      <input type="hidden" name="pack_id" value={packId} />
      <input type="hidden" name="sort_order" value={item?.sort_order ?? 0} />
      {state?.message ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            Name *
          </label>
          <input
            id="name"
            name="name"
            className={styles.input}
            defaultValue={item?.name ?? ""}
            placeholder="e.g. A4 Exercise Book"
            required
          />
          {err("name")}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="quantity">
            Qty
          </label>
          <input
            id="quantity"
            name="quantity"
            className={styles.input}
            inputMode="numeric"
            defaultValue={item?.quantity ?? 1}
          />
          {err("quantity")}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sort_order">
            Sort order
          </label>
          <input
            id="sort_order"
            name="sort_order"
            className={styles.input}
            inputMode="numeric"
            defaultValue={item?.sort_order ?? 0}
          />
          {err("sort_order")}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className={styles.textarea}
          rows={2}
          defaultValue={str(item?.description)}
        />
        {err("description")}
      </div>

      <div className={styles.formFooter}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            name="visible"
            defaultChecked={item?.visible ?? true}
          />
          Visible on site
        </label>
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onDone}
          >
            Cancel
          </button>
          <button type="submit" className={styles.saveButton} disabled={pending}>
            {pending ? "Saving…" : item ? "Save item" : "Add item"}
          </button>
        </div>
      </div>
    </form>
  );
}

function ImportForm({ packId, onImported }: { packId: string; onImported: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("csv") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const text = await file.text();
      const result = await importItemsAction(packId, text);
      if (result.errors.length > 0) {
        setError(result.errors.slice(0, 5).join(" · "));
      }
      setMessage(
        `${result.created} created · ${result.updated} updated${
          result.errors.length > 0 ? ` · ${result.errors.length} errors` : ""
        }`
      );
      if (result.created > 0 || result.updated > 0) onImported();
    } catch {
      setError("Could not import the CSV file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.importForm} onSubmit={handleSubmit}>
      <input type="file" name="csv" accept=".csv,text/csv" className={styles.fileInput} />
      <button type="submit" className={styles.importButton} disabled={busy}>
        {busy ? "Importing…" : "Import CSV"}
      </button>
      {message ? (
        <span className={styles.importSuccess} role="status">
          {message}
        </span>
      ) : null}
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </form>
  );
}

interface ItemsManagerProps {
  packId: string;
  items: ItemRow[];
}

export function ItemsManager({ packId, items }: ItemsManagerProps) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = () => {
    router.refresh();
    setShowAdd(false);
    setEditingId(null);
  };

  async function move(index: number, direction: -1 | 1) {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await reorderItemsAction(
      packId,
      next.map((i) => i.id)
    );
    router.refresh();
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Items</h3>
        <span className={styles.count}>
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>No items in this pack yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Visible</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.reorder}>
                      <button
                        type="button"
                        className={styles.reorderButton}
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={styles.reorderButton}
                        onClick={() => move(index, 1)}
                        disabled={index === items.length - 1}
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className={styles.itemName}>{item.name}</div>
                    {item.description ? (
                      <div className={styles.itemDesc}>{item.description}</div>
                    ) : null}
                  </td>
                  <td>{item.quantity}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        item.visible ? styles.badgeVisible : styles.badgeHidden
                      }`}
                    >
                      {item.visible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.actionLink}
                        onClick={() => setEditingId(item.id)}
                      >
                        Edit
                      </button>
                      <form action={deleteItemAction.bind(null, item.id)}>
                        <ConfirmButton
                          label="Delete"
                          confirmText={`Delete "${item.name}"?`}
                          busyLabel="Deleting…"
                          className={styles.deleteButton}
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd ? (
        <ItemForm
          packId={packId}
          item={null}
          onDone={() => setShowAdd(false)}
          onSuccess={refresh}
        />
      ) : (
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setShowAdd(true)}
        >
          + Add item
        </button>
      )}

      {editingId ? (
        <div className={styles.editor}>
          <ItemForm
            packId={packId}
            item={items.find((i) => i.id === editingId) ?? null}
            onDone={() => setEditingId(null)}
            onSuccess={refresh}
          />
        </div>
      ) : null}

      <div className={styles.import}>
        <h4 className={styles.importTitle}>Bulk import (CSV)</h4>
        <ImportForm packId={packId} onImported={refresh} />
        <p className={styles.importHint}>
          Columns: name, quantity, description, visible, sort_order.
          Existing items are matched by name and updated.
        </p>
      </div>
    </div>
  );
}
