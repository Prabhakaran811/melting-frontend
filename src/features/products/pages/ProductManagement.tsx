import { useMemo, useState } from "react";

import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../productApi";

import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "../productTypes";

import ProductTable from "../components/ProductTable";
import ProductForm from "../components/ProductForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../ProductManagement.css";

const PAGE_SIZE = 10;

// Convert API errors into readable strings
const getApiErrorMessage = (error: unknown): string => {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return "Unable to complete the operation. Please try again.";
  }

  const data = (
    error as { data?: { detail?: unknown; message?: string } }
  ).data;

  if (!data) {
    return "The server rejected the request.";
  }

  // FastAPI validation errors
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item: unknown) => {
        if (typeof item === "object" && item !== null && "msg" in item) {
          return String(item.msg);
        }
        return "Invalid input.";
      })
      .join(", ");
  }

  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;

  return "The server rejected the request.";
};

export default function ProductManagement() {
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search, pagination and errors
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageError, setPageError] = useState("");

  // Delete confirmation
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // GET products
  const { data: products = [], isLoading, isError } = useGetProductsQuery();

  // Mutations
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  // Search
  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) =>
      product.product_name.toLowerCase().includes(searchValue)
    );
  }, [products, search]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE)
  );

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const startItem =
    filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(currentPage * PAGE_SIZE, filteredProducts.length);

  // Reset pagination when the search changes
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Form handlers
  const openCreateForm = () => {
    setSelectedProduct(null);
    setPageError("");
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setSelectedProduct(product);
    setPageError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    setPageError("");
  };

  // Create and update product
  const handleFormSubmit = async (
    data: CreateProductRequest | UpdateProductRequest
  ) => {
    setPageError("");

    try {
      if (selectedProduct) {
        await updateProduct({
          id: selectedProduct.id,
          body: data,
        }).unwrap();
      } else {
        await createProduct(data).unwrap();
        setCurrentPage(1);
      }

      closeForm();
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    }
  };

  // Open the delete confirmation
  const handleDelete = (product: Product) => {
    setPageError("");
    setProductToDelete(product);
  };

  // Run the confirmed delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setPageError("");

    try {
      await deleteProduct(productToDelete.id).unwrap();

      // Avoid staying on an empty last page
      setCurrentPage((page) =>
        Math.min(
          page,
          Math.max(1, Math.ceil((filteredProducts.length - 1) / PAGE_SIZE))
        )
      );

      setProductToDelete(null);
    } catch (error) {
      setPageError(getApiErrorMessage(error));
      setProductToDelete(null);
    }
  };

  // Loading state
  if (isLoading) {
    return <div className="products-state">Loading products...</div>;
  }

  // Error state
  if (isError) {
    return (
      <div className="products-state products-state-error">
        <h2>Unable to load products</h2>
        <p>Check that the backend is running and that you are signed in.</p>
      </div>
    );
  }

  return (
    <div className="product-management">
      {/* API error (the form shows its own copy while it is open) */}
      {pageError && !isFormOpen && (
        <div className="product-page-error" role="alert">
          {pageError}
        </div>
      )}

      {/* Product list */}
      <section className="product-list-card">
        <div className="product-list-heading">
          <h2>Product List</h2>

          <p className="muted">
            Showing {startItem}-{endItem} of {filteredProducts.length}
          </p>
        </div>

        {/* Search and add */}
        <div className="product-filters">
          <input
            type="search"
            placeholder="Search by product name"
            aria-label="Search products"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
          />

          <button
            type="button"
            className="btn-primary btn-add-product"
            onClick={openCreateForm}
          >
            + Add Product
          </button>
        </div>

        {/* Product table */}
        <ProductTable
          products={paginatedProducts}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        <div className="product-pagination">
          <span className="pagination-info">
            Showing {startItem}-{endItem} of {filteredProducts.length} products
          </span>

          <div className="pagination-controls">
            <button
              type="button"
              className="page-button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  type="button"
                  key={page}
                  className={`page-button ${
                    currentPage === page ? "active-page" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              className="page-button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Add / Edit Product Modal */}
      {isFormOpen && (
        <div
          className="product-form-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="product-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
          >
            <ProductForm
              product={selectedProduct}
              loading={creating || updating}
              serverError={pageError}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        title="Delete product?"
        message={`Are you sure you want to permanently delete ${productToDelete?.product_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}