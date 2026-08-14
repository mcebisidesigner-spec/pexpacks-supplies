"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import shared from "@/app/admin/schools/schools.module.css";

interface ItemFilterFormProps {
  initialSearch: string;
  inventoryItems: string[];
  hasFilters: boolean;
}

export function ItemFilterForm({
  initialSearch,
  inventoryItems,
  hasFilters,
}: ItemFilterFormProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(initialSearch);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchValue.trim();
    if (query) {
      router.push(`/admin/items?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/admin/items");
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSearchValue(selected);
    if (selected.trim()) {
      router.push(`/admin/items?search=${encodeURIComponent(selected.trim())}`);
    } else {
      router.push("/admin/items");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={shared.filterForm}>
      <input
        type="search"
        name="search"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search item name or description…"
        className={`${shared.filterInput} ${shared.searchInput}`}
        aria-label="Search items"
      />
      <select
        value={searchValue}
        onChange={handleSelectChange}
        className={shared.filterInput}
        aria-label="Filter stationery items"
      >
        <option value="">All Stationery Items</option>
        {inventoryItems.map((itemName) => (
          <option key={itemName} value={itemName}>
            {itemName}
          </option>
        ))}
      </select>
      <button type="submit" className={shared.applyButton}>
        Apply
      </button>
      {hasFilters ? (
        <Link href="/admin/items" className={shared.resetLink}>
          Reset
        </Link>
      ) : null}
    </form>
  );
}
