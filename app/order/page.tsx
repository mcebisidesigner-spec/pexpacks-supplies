import { Metadata } from "next";
import styles from "./OrderPage.module.css";
import heroStyles from "@/components/marketing/HeroBase.module.css";
import { AiListDropzone } from "@/components/AiListDropzone";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { buildWhatsAppHref } from "@/data/contact";

export const metadata: Metadata = {
  title: "AI School List Converter | Pexpacks Supplies",
  description:
    "Upload or snap a photo of your school stationery list. Our instant AI matches your items to verified school stock in seconds.",
};

const WHATSAPP_URL = buildWhatsAppHref(
  "Hi Pexpacks! I have a question about my school stationery list:"
);

export default function OrderPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Left Side: The Pitch */}
        <div className={styles.pitchSection}>
          <p className={heroStyles.eyebrow}>Custom stationery concierge</p>
          <h1>Let us pack it for you.</h1>

          <div className={styles.searchPromo}>
            <p>
              <strong>Wait! Did you check if we already have your school?</strong>
              <br />
              We have hundreds of standard packs ready to go.{" "}
              <Link href="/schools" className={styles.searchLink}>
                Search for your school pack here.
              </Link>
            </p>
          </div>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>1</div>
              <div className={styles.stepContent}>
                <h3>Upload or Snap</h3>
                <p>Snap a photo of your school list or upload a PDF document.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepIcon}>2</div>
              <div className={styles.stepContent}>
                <h3>Instant AI Matching</h3>
                <p>
                  Our AI parses your photo or PDF and matches our verified stationery catalog in
                  seconds.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepIcon}>3</div>
              <div className={styles.stepContent}>
                <h3>Packed & Delivered</h3>
                <p>
                  Review your matched cart, add optional book covering, and your pack arrives at
                  your door.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The AI Converter Dropzone */}
        <div className={styles.formColumn}>
          <AiListDropzone />

          <div className={styles.whatsappFallback}>
            <p>In a rush or prefer chatting?</p>
            <Button
              href={WHATSAPP_URL}
              variant="outline"
              size="md"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp us your list instead
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
