import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { changePassword } from "../api/adminApi.js";
import Badge from "../components/Badge.jsx";
import Spinner from "../components/Spinner.jsx";
import { SECTION_BY_KEY } from "../config/sections.js";
import useAdmin from "../hooks/useAdmin.js";
import PageHeader from "./PageHeader.jsx";

const ACTION_LABELS = [
  ["edit", "Edit records"],
  ["del", "Delete users"],
  ["perm", "Manage admins"],
  ["export", "Export data"],
];

export default function Settings() {
  const { me } = useAdmin();
  const { toast } = useOutletContext();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.next !== form.confirm) {
      setError("The new passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await changePassword(me.username, form.current, form.next);
      setForm({ current: "", next: "", confirm: "" });
      toast.show("Password changed. Other sessions were signed out.");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader label="Settings" sub="Your admin account and access." />
      <div className="adm-grid-2 is-top">
        <div className="adm-card">
          <h3>Your access</h3>
          <dl className="adm-detail is-single">
            <div>
              <dt>Username</dt>
              <dd>{me.username}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>
                <Badge value={me.role} tone="purple" />
              </dd>
            </div>
            <div>
              <dt>Can open</dt>
              <dd className="adm-chips">
                {me.permissions.view.map((key) => (
                  <span key={key}>{SECTION_BY_KEY[key]?.label || key}</span>
                ))}
              </dd>
            </div>
            <div>
              <dt>Can do</dt>
              <dd className="adm-chips">
                {ACTION_LABELS.filter(([key]) => me.permissions[key]).map(([key, label]) => (
                  <span key={key}>{label}</span>
                ))}
                {!ACTION_LABELS.some(([key]) => me.permissions[key]) && <span>View only</span>}
              </dd>
            </div>
          </dl>
        </div>
        <form className="adm-card" onSubmit={submit} noValidate>
          <h3>Change password</h3>
          <label className="adm-field">
            <span>Current password</span>
            <input type="password" value={form.current} onChange={set("current")} autoComplete="current-password" />
          </label>
          <label className="adm-field">
            <span>New password</span>
            <input type="password" value={form.next} onChange={set("next")} autoComplete="new-password" />
          </label>
          <label className="adm-field">
            <span>Confirm new password</span>
            <input type="password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
          </label>
          <p className="adm-hint">At least 8 characters with upper and lower case letters and a special character.</p>
          {error && (
            <p className="adm-form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="adm-btn is-primary" disabled={busy || !form.current || !form.next}>
            {busy && <Spinner light />}
            Update password
          </button>
        </form>
      </div>
    </>
  );
}
