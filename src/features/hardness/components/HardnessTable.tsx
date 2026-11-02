import type { Hardness } from "../hardnessTypes";
import Icon from "../../../components/common/Icon";

interface HardnessTableProps {
  hardnesses: Hardness[];
  onEdit: (hardness: Hardness) => void;
  onDelete: (hardness: Hardness) => void;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function HardnessTable({
  hardnesses,
  onEdit,
  onDelete,
}: HardnessTableProps) {
  if (hardnesses.length === 0) {
    return (
      <div className="empty-state">
        <strong>No hardness types found</strong>
        <p className="muted">Try a different search or add a hardness type.</p>
      </div>
    );
  }

  return (
    <div className="hardness-table-wrapper">
      <table className="hardness-table">
        <thead>
          <tr>
            <th>Hardness</th>
            <th>Created</th>
            <th>Last updated</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {hardnesses.map((hardness) => (
            <tr key={hardness.id}>
              <td>
                <div className="person">
                  <span className="person-avatar" aria-hidden="true">
                    <Icon name="inspect" size={14} />
                  </span>
                  <p className="person-name">{hardness.hardness_name}</p>
                </div>
              </td>

              <td>{formatDate(hardness.created_at)}</td>
              <td>{formatDate(hardness.updated_at)}</td>

              <td>
                <div className="table-actions icon-actions">
                  <button
                    type="button"
                    className="icon-action edit-action"
                    onClick={() => onEdit(hardness)}
                    title="Edit hardness"
                    aria-label={`Edit ${hardness.hardness_name}`}
                  >
                    <Icon name="edit" size={18} />
                  </button>

                  <button
                    type="button"
                    className="icon-action delete-action"
                    onClick={() => onDelete(hardness)}
                    title="Permanently delete hardness"
                    aria-label={`Delete ${hardness.hardness_name}`}
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