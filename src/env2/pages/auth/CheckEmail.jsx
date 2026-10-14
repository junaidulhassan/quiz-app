import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircleIcon } from "../../components/AuthIcons.jsx";
import Toast from "../../components/Toast.jsx";
import useCooldown from "../../hooks/useCooldown.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useToast from "../../hooks/useToast.js";
import { resendVerification } from "../../api/auth.js";
import { formatCooldown } from "../../utils/format.js";
import "../../styles/pages/check-email.css";

const RESEND_COOLDOWNS = [60, 300, 1800];

export default function CheckEmail() {
  useDocumentTitle("Check your email — Hyeve");
  const [params] = useSearchParams();
  const email = (params.get("email") || "").trim();
  const toast = useToast();
  const [seconds, startCooldown] = useCooldown();
  const [sending, setSending] = useState(false);
  const clicks = useRef(0);

  const resend = async () => {
    if (!email || sending || seconds > 0) return;
    setSending(true);
    try {
      await resendVerification(email);
      startCooldown(RESEND_COOLDOWNS[Math.min(clicks.current, RESEND_COOLDOWNS.length - 1)]);
      clicks.current += 1;
      toast.show("Verification email sent.");
    } catch (error) {
      if (error.status === 429) {
        startCooldown(error.data?.retry_after || RESEND_COOLDOWNS[Math.min(clicks.current, RESEND_COOLDOWNS.length - 1)]);
        clicks.current += 1;
        toast.show("Please wait before requesting another email.");
      } else {
        toast.show("Something went wrong. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pg-check-email">
      <main className="auth-page">
        <div className="auth-card">
          <div className="icon-box" aria-hidden="true">
            <CheckCircleIcon />
          </div>

          <h1 className="heading">Check your email</h1>
          <p className="subtext">
            We sent a verification link to <strong id="user-email">{email || "your email address"}</strong>. Click it to confirm your
            account, then you’ll be asked to choose your role.
          </p>

          <p className="resend-text" aria-live="polite">
            Didn't receive it? Check your spam folder or{" "}
            <button type="button" className="link-btn" id="resend-btn" onClick={resend} disabled={sending || seconds > 0}>
              {seconds > 0 ? `Resend email (${formatCooldown(seconds)})` : "resend email"}
            </button>
          </p>

          <Link to="/login" className="btn-secondary">
            Back to Login
          </Link>
        </div>
      </main>
      <Toast />
    </div>
  );
}
