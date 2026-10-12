import { formatNumber } from "../utils/format.js";

export default function RankedBars({ data }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <ul className="ad-ranked">
      {data.map((item) => (
        <li key={item.label}>
          <div className="ad-ranked-head">
            <span>{item.label}</span>
            <strong>
              {formatNumber(item.value)}
              <small>{total ? ` · ${Math.round((item.value / total) * 100)}%` : ""}</small>
            </strong>
          </div>
          <div className="ad-ranked-track">
            <span style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
