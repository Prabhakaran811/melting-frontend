import type { Supplier } from "../supplierTypes";
import Icon from "../../../components/common/Icon";

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export default function SupplierTable({
  suppliers,
  onEdit,
  onDelete,
}: SupplierTableProps) {
  if (suppliers.length === 0) {
    return (
      <div className="empty-state">
        <strong>No suppliers found</strong>
        <p className="muted">Try a different search.</p>
      </div>
    );
  }

  return (
    <div className="supplier-table-wrapper">
      <table className="supplier-table">
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td>
                <div className="person">
                  <span className="person-avatar" aria-hidden="true">
                    {initials(supplier.name)}
                  </span>
                  <p className="person-name">{supplier.name}</p>
                </div>
              </td>

              <td>{supplier.phone_number}</td>

              <td className="supplier-address-cell" title={supplier.address}>
                {supplier.address}
              </td>

              <td>
                <div className="table-actions icon-actions">
                  <button
                    type="button"
                    className="icon-action edit-action"
                    onClick={() => onEdit(supplier)}
                    title="Edit supplier"
                    aria-label={`Edit ${supplier.name}`}
                  >
                    <Icon name="edit" size={18} />
                  </button>

                  <button
                    type="button"
                    className="icon-action delete-action"
                    onClick={() => onDelete(supplier)}
                    title="Delete supplier"
                    aria-label={`Delete ${supplier.name}`}
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