import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BackArrowIcon } from "../../components/AuthIcons.jsx";
import { Field, PasswordInput, SubmitButton } from "../../components/AuthFields.jsx";
import GoogleSignIn from "../../components/GoogleSignIn.jsx";
import Toast from "../../components/Toast.jsx";
import useAuth from "../../hooks/useAuth.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useToast from "../../hooks/useToast.js";
import { isEmail } from "../../utils/format.js";
import "../../styles/pages/login.css";

export default function Login() {
  useDocumentTitle("Login — Hyeve");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [invalid, setInvalid] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validators = {
    email: (value) => isEmail(value),
    password: (value) => value.trim().length > 0,
  };

  const update = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    if (invalid[field] && validators[field](value)) setInvalid((current) => ({ ...current, [field]: false }));
  };

  const blur = (field) => () => setInvalid((current) => ({ ...current, [field]: !validators[field](form[field]) }));

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const next = { email: !validators.email(form.email), password: !validators.password(form.password) };
    setInvalid(next);
    if (next.email || next.password) return;

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
      toast.show(error.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="pg-login">
      <main className="auth-page">
        <div className="auth-wrap">
          <Link to="/" className="back-nav">
            <BackArrowIcon />
            Back to home
          </Link>

          <div className="auth-card">
            <div className="logo-mark" aria-hidden="true">
              <img src="/logo/hyeve-new-logo.png" alt="" width="58" height="58" />
            </div>

            <h1 className="heading">Welcome Back</h1>
            <p className="subtext">Enter your credentials to access the dashboard.</p>

            <GoogleSignIn />

            <div className="divider">
              <span>or</span>
            </div>

            <form onSubmit={submit} noValidate>
              <Field htmlFor="email" label="Email address" invalid={invalid.email} error="Please enter a valid email address">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter email"
                  autoComplete="email"
                  value={form.email}
                  onChange={update("email")}
                  onBlur={blur("email")}
                  disabled={submitting}
                  required
                />
              </Field>

              <Field htmlFor="password" label="Password" invalid={invalid.password} error="Please enter your password">
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={update("password")}
                  onBlur={blur("password")}
                  disabled={submitting}
                  required
                />
              </Field>

              <div className="field-meta">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <SubmitButton busy={submitting} idle="Login" working={"Signing you in…"} id="login-submit-btn" />
            </form>

            <p className="login-text">
              Don't have an account? <Link to="/create-account">Create one</Link>
            </p>
          </div>
        </div>
      </main>
      <Toast />
    </div>
  );
}
