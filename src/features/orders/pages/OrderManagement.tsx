import { useMemo, useRef, useState } from "react";

import {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} from "../orderApi";
import { useGetAimsQuery } from "../../aims/aimApi";

import type { Order } from "../orderTypes";
import { isOverdue, statusTone } from "../orderTypes";
import {
  applySequence,
  clearSequence,
  loadSequence,
  moveId,
  saveSequence,
} from "../orderSequence";

import OrderTable from "../components/OrderTable";
import OrderForm from "../components/OrderForm";
import type { OrderFormValues } from "../components/OrderForm";
import OrderDetail from "../components/OrderDetail";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import "../OrderManagement.css";

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

export default function OrderManagement() {
  const opts = { refetchOnMountOrArgChange: true };

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetOrdersQuery(undefined, opts);

  const {
    data: aims = [],
    isLoading: aimsLoading,
    isError: aimsError,
  } = useGetAimsQuery(undefined, opts);

  const [createOrder, { isLoading: creating }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: updating }] = useUpdateOrderMutation();
  const [deleteOrder, { isLoading: deleting }] = useDeleteOrderMutation();

  const [sequence, setSequence] = useState<number[]>(() => loadSequence());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [viewing, setViewing] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const saving = creating || updating;

  const showToast = (type: ToastState["type"], text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  // Full queue (saved order), used for positions and reordering
  const queue = useMemo(() => applySequence(orders, sequence), [orders, sequence]);

  const positions = useMemo(
    () => new Map(queue.map((o, i) => [o.id, i + 1])),
    [queue]
  );

  // Status filter pills with counts
  const statusCounts = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => map.set(o.status, (map.get(o.status) ?? 0) + 1));
    return Array.from(map.entries());
  }, [orders]);

  // Search and status filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return queue.filter((o) => {
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
      if (!q) return true;

      return (
        o.order_number.toLowerCase().includes(q) ||
        (o.aim?.customer?.customer_name ?? "").toLowerCase().includes(q) ||
        (o.aim?.product?.product_name ?? "").toLowerCase().includes(q) ||
        (o.aim?.drawing_no ?? "").toLowerCase().includes(q) ||
        (o.aim?.iron_type?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [queue, search, statusFilter]);

  // Reordering only makes sense on the complete list
  const canDrag = search.trim() === "" && statusFilter === "All";

  const openCount = orders.filter((o) => {
    const tone = statusTone(o.status);
    return tone !== "done" && tone !== "cancelled";
  }).length;
  const overdueCount = orders.filter(isOverdue).length;

  // Drag and drop: move the dragged order to the position of the target
  const handleReorder = (dragId: number, targetId: number) => {
    const next = moveId(queue.map((o) => o.id), dragId, targetId);
    setSequence(next);
    saveSequence(next); // swap this for an API call if you save the queue on the server
    showToast("success", "Queue order updated");
  };

  const handleResetQueue = () => {
    clearSequence();
    setSequence([]);
    showToast("success", "Queue reset to order number");
  };

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (item: Order) => {
    setEditing(item);
    setDrawerOpen(true);
  };

  const openView = (item: Order) => {
    setViewing(item);
    setDetailOpen(true);
  };

  const handleSubmit = async (values: OrderFormValues) => {
    try {
      if (editing) {
        const updated = await updateOrder({
          id: editing.id,
          body: {
            aim_id: values.aim_id,
            status: values.status,
            customer_delivery_date: values.customer_delivery_date,
          },
        }).unwrap();
        showToast("success", `${updated.order_number} updated`);
      } else {
        // order_number and status are generated by the backend
        const created = await createOrder({
          aim_id: values.aim_id,
          customer_delivery_date: values.customer_delivery_date,
        }).unwrap();
        showToast("success", `${created.order_number} created`);
      }
      setDrawerOpen(false);
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Something went wrong"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteOrder(deleteTarget.id).unwrap();
      showToast("success", `${deleteTarget.order_number} deleted`);
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Could not delete order"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="or-page">
      {/* Header */}
      <div className="or-header">
        <div>
          <h1>Order Management</h1>
          <p>Customer orders and their production queue. Drag rows to change the queue order.</p>
        </div>
        <button className="or-btn or-btn--primary" onClick={openCreate}>
          <span className="or-btn__plus">+</span> New order
        </button>
      </div>

      {/* Stats + search */}
      <div className="or-toolbar">
        <div className="or-stats">
          <div className="or-stat or-stat--orange">
            <span>Orders</span>
            <strong>{orders.length}</strong>
          </div>
          <div className="or-stat or-stat--dark">
            <span>Open</span>
            <strong>{openCount}</strong>
          </div>
          <div className="or-stat or-stat--red">
            <span>Overdue</span>
            <strong>{overdueCount}</strong>
          </div>
        </div>

        <div className="or-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, customer, product, drawing..."
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Status filter + queue hint */}
      {orders.length > 0 && (
        <div className="or-filters">
          <div className="or-chips">
            <button
              type="button"
              className={statusFilter === "All" ? "is-active" : ""}
              onClick={() => setStatusFilter("All")}
            >
              All <em>{orders.length}</em>
            </button>
            {statusCounts.map(([status, count]) => (
              <button
                type="button"
                key={status}
                className={statusFilter === status ? "is-active" : ""}
                onClick={() => setStatusFilter(status)}
              >
                {status} <em>{count}</em>
              </button>
            ))}
          </div>

          <div className="or-hint">
            <span>
              {canDrag
                ? "Drag the handle to reorder the queue"
                : "Clear search and filters to reorder"}
            </span>
            {sequence.length > 0 && (
              <button type="button" onClick={handleResetQueue}>
                Reset queue
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="or-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="or-skeleton" key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="or-empty">
          <div className="or-empty__icon">⚠</div>
          <h3>Couldn't load orders</h3>
          <p>{getApiErrorMessage(error, "Check that the backend is running and that you are signed in.")}</p>
          <button className="or-btn or-btn--primary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="or-empty">
          <div className="or-empty__icon">📋</div>
          <h3>{search || statusFilter !== "All" ? "No matching orders" : "No orders yet"}</h3>
          <p>
            {search || statusFilter !== "All"
              ? "Try a different search or status."
              : "Create the first order by selecting an aim and a delivery date."}
          </p>
          {!search && statusFilter === "All" && (
            <button className="or-btn or-btn--primary" onClick={openCreate}>
              + Create first order
            </button>
          )}
        </div>
      ) : (
        <div className="or-card">
          <OrderTable
            items={filtered}
            positions={positions}
            canDrag={canDrag}
            onReorder={handleReorder}
            onView={openView}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
          <div className="or-footer">
            Showing {filtered.length} of {orders.length} orders
          </div>
        </div>
      )}

      {/* Add / edit drawer */}
      <OrderForm
        open={drawerOpen}
        initial={editing}
        aims={aims}
        aimsLoading={aimsLoading}
        aimsError={aimsError}
        saving={saving}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Detail drawer */}
      <OrderDetail open={detailOpen} order={viewing} onClose={() => setDetailOpen(false)} />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete order?"
        message={`Are you sure you want to permanently delete ${deleteTarget?.order_number ?? "this order"}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toast && <div className={`or-toast or-toast--${toast.type}`}>{toast.text}</div>}
    </div>
  );
}