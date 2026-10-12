import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/AuthShell.jsx";
import Spinner from "../../components/Spinner.jsx";
import { PasswordField, TextField } from "../../components/TextField.jsx";
import useAuth from "../../hooks/useAuth.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { signup } from "../../api/auth.js";
import { isEmail, passwordProblem } from "../../utils/format.js";

export default function CreateAccount() {
  useDocumentTitle("Create Account — Hyeve");
  const { startSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.full_name.trim()) nextErrors.full_name = "Enter your full name.";
    if (!isEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    const problem = passwordProblem(form.password);
    if (problem) nextErrors.password = problem;
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const result = await signup({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      if (result.verification_required) {
        navigate(`/check-email?email=${encodeURIComponent(result.email)}`, { replace: true });
        return;
      }
      startSession(result);
      navigate(result.destination, { replace: true });
    } catch (error) {
      setFormError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell backTo="/take-assessment" backLabel="Back to home">
      <h1 className="hv-heading">Create Account</h1>
      <p className="hv-subtext">Set up your Hyeve account to get started.</p>
      <form onSubmit={submit} noValidate>
        <TextField
          label="Full name"
          value={form.full_name}
          onChange={update("full_name")}
          placeholder="John Doe"
          autoComplete="name"
          error={errors.full_name}
          required
        />
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
          placeholder="Create password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          error={errors.password}
          required
        />
        {formError && (
          <p className="hv-form-error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="hv-btn hv-btn-primary hv-btn-block" disabled={submitting}>
          {submitting && <Spinner />}
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="hv-bottom-text">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthShell>
  );
}
