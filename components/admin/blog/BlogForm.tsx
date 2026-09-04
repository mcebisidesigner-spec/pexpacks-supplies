"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Save, FileText } from "lucide-react";
import { saveBlogPostAction } from "@/app/admin/blog/actions";
import { ContentBlocks } from "./ContentBlocks";
import type { BlogPostFormState } from "@/lib/admin/blog";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";
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
    <AdminButton
      type="submit"
      variant="primary"
      size="md"
      loading={pending}
      icon={<Save size={14} />}
    >
      {pending ? "Saving…" : "Save post"}
    </AdminButton>
  );
}

export function BlogForm({
  id,
  defaults,
}: {
  id: string | null;
  defaults?: BlogFormDefaults;
}) {
  const [state, formAction] = useActionState<BlogPostFormState, FormData>(
    saveBlogPostAction.bind(null, id),
    {},
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
                <FileText size={16} className={adminStyles.iconBlue} />
                <span>Post Content</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="title">
                  Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className={adminStyles.inputField}
                  defaultValue={defaults?.title ?? ""}
                  placeholder="e.g. The Ultimate Stationery Checklist"
                  onChange={(e) => fillSlugFromTitle(e.target.value)}
                />
                {err("title")}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="slug">
                  Slug
                </label>
                <div className={styles.slugRow}>
                  <span className={styles.slugPrefix}>/blog/</span>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    className={adminStyles.inputField}
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="ultimate-stationery-checklist"
                  />
                </div>
                <p className={adminStyles.muted}>
                  Filled automatically from the title. Lowercase letters,
                  numbers and hyphens.
                </p>
                {err("slug")}
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="category">
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  className={adminStyles.inputField}
                  defaultValue={defaults?.category ?? ""}
                  placeholder="e.g. Parenting Tips, Guides, Education"
                />
                <p className={adminStyles.muted}>
                  Used for the article tag and blog filters.
                </p>
                {err("category")}
              </div>
              <div>
                <label className={adminStyles.formLabel} htmlFor="author">
                  Author
                </label>
                <input
                  id="author"
                  name="author"
                  type="text"
                  className={adminStyles.inputField}
                  defaultValue={defaults?.author ?? ""}
                  placeholder="e.g. Mcebisi Mhayise"
                />
                {err("author")}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="image">
                  Cover image URL
                </label>
                <input
                  id="image"
                  name="image"
                  type="text"
                  className={adminStyles.inputField}
                  defaultValue={defaults?.image ?? ""}
                  placeholder="/images/pex-stationery-checklist-v2.webp"
                />
                {err("image")}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="excerpt">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  rows={3}
                  className={adminStyles.textareaField}
                  defaultValue={defaults?.excerpt ?? ""}
                  placeholder="Short summary shown on the blog cards and in search results."
                />
                {err("excerpt")}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <span className={adminStyles.formLabel}>Content</span>
                <ContentBlocks
                  name="content"
                  defaultValue={defaults?.content ?? []}
                />
                {err("content")}
              </div>
            </div>
          </div>
        </div>

        <aside className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <span>Publishing</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    defaultChecked={defaults?.published ?? true}
                    className={adminStyles.checkbox}
                  />
                  <span>
                    <span className={styles.checkLabel}>
                      Published on the site
                    </span>
                  </span>
                </label>
                <p className={adminStyles.muted}>
                  Drafts are saved but only visible to admins.
                </p>
              </div>
            </div>

            <div className={adminStyles.stackRow}>
              <SubmitButton />
              <Link href="/admin/blog">
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
