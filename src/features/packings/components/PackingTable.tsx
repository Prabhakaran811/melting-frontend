import type { Packing } from "../packingTypes";
import Icon from "../../../components/common/Icon";

interface PackingTableProps {
  packings: Packing[];
  onEdit: (packing: Packing) => void;
  onDelete: (packing: Packing) => void;
}

export default function PackingTable({
  packings,
  onEdit,
  onDelete,
}: PackingTableProps) {
  if (packings.length === 0) {
    return (
      <div className="empty-state">
        <strong>No packing types found</strong>
        <p className="muted">Try a different search or add a packing type.</p>
      </div>
    );
  }

  return (
    <div className="packing-table-wrapper">
      <table className="packing-table">
        <thead>
          <tr>
            <th>Packing</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {packings.map((packing) => (
            <tr key={packing.id}>
              <td>
                <div className="person">
                  <span className="person-avatar" aria-hidden="true">
                    <Icon name="factory" size={14} />
                  </span>
                  <p className="person-name">{packing.name}</p>
                </div>
              </td>

              <td>
                <div className="table-actions icon-actions">
                  <button
                    type="button"
                    className="icon-action edit-action"
                    onClick={() => onEdit(packing)}
                    title="Edit packing"
                    aria-label={`Edit ${packing.name}`}
                  >
                    <Icon name="edit" size={18} />
                  </button>

                  <button
                    type="button"
                    className="icon-action delete-action"
                    onClick={() => onDelete(packing)}
                    title="Permanently delete packing"
                    aria-label={`Delete ${packing.name}`}
                  >
                    <Icon name="trash" size={18} />
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