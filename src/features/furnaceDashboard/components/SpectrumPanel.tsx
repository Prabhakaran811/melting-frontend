import { useEffect, useMemo, useState } from "react";
import type { SpectrumResult } from "../furnaceDashboardTypes";
import { formatDateTime } from "../furnaceDashboardTypes";

interface Props {
  hasCycle: boolean;
  results: SpectrumResult[];
}

export default function SpectrumPanel({ hasCycle, results }: Props) {
  const sorted = useMemo(
    () => [...(results ?? [])].sort((a, b) => a.test_number - b.test_number),
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
  const elementEntries = Object.entries(current?.elements ?? {});

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
                key={r.id ?? r.test_number}
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
              {elementEntries.length > 0 ? (
                <div className="fd-elements">
                  {elementEntries.map(([symbol, value]) => (
                    <div className="fd-elcell" key={symbol}>
                      <span>{symbol}</span>
                      <strong>{Number(value)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="fd-empty">No element values in this test.</p>
              )}

              <p className="fd-sub">
                {[
                  current.result_status,
                  current.operator_name,
                  current.received_at && formatDateTime(current.received_at),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </>
          )}
        </>
      )}
    </section>
  );
}