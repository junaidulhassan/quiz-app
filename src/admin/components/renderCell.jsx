import { formatDate, formatDateTime, formatNumber, formatRelative } from "../utils/format.js";
import Badge from "./Badge.jsx";

export default function renderCell(column, value) {
  if (value === null || value === undefined || value === "") return <span className="adm-muted">—</span>;
  switch (column.type) {
    case "badge":
      return <Badge value={value} />;
    case "date":
      return formatDate(value);
    case "datetime":
      return formatDateTime(value);
    case "relative":
      return formatRelative(value);
    case "number":
      return formatNumber(value);
    case "percent":
      return `${value}%`;
    default:
      return column.mono ? <code>{value}</code> : value;
  }
}
