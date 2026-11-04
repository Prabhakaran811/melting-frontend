import { useEffect, useState } from "react";
import type { Element } from "../../elements/elementTypes";
import type { RawMaterial, CreateRawMaterialRequest } from "../rawMaterialTypes";
import ElementMultiSelect from "../../ironTypes/components/ElementMultiSelect";

// The dropdown's styles live in the Iron Type stylesheet (all classes are "it-" prefixed)
import "../../ironTypes/IronTypeManagement.css";

interface Props {
  open: boolean;
  initial: RawMaterial | null;
  elements: Element[];
  elementsLoading: boolean;
  elementsError: boolean;
  existing: RawMaterial[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRawMaterialRequest) => void;
}

interface Errors {
  name?: string;
  elements?: string;
}

export default function RawMaterialForm({
  open,
  initial,
  elements,
  elementsLoading,
  elementsError,
  existing,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  // Reset whenever the drawer opens
  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setSelectedIds(initial?.elements.map((e) => e.id) ?? []);
    setErrors({});
  }, [open, initial]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const errs: Errors = {};
    const others = existing.filter((i) => i.id !== initial?.id);

    // Only send IDs that still exist in the element list
    const validIds = selectedIds.filter((id) => elements.some((el) => el.id === id));

    if (!trimmed) errs.name = "Raw material name is required";
    else if (others.some((i) => i.name.toLowerCase() === trimmed.toLowerCase()))
      errs.name = "This raw material already exists";

    if (validIds.length === 0) errs.elements = "Select at least one element";

    setErrors(errs);
    if (Object.keys(errs).length) return;

    onSubmit({ name: trimmed, element_ids: validIds });
  };

  return (
    <>
      <div className={`rm-overlay ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`rm-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="rm-drawer__head">
          <div>
            <h2>{initial ? "Edit raw material" : "New raw material"}</h2>
            <p>{initial ? "Update the name or elements." : "Choose the elements this material contains."}</p>
          </div>
          <button type="button" className="rm-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="rm-form" noValidate>
          <label className={`rm-field ${errors.name ? "has-error" : ""}`}>
            <span>Raw material name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pig Iron"
              autoFocus
            />
            {errors.name && <small>{errors.name}</small>}
          </label>

          <div className={`rm-field ${errors.elements ? "has-error" : ""}`}>
            <span>Elements</span>
            <ElementMultiSelect
              options={elements}
              value={selectedIds}
              onChange={setSelectedIds}
              loading={elementsLoading}
              loadError={elementsError}
              invalid={Boolean(errors.elements)}
            />
            {errors.elements && <small>{errors.elements}</small>}
          </div>

          <p className="rm-hint">
            Iron types are linked automatically through the elements you choose.
          </p>

          <footer className="rm-form__foot">
            <button type="button" className="rm-btn rm-btn--ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="rm-btn rm-btn--primary" disabled={saving}>
              {saving ? "Saving..." : initial ? "Save changes" : "Add raw material"}
            </button>
          </footer>
        </form>
      </aside>
    </>
  );
}