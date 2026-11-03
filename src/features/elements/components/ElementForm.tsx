import { useEffect, useState } from "react";
import type { Element, ElementPayload } from "../elementTypes";

interface Props {
  open: boolean;
  initial: Element | null;
  nextOrder: number;
  existing: Element[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: ElementPayload) => void;
}

interface Errors {
  name?: string;
  abbreviation?: string;
  sequence_order?: string;
}

export default function ElementForm({ open, initial, nextOrder, existing, saving, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [order, setOrder] = useState<string>("1");
  const [errors, setErrors] = useState<Errors>({});

  // Reset the form whenever the drawer opens
  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setAbbreviation(initial?.abbreviation ?? "");
    setOrder(String(initial?.sequence_order ?? nextOrder));
    setErrors({});
  }, [open, initial, nextOrder]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const validate = (): ElementPayload | null => {
    const errs: Errors = {};
    const trimmedName = name.trim();
    const trimmedAbbr = abbreviation.trim();
    const orderNum = Number(order);
    const others = existing.filter((e) => e.id !== initial?.id);

    if (!trimmedName) errs.name = "Element name is required";
    else if (others.some((e) => e.name.toLowerCase() === trimmedName.toLowerCase()))
      errs.name = "This element already exists";

    if (!trimmedAbbr) errs.abbreviation = "Symbol is required";
    else if (trimmedAbbr.length > 3) errs.abbreviation = "Max 3 characters";
    else if (others.some((e) => e.abbreviation.toLowerCase() === trimmedAbbr.toLowerCase()))
      errs.abbreviation = "This symbol is already used";

    if (!Number.isInteger(orderNum) || orderNum < 1) errs.sequence_order = "Enter a whole number, 1 or higher";
    else if (others.some((e) => e.sequence_order === orderNum))
      errs.sequence_order = `Position ${orderNum} is already taken`;

    setErrors(errs);
    if (Object.keys(errs).length) return null;

    return { name: trimmedName, abbreviation: trimmedAbbr, sequence_order: orderNum };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = validate();
    if (payload) onSubmit(payload);
  };

  const previewOrder = Number(order) > 0 ? String(Number(order)).padStart(2, "0") : "--";

  return (
    <>
      <div className={`el-overlay ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`el-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="el-drawer__head">
          <div>
            <h2>{initial ? "Edit element" : "New element"}</h2>
            <p>{initial ? "Update the details below." : "Add a chemical element to your melt chemistry."}</p>
          </div>
          <button type="button" className="el-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        {/* Live preview */}
        <div className="el-preview">
          <div className="el-tile el-accent-orange el-tile--preview">
            <span className="el-tile__order">{previewOrder}</span>
            <div className="el-tile__symbol">{abbreviation.trim() || "?"}</div>
            <div className="el-tile__name">{name.trim() || "Element name"}</div>
          </div>
          <span className="el-preview__label">Live preview</span>
        </div>

        <form onSubmit={handleSubmit} className="el-form" noValidate>
          <label className={`el-field ${errors.name ? "has-error" : ""}`}>
            <span>Element name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Carbon"
              autoFocus
            />
            {errors.name && <small>{errors.name}</small>}
          </label>

          <div className="el-row">
            <label className={`el-field ${errors.abbreviation ? "has-error" : ""}`}>
              <span>Symbol</span>
              <input
                value={abbreviation}
                onChange={(e) => setAbbreviation(e.target.value)}
                placeholder="C"
                maxLength={3}
              />
              {errors.abbreviation && <small>{errors.abbreviation}</small>}
            </label>

            <label className={`el-field ${errors.sequence_order ? "has-error" : ""}`}>
              <span>Sequence order</span>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
              {errors.sequence_order && <small>{errors.sequence_order}</small>}
            </label>
          </div>

          <p className="el-hint">
            Sequence order decides where this element appears in reports and melt chemistry entry.
          </p>

          <footer className="el-form__foot">
            <button type="button" className="el-btn el-btn--ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="el-btn el-btn--primary" disabled={saving}>
              {saving ? "Saving..." : initial ? "Save changes" : "Add element"}
            </button>
          </footer>
        </form>
      </aside>
    </>
  );
}