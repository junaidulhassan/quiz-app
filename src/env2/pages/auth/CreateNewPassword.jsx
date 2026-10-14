import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PasswordLockIcon } from "../../components/AuthIcons.jsx";
import { Field, PasswordInput, SubmitButton } from "../../components/AuthFields.jsx";
import Toast from "../../components/Toast.jsx";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useToast from "../../hooks/useToast.js";
import { resetPassword } from "../../api/auth.js";
import { passwordProblem } from "../../utils/format.js";
import "../../styles/pages/new-password.css";

export default function CreateNewPassword() {
  useDocumentTitle("Create new password — Hyeve");
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [invalid, setInvalid] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validators = {
    password: (value) => !passwordProblem(value),
    confirm: (value) => value === form.password && value.length > 0,
  };

  const update = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    if (invalid[field] && field === "password" && !passwordProblem(value)) setInvalid((current) => ({ ...current, password: false }));
    if (invalid[field] && field === "confirm" && value === form.password) setInvalid((current) => ({ ...current, confirm: false }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const next = { password: !validators.password(form.password), confirm: !validators.confirm(form.confirm) };
    setInvalid(next);
    if (next.password || next.confirm) return;
    if (!token) {
      toast.show("This password reset link is invalid.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, form.password);
      toast.show("Your password has been reset successfully.", { duration: 3000 });
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (error) {
      toast.show(error.status === 429 ? "Please wait before trying again." : error.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="pg-new-password">
      <main className="auth-page">
        <div className="auth-card">
          <div className="icon-box" aria-hidden="true">
            <PasswordLockIcon />
          </div>

          <h1 className="heading">Create New password</h1>
          <p className="subtext">Enter a strong, secure password that you can easily remember.</p>

          <form onSubmit={submit} noValidate>
            <Field
              htmlFor="password"
              label="Create Password"
              invalid={invalid.password}
              error={passwordProblem(form.password) || "Password must be at least 8 characters"}
              hint="Must be at least 8 characters"
            >
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                value={form.password}
                onChange={update("password")}
                onBlur={() => setInvalid((current) => ({ ...current, password: !validators.password(form.password) }))}
                disabled={submitting}
                required
              />
            </Field>

            <Field htmlFor="password-confirm" label="Retype Password" invalid={invalid.confirm} error="Passwords do not match">
              <PasswordInput
                id="password-confirm"
                name="passwordConfirm"
                autoComplete="new-password"
                value={form.confirm}
                onChange={update("confirm")}
                onBlur={() => setInvalid((current) => ({ ...current, confirm: !validators.confirm(form.confirm) }))}
                disabled={submitting}
                required
              />
            </Field>

            <SubmitButton busy={submitting} idle="Confirm password" working={"Updating password…"} id="submit-btn" />
          </form>
        </div>
      </main>
      <Toast />
    </div>
  );
}
