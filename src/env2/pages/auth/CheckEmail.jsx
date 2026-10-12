import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthShell from "../../components/AuthShell.jsx";
import { MailIcon } from "../../components/Icons.jsx";
import useToast from "../../hooks/useToast.js";
import useCooldown from "../../hooks/useCooldown.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { forgotPassword, resendVerification } from "../../api/auth.js";
import { formatCooldown } from "../../utils/format.js";

export default function CheckEmail() {
  useDocumentTitle("Check your email — Hyeve");
  const [params] = useSearchParams();
  const email = params.get("email") || "";
  const isReset = params.get("type") === "reset";
  const toast = useToast();
  const [seconds, startCooldown] = useCooldown();
  const [sending, setSending] = useState(false);

  const resend = async () => {
    if (!email || sending || seconds > 0) return;
    setSending(true);
    try {
      await (isReset ? forgotPassword(email) : resendVerification(email));
      toast.show("Email sent. Check your inbox.");
      startCooldown(60);
    } catch (error) {
      if (error.status === 429 && error.data?.retry_after) startCooldown(error.data.retry_after);
      toast.show(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthShell backTo="/login" backLabel="Back to login">
      <div className="hv-icon-badge">
        <MailIcon width={26} height={26} />
      </div>
      <h1 className="hv-heading">Check your email</h1>
      <p className="hv-subtext">
        {isReset ? "If an account exists for " : "We sent a verification link to "}
        <strong>{email || "your email address"}</strong>
        {isReset ? ", a reset link is on its way." : ". Open it to activate your account."}
      </p>
      <p className="hv-subtext">
        Didn't get it?{" "}
        <button type="button" className="hv-link-button" onClick={resend} disabled={sending || seconds > 0}>
          {seconds > 0 ? `Resend email (${formatCooldown(seconds)})` : "resend email"}
        </button>
      </p>
      <p className="hv-bottom-text">
        <Link to="/login">Back to login</Link>
      </p>
    </AuthShell>
  );
}
