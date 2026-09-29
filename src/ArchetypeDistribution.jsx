import { useEffect, useState } from "react";
import { authFetch } from "./session";

// Fixed slice order, so a color always sits next to the same neighbors. This order was
// chosen by running the palette validator over every circular arrangement of the brand
// archetype colors: all neighbor pairs stay distinguishable, including for colorblind
// viewers (worst ΔE 12.7) — colors stay tied to the archetype, never to its rank.
const SLICE_ORDER = ["Sage", "Oculus", "Titan", "Artificer", "Catalyst", "Monolith", "Marshal", "Vigor"];

const SIZE = 220;
const C = SIZE / 2;
const R_OUTER = 100;
const R_INNER = 66;
const GAP_DEG = 1.2; // surface gap between slices
const HOVER_POP = 5; // px a hovered slice moves outward

function polar(r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(rad), C + r * Math.sin(rad)];
}

/** Annular sector from start° to end° (0° = 12 o'clock, clockwise). */
function sectorPath(start, end) {
  const sweep = Math.min(end - start, 359.99);
  const e = start + sweep;
  const large = sweep > 180 ? 1 : 0;
  const [x1, y1] = polar(R_OUTER, start);
  const [x2, y2] = polar(R_OUTER, e);
  const [x3, y3] = polar(R_INNER, e);
  const [x4, y4] = polar(R_INNER, start);
  return `M${x1} ${y1} A${R_OUTER} ${R_OUTER} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${R_INNER} ${R_INNER} 0 ${large} 0 ${x4} ${y4} Z`;
}

function orderIndex(name) {
  const i = SLICE_ORDER.indexOf(name);
  return i === -1 ? SLICE_ORDER.length : i;
}

const plural = (n) => `${n.toLocaleString()} user${n === 1 ? "" : "s"}`;

/**
 * Donut chart of the share of all users per archetype, loaded live from
 * GET /api/stats/archetypes. Re-fetches whenever `version` changes (after a
 * reload or delete), so it always reflects the current database.
 */
export default function ArchetypeDistribution({ colors, version, onError }) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    let cancelled = false;
    authFetch("/stats/archetypes")
      .then((res) => res.json())
      .then(
        (json) => { if (!cancelled) { setData(json); setFailed(false); } },
        (err) => { if (!cancelled) { setFailed(true); onError?.(err); } }
      );
    return () => { cancelled = true; };
  }, [version, onError]);

  const total = data?.total ?? 0;
  const shares = data?.distribution ?? [];
  const slices = shares.filter((d) => d.count > 0).sort((a, b) => orderIndex(a.archetype) - orderIndex(b.archetype));
  const ranked = [...shares].sort((a, b) => b.count - a.count || orderIndex(a.archetype) - orderIndex(b.archetype));
  const top = ranked[0]?.count ? ranked[0] : null;
  const maxPercent = top ? top.percent : 100; // bars are scaled to the largest share so small ones stay comparable
  const colorOf = (name) => colors[name] || "#9CA3AF";

  const gap = slices.length > 1 ? GAP_DEG : 0;
  const arcs = slices.map((d, i) => {
    const before = slices.slice(0, i).reduce((sum, s) => sum + s.count, 0);
    const startAngle = (before / total) * 360;
    const sweep = (d.count / total) * 360;
    return { ...d, start: startAngle + gap / 2, end: startAngle + sweep - gap / 2, mid: startAngle + sweep / 2 };
  });

  const focus = active ? shares.find((d) => d.archetype === active) : null;

  return (
    <div className="chart-card arch-dist">
      <div className="arch-dist-head">
        <div>
          <div className="chart-card-title">Personality Distribution</div>
          <div className="arch-dist-sub">
            {data ? `Share of all ${plural(total)} by archetype` : "Share of all users by archetype"}
          </div>
        </div>
        {top && (
          <div className="arch-dist-top" title="Most common archetype">
            <span className="arch-dist-top-label">Most common</span>
            <span className="arch-dist-top-value">
              <span className="arch-dot" style={{ background: colorOf(top.archetype) }}></span>
              {top.archetype} · {top.percent}%
            </span>
          </div>
        )}
      </div>

      {!data && !failed && <div className="arch-dist-state">Loading distribution…</div>}
      {failed && !data && <div className="arch-dist-state">Couldn't load the distribution. Try Reload in Settings.</div>}
      {data && total === 0 && <div className="arch-dist-state">No users yet — the distribution appears after the first quiz submission.</div>}

      {data && total > 0 && (
        <div className="arch-dist-body">
          <div className="arch-dist-chart">
            <svg
              viewBox={`${-HOVER_POP} ${-HOVER_POP} ${SIZE + HOVER_POP * 2} ${SIZE + HOVER_POP * 2}`}
              role="img"
              aria-label={`Archetype distribution: ${ranked.filter((d) => d.count).map((d) => `${d.archetype} ${d.percent}%`).join(", ")}`}
              onMouseLeave={() => setActive(null)}
            >
              {arcs.map((a) => {
                const isActive = active === a.archetype;
                const [dx, dy] = isActive ? polar(HOVER_POP, a.mid).map((v) => v - C) : [0, 0];
                return (
                  <path
                    key={a.archetype}
                    d={sectorPath(a.start, a.end)}
                    fill={colorOf(a.archetype)}
                    className={"arch-slice" + (active && !isActive ? " dim" : "")}
                    style={{ transform: `translate(${dx}px, ${dy}px)` }}
                    onMouseEnter={() => setActive(a.archetype)}
                  >
                    <title>{`${a.archetype}: ${a.percent}% (${plural(a.count)})`}</title>
                  </path>
                );
              })}
            </svg>
            <div className="arch-dist-center" aria-live="polite">
              {focus ? (
                <>
                  <div className="arch-dist-center-value">{focus.percent}%</div>
                  <div className="arch-dist-center-name">{focus.archetype}</div>
                  <div className="arch-dist-center-sub">{plural(focus.count)}</div>
                </>
              ) : (
                <>
                  <div className="arch-dist-center-value">{total.toLocaleString()}</div>
                  <div className="arch-dist-center-sub">total users</div>
                </>
              )}
            </div>
          </div>

          <ul className="arch-legend" onMouseLeave={() => setActive(null)}>
            <li className="arch-legend-head" aria-hidden="true">
              <span></span><span>Archetype</span><span></span><span>Share</span><span>Users</span>
            </li>
            {ranked.map((d) => (
              <li key={d.archetype}>
                <button
                  type="button"
                  className={"arch-legend-row" + (active === d.archetype ? " active" : "") + (d.count === 0 ? " empty" : "")}
                  onMouseEnter={() => d.count && setActive(d.archetype)}
                  onFocus={() => d.count && setActive(d.archetype)}
                  onBlur={() => setActive(null)}
                  aria-label={`${d.archetype}: ${d.percent}%, ${plural(d.count)}`}
                >
                  <span className="arch-dot" style={{ background: colorOf(d.archetype) }}></span>
                  <span className="arch-legend-name">{d.archetype}</span>
                  <span className="arch-legend-bar" aria-hidden="true">
                    <span style={{ width: `${(d.percent / maxPercent) * 100}%`, background: colorOf(d.archetype) }}></span>
                  </span>
                  <span className="arch-legend-pct">{d.percent}%</span>
                  <span className="arch-legend-count">{d.count.toLocaleString()}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
