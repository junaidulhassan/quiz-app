function parse(value) {
  if (!value) return null;
  const hasZone = value.endsWith("Z") || /[+-]\d\d:\d\d$/.test(value);
  return new Date(hasZone ? value : `${value}Z`);
}

export function formatDate(value) {
  const date = parse(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value) {
  const date = parse(value);
  if (!date) return "—";
  return `${formatDate(value)}, ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

export function formatRelative(value) {
  const date = parse(value);
  if (!date) return "Never";
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  if (seconds < 86400 * 30) return `${Math.floor(seconds / 86400)} d ago`;
  return formatDate(value);
}

export function formatNumber(value) {
  return Number(value).toLocaleString("en-US");
}

export function humanize(key) {
  return key.replace(/_/g, " ").replace(/^\w/, (char) => char.toUpperCase());
}

export function shortLabel(label) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const date = new Date(`${label}T00:00:00`);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  if (/^\d{4}-\d{2}$/.test(label)) {
    const date = new Date(`${label}-01T00:00:00`);
    return date.toLocaleDateString("en-GB", { month: "short" });
  }
  return label;
}

const TONE_CLASS = { green: "ok", amber: "wn", red: "er", purple: "pu", gray: "" };

const BADGE_TONES = {
  Active: "green",
  Verified: "green",
  Completed: "green",
  Success: "green",
  Successful: "green",
  Listed: "green",
  Resolved: "green",
  Pending: "amber",
  Open: "amber",
  Incomplete: "amber",
  Expired: "amber",
  Medium: "amber",
  "Waiting for User": "amber",
  "In Progress": "purple",
  Refunded: "purple",
  Deactivated: "red",
  Suspended: "red",
  Rejected: "red",
  Flagged: "red",
  Failed: "red",
  High: "red",
};

export function badgeClass(value, tone) {
  return TONE_CLASS[tone || BADGE_TONES[value] || "gray"];
}
