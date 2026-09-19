import React, { useState } from "react";
import { AdminToolbar } from "../ui/AdminToolbar";
import { AdminSearch } from "../ui/AdminSearch";
import { AdminFilterBar } from "../ui/AdminFilterBar";
import { AdminButton } from "../ui/AdminButton";
import { Plus, Download } from "lucide-react";

export default {
  title: "Admin/Compound/AdminToolbar",
  component: AdminToolbar,
};

export function DefaultComposite() {
  const [search, setSearch] = useState("");
  const [chips, setChips] = useState([
    { id: "stock", label: "Status", value: "In Stock" },
    { id: "cat", label: "Category", value: "Stationery" },
  ]);

  const activeChips = chips.map((c) => ({
    ...c,
    onRemove: () => setChips((prev) => prev.filter((item) => item.id !== c.id)),
  }));

  return (
    <div className="flex flex-col gap-4">
      <AdminToolbar
        left={
          <div className="flex items-center gap-3 flex-wrap">
            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Search catalog by title, SKU, or brand…"
              className="w-72"
            />
            <AdminFilterBar
              chips={activeChips}
              onClearAll={() => setChips([])}
            />
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <AdminButton variant="secondary" size="md" icon={<Download size={14} />}>
              Export
            </AdminButton>
            <AdminButton variant="primary" size="md" icon={<Plus size={14} />}>
              New Product
            </AdminButton>
          </div>
        }
      />
    </div>
  );
}
