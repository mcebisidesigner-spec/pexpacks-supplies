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
    <path d="M9 5V3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5V5" />
    <path d="M5 9a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v3" />
    <path d="M5 9v9a2 2 0 0 0 2 2h5.5" />
    <path d="M5 11h14" />
    <path d="M8 15h4" />
    <circle cx="15.5" cy="15.5" r="3.5" />
    <path d="M18 18l3.5 3.5" />
  </svg>
);

export const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 7V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V7" />
    <path d="M16 14h.01" />
  </svg>
);
