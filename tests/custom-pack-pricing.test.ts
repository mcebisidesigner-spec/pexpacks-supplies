import { describe, expect, it } from "vitest";
import { calculateCustomPackTotal } from "@/lib/packs/calculatePackTotal";
import type { PackSelectionItem } from "@/lib/packs/types";

describe("Custom Pack Pricing Formula & Gross Margin Target Contract", () => {
  // Primrose Hill Grade R Pack representation from live database:
  // pack.price = 413.13, margin_rate = 0.38, fixed costs (packaging 60 + assembly 90 + freight 50) = 200
  const sampleItems: PackSelectionItem[] = [
    {
      id: "item-1",
      name: "College Exercise Unruled",
      requiredQuantity: 1,
      selectedQuantity: 1,
      unitPrice: 22.86,
      selected: true,
    },
    {
      id: "item-2",
      name: "Pencil Case Small",
      requiredQuantity: 1,
      selectedQuantity: 1,
      unitPrice: 25.71,
      selected: true,
    },
    {
      id: "item-3",
      name: "Plastic Envelope Stud",
      requiredQuantity: 1,
      selectedQuantity: 1,
      unitPrice: 5.0,
      selected: true,
    },
    {
      id: "item-4",
      name: "Chair Bag Small",
      requiredQuantity: 1,
      selectedQuantity: 1,
      unitPrice: 78.57,
      selected: true,
    },
  ];

  const pricingOptions = {
    fullPackPrice: 413.13,
    marginRate: 0.38,
    fixedPackCost: 200.0,
  };

  it("maintains the authoritative full pack price of R413,13 on full pack selection", () => {
    const total = calculateCustomPackTotal(sampleItems, pricingOptions);
    expect(total).toBe(413.13);
  });

  it("calculates accurate price with gross margin target when adding an item (does not drop to R155)", () => {
    // When adding 1 more College Exercise Unruled (qty 1 -> 2)
    const modifiedItems = sampleItems.map((item) =>
      item.id === "item-1" ? { ...item, selectedQuantity: 2 } : item,
    );

    const total = calculateCustomPackTotal(modifiedItems, pricingOptions);

    // Selected item subtotal: 132.14 + 22.86 = 155.00
    // After 38% margin target: 155.00 / (1 - 0.38) = 250.00
    // With fixed pack costs (packaging 60 + assembly 90 + freight 50 = 200):
    // 250.00 + 200.00 = 450.00
    expect(total).toBe(450.0);
    expect(total).not.toBe(155.0);
  });

  it("accurately minuses the item cost price adjusted for gross margin when removing an item", () => {
    // When unticking College Exercise Unruled (qty 1 -> 0, selected: false)
    const modifiedItems = sampleItems.map((item) =>
      item.id === "item-1" ? { ...item, selectedQuantity: 0, selected: false } : item,
    );

    const total = calculateCustomPackTotal(modifiedItems, pricingOptions);

    // Selected item subtotal: 132.14 - 22.86 = 109.28
    // After 38% margin target: 109.28 / 0.62 = 176.26
    // With fixed pack costs: 176.26 + 200.00 = 376.26
    expect(total).toBe(376.26);
    expect(total).toBeLessThan(413.13);
  });

  it("returns 0 when all items are unticked", () => {
    const allUnticked = sampleItems.map((item) => ({
      ...item,
      selected: false,
      selectedQuantity: 0,
    }));

    const total = calculateCustomPackTotal(allUnticked, pricingOptions);
    expect(total).toBe(0);
  });

  it("derives fixed pack costs when marginRate and fullPackPrice are present but fixedPackCost is omitted", () => {
    const optionsWithoutFixedCost = {
      fullPackPrice: 413.13,
      marginRate: 0.38,
    };

    const modifiedItems = sampleItems.map((item) =>
      item.id === "item-1" ? { ...item, selectedQuantity: 2 } : item,
    );

    const total = calculateCustomPackTotal(modifiedItems, optionsWithoutFixedCost);
    expect(total).toBe(450.0);
  });
});
