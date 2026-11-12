import { useEffect, useMemo, useState } from "react";
import type {
  SpectrumResult,
  SpectrumComparison,
  SpectrumComparisonElement,
} from "../furnaceDashboardTypes";
import { formatDateTime } from "../furnaceDashboardTypes";

interface Props {
  hasCycle: boolean;
  results: SpectrumResult[];
  comparison: SpectrumComparison | undefined;
  comparisonLoading: boolean;
  comparisonError: boolean;
}

// One element: aim band + actual marker
function RangeBar({ item }: { item: SpectrumComparisonElement }) {
  const { aim_min: min, aim_max: max, actual_value: actual } = item;
  const ok = item.status.toUpperCase() === "OK";

  const span = max - min || Math.abs(max) * 0.1 || 1;
  let lo = min - span * 0.7;
  let hi = max + span * 0.7;
  if (actual !== null) {
    lo = Math.min(lo, actual - span * 0.15);
    hi = Math.max(hi, actual + span * 0.15);
  }
  const pos = (v: number) => Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100));

  return (
    <div className={`fd-range ${ok ? "is-ok" : "is-bad"}`}>
      <div className="fd-range__head">
        <b>{item.element}</b>
        <span>
          {min} – {max}
        </span>
        <strong>{actual === null ? "No value" : actual}</strong>
      </div>

      <div className="fd-range__track">
        <div
          className="fd-range__band"
          style={{ left: `${pos(min)}%`, width: `${pos(max) - pos(min)}%` }}
        />
        {actual !== null && <div className="fd-range__marker" style={{ left: `${pos(actual)}%` }} />}
      </div>
    </div>
  );
}

export default function SpectrumPanel({
  hasCycle,
  results,
  comparison,
  comparisonLoading,
  comparisonError,
}: Props) {
  const sorted = useMemo(
    () => [...results].sort((a, b) => a.test_number - b.test_number),
    [results]
  );

  const [selected, setSelected] = useState<number | null>(null);

  // Default to the latest test whenever new results arrive
  useEffect(() => {
    if (sorted.length === 0) {
      setSelected(null);
      return;
    }
    setSelected((prev) =>
      prev !== null && sorted.some((r) => r.test_number === prev)
        ? prev
        : sorted[sorted.length - 1].test_number
    );
  }, [sorted]);

  const current = sorted.find((r) => r.test_number === selected) ?? null;

  return (
    <section className="fd-card">
      <div className="fd-card__head">
        <h3>Spectrum analysis</h3>
        <span>
          {sorted.length} test{sorted.length === 1 ? "" : "s"}
        </span>
      </div>

      {!hasCycle ? (
        <p className="fd-empty">Start a melt cycle to see its spectrum results.</p>
      ) : sorted.length === 0 ? (
        <p className="fd-empty">Waiting for the first spectrum result...</p>
      ) : (
        <>
          {/* Test tabs */}
          <div className="fd-tabs">
            {sorted.map((r) => (
              <button
                type="button"
                key={r.id}
                className={r.test_number === selected ? "is-active" : ""}
                onClick={() => setSelected(r.test_number)}
              >
                Test {r.test_number}
                {r.test_stage && <em>{r.test_stage}</em>}
              </button>
            ))}
          </div>

          {/* Element values */}
          {current && (
            <>
              <div className="fd-elements">
                {Object.entries(current.elements).map(([symbol, value]) => (
                  <div className="fd-elcell" key={symbol}>
                    <span>{symbol}</span>
                    <strong>{Number(value)}</strong>
                  </div>
                ))}
              </div>
              <p className="fd-sub">
                {[current.result_status, current.operator_name, current.received_at && formatDateTime(current.received_at)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </>
          )}

          {/* Aim vs actual */}
          <div className="fd-compare">
            <div className="fd-compare__head">
              <h4>Aim vs actual</h4>
              {comparison && (
                <span
                  className={`fd-chip ${
                    comparison.overall_status.toUpperCase() === "OK" ? "fd-chip--green" : "fd-chip--red"
                  }`}
                >
                  {comparison.overall_status} · {comparison.passed_count} pass / {comparison.failed_count} fail
                </span>
              )}
            </div>

            {comparisonLoading && !comparison ? (
              <div className="fd-skeleton fd-skeleton--block" />
            ) : comparisonError || !comparison ? (
              <p className="fd-empty">Aim comparison is not available for this heat yet.</p>
            ) : (
              <>
                <p className="fd-sub">Showing test {comparison.test_number}</p>
                <div className="fd-ranges">
                  {comparison.elements.map((item) => (
                    <RangeBar key={item.element} item={item} />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}