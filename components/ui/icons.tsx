import type { SVGProps } from "react";

export const PackageIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);



export const TrackPackIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Motion lines */}
    <path d="M2 8h3" />
    <path d="M1 12h4" />
    <path d="M2 16h3" />
    {/* Truck cargo body */}
    <path d="M7 17H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v10" />
    {/* Cabin & Windshield */}
    <path d="M15 9h3.5a1.5 1.5 0 0 1 1.2.6L22 13v3a1 1 0 0 1-1 1h-1" />
    <path d="M15 13h7" />
    {/* Wheels & Underside */}
    <circle cx="9" cy="17" r="2" />
    <circle cx="18" cy="17" r="2" />
    <path d="M11 17h5" />
  </svg>
);

export const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 7V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V7" />
    <path d="M16 14h.01" />
  </svg>
);

/** Modern shopping bag icon with handle and grommets matching reference */
export const ShoppingBagIcon = ({
  size = 24,
  strokeWidth = 2,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {/* Trapezoidal bag body */}
    <path d="M5.5 8h13l1.5 12.3c.08.68-.45 1.2-1.12 1.2H5.12c-.67 0-1.2-.52-1.12-1.2L5.5 8z" />
    {/* Handle arch */}
    <path d="M8.5 10V6.2a3.5 3.5 0 0 1 7 0V10" />
    {/* Handle attachment eyelets / grommets */}
    <circle cx="8.5" cy="10" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="10" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);

export const ShoppingCartIcon = ShoppingBagIcon;
