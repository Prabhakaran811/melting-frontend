import type { Element } from "../../elements/elementTypes";
import type { RawMaterialStock, StockElementPercentage } from "../rawMaterialStockTypes";
import { formatDate, formatNumber } from "../../elementStocks/components/ElementStockTable";

interface Props {
  items: RawMaterialStock[];
  elements: Element[];
  onEdit: (item: RawMaterialStock) => void;
  onDelete: (item: RawMaterialStock) => void;
}

export default function RawMaterialStockTable({ items, elements, onEdit, onDelete }: Props) {
  // Use nested element details if the API sends them, otherwise look them up
  const resolveElement = (p: StockElementPercentage) => {
    const found = elements.find((e) => e.id === p.element_id);
    return {
      abbreviation: p.element?.abbreviation ?? found?.abbreviation ?? "?",
      name: p.element?.name ?? found?.name ?? `Element #${p.element_id}`,
      order: found?.sequence_order ?? 9999,
    };
  };

  return (
    <div className="rs-table-wrap">
      <table className="rs-table">
        <thead>
          <tr>
            <th>Raw Material</th>
            <th>Supplier</th>
            <th className="rs-num">Quantity (kg)</th>
            <th>Received Date</th>
            <th className="rs-num">Rate / kg</th>
            <th>Element %</th>
            <th className="rs-col-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const percentages = [...(item.element_percentages ?? [])]
              .map((p) => ({ p, el: resolveElement(p) }))
              .sort((a, b) => a.el.order - b.el.order);

            return (
              <tr key={item.id}>
                {/* Raw material */}
                <td>
                  {item.raw_material ? (
                    <div className="rs-name">
                      <div className="rs-name__icon">{item.raw_material.name.charAt(0).toUpperCase()}</div>
                      <strong>{item.raw_material.name}</strong>
                    </div>
                  ) : (
                    <span className="rs-none">Unknown</span>
                  )}
                </td>

                {/* Supplier */}
                <td>
                  {item.supplier ? (
                    <div className="rs-supplier">
                      <span>{item.supplier.name.charAt(0).toUpperCase()}</span>
                      {item.supplier.name}
                    </div>
                  ) : (
                    <span className="rs-none">Unknown</span>
                  )}
                </td>

                {/* Quantity */}
                <td className="rs-num rs-strong">{formatNumber(item.quantity, 3)}</td>

                {/* Received date */}
                <td className="rs-nowrap">{formatDate(item.received_date)}</td>

                {/* Rate */}
                <td className="rs-num rs-strong">{formatNumber(item.rate_per_kg, 2)}</td>

                {/* Element percentages */}
                <td>
                  <div className="rs-chips">
                    {percentages.length === 0 ? (
                      <span className="rs-none">No elements</span>
                    ) : (
                      percentages.map(({ p, el }) => (
                        <span className="rs-pct" key={p.element_id} title={el.name}>
                          <b>{el.abbreviation}</b>
                          {formatNumber(p.percentage, 2)}%
                        </span>
                      ))
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="rs-col-actions">
                  <div className="rs-actions">
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