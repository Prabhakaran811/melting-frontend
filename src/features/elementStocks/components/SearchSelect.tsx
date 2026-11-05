import { useEffect, useMemo, useRef, useState } from "react";

export interface SelectOption {
  id: number;
  label: string;
  badge?: string;
}

interface Props {
  options: SelectOption[];
  value: number | null;
  onChange: (id: number) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  loadError?: boolean;
  invalid?: boolean;
}

export default function SearchSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.badge ?? "").toLowerCase().includes(q)
    );
  }, [options, query]);

  const selected = options.find((o) => o.id === value) ?? null;

  const label = loading
    ? "Loading..."
    : loadError
    ? "Could not load options"
    : selected
    ? selected.label
    : placeholder;

  const pick = (id: number) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="es-select" ref={wrapRef}>
      <button
        type="button"
        className={`es-select__trigger ${open ? "is-open" : ""} ${invalid ? "is-invalid" : ""}`}
        onClick={() => setOpen((o) => !o)}
        disabled={loading || loadError}
      >
        <span className={selected ? "" : "is-placeholder"}>
          {selected?.badge && <b className="es-select__badge">{selected.badge}</b>}
          {label}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="es-select__panel">
          <input
            className="es-select__search"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="es-select__list">
            {options.length === 0 ? (
              <div className="es-select__empty">{emptyText}</div>
            ) : visible.length === 0 ? (
              <div className="es-select__empty">No match for "{query}"</div>
            ) : (
              visible.map((o) => (
                <button
                  type="button"
                  key={o.id}
                  className={`es-select__option ${o.id === value ? "is-selected" : ""}`}
                  onClick={() => pick(o.id)}
                >
                  <span className="es-select__avatar">{o.badge || o.label.charAt(0).toUpperCase()}</span>
                  <span className="es-select__name">{o.label}</span>
                  {o.id === value && <span className="es-select__tick">✓</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}