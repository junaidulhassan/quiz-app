import { useMemo } from "react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


export default function WeeklyActivity({ respondents }) {
  const { days, maxCount, busiest, total } = useMemo(() => {
    const counts = new Array(7).fill(0);
    respondents.forEach((r) => {
      if (r.submittedAt) counts[new Date(r.submittedAt).getDay()] += 1;
    });
    const max = Math.max(...counts, 1);
    const busiestIdx = counts.reduce((best, c, i) => (c > counts[best] ? i : best), 0);
    return {
      days: DAY_LABELS.map((label, i) => ({ label, count: counts[i] })),
      maxCount: max,
      busiest: { label: DAY_LABELS[busiestIdx], count: counts[busiestIdx] },
      total: respondents.length,
    };
  }, [respondents]);

  const hasData = total > 0;

  return (
    <div className="chart-card">
      <div className="growth-head" style={{ marginBottom: "1.1rem" }}>
        <div>
          <div className="chart-card-title">Weekly Activity Pattern</div>
          <div className="arch-dist-sub">Submissions by day of week</div>
        </div>
        {hasData && busiest.count > 0 && (
          <div className="arch-dist-top">
            <span className="arch-dist-top-label">Busiest day</span>
            <span className="arch-dist-top-value">
              <span className="arch-dot" style={{ background: "var(--btn)" }}></span>
              {busiest.label} · {busiest.count.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="arch-dist-state">No data yet</div>
      ) : (
        <div className="weekly-bars">
          {days.map(({ label, count }) => {
            const pct = total ? Math.round((count / total) * 100) : 0;
            const heightPct = Math.max((count / maxCount) * 100, count > 0 ? 6 : 2);
            return (
              <div className="weekly-bar-col" key={label}>
                <div
                  className="weekly-bar"
                  role="img"
                  tabIndex={0}
                  aria-label={`${label}: ${count} submission${count === 1 ? "" : "s"}, ${pct}%`}
                  data-tip={`${count} submission${count === 1 ? "" : "s"} (${pct}%)`}
                  style={{ height: `${heightPct}%` }}
                ></div>
                <span className="weekly-bar-label">{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
