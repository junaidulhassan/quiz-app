import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { changePassword } from "../api/adminApi.js";
import useAdmin from "../hooks/useAdmin.js";
import PageHeader from "./PageHeader.jsx";

const GROUPS = {
  "Platform Settings": ["Maintenance mode", "Allow new registrations"],
  Notifications: ["Email alerts for new tickets", "Weekly platform report"],
  Security: ["Require 2FA for admins", "Auto-logout after 15 min idle"],
  Permissions: ["Support Admins can reply to tickets", "Admins can edit properties"],
  "Data & Privacy": ["Mask emails in exports", "Log all profile views"],
  "Billing Configuration": ["Send payment receipts", "Auto-flag repeated failures"],
};
const STORAGE_KEY = "hyeve_admin_settings";
const DEFAULTS = { "Allow new registrations": true, "Mask emails in exports": true, "Log all profile views": true, "Send payment receipts": true };

function loadSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
}

export default function Settings() {
  const { me } = useAdmin();
  const { toast } = useOutletContext();
  const [settings, setSettings] = useState(loadSettings);
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const toggle = (name, value) => {
    const next = { ...settings, [name]: value };
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      toast.show("Setting updated for this session only");
      return;
    }
    toast.show("Setting updated");
  };

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
      <PageHeader label="Settings" />
      <p style={{ color: "var(--gray)" }}>Credentials and API keys are managed on the server and are never shown here.</p>
      <div className="grid g2">
        {Object.entries(GROUPS).map(([group, names]) => (
          <div key={group} className="card">
            <h3>{group}</h3>
            {names.map((name) => (
              <label key={name} className="sw">
                {name}
                <input type="checkbox" checked={Boolean(settings[name])} onChange={(event) => toggle(name, event.target.checked)} />
              </label>
            ))}
          </div>
        ))}
        <form className="card" onSubmit={submit} noValidate>
          <h3>Change password</h3>
          <label className="fl">Current password</label>
          <input className="in fi" type="password" value={form.current} onChange={set("current")} autoComplete="current-password" />
          <label className="fl" style={{ marginTop: 16 }}>
            New password
          </label>
          <input className="in fi" type="password" value={form.next} onChange={set("next")} autoComplete="new-password" />
          <label className="fl" style={{ marginTop: 16 }}>
            Confirm new password
          </label>
          <input className="in fi" type="password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
          <p className="note">At least 8 characters with upper and lower case letters and a special character.</p>
          {error && (
            <p role="alert" style={{ color: "var(--red)", fontSize: 13, margin: "8px 0 0" }}>
              {error}
            </p>
          )}
          <div className="ft">
            <button type="submit" className="btn pr" disabled={busy || !form.current || !form.next}>
              Update password
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
