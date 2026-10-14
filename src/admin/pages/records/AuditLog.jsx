import { useCallback, useState } from "react";
import { fetchAuditOptions, fetchList } from "../../api/adminApi.js";
import Pagination from "../../components/Pagination.jsx";
import RecordTable from "../../components/RecordTable.jsx";
import { ErrorBlock, LoadingBlock } from "../../components/StateBlock.jsx";
import useDebounced from "../../hooks/useDebounced.js";
import useFetch from "../../hooks/useFetch.js";

const COLUMNS = [
  { label: "Admin", field: "admin", strong: true },
  { label: "Action", field: "action" },
  { label: "Affected record", field: "record" },
  { label: "Time", field: "time", type: "datetime" },
  { label: "Status", field: "status", type: "badge" },
];

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [admin, setAdmin] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounced(search);

  const optionsLoader = useCallback(() => fetchAuditOptions(), []);
  const options = useFetch(optionsLoader);
  const loader = useCallback(
    () => fetchList("audit", { q: debounced, admin, action, page, page_size: 15 }),
    [debounced, admin, action, page]
  );
  const { status, data, error, reload } = useFetch(loader);

  const change = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3>Audit log</h3>
      <div className="tb">
        <input
          className="in"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search…"
          aria-label="Search the audit log"
        />
        <select value={admin} onChange={change(setAdmin)} aria-label="Admin">
          <option value="">Admin: All</option>
          {(options.data?.admins || []).map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
        <select value={action} onChange={change(setAction)} aria-label="Action">
          <option value="">Action: All</option>
          {(options.data?.actions || []).map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </div>
      {status === "loading" && !data && <LoadingBlock />}
      {status === "error" && <ErrorBlock message={error} onRetry={reload} />}
      {data && data.items.length === 0 && <div className="state">No matching audit entries.</div>}
      {data && data.items.length > 0 && (
        <>
          <RecordTable columns={COLUMNS} rows={data.items} />
          <Pagination page={page} pageSize={15} total={data.total} onChange={setPage} />
        </>
      )}
    </div>
  );
}
