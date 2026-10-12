import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "./Icons.jsx";

export function TextField({ label, error, hint, optional, required, className = "", ...inputProps }) {
  const id = useId();
  return (
    <div className={`hv-field${error ? " is-invalid" : ""} ${className}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="hv-req">*</span>}
        {optional && <span className="hv-optional">(Optional)</span>}
      </label>
      <input id={id} aria-invalid={Boolean(error)} {...inputProps} />
      {hint && !error && <p className="hv-hint">{hint}</p>}
      {error && <p className="hv-error">{error}</p>}
    </div>
  );
}

export function PasswordField({ label, error, hint, required, ...inputProps }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className={`hv-field${error ? " is-invalid" : ""}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="hv-req">*</span>}
      </label>
      <div className="hv-password-wrap">
        <input id={id} type={visible ? "text" : "password"} aria-invalid={Boolean(error)} {...inputProps} />
        <button
          type="button"
          className="hv-toggle-password"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
        </button>
      </div>
      {hint && !error && <p className="hv-hint">{hint}</p>}
      {error && <p className="hv-error">{error}</p>}
    </div>
  );
}

export function SelectField({ label, error, required, children, className = "", ...selectProps }) {
  const id = useId();
  return (
    <div className={`hv-field${error ? " is-invalid" : ""} ${className}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="hv-req">*</span>}
      </label>
      <select id={id} aria-invalid={Boolean(error)} {...selectProps}>
        {children}
      </select>
      {error && <p className="hv-error">{error}</p>}
    </div>
  );
}
