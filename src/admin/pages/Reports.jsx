import { useCallback, useState } from "react";
import { fetchReports } from "../api/adminApi.js";
import AreaChart from "../charts/AreaChart.jsx";
import BarChart from "../charts/BarChart.jsx";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import { REPORT_RANGES } from "../config/sections.js";
import useFetch from "../hooks/useFetch.js";
import { formatNumber } from "../utils/format.js";
import PageHeader from "./PageHeader.jsx";

const AREA_METRICS = new Set(["user_growth", "active_users"]);

export default function Reports() {
  const [range, setRange] = useState("30d");
  const loader = useCallback(() => fetchReports(range), [range]);
  const { status, data, error, reload } = useFetch(loader);

  return (
    <>
      <PageHeader label="Reports & Analytics" sub="Trends across sign-ups, assessments and searches." />
      <div className="adm-tabs" role="tablist" aria-label="Date range">
        {REPORT_RANGES.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={range === item.key}
            className={range === item.key ? "is-on" : ""}
            onClick={() => setRange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {status === "loading" && !data && <LoadingBlock />}
      {status === "error" && <ErrorBlock message={error} onRetry={reload} />}
      {data && (
        <div className={`adm-grid-2${status === "loading" ? " is-refreshing" : ""}`}>
          {data.metrics.map((metric) => (
            <div key={metric.key} className="adm-card">
              <div className="adm-card-head">
                <h3>{metric.label}</h3>
                <div className="adm-card-total">
                  <b>{formatNumber(metric.total)}</b>
                  <span>in range</span>
                </div>
              </div>
              {AREA_METRICS.has(metric.key) ? (
                <AreaChart data={metric.series} title={metric.label} />
              ) : (
                <BarChart data={metric.series} title={metric.label} />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
