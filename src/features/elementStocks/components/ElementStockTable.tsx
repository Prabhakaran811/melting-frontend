import type { ElementStock } from "../elementStockTypes";

interface Props {
  items: ElementStock[];
  onEdit: (item: ElementStock) => void;
  onDelete: (item: ElementStock) => void;
}

// "2026-11-05" -> "05 Nov 2026" (no timezone shifting)
export function formatDate(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatNumber(value: number | string, decimals: number): string {
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function ElementStockTable({ items, onEdit, onDelete }: Props) {
  return (
    <div className="es-table-wrap">
      <table className="es-table">
        <thead>
          <tr>
            <th>Element</th>
            <th>Supplier</th>
            <th className="es-num">Quantity (kg)</th>
            <th>Received Date</th>
            <th>Pickup %</th>
            <th className="es-num">Rate / kg</th>
            <th className="es-col-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const pickup = Math.min(100, Math.max(0, Number(item.pickup_percentage)));

            return (
              <tr key={item.id}>
                {/* Element */}
                <td>
                  {item.element ? (
                    <span className="es-element">
                      <b>{item.element.abbreviation}</b>
                      {item.element.name}
                    </span>
                  ) : (
                    <span className="es-none">Unknown</span>
                  )}
                </td>

                {/* Supplier */}
                <td>
                  {item.supplier ? (
                    <div className="es-supplier">
                      <span>{item.supplier.name.charAt(0).toUpperCase()}</span>
                      {item.supplier.name}
                    </div>
                  ) : (
                    <span className="es-none">Unknown</span>
                  )}
                </td>

                {/* Quantity */}
                <td className="es-num es-strong">{formatNumber(item.quantity, 3)}</td>

                {/* Received date */}
                <td>{formatDate(item.received_date)}</td>

                {/* Pickup */}
                <td>
                  <div className="es-pickup">
                    <div className="es-pickup__bar">
                      <i style={{ width: `${pickup}%` }} />
                    </div>
                    <span>{formatNumber(item.pickup_percentage, 2)}%</span>
                  </div>
                </td>

                {/* Rate */}
                <td className="es-num es-strong">{formatNumber(item.rate_per_kg, 2)}</td>

                {/* Actions */}
                <td className="es-col-actions">
                  <div className="es-actions">
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