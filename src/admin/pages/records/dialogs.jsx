import { useState } from "react";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import Modal from "../../components/Modal.jsx";
import {
  createAdmin, deleteUser, flagActivity, setAdminActive, setAdminRole, setUserStatus, setVerification, updateUser,
} from "../../api/adminApi.js";
import RecordDetail from "../../components/RecordDetail.jsx";

const ROLES = ["Super Admin", "Admin", "Support Admin"];
const VERIFICATION = ["pending", "verified", "rejected"];

function FormDialog({ title, onClose, onSubmit, submitLabel, children }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSubmit();
    } catch (failure) {
      setError(failure.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {children}
        {error && (
          <p role="alert" style={{ color: "var(--red)", fontSize: 13, margin: "8px 0 0" }}>
            {error}
          </p>
        )}
        <div className="ft">
          <button type="button" className="btn" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn pr" disabled={busy}>
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, first = false, children }) {
  return (
    <label className="fl" style={first ? undefined : { marginTop: 16 }}>
      {label}
      {children}
    </label>
  );
}

export function EditUserDialog({ row, onClose, onDone }) {
  const [name, setName] = useState(row.name);
  const [phone, setPhone] = useState(row.phone || "");
  return (
    <FormDialog
      title="Edit user"
      submitLabel="Save changes"
      onClose={onClose}
      onSubmit={async () => {
        await updateUser(row.id, { full_name: name, phone });
        onDone("User updated");
      }}
    >
      <Field label="Name" first>
        <input className="in fi" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} />
      </Field>
      <Field label="Email address">
        <input className="in fi" value={row.email} disabled />
      </Field>
      <Field label="Contact number">
        <input className="in fi" value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" placeholder="08012345678" />
      </Field>
    </FormDialog>
  );
}

export function VerificationDialog({ row, onClose, onDone }) {
  const [value, setValue] = useState(row.verification.toLowerCase());
  return (
    <FormDialog
      title="Verification"
      submitLabel="Save"
      onClose={onClose}
      onSubmit={async () => {
        await setVerification(row.id, value);
        onDone("Verification updated");
      }}
    >
      <p>Set the verification state for {row.name}.</p>
      <Field label="Verification" first>
        <select className="fi" value={value} onChange={(event) => setValue(event.target.value)}>
          {VERIFICATION.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </Field>
    </FormDialog>
  );
}

export function RoleDialog({ row, onClose, onDone }) {
  const [role, setRole] = useState(row.role);
  return (
    <FormDialog
      title="Change role"
      submitLabel="Save role"
      onClose={onClose}
      onSubmit={async () => {
        await setAdminRole(row.id, role);
        onDone("Role updated");
      }}
    >
      <p>
        {row.name} is currently <strong>{row.role}</strong>. Role changes take effect immediately and are recorded in the audit log.
      </p>
      <Field label="Role" first>
        <select className="fi" value={role} onChange={(event) => setRole(event.target.value)}>
          {ROLES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
    </FormDialog>
  );
}

export function InviteAdminDialog({ onClose, onDone }) {
  const [form, setForm] = useState({ username: "", password: "", role: "Support Admin" });
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  return (
    <FormDialog
      title="Invite admin"
      submitLabel="Create admin"
      onClose={onClose}
      onSubmit={async () => {
        await createAdmin(form);
        onDone("Admin created");
      }}
    >
      <Field label="Username" first>
        <input className="in fi" value={form.username} onChange={set("username")} autoComplete="off" maxLength={50} />
      </Field>
      <Field label="Temporary password">
        <input className="in fi" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" />
      </Field>
      <p className="note">At least 8 characters with upper and lower case letters and a special character.</p>
      <Field label="Role" first>
        <select className="fi" value={form.role} onChange={set("role")}>
          {ROLES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
    </FormDialog>
  );
}

export function RowDialogs({ dialog, section, onClose, onDone }) {
  if (!dialog) return null;
  const { type, row } = dialog;
  const finish = (message) => {
    onClose();
    onDone(message);
  };
  const confirmed = (task, message) => async () => {
    try {
      await task();
      finish(message);
    } catch (failure) {
      onClose();
      onDone(failure.message, "error");
    }
  };

  if (type === "view") return <RecordDetail title={row.name || row.user || "Details"} row={row} columns={section.columns} onClose={onClose} />;
  if (type === "edit") return <EditUserDialog row={row} onClose={onClose} onDone={finish} />;
  if (type === "verify") return <VerificationDialog row={row} onClose={onClose} onDone={finish} />;
  if (type === "role") return <RoleDialog row={row} onClose={onClose} onDone={finish} />;
  if (type === "invite") return <InviteAdminDialog onClose={onClose} onDone={finish} />;
  if (type === "suspend" || type === "activate") {
    const suspend = type === "suspend";
    return (
      <ConfirmDialog
        title={suspend ? "Suspend account?" : "Activate account?"}
        body={`${row.name} will ${suspend ? "lose access until reactivated" : "regain access"}. This is reversible.`}
        confirmLabel={suspend ? "Suspend" : "Activate"}
        danger={suspend}
        onClose={onClose}
        onConfirm={confirmed(() => setUserStatus(row.id, type), suspend ? "Account suspended" : "Account activated")}
      />
    );
  }
  if (type === "delete") {
    return (
      <ConfirmDialog
        title="Delete user?"
        body={`${row.name} will move to Deleted Profiles and can be restored for 30 days. Permanent removal is done in Data Management.`}
        confirmLabel="Delete user"
        onClose={onClose}
        onConfirm={confirmed(() => deleteUser(row.id), "User deleted")}
      />
    );
  }
  if (type === "flag" || type === "unflag") {
    const flag = type === "flag";
    return (
      <ConfirmDialog
        title={flag ? "Flag for review?" : "Remove flag?"}
        body={flag ? `${row.user}'s ${row.type} entry will be marked as flagged.` : "This entry will be marked as normal again."}
        confirmLabel={flag ? "Flag" : "Remove flag"}
        danger={flag}
        onClose={onClose}
        onConfirm={confirmed(() => flagActivity(row.id, flag), flag ? "Activity flagged" : "Flag removed")}
      />
    );
  }
  if (type === "deactivate" || type === "reactivate") {
    const deactivate = type === "deactivate";
    return (
      <ConfirmDialog
        title={deactivate ? "Deactivate admin?" : "Reactivate admin?"}
        body={deactivate ? `${row.name} will be signed out and can no longer use the admin dashboard.` : `${row.name} will be able to use the admin dashboard again.`}
        confirmLabel={deactivate ? "Deactivate" : "Reactivate"}
        danger={deactivate}
        onClose={onClose}
        onConfirm={confirmed(() => setAdminActive(row.id, !deactivate), deactivate ? "Admin deactivated" : "Admin reactivated")}
      />
    );
  }
  return null;
}
