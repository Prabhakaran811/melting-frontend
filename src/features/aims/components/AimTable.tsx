import { Fragment } from "react";
import type { Element } from "../../elements/elementTypes";
import type { Aim } from "../aimTypes";
import { formatNumber } from "../../elementStocks/components/ElementStockTable";

interface Props {
  items: Aim[];
  elements: Element[];
  expandedIds: number[];
  onToggle: (id: number) => void;
  onEdit: (item: Aim) => void;
  onDelete: (item: Aim) => void;
}

const COLUMN_COUNT = 13;

export default function AimTable({
  items,
  elements,
  expandedIds,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  // Used to show the element specs in sequence order
  const orderOf = (elementId: number | undefined) =>
    elements.find((e) => e.id === elementId)?.sequence_order ?? 9999;

  return (
    <div className="as-table-wrap">
      <table className="as-table">
        <thead>
          <tr>
            <th className="as-col-toggle" aria-label="Expand" />
            <th>Customer</th>
            <th>Product</th>
            <th>Drawing No</th>
            <th>Iron Type</th>
            <th>Packing</th>
            <th>Hardness</th>
            <th>Inoculant</th>
            <th className="as-num">Pouring Wt (kg)</th>
            <th className="as-num">Casting Wt (kg)</th>
            <th className="as-num">Castings</th>
            <th className="as-num">Cavities</th>
            <th className="as-col-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const isOpen = expandedIds.includes(item.id);
            const specs = [...(item.elements ?? [])].sort(
              (a, b) =>
                orderOf(a.element?.id ?? a.element_id) -
                orderOf(b.element?.id ?? b.element_id)
            );

            return (
              <Fragment key={item.id}>
                {/* Main row */}
                <tr className={isOpen ? "is-open" : ""}>
                  <td className="as-col-toggle">
                    <button
                      type="button"
                      className={`as-toggle ${isOpen ? "is-open" : ""}`}
                      onClick={() => onToggle(item.id)}
                      aria-expanded={isOpen}
                      title={isOpen ? "Hide specification" : "Show specification"}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </button>
                  </td>

                  <td>
                    {item.customer ? (
                      <div className="as-customer">
                        <span>{item.customer.customer_name.charAt(0).toUpperCase()}</span>
                        {item.customer.customer_name}
                      </div>
                    ) : (
                      <span className="as-none">Unknown</span>
                    )}
                  </td>

                  <td className="as-strong">{item.product?.product_name ?? <span className="as-none">Unknown</span>}</td>

                  <td>
                    <span className="as-code">{item.drawing_no}</span>
                  </td>

                  <td>
                    {item.iron_type ? (
                      <span className="as-iron">
                        <i />
                        {item.iron_type.name}
                      </span>
                    ) : (
                      <span className="as-none">Unknown</span>
                    )}
                  </td>

                  <td>{item.packing?.name ?? <span className="as-none">-</span>}</td>
                  <td>{item.hardness?.hardness_name ?? <span className="as-none">-</span>}</td>
                  <td>{item.inoculant?.name ?? <span className="as-none">-</span>}</td>

                  <td className="as-num as-strong">{formatNumber(item.pouring_weight_kg, 3)}</td>
                  <td className="as-num as-strong">{formatNumber(item.casting_weight_kg, 3)}</td>
                  <td className="as-num">{item.no_of_casting}</td>
                  <td className="as-num">{item.no_of_cavity}</td>

                  <td className="as-col-actions">
                    <div className="as-actions">
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

                {/* Nested row: chemical specification */}
                {isOpen && (
                  <tr className="as-nested">
                    <td colSpan={COLUMN_COUNT}>
                      <div className="as-nested__box">
                        <div className="as-nested__title">
                          Chemical specification
                          <span>
                            {specs.length} element{specs.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        {specs.length === 0 ? (
                          <p className="as-none">No element specification saved.</p>
                        ) : (
                          <table className="as-sub">
                            <thead>
                              <tr>
                                <th>Element</th>
                                <th className="as-num">Exact (%)</th>
                                <th className="as-num">Plus (+)</th>
                                <th className="as-num">Minus (−)</th>
                                <th className="as-num">Allowed range (%)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {specs.map((s) => {
                                const exact = Number(s.exact_value);
                                const low = exact - Number(s.minus_value);
                                const high = exact + Number(s.plus_value);

                                return (
                                  <tr key={s.id}>
                                    <td>
                                      <span className="as-element">
                                        <b>{s.element?.abbreviation ?? "?"}</b>
                                        {s.element?.name ?? "Unknown"}
                                      </span>
                                    </td>
                                    <td className="as-num as-strong">{formatNumber(exact, 2)}</td>
                                    <td className="as-num as-plus">+{formatNumber(s.plus_value, 2)}</td>
                                    <td className="as-num as-minus">−{formatNumber(s.minus_value, 2)}</td>
                                    <td className="as-num">
                                      <span className="as-range">
                                        {formatNumber(low, 2)} – {formatNumber(high, 2)}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}