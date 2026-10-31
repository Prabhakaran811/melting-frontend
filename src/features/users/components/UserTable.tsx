import type { User } from "../userTypes";
import Icon from "../../../components/common/Icon";
interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export default function UserTable({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
}: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="empty-state">
        <strong>No employees found</strong>
        <p className="muted">Try a different search or filter.</p>
      </div>
    );
  }

  return (
    <div className="user-table-wrapper">
      <table className="user-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Employee ID</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="person">
                  <span className="person-avatar" aria-hidden="true">
                    {initials(user.full_name)}
                  </span>
                  <div>
                    <p className="person-name">{user.full_name}</p>
                    <p className="person-email">{user.email}</p>
                  </div>
                </div>
              </td>
              <td>{user.employee_id}</td>
              <td>{user.phone_number}</td>
              <td>
                <span className="role-badge">{user.role}</span>
              </td>
              <td>
                <span
                  className={`status-pill ${
                    user.is_active ? "status-active" : "status-inactive"
                  }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              
<td>
  <div className="table-actions icon-actions">

    {/* Edit */}
    <button
      type="button"
      className="icon-action edit-action"
      onClick={() => onEdit(user)}
      title="Edit employee"
      aria-label={`Edit ${user.full_name}`}
    >
      <Icon name="edit" size={18} />
    </button>

    {/* Activate / Deactivate */}
    <button
      type="button"
      className={`icon-action ${
        user.is_active ? "deactivate-action" : "activate-action"
      }`}
      onClick={() => onToggleStatus(user)}
      title={user.is_active ? "Deactivate employee" : "Activate employee"}
      aria-label={
        user.is_active
          ? `Deactivate ${user.full_name}`
          : `Activate ${user.full_name}`
      }
    >
      {user.is_active ? (
        <Icon name="power" size={18} />
      ) : (
        <Icon name="check" size={18} />
      )}
    </button>

    {/* Delete */}
    <button
      type="button"
      className="icon-action delete-action"
      onClick={() => onDelete(user)}
      title="Delete employee"
      aria-label={`Delete ${user.full_name}`}
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