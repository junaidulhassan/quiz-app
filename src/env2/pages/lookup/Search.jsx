import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/lookup/ConfirmModal.jsx";
import { AlertIcon, CheckIcon, CopyIcon, SearchIcon, ShareIcon } from "../../components/lookup/SearchIcons.jsx";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useInsightsCount from "../../hooks/useInsightsCount.js";
import useToast from "../../hooks/useToast.js";
import { useMode } from "../../layout/ModeContext.jsx";
import { lookupProfile } from "../../api/lookup.js";
import { compactCount } from "../../utils/format.js";

const STAGE_DURATIONS = [3250, 2200, 1250, 1150, 1950];
const STAGE_ONE_SWAP_AT = STAGE_DURATIONS[0] * 0.4;
const ASSESSMENT_URL = "https://hyeve.net/take-assessment/active";
const IDLE = { phase: "idle", stage: 0, ready: false, textIndex: 0 };

function ProgressItem({ stage, status, index, textIndex, texts }) {
  const activeText = index === 0 ? texts[textIndex] : stage.active;
  return (
    <div className={`search-progress-item is-${status}`} data-stage={index + 1}>
      {status === "active" && (
        <span className="search-progress-icon">
          <span className="search-progress-dots">
            <span />
            <span />
            <span />
          </span>
        </span>
      )}
      {status === "complete" && (
        <span className="search-progress-icon search-progress-check">
          <CheckIcon />
        </span>
      )}
      {status === "pending" && (
        <span className="search-progress-icon">
          <span className="search-progress-dot-pending" />
        </span>
      )}
      <div className="search-progress-content">
        <div className="search-progress-title">{stage.title}</div>
        {status === "active" && <div className="search-progress-status">{activeText}</div>}
        {status === "complete" && <div className="search-progress-status">{stage.done}</div>}
      </div>
    </div>
  );
}

export default function Search() {
  const mode = useMode();
  useDocumentTitle(`${mode.heading} — Hyeve`);
  const navigate = useNavigate();
  const toast = useToast();
  const insights = useInsightsCount();
  const [query, setQuery] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [state, setState] = useState(IDLE);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [copied, setCopied] = useState(false);
  const found = useRef(null);
  const entered = useRef("");

  useEffect(() => {
    if (state.phase !== "working" || state.ready) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (state.stage === 0) {
        try {
          found.current = await lookupProfile(mode.key, entered.current);
        } catch (failure) {
          if (cancelled) return;
          if (failure.status === 404) {
            setState({ ...IDLE, phase: "notfound" });
            return;
          }
          toast.show(failure.message);
          setQuery("");
          setState(IDLE);
          return;
        }
        if (cancelled) return;
      }
      setState((current) =>
        current.stage === mode.stages.length - 1 ? { ...current, ready: true } : { ...current, stage: current.stage + 1 }
      );
    }, STAGE_DURATIONS[state.stage]);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [state.phase, state.stage, state.ready, mode, toast]);

  useEffect(() => {
    if (state.phase !== "working" || state.stage !== 0) return undefined;
    const timer = window.setTimeout(() => setState((current) => (current.stage === 0 ? { ...current, textIndex: 1 } : current)), STAGE_ONE_SWAP_AT);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.stage]);

  const reset = () => {
    found.current = null;
    setQuery("");
    setInvalid(false);
    setConfirmingCancel(false);
    setState(IDLE);
  };

  const submit = (event) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) {
      setInvalid(true);
      toast.show(mode.emptyError);
      document.getElementById("tenant-lookup-input")?.focus();
      return;
    }
    setInvalid(false);
    entered.current = value;
    found.current = null;
    setState({ phase: "working", stage: 0, ready: false, textIndex: 0 });
  };

  const statusOf = (index) => (state.ready || index < state.stage ? "complete" : index === state.stage ? "active" : "pending");

  const viewProfile = () => {
    const profile = found.current;
    if (!profile) return;
    navigate(`${mode.base}/${mode.profilePath}/${profile.id}`, { state: { profile } });
  };

  const copyLink = () => {
    if (!navigator.clipboard?.writeText) return;
    navigator.clipboard
      .writeText(ASSESSMENT_URL)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  };

  const shareLink = () => {
    const message = `Complete the assessment with HONESTY to get the best result: ${ASSESSMENT_URL}`;
    if (navigator.share) {
      navigator.share({ text: message }).catch(() => {});
    } else if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(message).catch(() => {});
    }
  };

  return (
    <div className="search-page">
      {insights !== null && (
        <div className="search-social-proof">
          <span className="search-social-proof-count">{compactCount(insights)}</span> Profile Insights Explored! More people choosing to
          know first.
        </div>
      )}

      {state.phase === "idle" && (
        <div className="search-card">
          <span className="lookup-badge">{mode.badge}</span>
          <h1 className="search-heading">{mode.heading}</h1>
          <p className="search-subtext">{mode.subtext}</p>

          <form onSubmit={submit} noValidate>
            <div className={`search-field${invalid ? " invalid" : ""}`}>
              <label className="sr-only" htmlFor="tenant-lookup-input">
                {mode.fieldLabel}
              </label>
              <div className="search-input-wrap">
                <span className="search-icon">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  id="tenant-lookup-input"
                  name="tenant-lookup"
                  placeholder={mode.placeholder}
                  autoComplete="off"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    if (invalid && event.target.value.trim()) setInvalid(false);
                  }}
                />
              </div>
              <p className="search-error" id="search-error">
                {mode.emptyError}
              </p>
            </div>

            <button type="submit" className="search-submit">
              Search Profile
            </button>
          </form>
        </div>
      )}

      {state.phase === "working" && (
        <div className="search-card search-working-card" tabIndex={-1}>
          <div className="search-progress-panel">
            <div className="search-progress-list" aria-live="polite">
              {mode.stages.map((stage, index) => (
                <ProgressItem
                  key={stage.title}
                  stage={stage}
                  status={statusOf(index)}
                  index={index}
                  textIndex={state.textIndex}
                  texts={mode.stageOneTexts}
                />
              ))}
            </div>
          </div>
          {state.ready ? (
            <button type="button" className="search-submit" id="search-view-profile-btn" onClick={viewProfile}>
              View Profile
            </button>
          ) : (
            <button type="button" className="search-outline-button search-session-button" id="search-cancel-btn" onClick={() => setConfirmingCancel(true)}>
              Cancel Session
            </button>
          )}
        </div>
      )}

      {state.phase === "notfound" && (
        <div className="search-card search-working-card">
          <div className="search-progress-panel">
            <div className="search-notfound-row" aria-live="polite">
              <span className="search-progress-icon search-progress-icon-error">
                <AlertIcon />
              </span>
              <div className="search-progress-content">
                <div className="search-progress-title">{mode.stages[0].title}</div>
                <div className="search-progress-status search-progress-status-error">Inconsistent records!</div>
              </div>
            </div>
          </div>

          <div className="search-notfound-panel">
            <p className="search-notfound-message">
              {mode.notFound} <span className="search-highlight">best results</span>, then search again using their email.
            </p>
            <div className="search-link-actions">
              <button type="button" className="search-link-btn" id="search-copy-link-btn" onClick={copyLink}>
                <CopyIcon />
                <span id="search-copy-link-label">{copied ? "Copied!" : "Copy link"}</span>
              </button>
              <button type="button" className="search-link-btn" id="search-share-link-btn" onClick={shareLink}>
                <ShareIcon />
                <span>Share link</span>
              </button>
            </div>
          </div>

          <button type="button" className="search-outline-button search-session-button" id="search-exit-btn" onClick={reset}>
            Exit Session
          </button>
        </div>
      )}

      <ConfirmModal
        prefix="search-cancel-modal"
        open={confirmingCancel}
        heading="Cancel this session?"
        subtext="If you cancel now, your current search progress will be lost and you'll need to start the search again."
        dismissLabel="Keep Searching"
        dismissKind="keep"
        confirmLabel="Cancel Session"
        onDismiss={() => setConfirmingCancel(false)}
        onConfirm={reset}
      />
    </div>
  );
}
