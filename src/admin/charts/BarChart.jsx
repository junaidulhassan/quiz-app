export default function BarChart({ data, title }) {
  const max = Math.max(0, ...data.map((point) => point.value));
  return (
    <div className="bars" role="img" aria-label={title}>
      {data.map((point) => (
        <div key={point.label} title={String(point.value)}>
          <u style={{ height: `${max ? (point.value / max) * 100 : 0}%` }} />
          {point.label}
        </div>
      ))}
    </div>
  );
}
