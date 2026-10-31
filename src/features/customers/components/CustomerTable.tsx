import type { Customer } from "../customerTypes";
import Icon from "../../../components/common/Icon";

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export default function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onToggleStatus,
}: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="empty-state">
        <strong>No customers found</strong>
        <p className="muted">Try a different search or filter.</p>
      </div>
    );
  }

  return (
    <div className="customer-table-wrapper">
      <table className="customer-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>
                <div className="person">
                  <span className="person-avatar" aria-hidden="true">
                    {initials(customer.customer_name)}
                  </span>

                  <div>
                    <p className="person-name">
                      {customer.customer_name}
                    </p>
                    <p className="person-email">{customer.email}</p>
                  </div>
                </div>
              </td>

              <td>{customer.phone_number}</td>

              <td className="customer-address-cell">
                {customer.address}
              </td>

              <td>
                <span
                  className={`status-pill ${
                    customer.is_active
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >
                  {customer.is_active ? "Active" : "Inactive"}
                </span>
              </td>

              <td>
                <div className="table-actions icon-actions">
                  <button
                    type="button"
                    className="icon-action edit-action"
                    onClick={() => onEdit(customer)}
                    title="Edit customer"
                    aria-label={`Edit ${customer.customer_name}`}
                  >
                    <Icon name="edit" size={18} />
                  </button>

                  <button
                    type="button"
                    className={`icon-action ${
                      customer.is_active
                        ? "deactivate-action"
                        : "activate-action"
                    }`}
                    onClick={() => onToggleStatus(customer)}
                    title={
                      customer.is_active
                        ? "Deactivate customer"
                        : "Activate customer"
                    }
                    aria-label={
                      customer.is_active
                        ? `Deactivate ${customer.customer_name}`
                        : `Activate ${customer.customer_name}`
                    }
                  >
                    {customer.is_active ? (
                      <Icon name="power" size={18} />
                    ) : (
                      <Icon name="check" size={18} />
                    )}
                  </button>

                  <button
                    type="button"
                    className="icon-action delete-action"
                    onClick={() => onDelete(customer)}
                    title="Permanently delete customer"
                    aria-label={`Delete ${customer.customer_name}`}
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