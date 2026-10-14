export const OPERATORS = ["MTN", "Airtel", "Glo", "9mobile"];
export const TECHS = ["2G", "3G", "4G", "4G+", "5G"];
export const SIGNALS = ["Strong", "Medium", "Weak"];
export const SOURCES = ["browser_measurement", "external_provider", "demonstration"];
export const CONFIDENCE = ["low", "medium", "high"];
export const RANGES = { "24h": 864e5, "7d": 6048e5, "30d": 2592e6, all: Infinity };
export const RANGE_LABELS = { "24h": "Last 24 hours", "7d": "Last 7 days", "30d": "Last 30 days", all: "All time" };
export const LATE_SUBMISSION_MINUTES = 60;

const LOCATIONS = [
  ["Lagos", "Eti Osa", "LAG-EO-01"],
  ["Lagos", "Ikeja", "LAG-IK-02"],
  ["Federal Capital Territory", "Abuja Municipal", "FCT-AM-01"],
  ["Rivers", "Port Harcourt", "RIV-PH-01"],
  ["Oyo", "Ibadan North", "OYO-IN-01"],
  ["Kano", "Nasarawa", "KAN-NA-01"],
];

export const numbers = (rows, key) => rows.map((row) => row[key]).filter((value) => typeof value === "number");

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export const mean = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);

export const format = (value, unit, digits = 1) => (value == null ? "—" : value.toFixed(digits) + unit);

export const timeText = (ms) => new Date(ms).toISOString().slice(0, 16).replace("T", " ") + " UTC";

export const percent = (part, total) => (total ? Math.round((part / total) * 100) + "%" : "—");

export function mostCommon(values) {
  const counts = {};
  values.filter(Boolean).forEach((value) => {
    counts[value] = (counts[value] || 0) + 1;
  });
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || null;
}

export const dayKey = (ts) => new Date(ts).toISOString().slice(0, 10);

function normalize(record) {
  const timestamp = Date.parse(record.timestamp);
  const received = Date.parse(record.received_at);
  const state = record.state || "";
  const lga = state ? record.lga || "" : "";
  return {
    id: record.measurement_id,
    _ts: timestamp,
    _recv: Number.isFinite(received) ? received : null,
    _dl: record.download_mbps,
    _ul: record.upload_mbps,
    _lat: record.latency_ms,
    cell: record.location_cell || "",
    tsText: timeText(timestamp),
    operator: record.operator || "Unknown",
    tech: record.connection_type || "Unavailable",
    signal: record.signal_strength_category || "Unavailable",
    dl: format(record.download_mbps, " Mbps"),
    ul: format(record.upload_mbps, " Mbps"),
    lat: format(record.latency_ms, " ms", 0),
    state: state || "Unknown",
    lga: lga || "—",
    loc: [state, lga, record.location_cell].filter(Boolean).join(" · ") || "Unknown",
    source: record.source,
    conf: record.confidence,
  };
}

export function demoRows() {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = (list) => list[Math.floor(random() * list.length)];
  const now = Date.now();
  const raw = Array.from({ length: 90 }, (_, index) => {
    const timestamp = now - random() * 6.5 * 864e5;
    const place = pick(LOCATIONS);
    const noState = random() < 0.06;
    return {
      measurement_id: `demo-${1000 + index}`,
      operator: random() < 0.08 ? null : pick(OPERATORS),
      connection_type: random() < 0.1 ? null : pick(["2G", "3G", "4G", "4G", "4G+", "4G+", "5G"]),
      signal_strength_category: random() < 0.12 ? pick(SIGNALS) : null,
      download_mbps: +(3 + random() * 55).toFixed(1),
      upload_mbps: +(1 + random() * 18).toFixed(1),
      latency_ms: Math.round(25 + random() * 150),
      timestamp: new Date(timestamp).toISOString(),
      received_at: new Date(timestamp + (random() < 0.1 ? 4e6 : 3e3)).toISOString(),
      location_cell: random() < 0.06 ? null : place[2],
      state: noState ? null : place[0],
      lga: noState || random() < 0.5 ? null : place[1],
      source: "demonstration",
      confidence: pick(CONFIDENCE),
    };
  });
  return raw.map(normalize).sort((a, b) => b._ts - a._ts);
}
