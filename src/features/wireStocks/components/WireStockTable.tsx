import type { WireStock } from "../wireStockTypes";
import { formatNumber } from "../../elementStocks/components/ElementStockTable";

interface Props {
  items: WireStock[];
  onEdit: (item: WireStock) => void;
  onDelete: (item: WireStock) => void;
}

export default function WireStockTable({ items, onEdit, onDelete }: Props) {
  return (
    <div className="ws-table-wrap">
      <table className="ws-table">
        <thead>
          <tr>
            <th>Wire</th>
            <th>Supplier</th>
            <th className="ws-num">Powder Wt / m (g)</th>
            <th className="ws-num">Quantity (m)</th>
            <th className="ws-num">Rate / m</th>
            <th className="ws-col-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {/* Wire */}
              <td>
                {item.wire ? (
                  <div className="ws-name">
                    <div className="ws-name__icon">{item.wire.name.charAt(0).toUpperCase()}</div>
                    <strong>{item.wire.name}</strong>
                  </div>
                ) : (
                  <span className="ws-none">Unknown</span>
                )}
              </td>

              {/* Supplier */}
              <td>
                {item.supplier ? (
                  <div className="ws-supplier">
                    <span>{item.supplier.name.charAt(0).toUpperCase()}</span>
                    {item.supplier.name}
                  </div>
                ) : (
                  <span className="ws-none">Unknown</span>
                )}
              </td>

              {/* Powder weight */}
              <td className="ws-num">
                <span className="ws-powder">{formatNumber(item.powder_weight_per_meter, 3)}</span>
              </td>

              {/* Quantity */}
              <td className="ws-num ws-strong">{formatNumber(item.quantity, 3)}</td>

              {/* Rate */}
              <td className="ws-num ws-strong">{formatNumber(item.rate_per_meter, 2)}</td>

              {/* Actions */}
              <td className="ws-col-actions">
                <div className="ws-actions">
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
          ))}
        </tbody>
      </table>
    </div>
  );
}