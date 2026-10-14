import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./AuthIcons.jsx";

export function Field({ htmlFor, label, required = true, invalid = false, error, hint, children }) {
  return (
    <div className={`field${invalid ? " invalid" : ""}`}>
      <label htmlFor={htmlFor}>
        {label}
        {required && (
          <>
            {" "}
            <span className="req">*</span>
          </>
        )}
      </label>
      {children}
      <span className="error-msg">{error}</span>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function PasswordInput({ size = 18, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-wrap">
      <input type={visible ? "text" : "password"} {...inputProps} />
      <button
        type="button"
        className="toggle-password"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        <EyeIcon size={size} className={`icon-eye${visible ? " is-hidden" : ""}`} />
        <EyeOffIcon size={size} className={`icon-eye-off${visible ? "" : " is-hidden"}`} />
      </button>
    </div>
  );
}

export function SubmitButton({ busy, idle, working, id, disabled = false }) {
  return (
    <button type="submit" className="btn-primary" id={id} disabled={busy || disabled}>
      {busy && <span className="spinner" aria-hidden="true" />}
      <span>{busy ? working : idle}</span>
    </button>
  );
}
