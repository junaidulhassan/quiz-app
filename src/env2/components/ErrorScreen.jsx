import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ERROR_STATES, STATUS_MESSAGES } from "../utils/errorStates.js";
import { ErrorStateIcon } from "./AuthIcons.jsx";
import "../styles/pages/error.css";

export default function ErrorScreen({ type = "generic" }) {
  const navigate = useNavigate();
  const [override, setOverride] = useState(null);
  const [status, setStatus] = useState(() => (type === "offline" && navigator.onLine ? STATUS_MESSAGES.backOnline : ""));
  const [retrying, setRetrying] = useState(false);
  const key = override ?? type;
  const state = ERROR_STATES[key];

  useEffect(() => {
    document.title = `Hyeve | ${state.title}`;
  }, [state.title]);

  useEffect(() => {
    const onOffline = () => {
      setOverride("offline");
      setStatus(STATUS_MESSAGES.connectionLost);
    };
    const onOnline = () => {
      setStatus((current) => (current === STATUS_MESSAGES.connectionLost ? STATUS_MESSAGES.backOnline : current));
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const goBack = () => {
    if (window.history.length <= 1) {
      navigate("/", { replace: true });
      return;
    }
    navigate(-1);
  };

  const retry = () => {
    if (!navigator.onLine) {
      setOverride("offline");
      setStatus(STATUS_MESSAGES.stillOffline);
      return;
    }
    setRetrying(true);
    window.setTimeout(() => window.location.reload(), 250);
  };

  const run = state.primary.action === "back" ? goBack : retry;

  return (
    <div className="pg-error">
      <main className="error-page">
        <div className="error-wrap">
          <div className="brand-mark" aria-hidden="true">
            <img src="/logo/hyeve-new-logo.png" alt="" width="58" height="58" />
          </div>
          <section className="error-card" aria-labelledby="error-title">
            <div className="error-icon" role="img" aria-label={state.iconLabel}>
              <ErrorStateIcon name={state.icon} />
            </div>
            <h1 className="error-title" id="error-title">
              {state.title}
            </h1>
            <p className="error-message">{state.message}</p>
            <div className="error-actions">
              <button type="button" className="btn btn-primary" onClick={run} disabled={retrying} aria-busy={retrying}>
                {retrying && <span className="spinner" aria-hidden="true" />}
                {state.primary.label}
              </button>
              <Link className="btn btn-secondary" to="/">
                Back to Home
              </Link>
            </div>
            <p className="error-status" role="status">
              {status}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
