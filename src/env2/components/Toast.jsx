import { useContext } from "react";
import { Link } from "react-router-dom";
import { ToastStateContext } from "../context/toastContext.js";

function SuccessIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#22c55e" />
      <path d="M6 10.2L8.6 12.8L14 7.4" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Toast() {
  const toast = useContext(ToastStateContext);
  return (
    <div className={`toast${toast.visible ? " is-visible" : ""}`} role="status" aria-live="polite">
      {toast.icon === "success" && (
        <span className="toast-icon is-visible" aria-hidden="true">
          <SuccessIcon />
        </span>
      )}
      <p className="toast-message">{toast.message}</p>
      {toast.action && (
        <Link to={toast.action.to} className="toast-action">
          {toast.action.label}
        </Link>
      )}
      <button type="button" className="toast-close" onClick={toast.hide} aria-label="Dismiss notification">
        &times;
      </button>
    </div>
  );
}
