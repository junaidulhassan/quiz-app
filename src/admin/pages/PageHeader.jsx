export default function PageHeader({ label, sub, children }) {
  return (
    <>
      <div className="adm-crumb">
        Admin / <b>{label}</b>
      </div>
      <div className="adm-page-head">
        <div>
          <h1>{label}</h1>
          {sub && <p>{sub}</p>}
        </div>
        {children && <div className="adm-head-actions">{children}</div>}
      </div>
    </>
  );
}
