import type { PackListItem } from "./packListTypes";
import styles from "./CompleteListTable.module.css";

type CompleteListTableProps = {
  items: PackListItem[];
  label: string;
};

function splitIntoColumns(items: PackListItem[]) {
  if (items.length <= 6) {
    return [items];
  }

  const splitIndex = Math.ceil(items.length / 2);
  return [items.slice(0, splitIndex), items.slice(splitIndex)];
}

export function CompleteListTable({ items, label }: CompleteListTableProps) {
  const columns = splitIntoColumns(items);

  if (!items.length) {
    return (
      <p className={styles.empty}>The complete list is being finalised.</p>
    );
  }

  return (
    <div
      className={[
        styles.tableGrid,
        columns.length === 1 ? styles.singleColumn : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {columns.map((column, columnIndex) => (
        <table className={styles.table} key={columnIndex}>
          <caption className="sr-only">
            {label}
            {columns.length > 1 ? `, column ${columnIndex + 1}` : ""}
          </caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {column.map((item, index) => (
              <tr key={`${item.id}-${columnIndex}-${index}`}>
                <td className={styles.itemName}>
                  <span>{item.name}</span>
                  {item.specification ? (
                    <small>{item.specification}</small>
                  ) : null}
                </td>
                <td className={styles.quantity}>
                  {item.quantityLabel ?? item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}
