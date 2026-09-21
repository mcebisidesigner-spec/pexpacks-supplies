import { Metadata } from "next";
import { Suspense } from "react";
import { CartReviewClient } from "./CartReviewClient";

export const metadata: Metadata = {
  title: "Review Your Uploaded List | Pexpacks Supplies",
  description: "Review items from your uploaded school stationery list, adjust quantities, and add optional book covering.",
};

interface CartReviewPageProps {
  searchParams: Promise<{ draft_id?: string }>;
}

export default async function CartReviewPage({ searchParams }: CartReviewPageProps) {
  const params = await searchParams;
  const draftId = params.draft_id || "";

  return (
    <Suspense
      fallback={
        <main className="py-[clamp(32px,5vw,64px)] bg-[var(--pex-bg)] min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8">
            <div className="text-center py-16 px-4 bg-white rounded-[var(--radius-card)] border border-[var(--pex-border)] shadow-sm max-w-lg mx-auto flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-2 border-[var(--pex-border)] border-t-[var(--pex-keppel)] rounded-full animate-spin mb-4" />
              <h2 className="text-lg font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)]">Loading stationery cart...</h2>
            </div>
          </div>
        </main>
      }
    >
      <CartReviewClient draftId={draftId} />
    </Suspense>
  );
}
