"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Save, Quote } from "lucide-react";
import { saveTestimonialAction } from "@/app/admin/content/actions";
import { TESTIMONIAL_RATINGS } from "@/lib/admin/content-constants";
import type { ContentFormState } from "@/lib/admin/content";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "./content-form.module.css";

export interface TestimonialDefaults {
  name: string;
  role: string;
  context: string;
  quote: string;
  rating: number;
  visible: boolean;
  sort_order: number;
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
      {pending ? "Saving…" : "Save testimonial"}
    </AdminButton>
  );
}

export function TestimonialForm({
  id,
  defaults,
}: {
  id: string | null;
  defaults?: TestimonialDefaults;
}) {
  const [state, formAction] = useActionState<ContentFormState, FormData>(
    saveTestimonialAction.bind(null, id),
    {},
  );

  return (
    <form action={formAction} className={adminStyles.stack}>
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
                <Quote size={16} className={adminStyles.iconTeal} />
                <span>Testimonial</span>
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="name">
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={adminStyles.inputField}
                  defaultValue={defaults?.name ?? ""}
                  placeholder="e.g. Thandi M."
                  required
                />
                {state?.errors?.name ? (
                  <span className={styles.error} role="alert">
                    {state.errors.name}
                  </span>
                ) : null}
              </div>
              <div>
                <label className={adminStyles.formLabel} htmlFor="role">
                  Role
                </label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  className={adminStyles.inputField}
                  defaultValue={defaults?.role ?? ""}
                  placeholder="e.g. Grade 4 Parent"
                />
                {state?.errors?.role ? (
                  <span className={styles.error} role="alert">
                    {state.errors.role}
                  </span>
                ) : null}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="context">
                  Context / School *{" "}
                  <span className={adminStyles.muted}>
                    (e.g. Grade 4 Parent, Example Primary School)
                  </span>
                </label>
                <input
                  id="context"
                  name="context"
                  type="text"
                  className={adminStyles.inputField}
                  defaultValue={defaults?.context ?? ""}
                  placeholder="e.g. Example Primary School"
                />
                {state?.errors?.context ? (
                  <span className={styles.error} role="alert">
                    {state.errors.context}
                  </span>
                ) : null}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="quote">
                  Quote *
                </label>
                <textarea
                  id="quote"
                  name="quote"
                  rows={5}
                  className={adminStyles.textareaField}
                  defaultValue={defaults?.quote ?? ""}
                  placeholder="Write the testimonial in their own words..."
                  required
                />
                {state?.errors?.quote ? (
                  <span className={styles.error} role="alert">
                    {state.errors.quote}
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
                <span>Display &amp; Rating</span>
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="rating">
                  Rating
                </label>
                <select
                  id="rating"
                  name="rating"
                  className={adminStyles.selectField}
                  defaultValue={defaults?.rating ?? 5}
                >
                  {TESTIMONIAL_RATINGS.map((r) => (
                    <option key={r} value={r}>
                      {r} star{r === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
                {state?.errors?.rating ? (
                  <span className={styles.error} role="alert">
                    {state.errors.rating}
                  </span>
                ) : null}
              </div>
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
                  Hidden testimonials are kept but not shown publicly.
                </p>
              </div>
            </div>

            <div className={adminStyles.stackRow}>
              <SubmitButton />
              <Link href="/admin/content/testimonials">
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
