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
});
