"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { calculateTrayTotal } from "@/lib/order/calculateTrayTotal";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  trackAddLearnerStarted,
  trackProceedToCheckout,
} from "@/lib/analytics";

export function PackTrayFooter() {
  const router = useRouter();
  const packs = usePackTrayStore((s) => s.packs);
  const closeTray = usePackTrayStore((s) => s.closeTray);
  const [showSchoolChoice, setShowSchoolChoice] = useState(false);

  const total = calculateTrayTotal(packs);
  const hasPacks = packs.length > 0;

  const handleCheckout = useCallback(() => {
    if (!hasPacks) return;
    trackProceedToCheckout({ packCount: packs.length, totalPrice: total });
    closeTray();
    router.push("/checkout");
  }, [hasPacks, packs, total, closeTray, router]);

  const handleAddAnotherLearner = useCallback(() => {
    trackAddLearnerStarted({ packCount: packs.length });
    setShowSchoolChoice(true);
  }, [packs.length]);

  const handleSameSchool = useCallback(() => {
    closeTray();
    setShowSchoolChoice(false);
  }, [closeTray]);

  const handleDifferentSchool = useCallback(() => {
    closeTray();
    setShowSchoolChoice(false);
    router.push("/schools");
  }, [closeTray, router]);

  const handleClearOrder = useCallback(() => {
    usePackTrayStore.getState().clearPacks();
  }, []);

  if (!hasPacks) return null;

  if (showSchoolChoice) {
    return (
      <div className="sticky bottom-0 z-10 mt-auto p-4 sm:p-5 md:px-6 pb-[calc(16px+env(safe-area-inset-bottom,0px))] border-t border-border bg-white/95 backdrop-blur-md shadow-[0_-16px_34px_rgba(15,37,55,0.08)] grid gap-3">
        <div className="grid gap-2 p-4 border border-border rounded-2xl bg-slate-50">
          <p className="m-0 mb-2 text-primary font-bold text-sm">
            Is the next learner at the same school?
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="flex-1 min-w-[130px] min-h-[44px] border border-border hover:border-[#219e9a] rounded-full bg-background text-primary hover:text-[#219e9a] text-sm font-bold cursor-pointer transition-colors"
              onClick={handleSameSchool}
            >
              Same school
            </button>
            <button
              type="button"
              className="flex-1 min-w-[130px] min-h-[44px] border border-border hover:border-[#219e9a] rounded-full bg-background text-primary hover:text-[#219e9a] text-sm font-bold cursor-pointer transition-colors"
              onClick={handleDifferentSchool}
            >
              Different school
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 z-10 mt-auto p-4 sm:p-5 md:px-6 pb-[calc(16px+env(safe-area-inset-bottom,0px))] border-t border-border bg-white/95 backdrop-blur-md shadow-[0_-16px_34px_rgba(15,37,55,0.08)] grid gap-3">
      <div className="flex justify-between items-baseline flex-wrap gap-2">
        <span className="text-primary text-sm sm:text-base font-bold">
          {packs.length === 1 ? "Total" : "Combined total"}
        </span>
        <span className="text-[#1a7a77] text-xl sm:text-2xl font-heading font-black leading-none">
          {formatCurrency(total)}
        </span>
      </div>
      <div className="grid gap-2.5">
        <button
          type="button"
          className="w-full min-h-[52px] border-0 rounded-full bg-[#ff6f59] hover:bg-[#ff6f59]/90 active:scale-[0.99] text-white font-heading text-base sm:text-[17px] font-extrabold cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCheckout}
        >
          Checkout &amp; Pay Now
        </button>
        <button
          type="button"
          className="w-full min-h-[48px] border border-border hover:border-[#219e9a] rounded-full bg-background text-primary hover:text-[#219e9a] font-heading text-sm sm:text-base font-bold cursor-pointer flex items-center justify-center gap-2 transition-all"
          onClick={handleAddAnotherLearner}
        >
          Add Another Learner
        </button>
        <button
          type="button"
          className="border-0 p-2 bg-transparent text-muted-foreground hover:text-destructive text-xs font-bold underline underline-offset-4 cursor-pointer transition-colors mx-auto"
          onClick={handleClearOrder}
        >
          Clear order
        </button>
      </div>
    </div>
  );
}
