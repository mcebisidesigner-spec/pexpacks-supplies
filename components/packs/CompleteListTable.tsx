import type { PackListItem } from "./packListTypes";
import { ItemIcon } from "@/components/ui/ItemIcon";

type CompleteListTableProps = {
  items: PackListItem[];
  label: string;
};

export function CompleteListTable({ items, label }: CompleteListTableProps) {
  if (!items.length) {
    return (
      <p className="m-0 text-pex-muted">
        The complete list is being finalised.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-pex-border rounded-card bg-white/95">
      <table className="w-full border-collapse table-fixed">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="w-[84px] sticky top-0 z-[1] px-4 py-3.5 border-b border-pex-border bg-pex-bg-soft text-pex-navy text-xs font-extrabold text-left max-md:px-3 max-md:text-[12px]"
            >
              Qty
            </th>
            <th
              scope="col"
              className="sticky top-0 z-[1] px-4 py-3.5 border-b border-pex-border bg-pex-bg-soft text-pex-navy text-xs font-extrabold text-left max-md:px-3 max-md:text-[12px]"
            >
              Products
            </th>
            <th
              scope="col"
              className="sticky top-0 z-[1] px-4 py-3.5 border-b border-pex-border bg-pex-bg-soft text-pex-navy text-xs font-extrabold text-left max-md:px-3 max-md:text-[12px]"
            >
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={`${item.id}-${index}`}
              className="border-b border-pex-border/60 last:border-b-0"
            >
              <td className="w-[84px] px-4 py-3 text-pex-navy text-[15px] font-extrabold text-left align-top max-md:px-3 max-md:text-xs">
                {item.quantityLabel ?? item.quantity}
              </td>
              <td className="px-4 py-3 text-pex-navy text-[15px] leading-[1.35] align-top max-md:px-3 max-md:text-xs">
                <div className="inline-flex items-center gap-2.5">
                  <ItemIcon
                    name={item.icon}
                    size={18}
                    className="shrink-0 text-pex-keppel"
                  />
                  <span>{item.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-pex-muted text-sm leading-[1.4] align-top max-md:px-3 max-md:text-xs">
                {item.description?.trim() || item.specification?.trim() || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
