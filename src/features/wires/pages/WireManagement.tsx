import { useMemo, useRef, useState } from "react";

import {
  useGetWiresQuery,
  useCreateWireMutation,
  useUpdateWireMutation,
  useDeleteWireMutation,
} from "../wireApi";
import { useGetRawMaterialsQuery } from "../../rawMaterials/rawMaterialApi";

import type { Wire, CreateWireRequest } from "../wireTypes";

import WireTable from "../components/WireTable";
import WireForm from "../components/WireForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../WireManagement.css";

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

export default function WireManagement() {
  // Refetch on mount so renamed raw materials always show correctly
  const {
    data: wires = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetWiresQuery(undefined, { refetchOnMountOrArgChange: true });

  const {
    data: rawMaterials = [],
    isLoading: rawMaterialsLoading,
    isError: rawMaterialsError,
  } = useGetRawMaterialsQuery(undefined, { refetchOnMountOrArgChange: true });

  const [createWire, { isLoading: creating }] = useCreateWireMutation();
  const [updateWire, { isLoading: updating }] = useUpdateWireMutation();
  const [deleteWire, { isLoading: deleting }] = useDeleteWireMutation();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Wire | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Wire | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const saving = creating || updating;

  const showToast = (type: ToastState["type"], text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  // Search by wire or raw material name
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return wires;

    return wires.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        (w.raw_material?.name ?? "").toLowerCase().includes(q)
    );
  }, [wires, search]);

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

  const openEdit = (item: Wire) => {
    setEditing(item);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleSubmit = async (payload: CreateWireRequest) => {
    try {
      if (editing) {
        const updated = await updateWire({ id: editing.id, body: payload }).unwrap();
        showToast("success", `${updated.name} updated`);
      } else {
        const created = await createWire(payload).unwrap();
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
      await deleteWire(deleteTarget.id).unwrap();
      showToast("success", `${deleteTarget.name} deleted`);
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Could not delete wire"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="wr-page">
      {/* Header */}
      <div className="wr-header">
        <div>
          <h1>Wire Master</h1>
          <p>Wires and the raw material each one is made from.</p>
        </div>
        <button className="wr-btn wr-btn--primary" onClick={openCreate}>
          <span className="wr-btn__plus">+</span> Add wire
        </button>
      </div>

      {/* Stats + search */}
      <div className="wr-toolbar">
        <div className="wr-stats">
          <div className="wr-stat wr-stat--orange">
            <span>Wires</span>
            <strong>{wires.length}</strong>
          </div>
          <div className="wr-stat wr-stat--dark">
            <span>Raw materials available</span>
            <strong>{rawMaterials.length}</strong>
          </div>
        </div>

        <div className="wr-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search wire or raw material..."
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
        <div className="wr-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="wr-skeleton" key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="wr-empty">
          <div className="wr-empty__icon">⚠</div>
          <h3>Couldn't load wires</h3>
          <p>{getApiErrorMessage(error, "Check that the backend is running and that you are signed in.")}</p>
          <button className="wr-btn wr-btn--primary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="wr-empty">
          <div className="wr-empty__icon">🧵</div>
          <h3>{search ? "No matching wires" : "No wires yet"}</h3>
          <p>
            {search
              ? "Try a different wire or raw material name."
              : "Add a wire like Magnesium Cored Wire and link it to a raw material."}
          </p>
          {!search && (
            <button className="wr-btn wr-btn--primary" onClick={openCreate}>
              + Add first wire
            </button>
          )}
        </div>
      ) : (
        <div className="wr-card">
          <WireTable items={paginated} onEdit={openEdit} onDelete={setDeleteTarget} />

          {/* Pagination */}
          <div className="wr-pagination">
            <span>
              Showing {startItem}-{endItem} of {filtered.length}
            </span>

            <div className="wr-pagination__controls">
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
      <WireForm
        open={drawerOpen}
        initial={editing}
        rawMaterials={rawMaterials}
        rawMaterialsLoading={rawMaterialsLoading}
        rawMaterialsError={rawMaterialsError}
        existing={wires}
        saving={saving}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete wire?"
        message={`Are you sure you want to permanently delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toast && <div className={`wr-toast wr-toast--${toast.type}`}>{toast.text}</div>}
    </div>
  );
}