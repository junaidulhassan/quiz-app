import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import "./login.css";
import API_BASE_URL from "./api";
import { getSession, saveSession } from "./session";

const MIN_PASSWORD_LENGTH = 8;
// Mirrors the backend's SPECIAL_CHARS in app/schemas.py — keep these in sync.
const SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:'\",.<>/?~`\\";

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** The same rules as the backend, each tagged with whether `pw` currently satisfies it —
 * powers both the live checklist under the field and the submit-time error message. */
function passwordRequirements(pw) {
  return [
    { key: "length", label: `At least ${MIN_PASSWORD_LENGTH} characters`, met: pw.length >= MIN_PASSWORD_LENGTH },
    { key: "lower", label: "One lowercase letter", met: /[a-z]/.test(pw) },
    { key: "upper", label: "One uppercase letter", met: /[A-Z]/.test(pw) },
    { key: "special", label: "One special character (e.g. ! @ # $ % & *)", met: [...pw].some((c) => SPECIAL_CHARS.includes(c)) },
  ];
}

function validateNewPassword(pw) {
  if (pw.trim() !== pw) return "New password must not start or end with a space";
  const missing = passwordRequirements(pw).filter((r) => !r.met).map((r) => r.label);
  if (missing.length) return "New password needs " + missing.join(", ") + ".";
  return "";
}

/** POST JSON to the API. Returns { ok, status, data } and never throws on HTTP errors. */
async function postJSON(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [cpUsername, setCpUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState(location.state?.message || "");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Server-side lockout after repeated failures: disable the form and count down.
  const [lockedUntil, setLockedUntil] = useState(null);
  const [lockSecondsLeft, setLockSecondsLeft] = useState(0);
  const locked = lockSecondsLeft > 0;

  useEffect(() => {
    if (!lockedUntil) return undefined;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setLockSecondsLeft(left);
      if (left === 0) {
        setLockedUntil(null);
        setError("");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  if (getSession()) {
    return <Navigate to="/dashboard" replace />;
  }

  function switchMode(next) {
    setMode(next);
    if (!locked) setError("");
    setSuccess("");
  }

  /** Shared handling for 401/429 from login and change-password. Returns the message to show. */
  function handleAuthFailure({ status, data }, fallback) {
    if (status === 429) {
      const seconds = Number(data.retry_after) || 300;
      setLockedUntil(Date.now() + seconds * 1000);
      setLockSecondsLeft(seconds);
      return "Too many failed attempts. Login is temporarily locked.";
    }
    return (typeof data.detail === "string" && data.detail) || fallback;
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (locked || submitting) return;
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password");
      return;
    }

    setSubmitting(true);
    try {
      const result = await postJSON("/auth/login", { username: username.trim(), password });
      if (!result.ok) {
        setPassword("");
        setError(handleAuthFailure(result, "Invalid username or password"));
        return;
      }
      saveSession(result.data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (locked || submitting) return;
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
    if (newPassword === oldPassword) {
      setError("New password must be different from the current password");
      return;
    }
    const pwError = validateNewPassword(newPassword);
    if (pwError) {
      setError(pwError);
      return;
    }

    setSubmitting(true);
    try {
      const result = await postJSON("/auth/change-password", {
        username: cpUsername.trim(),
        old_password: oldPassword,
        new_password: newPassword,
      });
      if (!result.ok) {
        setOldPassword("");
        setError(handleAuthFailure(result, "Could not change password"));
        return;
      }

      setSuccess("Password changed successfully. You can now log in.");
      setUsername(cpUsername.trim());
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

  const lockNotice = locked && (
    <div className="login-lock" role="status" aria-live="polite">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      <div>
        <div className="login-lock-title">Too many failed attempts</div>
        <div className="login-lock-sub">
          For security, login is locked. Try again in <strong>{formatCountdown(lockSecondsLeft)}</strong>.
        </div>
      </div>
    </div>
  );

  const errorBox = !locked && (
    <div className={"login-error" + (error ? " visible" : "")} role="alert">{error}</div>
  );

  return (
    <div className="login-body">
      <div className="login-card">
        {mode === "login" ? (
          <>
            <div className="login-heading">Log in</div>
            <div className="login-subtext">Enter your credentials to access the dashboard.</div>

            <form onSubmit={handleLogin} noValidate>
              <fieldset className="login-fieldset" disabled={locked || submitting}>
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
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={50}
                    autoFocus
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
                    maxLength={128}
                  />
                </div>
              </fieldset>

              {lockNotice}
              {errorBox}
              <div className={"login-success" + (success ? " visible" : "")} role="status">{success}</div>

              <button className="login-submit" type="submit" disabled={submitting || locked}>
                {locked ? `Locked · ${formatCountdown(lockSecondsLeft)}` : submitting ? "Logging in…" : "Log in"}
              </button>
            </form>

            <div className="login-toggle-row">
              <button type="button" className="login-toggle-btn" onClick={() => switchMode("change-password")}>
                Change password
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="login-heading">Change password</div>
            <div className="login-subtext">
              Enter your username, current password, and a new password meeting the requirements below.
            </div>

            <form onSubmit={handleChangePassword} noValidate>
              <fieldset className="login-fieldset" disabled={locked || submitting}>
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
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={50}
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
                    maxLength={128}
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
                    maxLength={72}
                    aria-describedby="cp-password-requirements"
                  />
                  {newPassword.length > 0 && (
                    <ul id="cp-password-requirements" className="password-checklist" aria-live="polite">
                      {passwordRequirements(newPassword).map((r) => (
                        <li key={r.key} className={r.met ? "met" : ""}>
                          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                            {r.met ? (
                              <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            ) : (
                              <circle cx="8" cy="8" r="3" fill="currentColor" />
                            )}
                          </svg>
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  )}
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
                    maxLength={72}
                  />
                </div>
              </fieldset>

              {lockNotice}
              {errorBox}
              <div className={"login-success" + (success ? " visible" : "")} role="status">{success}</div>

              <button className="login-submit" type="submit" disabled={submitting || locked}>
                {locked ? `Locked · ${formatCountdown(lockSecondsLeft)}` : submitting ? "Changing…" : "Change password"}
              </button>
            </form>

            <div className="login-toggle-row">
              <button type="button" className="login-toggle-btn" onClick={() => switchMode("login")}>
                Back to log in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
