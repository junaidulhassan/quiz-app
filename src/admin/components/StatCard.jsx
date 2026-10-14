import { formatNumber } from "../utils/format.js";

export default function StatCard({ label, value, caption }) {
  return (
    <div className="card stat">
      <span>{label}</span>
      <b>{typeof value === "number" ? formatNumber(value) : value}</b>
      {caption && <em>{caption}</em>}
    </div>
  );
}
