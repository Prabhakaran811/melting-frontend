import { useMemo, useRef, useState } from "react";

import {
  useGetAimsQuery,
  useCreateAimMutation,
  useUpdateAimMutation,
  useDeleteAimMutation,
  useGetCustomersQuery,
  useGetProductsQuery,
  useGetPackingsQuery,
  useGetHardnessesQuery,
  useGetInoculantsQuery,
} from "../aimApi";
import { useGetIronTypesQuery } from "../../ironTypes/ironTypeApi";
import { useGetElementsQuery } from "../../elements/elementApi";

import type { Aim, CreateAimRequest, LookupItem } from "../aimTypes";
import { lookupLabel } from "../aimTypes";

import AimTable from "../components/AimTable";
import AimForm from "../components/AimForm";
import type { LookupState } from "../components/AimForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../AimManagement.css";

const PAGE_SIZE = 6;

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

// Turn a master list query into dropdown options
const toLookup = (query: {
  data?: LookupItem[];
  isLoading: boolean;
  isError: boolean;
}): LookupState => ({
  options: [...(query.data ?? [])]
    .map((item) => ({ id: item.id, label: lookupLabel(item) }))
    .sort((a, b) => a.label.localeCompare(b.label)),
  loading: query.isLoading,
  error: query.isError,
});

export default function AimManagement() {
  // Refetch on mount so renamed masters always show correctly
  const opts = { refetchOnMountOrArgChange: true };

  const {
    data: aims = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAimsQuery(undefined, opts);

  const customersQuery = useGetCustomersQuery(undefined, opts);
  const productsQuery = useGetProductsQuery(undefined, opts);
  const packingsQuery = useGetPackingsQuery(undefined, opts);
  const hardnessQuery = useGetHardnessesQuery(undefined, opts);
  const inoculantsQuery = useGetInoculantsQuery(undefined, opts);

  const {
    data: ironTypes = [],
    isLoading: ironTypesLoading,
    isError: ironTypesError,
  } = useGetIronTypesQuery(undefined, opts);

  const { data: elements = [] } = useGetElementsQuery(undefined, opts);

  const [createAim, { isLoading: creating }] = useCreateAimMutation();
  const [updateAim, { isLoading: updating }] = useUpdateAimMutation();
  const [deleteAim, { isLoading: deleting }] = useDeleteAimMutation();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Aim | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Aim | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const saving = creating || updating;

  const showToast = (type: ToastState["type"], text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  // Newest first
  const sorted = useMemo(() => [...aims].sort((a, b) => b.id - a.id), [aims]);

  // Search by customer, product, drawing no or iron type
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;

    return sorted.filter(
      (a) =>
        (a.customer?.customer_name ?? "").toLowerCase().includes(q) ||
        (a.product?.product_name ?? "").toLowerCase().includes(q) ||
        a.drawing_no.toLowerCase().includes(q) ||
        (a.iron_type?.name ?? "").toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const customerCount = useMemo(
    () => new Set(aims.map((a) => a.customer?.id).filter(Boolean)).size,
    [aims]
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

  const allExpanded =
    paginated.length > 0 && paginated.every((a) => expandedIds.includes(a.id));

  const toggleRow = (id: number) =>
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () =>
    setExpandedIds(allExpanded ? [] : paginated.map((a) => a.id));

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (item: Aim) => {
    setEditing(item);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleSubmit = async (payload: CreateAimRequest) => {
    try {
      if (editing) {
        await updateAim({ id: editing.id, body: payload }).unwrap();
        showToast("success", "Aim updated");
      } else {
        await createAim(payload).unwrap();
        showToast("success", "Aim added");
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
      await deleteAim(deleteTarget.id).unwrap();
      showToast("success", "Aim deleted");
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Could not delete aim"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="as-page">
      {/* Header */}
      <div className="as-header">
        <div>
          <h1>Aim Master</h1>
          <p>Casting aims per customer and product, with their chemical specification.</p>
        </div>
        <button className="as-btn as-btn--primary" onClick={openCreate}>
          <span className="as-btn__plus">+</span> Add aim
        </button>
      </div>

      {/* Stats + search */}
      <div className="as-toolbar">
        <div className="as-stats">
          <div className="as-stat as-stat--orange">
            <span>Aims</span>
            <strong>{aims.length}</strong>
          </div>
          <div className="as-stat as-stat--dark">
            <span>Customers</span>
            <strong>{customerCount}</strong>
          </div>
        </div>

        <div className="as-toolbar__right">
          {filtered.length > 0 && (
            <button type="button" className="as-btn as-btn--ghost" onClick={toggleAll}>
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          )}

          <div className="as-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search customer, product, drawing..."
            />
            {search && (
              <button type="button" onClick={() => handleSearch("")} aria-label="Clear search">
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="as-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="as-skeleton" key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="as-empty">
          <div className="as-empty__icon">⚠</div>
          <h3>Couldn't load aims</h3>
          <p>{getApiErrorMessage(error, "Check that the backend is running and that you are signed in.")}</p>
          <button className="as-btn as-btn--primary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="as-empty">
          <div className="as-empty__icon">🎯</div>
          <h3>{search ? "No matching aims" : "No aims yet"}</h3>
          <p>
            {search
              ? "Try a different customer, product, drawing number or iron type."
              : "Create your first aim with its materials, weights and chemical specification."}
          </p>
          {!search && (
            <button className="as-btn as-btn--primary" onClick={openCreate}>
              + Add first aim
            </button>
          )}
        </div>
      ) : (
        <div className="as-card">
          <AimTable
            items={paginated}
            elements={elements}
            expandedIds={expandedIds}
            onToggle={toggleRow}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />

          {/* Pagination */}
          <div className="as-pagination">
            <span>
              Showing {startItem}-{endItem} of {filtered.length}
            </span>

            <div className="as-pagination__controls">
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
      <AimForm
        open={drawerOpen}
        initial={editing}
        customers={toLookup(customersQuery)}
        products={toLookup(productsQuery)}
        packings={toLookup(packingsQuery)}
        hardnesses={toLookup(hardnessQuery)}
        inoculants={toLookup(inoculantsQuery)}
        ironTypes={ironTypes}
        ironTypesLoading={ironTypesLoading}
        ironTypesError={ironTypesError}
        saving={saving}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete aim?"
        message={`Are you sure you want to permanently delete aim ${deleteTarget?.drawing_no ?? ""}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toast && <div className={`as-toast as-toast--${toast.type}`}>{toast.text}</div>}
    </div>
  );
}