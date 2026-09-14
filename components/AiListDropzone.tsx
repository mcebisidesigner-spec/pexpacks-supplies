"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  trackAiConversionStarted,
  trackAiConversionSucceeded,
  trackAiConversionFailed,
  trackAiConversionRetried,
} from "@/lib/analytics";
import styles from "./AiListDropzone.module.css";

const MAX_SIZE_MB = 15;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const CONVERSION_STEPS = [
  { id: 1, label: "Uploading document..." },
  { id: 2, label: "Analyzing handwriting & line items..." },
  { id: 3, label: "Matching Pexpacks stock catalog..." },
  { id: 4, label: "Generating instant cart..." },
];

export function AiListDropzone() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"upload" | "text">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs when preview unmounts/changes
  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith("blob:")) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // Stepper progress simulation during backend processing
  useEffect(() => {
    if (!isProcessing || isSuccess || errorMessage) return;

    const stepIntervals = [1200, 2600, 2400]; // Timings between steps 1->2, 2->3, 3->4
    let current = 0;

    const advanceStep = () => {
      if (current < CONVERSION_STEPS.length - 1) {
        current += 1;
        setCurrentStepIndex(current);
        if (current < stepIntervals.length) {
          timer = setTimeout(advanceStep, stepIntervals[current]);
        }
      }
    };

    let timer = setTimeout(advanceStep, stepIntervals[0]);

    return () => {
      clearTimeout(timer);
    };
  }, [isProcessing, isSuccess, errorMessage]);

  const isHeic = (file: File) =>
    /\.(heic|heif)$/i.test(file.name) || /image\/heic|image\/heif/i.test(file.type);

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    const jpegName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    return new File([blob], jpegName, { type: "image/jpeg" });
  };

  const validateAndProcessFile = async (selectedFile: File) => {
    setErrorMessage(null);

    // Validate size (15MB)
    if (selectedFile.size > MAX_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). The maximum allowed size is ${MAX_SIZE_MB}MB.`
      );
      return;
    }

    // Validate type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "image/bmp",
      "application/pdf",
    ];

    const isImageOrPdf =
      validTypes.includes(selectedFile.type.toLowerCase()) ||
      /\.(jpe?g|png|webp|heic|heif|pdf)$/i.test(selectedFile.name);

    if (!isImageOrPdf) {
      setErrorMessage("Please upload an image (JPG, PNG, WEBP, HEIC) or a PDF document.");
      return;
    }

    // Transcode HEIC/HEIF to JPEG locally so the backend can parse it
    let uploadFile = selectedFile;
    if (isHeic(selectedFile)) {
      try {
        uploadFile = await convertHeicToJpeg(selectedFile);
      } catch {
        setErrorMessage(
          "Could not read this HEIC photo. Please convert it to JPG or PNG, or try a different file."
        );
        return;
      }
    }

    setFile(uploadFile);

    // Create preview if image
    if (uploadFile.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(uploadFile);
      setFilePreview(objectUrl);
    } else {
      setFilePreview(null);
    }

    // Immediately trigger conversion
    startConversion(uploadFile, "");
  };

  const startConversion = async (fileToUpload: File | null, textContent: string) => {
    const method: "upload" | "text" = fileToUpload ? "upload" : "text";
    setIsProcessing(true);
    setCurrentStepIndex(0);
    setErrorMessage(null);
    setIsSuccess(false);

    trackAiConversionStarted({
      method,
      hasFile: Boolean(fileToUpload),
      fileKind: fileToUpload?.type ?? null,
    });

    try {
      const formData = new FormData();
      if (fileToUpload) {
        formData.append("file", fileToUpload, fileToUpload.name);
      }
      if (textContent.trim()) {
        formData.append("text", textContent.trim());
      }

      const res = await fetch("/api/ai-convert-list", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to parse stationery list.");
      }

      // Finish all steps
      setCurrentStepIndex(CONVERSION_STEPS.length - 1);
      setDraftId(data.draftId);
      setIsSuccess(true);

      trackAiConversionSucceeded({
        draftId: data.draftId,
        itemCount: data.itemCount ?? 0,
        estimatedCount: data.unmatchedCount ?? 0,
      });

      // Brief delay to showcase completion then redirect
      setTimeout(() => {
        router.push(`/cart/review?draft_id=${encodeURIComponent(data.draftId)}`);
      }, 1400);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong during conversion. Please try again.";
      setErrorMessage(message);
      setIsProcessing(false);
      trackAiConversionFailed({ method, reason: message });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    if (errorMessage) trackAiConversionRetried({ method: activeTab });
    setFile(null);
    setFilePreview(null);
    setPastedText("");
    setIsProcessing(false);
    setIsSuccess(false);
    setErrorMessage(null);
    setCurrentStepIndex(0);
    setDraftId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className={styles.dropzoneContainer} id="ai-list-converter">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span>Instant AI Vision</span>
        </div>
        <h2 className={styles.title}>AI School List Converter</h2>
        <p className={styles.subtitle}>
          Drop your stationery list or snap a photo. Our AI matches your school requirements to our verified
          stock catalog in seconds.
        </p>
      </div>

      {/* Success State */}
      {isSuccess && (
        <div className={styles.successBox}>
          <div className={styles.successIcon}>✓</div>
          <h3 className={styles.successTitle}>Catalog Matched!</h3>
          <p className={styles.successText}>
            Generating your personalized cart and opening your review page...
          </p>
        </div>
      )}

      {/* Processing State with Laser Scan & Stepper */}
      {isProcessing && !isSuccess && (
        <div className={styles.processingState}>
          {/* Document Preview with Laser Scan */}
          <div className={styles.previewContainer}>
            {filePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={filePreview} alt="Uploaded stationery list" className={styles.previewImage} />
            ) : (
              <div className={styles.pdfPlaceholder}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>{file ? file.name : "Stationery Text Document"}</span>
              </div>
            )}
            <div className={styles.laserLine} />
            <div className={styles.laserOverlay} />
          </div>

          {/* Stepper Indicators */}
          <div className={styles.stepper}>
            {CONVERSION_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              const isUpcoming = idx > currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`${styles.stepRow} ${
                    isCompleted ? styles.stepCompleted : isActive ? styles.stepActive : styles.stepUpcoming
                  }`}
                >
                  <div className={styles.stepCircle}>{isCompleted ? "✓" : step.id}</div>
                  <span className={styles.stepLabel}>{step.label}</span>
                </div>
              );
            })}
          </div>

          {errorMessage && (
            <div className={styles.errorBox}>
              <h4 className={styles.errorTitle}>Conversion Interrupted</h4>
              <p className={styles.errorMessage}>{errorMessage}</p>
              <button type="button" onClick={handleReset} className={styles.retryBtn}>
                Try Again with Clearer Photo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Default Upload & Paste State */}
      {!isProcessing && !isSuccess && (
        <>
          {/* Method Tabs */}
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "upload" ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab("upload");
                setErrorMessage(null);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Photo or PDF Upload
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "text" ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab("text");
                setErrorMessage(null);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Paste / Type List
            </button>
          </div>

          {activeTab === "upload" ? (
            <div>
              <div
                className={`${styles.dropArea} ${isDragging ? styles.dropAreaDragging : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={styles.iconCircle}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                    <path d="M12 12v9" />
                    <path d="m16 16-4-4-4 4" />
                  </svg>
                </div>
                <span className={styles.primaryLabel}>Click to browse or drag & drop</span>
                <span className={styles.secondaryLabel}>
                  Takes photos, printed PDFs, or handwritten school booklists (Max 15MB)
                </span>

                <div className={styles.buttonGroup} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className={styles.browseBtn}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    Browse Files
                  </button>

                  <button
                    type="button"
                    className={styles.cameraBtn}
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Take Photo
                  </button>
                </div>

                {/* Standard file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className={styles.hiddenInput}
                  onChange={handleFileInputChange}
                />

                {/* Direct mobile camera capture input */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className={styles.hiddenInput}
                  onChange={handleFileInputChange}
                />
              </div>

              {errorMessage && (
                <div className={styles.errorBox}>
                  <h4 className={styles.errorTitle}>Could not process document</h4>
                  <p className={styles.errorMessage}>{errorMessage}</p>
                  <button type="button" onClick={handleReset} className={styles.retryBtn}>
                    Try Another File
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.textSection}>
              <textarea
                className={styles.textArea}
                rows={6}
                placeholder="Paste or type your stationery list here...&#10;e.g.&#10;5x 72pg Exercise Books Feint & Margin&#10;2x Pritt Glue Sticks 43g&#10;1x Staedtler Noris 2B Pencils Pack of 12&#10;1x 30cm Shatterproof Ruler"
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
              />

              {errorMessage && (
                <div className={styles.errorBox}>
                  <h4 className={styles.errorTitle}>Error</h4>
                  <p className={styles.errorMessage}>{errorMessage}</p>
                </div>
              )}

              <button
                type="button"
                className={styles.convertBtn}
                disabled={!pastedText.trim()}
                onClick={() => startConversion(null, pastedText)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
                  <path d="m14 7 3 3" />
                  <path d="M5 6v4" />
                  <path d="M19 14v4" />
                  <path d="M10 2v2" />
                  <path d="M7 8H3" />
                  <path d="M21 16h-4" />
                  <path d="M11 3H9" />
                </svg>
                Match with AI & Generate Cart
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
