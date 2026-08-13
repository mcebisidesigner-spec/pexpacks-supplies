"use client";

import { useState } from "react";
import Papa from "papaparse";
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

interface ParsedRecord {
  data: CSVStationeryRow;
  error?: string;
  rowNumber: number;
}

export function CSVStationeryImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRecord[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<{ count: number } | null>(
    null
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
    document.body.removeChild(link);
  };

  // Process CSV File with Papaparse
  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploadSuccess(null);
    setGlobalError(null);
    setIsParsing(true);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const processed: ParsedRecord[] = [];

        results.data.forEach((row: any, index: number) => {
          const rowNum = index + 2; // Accounting for header row

          // Validation checks
          const title = row.title || row.Title || row.ITEM_NAME || row.name;
          const rawPrice =
            row.unit_price || row.price || row.Price || row.UNIT_PRICE;
          const price = parseFloat(rawPrice);

          let errorMsg: string | undefined;

          if (!title) {
            errorMsg = 'Missing required "title" column';
          } else if (isNaN(price) || price < 0) {
            errorMsg = 'Invalid or missing "unit_price"';
          }

          processed.push({
            rowNumber: rowNum,
            error: errorMsg,
            data: {
              sku: row.sku ? String(row.sku).trim() : undefined,
              title: String(title || "").trim(),
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
      const res = await bulkImportStationeryAction(validItems);
      if (res.success) {
        setUploadSuccess({ count: res.importedCount });
        setFile(null);
        setParsedRows([]);
      }
    } catch (err: any) {
      setGlobalError(err.message || "An unexpected import error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const validCount = parsedRows.filter((r) => !r.error).length;
  const invalidCount = parsedRows.filter((r) => r.error).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-slate-100">
      {/* Top Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Bulk CSV Stationery Importer
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Upload or update master stationery items in bulk using a CSV file.
            </p>
          </div>

          <button
            onClick={downloadTemplate}
            type="button"
            className="min-h-[44px] px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Download Sample CSV Template
          </button>
        </div>

        {/* File Dropzone area */}
        <div className="relative border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950/50 rounded-xl p-8 text-center transition-colors group">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-label="Upload CSV file"
          />
          <div className="space-y-3 pointer-events-none">
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 group-hover:border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto transition-colors">
              <Upload className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {file ? file.name : "Click to upload or drag & drop CSV file"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports columns:{" "}
                <span className="text-slate-400">
                  sku, title, description, unit_price, category
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {globalError && (
          <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{globalError}</span>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-red-400 hover:text-red-300"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Import Success Banner */}
        {uploadSuccess && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">Import Successful!</p>
              <p>
                Successfully processed and upserted {uploadSuccess.count}{" "}
                stationery items into Supabase.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Table & Validation Step */}
      {parsedRows.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-white text-base">
                CSV Validation Preview
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {validCount} Valid
              </span>
              {invalidCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                  {invalidCount} Invalid
                </span>
              )}
            </div>

            {/* Execute Import Action Button */}
            <button
              onClick={handleExecuteImport}
              disabled={isUploading || validCount === 0}
              type="button"
              className="min-h-[44px] px-6 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Upserting to Supabase...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Import {validCount} Items Now
                </>
              )}
            </button>
          </div>

          {/* Records Table Preview */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] sticky top-0 z-10 border-b border-slate-800">
                <tr>
                  <th className="p-3">Row</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {parsedRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={
                      row.error ? "bg-red-950/20" : "hover:bg-slate-800/40"
                    }
                  >
                    <td className="p-3 text-slate-500 font-mono">
                      #{row.rowNumber}
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {row.data.sku || "—"}
                    </td>
                    <td className="p-3 font-semibold text-white">
                      {row.data.title || "—"}
                    </td>
                    <td className="p-3 text-slate-400">{row.data.category}</td>
                    <td className="p-3 font-bold text-emerald-400">
                      R {row.data.unit_price.toFixed(2)}
                    </td>
                    <td className="p-3">
                      {row.error ? (
                        <span className="text-red-400 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {row.error}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
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
