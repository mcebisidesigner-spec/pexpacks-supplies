"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { trackTrayOpened } from "@/lib/analytics";
import { PackTrayItem } from "./PackTrayItem";
import { PackTrayFooter } from "./PackTrayFooter";
import { cn } from "@/lib/utils";

export function GlobalPackTray() {
  const packs = usePackTrayStore((s) => s.packs);
  const isOpen = usePackTrayStore((s) => s.isTrayOpen);
  const closeTray = useCallback(() => usePackTrayStore.getState().closeTray(), []);

  const trayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const openTrackedRef = useRef(false);
  const schoolSlugsKey = [...new Set(
    packs
      .map((pack) => pack.schoolSlug)
      .filter((slug): slug is string => Boolean(slug)),
  )]
    .sort()
    .join("|");

  useEffect(() => {
    if (!schoolSlugsKey) return;

    const controller = new AbortController();
    const slugs = schoolSlugsKey.split("|");
    void fetch("/api/schools/visibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{
          success?: boolean;
          visibleSlugs?: string[];
        }>;
      })
      .then((result) => {
        if (!result?.success || !Array.isArray(result.visibleSlugs)) return;
        usePackTrayStore
          .getState()
          .retainPublicSchoolPacks(result.visibleSlugs);
      })
      .catch(() => {
        // Keep the local tray unchanged when visibility cannot be verified.
      });

    return () => controller.abort();
  }, [schoolSlugsKey, isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTray();
        return;
      }

      if (e.key === "Tab" && trayRef.current) {
        const focusable = trayRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [closeTray]
  );

  useEffect(() => {
    if (isOpen && !openTrackedRef.current) {
      trackTrayOpened({ packCount: packs.length });
    }
    openTrackedRef.current = isOpen;
  }, [isOpen, packs.length]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";

      requestAnimationFrame(() => {
        previousFocusRef.current?.focus();
      });
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeTray();
      }
    },
    [closeTray]
  );

  if (!isOpen) return null;

  const hasPacks = packs.length > 0;

  return (
    <div
      className="fixed inset-0 z-[var(--z-drawer,60)] bg-black/50 flex justify-end overflow-hidden [animation:fadeInOverlay_0.25s_ease-out_forwards]"
      role="presentation"
      onMouseDown={handleOverlayClick}
    >
      <div
        className="w-full sm:max-w-[480px] h-screen h-[100dvh] overflow-x-hidden overflow-y-auto bg-background shadow-[0_24px_64px_rgba(15,37,55,0.25)] flex flex-col [animation:slideInTray_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pack-tray-title"
        ref={trayRef}
        tabIndex={-1}
      >
        <div className="sticky top-0 z-10 p-4 sm:p-5 md:p-6 pt-[max(16px,env(safe-area-inset-top))] border-b border-border bg-white/95 backdrop-blur-md grid grid-cols-[1fr_auto] gap-4 items-start">
          <div>
            <h2
              id="pack-tray-title"
              className="m-0 text-primary font-heading text-2xl sm:text-3xl font-extrabold leading-none"
            >
              Your Order
            </h2>
            <span className="block mt-1.5 text-muted-foreground text-sm font-semibold">
              Packs saved for checkout
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {hasPacks ? (
              <span
                className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full bg-[#ff6f59] text-white text-xs font-extrabold leading-none"
                aria-label={`${packs.length} pack${packs.length === 1 ? "" : "s"} saved`}
              >
                {packs.length}
              </span>
            ) : null}
            <button
              type="button"
              className="w-11 h-11 min-w-11 min-h-11 rounded-full border border-border hover:border-primary text-primary hover:text-primary bg-background text-2xl flex items-center justify-center cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-primary"
              onClick={closeTray}
              aria-label="Close your order"
              ref={closeButtonRef}
            >
              &times;
            </button>
          </div>
        </div>

        {!hasPacks ? (
          <div className="relative z-20 border-b border-border bg-background">
            <div className="w-full max-w-full p-3.5 sm:p-4 md:px-5 flex flex-col items-stretch text-left min-w-0 box-border">
              <h3 className="m-0 mb-2.5 text-primary font-heading text-base sm:text-lg md:text-xl font-extrabold">
                Find Your School Pack
              </h3>
              <HeroSearch onResultClick={closeTray} source="tray" />
            </div>
          </div>
        ) : null}

        <div className="flex-1 p-4 sm:p-5 md:p-6 grid gap-3.5 content-start min-w-0">
          {hasPacks ? (
            packs.map((pack, index) => (
              <div
                key={pack.id}
                className={cn(
                  index === packs.length - 1 &&
                    "[animation:popIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                )}
              >
                <PackTrayItem pack={pack} />
              </div>
            ))
          ) : (
            <div className="grid gap-4 justify-items-center text-center py-12 px-5 w-full min-w-0 box-border">
              <div
                className="w-16 h-16 rounded-full bg-slate-100 text-muted-foreground grid place-items-center"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-8 h-8 stroke-current stroke-[1.5]"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p className="m-0 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-[280px]">
                No packs saved yet. Choose a school pack and add it to your
                order.
              </p>
            </div>
          )}
        </div>

        <PackTrayFooter />
      </div>
    </div>
  );
}
