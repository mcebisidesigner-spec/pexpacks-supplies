import { Metadata } from "next";
import { Suspense } from "react";
import { CartReviewClient } from "./CartReviewClient";
import styles from "./CartReview.module.css";

export const metadata: Metadata = {
  title: "Review Your AI Matched Pack | Pexpacks Supplies",
  description: "Review items matched from your uploaded school stationery list, customize quantities, and add optional book covering.",
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
        <main className={styles.page}>
          <div className={styles.container}>
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <h2>Loading stationery cart...</h2>
            </div>
          </div>
        </main>
      }
    >
      <CartReviewClient draftId={draftId} />
    </Suspense>
  );
}
