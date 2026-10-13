import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../api/auth.js";
import useAuth from "../hooks/useAuth.js";
import { googleEnabled } from "../config/google.js";
import GoogleButton from "./GoogleButton.jsx";

export default function GoogleAuth({ text }) {
  const { startSession } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({ busy: false, error: "" });

  const handleCredential = useCallback(
    async (credential) => {
      setState({ busy: true, error: "" });
      try {
        const payload = await googleLogin(credential);
        startSession(payload);
        navigate(payload.destination, { replace: true });
      } catch (error) {
        setState({ busy: false, error: error.message });
      }
    },
    [startSession, navigate]
  );

  const handleError = useCallback((message) => setState({ busy: false, error: message }), []);

  if (!googleEnabled) return null;

  return (
    <div className="hv-google-section">
      <GoogleButton onCredential={handleCredential} onError={handleError} text={text} />
      {state.busy && <p className="hv-google-status">Signing you in…</p>}
      {state.error && (
        <p className="hv-form-error" role="alert">
          {state.error}
        </p>
      )}
      <div className="hv-divider">
        <span>or</span>
      </div>
    </div>
  );
}
