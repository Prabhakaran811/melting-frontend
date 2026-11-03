import { useMemo, useState } from "react";
import {
  useGetElementsQuery,
  useCreateElementMutation,
  useUpdateElementMutation,
  useDeleteElementMutation,
} from "../elementApi";
import type { Element, ElementPayload } from "../elementTypes";
import ElementCard from "../components/ElementCard";
import ElementForm from "../components/ElementForm";
import "../ElementManagement.css";

interface ToastState {
  type: "success" | "error";
  text: string;
}

// Pulls a readable message out of an RTK Query / FastAPI error
function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as { data?: { detail?: unknown; message?: string }; error?: string };
  if (typeof e?.data?.detail === "string") return e.data.detail;
  if (Array.isArray(e?.data?.detail)) {
    const first = e.data!.detail[0] as { msg?: string } | undefined;
    if (first?.msg) return first.msg;
  }
  if (e?.data?.message) return e.data.message;
  if (e?.error) return e.error;
  return fallback;
}

export default function ElementManagement() {
  const {
    data: elements = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetElementsQuery();

  const [createElement, { isLoading: creating }] = useCreateElementMutation();
  const [updateElement, { isLoading: updating }] = useUpdateElementMutation();
  const [deleteElement, { isLoading: deleting }] = useDeleteElementMutation();

  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Element | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Element | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const saving = creating || updating;

  const showToast = (type: ToastState["type"], text: string) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 3200);
  };

  const sorted = useMemo(
    () => [...elements].sort((a, b) => a.sequence_order - b.sequence_order),
    [elements]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (e) => e.name.toLowerCase().includes(q) || e.abbreviation.toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const nextOrder = useMemo(
    () => (elements.length ? Math.max(...elements.map((e) => e.sequence_order)) + 1 : 1),
    [elements]
  );

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (el: Element) => {
    setEditing(el);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleSubmit = async (payload: ElementPayload) => {
    try {
      if (editing) {
        const updated = await updateElement({ id: editing.id, body: payload }).unwrap();
        showToast("success", `${updated.name} updated`);
      } else {
        const created = await createElement(payload).unwrap();
        showToast("success", `${created.name} added`);
      }
      setDrawerOpen(false);
    } catch (err) {
      showToast("error", getErrorMessage(err, "Something went wrong"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteElement(deleteTarget.id).unwrap();
      showToast("success", `${deleteTarget.name} deleted`);
      setDeleteTarget(null);
    } catch (err) {
      showToast("error", getErrorMessage(err, "Could not delete element"));
    }
  };

  return (
    <div className="el-page">
      {/* Header */}
      <div className="el-header">
        <div>
          <h1>Element Master</h1>
          <p>Chemical elements used in your melt chemistry, in the order they are recorded.</p>
        </div>
        <button className="el-btn el-btn--primary" onClick={openCreate}>
          <span className="el-btn__plus">+</span> Add element
        </button>
      </div>

      {/* Stats + search */}
      <div className="el-toolbar">
        <div className="el-stats">
          <div className="el-stat el-stat--orange">
            <span>Total elements</span>
            <strong>{elements.length}</strong>
          </div>
          <div className="el-stat el-stat--dark">
            <span>Next position</span>
            <strong>#{nextOrder}</strong>
          </div>
        </div>

        <div className="el-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or symbol..."
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Sequence strip */}
      {sorted.length > 0 && (
        <section className="el-sequence">
          <div className="el-sequence__title">Recording sequence</div>
          <div className="el-sequence__track">
            {sorted.map((el, i) => (
              <div className="el-sequence__item" key={el.id}>
                <button type="button" className="el-chip" onClick={() => openEdit(el)} title={`${el.name} · #${el.sequence_order}`}>
                  <em>{el.sequence_order}</em>
                  {el.abbreviation}
                </button>
                {i < sorted.length - 1 && <span className="el-sequence__arrow">→</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="el-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="el-tile el-skeleton" key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="el-empty">
          <div className="el-empty__icon">⚠</div>
          <h3>Couldn't load elements</h3>
          <p>{getErrorMessage(error, "Could not load elements")}</p>
          <button className="el-btn el-btn--primary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="el-empty">
          <div className="el-empty__icon">⚗</div>
          <h3>{search ? "No matching elements" : "No elements yet"}</h3>
          <p>
            {search
              ? "Try a different name or symbol."
              : "Start by adding Carbon, Silicon, Manganese and the rest of your melt chemistry."}
          </p>
          {!search && (
            <button className="el-btn el-btn--primary" onClick={openCreate}>
              + Add first element
            </button>
          )}
        </div>
      ) : (
        <div className="el-grid">
          {filtered.map((el, i) => (
            <ElementCard
              key={el.id}
              element={el}
              accentIndex={i}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
          <button type="button" className="el-tile el-tile--add" onClick={openCreate}>
            <span>+</span>
            Add element
          </button>
        </div>
      )}

      {/* Drawer form */}
      <ElementForm
        open={drawerOpen}
        initial={editing}
        nextOrder={nextOrder}
        existing={elements}
        saving={saving}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
      />

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="el-modal-wrap" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="el-modal" onClick={(e) => e.stopPropagation()}>
            <div className="el-modal__icon">🗑</div>
            <h3>Delete {deleteTarget.name}?</h3>
            <p>
              <b>{deleteTarget.abbreviation}</b> will be permanently removed. This cannot be undone.
            </p>
            <div className="el-modal__actions">
              <button className="el-btn el-btn--ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="el-btn el-btn--danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`el-toast el-toast--${toast.type}`}>{toast.text}</div>}
    </div>
  );
}