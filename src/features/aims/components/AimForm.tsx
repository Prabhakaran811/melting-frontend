import { useEffect, useMemo, useState } from "react";
import type { IronType } from "../../ironTypes/ironTypeTypes";
import type { Aim, CreateAimRequest } from "../aimTypes";
import SearchSelect from "../../elementStocks/components/SearchSelect";
import type { SelectOption } from "../../elementStocks/components/SearchSelect";

// The dropdown and drawer styles live in the Element Stock stylesheet (all classes are "es-" prefixed)
import "../../elementStocks/ElementStockManagement.css";

export interface LookupState {
  options: SelectOption[];
  loading: boolean;
  error: boolean;
}

interface Props {
  open: boolean;
  initial: Aim | null;
  customers: LookupState;
  products: LookupState;
  packings: LookupState;
  hardnesses: LookupState;
  inoculants: LookupState;
  ironTypes: IronType[];
  ironTypesLoading: boolean;
  ironTypesError: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAimRequest) => void;
}

interface SpecValues {
  exact: string;
  plus: string;
  minus: string;
}

interface Errors {
  customer?: string;
  product?: string;
  drawingNo?: string;
  ironType?: string;
  packing?: string;
  hardness?: string;
  inoculant?: string;
  pouring?: string;
  casting?: string;
  noCasting?: string;
  noCavity?: string;
  specs?: string;
}

export default function AimForm({
  open,
  initial,
  customers,
  products,
  packings,
  hardnesses,
  inoculants,
  ironTypes,
  ironTypesLoading,
  ironTypesError,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [productId, setProductId] = useState<number | null>(null);
  const [drawingNo, setDrawingNo] = useState("");
  const [ironTypeId, setIronTypeId] = useState<number | null>(null);
  const [packingId, setPackingId] = useState<number | null>(null);
  const [hardnessId, setHardnessId] = useState<number | null>(null);
  const [inoculantId, setInoculantId] = useState<number | null>(null);
  const [pouring, setPouring] = useState("");
  const [casting, setCasting] = useState("");
  const [noCasting, setNoCasting] = useState("");
  const [noCavity, setNoCavity] = useState("");
  const [specs, setSpecs] = useState<Record<number, SpecValues>>({});
  const [badSpecIds, setBadSpecIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  // Reset whenever the drawer opens
  useEffect(() => {
    if (!open) return;

    setCustomerId(initial?.customer?.id ?? null);
    setProductId(initial?.product?.id ?? null);
    setDrawingNo(initial?.drawing_no ?? "");
    setIronTypeId(initial?.iron_type?.id ?? null);
    setPackingId(initial?.packing?.id ?? null);
    setHardnessId(initial?.hardness?.id ?? null);
    setInoculantId(initial?.inoculant?.id ?? null);
    setPouring(initial ? String(Number(initial.pouring_weight_kg)) : "");
    setCasting(initial ? String(Number(initial.casting_weight_kg)) : "");
    setNoCasting(initial ? String(initial.no_of_casting) : "");
    setNoCavity(initial ? String(initial.no_of_cavity) : "");

    const map: Record<number, SpecValues> = {};
    initial?.elements?.forEach((s) => {
      const id = s.element?.id ?? s.element_id;
      if (id !== undefined) {
        map[id] = {
          exact: String(Number(s.exact_value)),
          plus: String(Number(s.plus_value)),
          minus: String(Number(s.minus_value)),
        };
      }
    });
    setSpecs(map);

    setBadSpecIds([]);
    setErrors({});
  }, [open, initial]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const ironTypeOptions: SelectOption[] = useMemo(
    () =>
      [...ironTypes]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((i) => ({ id: i.id, label: i.name })),
    [ironTypes]
  );

  // Elements that belong to the selected iron type
  const ironTypeElements = useMemo(() => {
    const it = ironTypes.find((i) => i.id === ironTypeId);
    return it ? [...it.elements].sort((a, b) => a.sequence_order - b.sequence_order) : [];
  }, [ironTypes, ironTypeId]);

  // Changing the iron type keeps only the specs that still apply
  const handleIronTypeChange = (id: number) => {
    const it = ironTypes.find((i) => i.id === id);
    setIronTypeId(id);
    setSpecs((prev) => {
      const next: Record<number, SpecValues> = {};
      it?.elements.forEach((el) => {
        if (prev[el.id]) next[el.id] = prev[el.id];
      });
      return next;
    });
    setBadSpecIds([]);
    setErrors((e) => ({ ...e, ironType: undefined, specs: undefined }));
  };

  const setSpecField = (id: number, field: keyof SpecValues, value: string) => {
    setSpecs((prev) => ({
      ...prev,
      [id]: { exact: "", plus: "", minus: "", ...prev[id], [field]: value },
    }));
    setBadSpecIds((prev) => prev.filter((x) => x !== id));
  };

  // Live casting yield
  const pouringNum = Number(pouring);
  const castingNum = Number(casting);
  const showYield = pouring !== "" && casting !== "" && pouringNum > 0 && castingNum > 0;
  const yieldPct = showYield ? (castingNum / pouringNum) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};

    const isInt = (v: string) => v.trim() !== "" && Number.isInteger(Number(v)) && Number(v) >= 1;

    if (customerId === null) errs.customer = "Select a customer";
    if (productId === null) errs.product = "Select a product";
    if (!drawingNo.trim()) errs.drawingNo = "Drawing number is required";
    if (ironTypeId === null) errs.ironType = "Select an iron type";
    if (packingId === null) errs.packing = "Select a packing";
    if (hardnessId === null) errs.hardness = "Select a hardness";
    if (inoculantId === null) errs.inoculant = "Select an inoculant";

    if (pouring.trim() === "" || !Number.isFinite(pouringNum) || pouringNum <= 0)
      errs.pouring = "Enter a weight greater than 0";
    if (casting.trim() === "" || !Number.isFinite(castingNum) || castingNum <= 0)
      errs.casting = "Enter a weight greater than 0";
    if (!isInt(noCasting)) errs.noCasting = "Enter a whole number, 1 or higher";
    if (!isInt(noCavity)) errs.noCavity = "Enter a whole number, 1 or higher";

    // Every element of the iron type needs a valid spec
    const num = (v: string | undefined) => Number((v ?? "").trim());
    const bad = ironTypeElements
      .filter((el) => {
        const s = specs[el.id];
        const exactRaw = (s?.exact ?? "").trim();
        const exact = num(s?.exact);
        const plus = (s?.plus ?? "").trim() === "" ? 0 : num(s?.plus);
        const minus = (s?.minus ?? "").trim() === "" ? 0 : num(s?.minus);
        return (
          exactRaw === "" ||
          !Number.isFinite(exact) || exact < 0 ||
          !Number.isFinite(plus) || plus < 0 ||
          !Number.isFinite(minus) || minus < 0
        );
      })
      .map((el) => el.id);

    if (ironTypeId !== null && ironTypeElements.length === 0)
      errs.specs = "This iron type has no elements. Add elements to it first.";
    else if (bad.length > 0)
      errs.specs = "Enter an exact value for every element (tolerances must be 0 or more)";

    setBadSpecIds(bad);
    setErrors(errs);

    if (
      Object.keys(errs).length ||
      customerId === null || productId === null || ironTypeId === null ||
      packingId === null || hardnessId === null || inoculantId === null
    )
      return;

    onSubmit({
      customer_id: customerId,
      product_id: productId,
      drawing_no: drawingNo.trim(),
      iron_type_id: ironTypeId,
      packing_id: packingId,
      hardness_id: hardnessId,
      inoculant_id: inoculantId,
      pouring_weight_kg: pouringNum,
      casting_weight_kg: castingNum,
      no_of_casting: Number(noCasting),
      no_of_cavity: Number(noCavity),
      elements: ironTypeElements.map((el) => {
        const s = specs[el.id];
        return {
          element_id: el.id,
          exact_value: num(s?.exact),
          plus_value: (s?.plus ?? "").trim() === "" ? 0 : num(s?.plus),
          minus_value: (s?.minus ?? "").trim() === "" ? 0 : num(s?.minus),
        };
      }),
    });
  };

  // Small helper to render one dropdown field
  const renderSelect = (
    label: string,
    value: number | null,
    onChange: (id: number) => void,
    lookup: LookupState,
    placeholder: string,
    emptyText: string,
    error?: string
  ) => (
    <div className={`es-field ${error ? "has-error" : ""}`}>
      <span>{label}</span>
      <SearchSelect
        options={lookup.options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchPlaceholder={`Search ${label.toLowerCase()}...`}
        emptyText={emptyText}
        loading={lookup.loading}
        loadError={lookup.error}
        invalid={Boolean(error)}
      />
      {error && <small>{error}</small>}
    </div>
  );

  return (
    <>
      <div className={`es-overlay ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`es-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="es-drawer__head">
          <div>
            <h2>{initial ? "Edit aim" : "New aim"}</h2>
            <p>{initial ? "Update the aim details." : "Define the casting aim and its chemical specification."}</p>
          </div>
          <button type="button" className="es-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="es-form" noValidate>
          {/* Basic */}
          <div className="as-section">Basic details</div>

          {renderSelect("Customer", customerId, setCustomerId, customers, "Select customer", "No customers found.", errors.customer)}
          {renderSelect("Product", productId, setProductId, products, "Select product", "No products found.", errors.product)}

          <label className={`es-field ${errors.drawingNo ? "has-error" : ""}`}>
            <span>Drawing no</span>
            <input
              value={drawingNo}
              onChange={(e) => setDrawingNo(e.target.value)}
              placeholder="e.g. DWG-001"
            />
            {errors.drawingNo && <small>{errors.drawingNo}</small>}
          </label>

          {/* Materials */}
          <div className="as-section">Materials</div>

          <div className={`es-field ${errors.ironType ? "has-error" : ""}`}>
            <span>Iron type</span>
            <SearchSelect
              options={ironTypeOptions}
              value={ironTypeId}
              onChange={handleIronTypeChange}
              placeholder="Select iron type"
              searchPlaceholder="Search iron type..."
              emptyText="No iron types found. Add them in Iron Type Master first."
              loading={ironTypesLoading}
              loadError={ironTypesError}
              invalid={Boolean(errors.ironType)}
            />
            {errors.ironType && <small>{errors.ironType}</small>}
          </div>

          {renderSelect("Packing", packingId, setPackingId, packings, "Select packing", "No packings found.", errors.packing)}
          {renderSelect("Hardness", hardnessId, setHardnessId, hardnesses, "Select hardness", "No hardness values found.", errors.hardness)}
          {renderSelect("Inoculant", inoculantId, setInoculantId, inoculants, "Select inoculant", "No inoculants found.", errors.inoculant)}

          {/* Weights and counts */}
          <div className="as-section">Weights and counts</div>

          <div className="es-row">
            <label className={`es-field ${errors.pouring ? "has-error" : ""}`}>
              <span>Pouring weight (kg)</span>
              <input type="number" min="0" step="0.001" value={pouring} onChange={(e) => setPouring(e.target.value)} placeholder="25.500" />
              {errors.pouring && <small>{errors.pouring}</small>}
            </label>

            <label className={`es-field ${errors.casting ? "has-error" : ""}`}>
              <span>Casting weight (kg)</span>
              <input type="number" min="0" step="0.001" value={casting} onChange={(e) => setCasting(e.target.value)} placeholder="20.000" />
              {errors.casting && <small>{errors.casting}</small>}
            </label>
          </div>

          <div className="es-row">
            <label className={`es-field ${errors.noCasting ? "has-error" : ""}`}>
              <span>No. of casting</span>
              <input type="number" min="1" step="1" value={noCasting} onChange={(e) => setNoCasting(e.target.value)} placeholder="4" />
              {errors.noCasting && <small>{errors.noCasting}</small>}
            </label>

            <label className={`es-field ${errors.noCavity ? "has-error" : ""}`}>
              <span>No. of cavity</span>
              <input type="number" min="1" step="1" value={noCavity} onChange={(e) => setNoCavity(e.target.value)} placeholder="2" />
              {errors.noCavity && <small>{errors.noCavity}</small>}
            </label>
          </div>

          {showYield && (
            <div className="as-yield">
              <span>Casting yield</span>
              <strong>{yieldPct.toFixed(1)}%</strong>
            </div>
          )}

          {/* Chemical specification */}
          <div className="as-section">Chemical specification</div>

          <div className={`as-specbox ${errors.specs ? "has-error" : ""}`}>
            {ironTypeId === null ? (
              <p className="as-specbox__hint">Select an iron type to enter its element values.</p>
            ) : ironTypeElements.length === 0 ? (
              <p className="as-specbox__hint">This iron type has no elements.</p>
            ) : (
              <>
                <div className="as-spec as-spec--head">
                  <span>Element</span>
                  <span>Exact %</span>
                  <span>Plus +</span>
                  <span>Minus −</span>
                </div>

                {ironTypeElements.map((el) => (
                  <div
                    key={el.id}
                    className={`as-spec ${badSpecIds.includes(el.id) ? "is-bad" : ""}`}
                  >
                    <span className="as-spec__name" title={el.name}>
                      <b>{el.abbreviation}</b>
                      {el.name}
                    </span>
                    <input
                      type="number" min="0" step="0.01" placeholder="0.00"
                      value={specs[el.id]?.exact ?? ""}
                      onChange={(e) => setSpecField(el.id, "exact", e.target.value)}
                    />
                    <input
                      type="number" min="0" step="0.01" placeholder="0.00"
                      value={specs[el.id]?.plus ?? ""}
                      onChange={(e) => setSpecField(el.id, "plus", e.target.value)}
                    />
                    <input
                      type="number" min="0" step="0.01" placeholder="0.00"
                      value={specs[el.id]?.minus ?? ""}
                      onChange={(e) => setSpecField(el.id, "minus", e.target.value)}
                    />
                  </div>
                ))}
              </>
            )}

            {errors.specs && <small className="as-specbox__error">{errors.specs}</small>}
          </div>

          <footer className="es-form__foot">
            <button type="button" className="es-btn es-btn--ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="es-btn es-btn--primary" disabled={saving}>
              {saving ? "Saving..." : initial ? "Save changes" : "Add aim"}
            </button>
          </footer>
        </form>
      </aside>
    </>
  );
}