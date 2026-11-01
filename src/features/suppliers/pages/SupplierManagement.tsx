import { useMemo, useState } from "react";

import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from "../supplierApi";

import type {
  Supplier,
  CreateSupplierRequest,
} from "../supplierTypes";

import SupplierTable from "../components/SupplierTable";
import SupplierForm from "../components/SupplierForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../SupplierManagement.css";

const PAGE_SIZE = 10;

// Convert API errors into readable strings
const getApiErrorMessage = (error: unknown): string => {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return "Unable to complete the operation. Please try again.";
  }

  const data = (
    error as { data?: { detail?: unknown; message?: string } }
  ).data;

  if (!data) return "The server rejected the request.";

  // FastAPI validation errors
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item: unknown) => {
        if (typeof item === "object" && item !== null && "msg" in item) {
          return String((item as { msg: unknown }).msg);
        }
        return "Invalid input.";
      })
      .join(", ");
  }

  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;

  return "The server rejected the request.";
};

export default function SupplierManagement() {
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null);

  // Search
  const [search, setSearch] = useState("");

  // Pagination and errors
  const [currentPage, setCurrentPage] = useState(1);
  const [pageError, setPageError] = useState("");

  // Delete confirmation
  const [supplierToDelete, setSupplierToDelete] =
    useState<Supplier | null>(null);

  // GET suppliers
  const { data: suppliers = [], isLoading, isError } = useGetSuppliersQuery();

  // Mutations
  const [createSupplier, { isLoading: creating }] =
    useCreateSupplierMutation();
  const [updateSupplier, { isLoading: updating }] =
    useUpdateSupplierMutation();
  const [deleteSupplier, { isLoading: deleting }] =
    useDeleteSupplierMutation();

  // Search
  const filteredSuppliers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchValue) ||
        supplier.phone_number.toLowerCase().includes(searchValue) ||
        supplier.address.toLowerCase().includes(searchValue)
    );
  }, [suppliers, search]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSuppliers.length / PAGE_SIZE)
  );

  // Keep the current page valid (e.g. after deleting the last item on a page)
  const safePage = Math.min(currentPage, totalPages);

  const paginatedSuppliers = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;
    return filteredSuppliers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredSuppliers, safePage]);

  const startItem =
    filteredSuppliers.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(safePage * PAGE_SIZE, filteredSuppliers.length);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Form handlers
  const openCreateForm = () => {
    setSelectedSupplier(null);
    setPageError("");
    setIsFormOpen(true);
  };

  const openEditForm = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setPageError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedSupplier(null);
    setPageError("");
  };

  // Create and update supplier
  const handleFormSubmit = async (data: CreateSupplierRequest) => {
    setPageError("");

    try {
      if (selectedSupplier) {
        await updateSupplier({ id: selectedSupplier.id, body: data }).unwrap();
      } else {
        await createSupplier(data).unwrap();
        setCurrentPage(1);
      }

      closeForm();
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    }
  };

  // Delete
  const handleDelete = (supplier: Supplier) => {
    setPageError("");
    setSupplierToDelete(supplier);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    setPageError("");

    try {
      await deleteSupplier(supplierToDelete.id).unwrap();
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    } finally {
      setSupplierToDelete(null);
    }
  };

  // Loading state
  if (isLoading) {
    return <div className="suppliers-state">Loading suppliers...</div>;
  }

  // Error state
  if (isError) {
    return (
      <div className="suppliers-state suppliers-state-error">
        <h2>Unable to load suppliers</h2>
        <p>Check that the backend is running and that you are signed in.</p>
      </div>
    );
  }

  return (
    <div className="supplier-management">
      {/* API error (hidden while the form is open; the form shows it) */}
      {pageError && !isFormOpen && (
        <div className="supplier-page-error" role="alert">
          {pageError}
        </div>
      )}

      <section className="supplier-list-card">
        <div className="supplier-list-heading">
          <h2>Supplier List</h2>
          <p className="muted">
            Showing {startItem}-{endItem} of {filteredSuppliers.length}
          </p>
        </div>

        {/* Filters */}
        <div className="supplier-filters">
          <input
            type="search"
            placeholder="Search by supplier name, phone or address"
            aria-label="Search suppliers"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
          />

          <button
            type="button"
            className="btn-primary btn-add-supplier"
            onClick={openCreateForm}
          >
            + Add Supplier
          </button>
        </div>

        {/* Table */}
        <SupplierTable
          suppliers={paginatedSuppliers}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        <div className="supplier-pagination">
          <span className="pagination-info">
            Showing {startItem}-{endItem} of {filteredSuppliers.length} suppliers
          </span>

          <div className="pagination-controls">
            <button
              type="button"
              className="page-button"
              disabled={safePage === 1}
              onClick={() => setCurrentPage(safePage - 1)}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  type="button"
                  key={page}
                  className={`page-button ${
                    safePage === page ? "active-page" : ""
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
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Add / Edit Supplier Modal */}
      {isFormOpen && (
        <div
          className="supplier-form-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="supplier-form-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selectedSupplier ? "Edit supplier" : "Add supplier"}
          >
            <SupplierForm
              supplier={selectedSupplier}
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
        isOpen={Boolean(supplierToDelete)}
        title="Delete supplier?"
        message={`Are you sure you want to permanently delete ${supplierToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSupplierToDelete(null)}
      />
    </div>
  );
}