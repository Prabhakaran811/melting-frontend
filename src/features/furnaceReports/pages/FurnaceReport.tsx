import { useMemo, useState } from "react";

import { useGetFurnaceCycleReportsQuery } from "../furnaceReportApi";
import { useGetCustomersQuery, useGetProductsQuery } from "../../aims/aimApi";
import { lookupLabel } from "../../aims/aimTypes";
import { useGetRawMaterialsQuery } from "../../rawMaterials/rawMaterialApi";

import { kg, money, toDateString } from "../furnaceReportTypes";
import ReportTable from "../components/ReportTable";

import "../FurnaceReport.css";

const PAGE_SIZE = 20;

// Convert API errors into readable strings
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

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateString(d);
};

export default function FurnaceReport() {
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const rangeInvalid = Boolean(fromDate && toDate && fromDate > toDate);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetFurnaceCycleReportsQuery(
    {
      page,
      page_size: PAGE_SIZE,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    },
    { skip: rangeInvalid, refetchOnMountOrArgChange: true }
  );

  // Master lists: the report only returns IDs for customer, product and raw material
  const { data: customers = [] } = useGetCustomersQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: products = [] } = useGetProductsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: rawMaterials = [] } = useGetRawMaterialsQuery(undefined, { refetchOnMountOrArgChange: true });

  const customerMap = useMemo(() => new Map(customers.map((c) => [c.id, lookupLabel(c)])), [customers]);
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, lookupLabel(p)])), [products]);
  const rawMaterialMap = useMemo(() => new Map(rawMaterials.map((r) => [r.id, r.name])), [rawMaterials]);

  const customerName = (id: number | undefined) => (id === undefined ? "-" : customerMap.get(id) ?? `Customer #${id}`);
  const productName = (id: number | undefined) => (id === undefined ? "-" : productMap.get(id) ?? `Product #${id}`);
  const rawMaterialName = (id: number | undefined) =>
    id === undefined ? "Material" : rawMaterialMap.get(id) ?? `Material #${id}`;

  const rows = data?.items ?? [];
  const pagination = data?.pagination;

  // Search + date filter (the date filter also runs here, so it works even before the backend supports it)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((row) => {
      const started = toDateString(new Date(row.cycle.started_at));
      if (fromDate && started < fromDate) return false;
      if (toDate && started > toDate) return false;
      if (!q) return true;

      return (
        row.cycle.heat_no.toLowerCase().includes(q) ||
        (row.aim?.drawing_no ?? "").toLowerCase().includes(q) ||
        customerName(row.aim?.customer_id).toLowerCase().includes(q) ||
        productName(row.aim?.product_id).toLowerCase().includes(q) ||
        (row.furnace?.furnace_no ?? "").toLowerCase().includes(q) ||
        (row.furnace?.name ?? "").toLowerCase().includes(q) ||
        (row.order?.order_number ?? "").toLowerCase().includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, fromDate, toDate, customerMap, productMap]);

  const totalCost = filtered.reduce((sum, r) => sum + Number(r.summary.total_charge_cost), 0);
  const totalWeight = filtered.reduce((sum, r) => sum + Number(r.summary.total_charged_weight), 0);

  const totalPages = Math.max(1, pagination?.total_pages ?? 1);
  const filtersActive = Boolean(fromDate || toDate || search);

  const presets = [
    { label: "Today", from: toDateString(new Date()), to: toDateString(new Date()) },
    { label: "Last 7 days", from: daysAgo(6), to: toDateString(new Date()) },
    {
      label: "This month",
      from: toDateString(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
      to: toDateString(new Date()),
    },
    { label: "All time", from: "", to: "" },
  ];

  const applyRange = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
    setPage(1);
    setExpandedIds([]);
  };

  const clearFilters = () => {
    applyRange("", "");
    setSearch("");
  };

  const toggleRow = (id: number) =>
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const allExpanded = filtered.length > 0 && filtered.every((r) => expandedIds.includes(r.cycle.id));
  const toggleAll = () => setExpandedIds(allExpanded ? [] : filtered.map((r) => r.cycle.id));

  const goToPage = (p: number) => {
    setPage(p);
    setExpandedIds([]);
  };

  return (
    <div className="rp-page">
      {/* Header */}
      <div className="rp-header">
        <div>
          <h1>Furnace Cycle Report</h1>
          <p>Every melt with its charge mix and spectrum results. Click a row to open the details.</p>
        </div>

        <button type="button" className={`rp-refresh ${isFetching ? "is-spinning" : ""}`} onClick={() => refetch()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 11-3-6.7" />
            <path d="M21 4v5h-5" />
          </svg>
          {isFetching ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="rp-stats">
        <div className="rp-stat rp-stat--orange">
          <span>Heats</span>
          <strong>{pagination?.total_records ?? 0}</strong>
        </div>
        <div className="rp-stat rp-stat--dark">
          <span>Shown</span>
          <strong>{filtered.length}</strong>
        </div>
        <div className="rp-stat rp-stat--dark">
          <span>Charged (kg)</span>
          <strong>{kg(totalWeight)}</strong>
        </div>
        <div className="rp-stat rp-stat--green">
          <span>Charge cost</span>
          <strong>{money(totalCost)}</strong>
        </div>
      </div>

      {/* Filters */}
      <section className="rp-filters">
        <div className="rp-presets">
          {presets.map((p) => (
            <button
              type="button"
              key={p.label}
              className={fromDate === p.from && toDate === p.to ? "is-active" : ""}
              onClick={() => applyRange(p.from, p.to)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="rp-filters__row">
          <label className="rp-date">
            <span>From</span>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
                setExpandedIds([]);
              }}
            />
          </label>

          <label className="rp-date">
            <span>To</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
                setExpandedIds([]);
              }}
            />
          </label>

          <div className="rp-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search heat, drawing, customer, product, furnace..."
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                ✕
              </button>
            )}
          </div>

          {filtersActive && (
            <button type="button" className="rp-clear" onClick={clearFilters}>
              Clear filters
            </button>
          )}

          {filtered.length > 0 && (
            <button type="button" className="rp-expand" onClick={toggleAll}>
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          )}
        </div>

        {rangeInvalid && <p className="rp-warning">The From date is after the To date.</p>}
      </section>

      {/* Content */}
      {rangeInvalid ? null : isLoading ? (
        <div className="rp-card">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="rp-skeleton" key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="rp-empty-card">
          <div className="rp-empty-card__icon">⚠</div>
          <h3>Couldn't load the report</h3>
          <p>{getApiErrorMessage(error, "Check that the backend is running and that you are signed in.")}</p>
          <button className="rp-btn" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rp-empty-card">
          <div className="rp-empty-card__icon">📊</div>
          <h3>{filtersActive ? "No heats match these filters" : "No furnace cycles yet"}</h3>
          <p>
            {filtersActive
              ? "Try a different date range or search."
              : "Completed and running melts will appear here."}
          </p>
          {filtersActive && (
            <button className="rp-btn" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={`rp-card ${isFetching ? "is-fetching" : ""}`}>
          <ReportTable
            rows={filtered}
            expandedIds={expandedIds}
            customerName={customerName}
            productName={productName}
            rawMaterialName={rawMaterialName}
            onToggle={toggleRow}
          />

          {/* Pagination */}
          <div className="rp-pagination">
            <span>
              Page {pagination?.page ?? page} of {totalPages} · {pagination?.total_records ?? 0} heats
            </span>

            <div className="rp-pagination__controls">
              <button type="button" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, index, list) => (
                  <span key={p} className="rp-pagination__item">
                    {index > 0 && p - list[index - 1] > 1 && <em>…</em>}
                    <button
                      type="button"
                      className={p === page ? "is-active" : ""}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </button>
                  </span>
                ))}

              <button type="button" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}