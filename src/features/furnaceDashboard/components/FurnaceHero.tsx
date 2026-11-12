import { useEffect, useState } from "react";
import type {
  Furnace,
  FurnaceCycle,
  ChargeMix,
  DashboardOrder,
} from "../furnaceDashboardTypes";

interface Props {
  furnace: Furnace | null;
  cycle: FurnaceCycle | null;
  order: DashboardOrder | null;
  mix: ChargeMix | null;
  nextStage: string | null;
  hasMix: boolean;
  canEditMix: boolean;
  canConfirmMix: boolean;
  canComplete: boolean;
  busy: boolean;
  onStart: () => void;
  onEditMix: () => void;
  onConfirmMix: () => void;
  onNextStage: () => void;
  onComplete: () => void;
}

// Live HH:MM:SS since the cycle started
function useElapsed(startedAt: string | undefined, active: boolean): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  if (!startedAt || !active) return "--:--:--";
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return "--:--:--";

  const total = Math.max(0, Math.floor((now - start) / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// Animated molten furnace vessel
function Vessel({ percent, running }: { percent: number; running: boolean }) {
  const top = 30;
  const bottom = 222;
  const fill = (Math.min(100, Math.max(0, percent)) / 100) * (bottom - top);
  const y = bottom - fill;

  return (
    <div className={`fd-vessel ${running ? "is-running" : ""}`}>
      <svg viewBox="0 0 200 250" role="img" aria-label={`Furnace filled ${Math.round(percent)} percent`}>
        <defs>
          <clipPath id="fd-vessel-clip">
            <path d="M40 30 H160 L180 200 Q182 222 160 224 H40 Q18 222 20 200 Z" />
          </clipPath>
          <linearGradient id="fd-melt-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe066" />
            <stop offset="0.45" stopColor="#ff922b" />
            <stop offset="1" stopColor="#e8590c" />
          </linearGradient>
        </defs>

        <path
          d="M40 30 H160 L180 200 Q182 222 160 224 H40 Q18 222 20 200 Z"
          fill="rgba(255,255,255,.04)"
        />

        <g clipPath="url(#fd-vessel-clip)">
          <g className="fd-melt" style={{ transform: `translateY(${y}px)` }}>
            <rect x="0" y="6" width="200" height="260" fill="url(#fd-melt-grad)" />
            <path
              className="fd-wave fd-wave--back"
              d="M-200 6 Q-150 -4 -100 6 T0 6 T100 6 T200 6 T300 6 V30 H-200 Z"
              fill="#ffe066"
              opacity="0.5"
            />
            <path
              className="fd-wave fd-wave--front"
              d="M-200 8 Q-150 0 -100 8 T0 8 T100 8 T200 8 T300 8 V30 H-200 Z"
              fill="#ffa94d"
              opacity="0.75"
            />
          </g>
        </g>

        <path
          d="M40 30 H160 L180 200 Q182 222 160 224 H40 Q18 222 20 200 Z"
          fill="none"
          stroke="#475069"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect x="32" y="22" width="136" height="9" rx="4.5" fill="#475069" />
      </svg>

      <div className="fd-vessel__label">
        <strong>{Math.round(percent)}%</strong>
        <span>charged</span>
      </div>

      {running && (
        <div className="fd-embers" aria-hidden="true">
          <i /><i /><i /><i /><i />
        </div>
      )}
    </div>
  );
}

export default function FurnaceHero({
  furnace,
  cycle,
  order,
  mix,
  nextStage,
  hasMix,
  canEditMix,
  canConfirmMix,
  canComplete,
  busy,
  onStart,
  onEditMix,
  onConfirmMix,
  onNextStage,
  onComplete,
}: Props) {
  const running = Boolean(cycle) && (cycle?.status ?? "").toLowerCase() === "running";
  const elapsed = useElapsed(cycle?.started_at, running);

  const capacity = Number(mix?.charging_capacity ?? cycle?.furnace_capacity ?? furnace?.capacity ?? 0);
  const charged = Number(mix?.total_charged_weight ?? 0);
  const percent = capacity > 0 ? (charged / capacity) * 100 : 0;
  const remaining = Math.max(0, capacity - charged);

  const aim = order?.aim;

  // Idle: no running cycle
  if (!cycle) {
    const inactive = furnace ? !furnace.is_active : false;

    return (
      <section className="fd-hero fd-hero--idle">
        <Vessel percent={0} running={false} />

        <div className="fd-hero__content fd-idle">
          <span className="fd-eyebrow">{furnace?.furnace_no ?? "Furnace"}</span>
          <h2>{inactive ? "Furnace is inactive" : "Ready for a new heat"}</h2>
          <p>
            {inactive
              ? "Activate this furnace in Furnace Master before starting a melt."
              : "No melt is running on this furnace. Pick an order and start a new cycle. A Heat Number is generated automatically."}
          </p>

          <div className="fd-idle__stats">
            <div>
              <span>Capacity</span>
              <strong>{capacity.toLocaleString("en-IN")} kg</strong>
            </div>
            <div>
              <span>Furnace</span>
              <strong>{furnace?.name ?? "-"}</strong>
            </div>
          </div>

          <button className="fd-btn fd-btn--glow" onClick={onStart} disabled={inactive || !furnace}>
            🔥 Start melt cycle
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="fd-hero">
      <Vessel percent={percent} running={running} />

      <div className="fd-hero__content">
        {/* Heat number */}
        <div className="fd-hero__top">
          <div>
            <span className="fd-eyebrow">{furnace?.furnace_no} · Heat number</span>
            <h2 className="fd-heat">{cycle.heat_no}</h2>
          </div>
          <span className={`fd-live ${running ? "is-on" : ""}`}>
            <i />
            {cycle.status}
          </span>
        </div>

        {/* Tiles */}
        <div className="fd-tiles">
          <div className="fd-tile fd-tile--timer">
            <span>Melt time</span>
            <strong>{elapsed}</strong>
          </div>
          <div className="fd-tile">
            <span>Active stage</span>
            <strong>{cycle.active_stage}</strong>
          </div>
          <div className="fd-tile">
            <span>Charged</span>
            <strong>
              {charged.toLocaleString("en-IN")} <small>/ {capacity.toLocaleString("en-IN")} kg</small>
            </strong>
          </div>
          <div className="fd-tile">
            <span>Remaining</span>
            <strong>
              {remaining.toLocaleString("en-IN")} <small>kg</small>
            </strong>
          </div>
        </div>

        {/* Order info */}
        <div className="fd-order">
          <div><span>Order</span><strong>{order?.order_number ?? `#${cycle.order_id}`}</strong></div>
          <div><span>Customer</span><strong>{aim?.customer?.customer_name ?? "-"}</strong></div>
          <div><span>Product</span><strong>{aim?.product?.product_name ?? "-"}</strong></div>
          <div><span>Drawing</span><strong>{aim?.drawing_no ?? "-"}</strong></div>
          <div><span>Iron type</span><strong>{aim?.iron_type?.name ?? "-"}</strong></div>
        </div>

        {/* Actions */}
        <div className="fd-actions">
          {canEditMix && (
            <button
              className={`fd-btn ${hasMix ? "fd-btn--light" : "fd-btn--glow"}`}
              onClick={onEditMix}
              disabled={busy}
            >
              {hasMix ? "✎ Edit charge mix" : "＋ Add charge mix"}
            </button>
          )}
          {canConfirmMix && (
            <button className="fd-btn fd-btn--glow" onClick={onConfirmMix} disabled={busy}>
              ✓ Confirm charge mix
            </button>
          )}
          {nextStage && (
            <button className="fd-btn fd-btn--light" onClick={onNextStage} disabled={busy}>
              Move to {nextStage} →
            </button>
          )}
          {canComplete && (
            <button className="fd-btn fd-btn--outline" onClick={onComplete} disabled={busy}>
              ⏹ Complete melt
            </button>
          )}
        </div>
      </div>
    </section>
  );
}