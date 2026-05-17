import type { AnchorHTMLAttributes, ReactNode } from "react";
import styles from "./DownloadListLink.module.css";

type DownloadListLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
  className?: string;
};

export function DownloadListLink({
  children = "Download List",
  className = "",
  ...props
}: DownloadListLinkProps) {
  return (
    <a
      className={[styles.link, className].filter(Boolean).join(" ")}
      {...props}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <span>{children}</span>
    </a>
  );
}
