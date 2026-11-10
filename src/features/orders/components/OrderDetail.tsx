import { useEffect } from "react";
import { useGetOrderByIdQuery } from "../orderApi";
import type { Order } from "../orderTypes";
import { isOverdue, statusTone } from "../orderTypes";
import { formatDate, formatNumber } from "../../elementStocks/components/ElementStockTable";

interface Props {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetail({ open, order, onClose }: Props) {
  // Fetch the complete order (with Aim specifications) when opened
  const { data, isFetching, isError } = useGetOrderByIdQuery(order?.id ?? 0, {
    skip: !open || !order,
  });

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const current = data ?? order;
  const aim = current?.aim ?? null;
  const specs = aim?.elements ?? [];

  return (
    <>
      <div className={`es-overlay ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`es-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="es-drawer__head">
          <div>
            <h2>{current?.order_number ?? "Order"}</h2>
            <p>Order details and aim specification</p>
          </div>
          <button type="button" className="es-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        {current && (
          <div className="or-detail">
            {/* Summary */}
            <div className="or-detail__top">
              <span className={`or-status or-status--${statusTone(current.status)}`}>
                <i />
                {current.status}
              </span>
              <div className="or-date">
                Delivery {formatDate(current.customer_delivery_date)}
                {isOverdue(current) && <em>Overdue</em>}
              </div>
            </div>

            {/* Aim details */}
            <div className="or-detail__grid">
              <div><span>Customer</span><strong>{aim?.customer?.customer_name ?? "-"}</strong></div>
              <div><span>Product</span><strong>{aim?.product?.product_name ?? "-"}</strong></div>
              <div><span>Drawing no</span><strong>{aim?.drawing_no ?? "-"}</strong></div>
              <div><span>Iron type</span><strong>{aim?.iron_type?.name ?? "-"}</strong></div>
              <div><span>Packing</span><strong>{aim?.packing?.name ?? "-"}</strong></div>
              <div><span>Hardness</span><strong>{aim?.hardness?.hardness_name ?? "-"}</strong></div>
              <div><span>Inoculant</span><strong>{aim?.inoculant?.name ?? "-"}</strong></div>
              <div>
                <span>Pouring wt (kg)</span>
                <strong>{aim?.pouring_weight_kg !== undefined ? formatNumber(aim.pouring_weight_kg, 3) : "-"}</strong>
              </div>
              <div>
                <span>Casting wt (kg)</span>
                <strong>{aim?.casting_weight_kg !== undefined ? formatNumber(aim.casting_weight_kg, 3) : "-"}</strong>
              </div>
              <div><span>No. of casting</span><strong>{aim?.no_of_casting ?? "-"}</strong></div>
              <div><span>No. of cavity</span><strong>{aim?.no_of_cavity ?? "-"}</strong></div>
            </div>

            {/* Specification */}
            <div className="or-detail__title">Chemical specification</div>

            {isFetching && specs.length === 0 ? (
              <p className="or-note">Loading specification...</p>
            ) : isError ? (
              <p className="or-note">Could not load the full specification.</p>
            ) : specs.length === 0 ? (
              <p className="or-note">No element specification saved for this aim.</p>
            ) : (
              <table className="or-spec">
                <thead>
                  <tr>
                    <th>Element</th>
                    <th>Exact %</th>
                    <th>Plus +</th>
                    <th>Minus −</th>
                    <th>Range %</th>
                  </tr>
                </thead>
                <tbody>
                  {specs.map((s) => {
                    const exact = Number(s.exact_value);
                    return (
                      <tr key={s.id}>
                        <td>
                          <span className="or-element">
                            <b>{s.element?.abbreviation ?? "?"}</b>
                            {s.element?.name ?? "Unknown"}
                          </span>
                        </td>
                        <td className="or-strong">{formatNumber(exact, 2)}</td>
                        <td className="or-plus">+{formatNumber(s.plus_value, 2)}</td>
                        <td className="or-minus">−{formatNumber(s.minus_value, 2)}</td>
                        <td>
                          {formatNumber(exact - Number(s.minus_value), 2)} – {formatNumber(exact + Number(s.plus_value), 2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </aside>
    </>
  );
}