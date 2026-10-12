import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthShell from "../../components/AuthShell.jsx";
import { AlertIcon, CheckIcon } from "../../components/Icons.jsx";
import Spinner from "../../components/Spinner.jsx";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { verifyEmail } from "../../api/auth.js";

export default function VerifyEmail() {
  useDocumentTitle("Verify email — Hyeve");
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState(token ? { status: "pending" } : { status: "failed", message: "This verification link is invalid." });

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    verifyEmail(token)
      .then(() => active && setState({ status: "verified" }))
      .catch((error) => active && setState({ status: "failed", message: error.message }));
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthShell>
      {state.status === "pending" && (
        <>
          <div className="hv-icon-badge">
            <Spinner dark />
          </div>
          <h1 className="hv-heading">Verifying your email…</h1>
        </>
      )}
      {state.status === "verified" && (
        <>
          <div className="hv-icon-badge is-success">
            <CheckIcon width={26} height={26} />
          </div>
          <h1 className="hv-heading">Email verified</h1>
          <p className="hv-subtext">Your account is ready. Log in to continue.</p>
          <Link to="/login" className="hv-btn hv-btn-primary hv-btn-block">
            Continue to login
          </Link>
        </>
      )}
      {state.status === "failed" && (
        <>
          <div className="hv-icon-badge is-danger">
            <AlertIcon width={26} height={26} />
          </div>
          <h1 className="hv-heading">Link not valid</h1>
          <p className="hv-subtext">{state.message}</p>
          <Link to="/login" className="hv-btn hv-btn-primary hv-btn-block">
            Back to login
          </Link>
        </>
      )}
    </AuthShell>
  );
}
