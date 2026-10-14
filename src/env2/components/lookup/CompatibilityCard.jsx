import { useCallback, useEffect, useRef, useState } from "react";
import { checkCompatibility } from "../../api/lookup.js";
import useToast from "../../hooks/useToast.js";
import { ArrowLeftIcon, SearchIcon, SparkleIcon } from "../LookupIcons.jsx";
import { AlertIcon, CheckIcon } from "./SearchIcons.jsx";
import ConfirmModal from "./ConfirmModal.jsx";

const STAGES = [
  "Finding shared traits",
  "Mapping behavioural patterns",
  "Comparing preferences",
  "Calculating compatibility",
  "Preparing your score",
];
const STAGE_DURATIONS = [9000, 2000, 1600, 1400, 1400];
const READY_TEXT = "Result is ready!";
const READY_DURATION = 700;
const IDLE_VIEW = { name: "idle" };
const EMAIL_PATTERN = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const ASSESSMENT_URL = "https://hyeve.net/take-assessment/active";

function artPhase() {
  return `-${((performance.now() / 1000) % 8).toFixed(3)}s`;
}

function Illustration({ phase }) {
  return (
    <div className="compatibility-pairing-illustration" style={{ "--compat-phase": phase }}>
      <svg className="compatibility-art" viewBox="0 0 209 135" aria-hidden="true" focusable="false">
        <path className="compatibility-art-piece compatibility-art-left" d="M95.75 6.20A67.5 67.5 0 1 0 95.75 128.80A67.5 67.5 0 0 1 95.75 6.20Z" />
        <path className="compatibility-art-piece compatibility-art-lens" d="M104.50 11.04A67.5 67.5 0 0 1 104.50 123.96A67.5 67.5 0 0 1 104.50 11.04Z" />
        <path className="compatibility-art-piece compatibility-art-right" d="M132.75 0.57A67.5 67.5 0 1 1 132.75 134.43A67.5 67.5 0 0 0 132.75 0.57Z" />
      </svg>
    </div>
  );
}

export default function CompatibilityCard({ roommateId }) {
  const toast = useToast();
  const [view, setView] = useState(IDLE_VIEW);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [phase] = useState(artPhase);
  const session = useRef(0);
  const elapsed = useRef(false);
  const outcome = useRef(null);

  const settle = useCallback(() => {
    if (!elapsed.current || !outcome.current) return;
    if (outcome.current.error) {
      toast.show(outcome.current.error);
      setView(IDLE_VIEW);
      return;
    }
    setView(outcome.current.result.found ? { name: "pairing", stage: 1, ready: false } : { name: "notfound" });
  }, [toast]);

  useEffect(() => {
    if (view.name !== "pairing" || (view.stage === 0 && elapsed.current)) return undefined;
    const timer = window.setTimeout(
      () => {
        if (view.ready) {
          setView({ name: "paired", result: outcome.current.result });
        } else if (view.stage === 0) {
          elapsed.current = true;
          settle();
        } else if (view.stage === STAGES.length - 1) {
          setView({ ...view, ready: true });
        } else {
          setView({ ...view, stage: view.stage + 1 });
        }
      },
      view.ready ? READY_DURATION : STAGE_DURATIONS[view.stage]
    );
    return () => window.clearTimeout(timer);
  }, [view, settle]);

  const toIdle = () => {
    session.current += 1;
    outcome.current = null;
    setConfirming(false);
    setView(IDLE_VIEW);
  };

  const begin = (value) => {
    session.current += 1;
    const token = session.current;
    elapsed.current = false;
    outcome.current = null;
    checkCompatibility(roommateId, value)
      .then((result) => {
        if (token !== session.current) return;
        outcome.current = { result };
        settle();
      })
      .catch((failure) => {
        if (token !== session.current) return;
        outcome.current = { error: failure.message };
        settle();
      });
    setView({ name: "pairing", stage: 0, ready: false });
  };

  const submit = (event) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) {
      setError("Enter your email to continue.");
      toast.show("Enter your email to continue.");
      return;
    }
    if (!EMAIL_PATTERN.test(value)) {
      setError("Incorrect email. Provide correct email");
      toast.show("Incorrect email. Provide correct email");
      return;
    }
    setError("");
    begin(value);
  };

  return (
    <div className="profile-card roommate-compat-card">
      <div className="compatibility-card" id="compatibility-card-root">
        {view.name === "idle" && (
          <div className="compatibility-start">
            <p className="tenant-id-card-label">Compatibility Score</p>
            <h2 className="roommate-compat-heading">
              Check <span>Compatibility Score</span>
            </h2>
            <p className="roommate-compat-subtext">Enter your email to see how compatible you are with this roommate.</p>
            <form noValidate onSubmit={submit}>
              <div className={`search-field${error ? " invalid" : ""}`}>
                <label className="sr-only" htmlFor="compat-email">
                  Your email
                </label>
                <div className="search-input-wrap">
                  <span className="search-icon">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    id="compat-email"
                    name="compat-email"
                    placeholder="Enter your email"
                    autoComplete="off"
                    aria-invalid={error ? "true" : undefined}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error && event.target.value.trim()) setError("");
                    }}
                  />
                </div>
                <p className="search-error" id="compat-error">
                  {error}
                </p>
              </div>
              <button type="submit" className="search-submit" id="compat-submit-btn">
                <SparkleIcon />
                Match me
              </button>
            </form>
          </div>
        )}

        {view.name === "pairing" && (
          <div className="compatibility-pairing">
            <p className="tenant-id-card-label">Compatibility Score</p>
            <div className="compatibility-progress">
              <Illustration phase={phase} />
              <p className="compatibility-stage-text">{view.ready ? READY_TEXT : STAGES[view.stage]}</p>
              {view.ready ? (
                <span className="compatibility-check">
                  <CheckIcon />
                </span>
              ) : (
                <span className="compatibility-dots">
                  <span />
                  <span />
                  <span />
                </span>
              )}
            </div>
            <button type="button" className="compatibility-outline-button" id="compat-cancel-btn" onClick={() => setConfirming(true)}>
              Cancel Matching
            </button>
          </div>
        )}

        {view.name === "paired" && (
          <div className="compatibility-paired">
            <p className="tenant-id-card-label">Compatibility Score</p>
            <div className="compatibility-score-row">
              <span className="compatibility-score-number">{view.result.score}</span>
              <span className="compatibility-score-percent">%</span>
            </div>
            <hr className="compatibility-divider" />
            <p className="compatibility-traits-label">Shared Behaviours</p>
            <div className="compatibility-traits">
              {view.result.shared_traits.length ? (
                view.result.shared_traits.slice(0, 10).map((trait) => (
                  <span key={trait} className="compatibility-trait-pill">
                    {trait}
                  </span>
                ))
              ) : (
                <p className="compatibility-traits-empty">No shared behaviours to show.</p>
              )}
            </div>
            <button type="button" className="compatibility-outline-button" id="compat-paired-back-btn" onClick={toIdle}>
              <ArrowLeftIcon />
              Go Back
            </button>
          </div>
        )}

        {view.name === "notfound" && (
          <div className="compatibility-not-found">
            <p className="tenant-id-card-label">Compatibility Score</p>
            <div className="compatibility-notfound-panel">
              <span className="compatibility-notfound-icon">
                <AlertIcon />
              </span>
              <h3 className="compatibility-notfound-heading">Oops! Error from your end</h3>
              <p className="compatibility-notfound-subtext">Complete the assessment honestly for the best results, then try again.</p>
            </div>
            <button type="button" className="search-submit" id="compat-assessment-btn" onClick={() => window.open(ASSESSMENT_URL, "_blank", "noopener,noreferrer")}>
              Take Assessment
            </button>
            <button type="button" className="compatibility-outline-button" id="compat-notfound-back-btn" onClick={toIdle}>
              <ArrowLeftIcon />
              Go Back
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        prefix="compatibility-cancel-modal"
        open={confirming}
        heading="Cancel Matching?"
        subtext="Are you sure you want to stop finding your compatibility score?"
        dismissLabel="Continue Matching"
        dismissKind="keep"
        confirmLabel="Cancel Matching"
        onDismiss={() => setConfirming(false)}
        onConfirm={toIdle}
      />
    </div>
  );
}
