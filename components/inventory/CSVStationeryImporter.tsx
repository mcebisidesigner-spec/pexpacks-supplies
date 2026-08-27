"use client";

import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Download,
} from "lucide-react";
import {
  bulkImportStationeryAction,
  type CSVStationeryRow,
} from "@/app/actions/stationery-import";
import styles from "./CSVStationeryImporter.module.css";

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
            errorMsg = 'Invalid or missing "unit_price"';
          }

          processed.push({
            rowNumber: rowNum,
            error: errorMsg,
            data: {
              sku: row.sku ? String(row.sku).trim() : undefined,
              title: String(title).trim(),
              description: row.description
                ? String(row.description).trim()
                : undefined,
              unit_price: isNaN(price) ? 0 : price,
              category: row.category ? String(row.category).trim() : "General",
            },
          });
        });

        setParsedRows(processed);
        setIsParsing(false);
      },
      error: (err) => {
        setGlobalError(`CSV Parsing error: ${err.message}`);
        setIsParsing(false);
      },
    });
  };

  // Submit valid records to Supabase
  const handleExecuteImport = async () => {
    const validItems = parsedRows.filter((r) => !r.error).map((r) => r.data);

    if (validItems.length === 0) {
      setGlobalError("No valid rows found to import.");
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

  return (
    <div
      className={`${styles.root} ${isCondensed ? styles.rootCompact : ""} ${
        isTiles ? styles.rootTiles : ""
      }`}
    >
      {/* Top Header Card */}
      <div
        className={`${styles.card} ${isCondensed ? styles.cardCompact : ""} ${
          isTiles ? styles.cardTiles : ""
        }`}
      >
        <div
          className={`${styles.cardHeader} ${
            isCondensed ? styles.cardHeaderCompact : ""
          } ${isTiles ? styles.cardHeaderTiles : ""}`}
        >
          <div className={styles.cardTitleBlock}>
            <h2 className={styles.cardTitle}>
              <FileSpreadsheet className={styles.titleIcon} />
              Bulk CSV Stationery Importer
            </h2>
            <p className={styles.cardSub}>
              {onStageItems
                ? "Add stationery items to this new pack in bulk using a CSV file."
                : "Upload or update master stationery items in bulk using a CSV file."}
            </p>
          </div>

          {isCondensed ? (
            <label
              className={`${styles.compactDropzone} ${
                isTiles ? styles.tileDropzone : ""
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className={styles.dropzoneInput}
            aria-label="Upload CSV file"
              />
              <Upload className={styles.compactUploadIcon} />
              <span>
                {isParsing
                  ? "Parsing CSV..."
                  : file
                    ? file.name
                    : "Click to upload or drag & drop CSV file"}
              </span>
              <small>
                Supports columns: sku, title, description, unit_price, category
              </small>
            </label>
          ) : null}

          <button
            onClick={downloadTemplate}
            type="button"
            className={`${styles.templateBtn} ${
              isCondensed ? styles.templateBtnCompact : ""
            } ${isTiles ? styles.templateBtnTile : ""}`}
          >
            <Download className={styles.templateIcon} />
            Download Sample CSV Template
          </button>
        </div>

        {/* File Dropzone area */}
        <div
          className={`${styles.dropzone} ${isCondensed ? styles.hidden : ""}`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className={styles.dropzoneInput}
            aria-label="Upload CSV file"
          />
          <div className={styles.dropzoneContent}>
            <div className={styles.dropzoneIconWrap}>
              <Upload className={styles.dropzoneIcon} />
            </div>
            <div>
              <p className={styles.dropzoneTitle}>
                {isParsing
                  ? "Parsing CSV..."
                  : file
                    ? file.name
                    : "Click to upload or drag & drop CSV file"}
              </p>
              <p className={styles.dropzoneHint}>
                Supports columns:{" "}
                <span className={styles.dropzoneHintStrong}>
                  sku, title, description, unit_price, category
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {globalError && (
          <div className={styles.errorBanner}>
            <div className={styles.errorBannerInner}>
              <AlertTriangle className={styles.errorIcon} />
              <span>{globalError}</span>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className={styles.dismissBtn}
              aria-label="Dismiss error"
            >
              <X className={styles.dismissIcon} />
            </button>
          </div>
        )}

        {/* Import Success Banner */}
        {uploadSuccess && (
          <div className={styles.successBanner}>
            <CheckCircle2 className={styles.successIcon} />
            <div>
              <p className={styles.successTitle}>
                {onStageItems ? "Items added to pack" : "Import Successful!"}
              </p>
              <p className={styles.successText}>
                {onStageItems
                  ? `${uploadSuccess.count} stationery items are ready to be created with this pack.`
                  : `Successfully processed and upserted ${uploadSuccess.count} stationery items into Supabase.`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Table & Validation Step */}
      {parsedRows.length > 0 && (
        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <div className={styles.previewHeaderLeft}>
              <h3 className={styles.previewTitle}>CSV Validation Preview</h3>
              <span className={`${styles.pill} ${styles.pillValid}`}>
                {validCount} Valid
              </span>
              {invalidCount > 0 && (
                <span className={`${styles.pill} ${styles.pillInvalid}`}>
                  {invalidCount} Invalid
                </span>
              )}
            </div>

            {/* Execute Import Action Button */}
            <button
              onClick={handleExecuteImport}
              disabled={isUploading || validCount === 0}
              type="button"
              className={styles.importBtn}
            >
              {isUploading ? (
                <>
                  <RefreshCw
                    className={`${styles.importBtnIcon} ${styles.spin}`}
                  />
                  {onStageItems
                    ? "Adding to pack..."
                    : "Upserting to Supabase..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className={styles.importBtnIcon} />
                  {onStageItems
                    ? `Add ${validCount} Items to Pack`
                    : `Import ${validCount} Items Now`}
                </>
              )}
            </button>
          </div>

          {/* Records Table Preview */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.th}>Row</th>
                  <th className={styles.th}>SKU</th>
                  <th className={styles.th}>Title</th>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Unit Price</th>
                  <th className={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {parsedRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`${styles.tableRow} ${
                      row.error ? styles.tableRowError : styles.tableRowHover
                    }`}
                  >
                    <td className={`${styles.td} ${styles.tdMono}`}>
                      #{row.rowNumber}
                    </td>
                    <td className={`${styles.td} ${styles.tdMono}`}>
                      {row.data.sku || "-"}
                    </td>
                    <td className={`${styles.td} ${styles.tdTitle}`}>
                      {row.data.title || "-"}
                    </td>
                    <td className={`${styles.td} ${styles.tdCategory}`}>
                      {row.data.category}
                    </td>
                    <td className={`${styles.td} ${styles.tdPrice}`}>
                      R {row.data.unit_price.toFixed(2)}
                    </td>
                    <td className={styles.td}>
                      {row.error ? (
                        <span className={styles.statusError}>
                          <AlertTriangle className={styles.statusIcon} />
                          {row.error}
                        </span>
                      ) : (
                        <span className={styles.statusReady}>
                          <CheckCircle2 className={styles.statusIcon} />
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
