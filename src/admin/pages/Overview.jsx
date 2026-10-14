import { useCallback } from "react";
import { fetchOverview } from "../api/adminApi.js";
import BarChart from "../charts/BarChart.jsx";
import Badge from "../components/Badge.jsx";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import StatCard from "../components/StatCard.jsx";
import useFetch from "../hooks/useFetch.js";
import { formatDateTime, humanize } from "../utils/format.js";
import PageHeader from "./PageHeader.jsx";

const ROLE_LABELS = { property_manager: "Property Manager", tenant: "Tenant" };

function ListCard({ title, empty, children }) {
  return (
    <div className="card list">
      <h3>{title}</h3>
      {children}
      {!children?.length && <small style={{ color: "var(--gray)" }}>{empty}</small>}
    </div>
  );
}

export default function Overview() {
  const loader = useCallback(() => fetchOverview(), []);
  const { status, data, error, reload } = useFetch(loader);

  return (
    <>
      <PageHeader label="Overview" />
      {status === "loading" && !data && <LoadingBlock />}
      {status === "error" && <ErrorBlock message={error} onRetry={reload} />}
      {data && (
        <>
          <div className="grid">
            {data.stats.map((stat) => (
              <StatCard key={stat.key} label={stat.label} value={stat.value} caption={stat.caption} />
            ))}
          </div>
          <div className="grid g2">
            <div className="card">
              <h3>User growth</h3>
              <BarChart data={data.charts.user_growth} title="User growth" />
            </div>
            <div className="card">
              <h3>Revenue overview (₦M)</h3>
              <BarChart data={data.charts.revenue} title="Revenue overview" />
            </div>
            <div className="card">
              <h3>Assessment activity</h3>
              <BarChart data={data.charts.assessments} title="Assessment activity" />
            </div>
            <div className="card">
              <h3>Search activity</h3>
              <BarChart data={data.charts.searches} title="Search activity" />
            </div>
          </div>
          <div className="grid g2">
            <ListCard title="Recent registrations" empty="No accounts yet.">
              {data.recent_registrations.map((item) => (
                <div key={item.id}>
                  <span>
                    {item.name}
                    <br />
                    <small>{ROLE_LABELS[item.role] || "No role yet"}</small>
                  </span>
                  <Badge value={item.status} />
                </div>
              ))}
            </ListCard>
            <ListCard title="Recent searches" empty="No searches yet.">
              {data.recent_searches.map((item) => (
                <div key={item.id}>
                  <span>
                    {item.user}
                    <br />
                    <small>{item.type}</small>
                  </span>
                  <small>{formatDateTime(item.time)}</small>
                </div>
              ))}
            </ListCard>
            <ListCard title="Recent support tickets" empty="No support tickets yet.">
              {data.recent_tickets.map((item) => (
                <div key={item.id}>
                  <span>
                    {item.subject}
                    <br />
                    <small>
                      {item.id} · {item.user}
                    </small>
                  </span>
                  <Badge value={humanize(item.status)} />
                </div>
              ))}
            </ListCard>
            <ListCard title="System activity" empty="No admin actions yet.">
              {data.recent_audit.map((item) => (
                <div key={item.id}>
                  <span>
                    {item.action}
                    <br />
                    <small>
                      {item.admin} · {item.record || "—"}
                    </small>
                  </span>
                  <small>{formatDateTime(item.time)}</small>
                </div>
              ))}
            </ListCard>
          </div>
        </>
      )}
    </>
  );
}
