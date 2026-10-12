import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "./Icons.jsx";

export default function AuthShell({ children, backTo, backLabel = "Back", wide = false, progress }) {
  return (
    <main className="hv-auth-page">
      <div className={`hv-auth-wrap${wide ? " is-wide" : ""}`}>
        {backTo && (
          <Link to={backTo} className="hv-back-nav">
            <ArrowLeftIcon width={16} height={16} />
            {backLabel}
          </Link>
        )}
        <div className="hv-auth-card">
          <div className="hv-logo-mark">
            <img src="/logo/hyeve.png" alt="Hyeve" />
          </div>
          {progress && (
            <div className="hv-progress" aria-label={`Step ${progress.step} of ${progress.total}`}>
              {Array.from({ length: progress.total }, (_, index) => (
                <span key={index} className={index < progress.step ? "is-filled" : ""} />
              ))}
            </div>
          )}
          {children}
        </div>
      </div>
    </main>
  );
}
