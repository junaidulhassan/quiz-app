import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../../components/AuthShell.jsx";
import Spinner from "../../components/Spinner.jsx";
import { TextField } from "../../components/TextField.jsx";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { forgotPassword } from "../../api/auth.js";
import { isEmail } from "../../utils/format.js";

export default function ForgotPassword() {
  useDocumentTitle("Forgot Password — Hyeve");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      navigate(`/check-email?type=reset&email=${encodeURIComponent(email.trim())}`);
    } catch (failure) {
      setFormError(failure.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell backTo="/login" backLabel="Back to login">
      <h1 className="hv-heading">Forgot password?</h1>
      <p className="hv-subtext">Enter your email and we'll send you a link to create a new password.</p>
      <form onSubmit={submit} noValidate>
        <TextField
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          error={error}
          required
        />
        {formError && (
          <p className="hv-form-error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="hv-btn hv-btn-primary hv-btn-block" disabled={submitting}>
          {submitting && <Spinner />}
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
