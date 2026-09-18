import React from "react";
import "@/styles/admin-dark.css";
import "@/styles/db-tokens.css";

export interface PreviewConfig {
  parameters?: {
    actions?: { argTypesRegex?: string };
    controls?: {
      matchers?: {
        color?: RegExp;
        date?: RegExp;
      };
    };
    backgrounds?: {
      default?: string;
      values?: Array<{ name: string; value: string }>;
    };
  };
  decorators?: Array<(Story: React.ComponentType) => React.ReactNode>;
}

const preview: PreviewConfig = {
  parameters: {
    backgrounds: {
      default: "admin-dark",
      values: [
        { name: "admin-dark", value: "#0c1322" },
        { name: "admin-card", value: "#141e33" },
        { name: "white", value: "#ffffff" },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-[var(--db-surface,#0c1322)] text-[var(--a-text,#f8fafc)] min-h-[200px] font-sans">
        <Story />
      </div>
    ),
  ],
};

export default preview;
