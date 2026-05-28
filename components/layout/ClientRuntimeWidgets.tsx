"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const DynamicWhatsAppWidget = dynamic(
  () => import("@/components/shared/WhatsAppWidget").then((m) => m.WhatsAppWidget),
  { ssr: false }
);
const DynamicPwaLifecycle = dynamic(
  () => import("@/components/pwa/PwaLifecycle").then((m) => m.PwaLifecycle),
  { ssr: false }
);

export function ClientRuntimeWidgets() {
  const pathname = usePathname();
  const isCheckoutFlow = pathname?.startsWith("/checkout");

  return (
    <>
      {isCheckoutFlow ? null : <DynamicWhatsAppWidget />}
      <DynamicPwaLifecycle />
    </>
  );
}
