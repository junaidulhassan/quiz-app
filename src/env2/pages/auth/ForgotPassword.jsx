import { useState } from "react";
import { Link } from "react-router-dom";
import { LockIcon } from "../../components/AuthIcons.jsx";
import { Field, SubmitButton } from "../../components/AuthFields.jsx";
import Toast from "../../components/Toast.jsx";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useToast from "../../hooks/useToast.js";
import { forgotPassword } from "../../api/auth.js";
import { isEmail } from "../../utils/format.js";
import "../../styles/pages/forgot-password.css";

export default function ForgotPassword() {
  useDocumentTitle("Forgot Password — Hyeve");
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const change = (event) => {
    const value = event.target.value;
    setEmail(value);
    if (invalid && isEmail(value)) setInvalid(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (!isEmail(email)) {
      setInvalid(true);
      return;
    }
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      toast.show("Check your email for a password reset link.");
    } catch (failure) {
      toast.show(
        failure.status === 429 ? "Please wait before requesting another reset link." : failure.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pg-forgot-password">
      <main className="auth-page">
        <div className="auth-card">
          <div className="icon-box" aria-hidden="true">
            <LockIcon />
          </div>

          <h1 className="heading">Reset your password</h1>
          <p className="subtext">We’ll send a secure reset link to your account email.</p>

          <form onSubmit={submit} noValidate>
            <Field htmlFor="email" label="Email address" invalid={invalid} error="Please enter a valid email address">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                autoComplete="email"
                value={email}
                onChange={change}
                onBlur={() => setInvalid(!isEmail(email))}
                required
              />
            </Field>

            <SubmitButton busy={submitting} idle="Send reset link" working={"Sending…"} id="submit-btn" />
          </form>

          <p className="back-link-wrap">
            <Link to="/login" className="back-link">
              {" "}
              Back to Login
            </Link>
          </p>
        </div>
      </main>
      <Toast />
    </div>
  );
}
