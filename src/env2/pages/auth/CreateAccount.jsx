import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BackArrowIcon } from "../../components/AuthIcons.jsx";
import { Field, PasswordInput, SubmitButton } from "../../components/AuthFields.jsx";
import Toast from "../../components/Toast.jsx";
import useAuth from "../../hooks/useAuth.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useToast from "../../hooks/useToast.js";
import { signup } from "../../api/auth.js";
import { SIGNUP_PREFILL_KEY } from "../../api/client.js";
import { isEmail, passwordProblem } from "../../utils/format.js";
import "../../styles/pages/create-account.css";

function readPrefill() {
  try {
    const value = JSON.parse(sessionStorage.getItem(SIGNUP_PREFILL_KEY) || "null");
    if (!value) return {};
    return {
      full_name: typeof value.name === "string" ? value.name : "",
      email: typeof value.email === "string" ? value.email : "",
    };
  } catch {
    return {};
  }
}

function clearPrefill() {
  try {
    sessionStorage.removeItem(SIGNUP_PREFILL_KEY);
  } catch {
    return;
  }
}

const validators = {
  full_name: (value) => value.trim().length > 0,
  email: (value) => isEmail(value),
  password: (value) => !passwordProblem(value),
};

export default function CreateAccount() {
  useDocumentTitle("Create Account — Hyeve");
  const { startSession } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(() => ({ full_name: "", email: "", password: "", ...readPrefill() }));
  const [invalid, setInvalid] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    if (invalid[field] && validators[field](value)) setInvalid((current) => ({ ...current, [field]: false }));
  };

  const blur = (field) => () => setInvalid((current) => ({ ...current, [field]: !validators[field](form[field]) }));

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const next = Object.fromEntries(Object.keys(validators).map((field) => [field, !validators[field](form[field])]));
    setInvalid(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      const result = await signup({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      clearPrefill();
      if (result.verification_required) {
        navigate(`/check-email?email=${encodeURIComponent(result.email)}`, { replace: true });
        return;
      }
      startSession(result);
      navigate(result.destination, { replace: true });
    } catch (error) {
      toast.show(error.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="pg-create-account">
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

            <h1 className="heading">Create Account</h1>
            <p className="subtext">
              By continuing, you agree to the <Link to="/terms">Hyeve TOS</Link> and <Link to="/privacy">Privacy Policy</Link>.
            </p>

            <form onSubmit={submit} noValidate>
              <Field htmlFor="fullname" label="Full name" invalid={invalid.full_name} error="Please enter your full name">
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  placeholder="John Doe"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={update("full_name")}
                  onBlur={blur("full_name")}
                  disabled={submitting}
                  required
                />
              </Field>

              <Field htmlFor="email" label="Email address" invalid={invalid.email} error="Please enter a valid email address">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={form.email}
                  onChange={update("email")}
                  onBlur={blur("email")}
                  disabled={submitting}
                  required
                />
              </Field>

              <Field
                htmlFor="password"
                label="Password"
                invalid={invalid.password}
                error={passwordProblem(form.password) || "Password must be at least 8 characters"}
                hint="Must be at least 8 characters"
              >
                <PasswordInput
                  size={16}
                  id="password"
                  name="password"
                  placeholder="Create password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update("password")}
                  onBlur={blur("password")}
                  disabled={submitting}
                  required
                />
              </Field>

              <SubmitButton busy={submitting} idle="Create account" working={"Creating account…"} />
            </form>

            <p className="login-text">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </main>
      <Toast />
    </div>
  );
}
