import { useEffect, useMemo, useRef, useState } from "react";

import {
  useGetFurnacesQuery,
  useGetFurnaceDetailsQuery,
  useGetSpectrumComparisonQuery,
  useStartCycleMutation,
  useUpdateStageMutation,
  useCreateChargeMixMutation,
  useUpdateChargeMixMutation,
  useConfirmChargeMixMutation,
  useCompleteCycleMutation,
} from "../furnaceDashboardApi";
import { useGetOrdersQuery } from "../../orders/orderApi";
import { useGetRawMaterialStocksQuery } from "../../rawMaterialStocks/rawMaterialStockApi";
import { useGetElementsQuery } from "../../elements/elementApi";
import { CYCLE_STAGES } from "../furnaceDashboardTypes";
import type { ChargeMixItemInput } from "../furnaceDashboardTypes";

import FurnaceSelector from "../components/FurnaceSelector";
import FurnaceHero from "../components/FurnaceHero";
import CycleTimeline from "../components/CycleTimeline";
import ChargeMixPanel from "../components/ChargeMixPanel";
import ChargeMixDrawer from "../components/ChargeMixDrawer";
import SpectrumPanel from "../components/SpectrumPanel";
import StartCycleDrawer from "../components/StartCycleDrawer";

import "../FurnaceDashboard.css";

const REFRESH_MS = 15000;

interface ToastState {
  type: "success" | "error";
  text: string;
}

// Convert API errors into readable strings (supports { success:false, message } and FastAPI detail)
const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return fallback;
  }

  const data = (error as { data?: { detail?: unknown; message?: string } }).data;
  if (!data) return fallback;

  if (typeof data.message === "string") return data.message;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item: unknown) =>
        typeof item === "object" && item !== null && "msg" in item
          ? String((item as { msg: unknown }).msg)
          : "Invalid input."
      )
      .join(", ");
  }

  return fallback;
};

type ModalType = "confirm-mix" | "complete" | null;

export default function FurnaceDashboard() {
  const {
    data: furnaces = [],
    isLoading: furnacesLoading,
    isError: furnacesError,
    error: furnacesErrorObj,
    refetch: refetchFurnaces,
  } = useGetFurnacesQuery(undefined, { refetchOnMountOrArgChange: true });

  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Select the first furnace once the list arrives
  useEffect(() => {
    if (selectedId === null && furnaces.length > 0) setSelectedId(furnaces[0].id);
  }, [furnaces, selectedId]);

  // Live details of the selected furnace (auto-refresh)
  const {
    data: details,
    isLoading: detailsLoading,
    isFetching: detailsFetching,
    isError: detailsError,
    error: detailsErrorObj,
    refetch: refetchDetails,
  } = useGetFurnaceDetailsQuery(selectedId ?? 0, {
    skip: selectedId === null,
    pollingInterval: REFRESH_MS,
    refetchOnMountOrArgChange: true,
  });

  const furnace = details?.furnace ?? furnaces.find((f) => f.id === selectedId) ?? null;
  const cycle = details?.current_cycle ?? null;
  const order = details?.order ?? null;
  const mix = details?.charge_mix ?? null;
  const results = details?.spectrum_results ?? [];

  const {
    data: comparison,
    isLoading: comparisonLoading,
    isError: comparisonError,
  } = useGetSpectrumComparisonQuery(
    { furnaceId: selectedId ?? 0, cycleId: cycle?.id ?? 0 },
    { skip: selectedId === null || !cycle || results.length === 0, pollingInterval: REFRESH_MS }
  );

  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
  } = useGetOrdersQuery(undefined, { refetchOnMountOrArgChange: true });

  // Data for the charge mix form
  const {
    data: stocks = [],
    isLoading: stocksLoading,
    isError: stocksError,
  } = useGetRawMaterialStocksQuery(undefined, { refetchOnMountOrArgChange: true });

  const { data: elements = [] } = useGetElementsQuery(undefined, { refetchOnMountOrArgChange: true });

  const [startCycle, { isLoading: starting }] = useStartCycleMutation();
  const [updateStage, { isLoading: movingStage }] = useUpdateStageMutation();
  const [createChargeMix, { isLoading: creatingMix }] = useCreateChargeMixMutation();
  const [updateChargeMix, { isLoading: updatingMix }] = useUpdateChargeMixMutation();
  const [confirmMix, { isLoading: confirming }] = useConfirmChargeMixMutation();
  const [completeCycle, { isLoading: completing }] = useCompleteCycleMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mixDrawerOpen, setMixDrawerOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [remarks, setRemarks] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const busy = movingStage || confirming || completing;

  const showToast = (type: ToastState["type"], text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = window.setTimeout(() => setToast(null), 3400);
  };

  // What the operator can do right now
  const stageIndex = cycle ? CYCLE_STAGES.indexOf(cycle.active_stage) : -1;
  const upcoming = stageIndex >= 0 ? CYCLE_STAGES[stageIndex + 1] : undefined;
  const nextStage = upcoming && upcoming !== "Completed" ? upcoming : null;
  const mixIsDraft = (mix?.status ?? "").toLowerCase() === "draft";
  const canEditMix = Boolean(cycle) && (!mix || mixIsDraft);
  const canConfirmMix = mixIsDraft;
  const canComplete = stageIndex >= CYCLE_STAGES.indexOf("Spectrum Testing");
  const defaultCapacity = Number(
    mix?.charging_capacity ?? cycle?.furnace_capacity ?? furnace?.capacity ?? 0
  );

  const selectedFurnaceId = selectedId;

  const handleStart = async (orderId: number) => {
    if (selectedFurnaceId === null) return;
    try {
      const created = await startCycle({ furnaceId: selectedFurnaceId, order_id: orderId }).unwrap();
      showToast("success", `Heat ${created.heat_no} started`);
      setDrawerOpen(false);
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Could not start the cycle"));
    }
  };

  const handleSaveMix = async (payload: { charging_capacity: number; items: ChargeMixItemInput[] }) => {
    if (selectedFurnaceId === null || !cycle) return;
    try {
      if (mix) {
        await updateChargeMix({
          furnaceId: selectedFurnaceId,
          cycleId: cycle.id,
          body: { items: payload.items },
        }).unwrap();
        showToast("success", "Charge mix updated");
      } else {
        await createChargeMix({
          furnaceId: selectedFurnaceId,
          cycleId: cycle.id,
          body: payload,
        }).unwrap();
        showToast("success", "Charge mix saved");
      }
      setMixDrawerOpen(false);
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Could not save the charge mix"));
    }
  };

  const handleNextStage = async () => {
    if (selectedFurnaceId === null || !cycle || !nextStage) return;
    try {
      await updateStage({
        furnaceId: selectedFurnaceId,
        cycleId: cycle.id,
        active_stage: nextStage,
      }).unwrap();
      showToast("success", `Moved to ${nextStage}`);
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Could not change the stage"));
    }
  };

  const handleConfirmMix = async () => {
    if (selectedFurnaceId === null || !cycle) return;
    try {
      await confirmMix({ furnaceId: selectedFurnaceId, cycleId: cycle.id }).unwrap();
      showToast("success", "Charge mix confirmed");
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Could not confirm the charge mix"));
    } finally {
      setModal(null);
    }
  };

  const handleComplete = async () => {
    if (selectedFurnaceId === null || !cycle) return;
    try {
      await completeCycle({
        furnaceId: selectedFurnaceId,
        cycleId: cycle.id,
        remarks: remarks.trim(),
      }).unwrap();
      showToast("success", `Heat ${cycle.heat_no} completed`);
      setModal(null);
      setRemarks("");
    } catch (err) {
      showToast("error", getApiErrorMessage(err, "Could not complete the melt"));
      setModal(null);
    }
  };

  const refreshAll = () => {
    refetchFurnaces();
    if (selectedId !== null) refetchDetails();
  };

  const summary = useMemo(() => {
    const running = furnaces.filter((f) => (f.status ?? "").toLowerCase() === "running").length;
    return { total: furnaces.length, running };
  }, [furnaces]);

  return (
    <div className="fd-page">
      {/* Header */}
      <div className="fd-header">
        <div>
          <h1>Furnace Dashboard</h1>
          <p>
            Live view of the current melt
            {summary.total > 0 && ` · ${summary.total} furnaces`}
          </p>
        </div>

        <button
          type="button"
          className={`fd-refresh ${detailsFetching ? "is-spinning" : ""}`}
          onClick={refreshAll}
          title="Refresh now. The dashboard also refreshes every 15 seconds."
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 11-3-6.7" />
            <path d="M21 4v5h-5" />
          </svg>
          {detailsFetching ? "Updating..." : "Live · 15s"}
        </button>
      </div>

      {furnacesError ? (
        <div className="fd-error">
          <h3>Couldn't load furnaces</h3>
          <p>{getApiErrorMessage(furnacesErrorObj, "Check that the backend is running and that you are signed in.")}</p>
          <button className="fd-btn fd-btn--glow" onClick={() => refetchFurnaces()}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <FurnaceSelector
            furnaces={furnaces}
            selectedId={selectedId}
            loading={furnacesLoading}
            onSelect={setSelectedId}
          />

          {selectedId !== null && detailsLoading ? (
            <div className="fd-skeleton fd-skeleton--hero" />
          ) : detailsError ? (
            <div className="fd-error">
              <h3>Couldn't load furnace details</h3>
              <p>{getApiErrorMessage(detailsErrorObj, "Please try again.")}</p>
              <button className="fd-btn fd-btn--glow" onClick={() => refetchDetails()}>
                Try again
              </button>
            </div>
          ) : (
            selectedId !== null && (
              <>
                <FurnaceHero
                  furnace={furnace}
                  cycle={cycle}
                  order={order}
                  mix={mix}
                  nextStage={nextStage}
                  hasMix={Boolean(mix)}
                  canEditMix={canEditMix}
                  canConfirmMix={canConfirmMix}
                  canComplete={canComplete}
                  busy={busy}
                  onStart={() => setDrawerOpen(true)}
                  onEditMix={() => setMixDrawerOpen(true)}
                  onConfirmMix={() => setModal("confirm-mix")}
                  onNextStage={handleNextStage}
                  onComplete={() => setModal("complete")}
                />

                {cycle && (
                  <CycleTimeline
                    activeStage={cycle.active_stage}
                    completed={cycle.status.toLowerCase() === "completed"}
                  />
                )}

                <div className="fd-grid">
                  <ChargeMixPanel
                    mix={mix}
                    hasCycle={Boolean(cycle)}
                    canEdit={canEditMix}
                    onEdit={() => setMixDrawerOpen(true)}
                  />
                  <SpectrumPanel
                    hasCycle={Boolean(cycle)}
                    results={results}
                    comparison={comparison}
                    comparisonLoading={comparisonLoading}
                    comparisonError={comparisonError}
                  />
                </div>
              </>
            )
          )}
        </>
      )}

      {/* Start cycle drawer */}
      <StartCycleDrawer
        open={drawerOpen}
        furnace={furnace}
        orders={orders}
        loading={ordersLoading}
        error={ordersError}
        saving={starting}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleStart}
      />

      {/* Charge mix drawer */}
      <ChargeMixDrawer
        open={mixDrawerOpen}
        mix={mix}
        defaultCapacity={defaultCapacity}
        stocks={stocks}
        stocksLoading={stocksLoading}
        stocksError={stocksError}
        elements={elements}
        saving={creatingMix || updatingMix}
        onClose={() => setMixDrawerOpen(false)}
        onSubmit={handleSaveMix}
      />

      {/* Confirm / complete modals */}
      {modal && (
        <div className="fd-modal-wrap" onClick={() => !busy && setModal(null)}>
          <div className="fd-modal" onClick={(e) => e.stopPropagation()}>
            {modal === "confirm-mix" ? (
              <>
                <div className="fd-modal__icon">✓</div>
                <h3>Confirm charge mix?</h3>
                <p>
                  Once confirmed, the charge mix is locked and can no longer be edited. The server checks the
                  capacity and stock before confirming.
                </p>
              </>
            ) : (
              <>
                <div className="fd-modal__icon">⏹</div>
                <h3>Complete this melt?</h3>
                <p>
                  Heat <b>{cycle?.heat_no}</b> will be closed and the furnace becomes available again. The server
                  checks the charge mix and quality rules first.
                </p>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Remarks (optional)"
                  rows={3}
                />
              </>
            )}

            <div className="fd-modal__actions">
              <button className="fd-btn fd-btn--ghost" onClick={() => setModal(null)} disabled={busy}>
                Cancel
              </button>
              <button
                className="fd-btn fd-btn--glow"
                onClick={modal === "confirm-mix" ? handleConfirmMix : handleComplete}
                disabled={busy}
              >
                {busy ? "Working..." : modal === "confirm-mix" ? "Confirm" : "Complete melt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`fd-toast fd-toast--${toast.type}`}>{toast.text}</div>}
    </div>
  );
}