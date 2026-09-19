import { Metadata } from "next";
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
    <main className="py-[clamp(40px,6vw,80px)] bg-[radial-gradient(circle_at_82%_10%,rgba(33,158,154,0.1),transparent_28%),linear-gradient(180deg,#ffffff,var(--color-pex-bg))] min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-[clamp(40px,8vw,80px)] items-start">
        {/* Left Side: The Pitch */}
        <div className="pt-5">
          <p className="m-0 mb-4 text-pex-keppel font-extrabold text-sm tracking-normal">
            Custom stationery concierge
          </p>
          <h1 className="m-0 mb-4 text-pex-navy font-heading text-[clamp(38px,5vw,56px)] font-extrabold leading-[1.05]">
            Let us pack it for you.
          </h1>

          <div className="p-4 mb-5 max-w-[480px] rounded-field bg-pex-keppel/10 border border-pex-keppel/30">
            <p className="m-0 text-pex-navy text-sm leading-[1.5]">
              <strong className="text-pex-keppel text-[15px] font-bold">
                Wait! Did you check if we already have your school?
              </strong>
              <br />
              We have hundreds of standard packs ready to go.{" "}
              <Link
                href="/schools"
                className="text-pex-keppel font-bold underline underline-offset-4 hover:text-pex-navy transition-colors"
              >
                Search for your school pack here.
              </Link>
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex gap-5 items-start">
              <div className="w-12 h-12 shrink-0 rounded-field bg-pex-navy text-white grid place-items-center text-xl font-bold shadow-[0_8px_24px_rgba(26,42,64,0.15)]">
                1
              </div>
              <div>
                <h3 className="m-0 mb-1.5 font-heading text-xl font-bold text-pex-navy">
                  Upload or Snap
                </h3>
                <p className="m-0 text-pex-muted text-[15px] leading-[1.4]">
                  Snap a photo of your school list or upload a PDF document.
                </p>
              </div>
            </div>

            <div className="flex gap-5 items-start">
              <div className="w-12 h-12 shrink-0 rounded-field bg-pex-navy text-white grid place-items-center text-xl font-bold shadow-[0_8px_24px_rgba(26,42,64,0.15)]">
                2
              </div>
              <div>
                <h3 className="m-0 mb-1.5 font-heading text-xl font-bold text-pex-navy">
                  Instant AI Matching
                </h3>
                <p className="m-0 text-pex-muted text-[15px] leading-[1.4]">
                  Our AI parses your photo or PDF and matches our verified stationery catalog in
                  seconds.
                </p>
              </div>
            </div>

            <div className="flex gap-5 items-start">
              <div className="w-12 h-12 shrink-0 rounded-field bg-pex-navy text-white grid place-items-center text-xl font-bold shadow-[0_8px_24px_rgba(26,42,64,0.15)]">
                3
              </div>
              <div>
                <h3 className="m-0 mb-1.5 font-heading text-xl font-bold text-pex-navy">
                  Packed &amp; Delivered
                </h3>
                <p className="m-0 text-pex-muted text-[15px] leading-[1.4]">
                  Review your matched cart, add optional book covering, and your pack arrives at
                  your door.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The AI Converter Dropzone */}
        <div className="flex flex-col">
          <AiListDropzone />

          <div className="mt-12 pt-6 border-t border-pex-border">
            <p className="m-0 mb-4 text-sm text-pex-muted">
              In a rush or prefer chatting?
            </p>
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

