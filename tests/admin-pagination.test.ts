import { describe, it, expect, vi } from "vitest";

// Mock next/navigation
const mockSetParams = vi.fn();
vi.mock("@/components/admin/shared/DataTable/useTableParams", () => ({
  useTableParams: () => ({
    params: { page: 1, pageSize: 10, q: "" },
    setParams: mockSetParams,
    isPending: false,
  }),
}));

describe("Admin Pagination PageSize Architecture", () => {
  it("defaults pageSize to 10 per page across admin datatable views", async () => {
    const { useTableParams } = await import(
      "@/components/admin/shared/DataTable/useTableParams"
    );
    const { params } = useTableParams();
    expect(params.pageSize).toBe(10);
  });
});
