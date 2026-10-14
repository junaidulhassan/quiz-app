import { badgeClass } from "../utils/format.js";

export default function Badge({ value, tone }) {
  return <span className={`tag ${badgeClass(value, tone)}`.trim()}>{value}</span>;
}
