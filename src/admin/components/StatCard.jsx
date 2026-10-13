import { formatNumber } from "../utils/format.js";

export default function StatCard({ label, value }) {
  return (
    <div className="adm-card adm-stat">
      <span>{label}</span>
      <b>{formatNumber(value)}</b>
    </div>
  );
}
