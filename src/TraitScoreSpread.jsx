import { useMemo } from "react";

const TRAIT_ORDER = ["O", "C", "E", "A", "N"];
const TRAIT_COLORS = { O: "#FF3D7F", C: "#3B82F6", E: "#F59E0B", A: "#22C55E", N: "#A855F7" };
const TRAIT_NAMES = { O: "Openness", C: "Conscientiousness", E: "Extraversion", A: "Agreeableness", N: "Neuroticism" };
// The scoring formula (raw 0-5 answers, scaled to 0-10) can only ever land on these 6 values.
const SCORE_BUCKETS = [0, 2, 4, 6, 8, 10];

/**
 * How respondents are spread across each possible score, per trait — a different
 * lens than "Average Trait Scores": two traits can share the same average while
 * one is tightly clustered around it and the other is split between extremes.
 * Computed live from the same respondent list the dashboard already has loaded.
 */
export default function TraitScoreSpread({ respondents }) {
  const traits = useMemo(() => {
    const total = respondents.length;
    return TRAIT_ORDER.map((t) => {
      const counts = Object.fromEntries(SCORE_BUCKETS.map((b) => [b, 0]));
      respondents.forEach((r) => {
        const s = r.scores?.[t];
        if (typeof s === "number" && s in counts) counts[s] += 1;
      });
      const maxCount = Math.max(...SCORE_BUCKETS.map((b) => counts[b]), 1);
      const peak = SCORE_BUCKETS.reduce((best, b) => (counts[b] > counts[best] ? b : best), 0);
      return { trait: t, counts, maxCount, peak, peakCount: counts[peak], total };
    });
  }, [respondents]);

  const hasData = respondents.length > 0;

  return (
    <div className="chart-card">
      <div className="chart-card-title">Trait Score Spread</div>
      <div className="arch-dist-sub" style={{ marginBottom: "1.1rem" }}>
        How respondents are distributed across each score — not just the average
      </div>

      {!hasData ? (
        <div className="arch-dist-state">No data yet</div>
      ) : (
        <div className="spread-list">
          {traits.map(({ trait, counts, maxCount, peak, peakCount, total }) => (
            <div className="spread-row" key={trait}>
              <div className="spread-row-header">
                <span className="spread-row-name">
                  <span className="arch-dot" style={{ background: TRAIT_COLORS[trait] }}></span>
                  {TRAIT_NAMES[trait]}
                </span>
                <span className="spread-row-peak">
                  Most common: {peak}/10 ({Math.round((peakCount / total) * 100)}%)
                </span>
              </div>
              <div className="spread-bars">
                {SCORE_BUCKETS.map((bucket) => {
                  const count = counts[bucket];
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  const heightPct = Math.max((count / maxCount) * 100, count > 0 ? 6 : 2);
                  return (
                    <div className="spread-bar-col" key={bucket}>
                      <div
                        className="spread-bar"
                        role="img"
                        tabIndex={0}
                        aria-label={`Score ${bucket} out of 10: ${count} respondent${count === 1 ? "" : "s"}, ${pct}%`}
                        data-tip={`${count} respondent${count === 1 ? "" : "s"} (${pct}%)`}
                        style={{ height: `${heightPct}%`, background: TRAIT_COLORS[trait] }}
                      ></div>
                      <span className="spread-bar-label">{bucket}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
