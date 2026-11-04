import { useEffect, useMemo, useRef, useState } from "react";
import type { RawMaterial } from "../../rawMaterials/rawMaterialTypes";

interface Props {
  options: RawMaterial[];
  value: number | null;
  onChange: (id: number) => void;
  loading?: boolean;
  loadError?: boolean;
  invalid?: boolean;
}

export default function RawMaterialSelect({
  options,
  value,
  onChange,
  loading,
  loadError,
  invalid,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const sorted = useMemo(
    () => [...options].sort((a, b) => a.name.localeCompare(b.name)),
    [options]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? sorted.filter((o) => o.name.toLowerCase().includes(q)) : sorted;
  }, [sorted, query]);

  const selected = sorted.find((o) => o.id === value) ?? null;

  const label = loading
    ? "Loading raw materials..."
    : loadError
    ? "Could not load raw materials"
    : selected
    ? selected.name
    : "Select raw material";

  const pick = (id: number) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="wr-select" ref={wrapRef}>
      <button
        type="button"
        className={`wr-select__trigger ${open ? "is-open" : ""} ${invalid ? "is-invalid" : ""}`}
        onClick={() => setOpen((o) => !o)}
        disabled={loading || loadError}
      >
        <span className={selected ? "" : "is-placeholder"}>{label}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="wr-select__panel">
          <input
            className="wr-select__search"
            placeholder="Search raw material..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="wr-select__list">
            {sorted.length === 0 ? (
              <div className="wr-select__empty">No raw materials found. Add them in Raw Material Master first.</div>
            ) : visible.length === 0 ? (
              <div className="wr-select__empty">No match for "{query}"</div>
            ) : (
              visible.map((o) => (
                <button
                  type="button"
                  key={o.id}
                  className={`wr-select__option ${o.id === value ? "is-selected" : ""}`}
                  onClick={() => pick(o.id)}
                >
                  <span className="wr-select__avatar">{o.name.charAt(0).toUpperCase()}</span>
                  <span className="wr-select__name">{o.name}</span>
                  {o.id === value && <span className="wr-select__tick">✓</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}