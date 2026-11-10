import { useState } from "react";
import type { Order } from "../orderTypes";
import { isOverdue, statusTone } from "../orderTypes";
import { formatDate } from "../../elementStocks/components/ElementStockTable";

interface Props {
  items: Order[];
  positions: Map<number, number>;
  canDrag: boolean;
  onReorder: (dragId: number, targetId: number) => void;
  onView: (item: Order) => void;
  onEdit: (item: Order) => void;
  onDelete: (item: Order) => void;
}

export default function OrderTable({
  items,
  positions,
  canDrag,
  onReorder,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  const resetDrag = () => {
    setDragId(null);
    setOverId(null);
  };

  const dragIndex = items.findIndex((o) => o.id === dragId);
  const overIndex = items.findIndex((o) => o.id === overId);

  return (
    <div className="or-table-wrap">
      <table className="or-table">
        <thead>
          <tr>
            <th className="or-col-handle" aria-label="Drag" />
            <th className="or-col-queue">Queue</th>
            <th>Order No</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Drawing No</th>
            <th>Iron Type</th>
            <th>Delivery Date</th>
            <th>Status</th>
            <th className="or-col-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => {
            const tone = statusTone(item.status);
            const overdue = isOverdue(item);

            const classes = [
              "or-row",
              dragId === item.id ? "is-dragging" : "",
              overId === item.id && dragId !== null && dragId !== item.id
                ? dragIndex < overIndex
                  ? "is-drop-below"
                  : "is-drop-above"
                : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <tr
                key={item.id}
                className={classes}
                draggable={canDrag}
                onClick={() => onView(item)}
                onDragStart={(e) => {
                  setDragId(item.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(item.id));
                }}
                onDragOver={(e) => {
                  if (!canDrag || dragId === null) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (overId !== item.id) setOverId(item.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId !== null && dragId !== item.id) onReorder(dragId, item.id);
                  resetDrag();
                }}
                onDragEnd={resetDrag}
              >
                {/* Drag handle */}
                <td className="or-col-handle">
                  <span
                    className={`or-handle ${canDrag ? "" : "is-disabled"}`}
                    title={canDrag ? "Drag to change queue position" : "Clear search and filters to reorder"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="9" cy="6" r="1.7" />
                      <circle cx="15" cy="6" r="1.7" />
                      <circle cx="9" cy="12" r="1.7" />
                      <circle cx="15" cy="12" r="1.7" />
                      <circle cx="9" cy="18" r="1.7" />
                      <circle cx="15" cy="18" r="1.7" />
                    </svg>
                  </span>
                </td>

                {/* Queue position */}
                <td className="or-col-queue">
                  <span className="or-queue">{positions.get(item.id) ?? index + 1}</span>
                </td>

                {/* Order number */}
                <td>
                  <span className="or-code">{item.order_number}</span>
                </td>

                {/* Customer */}
                <td>
                  {item.aim?.customer ? (
                    <div className="or-customer">
                      <span>{item.aim.customer.customer_name.charAt(0).toUpperCase()}</span>
                      {item.aim.customer.customer_name}
                    </div>
                  ) : (
                    <span className="or-none">Unknown</span>
                  )}
                </td>

                <td className="or-strong">
                  {item.aim?.product?.product_name ?? <span className="or-none">Unknown</span>}
                </td>

                <td>{item.aim?.drawing_no ?? <span className="or-none">-</span>}</td>

                <td>
                  {item.aim?.iron_type ? (
                    <span className="or-iron">
                      <i />
                      {item.aim.iron_type.name}
                    </span>
                  ) : (
                    <span className="or-none">-</span>
                  )}
                </td>

                {/* Delivery date */}
                <td>
                  <div className="or-date">
                    {formatDate(item.customer_delivery_date)}
                    {overdue && <em>Overdue</em>}
                  </div>
                </td>

                {/* Status */}
                <td>
                  <span className={`or-status or-status--${tone}`}>
                    <i />
                    {item.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="or-col-actions" onClick={(e) => e.stopPropagation()}>
                  <div className="or-actions">
                    <button type="button" title="View" onClick={() => onView(item)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button type="button" title="Edit" onClick={() => onEdit(item)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button type="button" title="Delete" className="is-danger" onClick={() => onDelete(item)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M6 6l1 14h10l1-14" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}