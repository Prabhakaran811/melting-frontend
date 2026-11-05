import { useEffect, useMemo, useState } from "react";
import type { Element } from "../../elements/elementTypes";
import type {
  ElementStock,
  StockSupplier,
  CreateElementStockRequest,
} from "../elementStockTypes";
import SearchSelect from "./SearchSelect";
import type { SelectOption } from "./SearchSelect";

interface Props {
  open: boolean;
  initial: ElementStock | null;
  elements: Element[];
  elementsLoading: boolean;
  elementsError: boolean;
  suppliers: StockSupplier[];
  suppliersLoading: boolean;
  suppliersError: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateElementStockRequest) => void;
}

interface Errors {
  element?: string;
  supplier?: string;
  quantity?: string;
  receivedDate?: string;
  pickup?: string;
  rate?: string;
}

// Today as YYYY-MM-DD in local time
const todayString = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

export default function ElementStockForm({
  open,
  initial,
  elements,
  elementsLoading,
  elementsError,
  suppliers,
  suppliersLoading,
  suppliersError,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [elementId, setElementId] = useState<number | null>(null);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [pickup, setPickup] = useState("");
  const [rate, setRate] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  // Reset whenever the drawer opens
  useEffect(() => {
    if (!open) return;
    setElementId(initial?.element_id ?? null);
    setSupplierId(initial?.supplier_id ?? null);
    setQuantity(initial ? String(Number(initial.quantity)) : "");
    setReceivedDate(initial?.received_date ?? todayString());
    setPickup(initial ? String(Number(initial.pickup_percentage)) : "");
    setRate(initial ? String(Number(initial.rate_per_kg)) : "");
    setErrors({});
  }, [open, initial]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const elementOptions: SelectOption[] = useMemo(
    () =>
      [...elements]
        .sort((a, b) => a.sequence_order - b.sequence_order)
        .map((e) => ({ id: e.id, label: e.name, badge: e.abbreviation })),
    [elements]
  );

  const supplierOptions: SelectOption[] = useMemo(
    () =>
      [...suppliers]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((s) => ({ id: s.id, label: s.name })),
    [suppliers]
  );

  // Live stock value
  const stockValue =
    Number(quantity) > 0 && Number(rate) >= 0 && quantity !== "" && rate !== ""
      ? (Number(quantity) * Number(rate)).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};

    const qty = Number(quantity);
    const pick = Number(pickup);
    const rt = Number(rate);

    if (elementId === null || !elements.some((x) => x.id === elementId))
      errs.element = "Select an element";

    if (supplierId === null || !suppliers.some((x) => x.id === supplierId))
      errs.supplier = "Select a supplier";

    if (quantity.trim() === "" || !Number.isFinite(qty) || qty <= 0)
      errs.quantity = "Enter a quantity greater than 0";

    if (!receivedDate) errs.receivedDate = "Select the received date";

    if (pickup.trim() === "" || !Number.isFinite(pick) || pick < 0 || pick > 100)
      errs.pickup = "Enter a value between 0 and 100";

    if (rate.trim() === "" || !Number.isFinite(rt) || rt < 0)
      errs.rate = "Enter a valid rate";

    setErrors(errs);
    if (Object.keys(errs).length || elementId === null || supplierId === null) return;

    onSubmit({
      element_id: elementId,
      quantity: qty,
      supplier_id: supplierId,
      received_date: receivedDate,
      pickup_percentage: pick,
      rate_per_kg: rt,
    });
  };

  return (
    <>
      <div className={`es-overlay ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`es-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="es-drawer__head">
          <div>
            <h2>{initial ? "Edit element stock" : "New element stock"}</h2>
            <p>{initial ? "Update the stock details." : "Record a stock received from a supplier."}</p>
          </div>
          <button type="button" className="es-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="es-form" noValidate>
          <div className={`es-field ${errors.element ? "has-error" : ""}`}>
            <span>Element</span>
            <SearchSelect
              options={elementOptions}
              value={elementId}
              onChange={setElementId}
              placeholder="Select element"
              searchPlaceholder="Search element..."
              emptyText="No elements found. Add them in Element Master first."
              loading={elementsLoading}
              loadError={elementsError}
              invalid={Boolean(errors.element)}
            />
            {errors.element && <small>{errors.element}</small>}
          </div>

          <div className={`es-field ${errors.supplier ? "has-error" : ""}`}>
            <span>Supplier</span>
            <SearchSelect
              options={supplierOptions}
              value={supplierId}
              onChange={setSupplierId}
              placeholder="Select supplier"
              searchPlaceholder="Search supplier..."
              emptyText="No suppliers found. Add them in Supplier Master first."
              loading={suppliersLoading}
              loadError={suppliersError}
              invalid={Boolean(errors.supplier)}
            />
            {errors.supplier && <small>{errors.supplier}</small>}
          </div>

          <div className="es-row">
            <label className={`es-field ${errors.quantity ? "has-error" : ""}`}>
              <span>Quantity (kg)</span>
              <input
                type="number"
                min="0"
                step="0.001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="500.000"
              />
              {errors.quantity && <small>{errors.quantity}</small>}
            </label>

            <label className={`es-field ${errors.receivedDate ? "has-error" : ""}`}>
              <span>Received date</span>
              <input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
              />
              {errors.receivedDate && <small>{errors.receivedDate}</small>}
            </label>
          </div>

          <div className="es-row">
            <label className={`es-field ${errors.pickup ? "has-error" : ""}`}>
              <span>Pickup %</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="85.50"
              />
              {errors.pickup && <small>{errors.pickup}</small>}
            </label>

            <label className={`es-field ${errors.rate ? "has-error" : ""}`}>
              <span>Rate per kg</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="120.00"
              />
              {errors.rate && <small>{errors.rate}</small>}
            </label>
          </div>

          {stockValue && (
            <div className="es-value">
              <span>Stock value</span>
              <strong>{stockValue}</strong>
            </div>
          )}

          <footer className="es-form__foot">
            <button type="button" className="es-btn es-btn--ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="es-btn es-btn--primary" disabled={saving}>
              {saving ? "Saving..." : initial ? "Save changes" : "Add stock"}
            </button>
          </footer>
        </form>
      </aside>
    </>
  );
}