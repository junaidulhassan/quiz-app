import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../components/AuthShell.jsx";
import Spinner from "../../components/Spinner.jsx";
import { PasswordField, TextField } from "../../components/TextField.jsx";
import useAuth from "../../hooks/useAuth.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { isEmail } from "../../utils/format.js";

export default function Login() {
  useDocumentTitle("Login — Hyeve");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!isEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.password) nextErrors.password = "Enter your password.";
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const payload = await login({ email: form.email.trim(), password: form.password });
      const from = location.state?.from;
      navigate(from && payload.destination !== "/select-role" ? from : payload.destination, { replace: true });
    } catch (error) {
      if (error.data?.code === "email_not_verified") {
        navigate(`/check-email?email=${encodeURIComponent(form.email.trim())}`);
        return;
      }
      setFormError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell backTo="/take-assessment" backLabel="Back to home">
      <h1 className="hv-heading">Welcome Back</h1>
      <p className="hv-subtext">Log in to look up tenants and roommates.</p>
      <form onSubmit={submit} noValidate>
        <TextField
          label="Email address"
          type="email"
          value={form.email}
          onChange={update("email")}
          placeholder="Enter your email"
          autoComplete="email"
          error={errors.email}
          required
        />
        <PasswordField
          label="Password"
          value={form.password}
          onChange={update("password")}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
          required
        />
        <div className="hv-field-meta">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        {formError && (
          <p className="hv-form-error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="hv-btn hv-btn-primary hv-btn-block" disabled={submitting}>
          {submitting && <Spinner />}
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="hv-bottom-text">
        Don't have an account? <Link to="/create-account">Create one</Link>
      </p>
    </AuthShell>
  );
}
