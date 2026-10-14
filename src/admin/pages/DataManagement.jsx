import { useCallback, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { downloadDataset, fetchCleanup, fetchDatasets, fetchDeleted, purgeProfile, restoreProfile } from "../api/adminApi.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import useAdmin from "../hooks/useAdmin.js";
import useFetch from "../hooks/useFetch.js";
import { formatDate } from "../utils/format.js";
import PageHeader from "./PageHeader.jsx";

const TABS = ["Data Export", "Expired Profiles", "Deleted Profiles", "Archived Records", "Data Cleanup", "Data Retention"];
const RETENTION = [
  ["Expired profiles", "Auto-archive after 90 days"],
  ["Deleted accounts", "Restorable for 30 days"],
  ["Audit logs", "Kept 24 months"],
  ["Payment records", "Kept 7 years (legal)"],
];

function ExportTab({ permissions, toast }) {
  const loader = useCallback(() => fetchDatasets(), []);
  const { status, data, error, reload } = useFetch(loader);
  const [dataset, setDataset] = useState("users");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await downloadDataset(dataset, true);
      toast.show(`${data.items.find((item) => item.key === dataset)?.label || dataset} exported as CSV`);
    } catch (failure) {
      toast.show(failure.message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading") return <LoadingBlock />;
  if (status === "error") return <ErrorBlock message={error} onRetry={reload} />;
  return (
    <div className="card">
      <h3>Export dataset</h3>
      <div className="xr">
        <select value={dataset} onChange={(event) => setDataset(event.target.value)} aria-label="Dataset">
          {data.items.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
        <select aria-label="Format" defaultValue="CSV">
          <option>CSV</option>
        </select>
        <button
          type="button"
          className="btn pr"
          onClick={run}
          disabled={!permissions.export || busy}
          title={permissions.export ? undefined : "Not permitted for your role"}
        >
          Export
        </button>
      </div>
      <p className="note">Exports exclude passwords, assessment answers and payment instruments.</p>
    </div>
  );
}

function DeletedTab({ permissions, toast }) {
  const loader = useCallback(() => fetchDeleted(), []);
  const { status, data, error, reload } = useFetch(loader);
  const [dialog, setDialog] = useState(null);

  if (status === "loading") return <LoadingBlock />;
  if (status === "error") return <ErrorBlock message={error} onRetry={reload} />;
  if (!data.items.length) return <EmptyBlock title="Nothing here" text="No deleted profiles to show." />;

  const finish = (message, tone = "success") => {
    setDialog(null);
    toast.show(message, tone);
    reload();
  };
  const run = (task, message) => async () => {
    try {
      await task();
      finish(message);
    } catch (failure) {
      finish(failure.message, "error");
    }
  };

  return (
    <>
      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Record</th>
              <th>Name</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((row) => (
              <tr key={row.id}>
                <td>{row.email}</td>
                <td>{row.name}</td>
                <td>{formatDate(row.deleted)}</td>
                <td>
                  <div className="acts">
                    <button type="button" className="btn sm" disabled={!permissions.edit || !row.restorable} onClick={() => setDialog({ type: "restore", row })}>
                      Restore
                    </button>
                    <button type="button" className="btn sm rd" disabled={!permissions.del} title={permissions.del ? undefined : "Super Admin only"} onClick={() => setDialog({ type: "purge", row })}>
                      Delete forever
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {dialog?.type === "restore" && (
        <ConfirmDialog
          title="Restore record?"
          body={`${dialog.row.name} (${dialog.row.email}) will be restored to active records.`}
          confirmLabel="Restore"
          danger={false}
          onClose={() => setDialog(null)}
          onConfirm={run(() => restoreProfile(dialog.row.id), "Record restored")}
        />
      )}
      {dialog?.type === "purge" && (
        <ConfirmDialog
          title="Delete forever?"
          body={`${dialog.row.name} (${dialog.row.email}) will be permanently erased. This cannot be undone.`}
          confirmLabel="Delete forever"
          onClose={() => setDialog(null)}
          onConfirm={run(() => purgeProfile(dialog.row.id), "Record permanently deleted")}
        />
      )}
    </>
  );
}

function CleanupTab({ permissions, toast }) {
  const loader = useCallback(() => fetchCleanup(), []);
  const { status, data, error, reload } = useFetch(loader);
  const [scanning, setScanning] = useState(false);

  if (status === "loading" && !data) return <LoadingBlock />;
  if (status === "error" && !data) return <ErrorBlock message={error} onRetry={reload} />;

  const scan = () => {
    setScanning(true);
    reload();
    window.setTimeout(() => {
      setScanning(false);
      toast.show(`Scan complete — ${data.items.reduce((sum, item) => sum + item.count, 0)} items need review`);
    }, 900);
  };

  return (
    <div className="card">
      <h3>Data cleanup</h3>
      <div className="list">
        {data.items.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <small>{item.count}</small>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
        <button type="button" className="btn pr" onClick={scan} disabled={!permissions.edit || scanning}>
          {scanning ? "Scanning…" : "Run scan"}
        </button>
      </div>
    </div>
  );
}

function RetentionTab({ permissions }) {
  return (
    <div className="card">
      <h3>Retention policy</h3>
      {RETENTION.map(([name, rule]) => (
        <div key={name} className="sw">
          <span>
            {name}
            <small>{rule}</small>
          </span>
          <select disabled={!permissions.perm} title={permissions.perm ? undefined : "Super Admin only"} aria-label={name} defaultValue="Default">
            <option>Default</option>
          </select>
        </div>
      ))}
    </div>
  );
}

export default function DataManagement() {
  const { me } = useAdmin();
  const { toast } = useOutletContext();
  const [tab, setTab] = useState(TABS[0]);

  return (
    <>
      <PageHeader label="Data Management" sub="Every export and removal is audited. Personal data is minimised by default." />
      <div className="ut" role="tablist">
        {TABS.map((name) => (
          <button key={name} type="button" role="tab" className={name === tab ? "on" : ""} onClick={() => setTab(name)}>
            {name}
          </button>
        ))}
      </div>
      {tab === "Data Export" && <ExportTab permissions={me.permissions} toast={toast} />}
      {tab === "Deleted Profiles" && <DeletedTab permissions={me.permissions} toast={toast} />}
      {tab === "Expired Profiles" && <EmptyBlock title="Nothing here" text="No expired profiles to show." />}
      {tab === "Archived Records" && <EmptyBlock title="Nothing here" text="No archived records to show." />}
      {tab === "Data Cleanup" && <CleanupTab permissions={me.permissions} toast={toast} />}
      {tab === "Data Retention" && <RetentionTab permissions={me.permissions} />}
    </>
  );
}
