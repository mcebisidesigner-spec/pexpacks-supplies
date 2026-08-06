"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { saveTestimonialAction } from "@/app/admin/content/actions";
import { TESTIMONIAL_RATINGS } from "@/lib/admin/content-constants";
import type { ContentFormState } from "@/lib/admin/content";
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
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Saving…" : "Save testimonial"}
    </button>
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
    {}
  );

  return (
    <form action={formAction} className={styles.form}>
      {state?.ok ? (
        <p className={styles.success} role="status">
          {state.message}
        </p>
      ) : state?.message ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className={styles.input}
          defaultValue={defaults?.name ?? ""}
        />
        {state?.errors?.name ? (
          <span className={styles.error} role="alert">{state.errors.name}</span>
        ) : null}
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="role">
            Role
          </label>
          <input
            id="role"
            name="role"
            type="text"
            className={styles.input}
            defaultValue={defaults?.role ?? ""}
          />
          {state?.errors?.role ? (
            <span className={styles.error} role="alert">{state.errors.role}</span>
          ) : null}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="context">
            Context
          </label>
          <input
            id="context"
            name="context"
            type="text"
            className={styles.input}
            defaultValue={defaults?.context ?? ""}
          />
          {state?.errors?.context ? (
            <span className={styles.error} role="alert">{state.errors.context}</span>
          ) : null}
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="rating">
            Rating
          </label>
          <select
            id="rating"
            name="rating"
            className={styles.select}
            defaultValue={defaults?.rating ?? 5}
          >
            {TESTIMONIAL_RATINGS.map((r) => (
              <option key={r} value={r}>
                {r} star{r === 1 ? "" : "s"}
              </option>
            ))}
          </select>
          {state?.errors?.rating ? (
            <span className={styles.error} role="alert">{state.errors.rating}</span>
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
        <label className={styles.label} htmlFor="quote">
          Quote
        </label>
        <textarea
          id="quote"
          name="quote"
          rows={5}
          className={styles.textarea}
          defaultValue={defaults?.quote ?? ""}
        />
        {state?.errors?.quote ? (
          <span className={styles.error} role="alert">{state.errors.quote}</span>
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
          <span className={styles.checkHelp}>Hidden testimonials are kept but not shown publicly.</span>
        </span>
      </label>

      <div className={styles.actions}>
        <SubmitButton />
        <Link href="/admin/content/testimonials" className={styles.backLink}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
