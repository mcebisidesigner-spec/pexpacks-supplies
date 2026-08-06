import React from "react";

type ItemIconProps = {
  name?: string;
  className?: string;
  size?: number;
};

export function ItemIcon({ name, className = "", size = 24 }: ItemIconProps) {
  const iconProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (name) {
    case "notebook":
      return (
        <svg {...iconProps}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "crayon":
    case "pencil":
      return (
        <svg {...iconProps}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      );
    case "pen":
      return (
        <svg {...iconProps}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          <path d="m15 5 4 4" />
        </svg>
      );
    case "glue":
      return (
        <svg {...iconProps}>
          <rect x="7" y="5" width="10" height="14" rx="2" />
          <path d="M10 5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
          <path d="M10 19v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2" />
        </svg>
      );
    case "scissors":
      return (
        <svg {...iconProps}>
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
      );
    case "ruler":
      return (
        <svg {...iconProps}>
          <path d="M21.3 15.3l-13.6-13.6a2 2 0 0 0-2.8 0l-2.8 2.8a2 2 0 0 0 0 2.8l13.6 13.6a2 2 0 0 0 2.8 0l2.8-2.8a2 2 0 0 0 0-2.8z" />
          <path d="M14.5 5.5l2 2" />
          <path d="M10.5 9.5l2 2" />
          <path d="M6.5 13.5l2 2" />
        </svg>
      );
    case "eraser":
      return (
        <svg {...iconProps}>
          <path d="M21.3 15.3l-13.6-13.6a2 2 0 0 0-2.8 0l-2.8 2.8a2 2 0 0 0 0 2.8l13.6 13.6a2 2 0 0 0 2.8 0l2.8-2.8a2 2 0 0 0 0-2.8z" />
          <path d="M5 11l9 9" />
        </svg>
      );
    case "sharpener":
      return (
        <svg {...iconProps}>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <circle cx="12" cy="10" r="3" />
          <path d="M12 15v1" />
        </svg>
      );
    case "highlighter":
      return (
        <svg {...iconProps}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          <path d="m15 5 4 4" />
          <path d="m9 11 4 4" />
        </svg>
      );
    case "pad":
      return (
        <svg {...iconProps}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M9 7h6" />
          <path d="M9 11h6" />
          <path d="M9 15h6" />
        </svg>
      );
    case "calculator":
      return (
        <svg {...iconProps}>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8" />
          <path d="M16 14v4" />
          <path d="M8 10h.01" />
          <path d="M12 10h.01" />
          <path d="M16 10h.01" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M8 18h.01" />
          <path d="M12 18h.01" />
        </svg>
      );
    case "file":
      return (
        <svg {...iconProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <circle cx="10" cy="13" r="1" />
          <circle cx="10" cy="17" r="1" />
        </svg>
      );
    case "box":
      return (
        <svg {...iconProps}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
  }
}
