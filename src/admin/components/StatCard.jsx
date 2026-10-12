import { formatNumber } from "../utils/format.js";

export default function StatCard({ label, value }) {
  return (
    <div className="ad-card ad-stat">
      <span>{label}</span>
      <b>{formatNumber(value)}</b>
    </div>
  );
}
