"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { saveBlogPostAction } from "@/app/admin/blog/actions";
import { ContentBlocks } from "./ContentBlocks";
import type { BlogPostFormState } from "@/lib/admin/blog";
import styles from "./blog-form.module.css";

export interface BlogFormDefaults {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  author: string;
  category: string;
  image: string;
  published: boolean;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Saving…" : "Save post"}
    </button>
  );
}

export function BlogForm({ id, defaults }: { id: string | null; defaults?: BlogFormDefaults }) {
  const [state, formAction] = useActionState<BlogPostFormState, FormData>(
    saveBlogPostAction.bind(null, id),
    {}
  );
  const [slug, setSlug] = useState(defaults?.slug ?? "");

  function fillSlugFromTitle(title: string) {
    if (slug.trim()) return;
    setSlug(slugify(title));
  }

  const err = (field: string) =>
    state?.errors?.[field] ? (
      <span className={styles.error} role="alert">
        {state.errors[field]}
      </span>
    ) : null;

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
        <label className={styles.label} htmlFor="title">
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className={styles.input}
          defaultValue={defaults?.title ?? ""}
          placeholder="e.g. The Ultimate Stationery Checklist"
          onChange={(e) => fillSlugFromTitle(e.target.value)}
        />
        {err("title")}
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="slug">
            Slug
          </label>
          <div className={styles.slugRow}>
            <span className={styles.slugPrefix}>/blog/</span>
            <input
              id="slug"
              name="slug"
              type="text"
              className={styles.input}
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="ultimate-stationery-checklist"
            />
          </div>
          <span className={styles.hint}>
            Filled automatically from the title. Lowercase letters, numbers and hyphens.
          </span>
          {err("slug")}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="category">
            Category
          </label>
          <input
            id="category"
            name="category"
            type="text"
            className={styles.input}
            defaultValue={defaults?.category ?? ""}
            placeholder="e.g. Parenting Tips, Guides, Education"
          />
          <span className={styles.hint}>Used for the article tag and blog filters.</span>
          {err("category")}
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="author">
            Author
          </label>
          <input
            id="author"
            name="author"
            type="text"
            className={styles.input}
            defaultValue={defaults?.author ?? ""}
            placeholder="e.g. Mcebisi Mhayise"
          />
          {err("author")}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="image">
            Cover image URL
          </label>
          <input
            id="image"
            name="image"
            type="text"
            className={styles.input}
            defaultValue={defaults?.image ?? ""}
            placeholder="/images/pex-stationery-checklist-v2.webp"
          />
          {err("image")}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="excerpt">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          className={styles.textarea}
          defaultValue={defaults?.excerpt ?? ""}
          placeholder="Short summary shown on the blog cards and in search results."
        />
        {err("excerpt")}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Content</label>
        <ContentBlocks name="content" defaultValue={defaults?.content ?? []} />
        {err("content")}
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          id="published"
          name="published"
          defaultChecked={defaults?.published ?? true}
          className={styles.checkbox}
        />
        <span>
          <span className={styles.checkLabel}>Published on the site</span>
          <span className={styles.checkHelp}>
            Drafts are saved but only visible to admins.
          </span>
        </span>
      </label>

      <div className={styles.actions}>
        <SubmitButton />
        <Link href="/admin/blog" className={styles.backLink}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
