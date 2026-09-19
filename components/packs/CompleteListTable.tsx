import type { PackListItem } from "./packListTypes";
import { ItemIcon } from "@/components/ui/ItemIcon";

type CompleteListTableProps = {
  items: PackListItem[];
  label: string;
};

export function CompleteListTable({ items, label }: CompleteListTableProps) {
  if (!items.length) {
    return (
      <p className="m-0 text-[var(--pex-text-muted)]">
        The complete list is being finalised.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-[rgba(225,231,234,0.82)] rounded-[var(--radius-card)] bg-[rgba(255,255,255,0.96)]">
      <table className="w-full border-collapse table-fixed">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="w-[84px] sticky top-0 z-[1] px-[var(--space-4)] py-[14px] border-b border-b-[rgba(225,231,234,0.92)] bg-[#f4f8fa] text-[var(--pex-primary)] text-[var(--text-2xs)] font-extrabold text-left max-md:px-[var(--space-3)] max-md:text-[12px]"
            >
              Qty
            </th>
            <th
              scope="col"
              className="sticky top-0 z-[1] px-[var(--space-4)] py-[14px] border-b border-b-[rgba(225,231,234,0.92)] bg-[#f4f8fa] text-[var(--pex-primary)] text-[var(--text-2xs)] font-extrabold text-left max-md:px-[var(--space-3)] max-md:text-[12px]"
            >
              Products
            </th>
            <th
              scope="col"
              className="sticky top-0 z-[1] px-[var(--space-4)] py-[14px] border-b border-b-[rgba(225,231,234,0.92)] bg-[#f4f8fa] text-[var(--pex-primary)] text-[var(--text-2xs)] font-extrabold text-left max-md:px-[var(--space-3)] max-md:text-[12px]"
            >
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={`${item.id}-${index}`}
              className="border-b border-b-[rgba(225,231,234,0.78)] last:border-b-0"
            >
              <td className="w-[84px] px-[var(--space-4)] py-[13px] text-[var(--pex-primary)] text-[15px] font-extrabold text-left align-top max-md:px-[var(--space-3)] max-md:text-[var(--text-2xs)]">
                {item.quantityLabel ?? item.quantity}
              </td>
              <td className="px-[var(--space-4)] py-[13px] text-[var(--pex-text)] text-[15px] leading-[1.35] align-top max-md:px-[var(--space-3)] max-md:text-[var(--text-2xs)]">
                <div className="inline-flex items-center gap-[10px]">
                  <ItemIcon
                    name={item.icon}
                    size={18}
                    className="shrink-0 text-[var(--pex-keppel,#10b981)]"
                  />
                  <span>{item.name}</span>
                </div>
              </td>
              <td className="px-[var(--space-4)] py-[13px] text-[var(--pex-text-muted)] text-[var(--text-sm)] leading-[1.4] align-top max-md:px-[var(--space-3)] max-md:text-[var(--text-2xs)]">
                {item.description?.trim() || item.specification?.trim() || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
