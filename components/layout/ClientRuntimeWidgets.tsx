"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const DynamicWhatsAppWidget = dynamic(
  () => import("@/components/shared/WhatsAppWidget").then((m) => m.WhatsAppWidget),
  { ssr: false }
);
const DynamicFirstOrderDiscount = dynamic(
  () => import("@/components/shared/FirstOrderDiscount").then((m) => m.FirstOrderDiscount),
  { ssr: false }
);
const DynamicExitIntent = dynamic(
  () => import("@/components/shared/ExitIntent").then((m) => m.ExitIntent),
  { ssr: false }
);
const DynamicPwaLifecycle = dynamic(
  () => import("@/components/pwa/PwaLifecycle").then((m) => m.PwaLifecycle),
  { ssr: false }
);

const conversionPaths = ["/", "/schools", "/foundation-phase", "/primary-school", "/high-school", "/office", "/lay-by", "/add-your-school"];

export function ClientRuntimeWidgets() {
  const pathname = usePathname();
  const isConversionPage = conversionPaths.includes(pathname);

  return (
    <>
      <DynamicWhatsAppWidget />
      <DynamicPwaLifecycle />
      {isConversionPage ? <DynamicFirstOrderDiscount /> : null}
      {isConversionPage ? <DynamicExitIntent /> : null}
    </>
  );
}