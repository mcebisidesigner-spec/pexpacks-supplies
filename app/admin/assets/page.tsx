import Link from "next/link";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listAssets, listAssetFolders } from "@/lib/admin/assets";
import { AssetUploadForm } from "@/components/admin/assets/AssetUploadForm";
import { AssetEditForm } from "@/components/admin/assets/AssetEditForm";
import { deleteAssetAction } from "./actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import adminStyles from "../adminStyles";

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
      <AdminPageHeader
        title="Assets & Media"
        count={assets.length}
        subtitle="Media library for stationery product photos, school badges, and downloadable assets."
      />

      <div className={adminStyles.toolbar}>
        <form method="get" action="/admin/assets" className={adminStyles.filterForm}>
          <select name="folder" defaultValue={folder ?? ""} className={adminStyles.filterInput}>
            <option value="">All folders</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <button type="submit" className={adminStyles.applyButton}>
            Filter
          </button>
          {folder ? (
            <Link href="/admin/assets" className={adminStyles.resetLink}>
              Reset
            </Link>
          ) : null}
        </form>
      </div>

      {canUpload ? (
        <div className="bg-[var(--pex-bg)] border border-[var(--db-border)] rounded-[16px] p-[22px] mb-5">
          <h2 className="m-0 mb-1 text-lg font-extrabold text-[var(--a-text)]">Upload file</h2>
          <p className="m-0 mb-4 text-[13px] text-[var(--db-text-muted)]">
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
                      <div className="flex items-center gap-3">
                        {isImage(asset.mime_type) && asset.public_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.public_url}
                            alt=""
                            className="w-11 h-11 rounded-lg object-cover bg-[var(--db-surface-inner)] inline-flex items-center justify-center text-[var(--db-brand)] text-[11px] font-extrabold uppercase shrink-0 border border-[var(--db-border)]"
                          />
                        ) : (
                          <span className="w-11 h-11 rounded-lg object-cover bg-[var(--db-surface-inner)] inline-flex items-center justify-center text-[var(--db-brand)] text-[11px] font-extrabold uppercase shrink-0 border border-[var(--db-border)] [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-current [&>svg]:fill-none [&>svg]:stroke-2 [&>svg]:stroke-linecap-round [&>svg]:stroke-linejoin-round" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <path d="M14 2v6h6" />
                            </svg>
                          </span>
                        )}
                        <div>
                          <div className="font-bold text-[var(--a-text)] break-all">{asset.name}</div>
                          <div className="text-xs text-[var(--db-text-muted)] mt-0.5">
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
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        {asset.public_url ? (
                          <a
                            href={asset.public_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] font-bold text-[var(--db-brand)] no-underline hover:underline"
                          >
                            Open
                          </a>
                        ) : null}
                        {canManage ? (
                          <>
                            <details className="mt-2">
                              <summary className="cursor-pointer text-[13px] font-bold text-[var(--db-brand)] list-none inline-flex items-center gap-1.5 hover:underline [&::-webkit-details-marker]:hidden">Edit</summary>
                              <div className="mt-2.5 max-w-[480px]">
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
                                className={`${adminStyles.rowButton} ${adminStyles.rowButtonDelete}`}
                              />
                            </form>
                          </>
                        ) : (
                          <span className="text-xs text-[var(--db-text-muted)] mt-0.5">View only</span>
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
