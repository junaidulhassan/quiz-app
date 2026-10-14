import { useCallback, useState } from "react";
import { fetchReports } from "../api/adminApi.js";
import BarChart from "../charts/BarChart.jsx";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import { REPORT_RANGES } from "../config/sections.js";
import useFetch from "../hooks/useFetch.js";
import { formatNumber } from "../utils/format.js";
import PageHeader from "./PageHeader.jsx";

const today = () => new Date().toISOString().slice(0, 10);

export default function Reports() {
  const [range, setRange] = useState("30d");
  const [custom, setCustom] = useState({ from: today(), to: today() });
  const params = range === "custom" ? { range, from: custom.from, to: custom.to } : { range };
  const key = JSON.stringify(params);
  const loader = useCallback(() => fetchReports(JSON.parse(key)), [key]);
  const { status, data, error, reload } = useFetch(loader);
  const validCustom = range !== "custom" || (custom.from && custom.to && custom.from <= custom.to);

  return (
    <>
      <PageHeader label="Reports & Analytics" />
      <div className="tabs">
        {REPORT_RANGES.map((item) => (
          <button key={item.key} type="button" className={item.key === range ? "on" : ""} onClick={() => setRange(item.key)}>
            {item.label}
          </button>
        ))}
      </div>
      {range === "custom" && (
        <div className="tb">
          <input className="in" type="date" aria-label="From" value={custom.from} max={custom.to} style={{ flex: "0 0 auto" }} onChange={(event) => setCustom((current) => ({ ...current, from: event.target.value }))} />
          <input className="in" type="date" aria-label="To" value={custom.to} min={custom.from} style={{ flex: "0 0 auto" }} onChange={(event) => setCustom((current) => ({ ...current, to: event.target.value }))} />
        </div>
      )}
      {status === "loading" && !data && <LoadingBlock />}
      {status === "error" && validCustom && <ErrorBlock message={error} onRetry={reload} />}
      {data && (
        <div className="grid g2">
          {data.metrics.map((metric) => (
            <div key={metric.key} className="card">
              <h3>{metric.label}</h3>
              <b style={{ font: '400 24px "BricolageGrotesque-SemiBold"' }}>{formatNumber(metric.total)}</b>
              <BarChart data={metric.series} title={metric.label} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
