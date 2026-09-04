"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Save, Link2 } from "lucide-react";
import { saveFaqAction } from "@/app/admin/content/actions";
import { FAQ_CATEGORIES } from "@/lib/admin/content-constants";
import type { ContentFormState } from "@/lib/admin/content";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";
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
    <AdminButton
      type="submit"
      variant="primary"
      size="md"
      loading={pending}
      icon={<Save size={14} />}
    >
      {pending ? "Saving…" : "Save FAQ"}
    </AdminButton>
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
    {},
  );
  const [links, setLinks] = useState<LinkRow[]>(() => toLinks(defaults?.links));
  const [nextKey, setNextKey] = useState(1);

  function updateLink(
    key: number,
    patch: Partial<Pick<LinkRow, "label" | "href">>,
  ) {
    setLinks((prev) =>
      prev.map((l) => (l.key === key ? { ...l, ...patch } : l)),
    );
  }

  function addLink() {
    setLinks((prev) => [...prev, { key: nextKey, label: "", href: "" }]);
    setNextKey((k) => k + 1);
  }

  function removeLink(key: number) {
    setLinks((prev) => prev.filter((l) => l.key !== key));
  }

  return (
    <form action={formAction} className={adminStyles.stack}>
      <input
        type="hidden"
        name="links"
        value={JSON.stringify(
          links.filter((l) => l.label.trim() || l.href.trim()),
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

      <div className={adminStyles.detailLayout}>
        <div className={adminStyles.leftColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <span>FAQ Content</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="question">
                  Question *
                </label>
                <input
                  id="question"
                  name="question"
                  type="text"
                  className={adminStyles.inputField}
                  defaultValue={defaults?.question ?? ""}
                  placeholder="e.g. How does delivery work?"
                  required
                />
                {state?.errors?.question ? (
                  <span className={styles.error} role="alert">
                    {state.errors.question}
                  </span>
                ) : null}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="answer">
                  Answer *
                </label>
                <textarea
                  id="answer"
                  name="answer"
                  rows={6}
                  className={adminStyles.textareaField}
                  defaultValue={defaults?.answer ?? ""}
                  placeholder="Write the full answer here..."
                />
                {state?.errors?.answer ? (
                  <span className={styles.error} role="alert">
                    {state.errors.answer}
                  </span>
                ) : null}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <span className={adminStyles.formLabel}>Related links</span>
                <div className={styles.linkEditor}>
                  {links.map((link) => (
                    <div key={link.key} className={styles.linkRow}>
                      <div className={styles.field}>
                        <input
                          type="text"
                          className={adminStyles.inputField}
                          placeholder="Label (e.g. Delivery policy)"
                          value={link.label}
                          onChange={(e) =>
                            updateLink(link.key, { label: e.target.value })
                          }
                        />
                      </div>
                      <div className={styles.field}>
                        <input
                          type="text"
                          className={adminStyles.inputField}
                          placeholder="/delivery-policy"
                          value={link.href}
                          onChange={(e) =>
                            updateLink(link.key, { href: e.target.value })
                          }
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
                  <button
                    type="button"
                    className={styles.linkAdd}
                    onClick={addLink}
                  >
                    + Add link
                  </button>
                </div>
                <p className={adminStyles.muted}>
                  Optional related pages shown under the answer. URLs can be
                  internal paths like &quot;/delivery-policy&quot; or full web
                  addresses.
                </p>
                {state?.errors?.links ? (
                  <span className={styles.error} role="alert">
                    {state.errors.links}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <aside className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Link2 size={16} className={adminStyles.iconBlue} />
                <span>Display &amp; Organisation</span>
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="slug">
                  Slug
                </label>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  className={adminStyles.inputField}
                  defaultValue={defaults?.slug ?? ""}
                  placeholder="delivery-timing"
                />
                {state?.errors?.slug ? (
                  <span className={styles.error} role="alert">
                    {state.errors.slug}
                  </span>
                ) : null}
              </div>
              <div>
                <label className={adminStyles.formLabel} htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className={adminStyles.selectField}
                  defaultValue={defaults?.category ?? "School packs"}
                >
                  {FAQ_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {state?.errors?.category ? (
                  <span className={styles.error} role="alert">
                    {state.errors.category}
                  </span>
                ) : null}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="sort_order">
                  Sort order
                </label>
                <input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  min={0}
                  className={adminStyles.inputField}
                  defaultValue={defaults?.sort_order ?? 0}
                />
                {state?.errors?.sort_order ? (
                  <span className={styles.error} role="alert">
                    {state.errors.sort_order}
                  </span>
                ) : null}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="visible"
                    name="visible"
                    defaultChecked={defaults?.visible ?? true}
                    className={adminStyles.checkbox}
                  />
                  <span>
                    <span className={styles.checkLabel}>
                      Visible on the site
                    </span>
                  </span>
                </label>
                <p className={adminStyles.muted}>
                  Hidden FAQs are kept but not shown publicly.
                </p>
              </div>
            </div>

            <div className={adminStyles.stackRow}>
              <SubmitButton />
              <Link href="/admin/content/faqs">
                <AdminButton variant="secondary" size="md" type="button">
                  Cancel
                </AdminButton>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
