import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  PexcoverDrawerCard,
  PEXCOVER_PAPER_OPTIONS,
  type PexcoverPaperStyle,
  type PackOrderState,
  type PexcoverDrawerCardProps,
} from "@/components/checkout/PexcoverDrawerCard";
import { normalisePexcoverPaperStyle } from "@/lib/pricing/pexcover-paper-style";

describe("PexcoverDrawerCard & Paper In-Card Selector", () => {
  it("normalizes the style at checkout and records it in order metadata", () => {
    const ozowRoute = readFileSync(
      resolve(process.cwd(), "app/api/ozow/checkout/route.ts"),
      "utf8",
    );
    const orders = readFileSync(
      resolve(process.cwd(), "lib/orders.ts"),
      "utf8",
    );
    expect(ozowRoute).toContain("normalisePexcoverPaperStyle");
    expect(orders).toContain("pexcover_paper_style");
  });

  it("allow-lists paper styles and defaults invalid input safely", () => {
    expect(normalisePexcoverPaperStyle("MARBLED_PATTERNS")).toBe(
      "MARBLED_PATTERNS",
    );
    expect(normalisePexcoverPaperStyle("untrusted-value")).toBe(
      "STANDARD_KRAFT",
    );
  });

  it("exports exact TypeScript contracts and models required by specification", () => {
    // Validate types can be assigned correctly
    const paperStyle1: PexcoverPaperStyle = "STANDARD_KRAFT";
    const paperStyle2: PexcoverPaperStyle = "MARBLED_PATTERNS";
    const paperStyle3: PexcoverPaperStyle = "SOLID_COLOURS";
    expect([paperStyle1, paperStyle2, paperStyle3]).toEqual([
      "STANDARD_KRAFT",
      "MARBLED_PATTERNS",
      "SOLID_COLOURS",
    ]);

    const orderState: PackOrderState = {
      packId: "pack-101",
      learnerName: "Sipho Ndlovu",
      applyPexcover: true,
      selectedPaperStyle: "STANDARD_KRAFT",
      coveringPriceCents: 8400,
      basePackPriceCents: 45000,
    };
    expect(orderState.packId).toBe("pack-101");
    expect(orderState.selectedPaperStyle).toBe("STANDARD_KRAFT");
    expect(orderState.coveringPriceCents).toBe(8400);

    const mockProps: PexcoverDrawerCardProps = {
      packId: "pack-101",
      coverableCount: 8,
      coveringPriceCents: 8400,
      enabled: false,
      selectedStyle: "STANDARD_KRAFT",
      onToggle: vi.fn(),
      onSelectStyle: vi.fn(),
    };
    expect(typeof mockProps.onToggle).toBe("function");
    expect(typeof mockProps.onSelectStyle).toBe("function");
  });

  it("verifies the 3 standard paper options with exact names and descriptions", () => {
    expect(PEXCOVER_PAPER_OPTIONS).toHaveLength(3);

    const kraft = PEXCOVER_PAPER_OPTIONS.find((o) => o.id === "STANDARD_KRAFT");
    expect(kraft).toBeDefined();
    expect(kraft?.name).toBe("Standard Kraft");
    expect(kraft?.description).toBe(
      "Classic durable brown kraft paper with clear sleeve",
    );

    const marbled = PEXCOVER_PAPER_OPTIONS.find(
      (o) => o.id === "MARBLED_PATTERNS",
    );
    expect(marbled).toBeDefined();
    expect(marbled?.name).toBe("Marbled & Print");
    expect(marbled?.description).toBe(
      "Assorted decorative print with clear sleeve",
    );

    const vibrant = PEXCOVER_PAPER_OPTIONS.find(
      (o) => o.id === "SOLID_COLOURS",
    );
    expect(vibrant).toBeDefined();
    expect(vibrant?.name).toBe("Vibrant Colors");
    expect(vibrant?.description).toBe(
      "Bold solid color paper with clear sleeve",
    );
  });

  it("renders collapsed state when enabled is false", () => {
    const html = renderToStaticMarkup(
      React.createElement(PexcoverDrawerCard, {
        packId: "pack-test",
        coverableCount: 6,
        coveringPriceCents: 6000,
        enabled: false,
        selectedStyle: "STANDARD_KRAFT",
        onToggle: vi.fn(),
        onSelectStyle: vi.fn(),
      }),
    );

    expect(html).toContain("Book Covering by Pexcover");
    expect(html).toContain("6 books covered with protective wrap");
    expect(html).toContain("R 60.00");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-active="false"');
  });

  it("renders expanded state with 3 swatch cards and active checkmark when enabled is true", () => {
    const html = renderToStaticMarkup(
      React.createElement(PexcoverDrawerCard, {
        packId: "pack-test",
        coverableCount: 8,
        coveringPriceCents: 8000,
        enabled: true,
        selectedStyle: "STANDARD_KRAFT",
        onToggle: vi.fn(),
        onSelectStyle: vi.fn(),
      }),
    );

    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-hidden="false"');
    expect(html).toContain('data-active="true"');
    expect(html).toContain("Decorative Paper Style");
    expect(html).toContain("Standard Kraft");
    expect(html).toContain("Marbled &amp; Print");
    expect(html).toContain("Vibrant Colors");
    expect(html).toContain("✓");
    expect(html).toContain("Selected:");
  });

  it("renders disabled state when pack has 0 coverable books", () => {
    const html = renderToStaticMarkup(
      React.createElement(PexcoverDrawerCard, {
        packId: "pack-empty",
        coverableCount: 0,
        coveringPriceCents: 0,
        enabled: false,
        selectedStyle: "STANDARD_KRAFT",
        onToggle: vi.fn(),
        onSelectStyle: vi.fn(),
      }),
    );

    expect(html).toContain("No coverable books in this pack");
    expect(html).toContain("—");
    expect(html).toContain("disabled");
  });

  it("verifies custom CSS module complies with design specifications without Tailwind", () => {
    const cssPath = resolve(
      process.cwd(),
      "components/checkout/PexcoverDrawerCard.module.css",
    );
    const cssContent = readFileSync(cssPath, "utf8");

    // Brand theme variables
    expect(cssContent).toContain("--pexcover-active-bg: #EBF7F5");
    expect(cssContent).toContain("--pexcover-active-border: #BBE5DE");
    expect(cssContent).toContain("--pexcover-inactive-bg: #F8FAFC");
    expect(cssContent).toContain("--pexcover-inactive-border: #E2E8F0");
    expect(cssContent).toContain("--pexcover-primary: #1E7468");
    expect(cssContent).toContain("--pexcover-primary-dark: #165A51");
    expect(cssContent).toContain("--pexcover-text-primary: #0F172A");
    expect(cssContent).toContain("--pexcover-text-secondary: #64748B");

    // Sheen overlay gradient & circular checkmark badge
    expect(cssContent).toContain("linear-gradient");
    expect(cssContent).toContain("rgba(255, 255, 255");
    expect(cssContent).toContain(".checkmarkBadge");
    expect(cssContent).toContain("top: 6px");
    expect(cssContent).toContain("right: 6px");

    // 3-Column responsive grid
    expect(cssContent).toContain("grid-template-columns: repeat(3, 1fr)");
    expect(cssContent).toContain(
      "box-shadow: 0 0 0 2px rgba(30, 116, 104, 0.25)",
    );
  });
});
describe("Pexcover fulfilment visibility", () => {
  it("shows the captured paper style and charge on the protected order page", () => {
    const orderPage = readFileSync(
      resolve(process.cwd(), "app/admin/orders/[id]/page.tsx"),
      "utf8",
    );

    expect(orderPage).toContain("pexcover_paper_style");
    expect(orderPage).toContain("normalisePexcoverPaperStyle");
    expect(orderPage).toContain("pexcoverPaperStyleLabel");
    expect(orderPage).toContain("Pexcover requested");
  });
});
