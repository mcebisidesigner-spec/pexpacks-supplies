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
  const hideWhatsApp = pathname?.startsWith("/checkout") || pathname?.startsWith("/admin");

  return (
    <>
      {hideWhatsApp ? null : <DynamicWhatsAppWidget />}
      <DynamicPwaLifecycle />
    </>
  );
}
