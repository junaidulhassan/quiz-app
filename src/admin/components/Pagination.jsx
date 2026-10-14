export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="pg">
      <span>{total} records</span>
      <div className="acts">
        <button type="button" className="btn sm" disabled={page < 2} onClick={() => onChange(page - 1)}>
          Prev
        </button>
        <span>
          {page} / {pages}
        </span>
        <button type="button" className="btn sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
