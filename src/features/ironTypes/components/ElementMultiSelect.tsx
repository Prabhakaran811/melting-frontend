import { useEffect, useMemo, useRef, useState } from "react";
import type { Element } from "../../elements/elementTypes";

interface Props {
  options: Element[];
  value: number[];
  onChange: (ids: number[]) => void;
  loading?: boolean;
  loadError?: boolean;
  invalid?: boolean;
}

export default function ElementMultiSelect({
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

  const sortedOptions = useMemo(
    () => [...options].sort((a, b) => a.sequence_order - b.sequence_order),
    [options]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedOptions;
    return sortedOptions.filter(
      (o) => o.name.toLowerCase().includes(q) || o.abbreviation.toLowerCase().includes(q)
    );
  }, [sortedOptions, query]);

  const selected = sortedOptions.filter((o) => value.includes(o.id));

  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const selectAll = () => onChange(sortedOptions.map((o) => o.id));
  const clearAll = () => onChange([]);

  const label = loading
    ? "Loading elements..."
    : loadError
    ? "Could not load elements"
    : selected.length
    ? `${selected.length} element${selected.length > 1 ? "s" : ""} selected`
    : "Select elements";

  return (
    <div className="it-ms" ref={wrapRef}>
      <button
        type="button"
        className={`it-ms__trigger ${open ? "is-open" : ""} ${invalid ? "is-invalid" : ""}`}
        onClick={() => setOpen((o) => !o)}
        disabled={loading || loadError}
      >
        <span className={selected.length ? "" : "is-placeholder"}>{label}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="it-ms__panel">
          <input
            className="it-ms__search"
            placeholder="Search element..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="it-ms__tools">
            <button type="button" onClick={selectAll}>Select all</button>
            <button type="button" onClick={clearAll}>Clear</button>
          </div>

          <div className="it-ms__list">
            {sortedOptions.length === 0 ? (
              <div className="it-ms__empty">No elements found. Add them in Element Master first.</div>
            ) : visible.length === 0 ? (
              <div className="it-ms__empty">No match for "{query}"</div>
            ) : (
              visible.map((o) => {
                const checked = value.includes(o.id);
                return (
                  <button
                    type="button"
                    key={o.id}
                    className={`it-ms__option ${checked ? "is-checked" : ""}`}
                    onClick={() => toggle(o.id)}
                  >
                    <span className="it-ms__check">{checked ? "✓" : ""}</span>
                    <span className="it-ms__symbol">{o.abbreviation}</span>
                    <span className="it-ms__name">{o.name}</span>
                    <span className="it-ms__order">#{o.sequence_order}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div className="it-ms__chips">
          {selected.map((o) => (
            <span className="it-selchip" key={o.id}>
              <b>{o.abbreviation}</b> {o.name}
              <button type="button" onClick={() => toggle(o.id)} aria-label={`Remove ${o.name}`}>
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}