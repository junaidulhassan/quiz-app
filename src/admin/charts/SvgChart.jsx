const W = 600;
const H = 230;
const L = 46;
const R = 16;
const T = 14;
const B = 30;

export default function SvgChart({ type, values, labels, max, color, title = "Chart" }) {
  const pw = W - L - R;
  const ph = H - T - B;
  const step = pw / values.length;
  const y = (value) => T + ph - (value / max) * ph;
  const x = (index) => L + step * index + step / 2;
  const points = values.map((value, index) => `${x(index)},${y(value)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} style={{ width: "100%", height: "auto", display: "block" }}>
      {[0, 1, 2, 3].map((index) => {
        const value = (max / 3) * index;
        return (
          <g key={index}>
            <line x1={L} x2={W - R} y1={y(value)} y2={y(value)} stroke="#e3e3e6" />
            <text x={L - 8} y={y(value) + 4} textAnchor="end" fontSize="11" fill="#9a9aa2">
              {Math.round(value)}
            </text>
          </g>
        );
      })}
      {type === "bar" &&
        values.map((value, index) => (
          <rect key={labels[index]} x={x(index) - step * 0.3} y={y(value)} width={step * 0.6} height={T + ph - y(value)} rx="6" fill={color}>
            <title>{`${labels[index]}: ${value}`}</title>
          </rect>
        ))}
      {type === "line" && (
        <>
          <polygon points={`${x(0)},${T + ph} ${points} ${x(values.length - 1)},${T + ph}`} fill={color} opacity=".15" />
          <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
          {values.map((value, index) => (
            <circle key={labels[index]} cx={x(index)} cy={y(value)} r="3.5" fill={color}>
              <title>{`${labels[index]}: ${value}`}</title>
            </circle>
          ))}
        </>
      )}
      {labels.map((label, index) => (
        <text key={label} x={x(index)} y={H - 8} textAnchor="middle" fontSize="11" fill="#5b5d67">
          {label}
        </text>
      ))}
    </svg>
  );
}
