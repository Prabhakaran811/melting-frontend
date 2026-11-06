import { useEffect, useMemo, useState } from "react";
import type { Wire } from "../../wires/wireTypes";
import type {
  WireStock,
  WireStockSupplier,
  CreateWireStockRequest,
} from "../wireStockTypes";
import SearchSelect from "../../elementStocks/components/SearchSelect";
import type { SelectOption } from "../../elementStocks/components/SearchSelect";

// The dropdown and drawer styles live in the Element Stock stylesheet (all classes are "es-" prefixed)
import "../../elementStocks/ElementStockManagement.css";

interface Props {
  open: boolean;
  initial: WireStock | null;
  wires: Wire[];
  wiresLoading: boolean;
  wiresError: boolean;
  suppliers: WireStockSupplier[];
  suppliersLoading: boolean;
  suppliersError: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateWireStockRequest) => void;
}

interface Errors {
  wire?: string;
  supplier?: string;
  powder?: string;
  quantity?: string;
  rate?: string;
}

const money = (value: number) =>
  value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function WireStockForm({
  open,
  initial,
  wires,
  wiresLoading,
  wiresError,
  suppliers,
  suppliersLoading,
  suppliersError,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [wireId, setWireId] = useState<number | null>(null);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [powder, setPowder] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  // Reset whenever the drawer opens
  useEffect(() => {
    if (!open) return;
    setWireId(initial?.wire_id ?? null);
    setSupplierId(initial?.supplier_id ?? null);
    setPowder(initial ? String(Number(initial.powder_weight_per_meter)) : "");
    setQuantity(initial ? String(Number(initial.quantity)) : "");
    setRate(initial ? String(Number(initial.rate_per_meter)) : "");
    setErrors({});
  }, [open, initial]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const wireOptions: SelectOption[] = useMemo(
    () =>
      [...wires]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((w) => ({ id: w.id, label: w.name })),
    [wires]
  );

  const supplierOptions: SelectOption[] = useMemo(
    () =>
      [...suppliers]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((s) => ({ id: s.id, label: s.name })),
    [suppliers]
  );

  // Live summary (quantity and rate are per meter)
  const qtyNum = Number(quantity);
  const rateNum = Number(rate);
  const powderNum = Number(powder);
  const showValue = quantity !== "" && rate !== "" && qtyNum > 0 && rateNum >= 0;
  const showPowder = quantity !== "" && powder !== "" && qtyNum > 0 && powderNum > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};

    if (wireId === null || !wires.some((w) => w.id === wireId))
      errs.wire = "Select a wire";

    if (supplierId === null || !suppliers.some((s) => s.id === supplierId))
      errs.supplier = "Select a supplier";

    if (powder.trim() === "" || !Number.isFinite(powderNum) || powderNum <= 0)
      errs.powder = "Enter a powder weight greater than 0";

    if (quantity.trim() === "" || !Number.isFinite(qtyNum) || qtyNum <= 0)
      errs.quantity = "Enter a quantity greater than 0";

    if (rate.trim() === "" || !Number.isFinite(rateNum) || rateNum < 0)
      errs.rate = "Enter a valid rate";

    setErrors(errs);
    if (Object.keys(errs).length || wireId === null || supplierId === null) return;

    onSubmit({
      wire_id: wireId,
      powder_weight_per_meter: powderNum,
      quantity: qtyNum,
      supplier_id: supplierId,
      rate_per_meter: rateNum,
    });
  };

  return (
    <>
      <div className={`es-overlay ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`es-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="es-drawer__head">
          <div>
            <h2>{initial ? "Edit wire stock" : "New wire stock"}</h2>
            <p>{initial ? "Update the stock details." : "Record a wire stock received from a supplier."}</p>
          </div>
          <button type="button" className="es-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="es-form" noValidate>
          <div className={`es-field ${errors.wire ? "has-error" : ""}`}>
            <span>Wire</span>
            <SearchSelect
              options={wireOptions}
              value={wireId}
              onChange={setWireId}
              placeholder="Select wire"
              searchPlaceholder="Search wire..."
              emptyText="No wires found. Add them in Wire Master first."
              loading={wiresLoading}
              loadError={wiresError}
              invalid={Boolean(errors.wire)}
            />
            {errors.wire && <small>{errors.wire}</small>}
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
            <label className={`es-field ${errors.powder ? "has-error" : ""}`}>
              <span>Powder wt / m (g)</span>
              <input
                type="number"
                min="0"
                step="0.001"
                value={powder}
                onChange={(e) => setPowder(e.target.value)}
                placeholder="250.500"
              />
              {errors.powder && <small>{errors.powder}</small>}
            </label>

            <label className={`es-field ${errors.quantity ? "has-error" : ""}`}>
              <span>Quantity (m)</span>
              <input
                type="number"
                min="0"
                step="0.001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100.000"
              />
              {errors.quantity && <small>{errors.quantity}</small>}
            </label>
          </div>

          <label className={`es-field ${errors.rate ? "has-error" : ""}`}>
            <span>Rate per meter</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="45.50"
            />
            {errors.rate && <small>{errors.rate}</small>}
          </label>

          {(showValue || showPowder) && (
            <div className="ws-summary">
              {showValue && (
                <div>
                  <span>Stock value</span>
                  <strong>{money(qtyNum * rateNum)}</strong>
                </div>
              )}
              {showPowder && (
                <div>
                  <span>Total powder (kg)</span>
                  <strong>
                    {((powderNum * qtyNum) / 1000).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 3,
                    })}
                  </strong>
                </div>
              )}
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