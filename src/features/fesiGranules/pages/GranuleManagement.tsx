import { useMemo, useState } from "react";

import {
  useGetGranulesQuery,
  useCreateGranuleMutation,
  useUpdateGranuleMutation,
  useDeleteGranuleMutation,
} from "../granuleApi";

import type {
  Granule,
  CreateGranuleRequest,
  UpdateGranuleRequest,
} from "../granuleTypes";

import GranuleTable from "../components/GranuleTable";
import GranuleForm from "../components/GranuleForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../GranuleManagement.css";

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

export default function GranuleManagement() {
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGranule, setSelectedGranule] = useState<Granule | null>(null);

  // Search, pagination and errors
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageError, setPageError] = useState("");

  // Delete confirmation
  const [granuleToDelete, setGranuleToDelete] = useState<Granule | null>(null);

  // GET granules
  const { data: granules = [], isLoading, isError } = useGetGranulesQuery();

  // Mutations
  const [createGranule, { isLoading: creating }] = useCreateGranuleMutation();
  const [updateGranule, { isLoading: updating }] = useUpdateGranuleMutation();
  const [deleteGranule, { isLoading: deleting }] = useDeleteGranuleMutation();

  // Search
  const filteredGranules = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return granules.filter((granule) =>
      granule.name.toLowerCase().includes(searchValue)
    );
  }, [granules, search]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredGranules.length / PAGE_SIZE)
  );

  const paginatedGranules = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredGranules.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredGranules, currentPage]);

  const startItem =
    filteredGranules.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(currentPage * PAGE_SIZE, filteredGranules.length);

  // Reset pagination when the search changes
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Form handlers
  const openCreateForm = () => {
    setSelectedGranule(null);
    setPageError("");
    setIsFormOpen(true);
  };

  const openEditForm = (granule: Granule) => {
    setSelectedGranule(granule);
    setPageError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedGranule(null);
    setPageError("");
  };

  // Create and update granule
  const handleFormSubmit = async (
    data: CreateGranuleRequest | UpdateGranuleRequest
  ) => {
    setPageError("");

    try {
      if (selectedGranule) {
        await updateGranule({
          id: selectedGranule.id,
          body: data,
        }).unwrap();
      } else {
        await createGranule(data).unwrap();
        setCurrentPage(1);
      }

      closeForm();
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    }
  };

  // Open the delete confirmation
  const handleDelete = (granule: Granule) => {
    setPageError("");
    setGranuleToDelete(granule);
  };

  // Run the confirmed delete
  const handleConfirmDelete = async () => {
    if (!granuleToDelete) return;

    setPageError("");

    try {
      await deleteGranule(granuleToDelete.id).unwrap();

      // Avoid staying on an empty last page
      setCurrentPage((page) =>
        Math.min(
          page,
          Math.max(1, Math.ceil((filteredGranules.length - 1) / PAGE_SIZE))
        )
      );

      setGranuleToDelete(null);
    } catch (error) {
      setPageError(getApiErrorMessage(error));
      setGranuleToDelete(null);
    }
  };

  // Loading state
  if (isLoading) {
    return <div className="granules-state">Loading FeSi granules...</div>;
  }

  // Error state
  if (isError) {
    return (
      <div className="granules-state granules-state-error">
        <h2>Unable to load FeSi granules</h2>
        <p>Check that the backend is running and that you are signed in.</p>
      </div>
    );
  }

  return (
    <div className="granule-management">
      {/* API error (the form shows its own copy while it is open) */}
      {pageError && !isFormOpen && (
        <div className="granule-page-error" role="alert">
          {pageError}
        </div>
      )}

      {/* Granule list */}
      <section className="granule-list-card">
        <div className="granule-list-heading">
          <h2>FeSi Granule List</h2>

          <p className="muted">
            Showing {startItem}-{endItem} of {filteredGranules.length}
          </p>
        </div>

        {/* Search and add */}
        <div className="granule-filters">
          <input
            type="search"
            placeholder="Search by FeSi granule name"
            aria-label="Search FeSi granules"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
          />

          <button
            type="button"
            className="btn-primary btn-add-granule"
            onClick={openCreateForm}
          >
            + Add FeSi Granule
          </button>
        </div>

        {/* Granule table */}
        <GranuleTable
          granules={paginatedGranules}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        <div className="granule-pagination">
          <span className="pagination-info">
            Showing {startItem}-{endItem} of {filteredGranules.length} FeSi
            granules
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

      {/* Add / Edit FeSi Granule Modal */}
      {isFormOpen && (
        <div
          className="granule-form-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="granule-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="granule-form-title"
          >
            <GranuleForm
              granule={selectedGranule}
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
        isOpen={Boolean(granuleToDelete)}
        title="Delete FeSi granule?"
        message={`Are you sure you want to permanently delete ${granuleToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setGranuleToDelete(null)}
      />
    </div>
  );
}