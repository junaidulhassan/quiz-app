export function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "H";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value.endsWith("Z") || value.includes("+") ? value : `${value}Z`);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

export function formatCooldown(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

export function formatPhone(value) {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function formatPrice(value) {
  const digits = digitsOnly(value);
  return digits ? Number(digits).toLocaleString("en-US") : "";
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function passwordProblem(value) {
  if (value.length < 8) return "Use at least 8 characters.";
  if (value.length > 72) return "Use at most 72 characters.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return "Include at least one letter and one number.";
  return "";
}

export function compactCount(value) {
  const units = [
    { size: 1e9, suffix: "B" },
    { size: 1e6, suffix: "M" },
    { size: 1e3, suffix: "K" },
  ];
  for (const { size, suffix } of units) {
    if (value >= size) {
      const scaled = Math.round((value / size) * 10) / 10;
      return (scaled % 1 === 0 ? String(scaled) : scaled.toFixed(1)) + suffix;
    }
  }
  return String(value);
}
