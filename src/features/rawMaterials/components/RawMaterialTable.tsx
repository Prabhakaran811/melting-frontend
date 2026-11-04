import type { RawMaterial, RawMaterialIronType } from "../rawMaterialTypes";

interface Props {
  items: RawMaterial[];
  onEdit: (item: RawMaterial) => void;
  onDelete: (item: RawMaterial) => void;
}

// Unique iron types gathered from all elements of a raw material
export function getIronTypes(material: RawMaterial): RawMaterialIronType[] {
  const map = new Map<number, RawMaterialIronType>();
  material.elements.forEach((el) =>
    (el.iron_types ?? []).forEach((it) => map.set(it.id, it))
  );
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default function RawMaterialTable({ items, onEdit, onDelete }: Props) {
  return (
    <div className="rm-table-wrap">
      <table className="rm-table">
        <thead>
          <tr>
            <th>Raw Material</th>
            <th>Elements</th>
            <th>Iron Types</th>
            <th className="rm-col-actions" aria-label="Actions" />
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const elements = [...item.elements].sort(
              (a, b) => a.sequence_order - b.sequence_order
            );
            const ironTypes = getIronTypes(item);

            return (
              <tr key={item.id}>
                {/* Raw material */}
                <td>
                  <div className="rm-name">
                    <div className="rm-name__icon">{item.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {elements.length} element{elements.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Elements */}
                <td>
                  <div className="rm-chips">
                    {elements.length === 0 ? (
                      <span className="rm-none">No elements</span>
                    ) : (
                      elements.map((el) => (
                        <span
                          className="rm-el"
                          key={el.id}
                          title={`${el.name} · #${el.sequence_order}`}
                        >
                          <b>{el.abbreviation}</b>
                          {el.name}
                        </span>
                      ))
                    )}
                  </div>
                </td>

                {/* Iron types */}
                <td>
                  <div className="rm-chips">
                    {ironTypes.length === 0 ? (
                      <span className="rm-none">Not linked</span>
                    ) : (
                      ironTypes.map((it) => (
                        <span className={`rm-iron rm-tone-${it.id % 5}`} key={it.id}>
                          <i />
                          {it.name}
                        </span>
                      ))
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="rm-col-actions">
                  <div className="rm-actions">
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}