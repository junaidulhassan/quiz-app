export default function PageHeader({ label, sub, children }) {
  return (
    <>
      <div className="crumb">
        Admin / <b>{label}</b>
      </div>
      <div className="ph">
        <div>
          <h1>{label}</h1>
          {sub && <p className="sub">{sub}</p>}
        </div>
        <div className="acts">{children}</div>
      </div>
    </>
  );
}
