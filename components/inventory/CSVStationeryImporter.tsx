"use client";

import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
} from "lucide-react";
import {
  bulkImportStationeryAction,
  type CSVStationeryRow,
} from "@/app/actions/stationery-import";
import { DbNotice } from "@/components/admin/ui/DbNotice";

type CsvRow = Record<string, string | number | undefined>;

interface ParsedRecord {
  data: CSVStationeryRow;
  error?: string;
  rowNumber: number;
}

export interface CSVStationeryImporterProps {
  packs?: { id: string; title: string }[];
  onImported?: () => void;
  onStageItems?: (items: CSVStationeryRow[]) => void;
  variant?: "default" | "compact" | "tiles";
}

export function CSVStationeryImporter({
  packs = [],
  onImported,
  onStageItems,
  variant = "default",
}: CSVStationeryImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRecord[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const targetPackId = packs[0]?.id ?? "";
  const [uploadSuccess, setUploadSuccess] = useState<{ count: number } | null>(
    null,
  );
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Download template CSV file
  const downloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "sku,title,description,unit_price,category\n" +
      "ST-1001,2H Graph Pencil,High quality sketching pencil,12.50,Pencils\n" +
      "ST-1002,A4 College Exercise Book 72pg,Featherweight 70gsm paper,18.00,Books\n" +
      "ST-1003,30cm Clear Ruler,Shatterproof plastic ruler,8.50,Measuring";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pexpacks_stationery_template.csv");
    document.body.appendChild(link);
    link.click();
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  };

  // Process CSV File with Papaparse
  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploadSuccess(null);
    setGlobalError(null);
    setIsParsing(true);

    const Papa = (await import("papaparse")).default;
    Papa.parse<CsvRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const processed: ParsedRecord[] = [];

        results.data.forEach((row, index) => {
          const rowNum = index + 2; // Accounting for header row

          // Validation checks
          const title =
            row.title || row.Title || row.ITEM_NAME || row.name || "";
          const rawPrice =
            row.unit_price ?? row.price ?? row.Price ?? row.UNIT_PRICE;
          const price = parseFloat(String(rawPrice ?? ""));

          let errorMsg: string | undefined;

          if (!String(title).trim()) {
            errorMsg = 'Missing required "title" column';
          } else if (isNaN(price) || price < 0) {
            errorMsg = 'Invalid "unit_price" (must be >= 0)';
          }

          processed.push({
            rowNumber: rowNum,
            error: errorMsg,
            data: {
              sku: String(row.sku || row.SKU || `AUTO-${rowNum}`),
              title: String(title),
              description: String(
                row.description || row.Description || row.DESC || "",
              ),
              unit_price: isNaN(price) ? 0 : price,
              category: String(
                row.category || row.Category || "General Supplies",
              ),
            },
          });
        });

        setParsedRows(processed);
        setIsParsing(false);
      },
      error: (err) => {
        setGlobalError(`Failed to parse CSV file: ${err.message}`);
        setIsParsing(false);
      },
    });
  };

  // Trigger Bulk Import Action or Staged Items
  const handleExecuteImport = async () => {
    const validItems = parsedRows
      .filter((r) => !r.error)
      .map((r) => ({
        ...r.data,
      }));

    if (validItems.length === 0) {
      setGlobalError("No valid rows available to import.");
      return;
    }

    setIsUploading(true);
    setGlobalError(null);

    try {
      if (onStageItems) {
        onStageItems(validItems);
        setUploadSuccess({ count: validItems.length });
        setFile(null);
        setParsedRows([]);
        return;
      }
      const res = await bulkImportStationeryAction(validItems, targetPackId);
      if (res.success) {
        setUploadSuccess({ count: res.importedCount });
        setFile(null);
        setParsedRows([]);
        onImported?.();
      }
    } catch (err) {
      setGlobalError(
        err instanceof Error
          ? err.message
          : "An unexpected import error occurred.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const validCount = parsedRows.filter((r) => !r.error).length;
  const invalidCount = parsedRows.filter((r) => r.error).length;
  const isCompact = variant === "compact";
  const isTiles = variant === "tiles";
  const isCondensed = isCompact || isTiles;

  const rootClasses = isCondensed
    ? `flex flex-col w-full m-0 p-[var(--db-space-1)] border-2 border-[var(--db-brand)] rounded-[var(--db-radius-card)] bg-[var(--db-surface-inner)] [box-shadow:var(--db-shadow-card)] text-[var(--a-text-2)] font-inherit ${
        isTiles ? "gap-3" : "gap-[var(--db-space-1)]"
      }`
    : "flex flex-col gap-6 w-full max-w-[56rem] mx-auto text-[var(--a-text-2)] font-inherit";

  const cardClasses = isCondensed
    ? `flex flex-col gap-4 border-0 rounded-none bg-transparent p-0 ${
        isTiles ? "min-h-[76px]" : "min-h-[66px]"
      }`
    : "flex flex-col gap-4 p-6 rounded-[var(--a-radius)] border border-[var(--a-border)] bg-[var(--a-surface)]";

  let cardHeaderClasses =
    "flex flex-col sm:flex-row sm:items-center gap-4 justify-between pb-4 border-b border-[var(--a-border)]";
  if (isCondensed) {
    if (isTiles) {
      cardHeaderClasses =
        "grid grid-cols-1 min-[820px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)] items-stretch gap-2.5 min-[820px]:gap-[var(--db-space-1)] pb-0 border-b-0";
    } else {
      cardHeaderClasses =
        "grid grid-cols-1 min-[820px]:grid-cols-[minmax(220px,1fr)_minmax(240px,1fr)_minmax(220px,1fr)] items-start min-[820px]:items-center gap-[18px] min-[820px]:gap-6 pb-0 border-b-0";
    }
  }

  const titleBlockClasses = isTiles
    ? "min-w-0 flex min-h-[72px] flex-col justify-center p-[var(--db-space-1-5)_var(--db-space-2)] border border-[var(--db-brand)] rounded-[var(--db-radius-control)] bg-[var(--db-brand)]"
    : "min-w-0";

  const titleClasses = isTiles
    ? "flex items-center gap-2 m-0 font-bold text-white text-[13px] leading-[1.1]"
    : "flex items-center gap-2 m-0 text-xl font-bold text-[var(--a-text)]";

  const titleIconClasses = isTiles
    ? "text-white w-5 h-5 shrink-0"
    : "text-[var(--a-accent-strong)] w-5 h-5 shrink-0";

  const subClasses = isTiles
    ? "mt-1 text-[10px] font-semibold text-white/85"
    : "mt-1 text-xs text-[var(--a-text-3)]";

  const compactDropzoneClasses = isTiles
    ? "relative flex min-w-0 flex-col items-center justify-center gap-1 text-[var(--a-text)] text-center cursor-pointer min-h-[72px] p-[var(--db-space-1-5)_var(--db-space-2)] border border-dashed border-[#10b98194] rounded-[var(--db-radius-control)] bg-transparent"
    : "relative flex min-w-0 flex-col items-start min-[820px]:items-center justify-center gap-1 text-[var(--a-text)] text-left min-[820px]:text-center cursor-pointer";

  const templateBtnClasses = isTiles
    ? "min-h-[72px] justify-self-stretch justify-center p-[var(--db-space-1-5)_var(--db-space-2)] border border-dashed border-[#10b98194] rounded-[var(--db-radius-control)] bg-transparent text-[var(--db-text-secondary)] text-center hover:border-[#2dd4bf] hover:bg-[#14b8a614] inline-flex items-center gap-2 font-semibold text-xs cursor-pointer transition-colors focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_var(--a-accent)]"
    : isCompact
      ? "justify-self-start min-[820px]:justify-self-end min-h-0 p-0 border-0 bg-transparent text-[var(--a-text)] text-[11px] font-bold hover:text-[var(--a-accent-strong)] hover:bg-transparent inline-flex items-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_var(--a-accent)]"
      : "inline-flex items-center gap-2 self-start sm:self-auto min-h-[44px] px-4 rounded-[var(--a-radius-sm)] border border-[var(--a-border-strong)] bg-[var(--a-surface-2)] text-[var(--a-text-2)] text-xs font-semibold cursor-pointer transition-colors hover:bg-[var(--a-surface)] hover:border-[var(--a-border-strong)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_var(--a-accent)]";

  return (
    <div className={rootClasses}>
      {/* Top Header Card */}
      <div className={cardClasses}>
        <div className={cardHeaderClasses}>
          <div className={titleBlockClasses}>
            <h2 className={titleClasses}>
              <FileSpreadsheet className={titleIconClasses} />
              Bulk CSV Stationery Importer
            </h2>
            <p className={subClasses}>
              {onStageItems
                ? "Add stationery items to this new pack in bulk using a CSV file."
                : "Upload or update master stationery items in bulk using a CSV file."}
            </p>
          </div>

          {isCondensed ? (
            <label className={compactDropzoneClasses}>
              <input
                id="csv-stationery-compact-file"
                name="csvFile"
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full z-10 opacity-0 cursor-pointer"
                aria-label="Upload CSV file"
              />
              <Upload className="w-[18px] h-[18px] text-[var(--a-text-3)]" />
              <span className="max-w-full overflow-hidden text-[var(--a-text)] text-xs font-bold text-ellipsis whitespace-nowrap">
                {isParsing
                  ? "Parsing CSV..."
                  : file
                    ? file.name
                    : "Click to upload or drag & drop CSV file"}
              </span>
              <small className="text-[var(--a-text-3)] text-[10px] font-semibold">
                Supports columns: sku, title, description, unit_price, category
              </small>
            </label>
          ) : null}

          <button
            onClick={downloadTemplate}
            type="button"
            className={templateBtnClasses}
          >
            <Download className="text-[var(--a-accent-strong)] w-4 h-4 shrink-0" />
            Download Sample CSV Template
          </button>
        </div>

        {/* File Dropzone area */}
        <div
          className={
            isCondensed
              ? "hidden"
              : "relative p-8 text-center rounded-[var(--a-radius-sm)] border-2 border-dashed border-[var(--a-border-strong)] bg-[var(--a-bg)] transition-colors hover:border-[var(--a-accent)] group"
          }
        >
          <input
            id="csv-stationery-full-file"
            name="csvFile"
            type="file"
            accept=".csv"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full z-10 opacity-0 cursor-pointer"
            aria-label="Upload CSV file"
          />
          <div className="pointer-events-none flex flex-col gap-3">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-[var(--a-radius)] border border-[var(--a-border-strong)] bg-[var(--a-surface)] transition-colors group-hover:border-[var(--a-accent)]">
              <Upload className="w-6 h-6 text-[var(--a-accent-strong)]" />
            </div>
            <div>
              <p className="m-0 text-sm font-semibold text-[var(--a-text)]">
                {isParsing
                  ? "Parsing CSV..."
                  : file
                    ? file.name
                    : "Click to upload or drag & drop CSV file"}
              </p>
              <p className="mt-0.5 text-xs text-[var(--a-text-4)]">
                Supports columns:{" "}
                <span className="text-[var(--a-text-3)]">
                  sku, title, description, unit_price, category
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {globalError && (
          <DbNotice
            type="error"
            message={globalError}
            onClose={() => setGlobalError(null)}
          />
        )}

        {/* Import Success Banner */}
        {uploadSuccess && (
          <DbNotice
            type="success"
            message={
              onStageItems
                ? `${uploadSuccess.count} stationery items are ready to be created with this pack.`
                : `Successfully processed and upserted ${uploadSuccess.count} stationery items into Supabase.`
            }
            onClose={() => setUploadSuccess(null)}
          />
        )}
      </div>

      {/* Preview Table & Validation Step */}
      {parsedRows.length > 0 && (
        <div className="flex flex-col gap-4 p-6 rounded-[var(--a-radius)] border border-[var(--a-border)] bg-[var(--a-surface)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between pb-4 border-b border-[var(--a-border)]">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="m-0 text-base font-bold text-[var(--a-text)]">
                CSV Validation Preview
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--a-accent-subtle)] text-[var(--a-accent-strong)] border border-[var(--a-accent)]">
                {validCount} Valid
              </span>
              {invalidCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--a-red-subtle)] text-[var(--a-red)] border border-[var(--a-red)]">
                  {invalidCount} Invalid
                </span>
              )}
            </div>

            {/* Execute Import Action Button */}
            <button
              onClick={handleExecuteImport}
              disabled={isUploading || validCount === 0}
              type="button"
              className="inline-flex items-center justify-center gap-2 self-start sm:self-auto min-h-[44px] px-6 rounded-[var(--a-radius-sm)] border-0 bg-[var(--a-accent)] text-[var(--a-text)] text-sm font-bold cursor-pointer [box-shadow:0_8px_20px_var(--a-accent-subtle)] transition-colors hover:not-disabled:bg-[var(--a-accent-strong)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_var(--a-accent)]"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {onStageItems
                    ? "Adding to pack..."
                    : "Upserting to Supabase..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {onStageItems
                    ? `Add ${validCount} Items to Pack`
                    : `Import ${validCount} Items Now`}
                </>
              )}
            </button>
          </div>

          {/* Records Table Preview */}
          <div className="overflow-x-auto max-h-[320px] overflow-y-auto rounded-[var(--a-radius-sm)] border border-[var(--a-border)]">
            <table className="w-full border-collapse text-left text-xs text-[var(--a-text-2)]">
              <thead className="sticky top-0 z-10 bg-[var(--a-bg)] text-[var(--a-text-3)] text-[10px] font-semibold uppercase tracking-[0.06em] border-b border-[var(--a-border)]">
                <tr>
                  <th className="p-3">Row</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--a-bg)]">
                {parsedRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-[var(--a-border)] last:border-b-0 transition-colors ${
                      row.error
                        ? "bg-[var(--a-red-subtle)]"
                        : "hover:bg-[var(--a-surface-2)]"
                    }`}
                  >
                    <td className="p-3 font-mono text-[var(--a-text-3)]">
                      #{row.rowNumber}
                    </td>
                    <td className="p-3 font-mono text-[var(--a-text-3)]">
                      {row.data.sku || "-"}
                    </td>
                    <td className="p-3 font-semibold text-[var(--a-text)]">
                      {row.data.title || "-"}
                    </td>
                    <td className="p-3 text-[var(--a-text-3)]">
                      {row.data.category}
                    </td>
                    <td className="p-3 font-bold text-[var(--a-accent-strong)]">
                      R {row.data.unit_price.toFixed(2)}
                    </td>
                    <td className="p-3">
                      {row.error ? (
                        <span className="inline-flex items-center gap-1 font-medium text-[var(--a-red)]">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {row.error}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-[var(--a-accent-strong)]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          Ready
                        </span>
                      )}
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

export default CSVStationeryImporter;
