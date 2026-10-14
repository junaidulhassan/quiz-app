import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/lookup/ConfirmModal.jsx";
import useAuth from "../../hooks/useAuth.js";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { deleteAccount, updateAccount } from "../../api/account.js";
import { clearSession } from "../../api/client.js";

const ROLE_LABELS = { property_manager: "Property Manager", tenant: "Tenant" };

function Toggle({ checked, label, onChange }) {
  return (
    <button
      type="button"
      className={`profile-toggle${checked ? " is-on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    />
  );
}

export default function Profile() {
  useDocumentTitle("Profile — Hyeve");
  const { account, applyPayload, reset } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [fullName, setFullName] = useState(account.full_name);
  const [phone, setPhone] = useState(account.phone || "");
  const [deleting, setDeleting] = useState(false);

  const save = async () => {
    try {
      applyPayload(await updateAccount({ full_name: fullName.trim(), phone: phone.replace(/\D/g, "") }));
      toast.show("Profile changes saved.");
    } catch (failure) {
      toast.show(failure.message);
    }
  };

  const togglePreference = async (field, value) => {
    try {
      applyPayload(await updateAccount({ [field]: value }));
    } catch (failure) {
      toast.show(failure.message);
    }
  };

  const confirmDelete = async () => {
    setDeleting(false);
    try {
      await deleteAccount();
      clearSession();
      reset();
      navigate("/login", { replace: true });
    } catch (failure) {
      toast.show(failure.message);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-content">
        <h1 className="profile-heading">Profile</h1>
        <p className="profile-subtext">Manage your account details and notification preferences.</p>

        <div className="profile-card">
          <h2 className="profile-card-heading">Account Details</h2>

          <div className="profile-row">
            <label className="profile-label" htmlFor="profile-full-name">
              Full Name
            </label>
            <input
              type="text"
              id="profile-full-name"
              className="profile-input"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div className="profile-row">
            <span className="profile-label">Email Address</span>
            <span className="profile-value">{account.email}</span>
          </div>

          <div className="profile-row">
            <span className="profile-label">Account Role</span>
            <span className="profile-value">{ROLE_LABELS[account.role]}</span>
          </div>

          <div className="profile-row">
            <label className="profile-label" htmlFor="profile-phone">
              Phone Number
            </label>
            <input
              type="tel"
              id="profile-phone"
              className="profile-input"
              placeholder="Enter your phone number"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div className="profile-card-actions">
            <button type="button" className="profile-save-button" id="profile-save-btn" onClick={save}>
              Save Changes
            </button>
          </div>
        </div>

        <div className="profile-card">
          <h2 className="profile-card-heading">Notification Preferences</h2>

          <div className="profile-pref-row">
            <div className="profile-pref-text">
              <p className="profile-pref-title">Email Alerts</p>
              <p className="profile-pref-desc">Get important notifications about lookups and account activity.</p>
            </div>
            <Toggle
              label="Email Alerts"
              checked={account.notify_email_alerts}
              onChange={(value) => togglePreference("notify_email_alerts", value)}
            />
          </div>

          <div className="profile-pref-row">
            <div className="profile-pref-text">
              <p className="profile-pref-title">Product Updates</p>
              <p className="profile-pref-desc">Get occasional emails about new features.</p>
            </div>
            <Toggle
              label="Product Updates"
              checked={account.notify_product_updates}
              onChange={(value) => togglePreference("notify_product_updates", value)}
            />
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-delete-row">
            <div className="profile-delete-text">
              <h2 className="profile-card-heading">Delete Account</h2>
              <p className="profile-subtext" style={{ marginBottom: 0 }}>
                Your account will be permanently deleted and cannot be recovered.
              </p>
            </div>
            <button type="button" className="profile-delete-button" id="profile-delete-btn" onClick={() => setDeleting(true)}>
              Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        prefix="delete-modal"
        open={deleting}
        heading="Delete your account?"
        subtext="Your account and data will be permanently deleted. This action cannot be undone."
        dismissLabel="Cancel"
        confirmLabel="Delete account"
        onDismiss={() => setDeleting(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
