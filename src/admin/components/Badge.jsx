import { badgeTone } from "../utils/format.js";

export default function Badge({ value, tone }) {
  return <span className={`adm-badge is-${tone || badgeTone(value)}`}>{value}</span>;
}
