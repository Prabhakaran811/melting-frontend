import type { Element } from "../elementTypes";

interface Props {
  element: Element;
  accentIndex: number;
  onEdit: (el: Element) => void;
  onDelete: (el: Element) => void;
}

const ACCENTS = ["orange", "dark", "green", "red", "blue"];

export default function ElementCard({ element, accentIndex, onEdit, onDelete }: Props) {
  const accent = ACCENTS[accentIndex % ACCENTS.length];

  return (
    <article className={`el-tile el-accent-${accent}`}>
      <span className="el-tile__order">{String(element.sequence_order).padStart(2, "0")}</span>

      <div className="el-tile__actions">
        <button type="button" title="Edit" onClick={() => onEdit(element)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
        <button type="button" title="Delete" className="is-danger" onClick={() => onDelete(element)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M6 6l1 14h10l1-14" />
          </svg>
        </button>
      </div>

      <div className="el-tile__symbol">{element.abbreviation}</div>
      <div className="el-tile__name">{element.name}</div>
    </article>
  );
}