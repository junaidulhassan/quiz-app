import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { getSession, saveSession } from "../../session.js";
import { adminLogin } from "../api/adminApi.js";
import Spinner from "../components/Spinner.jsx";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (getSession()) return <Navigate to="/admin/overview" replace />;

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError("Enter your username and password.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      saveSession(await adminLogin(form.username.trim(), form.password));
      navigate(location.state?.from || "/admin/overview", { replace: true });
    } catch (failure) {
      setError(failure.message);
      setBusy(false);
    }
  };

  return (
    <main className="ad-login">
      <form className="ad-login-card" onSubmit={submit} noValidate>
        <img src="/logo/hyeve.png" alt="Hyeve" />
        <h1>Admin sign in</h1>
        <p>Use your Hyeve admin account to continue.</p>
        <label className="ad-field">
          <span>Username</span>
          <input value={form.username} onChange={set("username")} autoComplete="username" autoFocus />
        </label>
        <label className="ad-field">
          <span>Password</span>
          <input type="password" value={form.password} onChange={set("password")} autoComplete="current-password" />
        </label>
        {error && (
          <p className="ad-form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="ad-btn is-primary is-block" disabled={busy}>
          {busy && <Spinner light />}
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
