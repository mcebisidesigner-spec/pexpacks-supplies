import React from "react";

export interface ZarIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function ZarIcon({
  size = 16,
  className,
  ...props
}: ZarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="South African Rand (ZAR)"
      role="img"
      {...props}
    >
      <path d="M6 4h7a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 4v16" />
      <path d="M13 12l5 8" />
    </svg>
  );
}

export default ZarIcon;
