import { useEffect, useState } from "react";
import type { RawMaterial } from "../../rawMaterials/rawMaterialTypes";
import type { Wire, CreateWireRequest } from "../wireTypes";
import RawMaterialSelect from "./RawMaterialSelect";

interface Props {
  open: boolean;
  initial: Wire | null;
  rawMaterials: RawMaterial[];
  rawMaterialsLoading: boolean;
  rawMaterialsError: boolean;
  existing: Wire[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateWireRequest) => void;
}

interface Errors {
  name?: string;
  rawMaterial?: string;
}

export default function WireForm({
  open,
  initial,
  rawMaterials,
  rawMaterialsLoading,
  rawMaterialsError,
  existing,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [rawMaterialId, setRawMaterialId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  // Reset whenever the drawer opens
  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setRawMaterialId(initial?.raw_material_id ?? null);
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
    const others = existing.filter((w) => w.id !== initial?.id);

    if (!trimmed) errs.name = "Wire name is required";
    else if (others.some((w) => w.name.toLowerCase() === trimmed.toLowerCase()))
      errs.name = "This wire already exists";

    if (rawMaterialId === null || !rawMaterials.some((r) => r.id === rawMaterialId))
      errs.rawMaterial = "Select a raw material";

    setErrors(errs);
    if (Object.keys(errs).length || rawMaterialId === null) return;

    onSubmit({ name: trimmed, raw_material_id: rawMaterialId });
  };

  return (
    <>
      <div className={`wr-overlay ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`wr-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="wr-drawer__head">
          <div>
            <h2>{initial ? "Edit wire" : "New wire"}</h2>
            <p>{initial ? "Update the wire name or raw material." : "Name the wire and link its raw material."}</p>
          </div>
          <button type="button" className="wr-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="wr-form" noValidate>
          <label className={`wr-field ${errors.name ? "has-error" : ""}`}>
            <span>Wire name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Magnesium Cored Wire"
              autoFocus
            />
            {errors.name && <small>{errors.name}</small>}
          </label>

          <div className={`wr-field ${errors.rawMaterial ? "has-error" : ""}`}>
            <span>Raw material</span>
            <RawMaterialSelect
              options={rawMaterials}
              value={rawMaterialId}
              onChange={setRawMaterialId}
              loading={rawMaterialsLoading}
              loadError={rawMaterialsError}
              invalid={Boolean(errors.rawMaterial)}
            />
            {errors.rawMaterial && <small>{errors.rawMaterial}</small>}
          </div>

          <footer className="wr-form__foot">
            <button type="button" className="wr-btn wr-btn--ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="wr-btn wr-btn--primary" disabled={saving}>
              {saving ? "Saving..." : initial ? "Save changes" : "Add wire"}
            </button>
          </footer>
        </form>
      </aside>
    </>
  );
}