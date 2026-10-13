import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchIcon } from "../../components/Icons.jsx";
import Spinner from "../../components/Spinner.jsx";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { useMode } from "../../layout/ModeContext.jsx";
import { lookupProfile } from "../../api/lookup.js";

export default function Search() {
  const mode = useMode();
  useDocumentTitle(`${mode.heading} — Hyeve`);
  const navigate = useNavigate();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("idle");

  const submit = async (event) => {
    event.preventDefault();
    const value = query.trim();
    if (value.length < 3) {
      setError(`Enter a ${mode.noun}'s email or Trust ID to continue.`);
      return;
    }
    setError("");
    setPhase("searching");
    try {
      const profile = await lookupProfile(mode.key, value);
      navigate(`${mode.base}/${mode.profilePath}/${profile.id}`, { state: { profile } });
    } catch (failure) {
      if (failure.status === 404) {
        setPhase("notfound");
        return;
      }
      toast.show(failure.message);
      setPhase("idle");
    }
  };

  const reset = () => {
    setQuery("");
    setPhase("idle");
  };

  if (phase === "searching") {
    return (
      <div className="hv-search-page">
        <div className="hv-search-card hv-search-status" aria-live="polite">
          <Spinner dark />
          <h2 className="hv-search-status-title">Finding {mode.noun} records</h2>
          <p className="hv-search-subtext">Checking the Hyeve database for a matching profile.</p>
        </div>
      </div>
    );
  }

  if (phase === "notfound") {
    return (
      <div className="hv-search-page">
        <div className="hv-search-card hv-search-status">
          <span className="hv-lookup-badge">Not found</span>
          <h2 className="hv-search-status-title">Record Not Found</h2>
          <p className="hv-search-subtext">
            We couldn't find a {mode.noun} with that email or Trust ID. They may not have completed the Hyeve assessment
            yet, or the details may have a typo.
          </p>
          <button type="button" className="hv-btn hv-btn-primary hv-btn-block" onClick={reset}>
            Try another search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hv-search-page">
      <div className="hv-search-card">
        <span className="hv-lookup-badge">{mode.badge}</span>
        <h1 className="hv-search-heading">{mode.heading}</h1>
        <p className="hv-search-subtext">{mode.subtext}</p>
        <form onSubmit={submit} noValidate>
          <div className={`hv-search-field${error ? " is-invalid" : ""}`}>
            <label className="hv-sr-only" htmlFor="hv-lookup-input">
              {mode.label} email or Trust ID
            </label>
            <div className="hv-search-input-wrap">
              <span className="hv-search-icon">
                <SearchIcon width={18} height={18} />
              </span>
              <input
                id="hv-lookup-input"
                type="text"
                autoComplete="off"
                placeholder={mode.placeholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            {error && <p className="hv-error">{error}</p>}
          </div>
          <p className="hv-search-terms">
            By continuing, I accept the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>
          </p>
          <button type="submit" className="hv-btn hv-btn-primary hv-btn-block">
            Search Profile
          </button>
        </form>
      </div>
    </div>
  );
}
