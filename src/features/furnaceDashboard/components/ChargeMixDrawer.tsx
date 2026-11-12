import { useEffect, useMemo, useRef, useState } from "react";
import type { Element } from "../../elements/elementTypes";
import type { RawMaterialStock } from "../../rawMaterialStocks/rawMaterialStockTypes";
import type { ChargeMix, ChargeMixItemInput } from "../furnaceDashboardTypes";
import SearchSelect from "../../elementStocks/components/SearchSelect";
import type { SelectOption } from "../../elementStocks/components/SearchSelect";

// The dropdown and drawer styles live in the Element Stock stylesheet (all classes are "es-" prefixed)
import "../../elementStocks/ElementStockManagement.css";

interface Props {
  open: boolean;
  mix: ChargeMix | null; // null = creating, otherwise editing a Draft
  defaultCapacity: number;
  stocks: RawMaterialStock[];
  stocksLoading: boolean;
  stocksError: boolean;
  elements: Element[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: { charging_capacity: number; items: ChargeMixItemInput[] }) => void;
}

interface RowElement {
  element_id: number;
  percentage: number;
}

interface Row {
  key: number;
  stockId: number | null;
  weight: string;
  rate: string;
  bunker: string;
  elements: RowElement[];
}

const money = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const stockElements = (stock: RawMaterialStock): RowElement[] =>
  (stock.element_percentages ?? []).map((p) => ({
    element_id: p.element_id,
    percentage: Number(p.percentage),
  }));

export default function ChargeMixDrawer({
  open,
  mix,
  defaultCapacity,
  stocks,
  stocksLoading,
  stocksError,
  elements,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const keyRef = useRef(1);
  const newKey = () => keyRef.current++;

  const emptyRow = (): Row => ({
    key: newKey(),
    stockId: null,
    weight: "",
    rate: "",
    bunker: "",
    elements: [],
  });

  const [capacity, setCapacity] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<{ capacity?: string; general?: string }>({});

  const isEditing = mix !== null;

  // Reset whenever the drawer opens
  useEffect(() => {
    if (!open) return;

    setCapacity(String(Number(mix?.charging_capacity ?? defaultCapacity) || ""));

    const existing = mix?.items ?? [];
    setRows(
      existing.length > 0
        ? existing.map((item) => ({
            key: newKey(),
            stockId: item.raw_material_stock_id ?? null,
            weight: String(Number(item.weight)),
            rate: item.rate_per_kg !== undefined ? String(Number(item.rate_per_kg)) : "",
            bunker: item.bunker_name ?? "",
            elements: (item.elements ?? [])
              .map((e) => ({
                element_id: e.element_id ?? e.element?.id ?? 0,
                percentage: Number(e.percentage),
              }))
              .filter((e) => e.element_id > 0),
          }))
        : [emptyRow()]
    );

    setRowErrors({});
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mix]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const stockById = useMemo(() => new Map(stocks.map((s) => [s.id, s])), [stocks]);

  const stockOptions: SelectOption[] = useMemo(
    () =>
      [...stocks]
        .sort((a, b) => b.id - a.id)
        .map((s) => ({
          id: s.id,
          label: `#${s.id} ${s.raw_material?.name ?? "Stock"} · ${s.supplier?.name ?? "?"} · ${Number(
            s.quantity
          ).toLocaleString("en-IN")} kg`,
        })),
    [stocks]
  );

  const abbreviation = (id: number) => elements.find((e) => e.id === id)?.abbreviation ?? `#${id}`;
  const orderOf = (id: number) => elements.find((e) => e.id === id)?.sequence_order ?? 9999;

  // Element composition of a row (its own, or the one from the selected stock)
  const elementsOf = (row: Row): RowElement[] => {
    if (row.elements.length > 0) return row.elements;
    const stock = row.stockId !== null ? stockById.get(row.stockId) : undefined;
    return stock ? stockElements(stock) : [];
  };

  const patchRow = (key: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Picking a stock fills the rate and the element percentages
  const selectStock = (key: number, stockId: number) => {
    const stock = stockById.get(stockId);
    patchRow(key, {
      stockId,
      rate: stock ? String(Number(stock.rate_per_kg)) : "",
      elements: stock ? stockElements(stock) : [],
    });
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (key: number) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));

  // Live totals
  const capacityNum = Number(capacity) || 0;
  const totalWeight = rows.reduce((sum, r) => sum + (Number(r.weight) || 0), 0);
  const totalCost = rows.reduce((sum, r) => sum + (Number(r.weight) || 0) * (Number(r.rate) || 0), 0);
  const remaining = capacityNum - totalWeight;
  const percent = capacityNum > 0 ? Math.min(100, (totalWeight / capacityNum) * 100) : 0;
  const over = totalWeight > capacityNum && capacityNum > 0;

  // Expected chemistry: weighted average of each element
  const blended = useMemo(() => {
    if (totalWeight <= 0) return [];
    const sums = new Map<number, number>();
    rows.forEach((r) => {
      const w = Number(r.weight) || 0;
      if (w <= 0) return;
      elementsOf(r).forEach((el) => {
        sums.set(el.element_id, (sums.get(el.element_id) ?? 0) + w * el.percentage);
      });
    });
    return Array.from(sums.entries())
      .map(([id, sum]) => ({ id, value: sum / totalWeight }))
      .sort((a, b) => orderOf(a.id) - orderOf(b.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, totalWeight, stockById, elements]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errs: { capacity?: string; general?: string } = {};
    const rErrs: Record<number, string> = {};
    const seen = new Set<number>();

    if (!isEditing && (!Number.isFinite(capacityNum) || capacityNum <= 0))
      errs.capacity = "Enter the charging capacity";

    rows.forEach((row) => {
      const w = Number(row.weight);
      const rate = Number(row.rate);
      const stock = row.stockId !== null ? stockById.get(row.stockId) : undefined;

      if (row.stockId === null) rErrs[row.key] = "Select a raw material stock";
      else if (seen.has(row.stockId)) rErrs[row.key] = "This stock is already added";
      else if (!Number.isFinite(w) || row.weight.trim() === "" || w <= 0)
        rErrs[row.key] = "Enter a weight greater than 0";
      else if (stock && w > Number(stock.quantity))
        rErrs[row.key] = `Only ${Number(stock.quantity).toLocaleString("en-IN")} kg available in this stock`;
      else if (!Number.isFinite(rate) || row.rate.trim() === "" || rate < 0)
        rErrs[row.key] = "Enter a valid rate";
      else if (!row.bunker.trim()) rErrs[row.key] = "Enter the bunker name";

      if (row.stockId !== null) seen.add(row.stockId);
    });

    if (over) errs.general = "Total weight is more than the furnace capacity";

    setErrors(errs);
    setRowErrors(rErrs);
    if (Object.keys(errs).length > 0 || Object.keys(rErrs).length > 0) return;

    onSubmit({
      charging_capacity: capacityNum,
      items: rows.map((row) => ({
        raw_material_stock_id: row.stockId as number,
        weight: Number(row.weight),
        rate_per_kg: Number(row.rate),
        bunker_name: row.bunker.trim(),
        elements: elementsOf(row).map((el) => ({
          element_id: el.element_id,
          percentage: el.percentage,
        })),
      })),
    });
  };

  return (
    <>
      <div className={`es-overlay ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`es-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="es-drawer__head">
          <div>
            <h2>{isEditing ? "Edit charge mix" : "Add charge mix"}</h2>
            <p>Select the raw materials, weights and bunkers for this heat.</p>
          </div>
          <button type="button" className="es-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="es-form" noValidate>
          {/* Capacity */}
          <label className={`es-field ${errors.capacity ? "has-error" : ""}`}>
            <span>Charging capacity (kg)</span>
            <input
              type="number"
              min="0"
              step="0.001"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              disabled={isEditing}
              placeholder="1200"
            />
            {errors.capacity && <small>{errors.capacity}</small>}
            {isEditing && <small className="fd-hintline">Capacity is fixed once the mix is created.</small>}
          </label>

          {/* Material rows */}
          <div className="fd-mixrows">
            {rows.map((row, index) => {
              const stock = row.stockId !== null ? stockById.get(row.stockId) : undefined;
              const rowEls = elementsOf(row);
              const cost = (Number(row.weight) || 0) * (Number(row.rate) || 0);

              return (
                <div className={`fd-mixrow ${rowErrors[row.key] ? "has-error" : ""}`} key={row.key}>
                  <div className="fd-mixrow__head">
                    <span>Material {index + 1}</span>
                    {rows.length > 1 && (
                      <button type="button" onClick={() => removeRow(row.key)} aria-label="Remove material">
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="es-field">
                    <span>Raw material stock</span>
                    <SearchSelect
                      options={stockOptions}
                      value={row.stockId}
                      onChange={(id) => selectStock(row.key, id)}
                      placeholder="Select stock"
                      searchPlaceholder="Search material or supplier..."
                      emptyText="No raw material stock found. Add stock first."
                      loading={stocksLoading}
                      loadError={stocksError}
                      invalid={Boolean(rowErrors[row.key]) && row.stockId === null}
                    />
                    {stock && (
                      <small className="fd-hintline">
                        Available: {Number(stock.quantity).toLocaleString("en-IN")} kg
                      </small>
                    )}
                  </div>

                  <div className="fd-mixrow__grid">
                    <label className="es-field">
                      <span>Weight (kg)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={row.weight}
                        onChange={(e) => patchRow(row.key, { weight: e.target.value })}
                        placeholder="500"
                      />
                    </label>

                    <label className="es-field">
                      <span>Rate / kg</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.rate}
                        onChange={(e) => patchRow(row.key, { rate: e.target.value })}
                        placeholder="32.00"
                      />
                    </label>

                    <label className="es-field">
                      <span>Bunker</span>
                      <input
                        list="fd-bunker-list"
                        value={row.bunker}
                        onChange={(e) => patchRow(row.key, { bunker: e.target.value })}
                        placeholder="Bunker 1"
                      />
                    </label>
                  </div>

                  {rowEls.length > 0 && (
                    <div className="fd-mixrow__els">
                      {rowEls.map((el) => (
                        <span key={el.element_id}>
                          <b>{abbreviation(el.element_id)}</b>
                          {el.percentage.toFixed(2)}%
                        </span>
                      ))}
                    </div>
                  )}

                  {cost > 0 && <div className="fd-mixrow__cost">Cost {money(cost)}</div>}
                  {rowErrors[row.key] && <small className="fd-rowerror">{rowErrors[row.key]}</small>}
                </div>
              );
            })}

            <datalist id="fd-bunker-list">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={`Bunker ${n}`} />
              ))}
            </datalist>

            <button type="button" className="fd-addrow" onClick={addRow}>
              + Add material
            </button>
          </div>

          {/* Summary */}
          <div className={`fd-sum ${over ? "is-over" : ""}`}>
            <div className="fd-sum__row">
              <strong>{totalWeight.toLocaleString("en-IN", { maximumFractionDigits: 3 })} kg</strong>
              <span>
                of {capacityNum.toLocaleString("en-IN")} kg ·{" "}
                {over ? `${Math.abs(remaining).toLocaleString("en-IN")} kg over` : `${remaining.toLocaleString("en-IN")} kg left`}
              </span>
            </div>
            <div className="fd-sum__bar">
              <i style={{ width: `${percent}%` }} />
            </div>
            <div className="fd-sum__cost">Total cost {money(totalCost)}</div>

            {blended.length > 0 && (
              <div className="fd-sum__chem">
                <span>Expected charge chemistry</span>
                <div>
                  {blended.map((b) => (
                    <em key={b.id}>
                      <b>{abbreviation(b.id)}</b>
                      {b.value.toFixed(2)}%
                    </em>
                  ))}
                </div>
              </div>
            )}
          </div>

          {errors.general && <small className="fd-rowerror">{errors.general}</small>}

          <footer className="es-form__foot">
            <button type="button" className="es-btn es-btn--ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="es-btn es-btn--primary" disabled={saving}>
              {saving ? "Saving..." : isEditing ? "Save changes" : "Save charge mix"}
            </button>
          </footer>
        </form>
      </aside>
    </>
  );
}