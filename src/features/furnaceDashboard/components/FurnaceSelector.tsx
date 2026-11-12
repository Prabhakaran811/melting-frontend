import type { Furnace } from "../furnaceDashboardTypes";

interface Props {
  furnaces: Furnace[];
  selectedId: number | null;
  loading: boolean;
  onSelect: (id: number) => void;
}

const toneOf = (f: Furnace): "running" | "available" | "inactive" => {
  if (!f.is_active) return "inactive";
  return (f.status ?? "").toLowerCase() === "running" ? "running" : "available";
};

export default function FurnaceSelector({ furnaces, selectedId, loading, onSelect }: Props) {
  if (loading) {
    return (
      <div className="fd-selector">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="fd-fcard fd-skeleton" key={i} />
        ))}
      </div>
    );
  }

  if (furnaces.length === 0) {
    return <div className="fd-note">No furnaces found. Add them in Furnace Master first.</div>;
  }

  return (
    <div className="fd-selector">
      {furnaces.map((f) => {
        const tone = toneOf(f);
        return (
          <button
            type="button"
            key={f.id}
            className={`fd-fcard fd-fcard--${tone} ${f.id === selectedId ? "is-selected" : ""}`}
            onClick={() => onSelect(f.id)}
          >
            <span className="fd-fcard__dot" />
            <div className="fd-fcard__body">
              <strong>{f.furnace_no}</strong>
              <span>{f.name}</span>
            </div>
            <div className="fd-fcard__meta">
              <em>{tone === "running" ? "Running" : tone === "inactive" ? "Inactive" : "Available"}</em>
              <small>{Number(f.capacity).toLocaleString("en-IN")} kg</small>
            </div>
          </button>
        );
      })}
    </div>
  );
}