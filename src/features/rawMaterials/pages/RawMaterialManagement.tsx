import { useMemo, useRef, useState } from "react";

import {
  useGetRawMaterialsQuery,
  useCreateRawMaterialMutation,
  useUpdateRawMaterialMutation,
  useDeleteRawMaterialMutation,
} from "../rawMaterialApi";
import { useGetElementsQuery } from "../../elements/elementApi";

import type { RawMaterial, CreateRawMaterialRequest } from "../rawMaterialTypes";

import RawMaterialTable, { getIronTypes } from "../components/RawMaterialTable";
import RawMaterialForm from "../components/RawMaterialForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../RawMaterialManagement.css";

const PAGE_SIZE = 8;

interface ToastState {
  type: "success" | "error";
  text: string;
}

// Convert API errors into readable strings
const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return fallback;
  }

  const data = (error as { data?: { detail?: unknown; message?: string } }).data;
  if (!data) return fallback;

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item: unknown) =>
        typeof item === "object" && item !== null && "msg" in item
          ? String((item as { msg: unknown }).msg)
          : "Invalid input."
      )
      .join(", ");
  }

  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;

  return fallback;
};

export default function RawMaterialManagement() {
  // Refetch on mount so renamed elements / iron types always show correctly
  const {
    data: rawMaterials = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetRawMaterialsQuery(undefined, { refetchOnMountOrArgChange: true });

  const {
    data: elements = [],
    isLoading: elementsLoading,
    isError: elementsError,
  } = useGetElementsQuery(undefined, { refetchOnMountOrArgChange: true });

  const [createRawMaterial, { isLoading: creating }] = useCreateRawMaterialMutation();
  const [updateRawMaterial, { isLoading: updating }] = useUpdateRawMaterialMutation();
  const [deleteRawMaterial, { isLoading: deleting }] = useDeleteRawMaterialMutation();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<RawMaterial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RawMaterial | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const saving = creating || updating;

  const showToast = (type: ToastState["type"], text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  // Search by material, element or iron type
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rawMaterials;

    return rawMaterials.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.elements.some(
          (el) =>
            el.name.toLowerCase().includes(q) ||
            el.abbreviation.toLowerCase().includes(q)
        ) ||
        getIronTypes(item).some((it) => it.name.toLowerCase().includes(q))
    );
  }, [rawMaterials, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const startItem = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, filtered.length);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (item: RawMaterial) => {
    setEditing(item);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleSubmit = async (payload: CreateRawMaterialRequest) => {
    try {
      if (editing) {
        const updated = await updateRawMaterial({ id: editing.id, body: payload }).unwrap();
        showToast("success", `${updated.name} updated`);
      } else {
        const created = await createRawMaterial(payload).unwrap();
        showToast("success", `${created.name} added`);
        setCurrentPage(1);
      }
      setDrawerOpen(false);
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Something went wrong"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRawMaterial(deleteTarget.id).unwrap();
      showToast("success", `${deleteTarget.name} deleted`);
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Could not delete raw material"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="rm-page">
      {/* Header */}
      <div className="rm-header">
        <div>
          <h1>Raw Material Master</h1>
          <p>Raw materials, the elements they contain and the iron types they feed.</p>
        </div>
        <button className="rm-btn rm-btn--primary" onClick={openCreate}>
          <span className="rm-btn__plus">+</span> Add raw material
        </button>
      </div>

      {/* Stats + search */}
      <div className="rm-toolbar">
        <div className="rm-stats">
          <div className="rm-stat rm-stat--orange">
            <span>Raw materials</span>
            <strong>{rawMaterials.length}</strong>
          </div>
          <div className="rm-stat rm-stat--dark">
            <span>Elements available</span>
            <strong>{elements.length}</strong>
          </div>
        </div>

        <div className="rm-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search material, element or iron type..."
          />
          {search && (
            <button type="button" onClick={() => handleSearch("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="rm-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="rm-skeleton" key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="rm-empty">
          <div className="rm-empty__icon">⚠</div>
          <h3>Couldn't load raw materials</h3>
          <p>{getApiErrorMessage(error, "Check that the backend is running and that you are signed in.")}</p>
          <button className="rm-btn rm-btn--primary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rm-empty">
          <div className="rm-empty__icon">⛏</div>
          <h3>{search ? "No matching raw materials" : "No raw materials yet"}</h3>
          <p>
            {search
              ? "Try a different material, element or iron type."
              : "Add materials like Pig Iron or Steel Scrap and pick the elements they contain."}
          </p>
          {!search && (
            <button className="rm-btn rm-btn--primary" onClick={openCreate}>
              + Add first raw material
            </button>
          )}
        </div>
      ) : (
        <div className="rm-card">
          <RawMaterialTable items={paginated} onEdit={openEdit} onDelete={setDeleteTarget} />

          {/* Pagination */}
          <div className="rm-pagination">
            <span>
              Showing {startItem}-{endItem} of {filtered.length}
            </span>

            <div className="rm-pagination__controls">
              <button type="button" disabled={page === 1} onClick={() => setCurrentPage(page - 1)}>
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  type="button"
                  key={p}
                  className={p === page ? "is-active" : ""}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}

              <button type="button" disabled={page === totalPages} onClick={() => setCurrentPage(page + 1)}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer form */}
      <RawMaterialForm
        open={drawerOpen}
        initial={editing}
        elements={elements}
        elementsLoading={elementsLoading}
        elementsError={elementsError}
        existing={rawMaterials}
        saving={saving}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete raw material?"
        message={`Are you sure you want to permanently delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toast && <div className={`rm-toast rm-toast--${toast.type}`}>{toast.text}</div>}
    </div>
  );
}