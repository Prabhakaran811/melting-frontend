import type { Inoculant } from "../inoculantTypes";
import Icon from "../../../components/common/Icon";

interface InoculantTableProps {
  inoculants: Inoculant[];
  onEdit: (inoculant: Inoculant) => void;
  onDelete: (inoculant: Inoculant) => void;
}

export default function InoculantTable({
  inoculants,
  onEdit,
  onDelete,
}: InoculantTableProps) {
  if (inoculants.length === 0) {
    return (
      <div className="empty-state">
        <strong>No inoculants found</strong>
        <p className="muted">Try a different search or add an inoculant.</p>
      </div>
    );
  }

  return (
    <div className="inoculant-table-wrapper">
      <table className="inoculant-table">
        <thead>
          <tr>
            <th>Inoculant</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {inoculants.map((inoculant) => (
            <tr key={inoculant.id}>
              <td>
                <div className="person">
                  <span className="person-avatar" aria-hidden="true">
                    <Icon name="flame" size={14} />
                  </span>
                  <p className="person-name">{inoculant.name}</p>
                </div>
              </td>

              <td>
                <div className="table-actions icon-actions">
                  <button
                    type="button"
                    className="icon-action edit-action"
                    onClick={() => onEdit(inoculant)}
                    title="Edit inoculant"
                    aria-label={`Edit ${inoculant.name}`}
                  >
                    <Icon name="edit" size={18} />
                  </button>

                  <button
                    type="button"
                    className="icon-action delete-action"
                    onClick={() => onDelete(inoculant)}
                    title="Permanently delete inoculant"
                    aria-label={`Delete ${inoculant.name}`}
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