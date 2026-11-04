import type { IronType } from "../ironTypeTypes";

interface Props {
  ironType: IronType;
  accentIndex: number;
  onEdit: (item: IronType) => void;
  onDelete: (item: IronType) => void;
}

const ACCENTS = ["orange", "dark", "green", "red", "blue"];

export default function IronTypeCard({ ironType, accentIndex, onEdit, onDelete }: Props) {
  const accent = ACCENTS[accentIndex % ACCENTS.length];
  const elements = [...ironType.elements].sort((a, b) => a.sequence_order - b.sequence_order);

  return (
    <article className={`it-card it-accent-${accent}`}>
      <div className="it-card__top">
        <div className="it-card__icon">{ironType.name.charAt(0).toUpperCase()}</div>
        <div className="it-card__title">
          <h3 title={ironType.name}>{ironType.name}</h3>
          <span>
            {elements.length} element{elements.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="it-card__actions">
          <button type="button" title="Edit" onClick={() => onEdit(ironType)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button type="button" title="Delete" className="is-danger" onClick={() => onDelete(ironType)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M6 6l1 14h10l1-14" />
            </svg>
          </button>
        </div>
      </div>

      <div className="it-card__elements">
        {elements.length === 0 ? (
          <span className="it-card__none">No elements assigned</span>
        ) : (
          elements.map((el) => (
            <span className="it-el" key={el.id} title={`${el.name} · #${el.sequence_order}`}>
              <em>{el.sequence_order}</em>
              {el.abbreviation}
            </span>
          ))
        )}
      </div>
    </article>
  );
}