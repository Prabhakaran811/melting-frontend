import { useEffect, useMemo, useState } from "react";
import type { SpectrumResult } from "../furnaceDashboardTypes";

interface Props {
  hasCycle: boolean;
  results: SpectrumResult[];
}

// Keys that describe the test itself. Every other numeric key is an element value.
const META_KEYS = new Set(["id", "test_number", "stage", "T", "fur", "received_at"]);

// Show the main elements first, then the rest in the order the server sent them
const PRIORITY = ["C", "Si", "Mn", "P", "S", "Cu", "Cr", "Sn", "Mg", "Mo", "Ni", "Al", "Ceq", "Fe"];

const formatValue = (value: number) =>
  Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));

// Pull the element values out of one flat test result
const getElements = (result: SpectrumResult | null): [string, number][] => {
  if (!result) return [];

  const entries = Object.entries(result).filter(
    (entry): entry is [string, number] =>
      !META_KEYS.has(entry[0]) && typeof entry[1] === "number" && Number.isFinite(entry[1])
  );

  const rank = (symbol: string) => {
    const i = PRIORITY.indexOf(symbol);
    return i === -1 ? PRIORITY.length : i;
  };

  return entries.sort((a, b) => rank(a[0]) - rank(b[0]));
};

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
  const elementEntries = useMemo(() => getElements(current), [current]);

  const operator = current?.T ? String(current.T) : "";
  const furnaceNo = current?.fur ? `Furnace ${current.fur}` : "";

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
                key={r.test_number}
                className={r.test_number === selected ? "is-active" : ""}
                onClick={() => setSelected(r.test_number)}
              >
                Test {r.test_number}
                {r.stage && <em>{r.stage}</em>}
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
                      <strong>{formatValue(value)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="fd-empty">No element values in this test.</p>
              )}

              <p className="fd-sub">
                {[`Test ${current.test_number}`, operator, furnaceNo].filter(Boolean).join(" · ")}
              </p>
            </>
          )}
        </>
      )}
    </section>
  );
}