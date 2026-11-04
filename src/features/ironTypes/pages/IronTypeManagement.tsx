import { useMemo, useRef, useState } from "react";

import {
  useGetIronTypesQuery,
  useCreateIronTypeMutation,
  useUpdateIronTypeMutation,
  useDeleteIronTypeMutation,
} from "../ironTypeApi";
import { useGetElementsQuery } from "../../elements/elementApi";

import type { IronType, CreateIronTypeRequest } from "../ironTypeTypes";

import IronTypeCard from "../components/IronTypeCard";
import IronTypeForm from "../components/IronTypeForm";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../IronTypeManagement.css";

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

export default function IronTypeManagement() {
  // Iron types (refetch on mount so renamed elements always show correctly)
  const {
    data: ironTypes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetIronTypesQuery(undefined, { refetchOnMountOrArgChange: true });

  // Element master data for the dropdown
  const {
    data: elements = [],
    isLoading: elementsLoading,
    isError: elementsError,
  } = useGetElementsQuery(undefined, { refetchOnMountOrArgChange: true });

  const [createIronType, { isLoading: creating }] = useCreateIronTypeMutation();
  const [updateIronType, { isLoading: updating }] = useUpdateIronTypeMutation();
  const [deleteIronType, { isLoading: deleting }] = useDeleteIronTypeMutation();

  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<IronType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IronType | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const saving = creating || updating;

  const showToast = (type: ToastState["type"], text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ironTypes;
    return ironTypes.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.elements.some(
          (el) => el.name.toLowerCase().includes(q) || el.abbreviation.toLowerCase().includes(q)
        )
    );
  }, [ironTypes, search]);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (item: IronType) => {
    setEditing(item);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleSubmit = async (payload: CreateIronTypeRequest) => {
    try {
      if (editing) {
        const updated = await updateIronType({ id: editing.id, body: payload }).unwrap();
        showToast("success", `${updated.name} updated`);
      } else {
        const created = await createIronType(payload).unwrap();
        showToast("success", `${created.name} added`);
      }
      setDrawerOpen(false);
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Something went wrong"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteIronType(deleteTarget.id).unwrap();
      showToast("success", `${deleteTarget.name} deleted`);
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Could not delete iron type"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="it-page">
      {/* Header */}
      <div className="it-header">
        <div>
          <h1>Iron Type Master</h1>
          <p>Define each iron grade and the chemical elements tracked for it.</p>
        </div>
        <button className="it-btn it-btn--primary" onClick={openCreate}>
          <span className="it-btn__plus">+</span> Add iron type
        </button>
      </div>

      {/* Stats + search */}
      <div className="it-toolbar">
        <div className="it-stats">
          <div className="it-stat it-stat--orange">
            <span>Iron types</span>
            <strong>{ironTypes.length}</strong>
          </div>
          <div className="it-stat it-stat--dark">
            <span>Elements available</span>
            <strong>{elements.length}</strong>
          </div>
        </div>

        <div className="it-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by iron type or element..."
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="it-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="it-card it-skeleton" key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="it-empty">
          <div className="it-empty__icon">⚠</div>
          <h3>Couldn't load iron types</h3>
          <p>{getApiErrorMessage(error, "Check that the backend is running and that you are signed in.")}</p>
          <button className="it-btn it-btn--primary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="it-empty">
          <div className="it-empty__icon">🔩</div>
          <h3>{search ? "No matching iron types" : "No iron types yet"}</h3>
          <p>
            {search
              ? "Try a different name or element."
              : "Create your first grade, like Grey Cast Iron or Ductile Iron, and pick its elements."}
          </p>
          {!search && (
            <button className="it-btn it-btn--primary" onClick={openCreate}>
              + Add first iron type
            </button>
          )}
        </div>
      ) : (
        <div className="it-grid">
          {filtered.map((item, i) => (
            <IronTypeCard
              key={item.id}
              ironType={item}
              accentIndex={i}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
          <button type="button" className="it-card it-card--add" onClick={openCreate}>
            <span>+</span>
            Add iron type
          </button>
        </div>
      )}

      {/* Drawer form */}
      <IronTypeForm
        open={drawerOpen}
        initial={editing}
        elements={elements}
        elementsLoading={elementsLoading}
        elementsError={elementsError}
        existing={ironTypes}
        saving={saving}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete iron type?"
        message={`Are you sure you want to permanently delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toast && <div className={`it-toast it-toast--${toast.type}`}>{toast.text}</div>}
    </div>
  );
}