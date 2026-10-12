import { badgeTone } from "../utils/format.js";

export default function Badge({ value, tone }) {
  return <span className={`ad-badge is-${tone || badgeTone(value)}`}>{value}</span>;
}
