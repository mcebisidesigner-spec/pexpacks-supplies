"use client";

import dynamic from "next/dynamic";

const DynamicWhatsAppWidget = dynamic(
  () => import("@/components/shared/WhatsAppWidget").then((m) => m.WhatsAppWidget),
  { ssr: false }
);
const DynamicSocialProofToasts = dynamic(
  () => import("@/components/shared/SocialProofToasts").then((m) => m.SocialProofToasts),
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

export function ClientRuntimeWidgets() {
  return (
    <>
      <DynamicWhatsAppWidget />
      <DynamicSocialProofToasts />
      <DynamicFirstOrderDiscount />
      <DynamicExitIntent />
      <DynamicPwaLifecycle />
    </>
  );
}
