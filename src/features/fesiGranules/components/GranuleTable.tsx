import type { Granule } from "../granuleTypes";
import Icon from "../../../components/common/Icon";

interface GranuleTableProps {
  granules: Granule[];
  onEdit: (granule: Granule) => void;
  onDelete: (granule: Granule) => void;
}

export default function GranuleTable({
  granules,
  onEdit,
  onDelete,
}: GranuleTableProps) {
  if (granules.length === 0) {
    return (
      <div className="empty-state">
        <strong>No FeSi granules found</strong>
        <p className="muted">Try a different search or add a FeSi granule.</p>
      </div>
    );
  }

  return (
    <div className="granule-table-wrapper">
      <table className="granule-table">
        <thead>
          <tr>
            <th>FeSi granule</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {granules.map((granule) => (
            <tr key={granule.id}>
              <td>
                <div className="person">
                  <span className="person-avatar" aria-hidden="true">
                    <Icon name="factory" size={14} />
                  </span>
                  <p className="person-name">{granule.name}</p>
                </div>
              </td>

              <td>
                <div className="table-actions icon-actions">
                  <button
                    type="button"
                    className="icon-action edit-action"
                    onClick={() => onEdit(granule)}
                    title="Edit FeSi granule"
                    aria-label={`Edit ${granule.name}`}
                  >
                    <Icon name="edit" size={18} />
                  </button>

                  <button
                    type="button"
                    className="icon-action delete-action"
                    onClick={() => onDelete(granule)}
                    title="Permanently delete FeSi granule"
                    aria-label={`Delete ${granule.name}`}
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