import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "../../components/Icons.jsx";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { LEGAL } from "../../config/company.js";

export function Section({ title, children }) {
  return (
    <section className="hv-policy-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function PolicyLayout({ title, intro, children }) {
  useDocumentTitle(`${title} — Hyeve`);
  return (
    <main className="hv-policy-page">
      <article className="hv-policy-card">
        <Link to="/take-assessment" className="hv-back-nav">
          <ArrowLeftIcon width={16} height={16} />
          Back to Hyeve
        </Link>
        <div className="hv-logo-mark is-left">
          <img src="/logo/hyeve.png" alt="Hyeve" />
        </div>
        <h1>{title}</h1>
        <p className="hv-policy-updated">Last updated: {LEGAL.updated}</p>
        {intro && <p className="hv-policy-intro">{intro}</p>}
        {children}
        <nav className="hv-policy-links" aria-label="Legal pages">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </nav>
      </article>
    </main>
  );
}
