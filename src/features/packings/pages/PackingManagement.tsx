import { useMemo, useState } from "react";

import {
  useGetPackingsQuery,
  useCreatePackingMutation,
  useUpdatePackingMutation,
  useDeletePackingMutation,
} from "../packingApi";

import type {
  Packing,
  CreatePackingRequest,
  UpdatePackingRequest,
} from "../packingTypes";

import PackingTable from "../components/PackingTable";
import PackingForm from "../components/PackingForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../PackingManagement.css";

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

export default function PackingManagement() {
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPacking, setSelectedPacking] = useState<Packing | null>(null);

  // Search, pagination and errors
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageError, setPageError] = useState("");

  // Delete confirmation
  const [packingToDelete, setPackingToDelete] = useState<Packing | null>(null);

  // GET packings
  const { data: packings = [], isLoading, isError } = useGetPackingsQuery();

  // Mutations
  const [createPacking, { isLoading: creating }] = useCreatePackingMutation();
  const [updatePacking, { isLoading: updating }] = useUpdatePackingMutation();
  const [deletePacking, { isLoading: deleting }] = useDeletePackingMutation();

  // Search
  const filteredPackings = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return packings.filter((packing) =>
      packing.name.toLowerCase().includes(searchValue)
    );
  }, [packings, search]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPackings.length / PAGE_SIZE)
  );

  const paginatedPackings = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredPackings.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredPackings, currentPage]);

  const startItem =
    filteredPackings.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(currentPage * PAGE_SIZE, filteredPackings.length);

  // Reset pagination when the search changes
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Form handlers
  const openCreateForm = () => {
    setSelectedPacking(null);
    setPageError("");
    setIsFormOpen(true);
  };

  const openEditForm = (packing: Packing) => {
    setSelectedPacking(packing);
    setPageError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedPacking(null);
    setPageError("");
  };

  // Create and update packing
  const handleFormSubmit = async (
    data: CreatePackingRequest | UpdatePackingRequest
  ) => {
    setPageError("");

    try {
      if (selectedPacking) {
        await updatePacking({
          id: selectedPacking.id,
          body: data,
        }).unwrap();
      } else {
        await createPacking(data).unwrap();
        setCurrentPage(1);
      }

      closeForm();
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    }
  };

  // Open the delete confirmation
  const handleDelete = (packing: Packing) => {
    setPageError("");
    setPackingToDelete(packing);
  };

  // Run the confirmed delete
  const handleConfirmDelete = async () => {
    if (!packingToDelete) return;

    setPageError("");

    try {
      await deletePacking(packingToDelete.id).unwrap();

      // Avoid staying on an empty last page
      setCurrentPage((page) =>
        Math.min(
          page,
          Math.max(1, Math.ceil((filteredPackings.length - 1) / PAGE_SIZE))
        )
      );

      setPackingToDelete(null);
    } catch (error) {
      setPageError(getApiErrorMessage(error));
      setPackingToDelete(null);
    }
  };

  // Loading state
  if (isLoading) {
    return <div className="packings-state">Loading packing types...</div>;
  }

  // Error state
  if (isError) {
    return (
      <div className="packings-state packings-state-error">
        <h2>Unable to load packing types</h2>
        <p>Check that the backend is running and that you are signed in.</p>
      </div>
    );
  }

  return (
    <div className="packing-management">
      {/* API error (the form shows its own copy while it is open) */}
      {pageError && !isFormOpen && (
        <div className="packing-page-error" role="alert">
          {pageError}
        </div>
      )}

      {/* Packing list */}
      <section className="packing-list-card">
        <div className="packing-list-heading">
          <h2>Packing List</h2>

          <p className="muted">
            Showing {startItem}-{endItem} of {filteredPackings.length}
          </p>
        </div>

        {/* Search and add */}
        <div className="packing-filters">
          <input
            type="search"
            placeholder="Search by packing name"
            aria-label="Search packing types"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
          />

          <button
            type="button"
            className="btn-primary btn-add-packing"
            onClick={openCreateForm}
          >
            + Add Packing
          </button>
        </div>

        {/* Packing table */}
        <PackingTable
          packings={paginatedPackings}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        <div className="packing-pagination">
          <span className="pagination-info">
            Showing {startItem}-{endItem} of {filteredPackings.length} packing
            types
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

      {/* Add / Edit Packing Modal */}
      {isFormOpen && (
        <div
          className="packing-form-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="packing-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="packing-form-title"
          >
            <PackingForm
              packing={selectedPacking}
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
        isOpen={Boolean(packingToDelete)}
        title="Delete packing?"
        message={`Are you sure you want to permanently delete ${packingToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPackingToDelete(null)}
      />
    </div>
  );
}