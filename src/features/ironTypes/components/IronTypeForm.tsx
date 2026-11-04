import { useEffect, useState } from "react";
import type { Element } from "../../elements/elementTypes";
import type { IronType, CreateIronTypeRequest } from "../ironTypeTypes";
import ElementMultiSelect from "./ElementMultiSelect";

interface Props {
  open: boolean;
  initial: IronType | null;
  elements: Element[];
  elementsLoading: boolean;
  elementsError: boolean;
  existing: IronType[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateIronTypeRequest) => void;
}

interface Errors {
  name?: string;
  elements?: string;
}

export default function IronTypeForm({
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

    if (!trimmed) errs.name = "Iron type name is required";
    else if (others.some((i) => i.name.toLowerCase() === trimmed.toLowerCase()))
      errs.name = "This iron type already exists";

    if (validIds.length === 0) errs.elements = "Select at least one element";

    setErrors(errs);
    if (Object.keys(errs).length) return;

    onSubmit({ name: trimmed, element_ids: validIds });
  };

  const previewElements = elements
    .filter((el) => selectedIds.includes(el.id))
    .sort((a, b) => a.sequence_order - b.sequence_order);

  return (
    <>
      <div className={`it-overlay ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`it-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="it-drawer__head">
          <div>
            <h2>{initial ? "Edit iron type" : "New iron type"}</h2>
            <p>{initial ? "Update the name or elements." : "Choose the elements this iron type tracks."}</p>
          </div>
          <button type="button" className="it-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        {/* Live preview */}
        <div className="it-preview">
          <article className="it-card it-accent-orange it-card--preview">
            <div className="it-card__top">
              <div className="it-card__icon">{(name.trim().charAt(0) || "?").toUpperCase()}</div>
              <div className="it-card__title">
                <h3>{name.trim() || "Iron type name"}</h3>
                <span>
                  {previewElements.length} element{previewElements.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
            <div className="it-card__elements">
              {previewElements.length === 0 ? (
                <span className="it-card__none">No elements selected</span>
              ) : (
                previewElements.map((el) => (
                  <span className="it-el" key={el.id}>
                    <em>{el.sequence_order}</em>
                    {el.abbreviation}
                  </span>
                ))
              )}
            </div>
          </article>
          <span className="it-preview__label">Live preview</span>
        </div>

        <form onSubmit={handleSubmit} className="it-form" noValidate>
          <label className={`it-field ${errors.name ? "has-error" : ""}`}>
            <span>Iron type name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grey Cast Iron"
              autoFocus
            />
            {errors.name && <small>{errors.name}</small>}
          </label>

          <div className={`it-field ${errors.elements ? "has-error" : ""}`}>
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

          <footer className="it-form__foot">
            <button type="button" className="it-btn it-btn--ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="it-btn it-btn--primary" disabled={saving}>
              {saving ? "Saving..." : initial ? "Save changes" : "Add iron type"}
            </button>
          </footer>
        </form>
      </aside>
    </>
  );
}