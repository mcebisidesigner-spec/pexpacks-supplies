import { Package, ShoppingBag, Truck, Wallet } from "lucide-react";
import type { ComponentProps } from "react";

type IconProps = ComponentProps<typeof Package>;

/** Shared storefront icons keep icon sizing and stroke weight consistent. */
export function PackageIcon(props: IconProps) {
  return <Package aria-hidden="true" {...props} />;
}

export function TrackPackIcon(props: IconProps) {
  return <Truck aria-hidden="true" {...props} />;
}

export function WalletIcon(props: IconProps) {
  return <Wallet aria-hidden="true" {...props} />;
}

export function ShoppingBagIcon(props: IconProps) {
  return <ShoppingBag aria-hidden="true" {...props} />;
}

export const ShoppingCartIcon = ShoppingBagIcon;
