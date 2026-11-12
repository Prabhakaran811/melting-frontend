import type { ChargeMix } from "../furnaceDashboardTypes";
import { formatDateTime } from "../furnaceDashboardTypes";

interface Props {
  mix: ChargeMix | null;
  hasCycle: boolean;
  canEdit: boolean;
  onEdit: () => void;
}

const money = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ChargeMixPanel({ mix, hasCycle, canEdit, onEdit }: Props) {
  const items = mix?.items ?? [];
  const capacity = Number(mix?.charging_capacity ?? 0);
  const charged = Number(mix?.total_charged_weight ?? 0);
  const percent = capacity > 0 ? Math.min(100, (charged / capacity) * 100) : 0;
  const totalCost = items.reduce((sum, i) => sum + Number(i.weight) * Number(i.rate_per_kg ?? 0), 0);
  const confirmed = (mix?.status ?? "").toLowerCase() === "confirmed";

  return (
    <section className="fd-card">
      <div className="fd-card__head">
        <h3>Charge mix</h3>
        <div className="fd-card__tools">
          {mix && (
            <span className={`fd-chip ${confirmed ? "fd-chip--green" : "fd-chip--orange"}`}>{mix.status}</span>
          )}
          {hasCycle && canEdit && mix && (
            <button type="button" className="fd-mini-btn" onClick={onEdit}>
              ✎ Edit
            </button>
          )}
        </div>
      </div>

      {!hasCycle ? (
        <p className="fd-empty">Start a melt cycle to see its charge mix.</p>
      ) : !mix ? (
        <div className="fd-empty">
          No charge mix saved yet for this heat.
          {canEdit && (
            <div>
              <button type="button" className="fd-btn fd-btn--glow" onClick={onEdit} style={{ marginTop: 12 }}>
                ＋ Add charge mix
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="fd-capacity">
            <div className="fd-capacity__row">
              <strong>{charged.toLocaleString("en-IN")} kg</strong>
              <span>of {capacity.toLocaleString("en-IN")} kg</span>
            </div>
            <div className="fd-capacity__bar">
              <i style={{ width: `${percent}%` }} />
            </div>
            <div className="fd-capacity__foot">
              <span>{items.length} material{items.length === 1 ? "" : "s"}</span>
              <span>Total cost {money(totalCost)}</span>
            </div>
          </div>

          {confirmed && mix.confirmed_at && (
            <p className="fd-sub">Confirmed {formatDateTime(mix.confirmed_at)}</p>
          )}

          <div className="fd-bunkers">
            {items.map((item) => {
              const name =
                item.raw_material_name ??
                item.raw_material?.name ??
                (item.raw_material_stock_id ? `Stock #${item.raw_material_stock_id}` : "Material");
              const weight = Number(item.weight);
              const share = charged > 0 ? (weight / charged) * 100 : 0;

              return (
                <article className="fd-bunker" key={item.id}>
                  <div className="fd-bunker__top">
                    <span className="fd-bunker__tag">{item.bunker_name ?? "Bunker"}</span>
                    <strong>{weight.toLocaleString("en-IN")} kg</strong>
                  </div>
                  <div className="fd-bunker__name">{name}</div>

                  <div className="fd-bunker__share">
                    <i style={{ width: `${share}%` }} />
                  </div>

                  <div className="fd-bunker__meta">
                    <span>{share.toFixed(1)}% of charge</span>
                    <span>
                      {item.rate_per_kg !== undefined
                        ? `${money(Number(item.rate_per_kg))}/kg · ${money(weight * Number(item.rate_per_kg))}`
                        : ""}
                    </span>
                  </div>

                  {item.elements && item.elements.length > 0 && (
                    <div className="fd-bunker__elements">
                      {item.elements.map((el, idx) => (
                        <span key={el.element_id ?? idx}>
                          <b>{el.element?.abbreviation ?? `#${el.element_id}`}</b>
                          {Number(el.percentage).toFixed(2)}%
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}