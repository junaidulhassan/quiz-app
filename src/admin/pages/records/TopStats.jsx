import SvgChart from "../../charts/SvgChart.jsx";
import StatCard from "../../components/StatCard.jsx";

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const ZEROS = [0, 0, 0, 0, 0, 0];

function stats(key, total) {
  if (key === "assess") {
    return [["Total", total], ["Completed", total], ["Pending", 0], ["Incomplete", 0]];
  }
  if (key === "billing") {
    return [["Total Revenue", "₦0"], ["Successful", 0], ["Pending", 0], ["Failed", 0], ["Refunds", 0]];
  }
  if (key === "support") {
    return [["Open", 0], ["Pending", 0], ["Resolved", 0], ["High Priority", 0], ["Avg. Response", "—"]];
  }
  return null;
}

export default function TopStats({ sectionKey, total }) {
  const items = stats(sectionKey, total);
  if (!items) return null;
  return (
    <>
      <div className="grid">
        {items.map(([label, value]) => (
          <StatCard key={label} label={label} value={value} />
        ))}
      </div>
      {sectionKey === "billing" && (
        <div className="grid g2">
          <div className="card">
            <h3>Revenue (₦k)</h3>
            <SvgChart type="bar" title="Revenue" values={ZEROS} labels={MONTHS} max={1} color="#16a34a" />
          </div>
          <div className="card">
            <h3>Transaction trend</h3>
            <SvgChart type="line" title="Transaction trend" values={ZEROS} labels={MONTHS} max={1} color="#774cff" />
          </div>
        </div>
      )}
    </>
  );
}
