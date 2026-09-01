import { describe, expect, it, vi } from "vitest";
import { createFullTrayPack } from "@/lib/order/createTrayPack";

describe("createFullTrayPack", () => {
  it("does not opt parents into Pexcover automatically", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("test-tray-id");

    const pack = createFullTrayPack({
      packId: "grade-r-pack",
      basePackId: "grade-r-pack",
      packName: "Grade R Stationery Pack",
      items: [
        {
          id: "book-1",
          name: "Exercise Book",
          category: "Books",
          quantity: 2,
          unitPrice: 10,
          requiresPexcover: true,
          pexcoCode: "PEXCO01",
          pexcoRateCents: 950,
          pexcoRateActive: true,
        },
      ],
      totalPrice: 20,
    });

    expect(pack.wantsPexcover).toBe(false);
    expect(pack.items[0]).toMatchObject({
      requiresPexcover: true,
      pexcoCode: "PEXCO01",
    });
  });

  it("uses the authoritative full pack price instead of the item subtotal", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("authoritative-pack-id");

    const pack = createFullTrayPack({
      packId: "grade-r-pack",
      basePackId: "grade-r-pack",
      packName: "Grade R Stationery Pack",
      items: [
        {
          id: "book-1",
          name: "Exercise Book",
          quantity: 2,
          unitPrice: 66.07,
        },
      ],
      totalPrice: 349.19,
    });

    expect(pack.subtotal).toBe(349.19);
    expect(pack.totalPrice).toBe(349.19);
    expect(pack.items[0].lineTotal).toBe(132.14);
  });
});
