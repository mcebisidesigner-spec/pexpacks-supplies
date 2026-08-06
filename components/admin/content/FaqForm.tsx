"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { saveFaqAction } from "@/app/admin/content/actions";
import { FAQ_CATEGORIES } from "@/lib/admin/content-constants";
import type { ContentFormState } from "@/lib/admin/content";
import styles from "./content-form.module.css";

export interface FaqLinkDefaults {
  label: string;
  href: string;
}

export interface FaqDefaults {
  slug: string;
  category: string;
  question: string;
  answer: string;
  links: FaqLinkDefaults[];
  visible: boolean;
  sort_order: number;
}

interface LinkRow {
  key: number;
  label: string;
  href: string;
}

function toLinks(value: FaqDefaults["links"] | undefined): LinkRow[] {
  const rows = (value ?? []).map((l) => ({
    key: Math.random(),
    label: l.label ?? "",
    href: l.href ?? "",
  }));
  return rows.length > 0 ? rows : [{ key: 0, label: "", href: "" }];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Saving…" : "Save FAQ"}
    </button>
  );
}

export function FaqForm({
  id,
  defaults,
}: {
  id: string | null;
  defaults?: FaqDefaults;
}) {
  const [state, formAction] = useActionState<ContentFormState, FormData>(
    saveFaqAction.bind(null, id),
    {}
  );
  const [links, setLinks] = useState<LinkRow[]>(() => toLinks(defaults?.links));
  const [nextKey, setNextKey] = useState(1);

  function updateLink(key: number, patch: Partial<Pick<LinkRow, "label" | "href">>) {
    setLinks((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function addLink() {
    setLinks((prev) => [...prev, { key: nextKey, label: "", href: "" }]);
    setNextKey((k) => k + 1);
  }

  function removeLink(key: number) {
    setLinks((prev) => prev.filter((l) => l.key !== key));
  }

  return (
    <form action={formAction} className={styles.form}>
      <input
        type="hidden"
        name="links"
        value={JSON.stringify(
          links.filter((l) => l.label.trim() || l.href.trim())
        )}
      />

      {state?.ok ? (
        <p className={styles.success} role="status">
          {state.message}
        </p>
      ) : state?.message ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            className={styles.input}
            defaultValue={defaults?.slug ?? ""}
            placeholder="delivery-timing"
          />
          {state?.errors?.slug ? (
            <span className={styles.error} role="alert">{state.errors.slug}</span>
          ) : null}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            className={styles.select}
            defaultValue={defaults?.category ?? "School packs"}
          >
            {FAQ_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {state?.errors?.category ? (
            <span className={styles.error} role="alert">{state.errors.category}</span>
          ) : null}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sort_order">
            Sort order
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            min={0}
            className={styles.input}
            defaultValue={defaults?.sort_order ?? 0}
          />
          {state?.errors?.sort_order ? (
            <span className={styles.error} role="alert">{state.errors.sort_order}</span>
          ) : null}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="question">
          Question
        </label>
        <input
          id="question"
          name="question"
          type="text"
          className={styles.input}
          defaultValue={defaults?.question ?? ""}
        />
        {state?.errors?.question ? (
          <span className={styles.error} role="alert">{state.errors.question}</span>
        ) : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="answer">
          Answer
        </label>
        <textarea
          id="answer"
          name="answer"
          rows={6}
          className={styles.textarea}
          defaultValue={defaults?.answer ?? ""}
        />
        {state?.errors?.answer ? (
          <span className={styles.error} role="alert">{state.errors.answer}</span>
        ) : null}
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Related links</span>
        <div className={styles.linkEditor}>
          {links.map((link) => (
            <div key={link.key} className={styles.linkRow}>
              <div className={styles.field}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Label (e.g. Delivery policy)"
                  value={link.label}
                  onChange={(e) => updateLink(link.key, { label: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="/delivery-policy"
                  value={link.href}
                  onChange={(e) => updateLink(link.key, { href: e.target.value })}
                />
              </div>
              <button
                type="button"
                className={styles.linkRemove}
                onClick={() => removeLink(link.key)}
                aria-label="Remove link"
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className={styles.linkAdd} onClick={addLink}>
            + Add link
          </button>
        </div>
        <p className={styles.hint}>
          Optional related pages shown under the answer. URLs can be internal paths like
          &quot;/delivery-policy&quot; or full web addresses.
        </p>
        {state?.errors?.links ? (
          <span className={styles.error} role="alert">{state.errors.links}</span>
        ) : null}
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          id="visible"
          name="visible"
          defaultChecked={defaults?.visible ?? true}
          className={styles.checkbox}
        />
        <span>
          <span className={styles.checkLabel}>Visible on the site</span>
          <span className={styles.checkHelp}>
            Hidden FAQs are kept but not shown publicly.
          </span>
        </span>
      </label>

      <div className={styles.actions}>
        <SubmitButton />
        <Link href="/admin/content/faqs" className={styles.backLink}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
