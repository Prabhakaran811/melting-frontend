import { useEffect, useMemo, useState } from "react";
import type { ReportRow } from "../furnaceReportTypes";
import { formatDuration, formatStarted, kg, money } from "../furnaceReportTypes";

interface Props {
  row: ReportRow;
  rawMaterialName: (id: number | undefined) => string;
}

export default function ReportDetails({ row, rawMaterialName }: Props) {
  const mix = row.charge_mix;
  const items = mix?.items ?? [];
  const tests = useMemo(
    () => [...(row.spectrum_results ?? [])].sort((a, b) => a.test_number - b.test_number),
    [row.spectrum_results]
  );

  const [selected, setSelected] = useState<number | null>(tests[0]?.test_number ?? null);

  // Keep a valid selected test when the data changes
  useEffect(() => {
    setSelected((prev) =>
      prev !== null && tests.some((t) => t.test_number === prev) ? prev : tests[0]?.test_number ?? null
    );
  }, [tests]);

  const test = tests.find((t) => t.test_number === selected) ?? null;
  const confirmed = (mix?.status ?? "").toLowerCase() === "confirmed";

  return (
    <div className="rp-details">
      {/* Summary strip */}
      <div className="rp-summary">
        <div><span>Status</span><strong>{row.summary.cycle_status}</strong></div>
        <div><span>Order</span><strong>{row.order?.order_number ?? "-"}</strong></div>
        <div><span>Capacity (kg)</span><strong>{kg(row.summary.furnace_capacity)}</strong></div>
        <div><span>Charged (kg)</span><strong>{kg(row.summary.total_charged_weight)}</strong></div>
        <div><span>Charge cost</span><strong>{money(row.summary.total_charge_cost)}</strong></div>
        <div><span>Spectrum tests</span><strong>{row.summary.total_spectrum_tests}</strong></div>
        <div><span>Duration</span><strong>{formatDuration(row.summary.started_at, row.summary.completed_at)}</strong></div>
        <div><span>Completed</span><strong>{formatStarted(row.summary.completed_at)}</strong></div>
      </div>

      <div className="rp-panels">
        {/* Charge mix */}
        <section className="rp-panel">
          <div className="rp-panel__head">
            <h4>Charge mix</h4>
            {mix && (
              <span className={`rp-chip ${confirmed ? "rp-chip--green" : "rp-chip--orange"}`}>{mix.status}</span>
            )}
          </div>

          {!mix || items.length === 0 ? (
            <p className="rp-empty">No charge mix was saved for this heat.</p>
          ) : (
            <div className="rp-scroll">
              <table className="rp-sub">
                <thead>
                  <tr>
                    <th>Bunker</th>
                    <th>Raw material</th>
                    <th className="rp-num">Weight (kg)</th>
                    <th className="rp-num">Rate / kg</th>
                    <th className="rp-num">Cost</th>
                    <th>Element %</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="rp-tag">{item.bunker_name ?? "-"}</span>
                      </td>
                      <td className="rp-strong">
                        {rawMaterialName(item.raw_material_stock?.raw_material_id)}
                        <small>Stock #{item.raw_material_stock_id}</small>
                      </td>
                      <td className="rp-num">{kg(item.weight)}</td>
                      <td className="rp-num">{money(item.rate_per_kg)}</td>
                      <td className="rp-num rp-strong">{money(item.total_cost)}</td>
                      <td>
                        <div className="rp-chips">
                          {[...item.elements]
                            .sort((a, b) => (a.element?.sequence_order ?? 99) - (b.element?.sequence_order ?? 99))
                            .map((el) => (
                              <span className="rp-el" key={el.id} title={el.element?.name}>
                                <b>{el.element?.abbreviation ?? `#${el.element_id}`}</b>
                                {Number(el.percentage)}%
                              </span>
                            ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {mix && (
            <div className="rp-mixfoot">
              <span>Total weight {kg(mix.total_charged_weight)} kg</span>
              <span>Remaining {kg(mix.remaining_capacity)} kg</span>
              <strong>Total cost {money(mix.total_cost)}</strong>
            </div>
          )}
        </section>

        {/* Spectrum results */}
        <section className="rp-panel">
          <div className="rp-panel__head">
            <h4>Spectrum results</h4>
            <span className="rp-count">
              {tests.length} test{tests.length === 1 ? "" : "s"}
            </span>
          </div>

          {tests.length === 0 ? (
            <p className="rp-empty">No spectrum test was recorded for this heat.</p>
          ) : (
            <>
              <div className="rp-tabs">
                {tests.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    className={t.test_number === selected ? "is-active" : ""}
                    onClick={() => setSelected(t.test_number)}
                  >
                    Test {t.test_number}
                    {t.test_stage && <em>{t.test_stage}</em>}
                  </button>
                ))}
              </div>

              {test && (
                <>
                  <p className="rp-meta">
                    {[
                      test.operator_name,
                      test.result_status,
                      test.received_at && formatStarted(test.received_at),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>

                  <div className="rp-elgrid">
                    {test.elements.map((el) => (
                      <div className="rp-elcell" key={el.id} title={el.element_name}>
                        <span>{el.element_symbol}</span>
                        <strong>{Number(el.percentage)}</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}