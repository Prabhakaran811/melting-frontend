import { useMemo, useRef, useState } from "react";

import {
  useGetRawMaterialStocksQuery,
  useCreateRawMaterialStockMutation,
  useUpdateRawMaterialStockMutation,
  useDeleteRawMaterialStockMutation,
} from "../rawMaterialStockApi";
import { useGetRawMaterialsQuery } from "../../rawMaterials/rawMaterialApi";
import { useGetSuppliersQuery } from "../../elementStocks/elementStockApi";
import { useGetElementsQuery } from "../../elements/elementApi";

import type {
  RawMaterialStock,
  CreateRawMaterialStockRequest,
} from "../rawMaterialStockTypes";

import RawMaterialStockTable from "../components/RawMaterialStockTable";
import RawMaterialStockForm from "../components/RawMaterialStockForm";
import { formatNumber } from "../../elementStocks/components/ElementStockTable";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../RawMaterialStockManagement.css";

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

export default function RawMaterialStockManagement() {
  // Refetch on mount so renamed items always show correctly
  const {
    data: stocks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetRawMaterialStocksQuery(undefined, { refetchOnMountOrArgChange: true });

  const {
    data: rawMaterials = [],
    isLoading: rawMaterialsLoading,
    isError: rawMaterialsError,
  } = useGetRawMaterialsQuery(undefined, { refetchOnMountOrArgChange: true });

  const {
    data: suppliers = [],
    isLoading: suppliersLoading,
    isError: suppliersError,
  } = useGetSuppliersQuery(undefined, { refetchOnMountOrArgChange: true });

  const { data: elements = [] } = useGetElementsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createStock, { isLoading: creating }] = useCreateRawMaterialStockMutation();
  const [updateStock, { isLoading: updating }] = useUpdateRawMaterialStockMutation();
  const [deleteStock, { isLoading: deleting }] = useDeleteRawMaterialStockMutation();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<RawMaterialStock | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RawMaterialStock | null>(null);
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

  // Search by raw material, supplier or element
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;

    return sorted.filter((s) => {
      const elementMatch = (s.element_percentages ?? []).some((p) => {
        const el = p.element ?? elements.find((e) => e.id === p.element_id);
        return (
          (el?.name ?? "").toLowerCase().includes(q) ||
          (el?.abbreviation ?? "").toLowerCase().includes(q)
        );
      });

      return (
        (s.raw_material?.name ?? "").toLowerCase().includes(q) ||
        (s.supplier?.name ?? "").toLowerCase().includes(q) ||
        elementMatch
      );
    });
  }, [sorted, search, elements]);

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

  const openEdit = (item: RawMaterialStock) => {
    setEditing(item);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleSubmit = async (payload: CreateRawMaterialStockRequest) => {
    try {
      if (editing) {
        await updateStock({ id: editing.id, body: payload }).unwrap();
        showToast("success", "Raw material stock updated");
      } else {
        await createStock(payload).unwrap();
        showToast("success", "Raw material stock added");
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
      showToast("success", "Raw material stock deleted");
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Could not delete raw material stock"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="rs-page">
      {/* Header */}
      <div className="rs-header">
        <div>
          <h1>Raw Material Stock</h1>
          <p>Raw material received from suppliers, with the element percentages of each lot.</p>
        </div>
        <button className="rs-btn rs-btn--primary" onClick={openCreate}>
          <span className="rs-btn__plus">+</span> Add stock
        </button>
      </div>

      {/* Stats + search */}
      <div className="rs-toolbar">
        <div className="rs-stats">
          <div className="rs-stat rs-stat--orange">
            <span>Stock entries</span>
            <strong>{stocks.length}</strong>
          </div>
          <div className="rs-stat rs-stat--dark">
            <span>Total quantity (kg)</span>
            <strong>{formatNumber(totalQuantity, 3)}</strong>
          </div>
        </div>

        <div className="rs-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search material, supplier or element..."
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
        <div className="rs-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="rs-skeleton" key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="rs-empty">
          <div className="rs-empty__icon">⚠</div>
          <h3>Couldn't load raw material stock</h3>
          <p>{getApiErrorMessage(error, "Check that the backend is running and that you are signed in.")}</p>
          <button className="rs-btn rs-btn--primary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rs-empty">
          <div className="rs-empty__icon">🏭</div>
          <h3>{search ? "No matching stock" : "No raw material stock yet"}</h3>
          <p>
            {search
              ? "Try a different material, supplier or element."
              : "Record the first lot you received, with its supplier, rate and element percentages."}
          </p>
          {!search && (
            <button className="rs-btn rs-btn--primary" onClick={openCreate}>
              + Add first stock
            </button>
          )}
        </div>
      ) : (
        <div className="rs-card">
          <RawMaterialStockTable
            items={paginated}
            elements={elements}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />

          {/* Pagination */}
          <div className="rs-pagination">
            <span>
              Showing {startItem}-{endItem} of {filtered.length}
            </span>

            <div className="rs-pagination__controls">
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
      <RawMaterialStockForm
        open={drawerOpen}
        initial={editing}
        rawMaterials={rawMaterials}
        rawMaterialsLoading={rawMaterialsLoading}
        rawMaterialsError={rawMaterialsError}
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
        title="Delete raw material stock?"
        message={`Are you sure you want to permanently delete this ${deleteTarget?.raw_material?.name ?? "raw material"} stock entry? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toast && <div className={`rs-toast rs-toast--${toast.type}`}>{toast.text}</div>}
    </div>
  );
}