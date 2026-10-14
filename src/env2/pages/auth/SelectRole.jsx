import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { RoleUserIcon } from "../../components/AuthIcons.jsx";
import Toast from "../../components/Toast.jsx";
import useAuth from "../../hooks/useAuth.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useToast from "../../hooks/useToast.js";
import { chooseRole } from "../../api/auth.js";
import "../../styles/pages/select-role.css";

const ROLES = [
  { value: "property_manager", name: "Property Manager", title: "As a Property Manager", text: "I manage properties for myself or others" },
  { value: "tenant", name: "Tenant", title: "As a Tenant", text: "I currently rent or have rented in the past" },
];

export default function SelectRole() {
  useDocumentTitle("Choose your role — Hyeve");
  const { account, applyPayload } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [role, setRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [announce, setAnnounce] = useState("");

  if (account.role && account.onboarding_complete) {
    return <Navigate to={account.role === "tenant" ? "/roommate/search" : "/landlord/search"} replace />;
  }

  const selected = ROLES.find((item) => item.value === role);

  const onKeyDown = (index) => (event) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const next = ROLES[(index + step + ROLES.length) % ROLES.length];
    setRole(next.value);
    document.getElementById(`role-${next.value}`)?.focus();
  };

  const submit = async () => {
    if (!role || submitting) return;
    setSubmitting(true);
    setAnnounce(`Setting up your ${selected.name} account…`);
    try {
      const payload = await chooseRole(role);
      applyPayload(payload);
      sessionStorage.setItem("hyeve_show_welcome_toast", "1");
      setAnnounce("Setup complete. Redirecting…");
      navigate(payload.destination, { replace: true });
    } catch (error) {
      toast.show(error.message || "Something went wrong. Please try again.");
      setAnnounce("");
      setSubmitting(false);
    }
  };

  return (
    <div className="pg-select-role">
      <main className="auth-page">
        <div className="logo-mark" aria-hidden="true">
          <img src="/logo/hyeve-new-logo.png" alt="" width="58" height="58" />
        </div>
        <div className="auth-wrap">
          <div className="auth-card">
            <div className="progress-track" role="img" aria-label="Onboarding step 1 of 2">
              <span className="progress-segment is-active" />
              <span className="progress-segment" />
            </div>

            <h1 className="heading">How do you want to use Hyeve?</h1>
            <p className="subtext">Specify how you'll use Hyeve to personalize your experience.</p>

            <hr className="divider" />

            <div className="role-group" role="radiogroup" aria-label="How do you want to use Hyeve?">
              {ROLES.map((item, index) => (
                <button
                  key={item.value}
                  id={`role-${item.value}`}
                  type="button"
                  className={`role-card${role === item.value ? " is-selected" : ""}`}
                  role="radio"
                  aria-checked={role === item.value}
                  tabIndex={role === item.value || (!role && index === 0) ? 0 : -1}
                  disabled={submitting}
                  onClick={() => setRole(item.value)}
                  onKeyDown={onKeyDown(index)}
                >
                  <span className="role-icon" aria-hidden="true">
                    <RoleUserIcon />
                  </span>
                  <span className="role-text">
                    <p className="role-title">{item.title}</p>
                    <p className="role-desc">{item.text}</p>
                  </span>
                </button>
              ))}
            </div>

            <button type="button" className="btn-primary" id="continue-btn" disabled={!role || submitting} onClick={submit}>
              {submitting && <span className="spinner" aria-hidden="true" />}
              <span>{submitting ? "Setting up…" : selected ? `Continue as ${selected.name}` : "Continue"}</span>
            </button>
            <p className="sr-only" role="status" aria-live="polite">
              {announce}
            </p>
          </div>
        </div>
      </main>
      <Toast />
    </div>
  );
}
