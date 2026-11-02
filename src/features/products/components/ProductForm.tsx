import { useEffect, useState } from "react";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "../productTypes";

interface ProductFormProps {
  product?: Product | null;
  loading: boolean;
  serverError?: string;
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => void;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  loading,
  serverError,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [productName, setProductName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setProductName(product ? product.product_name : "");
    setError("");
  }, [product]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!productName.trim()) {
      setError("Product name is required.");
      return;
    }

    onSubmit({ product_name: productName.trim() });
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-head">
        <div>
          <h2 id="product-form-title">
            {product ? "Edit product" : "Add product"}
          </h2>
          <p className="muted">
            {product
              ? "Update the name of this product."
              : "Add a new product to the system."}
          </p>
        </div>

        <button
          type="button"
          className="form-close"
          onClick={onCancel}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="field">
        <label htmlFor="product_name">Product name</label>
        <input
          id="product_name"
          name="product_name"
          value={productName}
          onChange={(event) => setProductName(event.target.value)}
          maxLength={150}
          required
          autoFocus
        />
      </div>

      {(error || serverError) && (
        <p className="form-error" role="alert">
          {error || serverError}
        </p>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : product
              ? "Update product"
              : "Create product"}
        </button>
      </div>
    </form>
  );
}