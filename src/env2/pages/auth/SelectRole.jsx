import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../../components/AuthShell.jsx";
import Spinner from "../../components/Spinner.jsx";
import useAuth from "../../hooks/useAuth.js";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { chooseRole } from "../../api/auth.js";

const ROLES = [
  { value: "property_manager", title: "As a Property Manager", text: "I manage properties for myself or others" },
  { value: "tenant", title: "As a Tenant", text: "I currently rent or have rented in the past" },
];

export default function SelectRole() {
  useDocumentTitle("Choose your role — Hyeve");
  const { account, applyPayload } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [role, setRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (account.role && account.onboarding_complete) {
    return <Navigate to={account.role === "tenant" ? "/roommate/search" : "/landlord/search"} replace />;
  }

  const onKeyDown = (event) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const index = ROLES.findIndex((item) => item.value === role);
    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    setRole(ROLES[(index + step + ROLES.length) % ROLES.length].value);
  };

  const submit = async () => {
    if (!role || submitting) return;
    setSubmitting(true);
    try {
      const payload = await chooseRole(role);
      applyPayload(payload);
      sessionStorage.setItem("hyeve_show_welcome_toast", "1");
      navigate(payload.destination, { replace: true });
    } catch (error) {
      toast.show(error.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell progress={{ step: 1, total: 2 }}>
      <h1 className="hv-heading">How do you want to use Hyeve?</h1>
      <p className="hv-subtext">Pick the option that fits you best. You can still use every lookup afterwards.</p>
      <div className="hv-role-group" role="radiogroup" aria-label="Choose your role" onKeyDown={onKeyDown}>
        {ROLES.map((item) => (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={role === item.value}
            tabIndex={role === item.value || (!role && item.value === ROLES[0].value) ? 0 : -1}
            className={`hv-role-card${role === item.value ? " is-selected" : ""}`}
            onClick={() => setRole(item.value)}
          >
            <span className="hv-role-title">{item.title}</span>
            <span className="hv-role-text">{item.text}</span>
          </button>
        ))}
      </div>
      <button type="button" className="hv-btn hv-btn-primary hv-btn-block" disabled={!role || submitting} onClick={submit}>
        {submitting && <Spinner />}
        Continue
      </button>
    </AuthShell>
  );
}
