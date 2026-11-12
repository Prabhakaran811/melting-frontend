import { Fragment } from "react";
import type { ReportRow } from "../furnaceReportTypes";
import { formatStarted, money } from "../furnaceReportTypes";
import ReportDetails from "./ReportDetails";

interface Props {
  rows: ReportRow[];
  expandedIds: number[];
  customerName: (id: number | undefined) => string;
  productName: (id: number | undefined) => string;
  rawMaterialName: (id: number | undefined) => string;
  onToggle: (cycleId: number) => void;
}

const statusTone = (status: string) => {
  const s = status.toLowerCase();
  if (s === "completed") return "green";
  if (s === "running") return "orange";
  if (s === "cancelled") return "red";
  return "gray";
};

export default function ReportTable({
  rows,
  expandedIds,
  customerName,
  productName,
  rawMaterialName,
  onToggle,
}: Props) {
  return (
    <div className="rp-table-wrap">
      <table className="rp-table">
        <thead>
          <tr>
            <th className="rp-col-toggle" aria-label="Expand" />
            <th>Started At</th>
            <th>Heat No</th>
            <th>Drawing No</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Furnace</th>
            <th className="rp-num">Cost</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const id = row.cycle.id;
            const isOpen = expandedIds.includes(id);
            const customer = customerName(row.aim?.customer_id);

            return (
              <Fragment key={id}>
                {/* Main row */}
                <tr className={`rp-row ${isOpen ? "is-open" : ""}`} onClick={() => onToggle(id)}>
                  <td className="rp-col-toggle">
                    <span className={`rp-toggle ${isOpen ? "is-open" : ""}`} aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </span>
                  </td>

                  <td className="rp-nowrap">{formatStarted(row.cycle.started_at)}</td>

                  <td>
                    <div className="rp-heat">
                      <span className="rp-code">{row.cycle.heat_no}</span>
                      <i className={`rp-dot rp-dot--${statusTone(row.cycle.status)}`} title={row.cycle.status} />
                    </div>
                  </td>

                  <td className="rp-strong">{row.aim?.drawing_no ?? "-"}</td>

                  <td>
                    <div className="rp-customer">
                      <span>{customer.charAt(0).toUpperCase()}</span>
                      {customer}
                    </div>
                  </td>

                  <td>{productName(row.aim?.product_id)}</td>

                  <td>
                    <div className="rp-furnace">
                      <strong>{row.furnace?.furnace_no ?? "-"}</strong>
                      <small>{row.furnace?.name}</small>
                    </div>
                  </td>

                  <td className="rp-num rp-cost">{money(row.summary.total_charge_cost)}</td>
                </tr>

                {/* Nested row */}
                {isOpen && (
                  <tr className="rp-nested">
                    <td colSpan={8}>
                      <ReportDetails row={row} rawMaterialName={rawMaterialName} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}