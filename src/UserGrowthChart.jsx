import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authFetch } from "./session";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
];

const CHANGE_LABELS = { daily: "Daily change", weekly: "Weekly change", monthly: "Monthly change" };
const CHANGE_PERIODS = { daily: "vs the previous 24h", weekly: "vs the previous 7 days", monthly: "vs the previous 30 days" };

const DEFAULT_VIEW_W = 720; // used only until the wrapper's real width is measured
const VIEW_H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 44 };
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;

/** Round a max value up to a clean axis tick (0, 5, 10, 20, 25, 50, 100, 200 ...). */
function niceMax(value) {
  if (value <= 0) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

function formatChange(change) {
  if (!change) return null;
  if (change.is_new) return { text: "New", sign: "up" };
  const sign = change.direction === "up" ? "up" : change.direction === "down" ? "down" : "flat";
  const text = change.percent > 0 ? `+${change.percent}%` : `${change.percent}%`;
  return { text, sign };
}

const ArrowIcon = ({ sign }) => {
  if (sign === "flat") {
    return (
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="3" y1="8" x2="13" y2="8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: sign === "down" ? "rotate(180deg)" : "none" }}>
      <path d="M8 13V3M3 7l5-5 5 5" />
    </svg>
  );
};

function ChangeTile({ id, change }) {
  const formatted = formatChange(change);
  return (
    <div className="growth-tile">
      <div className="growth-tile-label">{CHANGE_LABELS[id]}</div>
      {!change ? (
        <div className="growth-tile-value growth-tile-loading">—</div>
      ) : (
        <>
          <div className={"growth-tile-value growth-delta-" + formatted.sign}>
            <ArrowIcon sign={formatted.sign} />
            {formatted.text}
          </div>
          <div className="growth-tile-sub">
            {change.current.toLocaleString()} vs {change.previous.toLocaleString()} · {CHANGE_PERIODS[id]}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Interactive line chart of total-user growth (GET /api/stats/growth), plus three
 * period-over-period change tiles (GET /api/stats/changes) computed live from the
 * database. `version` bumps to re-fetch after a reload or a delete elsewhere on
 * the dashboard.
 */
export default function UserGrowthChart({ version, onError }) {
  const [range, setRange] = useState("today");
  const [series, setSeries] = useState(null);
  const [seriesFailed, setSeriesFailed] = useState(false);
  const [changes, setChanges] = useState(null);
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);
  const resizeObserverRef = useRef(null);
  // The viewBox tracks the wrapper's real pixel width, so 1 SVG unit == 1 CSS px and
  // text/strokes never get non-uniformly stretched the way a fixed viewBox would on
  // narrow screens (a fixed-width viewBox scaled to fit visually squashes <text>).
  const [viewW, setViewW] = useState(DEFAULT_VIEW_W);

  // A callback ref, not useRef+useEffect: the wrapper div only exists once `series`
  // has loaded, so a mount-time effect with an empty deps array would run before it's
  // in the DOM and never get a second chance to attach. This re-attaches (and cleans
  // up the previous observer) exactly when the node appears, changes, or disappears.
  const wrapRef = useCallback((node) => {
    resizeObserverRef.current?.disconnect();
    if (!node || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setViewW(Math.round(w));
    });
    ro.observe(node);
    resizeObserverRef.current = ro;
  }, []);

  useEffect(() => () => resizeObserverRef.current?.disconnect(), []);

  const plotW = viewW - PAD.left - PAD.right;

  useEffect(() => {
    let cancelled = false;
    authFetch(`/stats/growth?range=${range}`)
      .then((res) => res.json())
      .then(
        (json) => { if (!cancelled) { setSeries(json); setSeriesFailed(false); setHoverIdx(null); } },
        (err) => { if (!cancelled) { setSeriesFailed(true); onError?.(err); } }
      );
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onError intentionally excluded: navigation-triggering, not chart data
  }, [range, version]);

  useEffect(() => {
    let cancelled = false;
    authFetch("/stats/changes")
      .then((res) => res.json())
      .then(
        (json) => { if (!cancelled) setChanges(json); },
        (err) => { if (!cancelled) onError?.(err); }
      );
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const points = useMemo(() => series?.points || [], [series]);

  const { path, areaPath, coords, maxY } = useMemo(() => {
    if (!points.length) return { path: "", areaPath: "", coords: [], maxY: 4 };
    const values = points.map((p) => p.total_users);
    const max = niceMax(Math.max(...values, 1));
    const n = points.length;
    const xFor = (i) => (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
    const yFor = (v) => PLOT_H - (v / max) * PLOT_H;
    const pts = points.map((p, i) => [xFor(i), yFor(p.total_users)]);
    const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
    const area = pts.length
      ? `M${pts[0][0].toFixed(2)} ${PLOT_H} ` + pts.map(([x, y]) => `L${x.toFixed(2)} ${y.toFixed(2)}`).join(" ") + ` L${pts[pts.length - 1][0].toFixed(2)} ${PLOT_H} Z`
      : "";
    return { path: line, areaPath: area, coords: pts, maxY: max };
  }, [points, plotW]);

  const yTicks = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => Math.round((maxY / steps) * i));
  }, [maxY]);

  // Show at most ~7 x-axis labels so hourly (16+ points) and 90-day views stay legible.
  const xLabelEvery = Math.max(1, Math.ceil(points.length / 7));

  function handlePointerMove(e) {
    if (!coords.length || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * viewW - PAD.left;
    let nearest = 0;
    let best = Infinity;
    coords.forEach(([x], i) => {
      const d = Math.abs(x - px);
      if (d < best) { best = d; nearest = i; }
    });
    setHoverIdx(nearest);
  }

  const hovered = hoverIdx !== null ? points[hoverIdx] : null;
  const hoverCoord = hoverIdx !== null ? coords[hoverIdx] : null;
  const latest = points.length ? points[points.length - 1] : null;

  // Tooltip flips to the left half once the crosshair passes the midpoint, so it never runs off the card.
  const tooltipSide = hoverCoord && hoverCoord[0] > plotW / 2 ? "left" : "right";

  return (
    <div className="chart-card growth-card">
      <div className="growth-head">
        <div>
          <div className="chart-card-title">User Growth</div>
          <div className="arch-dist-sub">
            {series ? `Total users over time · ${(latest?.total_users ?? 0).toLocaleString()} now` : "Total users over time"}
          </div>
        </div>
        <div className="growth-range-toggle" role="group" aria-label="Chart time range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={"growth-range-btn" + (range === r.key ? " active" : "")}
              aria-pressed={range === r.key}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {!series && !seriesFailed && <div className="arch-dist-state">Loading growth data…</div>}
      {seriesFailed && !series && <div className="arch-dist-state">Couldn't load growth data. Try Reload in Settings.</div>}

      {series && (
        <>
          <div className="growth-chart-wrap" ref={wrapRef}>
            <svg
              ref={svgRef}
              className="growth-svg"
              viewBox={`0 0 ${viewW} ${VIEW_H}`}
              role="img"
              aria-label={`User growth, ${series.range === "today" ? "by hour today" : `over the last ${series.range}`}. Ends at ${latest ? latest.total_users : 0} total users.`}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHoverIdx(null)}
            >
              <g transform={`translate(${PAD.left},${PAD.top})`}>
                {yTicks.map((t) => {
                  const y = PLOT_H - (t / (maxY || 1)) * PLOT_H;
                  return (
                    <g key={t}>
                      <line x1="0" x2={plotW} y1={y} y2={y} className="growth-gridline" />
                      <text x="-8" y={y} className="growth-axis-label" textAnchor="end" dominantBaseline="middle">
                        {t.toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                {points.map((p, i) => (
                  i % xLabelEvery === 0 || i === points.length - 1 ? (
                    <text key={i} x={coords[i]?.[0] ?? 0} y={PLOT_H + 18} className="growth-axis-label" textAnchor="middle">
                      {p.label}
                    </text>
                  ) : null
                ))}

                {areaPath && <path d={areaPath} className="growth-area" />}
                {path && <path d={path} className="growth-line" />}

                {hoverCoord && (
                  <line x1={hoverCoord[0]} x2={hoverCoord[0]} y1="0" y2={PLOT_H} className="growth-crosshair" />
                )}
                {coords.map(([x, y], i) => (
                  <circle
                    key={i}
                    cx={x} cy={y}
                    r={hoverIdx === i ? 5 : 3}
                    className={"growth-dot" + (hoverIdx === i ? " active" : "")}
                  />
                ))}
                {coords.map(([x], i) => (
                  <rect key={"hit" + i} x={x - (plotW / Math.max(coords.length - 1, 1)) / 2} y="0"
                    width={plotW / Math.max(coords.length - 1, 1)} height={PLOT_H} fill="transparent"
                    onPointerEnter={() => setHoverIdx(i)} />
                ))}
              </g>
            </svg>

            {hovered && hoverCoord && (
              <div
                className={"growth-tooltip growth-tooltip-" + tooltipSide}
                style={{
                  left: `${((hoverCoord[0] + PAD.left) / viewW) * 100}%`,
                  top: `${((hoverCoord[1] + PAD.top) / VIEW_H) * 100}%`,
                }}
                role="status"
              >
                <div className="growth-tooltip-label">{hovered.label}{series.granularity === "hour" ? " today" : ""}</div>
                <div className="growth-tooltip-row">
                  <span className="growth-tooltip-key" aria-hidden="true"></span>
                  <span className="growth-tooltip-value">{hovered.total_users.toLocaleString()} total</span>
                </div>
                <div className="growth-tooltip-new">
                  {hovered.new_users > 0 ? `+${hovered.new_users} new` : "No new users"}
                </div>
              </div>
            )}
          </div>

          <div className="growth-tiles">
            <ChangeTile id="daily" change={changes?.daily} />
            <ChangeTile id="weekly" change={changes?.weekly} />
            <ChangeTile id="monthly" change={changes?.monthly} />
          </div>
        </>
      )}
    </div>
  );
}
