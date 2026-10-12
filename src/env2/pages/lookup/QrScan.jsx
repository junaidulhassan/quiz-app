import { QRCodeSVG } from "qrcode.react";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";

const ASSESSMENT_URL = `${window.location.origin}/take-assessment/active`;

const STEPS = [
  { title: "Start Assessment", text: "Scan the QR code or open the link to begin the Hyeve assessment." },
  { title: "Answer Questions", text: "Answer 25 short questions about everyday living habits." },
  { title: "Submit your Results", text: "Save your Trust ID, then share it so others can look you up." },
];

export default function QrScan() {
  useDocumentTitle("QR Scan — Hyeve");
  const toast = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ASSESSMENT_URL);
      toast.show("Assessment link copied.");
    } catch {
      toast.show("Couldn't copy the link. Copy it manually from the field.");
    }
  };

  return (
    <div className="hv-simple-page">
      <h1 className="hv-page-heading">QR Scan</h1>
      <p className="hv-page-subtext">Invite a tenant or roommate to take the assessment so you can look them up.</p>
      <div className="hv-card hv-qr-card">
        <div className="hv-qr-box">
          <QRCodeSVG
            value={ASSESSMENT_URL}
            size={220}
            level="H"
            marginSize={2}
            imageSettings={{ src: "/logo/qr-logo-badge.png", height: 48, width: 48, excavate: true }}
          />
        </div>
        <div className="hv-qr-copy">
          <h2 className="hv-card-heading">
            Take the <span className="hv-highlight">Assessment</span>
          </h2>
          <p className="hv-muted-text">Point a phone camera at the code, or share the link below.</p>
          <div className="hv-link-row">
            <input readOnly value={ASSESSMENT_URL} aria-label="Assessment link" onFocus={(event) => event.target.select()} />
            <button type="button" className="hv-btn hv-btn-primary" onClick={copy}>
              Copy link
            </button>
          </div>
        </div>
      </div>
      <h2 className="hv-card-heading hv-how-heading">How it Works</h2>
      <ol className="hv-steps">
        {STEPS.map((step, index) => (
          <li key={step.title} className="hv-card hv-step">
            <span className="hv-step-number">{index + 1}</span>
            <div>
              <p className="hv-step-title">{step.title}</p>
              <p className="hv-muted-text">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
