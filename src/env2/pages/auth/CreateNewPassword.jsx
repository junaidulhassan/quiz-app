import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../../components/AuthShell.jsx";
import Spinner from "../../components/Spinner.jsx";
import { PasswordField } from "../../components/TextField.jsx";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { resetPassword } from "../../api/auth.js";
import { passwordProblem } from "../../utils/format.js";

export default function CreateNewPassword() {
  useDocumentTitle("Create new password — Hyeve");
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const problem = passwordProblem(form.password);
    if (problem) nextErrors.password = problem;
    if (form.confirm !== form.password) nextErrors.confirm = "Passwords do not match.";
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await resetPassword(token, form.password);
      toast.show("Password updated. Log in with your new password.");
      navigate("/login", { replace: true });
    } catch (error) {
      setFormError(error.message);
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthShell>
        <h1 className="hv-heading">Link not valid</h1>
        <p className="hv-subtext">This reset link is invalid or has expired.</p>
        <Link to="/forgot-password" className="hv-btn hv-btn-primary hv-btn-block">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell backTo="/login" backLabel="Back to login">
      <h1 className="hv-heading">Create new password</h1>
      <p className="hv-subtext">Choose a strong password you haven't used before.</p>
      <form onSubmit={submit} noValidate>
        <PasswordField
          label="New password"
          value={form.password}
          onChange={update("password")}
          placeholder="Create password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          error={errors.password}
          required
        />
        <PasswordField
          label="Confirm password"
          value={form.confirm}
          onChange={update("confirm")}
          placeholder="Repeat password"
          autoComplete="new-password"
          error={errors.confirm}
          required
        />
        {formError && (
          <p className="hv-form-error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="hv-btn hv-btn-primary hv-btn-block" disabled={submitting}>
          {submitting && <Spinner />}
          {submitting ? "Saving…" : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
