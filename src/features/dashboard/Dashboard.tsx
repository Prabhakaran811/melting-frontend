import PageHeader from "../../components/common/PageHeader";
import { useAppSelector } from "../../app/hooks";
import "./Dashboard.css";

// Placeholder data – replace with your dashboardApi calls later.
const stats = [
  { label: "Melts today", value: "24", note: "+3 from yesterday", tone: "stat-hot" },
  { label: "Active furnaces", value: "5 of 6", note: "1 in maintenance", tone: "" },
  { label: "Avg. temperature", value: "1,482 °C", note: "Within target range", tone: "stat-ok" },
  { label: "Alerts", value: "2", note: "Needs review", tone: "stat-warn" },
];

const weekly = [
  { day: "Mon", melts: 18 },
  { day: "Tue", melts: 22 },
  { day: "Wed", melts: 15 },
  { day: "Thu", melts: 27 },
  { day: "Fri", melts: 24 },
  { day: "Sat", melts: 12 },
  { day: "Sun", melts: 8 },
];

const furnaces = [
  { name: "Furnace 1", temp: 1510, status: "Over temp" },
  { name: "Furnace 2", temp: 1490, status: "Holding" },
  { name: "Furnace 3", temp: 0, status: "Maintenance" },
  { name: "Furnace 4", temp: 1475, status: "Melting" },
  { name: "Furnace 5", temp: 1468, status: "Melting" },
  { name: "Furnace 6", temp: 1485, status: "Holding" },
];

const recent = [
  { id: "M-1042", furnace: "Furnace 2", temp: "1,490 °C", status: "Completed" },
  { id: "M-1043", furnace: "Furnace 4", temp: "1,475 °C", status: "In progress" },
  { id: "M-1044", furnace: "Furnace 1", temp: "1,510 °C", status: "Alert" },
  { id: "M-1045", furnace: "Furnace 5", temp: "1,468 °C", status: "In progress" },
  { id: "M-1046", furnace: "Furnace 3", temp: "—", status: "Queued" },
];

const MAX_TEMP = 1600;

const meltStatusClass: Record<string, string> = {
  Completed: "tag tag-done",
  "In progress": "tag tag-live",
  Alert: "tag tag-alert",
  Queued: "tag tag-queued",
};

const furnaceStatusClass: Record<string, string> = {
  Melting: "tag tag-live",
  Holding: "tag tag-done",
  "Over temp": "tag tag-alert",
  Maintenance: "tag tag-queued",
};

const meterClass = (status: string) =>
  status === "Over temp" ? "is-alert" : status === "Maintenance" ? "is-off" : "";

export default function Dashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const max = Math.max(...weekly.map((d) => d.melts));

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle={`Welcome back, ${user?.employee_id ?? ""}.`}
      />

      <section className="stats">
        {stats.map((s) => (
          <article className={`stat ${s.tone}`} key={s.label}>
            <p className="muted">{s.label}</p>
            <p className="stat-value">{s.value}</p>
            <p className="stat-note">{s.note}</p>
          </article>
        ))}
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Melts this week</h2>
          <div className="bars" role="img" aria-label="Bar chart of melts per day this week">
            {weekly.map((d) => (
              <div className={`bar-col ${d.melts === max ? "peak" : ""}`} key={d.day}>
                <span className="bar-num">{d.melts}</span>
                <div className="bar-track">
                  <div className="bar" style={{ height: `${(d.melts / max) * 100}%` }} />
                </div>
                <span className="bar-label">{d.day}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <h2>Furnace status</h2>
          <div className="furnace-list">
            {furnaces.map((f) => (
              <div className="furnace-row" key={f.name}>
                <div>
                  <p className="furnace-name">{f.name}</p>
                  <p className="furnace-temp">{f.temp ? `${f.temp.toLocaleString("en-US")} °C` : "Offline"}</p>
                </div>
                <div className="furnace-meter">
                  <span
                    className={meterClass(f.status)}
                    style={{ width: `${(f.temp / MAX_TEMP) * 100}%` }}
                  />
                </div>
                <span className={`${furnaceStatusClass[f.status]} furnace-tag`}>{f.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <article className="panel panel-wide">
        <h2>Recent melts</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Melt</th>
                <th>Furnace</th>
                <th>Temp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.furnace}</td>
                  <td>{r.temp}</td>
                  <td>
                    <span className={meltStatusClass[r.status]}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}