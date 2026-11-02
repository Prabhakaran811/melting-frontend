import { useMemo, useState } from "react";

import {
  useGetFurnacesQuery,
  useCreateFurnaceMutation,
  useUpdateFurnaceMutation,
  useUpdateFurnaceStatusMutation,
} from "../furnaceApi";

import type {
  Furnace,
  CreateFurnaceRequest,
  UpdateFurnaceRequest,
} from "../furnaceTypes";

import FurnaceTable from "../components/FurnaceTable";
import FurnaceForm from "../components/FurnaceForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../FurnaceManagement.css";

const PAGE_SIZE = 10;

type PendingAction =
  | { type: "activate"; furnace: Furnace }
  | { type: "deactivate"; furnace: Furnace }
  | null;

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

export default function FurnaceManagement() {
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFurnace, setSelectedFurnace] = useState<Furnace | null>(null);

  // Search and filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination and errors
  const [currentPage, setCurrentPage] = useState(1);
  const [pageError, setPageError] = useState("");

  // Confirmation dialog state
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  // GET furnaces
  const { data: furnaces = [], isLoading, isError } = useGetFurnacesQuery();

  // Mutations
  const [createFurnace, { isLoading: creating }] = useCreateFurnaceMutation();
  const [updateFurnace, { isLoading: updating }] = useUpdateFurnaceMutation();
  const [updateFurnaceStatus, { isLoading: statusUpdating }] =
    useUpdateFurnaceStatusMutation();

  // Search and filters
  const filteredFurnaces = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return furnaces.filter((furnace) => {
      const matchesSearch =
        furnace.name.toLowerCase().includes(searchValue) ||
        furnace.furnace_no.toLowerCase().includes(searchValue) ||
        furnace.ref_no.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && furnace.is_active) ||
        (statusFilter === "inactive" && !furnace.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [furnaces, search, statusFilter]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredFurnaces.length / PAGE_SIZE)
  );

  const paginatedFurnaces = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredFurnaces.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredFurnaces, currentPage]);

  const startItem =
    filteredFurnaces.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(currentPage * PAGE_SIZE, filteredFurnaces.length);

  // Reset pagination when filters change
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Form handlers
  const openCreateForm = () => {
    setSelectedFurnace(null);
    setPageError("");
    setIsFormOpen(true);
  };

  const openEditForm = (furnace: Furnace) => {
    setSelectedFurnace(furnace);
    setPageError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedFurnace(null);
    setPageError("");
  };

  // Create and update furnace
  const handleFormSubmit = async (
    data: CreateFurnaceRequest | UpdateFurnaceRequest
  ) => {
    setPageError("");

    try {
      if (selectedFurnace) {
        await updateFurnace({
          id: selectedFurnace.id,
          body: data,
        }).unwrap();
      } else {
        await createFurnace(data).unwrap();
        setCurrentPage(1);
      }

      closeForm();
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    }
  };

  // Open the confirmation dialog for activate / deactivate
  const handleToggleStatus = (furnace: Furnace) => {
    setPageError("");

    setPendingAction({
      type: furnace.is_active ? "deactivate" : "activate",
      furnace,
    });
  };

  // Run the confirmed action through the status API
  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    const action = pendingAction;

    setPageError("");

    try {
      await updateFurnaceStatus({
        id: action.furnace.id,
        body: { is_active: action.type === "activate" },
      }).unwrap();

      setPendingAction(null);
    } catch (error) {
      setPageError(getApiErrorMessage(error));
      setPendingAction(null);
    }
  };

  // Cancel confirmation
  const handleCancelAction = () => {
    setPendingAction(null);
  };

  // Loading state
  if (isLoading) {
    return <div className="furnaces-state">Loading furnaces...</div>;
  }

  // Error state
  if (isError) {
    return (
      <div className="furnaces-state furnaces-state-error">
        <h2>Unable to load furnaces</h2>
        <p>Check that the backend is running and that you are signed in.</p>
      </div>
    );
  }

  return (
    <div className="furnace-management">
      {/* API error (the form shows its own copy while it is open) */}
      {pageError && !isFormOpen && (
        <div className="furnace-page-error" role="alert">
          {pageError}
        </div>
      )}

      {/* Furnace list */}
      <section className="furnace-list-card">
        <div className="furnace-list-heading">
          <h2>Furnace List</h2>

          <p className="muted">
            Showing {startItem}-{endItem} of {filteredFurnaces.length}
          </p>
        </div>

        {/* Filters */}
        <div className="furnace-filters">
          <input
            type="search"
            placeholder="Search by furnace name, number or reference"
            aria-label="Search furnaces"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
          />

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => handleStatusFilter(event.target.value)}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="button"
            className="btn-primary btn-add-furnace"
            onClick={openCreateForm}
          >
            + Add Furnace
          </button>
        </div>

        {/* Furnace table */}
        <FurnaceTable
          furnaces={paginatedFurnaces}
          onEdit={openEditForm}
          onToggleStatus={handleToggleStatus}
        />

        {/* Pagination */}
        <div className="furnace-pagination">
          <span className="pagination-info">
            Showing {startItem}-{endItem} of {filteredFurnaces.length} furnaces
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

      {/* Add / Edit Furnace Modal */}
      {isFormOpen && (
        <div
          className="furnace-form-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="furnace-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="furnace-form-title"
          >
            <FurnaceForm
              furnace={selectedFurnace}
              loading={creating || updating}
              serverError={pageError}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}

      {/* Activate / Deactivate Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        title={
          pendingAction?.type === "deactivate"
            ? "Deactivate furnace?"
            : "Activate furnace?"
        }
        message={
          pendingAction?.type === "deactivate"
            ? `Are you sure you want to deactivate ${pendingAction.furnace.name}?`
            : `Are you sure you want to activate ${pendingAction?.furnace.name}?`
        }
        confirmText={
          pendingAction?.type === "deactivate" ? "Deactivate" : "Activate"
        }
        variant={pendingAction?.type === "deactivate" ? "warning" : "success"}
        loading={statusUpdating}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </div>
  );
}