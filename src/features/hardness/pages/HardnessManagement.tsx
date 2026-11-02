import { useMemo, useState } from "react";

import {
  useGetHardnessesQuery,
  useCreateHardnessMutation,
  useUpdateHardnessMutation,
  useDeleteHardnessMutation,
} from "../hardnessApi";

import type {
  Hardness,
  CreateHardnessRequest,
  UpdateHardnessRequest,
} from "../hardnessTypes";

import HardnessTable from "../components/HardnessTable";
import HardnessForm from "../components/HardnessForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../HardnessManagement.css";

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

export default function HardnessManagement() {
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHardness, setSelectedHardness] = useState<Hardness | null>(
    null
  );

  // Search, pagination and errors
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageError, setPageError] = useState("");

  // Delete confirmation
  const [hardnessToDelete, setHardnessToDelete] = useState<Hardness | null>(
    null
  );

  // GET hardnesses
  const {
    data: hardnesses = [],
    isLoading,
    isError,
  } = useGetHardnessesQuery();

  // Mutations
  const [createHardness, { isLoading: creating }] =
    useCreateHardnessMutation();
  const [updateHardness, { isLoading: updating }] =
    useUpdateHardnessMutation();
  const [deleteHardness, { isLoading: deleting }] =
    useDeleteHardnessMutation();

  // Search
  const filteredHardnesses = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return hardnesses.filter((hardness) =>
      hardness.hardness_name.toLowerCase().includes(searchValue)
    );
  }, [hardnesses, search]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredHardnesses.length / PAGE_SIZE)
  );

  const paginatedHardnesses = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredHardnesses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredHardnesses, currentPage]);

  const startItem =
    filteredHardnesses.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(
    currentPage * PAGE_SIZE,
    filteredHardnesses.length
  );

  // Reset pagination when the search changes
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Form handlers
  const openCreateForm = () => {
    setSelectedHardness(null);
    setPageError("");
    setIsFormOpen(true);
  };

  const openEditForm = (hardness: Hardness) => {
    setSelectedHardness(hardness);
    setPageError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedHardness(null);
    setPageError("");
  };

  // Create and update hardness
  const handleFormSubmit = async (
    data: CreateHardnessRequest | UpdateHardnessRequest
  ) => {
    setPageError("");

    try {
      if (selectedHardness) {
        await updateHardness({
          id: selectedHardness.id,
          body: data,
        }).unwrap();
      } else {
        await createHardness(data).unwrap();
        setCurrentPage(1);
      }

      closeForm();
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    }
  };

  // Open the delete confirmation
  const handleDelete = (hardness: Hardness) => {
    setPageError("");
    setHardnessToDelete(hardness);
  };

  // Run the confirmed delete
  const handleConfirmDelete = async () => {
    if (!hardnessToDelete) return;

    setPageError("");

    try {
      await deleteHardness(hardnessToDelete.id).unwrap();

      // Avoid staying on an empty last page
      setCurrentPage((page) =>
        Math.min(
          page,
          Math.max(1, Math.ceil((filteredHardnesses.length - 1) / PAGE_SIZE))
        )
      );

      setHardnessToDelete(null);
    } catch (error) {
      setPageError(getApiErrorMessage(error));
      setHardnessToDelete(null);
    }
  };

  // Loading state
  if (isLoading) {
    return <div className="hardness-state">Loading hardness types...</div>;
  }

  // Error state
  if (isError) {
    return (
      <div className="hardness-state hardness-state-error">
        <h2>Unable to load hardness types</h2>
        <p>Check that the backend is running and that you are signed in.</p>
      </div>
    );
  }

  return (
    <div className="hardness-management">
      {/* API error (the form shows its own copy while it is open) */}
      {pageError && !isFormOpen && (
        <div className="hardness-page-error" role="alert">
          {pageError}
        </div>
      )}

      {/* Hardness list */}
      <section className="hardness-list-card">
        <div className="hardness-list-heading">
          <h2>Hardness List</h2>

          <p className="muted">
            Showing {startItem}-{endItem} of {filteredHardnesses.length}
          </p>
        </div>

        {/* Search and add */}
        <div className="hardness-filters">
          <input
            type="search"
            placeholder="Search by hardness name"
            aria-label="Search hardness types"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
          />

          <button
            type="button"
            className="btn-primary btn-add-hardness"
            onClick={openCreateForm}
          >
            + Add Hardness
          </button>
        </div>

        {/* Hardness table */}
        <HardnessTable
          hardnesses={paginatedHardnesses}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        <div className="hardness-pagination">
          <span className="pagination-info">
            Showing {startItem}-{endItem} of {filteredHardnesses.length} hardness
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

      {/* Add / Edit Hardness Modal */}
      {isFormOpen && (
        <div
          className="hardness-form-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="hardness-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hardness-form-title"
          >
            <HardnessForm
              hardness={selectedHardness}
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
        isOpen={Boolean(hardnessToDelete)}
        title="Delete hardness?"
        message={`Are you sure you want to permanently delete ${hardnessToDelete?.hardness_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setHardnessToDelete(null)}
      />
    </div>
  );
}