import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../api/auth.js";
import useAuth from "../hooks/useAuth.js";
import useToast from "../hooks/useToast.js";
import { googleEnabled } from "../config/google.js";
import { GoogleIcon } from "./AuthIcons.jsx";
import GoogleButton from "./GoogleButton.jsx";

export default function GoogleSignIn() {
  const { startSession } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const handleCredential = useCallback(
    async (credential) => {
      setBusy(true);
      try {
        const payload = await googleLogin(credential);
        startSession(payload);
        navigate(payload.destination, { replace: true });
      } catch (error) {
        setBusy(false);
        toast.show(error.message);
      }
    },
    [startSession, navigate, toast]
  );

  const handleError = useCallback(
    (message) => {
      setBusy(false);
      toast.show(message);
    },
    [toast]
  );

  if (!googleEnabled) return null;

  return (
    <div className="hv-google-slot">
      <button type="button" className="btn-google" disabled={busy} tabIndex={-1} aria-hidden="true">
        {busy ? <span className="spinner" aria-hidden="true" /> : <GoogleIcon />}
        <span>{busy ? "Signing you in…" : "Continue with Google"}</span>
      </button>
      {!busy && <GoogleButton className="hv-google-overlay" onCredential={handleCredential} onError={handleError} />}
    </div>
  );
}
