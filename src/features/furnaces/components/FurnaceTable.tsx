import type { Furnace } from "../furnaceTypes";
import Icon from "../../../components/common/Icon";

interface FurnaceTableProps {
  furnaces: Furnace[];
  onEdit: (furnace: Furnace) => void;
  onToggleStatus: (furnace: Furnace) => void;
}

const formatCapacity = (value: string) =>
  Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });

export default function FurnaceTable({
  furnaces,
  onEdit,
  onToggleStatus,
}: FurnaceTableProps) {
  if (furnaces.length === 0) {
    return (
      <div className="empty-state">
        <strong>No furnaces found</strong>
        <p className="muted">Try a different search or filter.</p>
      </div>
    );
  }

  return (
    <div className="furnace-table-wrapper">
      <table className="furnace-table">
        <thead>
          <tr>
            <th>Furnace</th>
            <th>Furnace no.</th>
            <th>Reference no.</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {furnaces.map((furnace) => (
            <tr key={furnace.id}>
              <td>
                <div className="person">
                  <span className="person-avatar" aria-hidden="true">
                    <Icon name="flame" size={14} />
                  </span>
                  <p className="person-name">{furnace.name}</p>
                </div>
              </td>

              <td>{furnace.furnace_no}</td>
              <td>{furnace.ref_no}</td>
              <td>{formatCapacity(furnace.capacity)}</td>

              <td>
                <span
                  className={`status-pill ${
                    furnace.is_active ? "status-active" : "status-inactive"
                  }`}
                >
                  {furnace.is_active ? "Active" : "Inactive"}
                </span>
              </td>

              <td>
                <div className="table-actions icon-actions">
                  <button
                    type="button"
                    className="icon-action edit-action"
                    onClick={() => onEdit(furnace)}
                    title="Edit furnace"
                    aria-label={`Edit ${furnace.name}`}
                  >
                    <Icon name="edit" size={18} />
                  </button>

                  <button
                    type="button"
                    className={`icon-action ${
                      furnace.is_active
                        ? "deactivate-action"
                        : "activate-action"
                    }`}
                    onClick={() => onToggleStatus(furnace)}
                    title={
                      furnace.is_active
                        ? "Deactivate furnace"
                        : "Activate furnace"
                    }
                    aria-label={
                      furnace.is_active
                        ? `Deactivate ${furnace.name}`
                        : `Activate ${furnace.name}`
                    }
                  >
                    <Icon
                      name={furnace.is_active ? "power" : "check"}
                      size={18}
                    />
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