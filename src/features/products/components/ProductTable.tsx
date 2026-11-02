import type { Product } from "../productTypes";
import Icon from "../../../components/common/Icon";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <strong>No products found</strong>
        <p className="muted">Try a different search or add a product.</p>
      </div>
    );
  }

  return (
    <div className="product-table-wrapper">
      <table className="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Created</th>
            <th>Last updated</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="person">
                  <span className="person-avatar" aria-hidden="true">
                    <Icon name="factory" size={14} />
                  </span>
                  <p className="person-name">{product.product_name}</p>
                </div>
              </td>

              <td>{formatDate(product.created_at)}</td>
              <td>{formatDate(product.updated_at)}</td>

              <td>
                <div className="table-actions icon-actions">
                  <button
                    type="button"
                    className="icon-action edit-action"
                    onClick={() => onEdit(product)}
                    title="Edit product"
                    aria-label={`Edit ${product.product_name}`}
                  >
                    <Icon name="edit" size={18} />
                  </button>

                  <button
                    type="button"
                    className="icon-action delete-action"
                    onClick={() => onDelete(product)}
                    title="Permanently delete product"
                    aria-label={`Delete ${product.product_name}`}
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