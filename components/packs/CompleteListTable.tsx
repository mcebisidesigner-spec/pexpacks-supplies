import type { PackListItem } from "./packListTypes";
import { ItemIcon } from "@/components/ui/ItemIcon";
import styles from "./CompleteListTable.module.css";

type CompleteListTableProps = {
  items: PackListItem[];
  label: string;
};

export function CompleteListTable({ items, label }: CompleteListTableProps) {
  if (!items.length) {
    return (
      <p className={styles.empty}>The complete list is being finalised.</p>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.quantityHeading}>
              Qty
            </th>
            <th scope="col">Item</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.id}-${index}`}>
              <td className={styles.quantity}>
                {item.quantityLabel ?? item.quantity}
              </td>
              <td className={styles.itemName}>
                <div className={styles.itemWithIcon}>
                  <ItemIcon name={item.icon} size={18} className={styles.itemIcon} />
                  <span>{item.name}</span>
                </div>
              </td>
              <td className={styles.specification}>
                {item.description?.trim() || item.specification?.trim() || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
