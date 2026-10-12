import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal.jsx";
import Spinner from "../../components/Spinner.jsx";
import { PasswordField, TextField } from "../../components/TextField.jsx";
import useAuth from "../../hooks/useAuth.js";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { deleteAccount, updateAccount } from "../../api/account.js";
import { clearSession } from "../../api/client.js";
import { digitsOnly, formatPhone } from "../../utils/format.js";

const ROLE_LABELS = { property_manager: "Property Manager", tenant: "Tenant" };

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`hv-switch${checked ? " is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

export default function Profile() {
  useDocumentTitle("Profile — Hyeve");
  const { account, applyPayload, reset } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ full_name: account.full_name, phone: formatPhone(account.phone || "") });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

  const dirty =
    form.full_name.trim() !== account.full_name || digitsOnly(form.phone) !== (account.phone || "");

  const save = async (event) => {
    event.preventDefault();
    if (!form.full_name.trim()) {
      setError("Enter your full name.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      applyPayload(await updateAccount({ full_name: form.full_name.trim(), phone: digitsOnly(form.phone) }));
      toast.show("Profile updated.");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = async (field, value) => {
    try {
      applyPayload(await updateAccount({ [field]: value }));
    } catch (failure) {
      toast.show(failure.message);
    }
  };

  const confirmDelete = async (event) => {
    event.preventDefault();
    setDeleteError("");
    setDeleteBusy(true);
    try {
      await deleteAccount(password);
      clearSession();
      reset();
      navigate("/login", { replace: true });
    } catch (failure) {
      setDeleteError(failure.message);
      setDeleteBusy(false);
    }
  };

  return (
    <div className="hv-simple-page">
      <h1 className="hv-page-heading">Profile</h1>
      <p className="hv-page-subtext">Manage your account details and notifications.</p>
      <div className="hv-two-col">
        <form className="hv-card" onSubmit={save} noValidate>
          <h2 className="hv-card-heading">Account Details</h2>
          <TextField
            label="Full name"
            value={form.full_name}
            onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
            error={error}
          />
          <TextField label="Email address" value={account.email} readOnly disabled />
          <TextField
            label="Phone number"
            type="tel"
            inputMode="numeric"
            placeholder="0000 000 0000"
            maxLength={13}
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: formatPhone(event.target.value) }))
            }
          />
          <TextField label="Role" value={ROLE_LABELS[account.role] || ""} readOnly disabled />
          <button type="submit" className="hv-btn hv-btn-primary" disabled={!dirty || saving}>
            {saving && <Spinner />}
            Save changes
          </button>
        </form>
        <div className="hv-stack">
          <div className="hv-card">
            <h2 className="hv-card-heading">Notification Preferences</h2>
            <div className="hv-pref-row">
              <div>
                <p className="hv-pref-title">Email Alerts</p>
                <p className="hv-muted-text">Get an email about important activity on your account.</p>
              </div>
              <Toggle
                label="Email alerts"
                checked={account.notify_email_alerts}
                onChange={(value) => togglePreference("notify_email_alerts", value)}
              />
            </div>
            <div className="hv-pref-row">
              <div>
                <p className="hv-pref-title">Product Updates</p>
                <p className="hv-muted-text">Hear about new features and improvements.</p>
              </div>
              <Toggle
                label="Product updates"
                checked={account.notify_product_updates}
                onChange={(value) => togglePreference("notify_product_updates", value)}
              />
            </div>
          </div>
          <div className="hv-card hv-danger-card">
            <h2 className="hv-card-heading">Delete Account</h2>
            <p className="hv-muted-text">
              Permanently remove your account and lookup history. This can't be undone.
            </p>
            <button type="button" className="hv-btn hv-btn-danger" onClick={() => setDeleting(true)}>
              Delete account
            </button>
          </div>
        </div>
      </div>
      <Modal open={deleting} title="Delete your account?" onClose={() => setDeleting(false)}>
        <form onSubmit={confirmDelete} noValidate>
          <p className="hv-modal-text">
            Enter your password to confirm. Your account and history will be removed.
          </p>
          <PasswordField
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            error={deleteError}
          />
          <div className="hv-modal-actions">
            <button type="button" className="hv-btn hv-btn-secondary" onClick={() => setDeleting(false)}>
              Cancel
            </button>
            <button type="submit" className="hv-btn hv-btn-danger" disabled={!password || deleteBusy}>
              {deleteBusy && <Spinner />}
              Delete
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
