import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import API_BASE_URL from "./api";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [cpUsername, setCpUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function switchMode(next) {
    setMode(next);
    setError("");
    setSuccess("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid username or password");
      }

      const data = await res.json();

      localStorage.setItem(
        "dashboard_session",
        JSON.stringify({
          token: data.token,
          user_id: data.user_id,
          username: data.username,
        })
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!cpUsername.trim() || !oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      const session = localStorage.getItem("dashboard_session");
      const token = session ? JSON.parse(session).token : null;

      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          username: cpUsername.trim(),
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Could not change password");
      }

      setSuccess("Password changed successfully. You can now log in.");
      setCpUsername("");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-body">
      <div className="login-card">
        {mode === "login" ? (
          <>
            <div className="login-heading">Log in</div>
            <div className="login-subtext">Enter your credentials to access the dashboard.</div>

            <form onSubmit={handleLogin}>
              <div className="login-field">
                <label className="login-label" htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  className="login-input"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="login-field">
                <label className="login-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  className="login-input"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <div className={"login-error" + (error ? " visible" : "")}>{error}</div>

              <button className="login-submit" type="submit" disabled={submitting}>
                {submitting ? "Logging in…" : "Log in"}
              </button>
            </form>

            <div className="login-toggle-row">
              <button className="login-toggle-btn" onClick={() => switchMode("change-password")}>
                Change password
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="login-heading">Change password</div>
            <div className="login-subtext">Enter your username, current password, and a new password.</div>

            <form onSubmit={handleChangePassword}>
              <div className="login-field">
                <label className="login-label" htmlFor="cp-username">Username</label>
                <input
                  id="cp-username"
                  className="login-input"
                  type="text"
                  placeholder="Enter username"
                  value={cpUsername}
                  onChange={(e) => setCpUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="login-field">
                <label className="login-label" htmlFor="cp-old-password">Current password</label>
                <input
                  id="cp-old-password"
                  className="login-input"
                  type="password"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="login-field">
                <label className="login-label" htmlFor="cp-new-password">New password</label>
                <input
                  id="cp-new-password"
                  className="login-input"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="login-field">
                <label className="login-label" htmlFor="cp-confirm-password">Confirm new password</label>
                <input
                  id="cp-confirm-password"
                  className="login-input"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <div className={"login-error" + (error ? " visible" : "")}>{error}</div>
              <div className={"login-success" + (success ? " visible" : "")}>{success}</div>

              <button className="login-submit" type="submit" disabled={submitting}>
                {submitting ? "Changing…" : "Change password"}
              </button>
            </form>

            <div className="login-toggle-row">
              <button className="login-toggle-btn" onClick={() => switchMode("login")}>
                Back to log in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
