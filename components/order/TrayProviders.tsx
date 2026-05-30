"use client";

import dynamic from "next/dynamic";

const GlobalPackTray = dynamic(
  () => import("@/components/order/GlobalPackTray").then((m) => m.GlobalPackTray),
  { ssr: false }
);
const OrderSavedToast = dynamic(
  () => import("@/components/order/OrderSavedToast").then((m) => m.OrderSavedToast),
  { ssr: false }
);

export function TrayProviders() {
  return (
    <>
      <GlobalPackTray />
      <OrderSavedToast />
    </>
  );
}
