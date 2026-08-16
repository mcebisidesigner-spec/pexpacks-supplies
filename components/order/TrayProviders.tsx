"use client";

import dynamic from "next/dynamic";
import { usePackTrayStore } from "@/store/usePackTrayStore";

const GlobalPackTray = dynamic(
  () => import("@/components/order/GlobalPackTray").then((m) => m.GlobalPackTray),
  { ssr: false }
);
const OrderSavedToast = dynamic(
  () => import("@/components/order/OrderSavedToast").then((m) => m.OrderSavedToast),
  { ssr: false }
);

export function TrayProviders() {
  const hasPacks = usePackTrayStore((state) => state.packs.length > 0);
  const isTrayOpen = usePackTrayStore((state) => state.isTrayOpen);
  const showSavedToast = usePackTrayStore((state) => state.showSavedToast);

  return (
    <>
      {hasPacks || isTrayOpen ? <GlobalPackTray /> : null}
      {showSavedToast ? <OrderSavedToast /> : null}
    </>
  );
}
