import { useState } from "react";
import { formatNumber, shortLabel } from "../utils/format.js";
import { DataTable, Tooltip } from "./ChartFrame.jsx";
import { labelStep, niceMax, ticks } from "./scale.js";

const WIDTH = 640;
const HEIGHT = 220;
const PAD = { top: 12, right: 8, bottom: 26, left: 36 };

function barPath(x, y, width, height) {
  const radius = Math.min(4, width / 2, height);
  if (height <= 0) return "";
  return `M${x},${y + height} V${y + radius} Q${x},${y} ${x + radius},${y} H${x + width - radius} Q${x + width},${y} ${x + width},${y + radius} V${y + height} Z`;
}

export default function BarChart({ data, title }) {
  const [hovered, setHovered] = useState(null);
  const max = niceMax(Math.max(0, ...data.map((point) => point.value)));
  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const slot = innerWidth / Math.max(1, data.length);
  const barWidth = Math.max(3, Math.min(28, slot * 0.62));
  const step = labelStep(data.length);
  const active = hovered === null ? null : data[hovered];
  const activeX = hovered === null ? 0 : PAD.left + slot * hovered + slot / 2;
  const activeY = hovered === null ? 0 : PAD.top + innerHeight - (active.value / max) * innerHeight;

  return (
    <div className="ad-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} onMouseLeave={() => setHovered(null)}>
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
        {data.map((point, index) => {
          const height = (point.value / max) * innerHeight;
          const x = PAD.left + slot * index + (slot - barWidth) / 2;
          return (
            <g key={point.label} onMouseEnter={() => setHovered(index)}>
              <rect x={PAD.left + slot * index} y={PAD.top} width={slot} height={innerHeight} fill="transparent" />
              <path
                className={`ad-bar${hovered === index ? " is-active" : ""}`}
                d={barPath(x, PAD.top + innerHeight - height, barWidth, Math.max(point.value > 0 ? 2 : 0, height))}
              />
              {index % step === 0 && (
                <text className="ad-axis" x={x + barWidth / 2} y={HEIGHT - 8} textAnchor="middle">
                  {shortLabel(point.label)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <Tooltip point={active} left={(activeX / WIDTH) * 100} top={(activeY / HEIGHT) * 100} />
      <DataTable title={title} data={data} />
    </div>
  );
}
