import { useCallback, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { downloadDataset, fetchDatasets, fetchDeleted, purgeProfile, restoreProfile } from "../api/adminApi.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { DownloadIcon } from "../components/Icons.jsx";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import Spinner from "../components/Spinner.jsx";
import useAdmin from "../hooks/useAdmin.js";
import useFetch from "../hooks/useFetch.js";
import { formatDate } from "../utils/format.js";
import PageHeader from "./PageHeader.jsx";

const TABS = ["Data Export", "Deleted Profiles", "Data Retention"];

const RETENTION = [
  ["Deleted accounts", "Restorable for 30 days, then eligible for permanent removal."],
  ["Search history", "Kept for 14 days for each user."],
  ["Audit log", "Every admin action is recorded and can't be edited."],
  ["Exports", "Contact details are masked unless a full export is chosen. Every export is audited."],
];

function ExportTab({ permissions, toast }) {
  const loader = useCallback(() => fetchDatasets(), []);
  const { status, data, error, reload } = useFetch(loader);
  const [dataset, setDataset] = useState("users");
  const [mask, setMask] = useState(true);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await downloadDataset(dataset, mask);
      toast.show("Export downloaded.");
    } catch (failure) {
      toast.show(failure.message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading") return <LoadingBlock />;
  if (status === "error") return <ErrorBlock message={error} onRetry={reload} />;

  return (
    <div className="adm-card">
      <h3>Export dataset</h3>
      <div className="adm-export-row">
        <select value={dataset} onChange={(event) => setDataset(event.target.value)} aria-label="Dataset">
          {data.items.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
        <label className="adm-check">
          <input type="checkbox" checked={mask} onChange={(event) => setMask(event.target.checked)} />
          Mask emails and phone numbers
        </label>
        <button
          type="button"
          className="adm-btn is-primary"
          onClick={run}
          disabled={!permissions.export || busy}
          title={permissions.export ? undefined : "Not permitted for your role"}
        >
          {busy ? <Spinner light /> : <DownloadIcon width={16} height={16} />}
          Export CSV
        </button>
      </div>
      <p className="adm-hint">Exports exclude passwords and quiz answers. Every export is written to the audit log.</p>
    </div>
  );
}

function DeletedTab({ permissions, toast }) {
  const loader = useCallback(() => fetchDeleted(), []);
  const { status, data, error, reload } = useFetch(loader);
  const [dialog, setDialog] = useState(null);

  if (status === "loading") return <LoadingBlock />;
  if (status === "error") return <ErrorBlock message={error} onRetry={reload} />;
  if (!data.items.length) return <EmptyBlock title="No deleted profiles" text="Deleted users show up here for 30 days." />;

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
    <div className="adm-card adm-table-card">
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Deleted</th>
              <th>Time left</th>
              <th className="adm-actions-head">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((row) => (
              <tr key={row.id}>
                <td className="is-strong">{row.name}</td>
                <td>{row.email}</td>
                <td>{row.role}</td>
                <td>{formatDate(row.deleted)}</td>
                <td>{row.restorable ? `${row.days_left} days` : "Past restore window"}</td>
                <td className="adm-actions">
                  <button
                    type="button"
                    className="adm-btn is-small"
                    disabled={!permissions.edit || !row.restorable}
                    onClick={() => setDialog({ type: "restore", row })}
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    className="adm-btn is-small is-danger"
                    disabled={!permissions.del}
                    onClick={() => setDialog({ type: "purge", row })}
                  >
                    Remove permanently
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {dialog?.type === "restore" && (
        <ConfirmDialog
          title="Restore profile?"
          body={`${dialog.row.name} will regain access to their account.`}
          confirmLabel="Restore"
          danger={false}
          onClose={() => setDialog(null)}
          onConfirm={run(() => restoreProfile(dialog.row.id), "Profile restored")}
        />
      )}
      {dialog?.type === "purge" && (
        <ConfirmDialog
          title="Remove permanently?"
          body={`${dialog.row.name}'s account, history and settings will be erased for good. This can't be undone.`}
          confirmLabel="Remove permanently"
          onClose={() => setDialog(null)}
          onConfirm={run(() => purgeProfile(dialog.row.id), "Profile permanently removed")}
        />
      )}
    </div>
  );
}

function RetentionTab() {
  return (
    <div className="adm-card adm-list">
      <h3>Retention policy</h3>
      {RETENTION.map(([name, rule]) => (
        <div key={name} className="adm-list-row">
          <span>
            {name}
            <small>{rule}</small>
          </span>
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
      <div className="adm-tabs" role="tablist">
        {TABS.map((name) => (
          <button key={name} type="button" role="tab" aria-selected={tab === name} className={tab === name ? "is-on" : ""} onClick={() => setTab(name)}>
            {name}
          </button>
        ))}
      </div>
      {tab === "Data Export" && <ExportTab permissions={me.permissions} toast={toast} />}
      {tab === "Deleted Profiles" && <DeletedTab permissions={me.permissions} toast={toast} />}
      {tab === "Data Retention" && <RetentionTab />}
    </>
  );
}
