import { useMemo, useState } from "react";

import {
  useGetInoculantsQuery,
  useCreateInoculantMutation,
  useUpdateInoculantMutation,
  useDeleteInoculantMutation,
} from "../inoculantApi";

import type {
  Inoculant,
  CreateInoculantRequest,
  UpdateInoculantRequest,
} from "../inoculantTypes";

import InoculantTable from "../components/InoculantTable";
import InoculantForm from "../components/InoculantForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../InoculantManagement.css";

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

export default function InoculantManagement() {
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInoculant, setSelectedInoculant] =
    useState<Inoculant | null>(null);

  // Search, pagination and errors
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageError, setPageError] = useState("");

  // Delete confirmation
  const [inoculantToDelete, setInoculantToDelete] =
    useState<Inoculant | null>(null);

  // GET inoculants
  const {
    data: inoculants = [],
    isLoading,
    isError,
  } = useGetInoculantsQuery();

  // Mutations
  const [createInoculant, { isLoading: creating }] =
    useCreateInoculantMutation();
  const [updateInoculant, { isLoading: updating }] =
    useUpdateInoculantMutation();
  const [deleteInoculant, { isLoading: deleting }] =
    useDeleteInoculantMutation();

  // Search
  const filteredInoculants = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return inoculants.filter((inoculant) =>
      inoculant.name.toLowerCase().includes(searchValue)
    );
  }, [inoculants, search]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredInoculants.length / PAGE_SIZE)
  );

  const paginatedInoculants = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredInoculants.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredInoculants, currentPage]);

  const startItem =
    filteredInoculants.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(
    currentPage * PAGE_SIZE,
    filteredInoculants.length
  );

  // Reset pagination when the search changes
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Form handlers
  const openCreateForm = () => {
    setSelectedInoculant(null);
    setPageError("");
    setIsFormOpen(true);
  };

  const openEditForm = (inoculant: Inoculant) => {
    setSelectedInoculant(inoculant);
    setPageError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedInoculant(null);
    setPageError("");
  };

  // Create and update inoculant
  const handleFormSubmit = async (
    data: CreateInoculantRequest | UpdateInoculantRequest
  ) => {
    setPageError("");

    try {
      if (selectedInoculant) {
        await updateInoculant({
          id: selectedInoculant.id,
          body: data,
        }).unwrap();
      } else {
        await createInoculant(data).unwrap();
        setCurrentPage(1);
      }

      closeForm();
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    }
  };

  // Open the delete confirmation
  const handleDelete = (inoculant: Inoculant) => {
    setPageError("");
    setInoculantToDelete(inoculant);
  };

  // Run the confirmed delete
  const handleConfirmDelete = async () => {
    if (!inoculantToDelete) return;

    setPageError("");

    try {
      await deleteInoculant(inoculantToDelete.id).unwrap();

      // Avoid staying on an empty last page
      setCurrentPage((page) =>
        Math.min(
          page,
          Math.max(1, Math.ceil((filteredInoculants.length - 1) / PAGE_SIZE))
        )
      );

      setInoculantToDelete(null);
    } catch (error) {
      setPageError(getApiErrorMessage(error));
      setInoculantToDelete(null);
    }
  };

  // Loading state
  if (isLoading) {
    return <div className="inoculants-state">Loading inoculants...</div>;
  }

  // Error state
  if (isError) {
    return (
      <div className="inoculants-state inoculants-state-error">
        <h2>Unable to load inoculants</h2>
        <p>Check that the backend is running and that you are signed in.</p>
      </div>
    );
  }

  return (
    <div className="inoculant-management">
      {/* API error (the form shows its own copy while it is open) */}
      {pageError && !isFormOpen && (
        <div className="inoculant-page-error" role="alert">
          {pageError}
        </div>
      )}

      {/* Inoculant list */}
      <section className="inoculant-list-card">
        <div className="inoculant-list-heading">
          <h2>Inoculant List</h2>

          <p className="muted">
            Showing {startItem}-{endItem} of {filteredInoculants.length}
          </p>
        </div>

        {/* Search and add */}
        <div className="inoculant-filters">
          <input
            type="search"
            placeholder="Search by inoculant name"
            aria-label="Search inoculants"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
          />

          <button
            type="button"
            className="btn-primary btn-add-inoculant"
            onClick={openCreateForm}
          >
            + Add Inoculant
          </button>
        </div>

        {/* Inoculant table */}
        <InoculantTable
          inoculants={paginatedInoculants}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        <div className="inoculant-pagination">
          <span className="pagination-info">
            Showing {startItem}-{endItem} of {filteredInoculants.length}{" "}
            inoculants
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

      {/* Add / Edit Inoculant Modal */}
      {isFormOpen && (
        <div
          className="inoculant-form-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="inoculant-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inoculant-form-title"
          >
            <InoculantForm
              inoculant={selectedInoculant}
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
        isOpen={Boolean(inoculantToDelete)}
        title="Delete inoculant?"
        message={`Are you sure you want to permanently delete ${inoculantToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setInoculantToDelete(null)}
      />
    </div>
  );
}