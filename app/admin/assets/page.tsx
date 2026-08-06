import Link from "next/link";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listAssets, listAssetFolders } from "@/lib/admin/assets";
import { AssetUploadForm } from "@/components/admin/assets/AssetUploadForm";
import { AssetEditForm } from "@/components/admin/assets/AssetEditForm";
import { deleteAssetAction } from "./actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import adminStyles from "../admin.module.css";
import styles from "./assets.module.css";

export const metadata = {
  title: "Assets | Admin | Pexpacks",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isImage(mime: string | null): boolean {
  return Boolean(mime && mime.startsWith("image/"));
}

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const session = await requireAdmin({ permission: "assets.view" });
  const params = await searchParams;
  const folder = params.folder?.trim() || undefined;
  const canUpload = hasPermission(session, "assets.upload");
  const canManage = hasPermission(session, "assets.manage");

  const [assets, folders] = await Promise.all([
    listAssets(folder),
    listAssetFolders(),
  ]);

  return (
    <div className={adminStyles.adminContainer}>
      <div className={styles.toolbar}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>
              Assets
              <span className={styles.count}>
                {assets.length} {assets.length === 1 ? "file" : "files"}
              </span>
            </h1>
            <p className={styles.subtitle}>
              Media library for images and files used across the site.
            </p>
          </div>
        </div>

        <form method="get" action="/admin/assets" className={styles.filterForm}>
          <select name="folder" defaultValue={folder ?? ""} className={styles.filterInput}>
            <option value="">All folders</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <button type="submit" className={styles.applyButton}>
            Filter
          </button>
          {folder ? (
            <Link href="/admin/assets" className={styles.resetLink}>
              Reset
            </Link>
          ) : null}
        </form>
      </div>

      {canUpload ? (
        <div className={styles.uploadCard}>
          <h2 className={styles.uploadTitle}>Upload file</h2>
          <p className={styles.uploadSubtitle}>
            PNG, WebP, SVG, JPG, GIF or PDF up to 10 MB. Files land in the media library
            and can be referenced anywhere on the site.
          </p>
          <AssetUploadForm />
        </div>
      ) : null}

      {assets.length === 0 ? (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.emptyStateContainer}>
            <div className={adminStyles.emptyStateInner}>
              <div className={adminStyles.emptyIconWrapper}>
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>
              <h2 className={adminStyles.emptyStateTitle}>
                {folder ? "No assets in this folder" : "No assets yet"}
              </h2>
              <p className={adminStyles.emptyStateText}>
                {folder
                  ? "Try another folder, or upload a new file."
                  : "Upload your first file to start building the media library."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.tableWrapper}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <div className={styles.assetCell}>
                        {isImage(asset.mime_type) && asset.public_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.public_url}
                            alt=""
                            className={styles.thumb}
                          />
                        ) : (
                          <span className={styles.thumb} aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <path d="M14 2v6h6" />
                            </svg>
                          </span>
                        )}
                        <div>
                          <div className={styles.assetName}>{asset.name}</div>
                          <div className={styles.assetMeta}>
                            {asset.folder}
                            {asset.alt_text ? ` · ${asset.alt_text}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{asset.mime_type ?? "—"}</td>
                    <td>{formatBytes(asset.size_bytes)}</td>
                    <td>{formatDate(asset.created_at)}</td>
                    <td>
                      <div className={styles.actions}>
                        {asset.public_url ? (
                          <a
                            href={asset.public_url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.openLink}
                          >
                            Open
                          </a>
                        ) : null}
                        {canManage ? (
                          <>
                            <details className={styles.editDetails}>
                              <summary className={styles.editSummary}>Edit</summary>
                              <div className={styles.editPanel}>
                                <AssetEditForm
                                  id={asset.id}
                                  name={asset.name}
                                  altText={asset.alt_text}
                                />
                              </div>
                            </details>
                            <form action={deleteAssetAction.bind(null, asset.id)}>
                              <ConfirmButton
                                label="Delete"
                                confirmText={`Delete "${asset.name}"? The file is removed from storage and the library.`}
                                busyLabel="Deleting…"
                                className={`${styles.rowButton} ${styles.rowButtonDelete}`}
                              />
                            </form>
                          </>
                        ) : (
                          <span className={styles.assetMeta}>View only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
