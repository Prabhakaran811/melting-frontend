import { useEffect, useMemo, useState } from "react";
import type { RawMaterial } from "../../rawMaterials/rawMaterialTypes";
import type {
  RawMaterialStock,
  StockSupplier,
  CreateRawMaterialStockRequest,
} from "../rawMaterialStockTypes";
import SearchSelect from "../../elementStocks/components/SearchSelect";
import type { SelectOption } from "../../elementStocks/components/SearchSelect";

// The dropdown's styles live in the Element Stock stylesheet (all classes are "es-" prefixed)
import "../../elementStocks/ElementStockManagement.css";

interface Props {
  open: boolean;
  initial: RawMaterialStock | null;
  rawMaterials: RawMaterial[];
  rawMaterialsLoading: boolean;
  rawMaterialsError: boolean;
  suppliers: StockSupplier[];
  suppliersLoading: boolean;
  suppliersError: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRawMaterialStockRequest) => void;
}

interface Errors {
  rawMaterial?: string;
  supplier?: string;
  quantity?: string;
  receivedDate?: string;
  rate?: string;
  percentages?: string;
}

// Today as YYYY-MM-DD in local time
const todayString = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

export default function RawMaterialStockForm({
  open,
  initial,
  rawMaterials,
  rawMaterialsLoading,
  rawMaterialsError,
  suppliers,
  suppliersLoading,
  suppliersError,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [rawMaterialId, setRawMaterialId] = useState<number | null>(null);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [rate, setRate] = useState("");
  const [percentages, setPercentages] = useState<Record<number, string>>({});
  const [badPercentIds, setBadPercentIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  // Reset whenever the drawer opens
  useEffect(() => {
    if (!open) return;
    setRawMaterialId(initial?.raw_material_id ?? null);
    setSupplierId(initial?.supplier_id ?? null);
    setQuantity(initial ? String(Number(initial.quantity)) : "");
    setReceivedDate(initial?.received_date ?? todayString());
    setRate(initial ? String(Number(initial.rate_per_kg)) : "");

    const map: Record<number, string> = {};
    initial?.element_percentages?.forEach((p) => {
      map[p.element_id] = String(Number(p.percentage));
    });
    setPercentages(map);

    setBadPercentIds([]);
    setErrors({});
  }, [open, initial]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const rawMaterialOptions: SelectOption[] = useMemo(
    () =>
      [...rawMaterials]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((r) => ({ id: r.id, label: r.name })),
    [rawMaterials]
  );

  const supplierOptions: SelectOption[] = useMemo(
    () =>
      [...suppliers]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((s) => ({ id: s.id, label: s.name })),
    [suppliers]
  );

  // Elements that belong to the selected raw material
  const rmElements = useMemo(() => {
    const rm = rawMaterials.find((r) => r.id === rawMaterialId);
    return rm ? [...rm.elements].sort((a, b) => a.sequence_order - b.sequence_order) : [];
  }, [rawMaterials, rawMaterialId]);

  const total = rmElements.reduce((sum, el) => sum + (Number(percentages[el.id]) || 0), 0);

  // Changing the raw material keeps only the percentages that still apply
  const handleRawMaterialChange = (id: number) => {
    const rm = rawMaterials.find((r) => r.id === id);
    setRawMaterialId(id);
    setPercentages((prev) => {
      const next: Record<number, string> = {};
      rm?.elements.forEach((el) => {
        if (prev[el.id] !== undefined) next[el.id] = prev[el.id];
      });
      return next;
    });
    setBadPercentIds([]);
    setErrors((e) => ({ ...e, rawMaterial: undefined, percentages: undefined }));
  };

  const setPercent = (id: number, value: string) => {
    setPercentages((prev) => ({ ...prev, [id]: value }));
    setBadPercentIds((prev) => prev.filter((x) => x !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};

    const qty = Number(quantity);
    const rt = Number(rate);

    if (rawMaterialId === null || !rawMaterials.some((r) => r.id === rawMaterialId))
      errs.rawMaterial = "Select a raw material";

    if (supplierId === null || !suppliers.some((s) => s.id === supplierId))
      errs.supplier = "Select a supplier";

    if (quantity.trim() === "" || !Number.isFinite(qty) || qty <= 0)
      errs.quantity = "Enter a quantity greater than 0";

    if (!receivedDate) errs.receivedDate = "Select the received date";

    if (rate.trim() === "" || !Number.isFinite(rt) || rt < 0)
      errs.rate = "Enter a valid rate";

    // Every element of the raw material needs a percentage
    const bad = rmElements
      .filter((el) => {
        const raw = (percentages[el.id] ?? "").trim();
        const n = Number(raw);
        return raw === "" || !Number.isFinite(n) || n < 0 || n > 100;
      })
      .map((el) => el.id);

    if (rmElements.length > 0 && bad.length > 0) {
      errs.percentages = "Enter a percentage between 0 and 100 for every element";
    } else if (total > 100) {
      errs.percentages = "Total element percentage cannot be more than 100%";
    }

    setBadPercentIds(bad);
    setErrors(errs);
    if (Object.keys(errs).length || rawMaterialId === null || supplierId === null) return;

    onSubmit({
      raw_material_id: rawMaterialId,
      quantity: qty,
      supplier_id: supplierId,
      received_date: receivedDate,
      rate_per_kg: rt,
      element_percentages: rmElements.map((el) => ({
        element_id: el.id,
        percentage: Number(percentages[el.id]),
      })),
    });
  };

  return (
    <>
      <div className={`es-overlay ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`es-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="es-drawer__head">
          <div>
            <h2>{initial ? "Edit raw material stock" : "New raw material stock"}</h2>
            <p>{initial ? "Update the stock details." : "Record a raw material received from a supplier."}</p>
          </div>
          <button type="button" className="es-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="es-form" noValidate>
          <div className={`es-field ${errors.rawMaterial ? "has-error" : ""}`}>
            <span>Raw material</span>
            <SearchSelect
              options={rawMaterialOptions}
              value={rawMaterialId}
              onChange={handleRawMaterialChange}
              placeholder="Select raw material"
              searchPlaceholder="Search raw material..."
              emptyText="No raw materials found. Add them in Raw Material Master first."
              loading={rawMaterialsLoading}
              loadError={rawMaterialsError}
              invalid={Boolean(errors.rawMaterial)}
            />
            {errors.rawMaterial && <small>{errors.rawMaterial}</small>}
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
                placeholder="1000.000"
              />
              {errors.quantity && <small>{errors.quantity}</small>}
            </label>

            <label className={`es-field ${errors.rate ? "has-error" : ""}`}>
              <span>Rate per kg</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="45.00"
              />
              {errors.rate && <small>{errors.rate}</small>}
            </label>
          </div>

          <label className={`es-field ${errors.receivedDate ? "has-error" : ""}`}>
            <span>Received date</span>
            <input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
            />
            {errors.receivedDate && <small>{errors.receivedDate}</small>}
          </label>

          {/* Element percentages */}
          <div className={`rs-pctbox ${errors.percentages ? "has-error" : ""}`}>
            <div className="rs-pctbox__head">
              <span>Element percentages</span>
              {rmElements.length > 0 && (
                <em className={total > 100 ? "is-over" : ""}>Total {total.toFixed(2)}%</em>
              )}
            </div>

            {rawMaterialId === null ? (
              <p className="rs-pctbox__hint">Select a raw material to enter its element percentages.</p>
            ) : rmElements.length === 0 ? (
              <p className="rs-pctbox__hint">This raw material has no elements. Add elements to it first.</p>
            ) : (
              <div className="rs-pctbox__grid">
                {rmElements.map((el) => (
                  <label
                    key={el.id}
                    className={`rs-pctfield ${badPercentIds.includes(el.id) ? "is-bad" : ""}`}
                  >
                    <span title={el.name}>
                      <b>{el.abbreviation}</b>
                      {el.name}
                    </span>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={percentages[el.id] ?? ""}
                        onChange={(e) => setPercent(el.id, e.target.value)}
                        placeholder="0.00"
                      />
                      <i>%</i>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {errors.percentages && <small className="rs-pctbox__error">{errors.percentages}</small>}
          </div>

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