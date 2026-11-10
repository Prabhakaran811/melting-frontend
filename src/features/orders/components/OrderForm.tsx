import { useEffect, useMemo, useState } from "react";
import type { Aim } from "../../aims/aimTypes";
import type { Order } from "../orderTypes";
import { ORDER_STATUSES, todayString } from "../orderTypes";
import SearchSelect from "../../elementStocks/components/SearchSelect";
import type { SelectOption } from "../../elementStocks/components/SearchSelect";
import { formatNumber } from "../../elementStocks/components/ElementStockTable";

// The dropdown and drawer styles live in the Element Stock stylesheet (all classes are "es-" prefixed)
import "../../elementStocks/ElementStockManagement.css";

export interface OrderFormValues {
  aim_id: number;
  customer_delivery_date: string;
  status: string;
}

interface Props {
  open: boolean;
  initial: Order | null;
  aims: Aim[];
  aimsLoading: boolean;
  aimsError: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: OrderFormValues) => void;
}

interface Errors {
  aim?: string;
  date?: string;
}

export default function OrderForm({
  open,
  initial,
  aims,
  aimsLoading,
  aimsError,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [aimId, setAimId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [errors, setErrors] = useState<Errors>({});

  // Reset whenever the drawer opens
  useEffect(() => {
    if (!open) return;
    setAimId(initial?.aim_id ?? null);
    setDate(initial?.customer_delivery_date ?? todayString());
    setStatus(initial?.status ?? "Pending");
    setErrors({});
  }, [open, initial]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const aimOptions: SelectOption[] = useMemo(
    () =>
      [...aims]
        .sort((a, b) => b.id - a.id)
        .map((a) => ({
          id: a.id,
          label: `${a.drawing_no} · ${a.customer?.customer_name ?? "?"} · ${a.product?.product_name ?? "?"}`,
        })),
    [aims]
  );

  const selectedAim = aims.find((a) => a.id === aimId) ?? null;

  // Make sure the current status is always selectable
  const statusOptions = useMemo(
    () => Array.from(new Set([...ORDER_STATUSES, ...(initial ? [initial.status] : [])])),
    [initial]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};

    if (aimId === null || !aims.some((a) => a.id === aimId)) errs.aim = "Select an aim";
    if (!date) errs.date = "Select the customer delivery date";

    setErrors(errs);
    if (Object.keys(errs).length || aimId === null) return;

    onSubmit({ aim_id: aimId, customer_delivery_date: date, status });
  };

  return (
    <>
      <div className={`es-overlay ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`es-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="es-drawer__head">
          <div>
            <h2>{initial ? `Edit ${initial.order_number}` : "New order"}</h2>
            <p>
              {initial
                ? "Update the aim, status or delivery date."
                : "Select an aim and the customer delivery date."}
            </p>
          </div>
          <button type="button" className="es-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="es-form" noValidate>
          <div className={`es-field ${errors.aim ? "has-error" : ""}`}>
            <span>Aim</span>
            <SearchSelect
              options={aimOptions}
              value={aimId}
              onChange={setAimId}
              placeholder="Select aim"
              searchPlaceholder="Search drawing, customer or product..."
              emptyText="No aims found. Add them in Aim Master first."
              loading={aimsLoading}
              loadError={aimsError}
              invalid={Boolean(errors.aim)}
            />
            {errors.aim && <small>{errors.aim}</small>}
          </div>

          {/* Selected aim summary */}
          {selectedAim && (
            <div className="or-aim">
              <div>
                <span>Customer</span>
                <strong>{selectedAim.customer?.customer_name ?? "-"}</strong>
              </div>
              <div>
                <span>Product</span>
                <strong>{selectedAim.product?.product_name ?? "-"}</strong>
              </div>
              <div>
                <span>Iron type</span>
                <strong>{selectedAim.iron_type?.name ?? "-"}</strong>
              </div>
              <div>
                <span>Casting wt (kg)</span>
                <strong>{formatNumber(selectedAim.casting_weight_kg, 3)}</strong>
              </div>
            </div>
          )}

          <label className={`es-field ${errors.date ? "has-error" : ""}`}>
            <span>Customer delivery date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            {errors.date && <small>{errors.date}</small>}
          </label>

          {/* Status is only editable on update. New orders start as Pending. */}
          {initial ? (
            <div className="es-field">
              <span>Status</span>
              <div className="or-pills">
                {statusOptions.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={s === status ? "is-active" : ""}
                    onClick={() => setStatus(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="or-note">The order number and the Pending status are created automatically.</p>
          )}

          <footer className="es-form__foot">
            <button type="button" className="es-btn es-btn--ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="es-btn es-btn--primary" disabled={saving}>
              {saving ? "Saving..." : initial ? "Save changes" : "Create order"}
            </button>
          </footer>
        </form>
      </aside>
    </>
  );
}