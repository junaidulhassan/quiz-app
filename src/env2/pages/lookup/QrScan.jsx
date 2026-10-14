import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { CopyIcon, ShareIcon } from "../../components/lookup/SearchIcons.jsx";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";

const ASSESSMENT_URL = `${window.location.origin}/take-assessment/active`;

const STEPS = [
  { number: "01", title: "Start Assessment", text: "Click the link or scan the QR code to begin" },
  { number: "02", title: "Answer Questions", text: "Be honest for the most accurate results" },
  { number: "03", title: "Submit your Results", text: "Get your personalized insights instantly" },
];

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.0104 7.48959L19.5 6M20.5 13.5C20.5 18.1944 16.6944 22 12 22C7.30558 22 3.5 18.1944 3.5 13.5C3.5 8.80558 7.30558 5 12 5C16.6944 5 20.5 8.80558 20.5 13.5Z" />
      <path d="M14.5 2H9.5" />
      <path d="M12 13.5L15.5 10" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C10.3719 21.5 8.8394 21.0904 7.5 20.3687C5.63177 19.362 4.37462 20.2979 3.26592 20.4658C3.09774 20.4913 2.93024 20.4302 2.80997 20.31C2.62741 20.1274 2.59266 19.8451 2.6935 19.6074C3.12865 18.5818 3.5282 16.6382 2.98341 15C2.6698 14.057 2.5 13.0483 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" />
      <path d="M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.3569 14.0689 11.1131 13.4117 11.5636C12.7283 12.0319 12 12.6716 12 13.5" />
      <path d="M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z" />
    </svg>
  );
}

function ScanFrameIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.0042 2.5C17.9974 2.61348 19.2576 2.93381 20.1619 3.83811C21.0662 4.74243 21.3865 6.00268 21.5 7.99598M7.99582 2.5C6.00261 2.61348 4.74241 2.93381 3.83812 3.83811C2.9338 4.74243 2.61347 6.00268 2.5 7.99598M21.5 16.004C21.3865 17.9973 21.0662 19.2576 20.1619 20.1619C19.2576 21.0662 17.9973 21.3865 16.004 21.5M2.5 16.004C2.61347 17.9973 2.9338 19.2576 3.83812 20.1619C4.74244 21.0662 6.00268 21.3865 7.99597 21.5" />
      <path d="M5 12H19" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M10 13.229C10.1416 13.4609 10.3097 13.6804 10.5042 13.8828C11.7117 15.1395 13.5522 15.336 14.9576 14.4722C15.218 14.3121 15.4634 14.1157 15.6872 13.8828L18.9266 10.5114C20.3578 9.02184 20.3578 6.60676 18.9266 5.11718C17.4953 3.6276 15.1748 3.62761 13.7435 5.11718L13.03 5.85978" />
      <path d="M10.9703 18.14L10.2565 18.8828C8.82526 20.3724 6.50471 20.3724 5.07345 18.8828C3.64218 17.3932 3.64218 14.9782 5.07345 13.4886L8.31287 10.1172C9.74413 8.62761 12.0647 8.6276 13.4959 10.1172C13.6904 10.3195 13.8584 10.539 14 10.7708" />
    </svg>
  );
}

export default function QrScan() {
  useDocumentTitle("QR Scan — Hyeve");
  const [copied, setCopied] = useState(false);

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
    <div className="qr-scan-page">
      <div className="qr-content">
        <h1 className="qr-heading">QR Scan</h1>

        <div className="assessment-card">
          <div className="assessment-left">
            <h2 className="assessment-heading">
              Take the
              <br />
              <span className="assessment-highlight">Assessment</span>
            </h2>
            <p className="assessment-subtext">Discover your Compatibility Score and get better matches in less than 5 minutes.</p>

            <div className="assessment-meta">
              <span className="assessment-meta-item">
                <ClockIcon />5 MINUTES
              </span>
              <span className="assessment-meta-item">
                <QuestionIcon />
                25 QUESTIONS
              </span>
            </div>

            <button
              type="button"
              className="qr-btn-primary assessment-cta"
              id="start-assessment-btn"
              onClick={() => window.open(ASSESSMENT_URL, "_blank", "noopener,noreferrer")}
            >
              <span>Start Assessment</span>
            </button>

            <div className="assessment-divider">
              <span>or</span>
            </div>

            <div className="assessment-actions">
              <button type="button" className="assessment-action-btn" id="copy-link-btn" onClick={copyLink}>
                <CopyIcon />
                <span id="copy-link-label">{copied ? "Copied!" : "Copy link"}</span>
              </button>
              <button type="button" className="assessment-action-btn" id="share-link-btn" onClick={shareLink}>
                <ShareIcon />
                Share link
              </button>
            </div>
          </div>

          <div className="assessment-right">
            <p className="scan-label">
              <ScanFrameIcon />
              Scan to begin
            </p>

            <div className="qr-code-wrap">
              <QRCodeSVG className="qr-code-svg" value={ASSESSMENT_URL} size={33} level="Q" marginSize={0} bgColor="#ffffff" fgColor="#171923" />
              <span className="qr-logo-badge" aria-hidden="true">
                <img src="/logo/qr-logo-badge.png" alt="" width="24" height="24" />
              </span>
            </div>

            <p
              className="qr-link-pill"
              id="qr-link-text"
              onClick={() => navigator.clipboard?.writeText(ASSESSMENT_URL).catch(() => {})}
            >
              <LinkIcon />
              hyeve.net/take-assessment
            </p>
          </div>
        </div>

        <h2 className="how-heading">How it Works</h2>

        <div className="how-grid">
          {STEPS.map((step) => (
            <div key={step.number} className="how-card">
              <span className="how-number">{step.number}</span>
              <p className="how-title">{step.title}</p>
              <p className="how-desc">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
