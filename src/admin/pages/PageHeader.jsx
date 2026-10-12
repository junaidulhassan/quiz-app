export default function PageHeader({ label, sub, children }) {
  return (
    <>
      <div className="ad-crumb">
        Admin / <b>{label}</b>
      </div>
      <div className="ad-page-head">
        <div>
          <h1>{label}</h1>
          {sub && <p>{sub}</p>}
        </div>
        {children && <div className="ad-head-actions">{children}</div>}
      </div>
    </>
  );
}
