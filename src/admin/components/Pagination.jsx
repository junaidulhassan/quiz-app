import { formatNumber } from "../utils/format.js";

export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="ad-pagination">
      <span>
        {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}
      </span>
      <div>
        <button type="button" className="ad-btn is-small" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </button>
        <span className="ad-page-label">
          Page {page} of {pages}
        </span>
        <button type="button" className="ad-btn is-small" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
