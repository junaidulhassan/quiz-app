import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./index.css";
import API_BASE_URL from "./api";

const QUIZ_IMAGE_PATH = "/25_QUIZZES_IMG_WEBP";
const ARCHETYPE_IMAGE_PATH = "/8_ARCHETYPES_IMAGES";

function getQuizImagePath(index) {
  return `${QUIZ_IMAGE_PATH}/IMG ${index + 1}.webp`;
}

function getArchetypeImagePath(archetype) {
  const name = archetype?.short_name || archetype?.name || "";
  const assetMap = {
    sage: "SAGE.webp",
    artificer: "ARTIFICER.webp",
    titan: "TITAN.webp",
    vigor: "VIGOR.webp",
    catalyst: "CATALYST.webp",
    marshal: "MARSHAL.webp",
    monolith: "MONOLITH.webp",
    oculus: "OCULUS.webp",
  };

  const key = name.trim().toLowerCase();
  const asset = assetMap[key];

  if (asset) {
    return `${ARCHETYPE_IMAGE_PATH}/${asset}`;
  }

  return archetype?.image_url || null;
}

const QS = [
  {trait:"O",facet:"Imagination",img:getQuizImagePath(0),q:"When you're stuck on a problem that has a known, working solution. You:",a:[{t:"Try your own approach first, even if it takes longer",v:1},{t:"Use the working solution — keep it simple",v:0}]},
  {trait:"O",facet:"Curiosity",img:getQuizImagePath(1),q:"When a friend drags you to a modern art exhibition. Most of the pieces confuse you. You:",a:[{t:"Enjoy the outing but don't think much about the art itself",v:0},{t:"Google the artist on your way home because you are curious",v:1}]},
  {trait:"O",facet:"Actions",img:getQuizImagePath(2),q:"How do you react to unfamiliar situations?",a:[{t:"I feel curious and want to explore",v:1},{t:"I feel uncomfortable and avoid them",v:0}]},
  {trait:"O",facet:"Adventurous",img:getQuizImagePath(3),q:"When a friend suggests a restaurant/place you've never heard of, you say:",a:[{t:"Yes — without needing to know much more",v:1},{t:"Let me check my schedule and look it up first",v:0}]},
  {trait:"O",facet:"Aesthetics",img:getQuizImagePath(4),q:"What do you pay more attention to?",a:[{t:"How functional a thing is",v:0},{t:"How beautiful a thing is",v:1}]},
  {trait:"C",facet:"Discipline",img:getQuizImagePath(5),q:"You have a deadline in two weeks. When do you start working on it?",a:[{t:"A few days before deadline",v:0},{t:"Immediately — Within a day or two",v:1}]},
  {trait:"C",facet:"Orderliness",img:getQuizImagePath(6),q:"Your inbox, notifications, emails, you:",a:[{t:"Mostly read and clear them regularly",v:1},{t:"Let them pile up and check only when necessary",v:0}]},
  {trait:"C",facet:"Dutifulness",img:getQuizImagePath(7),q:"I tend to see life through the lens of",a:[{t:"Stories",v:0},{t:"Systems",v:1}]},
  {trait:"C",facet:"Deliberation",img:getQuizImagePath(8),q:"When traveling alone, you mostly:",a:[{t:"Will figure out the destination along the way — it's fun that way",v:0},{t:"Ask people or make inquiries — before the journey",v:1}]},
  {trait:"C",facet:"Reliability",img:getQuizImagePath(9),q:"When you commit to something, then a better option comes up. You:",a:[{t:"Stick to your original commitment",v:1},{t:"Adjust your plan if the new option makes more sense",v:0}]},
  {trait:"E",facet:"Social",img:getQuizImagePath(10),q:"At a gathering, event or party, you:",a:[{t:"Actively engage and talk to people",v:1},{t:"Feel uncomfortable around people and leave early",v:0}]},
  {trait:"E",facet:"Activity",img:getQuizImagePath(11),q:"If a friend calls you out for a party or outing, you are most likely to…",a:[{t:"Find an excuse not to go",v:0},{t:"Dress up for the occasion",v:1}]},
  {trait:"E",facet:"Assertiveness",img:getQuizImagePath(12),q:"Where do you prefer to spend most of your time?",a:[{t:"Staying inside alone",v:0},{t:"Staying outside — friend's home, public or lively places",v:1}]},
  {trait:"E",facet:"Excitement-Seeking",img:getQuizImagePath(13),q:"Your weekend is free. You could play it safe or you'd rather:",a:[{t:"Plan with friends — dinner, a bar, a gathering or outdoor activity",v:1},{t:"Prefer staying home — alone",v:0}]},
  {trait:"E",facet:"Friendliness",img:getQuizImagePath(14),q:"Which is you, honestly:",a:[{t:"I text and call just to talk or say hi",v:1},{t:"I only call if it's urgent. I prefer to text",v:0}]},
  {trait:"A",facet:"Compliance",img:getQuizImagePath(15),q:"When arguing or disagree with someone, what matters more to you?",a:[{t:"Make your point clearly and know where you both stand",v:0},{t:"Find common grounds, even if it takes longer",v:1}]},
  {trait:"A",facet:"Empathy",img:getQuizImagePath(16),q:"When your friend is visiting from out of town and needs somewhere to stay for a month. You:",a:[{t:"Love the idea — and happy to welcome them",v:1},{t:"Probably say no — You need your space",v:0}]},
  {trait:"A",facet:"Altruism",img:getQuizImagePath(17),q:"When a friend asks a favour you can do, but you don't really want to. You:",a:[{t:"Usually say yes — it matters to them",v:1},{t:"Say no, if it doesn't work for you. Your time is yours",v:0}]},
  {trait:"A",facet:"Conflict Expression",img:getQuizImagePath(18),q:"Someone in your group chat talks very different about you. You:",a:[{t:"Address it where it happened. Public comments deserve public replies",v:0},{t:"Message them privately — you prefer handling things directly but quietly",v:1}]},
  {trait:"A",facet:"Tender-Mindedness",img:getQuizImagePath(19),q:"Someone returns something they borrowed, slightly damaged. You:",a:[{t:"Expect acknowledgement or replacement of the item",v:0},{t:"Let it go this time — the relationship matters more",v:1}]},
  {trait:"N",facet:"Anxiety",img:getQuizImagePath(20),q:"When you're waiting on important news — a job, a result, a big decision. You:",a:[{t:"Go through every possible scenarios in your head on a loop",v:1},{t:"Stay occupied and stop worrying — it won't change anything",v:0}]},
  {trait:"N",facet:"Anger",img:getQuizImagePath(21),q:"When someone disrespects you in a small way. You:",a:[{t:"Brush it off and move on",v:0},{t:"Feel it immediately and it affects your mood",v:1}]},
  {trait:"N",facet:"Sensitivity",img:getQuizImagePath(22),q:"You're focused on a task when someone interrupts you unexpectedly. You:",a:[{t:"Pause or respond in the moment — without losing focus",v:0},{t:"Feel distracted and may struggle to regain focus",v:1}]},
  {trait:"N",facet:"Impulsiveness",img:getQuizImagePath(23),q:"During an argument, you feel a sudden rush of anger. You:",a:[{t:"React immediately or get irritated easily",v:1},{t:"Stay controlled and respond calmly",v:0}]},
  {trait:"N",facet:"Self-Consciousness",img:getQuizImagePath(24),q:"After a long interaction with someone, you feel:",a:[{t:"Neutral or fine most of the time",v:0},{t:"Emotionally low or drained",v:1}]}
];

const BADGE_CLASS = {O:"q-badge-O",C:"q-badge-C",E:"q-badge-E",A:"q-badge-A",N:"q-badge-N"};
const BADGE_LABEL = {O:"Openness",C:"Conscientiousness",E:"Extraversion",A:"Agreeableness",N:"Neuroticism"};
const STORAGE_KEY = "quiz_app_state_v1";

// Maps internal quiz "view" state to its shareable/bookmarkable route, and back.
const VIEW_TO_PATH = {
  intro: "/take-assessment",
  lookup: "/take-assessment",
  quiz: "/take-assessment/active",
  gate: "/take-assessment/active",
  results: "/take-assessment/results",
};
const PATH_TO_VIEW = {
  "/take-assessment": "intro",
  "/take-assessment/active": "quiz",
  "/take-assessment/results": "results",
};

function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.answers)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function App() {
  const savedState = useRef(loadStoredState());
  const navigate = useNavigate();
  const location = useLocation();

  // The bare home URL always starts fresh — cached mid-quiz/results progress
  // must never hijack an intentional visit to hyeve.net, nor be silently
  // resumed later just because it's still sitting in localStorage.
  const isFreshHomeLanding =
    location.pathname === "/" && !!savedState.current?.view && savedState.current.view !== "intro";
  const effectiveSaved = isFreshHomeLanding ? null : savedState.current;

  const [view, setView] = useState(() => {
    if (location.pathname === "/") return "intro";

    // For a deep link (e.g. reloading mid-quiz), only restore the cached
    // view if it actually maps back to the URL the user is on.
    const savedView = effectiveSaved?.view;
    const savedPath = savedView ? VIEW_TO_PATH[savedView] : null;
    if (savedView && savedPath === location.pathname) {
      if (savedView === "results" && !effectiveSaved?.resultData) return "lookup";
      return savedView;
    }

    const routeView = PATH_TO_VIEW[location.pathname];
    if (routeView === "results" && !effectiveSaved?.resultData) return "lookup";
    return routeView || "intro";
  });
  const [cur, setCur] = useState(effectiveSaved?.cur ?? 0);
  const [answers, setAnswers] = useState(effectiveSaved?.answers ?? new Array(QS.length).fill(null));
  const [bannerLoading, setBannerLoading] = useState(true);
  const [direction, setDirection] = useState(1);

  const [fname, setFname] = useState(effectiveSaved?.fname || "");
  const [sname, setSname] = useState(effectiveSaved?.sname || "");
  const [email, setEmail] = useState(effectiveSaved?.email || "");
  const [errFname, setErrFname] = useState(effectiveSaved?.errFname || false);
  const [errSname, setErrSname] = useState(effectiveSaved?.errSname || false);
  const [errEmail, setErrEmail] = useState(effectiveSaved?.errEmail || false);
  const [emailErrMsg, setEmailErrMsg] = useState(effectiveSaved?.emailErrMsg || "Please enter a valid email address");
  const [submitting, setSubmitting] = useState(effectiveSaved?.submitting || false);

  const [resultData, setResultData] = useState(effectiveSaved?.resultData || null);
  const [dupNotice, setDupNotice] = useState(effectiveSaved?.dupNotice || false);
  const [tooltip, setTooltip] = useState(effectiveSaved?.tooltip || "Copy to clipboard");

  // --- Partner share popup state (not persisted — always starts closed) ---
  const [partnerShareOpen, setPartnerShareOpen] = useState(false);
  const [partnerLinkCopied, setPartnerLinkCopied] = useState(false);

  // --- Trust ID lookup state ---
  const [lookupId, setLookupId] = useState(effectiveSaved?.lookupId || "");
  const [lookupError, setLookupError] = useState(effectiveSaved?.lookupError || "");
  const [lookupLoading, setLookupLoading] = useState(effectiveSaved?.lookupLoading || false);

  const nextTimeout = useRef(null);

  useEffect(() => {
    const state = {
      view,
      cur,
      answers,
      fname,
      sname,
      email,
      errFname,
      errSname,
      errEmail,
      emailErrMsg,
      submitting,
      resultData,
      dupNotice,
      tooltip,
      lookupId,
      lookupError,
      lookupLoading,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [view, cur, answers, fname, sname, email, errFname, errSname, errEmail, emailErrMsg, submitting, resultData, dupNotice, tooltip, lookupId, lookupError, lookupLoading]);

  useEffect(() => {
    return () => { if (nextTimeout.current) clearTimeout(nextTimeout.current); };
  }, []);

  useEffect(() => {
    const targetPath = VIEW_TO_PATH[view] || "/take-assessment";
    if (location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  function startQuiz() {
    setView("quiz");
  }

  function goToLookup() {
    setLookupId("");
    setLookupError("");
    setLookupLoading(false);
    setView("lookup");
  }

  function backToIntro() {
    setLookupError("");
    setView("intro");
  }

  function selectOption(i) {
    const next = answers.slice();
    next[cur] = i;
    setAnswers(next);
    if (nextTimeout.current) clearTimeout(nextTimeout.current);
    nextTimeout.current = setTimeout(() => {
      goNext(next);
    }, 280);
  }

  function goBack() {
    if (cur > 0) {
      setDirection(-1);
      setCur(cur - 1);
      setBannerLoading(true);
    } else {
      setView("intro");
    }
  }

  function goNext(latestAnswers) {
    const a = latestAnswers || answers;
    if (a[cur] === null) return;
    if (cur < QS.length - 1) {
      setDirection(1);
      setCur(cur + 1);
      setBannerLoading(true);
    } else {
      setView("gate");
    }
  }

  async function submitGate() {
    const fnameOk = fname.trim().length > 0;
    const snameOk = sname.trim().length > 0;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    setErrFname(!fnameOk);
    setErrSname(!snameOk);
    setEmailErrMsg("Please enter a valid email address");
    setErrEmail(!emailOk);

    if (!fnameOk || !snameOk || !emailOk) return;

    setSubmitting(true);

    const payload = {
      first_name: fname.trim(),
      last_name: sname.trim(),
      email: email.trim(),
      quiz_version: "v1.2",
      answers: QS.map((q, i) => ({
        question_number: i + 1,
        selected_option: answers[i]
      }))
    };

    try {
      const res = await fetch(`${API_BASE_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Server error (" + res.status + ")");
      }

      const data = await res.json();

      if (data.is_duplicate_submission) {
        setDupNotice(true);
      }

      setResultData(data);
      setView("results");
    } catch (err) {
      setEmailErrMsg(err.message || "Something went wrong. Please try again.");
      setErrEmail(true);
      setSubmitting(false);
    }
  }

  async function submitLookup() {
    const id = lookupId.trim();
    if (!id) {
      setLookupError("Please enter your Trust ID");
      return;
    }

    setLookupError("");
    setLookupLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/result/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 404) {
          throw new Error("No result found for that Trust ID. Please check and try again.");
        }
        throw new Error(err.detail || "Server error (" + res.status + ")");
      }

      const data = await res.json();
      setDupNotice(false);
      setResultData(data);
      setView("results");
    } catch (err) {
      setLookupError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  }

  function copyResID() {
    if (!resultData) return;
    navigator.clipboard.writeText(resultData.trust_id).then(() => {
      setTooltip("Copied!");
      setTimeout(() => setTooltip("Copy to clipboard"), 2000);
    });
  }

  function openSocialPopup(url) {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
  }

  function shareViaWhatsapp() {
    const text = `${partnerShareText} ${partnerShareUrl}`;
    openSocialPopup(`https://wa.me/?text=${encodeURIComponent(text)}`);
  }

  function shareViaFacebook() {
    openSocialPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(partnerShareUrl)}`);
  }

  function shareViaX() {
    openSocialPopup(`https://twitter.com/intent/tweet?text=${encodeURIComponent(partnerShareText)}&url=${encodeURIComponent(partnerShareUrl)}`);
  }

  async function copyPartnerLink() {
    try {
      await navigator.clipboard.writeText(partnerShareUrl);
      setPartnerLinkCopied(true);
      setTimeout(() => setPartnerLinkCopied(false), 2000);
    } catch (err) {
      // clipboard unavailable — nothing further we can do
    }
  }

  function retake() {
    setDirection(1);
    setCur(0);
    setAnswers(new Array(QS.length).fill(null));
    setDupNotice(false);
    setFname("");
    setSname("");
    setEmail("");
    setErrFname(false);
    setErrSname(false);
    setErrEmail(false);
    setSubmitting(false);
    setResultData(null);
    setBannerLoading(true);
    setView("quiz");
  }

  const q = QS[cur];
  const pct = Math.round(((cur + 1) / QS.length) * 100);

  const accentColor = resultData ? resultData.archetype.colors[0] : "#6366F1";
  const archetypeHeroImage = resultData ? getArchetypeImagePath(resultData.archetype) : null;

  const partnerShareUrl = resultData
    ? `${window.location.origin}/take-assessment?ref=${encodeURIComponent(resultData.trust_id)}`
    : `${window.location.origin}/take-assessment`;
  const partnerShareText = "I just took this career assessment — take it too and let's see how we match up as an idea partnership 👀";

  return (
    <div className="shell" style={{ "--accent": accentColor }}>
      {view === "intro" && (
        <div id="intro-view">
          <p className="intro-eyebrow">approx. 5 minutes</p>
          <h1 className="intro-title">
            Discover your <em>career strengths</em> based on who you are
          </h1>
          <p className="intro-body">
            25 quick questions to help identify your area of dominance and what career you'd most likely succeed in. No right or wrong answer, but be honest — you'll get a more accurate result.
          </p>
          <div className="trait-pills">
            <span className="pill pill-O">✦ Entrepreneur</span>
            <span className="pill pill-C">✦ Influencer</span>
            <span className="pill pill-O">✦ Doctor</span>
            <span className="pill pill-A">✦ Lawyer</span>
            <span className="pill pill-N">✦ Entertainer</span>
            <span className="pill pill-C">✦ Politician</span>
          </div>
          <div className="intro-actions">
            <button className="start-btn" onClick={startQuiz}>
              Begin the quiz
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="view-results-btn" onClick={goToLookup}>
              View my results
            </button>
          </div>
        </div>
      )}

      {view === "lookup" && (
        <div id="lookup-view" className="shell">
          <button className="lookup-back" onClick={backToIntro}>← Back</button>
          <h1 className="gate-title">Find your <em>results</em></h1>
          <p className="gate-subtitle">Enter the Trust ID you received when you completed the quiz to view your report again.</p>

          <div className="gate-field-full">
            <label className="gate-label" htmlFor="lookup-id">Trust ID <span>*</span></label>
            <input
              className="gate-input"
              id="lookup-id"
              type="text"
              placeholder="e.g. TR-8F3K2Q"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitLookup(); }}
            />
            <div className="gate-error" style={{ display: lookupError ? "block" : "none" }}>{lookupError}</div>
          </div>

          <button className="gate-submit" onClick={submitLookup} disabled={lookupLoading}>
            {lookupLoading ? "Looking up…" : "View results  →"}
          </button>
        </div>
      )}

      {view === "quiz" && (
        <div id="quiz-view">
          <div className="progress-row">
            <span className="progress-label">{cur + 1} / {QS.length}</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: pct + "%" }}></div>
            </div>
            <span className="progress-label">{pct}%</span>
          </div>
          <div className="q-card">
            <div key={cur} className={"q-card-body " + (direction === -1 ? "slide-back" : "slide-next")}>
              <div className="q-banner">
                <img
                  src={q.img}
                  alt={q.facet + " illustration"}
                  className={bannerLoading ? "loading" : ""}
                  onLoad={() => setBannerLoading(false)}
                />
              </div>
              <div className="q-meta">
                <span className={"q-badge " + BADGE_CLASS[q.trait]}>{BADGE_LABEL[q.trait]}</span>
                <span className="q-facet-tag">· {q.facet}</span>
              </div>
              <p className="q-text">{q.q}</p>
              <div className="options">
                {q.a.map((opt, i) => (
                  <button
                    key={i}
                    className={"opt" + (answers[cur] === i ? " selected" : "")}
                    onClick={() => selectOption(i)}
                  >
                    <span className="opt-key">{["A", "B"][i]}</span>
                    <span className="opt-text">{opt.t}</span>
                    {answers[cur] === i && (
                      <span className="opt-check">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="nav-row">
            <button className="nav-back" onClick={goBack}>← Back</button>
            <button className="nav-next" disabled={answers[cur] === null} onClick={() => goNext()}>
              {cur === QS.length - 1 ? "See my results →" : "Next →"}
            </button>
          </div>
        </div>
      )}

      {view === "gate" && (
        <div id="gate-view" className="shell">
          <h1 className="gate-title">Your <em>Results</em> are ready!</h1>
          <p className="gate-subtitle">Enter your details to receive a Unique ID and a copy of your report in your email.</p>

          <div className="gate-row">
            <div className="gate-field">
              <label className="gate-label" htmlFor="gate-fname">First name <span>*</span></label>
              <input
                className="gate-input"
                id="gate-fname"
                type="text"
                placeholder="Input First name"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
              />
              <div className="gate-error" style={{ display: errFname ? "block" : "none" }}>Please enter your first name</div>
            </div>
            <div className="gate-field">
              <label className="gate-label" htmlFor="gate-sname">Surname <span>*</span></label>
              <input
                className="gate-input"
                id="gate-sname"
                type="text"
                placeholder="Input surname"
                value={sname}
                onChange={(e) => setSname(e.target.value)}
              />
              <div className="gate-error" style={{ display: errSname ? "block" : "none" }}>Please enter your surname</div>
            </div>
          </div>

          <div className="gate-field-full">
            <label className="gate-label" htmlFor="gate-email">Email Address <span>*</span></label>
            <input
              className="gate-input"
              id="gate-email"
              type="email"
              placeholder="Input email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="gate-error" style={{ display: errEmail ? "block" : "none" }}>{emailErrMsg}</div>
          </div>

          <button className="gate-submit" onClick={submitGate} disabled={submitting}>
            {submitting ? "Submitting…" : "Get result  →"}
          </button>
        </div>
      )}

      {view === "results" && resultData && (
        <div id="results-view">
          {dupNotice && (
            <div style={{
              background: "#FEF3C7",
              border: "1px solid #D97706",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "13px",
              color: "#92400E",
              marginBottom: "1rem",
              lineHeight: 1.5
            }}>
              This email has already been used. Showing your previously saved result.
            </div>
          )}

          <div className="res-id-banner">
            <div className="res-id-top-row">
              <p className="res-id-important">Save your <strong>Trust ID</strong> to see the results later</p>
              <p className="res-id-date">{resultData.display_date}</p>
            </div>
            <div className="res-id-box">
              <span className="res-id-code">{resultData.trust_id}</span>
              <button className="res-id-copy" onClick={copyResID}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span className="res-id-tooltip" style={{ opacity: tooltip === "Copied!" ? 1 : undefined }}>{tooltip}</span>
              </button>
            </div>
          </div>

          <div className="res-hero">
            <div>
              <p className="res-you">You are the</p>
              <h1 className="res-archetype-name">{resultData.archetype.short_name}</h1>
              <p className="res-tagline">{resultData.archetype.tagline}</p>
            </div>
            {archetypeHeroImage && (
              <img className="res-hero-img" src={archetypeHeroImage} alt="Archetype illustration" />
            )}
          </div>

          <p className="res-quote">{resultData.archetype.quote || ""}</p>

          <div className="res-desc">
            {resultData.archetype.desc.split("<br><br>").map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>

          <div className="res-bottom">
            <div className="res-panel">
              <div className="res-box">
                <p className="res-box-label">YOU SHARE SIMILAR TRAITS WITH</p>
                <div className="res-pills">
                  {resultData.archetype.you_share_traits_with.map((n, i) => (
                    <span
                      key={i}
                      className="res-pill"
                      style={{
                        "--pill-font-size": resultData.archetype.pill_style.font_size,
                        "--pill-color": resultData.archetype.pill_style.color,
                        "--pill-bg": resultData.archetype.pill_style.bg,
                        "--pill-border": resultData.archetype.pill_style.border
                      }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="res-box">
                <p className="res-box-label">YOUR CAREER STRENGTHS</p>
                <div className="res-pills">
                  {resultData.archetype.career_strengths.map((n, i) => (
                    <span
                      key={i}
                      className="res-pill"
                      style={{
                        "--pill-font-size": resultData.archetype.pill_style.font_size,
                        "--pill-color": resultData.archetype.pill_style.color,
                        "--pill-bg": resultData.archetype.pill_style.bg,
                        "--pill-border": resultData.archetype.pill_style.border
                      }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="res-sidebar">
              <div className="res-side-box">
                <p className="res-side-label">AREA OF DOMINANCE</p>
                <p className="res-side-value">{resultData.archetype.zone_of_genius || "—"}</p>
              </div>
              <div className="res-side-box">
                <p className="res-side-label">DEEPEST DESIRE</p>
                <p className="res-side-value">{resultData.archetype.deepest_aspiration || "—"}</p>
              </div>
              <div className="res-side-box">
                <p className="res-side-label">IDEAL PARTNER</p>
                <p className="res-side-value">{resultData.archetype.ideal_partner || "—"}</p>
              </div>
              <button className="res-cta" onClick={() => setPartnerShareOpen(true)}>✦ <span>Find Your Idea Partner</span></button>
            </div>
          </div>

          <div className="res-data-store">
            <p className="section-label">Trait breakdown</p>
            <div className="trait-rows">
              {resultData.traits.map((t) => {
                const barW = Math.round((t.score / 10) * 100);
                return (
                  <div className="trait-row" key={t.dimension}>
                    <div className="trait-row-header">
                      <span className="trait-row-name">{t.name}</span>
                      <span className="trait-row-score">{t.label} · {t.score}/10</span>
                    </div>
                    <div className="trait-bar-track">
                      <div className={"trait-bar-fill bar-" + t.dimension} style={{ width: barW + "%" }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="section-label">Facet detail</p>
            <div className="facet-grid">
              {resultData.facets.map((f, i) => (
                <div className={"facet-cell facet-cell-" + f.dimension} key={i}>
                  <div className="facet-cell-trait">{f.dimension} · {f.facet_name}</div>
                  <div className="facet-cell-score">{f.level} ({f.score}/10)</div>
                </div>
              ))}
            </div>
          </div>

          <button className="retake-btn" style={{ display: "inline-flex" }} onClick={retake}>↩ Retake quiz</button>
        </div>
      )}

      {partnerShareOpen && (
        <div className="partner-share-overlay" onClick={(e) => { if (e.target === e.currentTarget) setPartnerShareOpen(false); }}>
          <div className="partner-share-box">
            <button className="partner-share-close" onClick={() => setPartnerShareOpen(false)} aria-label="Close">×</button>
            <h2 className="partner-share-title">Find Your Idea Partner</h2>
            <p className="partner-share-subtitle">Share your assessment link so they can take the same quiz.</p>

            <div className="partner-share-options">
              <button className="partner-share-option" onClick={shareViaWhatsapp}>
                <span className="partner-share-icon partner-share-icon-whatsapp">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22" fill="#fff">
                    <path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.35.66 4.55 1.8 6.43L4 29l7.72-1.75a12.9 12.9 0 0 0 4.3.74C22.6 28 28 22.6 28 15.98 28 9.4 22.6 3 16.02 3zm0 22.9c-1.53 0-3-.4-4.28-1.15l-.3-.18-4.58 1.04 1.06-4.47-.2-.32a10.32 10.32 0 0 1-1.6-5.8c0-5.7 4.62-10.32 10.32-10.32 2.76 0 5.35 1.08 7.3 3.03a10.24 10.24 0 0 1 3.02 7.3c0 5.7-4.62 10.87-10.74 10.87zm5.9-7.73c-.32-.16-1.9-.94-2.2-1.04-.3-.11-.5-.16-.72.16-.22.32-.83 1.04-1.02 1.25-.19.22-.37.24-.7.08-.32-.16-1.36-.5-2.6-1.6-.96-.86-1.6-1.9-1.8-2.23-.18-.32-.02-.5.14-.65.14-.14.32-.37.48-.55.16-.19.21-.32.32-.54.1-.22.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.63-.53-.54-.72-.55h-.62c-.22 0-.56.08-.85.4-.3.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.04 1.29 3.25.16.22 2.22 3.39 5.38 4.76.75.32 1.34.52 1.8.66.76.24 1.44.2 1.98.13.6-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37z"/>
                  </svg>
                </span>
                <span>WhatsApp</span>
              </button>
              <button className="partner-share-option" onClick={shareViaFacebook}>
                <span className="partner-share-icon partner-share-icon-facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22" fill="#fff">
                    <path d="M28 16c0-6.63-5.37-12-12-12S4 9.37 4 16c0 5.99 4.39 10.96 10.13 11.86v-8.39h-3.05V16h3.05v-2.65c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V16h3.32l-.53 3.47h-2.79v8.39C23.61 26.96 28 21.99 28 16z"/>
                  </svg>
                </span>
                <span>Facebook</span>
              </button>
              <button className="partner-share-option" onClick={shareViaX}>
                <span className="partner-share-icon partner-share-icon-x">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="#fff">
                    <path d="M18.9 14.3 27.6 4h-2.1l-7.5 8.9L11.9 4H4.4l9.1 13.2L4.4 28h2.1l7.9-9.4L20.7 28h7.5l-9.3-13.7Zm-2.8 3.3-.9-1.3L7 6h3.3l5.9 8.4.9 1.3 7.6 10.9h-3.3l-6.3-9Z"/>
                  </svg>
                </span>
                <span>X</span>
              </button>
              <button className="partner-share-option" onClick={copyPartnerLink}>
                <span className="partner-share-icon partner-share-icon-copy">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.8" width="20" height="20">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </span>
                <span>{partnerLinkCopied ? "Link copied!" : "Copy Link"}</span>
              </button>
            </div>

            <div className="partner-share-link-row">
              <span className="partner-share-link-text">{partnerShareUrl}</span>
              <button className="partner-share-link-copy" onClick={copyPartnerLink}>
                {partnerLinkCopied ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}