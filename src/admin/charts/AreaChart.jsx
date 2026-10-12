import { useState } from "react";
import { formatNumber, shortLabel } from "../utils/format.js";
import { DataTable, Tooltip } from "./ChartFrame.jsx";
import { labelStep, niceMax, ticks } from "./scale.js";

const WIDTH = 640;
const HEIGHT = 220;
const PAD = { top: 12, right: 12, bottom: 26, left: 36 };

export default function AreaChart({ data, title }) {
  const [hovered, setHovered] = useState(null);
  const max = niceMax(Math.max(0, ...data.map((point) => point.value)));
  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const gap = data.length > 1 ? innerWidth / (data.length - 1) : 0;
  const points = data.map((point, index) => ({
    x: PAD.left + gap * index,
    y: PAD.top + innerHeight - (point.value / max) * innerHeight,
  }));
  const line = points.map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ");
  const area = points.length
    ? `${line} L${points[points.length - 1].x},${PAD.top + innerHeight} L${points[0].x},${PAD.top + innerHeight} Z`
    : "";
  const step = labelStep(data.length);

  const onMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const x = ratio * WIDTH - PAD.left;
    const index = Math.round(x / (gap || 1));
    setHovered(Math.max(0, Math.min(data.length - 1, index)));
  };

  const active = hovered === null ? null : data[hovered];
  const activePoint = hovered === null ? null : points[hovered];

  return (
    <div className="ad-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={title}
        onMouseMove={onMove}
        onMouseLeave={() => setHovered(null)}
      >
        {ticks(max).map((tick) => {
          const y = PAD.top + innerHeight - (tick / max) * innerHeight;
          return (
            <g key={tick}>
              <line className="ad-grid" x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} />
              <text className="ad-axis" x={PAD.left - 8} y={y + 4} textAnchor="end">
                {formatNumber(tick)}
              </text>
            </g>
          );
        })}
        <path className="ad-area" d={area} />
        <path className="ad-line" d={line} />
        {data.map((point, index) =>
          index % step === 0 ? (
            <text key={point.label} className="ad-axis" x={points[index].x} y={HEIGHT - 8} textAnchor="middle">
              {shortLabel(point.label)}
            </text>
          ) : null
        )}
        {activePoint && (
          <g>
            <line className="ad-crosshair" x1={activePoint.x} x2={activePoint.x} y1={PAD.top} y2={PAD.top + innerHeight} />
            <circle className="ad-dot" cx={activePoint.x} cy={activePoint.y} r="4.5" />
          </g>
        )}
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="transparent" />
      </svg>
      <Tooltip
        point={active}
        left={activePoint ? (activePoint.x / WIDTH) * 100 : 0}
        top={activePoint ? (activePoint.y / HEIGHT) * 100 : 0}
      />
      <DataTable title={title} data={data} />
    </div>
  );
}
