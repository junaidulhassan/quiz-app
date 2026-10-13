import { formatNumber, shortLabel } from "../utils/format.js";

export function Tooltip({ point, left, top }) {
  if (!point) return null;
  return (
    <div className="adm-tooltip" style={{ left: `${left}%`, top: `${top}%` }} role="presentation">
      <span>{shortLabel(point.label)}</span>
      <strong>{formatNumber(point.value)}</strong>
    </div>
  );
}

export function DataTable({ title, data }) {
  return (
    <table className="adm-sr-only">
      <caption>{title}</caption>
      <tbody>
        {data.map((point) => (
          <tr key={point.label}>
            <th>{shortLabel(point.label)}</th>
            <td>{point.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
