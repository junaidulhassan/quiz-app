export function niceMax(value) {
  const rough = Math.max(1, value / 4);
  const exponent = Math.floor(Math.log10(rough));
  const base = 10 ** exponent;
  const fraction = rough / base;
  const step = (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * base;
  return step * 4;
}

export function ticks(max, count = 4) {
  return Array.from({ length: count + 1 }, (_, index) => Math.round((max / count) * index));
}

export function labelStep(length, target = 6) {
  return Math.max(1, Math.ceil(length / target));
}
