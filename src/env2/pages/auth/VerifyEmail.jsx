import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircleIcon } from "../../components/AuthIcons.jsx";
import ErrorScreen from "../../components/ErrorScreen.jsx";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { verifyEmail } from "../../api/auth.js";
import "../../styles/pages/check-email.css";

export default function VerifyEmail() {
  useDocumentTitle("Verify email — Hyeve");
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState(token ? { status: "pending" } : { status: "failed" });

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    verifyEmail(token)
      .then(() => active && setState({ status: "verified" }))
      .catch(() => active && setState({ status: "failed" }));
    return () => {
      active = false;
    };
  }, [token]);

  if (state.status === "failed") return <ErrorScreen type="generic" />;

  return (
    <div className="pg-check-email">
      <main className="auth-page">
        <div className="auth-card">
          <div className="icon-box" aria-hidden="true">
            {state.status === "pending" ? <span className="hv-spinner is-dark" /> : <CheckCircleIcon />}
          </div>
          <h1 className="heading">{state.status === "pending" ? "Verifying your email…" : "Email verified"}</h1>
          {state.status === "verified" && (
            <>
              <p className="subtext">Your account is ready. Log in to continue.</p>
              <Link to="/login" className="btn-secondary">
                Continue to Login
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
