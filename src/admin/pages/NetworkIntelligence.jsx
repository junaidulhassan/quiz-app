import { useCallback, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchNetworkIntelligence } from "../api/adminApi.js";
import SvgChart from "../charts/SvgChart.jsx";
import Modal from "../components/Modal.jsx";
import Pagination from "../components/Pagination.jsx";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import useAdmin from "../hooks/useAdmin.js";
import useFetch from "../hooks/useFetch.js";
import locations from "../../env2/data/nigeriaLocations.json";
import { compactCount } from "../../env2/utils/format.js";
import {
  LATE_SUBMISSION_MINUTES, OPERATORS, RANGE_LABELS, RANGES, SIGNALS, SOURCES, TECHS,
  dayKey, demoRows, format, mean, median, mostCommon, numbers, percent, timeText,
} from "../ni/data.js";
import PageHeader from "./PageHeader.jsx";

const PAGE_SIZE = 8;
const FILTER_LABELS = {
  operator: "All operators",
  tech: "All tech",
  signal: "All signals",
  source: "All sources",
  state: "All states",
  lga: "All LGAs",
};
const FILTER_OPTIONS = {
  operator: [...OPERATORS, "Unknown"],
  tech: [...TECHS, "Unavailable"],
  signal: [...SIGNALS, "Unavailable"],
  source: SOURCES,
  state: locations.states,
};
const COLUMNS = [
  ["Time", "tsText"],
  ["Operator", "operator"],
  ["Technology", "tech"],
  ["Signal", "signal"],
  ["Download", "dl"],
  ["Upload", "ul"],
  ["Latency", "lat"],
  ["Location", "loc"],
  ["Source", "source"],
  ["Confidence", "conf"],
];
const EMPTY_FILTERS = { operator: "", tech: "", signal: "", source: "", state: "", lga: "" };

function csvCell(value) {
  const text = String(value ?? "");
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function downloadCsv(rows) {
  const lines = [COLUMNS.map(([label]) => label).join(","), ...rows.map((row) => COLUMNS.map(([, field]) => csvCell(row[field])).join(","))];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "hyeve-network-intelligence.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function StatBox({ label, value, caption }) {
  return (
    <div className="card stat">
      <span>{label}</span>
      <b style={String(value).length > 9 ? { fontSize: 17 } : undefined}>{value}</b>
      <em style={{ color: "var(--gray)" }}>{caption}</em>
    </div>
  );
}

function Chart({ title, type, values, days, color, unit }) {
  const keep = values.map((value, index) => (value == null ? -1 : index)).filter((index) => index >= 0);
  return (
    <div className="card">
      <h3>{title}</h3>
      {keep.length ? (
        <>
          <SvgChart
            type={type}
            title={title}
            values={keep.map((index) => values[index])}
            labels={keep.map((index) => days[index].slice(5))}
            max={Math.ceil(Math.max(...keep.map((index) => values[index])) * 1.1) || 1}
            color={color}
          />
          <p className="note">{unit}</p>
        </>
      ) : (
        <div className="state">No data</div>
      )}
    </div>
  );
}

function Quality({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Insights() {
  const loader = useCallback(() => fetchNetworkIntelligence(), []);
  const { status, data, error, reload } = useFetch(loader);
  if (status === "error" && !data) return <ErrorBlock message={error} onRetry={reload} />;
  if (!data) return <LoadingBlock />;
  return (
    <div className="card ins">
      <b>{compactCount(data.insights)}</b>
      <span>Profile Insights Explored! More people choosing to know first.</span>
    </div>
  );
}

export default function NetworkIntelligence() {
  const { me } = useAdmin();
  const { toast } = useOutletContext();
  const [all] = useState(demoRows);
  const [now] = useState(Date.now);
  const [range, setRange] = useState("7d");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);

  const inRange = useMemo(() => all.filter((row) => range === "all" || row._ts >= now - RANGES[range]), [all, range, now]);
  const rows = useMemo(
    () => inRange.filter((row) => Object.entries(filters).every(([key, value]) => !value || row[key] === value)),
    [inRange, filters]
  );
  const table = useMemo(
    () => rows.filter((row) => !query || JSON.stringify(Object.values(row)).toLowerCase().includes(query.toLowerCase())),
    [rows, query]
  );

  const count = rows.length;
  const today = all.filter((row) => new Date(row._ts).toDateString() === new Date(now).toDateString()).length;
  const cells = new Set(rows.map((row) => row.cell).filter(Boolean)).size;
  const operators = new Set(rows.map((row) => row.operator).filter((name) => name !== "Unknown")).size;
  const latest = rows.length ? Math.max(...rows.map((row) => row._ts)) : null;

  const valid = rows.filter((row) => SIGNALS.includes(row.signal));
  const unavailable = count - valid.length;
  const geoKey = filters.state ? "lga" : "state";
  const geoNames = [...new Set(rows.map((row) => row[geoKey]))].sort();
  const days = [...new Set(rows.map((row) => dayKey(row._ts)))].sort();
  const byDay = (field, reduce) => days.map((day) => reduce(numbers(rows.filter((row) => dayKey(row._ts) === day), field)));
  const volume = days.map((day) => rows.filter((row) => dayKey(row._ts) === day).length);
  const late = rows.filter((row) => row._recv && row._recv - row._ts > LATE_SUBMISSION_MINUTES * 6e4).length;
  const lgas = filters.state ? locations.lgas[filters.state] || [] : [];

  const pages = Math.max(1, Math.ceil(table.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = table.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const setFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value, ...(key === "state" ? { lga: "" } : {}) }));
    setPage(1);
  };

  const exportRows = () => {
    downloadCsv(table);
    toast.show("Network Intelligence exported (sensitive fields excluded)");
  };

  return (
    <>
      <PageHeader label="Network Intelligence" sub="Consent-based network performance observations. Demonstration data is always labelled.">
        <button type="button" className="btn" onClick={exportRows} disabled={!me.permissions.export} title={me.permissions.export ? undefined : "Not permitted for your role"}>
          Export CSV
        </button>
      </PageHeader>

      <Insights />

      <div className="nib dm">
        <span>DEMONSTRATION DATA: generated in this browser. These are not real measurements. No API is configured.</span>
      </div>

      <div className="tb">
        <select aria-label="Date range" value={range} onChange={(event) => { setRange(event.target.value); setPage(1); }}>
          {Object.keys(RANGES).map((key) => (
            <option key={key} value={key}>
              {RANGE_LABELS[key]}
            </option>
          ))}
        </select>
        <span style={{ alignSelf: "center", color: "var(--gray)" }}>Cards, charts and tables below reflect the date range and the filters under them.</span>
      </div>

      <div className="grid">
        <StatBox label="Measurements today" value={today} caption="all data, not date-filtered" />
        <StatBox label="Reporting locations" value={cells} caption={`unique locations · ${count} measurements`} />
        <StatBox label="Operators observed" value={operators} caption="identified operators only" />
        <StatBox label="Avg download" value={format(mean(numbers(rows, "_dl")), " Mbps")} caption="mean of valid values" />
        <StatBox label="Avg latency" value={format(mean(numbers(rows, "_lat")), " ms", 0)} caption="mean of valid values" />
        <StatBox label="Latest measurement" value={latest ? timeText(latest) : "—"} caption="Demonstration data" />
      </div>

      <div className="card">
        <h3>Operator comparison</h3>
        <div className="tw nitw">
          <table style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>Operator</th>
                <th>Technology</th>
                <th>Signal</th>
                <th>Median download</th>
                <th>Median upload</th>
                <th>Median latency</th>
                <th>Measurements</th>
                <th>Latest</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {OPERATORS.map((name) => {
                const subset = rows.filter((row) => row.operator === name);
                const last = subset.length ? Math.max(...subset.map((row) => row._ts)) : null;
                return (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{mostCommon(subset.map((row) => row.tech).filter((tech) => tech !== "Unavailable")) || "Unavailable"}</td>
                    <td>{mostCommon(subset.map((row) => row.signal).filter((signal) => signal !== "Unavailable")) || "Unavailable"}</td>
                    <td>{format(median(numbers(subset, "_dl")), " Mbps")}</td>
                    <td>{format(median(numbers(subset, "_ul")), " Mbps")}</td>
                    <td>{format(median(numbers(subset, "_lat")), " ms", 0)}</td>
                    <td>{subset.length}</td>
                    <td>{last ? timeText(last) : "No data"}</td>
                    <td>{mostCommon(subset.map((row) => row.conf)) || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="note">
          "—" and "Unavailable" mean no valid value was received. They are never counted as zero.
          {rows.some((row) => row.operator === "Unknown") ? " Measurements with no identified operator are excluded from this table." : ""}
        </p>
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <div className="card">
          <h3>Signal strength (measured)</h3>
          {SIGNALS.map((name) => {
            const total = valid.filter((row) => row.signal === name).length;
            return (
              <div key={name} className="nirow">
                <span>{name}</span>
                <span className="nibar">
                  <i style={{ width: `${valid.length ? (total / valid.length) * 100 : 0}%` }} />
                </span>
                <small>
                  {total} · {percent(total, valid.length)}
                </small>
              </div>
            );
          })}
          <p className="note">
            Percentages use the {valid.length} measurements with valid signal data. Signal unavailable: {unavailable} ({percent(unavailable, count)} of all),
            excluded from the percentages. Signal is never estimated from speed or latency.
          </p>
        </div>
        <div className="card">
          <h3>Geographic summary{filters.state ? ` · ${filters.state}` : ""}</h3>
          <div className="tw nitw">
            <table>
              <thead>
                <tr>
                  <th>{geoKey === "lga" ? "LGA" : "State"}</th>
                  <th>Measurements</th>
                  <th>Locations</th>
                  <th>Median download</th>
                  <th>Median latency</th>
                </tr>
              </thead>
              <tbody>
                {geoNames.length === 0 && (
                  <tr>
                    <td colSpan="5">No data</td>
                  </tr>
                )}
                {geoNames.map((name) => {
                  const subset = rows.filter((row) => row[geoKey] === name);
                  return (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{subset.length}</td>
                      <td>{new Set(subset.map((row) => row.cell).filter(Boolean)).size}</td>
                      <td>{format(median(numbers(subset, "_dl")), " Mbps")}</td>
                      <td>{format(median(numbers(subset, "_lat")), " ms", 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="note">Map-ready: no map provider is configured, so this table is shown instead. A provider (paid or open) can be added later without changing the data.</p>
        </div>
      </div>

      <div className="grid g2">
        <Chart title="Median download (Mbps)" type="line" values={byDay("_dl", median)} days={days} color="#774cff" unit="per day" />
        <Chart title="Median upload (Mbps)" type="line" values={byDay("_ul", median)} days={days} color="#774cff" unit="per day" />
        <Chart title="Median latency (ms)" type="line" values={byDay("_lat", median)} days={days} color="#774cff" unit="per day" />
        <Chart title="Measurement volume" type="bar" values={volume} days={days} color="#16a34a" unit="measurements per day" />
        <div className="card">
          <h3>Signal category by day</h3>
          {valid.length ? (
            <div className="tw nitw">
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    {SIGNALS.map((name) => (
                      <th key={name}>{name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day}>
                      <td>{day}</td>
                      {SIGNALS.map((name) => (
                        <td key={name}>{valid.filter((row) => dayKey(row._ts) === day && row.signal === name).length}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="state">No valid signal data</div>
          )}
        </div>
      </div>

      <div className="grid g2">
        <div className="card list">
          <h3>Data quality</h3>
          <Quality label="Missing operator" value={rows.filter((row) => row.operator === "Unknown").length} />
          <Quality label="Missing signal data" value={unavailable} />
          <Quality label="Missing location" value={rows.filter((row) => row.loc === "Unknown").length} />
          <Quality label="Location not verified against the official state/LGA list" value={0} />
          <Quality label="Rejected as invalid (by this page)" value={0} />
          <Quality label="Rejected by server" value="Not reported" />
          <Quality label="Stale (submitted late)" value={late} />
          <Quality label="Collection" value="Unknown (no backend data)" />
          <Quality label="API" value="Not configured" />
        </div>
        <div className="card list">
          <h3>This browser can supply</h3>
          <Quality label="Network Information API" value={navigator.connection ? "Yes" : "No"} />
          <Quality label="Speed class (not 4G/5G)" value={navigator.connection?.effectiveType || "Unavailable"} />
          <Quality label="Mobile operator" value="No" />
          <Quality label="Radio signal strength" value="No" />
          <Quality label="Location (with permission)" value={"geolocation" in navigator ? "Yes" : "No"} />
        </div>
      </div>

      <h3 style={{ margin: "8px 0 12px" }}>Recent observations</h3>

      <div className="tb">
        <input className="in" placeholder="Search network intelligence…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
        {Object.keys(FILTER_LABELS).map((key) => {
          const options = key === "lga" ? lgas : FILTER_OPTIONS[key];
          const off = key === "lga" && !filters.state;
          return (
            <select key={key} aria-label={FILTER_LABELS[key]} value={filters[key]} disabled={off} title={off ? "Choose a state first" : undefined} onChange={(event) => setFilter(key, event.target.value)}>
              <option value="">{FILTER_LABELS[key]}</option>
              {options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          );
        })}
      </div>

      {visible.length ? (
        <>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  {COLUMNS.map(([label]) => (
                    <th key={label}>{label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id} data-row="" tabIndex={0} onClick={() => setDetail(row)} onKeyDown={(event) => event.key === "Enter" && setDetail(row)}>
                    {COLUMNS.map(([label, field]) => (
                      <td key={label}>{row[field]}</td>
                    ))}
                    <td onClick={(event) => event.stopPropagation()}>
                      <div className="acts">
                        <button type="button" className="btn sm" onClick={() => setDetail(row)}>
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={current} pageSize={PAGE_SIZE} total={table.length} onChange={setPage} />
        </>
      ) : (
        <div className="state card">
          <h3>No results</h3>
          Try changing your search or filters.
          <br />
          <br />
          <button type="button" className="btn" onClick={() => { setQuery(""); setFilters(EMPTY_FILTERS); setPage(1); }}>
            Clear filters
          </button>
        </div>
      )}

      {detail && (
        <Modal title={detail.id} onClose={() => setDetail(null)}>
          <div className="kv">
            {COLUMNS.map(([label, field]) => (
              <div key={label}>
                <span>{label}</span>
                {detail[field]}
              </div>
            ))}
          </div>
          <p style={{ color: "var(--gray)", fontSize: 12 }}>Sensitive data (passwords, card numbers, raw assessment answers) is never shown to admins.</p>
          <div className="ft">
            <button type="button" className="btn" onClick={() => setDetail(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
