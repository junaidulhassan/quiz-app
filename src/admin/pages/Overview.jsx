import { useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchOverview } from "../api/adminApi.js";
import AreaChart from "../charts/AreaChart.jsx";
import BarChart from "../charts/BarChart.jsx";
import RankedBars from "../charts/RankedBars.jsx";
import Badge from "../components/Badge.jsx";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import StatCard from "../components/StatCard.jsx";
import useFetch from "../hooks/useFetch.js";
import { formatNumber, formatRelative } from "../utils/format.js";
import PageHeader from "./PageHeader.jsx";

function ChartCard({ title, total, caption, children }) {
  return (
    <div className="adm-card">
      <div className="adm-card-head">
        <h3>{title}</h3>
        {total !== undefined && (
          <div className="adm-card-total">
            <b>{formatNumber(total)}</b>
            <span>{caption}</span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function RecentList({ title, items, empty, to, render }) {
  return (
    <div className="adm-card adm-list">
      <div className="adm-card-head">
        <h3>{title}</h3>
        {to && <Link to={to}>View all</Link>}
      </div>
      {items.length === 0 && <p className="adm-muted">{empty}</p>}
      {items.map((item) => (
        <div key={item.id} className="adm-list-row">
          {render(item)}
        </div>
      ))}
    </div>
  );
}

const sum = (series) => series.reduce((total, point) => total + point.value, 0);

export default function Overview() {
  const loader = useCallback(() => fetchOverview(), []);
  const { status, data, error, reload } = useFetch(loader);

  return (
    <>
      <PageHeader label="Overview" sub="A live snapshot of users, assessments and searches across Hyeve." />
      {status === "loading" && <LoadingBlock />}
      {status === "error" && <ErrorBlock message={error} onRetry={reload} />}
      {data && (
        <>
          <div className="adm-stat-grid">
            {data.stats.map((stat) => (
              <StatCard key={stat.key} label={stat.label} value={stat.value} />
            ))}
          </div>
          <div className="adm-grid-2">
            <ChartCard title="User growth" total={sum(data.charts.user_growth)} caption="new accounts, last 30 days">
              <AreaChart data={data.charts.user_growth} title="New accounts per day" />
            </ChartCard>
            <ChartCard title="Assessment activity" total={sum(data.charts.assessments)} caption="completed, last 30 days">
              <BarChart data={data.charts.assessments} title="Assessments completed per day" />
            </ChartCard>
            <ChartCard title="Search activity" total={sum(data.charts.searches)} caption="searches, last 30 days">
              <BarChart data={data.charts.searches} title="Profile searches per day" />
            </ChartCard>
            <ChartCard title="Archetype distribution">
              {data.charts.archetypes.length ? <RankedBars data={data.charts.archetypes} /> : <p className="adm-muted">No assessments yet.</p>}
            </ChartCard>
          </div>
          <div className="adm-grid-3">
            <RecentList
              title="Recent registrations"
              items={data.recent_registrations}
              empty="No accounts yet."
              to="/admin/users"
              render={(item) => (
                <>
                  <span>
                    {item.name}
                    <small>{item.role ? item.role.replace("_", " ") : "No role yet"}</small>
                  </span>
                  <small>{formatRelative(item.joined)}</small>
                </>
              )}
            />
            <RecentList
              title="Recent searches"
              items={data.recent_searches}
              empty="No searches yet."
              to="/admin/activity"
              render={(item) => (
                <>
                  <span>
                    {item.user}
                    <small>{item.type}</small>
                  </span>
                  <small>{formatRelative(item.time)}</small>
                </>
              )}
            />
            <RecentList
              title="Admin activity"
              items={data.recent_audit}
              empty="No admin actions yet."
              render={(item) => (
                <>
                  <span>
                    {item.action}
                    <small>
                      {item.admin} · {item.record || "—"}
                    </small>
                  </span>
                  <Badge value="Logged" tone="gray" />
                </>
              )}
            />
          </div>
        </>
      )}
    </>
  );
}
