"use client";

import { Camera, Check, FileImage, FileText, Sparkles, Upload } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  trackAiConversionStarted,
  trackAiConversionSucceeded,
  trackAiConversionFailed,
  trackAiConversionRetried,
} from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { PEXPACKS_CONTENT } from "@/lib/content/pexpacks";
import { useNotification } from "@/components/ui/NotificationProvider";

const MAX_SIZE_MB = 15;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const CONVERSION_STEPS = [
  { id: 1, label: "Uploading your list..." },
  { id: 2, label: "Reading the items on your list..." },
  { id: 3, label: "Checking Pexpacks items..." },
  { id: 4, label: "Preparing your review..." },
];

export function AiListDropzone() {
  const router = useRouter();
  const { notify } = useNotification();

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
      notify({
        tone: "success",
        title: "Your list is ready",
        message: PEXPACKS_CONTENT.lists.review,
      });

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
      notify({
        tone: "error",
        title: "Your list was not ready",
        message:
          "Something went wrong while reading the list. Please try again, or send it on WhatsApp for personal help.",
      });
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
    <div
      className="bg-background rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-md border border-[#219e9a]/20 relative overflow-hidden transition-shadow duration-300"
      id="ai-list-converter"
    >
      {/* Header */}
      <div className="mb-6 text-left">
        <div className="inline-flex items-center gap-1.5 bg-[#1a7a77]/10 text-[#1b6f6c] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2.5">
          <span className="w-2 h-2 rounded-full bg-[#1a7a77] [animation:pulseDot_2s_infinite_ease-in-out]" />
          <span>List support</span>
        </div>
        <h2 className="text-[#1a2a40] font-heading text-xl sm:text-2xl font-extrabold m-0 mb-1.5 leading-tight">
          Organise your school list
        </h2>
        <p className="text-muted-foreground text-sm m-0 leading-relaxed">
          Drop your stationery list or snap a photo. Bro Pex will help you organise the items, and you can review the suggestions before ordering.
        </p>
      </div>

      {/* Success State */}
      {isSuccess && (
        <div className="text-center py-6 px-2.5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center text-2xl mx-auto mb-4 border-2 border-emerald-200 [animation:scaleSuccess_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <Check className="size-8" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <h3 className="text-pex-navy font-heading text-xl font-extrabold m-0 mb-1.5">
            Your list is ready
          </h3>
          <p className="text-pex-muted text-sm m-0">
            I have organised the items I could identify. Opening your review page now...
          </p>
        </div>
      )}

      {/* Processing State with Laser Scan & Stepper */}
      {isProcessing && !isSuccess && (
        <div className="py-2.5 flex flex-col gap-6">
          {/* Document Preview with Laser Scan */}
          <div className="relative w-full max-w-[320px] h-[180px] mx-auto rounded-xl overflow-hidden border border-pex-border bg-[#0f172a] flex items-center justify-center">
            {filePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={filePreview}
                alt="Uploaded stationery list"
                width={320}
                height={180}
                className="w-full h-full object-cover opacity-85 aspect-[16/9]"
                style={{ aspectRatio: "16 / 9" }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
                <FileText className="size-10" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-xs font-semibold max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {file ? file.name : "Stationery Text Document"}
                </span>
              </div>
            )}
            <div className="absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#2dd4bf] to-transparent shadow-[0_0_16px_3px_rgba(45,212,191,0.85)] [animation:scanLaser_2.2s_infinite_ease-in-out] z-[5]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_70%)] pointer-events-none" />
          </div>

          {/* Stepper Indicators */}
          <div className="flex flex-col gap-3.5">
            {CONVERSION_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3.5 text-sm transition-all duration-300",
                    isCompleted && "text-pex-navy font-semibold",
                    isActive && "text-pex-keppel font-bold",
                    !isCompleted && !isActive && "text-pex-muted opacity-55"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full grid place-items-center text-xs font-bold shrink-0 border transition-all duration-300",
                      isCompleted && "bg-pex-keppel text-white border-pex-keppel",
                      isActive &&
                        "bg-white text-pex-keppel border-2 border-pex-keppel shadow-[0_0_0_3px_rgba(33,158,154,0.2)] [animation:pulseActive_1.5s_infinite_ease-in-out]",
                      !isCompleted && !isActive && "bg-slate-100 text-pex-muted border-pex-border"
                    )}
                  >
                    {isCompleted ? <Check className="size-4" strokeWidth={2.5} aria-hidden="true" /> : step.id}
                  </div>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-4.5 text-center mt-4">
              <h4 className="text-red-700 text-sm sm:text-base font-bold m-0 mb-1.5">
                Conversion Interrupted
              </h4>
              <p className="text-red-900 text-xs sm:text-sm leading-relaxed m-0 mb-3.5">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="bg-white text-red-700 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-red-500"
              >
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
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1 mb-5">
            <button
              type="button"
              className={cn(
                "flex-1 border-0 bg-transparent py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-pex-muted rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 hover:text-pex-navy",
                activeTab === "upload" && "bg-white text-pex-keppel shadow-sm font-bold"
              )}
              onClick={() => {
                setActiveTab("upload");
                setErrorMessage(null);
              }}
            >
              <Upload className="size-[18px]" strokeWidth={2} aria-hidden="true" />
              Photo or PDF Upload
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 border-0 bg-transparent py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-pex-muted rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 hover:text-pex-navy",
                activeTab === "text" && "bg-white text-pex-keppel shadow-sm font-bold"
              )}
              onClick={() => {
                setActiveTab("text");
                setErrorMessage(null);
              }}
            >
              <FileText className="size-[18px]" strokeWidth={2} aria-hidden="true" />
              Paste / Type List
            </button>
          </div>

          {activeTab === "upload" ? (
            <div>
              <div
                className={cn(
                  "border-2 border-dashed border-pex-keppel/30 hover:border-pex-keppel rounded-2xl p-6 sm:p-8 text-center cursor-pointer bg-pex-keppel/[0.02] hover:bg-pex-keppel/[0.06] transition-all flex flex-col items-center justify-center relative hover:-translate-y-0.5",
                  isDragging && "border-solid border-pex-keppel bg-pex-keppel/[0.06] shadow-[0_0_0_4px_rgba(33,158,154,0.15)]"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-pex-keppel/10 text-pex-keppel grid place-items-center mb-4 transition-transform duration-200">
                  <Upload className="size-8" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <span className="block text-sm sm:text-base font-bold text-pex-navy mb-1.5">
                  Click to browse or drag &amp; drop
                </span>
                <span className="block text-xs sm:text-sm text-pex-muted max-w-[320px] leading-relaxed mb-4.5">
                  Takes photos, printed PDFs, or handwritten school booklists (Max 15MB)
                </span>

                <div className="flex gap-2.5 flex-wrap justify-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="bg-pex-keppel hover:bg-pex-keppel/90 active:scale-[0.98] !text-white border-0 h-11 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileImage className="size-4" strokeWidth={2} aria-hidden="true" />
                    Browse Files
                  </button>

                  <button
                    type="button"
                    className="bg-white hover:bg-pex-keppel/5 active:scale-[0.98] !text-pex-navy hover:text-pex-keppel border border-pex-border hover:border-pex-keppel h-11 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-sm"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="size-4" strokeWidth={2} aria-hidden="true" />
                    Take Photo
                  </button>
                </div>

                {/* Standard file input */}
                <input
                  id="stationery-file-upload"
                  name="stationeryFile"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                {/* Direct mobile camera capture input */}
                <input
                  id="stationery-camera-capture"
                  name="stationeryCamera"
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-4.5 text-center mt-4">
                  <h4 className="text-red-700 text-sm sm:text-base font-bold m-0 mb-1.5">
                    Could not process document
                  </h4>
                  <p className="text-red-900 text-xs sm:text-sm leading-relaxed m-0 mb-3.5">
                    {errorMessage}
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="bg-white text-red-700 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    Try Another File
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <textarea
                id="stationery-text-input"
                name="stationeryText"
                className="w-full border-2 border-pex-border focus:border-pex-keppel rounded-xl p-3.5 text-sm text-foreground resize-y min-h-[140px] outline-none transition-all shadow-[inset_0_2px_4px_rgba(26,42,64,0.04)] focus:ring-4 focus:ring-pex-keppel/15 placeholder:text-muted-foreground/50"
                rows={6}
                placeholder="Paste or type your stationery list here...&#10;e.g.&#10;5x 72pg Exercise Books Feint & Margin&#10;2x Pritt Glue Sticks 43g&#10;1x Staedtler Noris 2B Pencils Pack of 12&#10;1x 30cm Shatterproof Ruler"
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
              />

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-4.5 text-center mt-4">
                  <h4 className="text-red-700 text-sm sm:text-base font-bold m-0 mb-1.5">Error</h4>
                  <p className="text-red-900 text-xs sm:text-sm leading-relaxed m-0 mb-3.5">{errorMessage}</p>
                </div>
              )}

              <button
                type="button"
                className="bg-pex-coral hover:bg-pex-coral-hover active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed !text-white border-0 h-11 py-2.5 px-5 rounded-xl text-sm sm:text-base font-medium cursor-pointer transition-all flex items-center justify-center gap-2 w-full shadow-md"
                disabled={!pastedText.trim()}
                onClick={() => startConversion(null, pastedText)}
              >
                <Sparkles className="size-[18px]" strokeWidth={2} aria-hidden="true" />
                Review my list
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
