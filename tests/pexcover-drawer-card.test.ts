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

  it("verifies component complies with design specifications in Tailwind v4", () => {
    const componentPath = resolve(
      process.cwd(),
      "components/checkout/PexcoverDrawerCard.tsx",
    );
    const content = readFileSync(componentPath, "utf8");

    // Brand theme styling
    expect(content).toContain("#EBF7F5");
    expect(content).toContain("#BBE5DE");
    expect(content).toContain("bg-slate-50");
    expect(content).toContain("border-slate-200");
    expect(content).toContain("pex-keppel");

    // Sheen overlay gradient & circular checkmark badge / round checkbox
    expect(content).toContain("linear-gradient");
    expect(content).toContain("rgba(255, 255, 255");
    expect(content).toContain("top-1.5");
    expect(content).toContain("right-1.5");

    // 3-Column responsive grid
    expect(content).toContain("grid-cols-3");
    expect(content).toContain("ring-pex-keppel/25");
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
describe("Pexcover fulfilment instructions", () => {
  it("reads only the stored paid pack snapshot on the protected fulfilment page", () => {
    const fulfilmentPage = readFileSync(
      resolve(process.cwd(), "app/admin/fulfilment/[orderNumber]/page.tsx"),
      "utf8",
    );

    expect(fulfilmentPage).toContain("Pexcover covering instructions");
    expect(fulfilmentPage).toContain("metadata.packs");
    expect(fulfilmentPage).toContain("normalisePexcoverPaperStyle");
    expect(fulfilmentPage).toContain("pexcoverPaperStyleLabel");
  });
});
