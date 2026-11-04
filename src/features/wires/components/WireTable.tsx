import type { Wire } from "../wireTypes";

interface Props {
  items: Wire[];
  onEdit: (item: Wire) => void;
  onDelete: (item: Wire) => void;
}

export default function WireTable({ items, onEdit, onDelete }: Props) {
  return (
    <div className="wr-table-wrap">
      <table className="wr-table">
        <thead>
          <tr>
            <th>Wire</th>
            <th>Raw Material</th>
            <th className="wr-col-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {/* Wire */}
              <td>
                <div className="wr-name">
                  <div className="wr-name__icon">{item.name.charAt(0).toUpperCase()}</div>
                  <strong>{item.name}</strong>
                </div>
              </td>

              {/* Raw material */}
              <td>
                {item.raw_material ? (
                  <span className="wr-material">
                    <i />
                    {item.raw_material.name}
                  </span>
                ) : (
                  <span className="wr-none">Not linked</span>
                )}
              </td>

              {/* Actions */}
              <td className="wr-col-actions">
                <div className="wr-actions">
                  <button type="button" title="Edit" onClick={() => onEdit(item)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                  <button type="button" title="Delete" className="is-danger" onClick={() => onDelete(item)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M6 6l1 14h10l1-14" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}