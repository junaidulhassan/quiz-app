import { Link } from "react-router-dom";
import AuthShell from "../../components/AuthShell.jsx";
import { AlertIcon } from "../../components/Icons.jsx";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";

export default function NotFound() {
  useDocumentTitle("Page not found — Hyeve");
  return (
    <AuthShell>
      <div className="hv-icon-badge is-danger">
        <AlertIcon width={26} height={26} />
      </div>
      <p className="hv-error-code">404</p>
      <h1 className="hv-heading">We can't find that page</h1>
      <p className="hv-subtext">The link may be broken, or the page may have been moved.</p>
      <Link to="/login" className="hv-btn hv-btn-primary hv-btn-block">
        Go to login
      </Link>
      <p className="hv-bottom-text">
        <Link to="/take-assessment">Take the assessment</Link>
      </p>
    </AuthShell>
  );
}
