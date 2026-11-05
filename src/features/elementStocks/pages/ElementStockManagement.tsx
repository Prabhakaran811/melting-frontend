import { useMemo, useRef, useState } from "react";

import {
  useGetElementStocksQuery,
  useCreateElementStockMutation,
  useUpdateElementStockMutation,
  useDeleteElementStockMutation,
  useGetSuppliersQuery,
} from "../elementStockApi";
import { useGetElementsQuery } from "../../elements/elementApi";

import type { ElementStock, CreateElementStockRequest } from "../elementStockTypes";

import ElementStockTable, { formatNumber } from "../components/ElementStockTable";
import ElementStockForm from "../components/ElementStockForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../ElementStockManagement.css";

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

export default function ElementStockManagement() {
  // Refetch on mount so renamed elements / suppliers always show correctly
  const {
    data: stocks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetElementStocksQuery(undefined, { refetchOnMountOrArgChange: true });

  const {
    data: elements = [],
    isLoading: elementsLoading,
    isError: elementsError,
  } = useGetElementsQuery(undefined, { refetchOnMountOrArgChange: true });

  const {
    data: suppliers = [],
    isLoading: suppliersLoading,
    isError: suppliersError,
  } = useGetSuppliersQuery(undefined, { refetchOnMountOrArgChange: true });

  const [createStock, { isLoading: creating }] = useCreateElementStockMutation();
  const [updateStock, { isLoading: updating }] = useUpdateElementStockMutation();
  const [deleteStock, { isLoading: deleting }] = useDeleteElementStockMutation();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ElementStock | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ElementStock | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const saving = creating || updating;

  const showToast = (type: ToastState["type"], text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  // Newest received first
  const sorted = useMemo(
    () =>
      [...stocks].sort((a, b) =>
        a.received_date === b.received_date
          ? b.id - a.id
          : b.received_date.localeCompare(a.received_date)
      ),
    [stocks]
  );

  // Search by element or supplier
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;

    return sorted.filter(
      (s) =>
        (s.element?.name ?? "").toLowerCase().includes(q) ||
        (s.element?.abbreviation ?? "").toLowerCase().includes(q) ||
        (s.supplier?.name ?? "").toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const totalQuantity = useMemo(
    () => stocks.reduce((sum, s) => sum + Number(s.quantity), 0),
    [stocks]
  );

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

  const openEdit = (item: ElementStock) => {
    setEditing(item);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleSubmit = async (payload: CreateElementStockRequest) => {
    try {
      if (editing) {
        await updateStock({ id: editing.id, body: payload }).unwrap();
        showToast("success", "Element stock updated");
      } else {
        await createStock(payload).unwrap();
        showToast("success", "Element stock added");
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
      await deleteStock(deleteTarget.id).unwrap();
      showToast("success", "Element stock deleted");
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Could not delete element stock"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="es-page">
      {/* Header */}
      <div className="es-header">
        <div>
          <h1>Element Stock</h1>
          <p>Element stock received from suppliers, with pickup percentage and rate.</p>
        </div>
        <button className="es-btn es-btn--primary" onClick={openCreate}>
          <span className="es-btn__plus">+</span> Add stock
        </button>
      </div>

      {/* Stats + search */}
      <div className="es-toolbar">
        <div className="es-stats">
          <div className="es-stat es-stat--orange">
            <span>Stock entries</span>
            <strong>{stocks.length}</strong>
          </div>
          <div className="es-stat es-stat--dark">
            <span>Total quantity (kg)</span>
            <strong>{formatNumber(totalQuantity, 3)}</strong>
          </div>
        </div>

        <div className="es-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search element or supplier..."
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
        <div className="es-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="es-skeleton" key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="es-empty">
          <div className="es-empty__icon">⚠</div>
          <h3>Couldn't load element stock</h3>
          <p>{getApiErrorMessage(error, "Check that the backend is running and that you are signed in.")}</p>
          <button className="es-btn es-btn--primary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="es-empty">
          <div className="es-empty__icon">📦</div>
          <h3>{search ? "No matching stock" : "No element stock yet"}</h3>
          <p>
            {search
              ? "Try a different element or supplier name."
              : "Record the first stock you received, with its supplier, pickup percentage and rate."}
          </p>
          {!search && (
            <button className="es-btn es-btn--primary" onClick={openCreate}>
              + Add first stock
            </button>
          )}
        </div>
      ) : (
        <div className="es-card">
          <ElementStockTable items={paginated} onEdit={openEdit} onDelete={setDeleteTarget} />

          {/* Pagination */}
          <div className="es-pagination">
            <span>
              Showing {startItem}-{endItem} of {filtered.length}
            </span>

            <div className="es-pagination__controls">
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
      <ElementStockForm
        open={drawerOpen}
        initial={editing}
        elements={elements}
        elementsLoading={elementsLoading}
        elementsError={elementsError}
        suppliers={suppliers}
        suppliersLoading={suppliersLoading}
        suppliersError={suppliersError}
        saving={saving}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete element stock?"
        message={`Are you sure you want to permanently delete this ${deleteTarget?.element?.name ?? "element"} stock entry? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toast && <div className={`es-toast es-toast--${toast.type}`}>{toast.text}</div>}
    </div>
  );
}