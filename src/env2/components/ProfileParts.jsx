import { ArrowLeftIcon } from "./Icons.jsx";
import { CATEGORY_COLORS, hobbyColor, riskBackground, riskColor } from "../utils/risk.js";

export function BackButton({ onClick }) {
  return (
    <button type="button" className="hv-back-button" onClick={onClick}>
      <ArrowLeftIcon width={18} height={18} />
      Go Back
    </button>
  );
}

export function ProfileHeader({ name, badge, email, trustId }) {
  return (
    <>
      <h1 className="hv-profile-name">{name}</h1>
      <div className="hv-profile-meta">
        <span className="hv-role-badge">{badge}</span>
        <span className="hv-meta-dot" />
        <span>{email}</span>
        <span className="hv-meta-dot" />
        <span className="hv-trust-id">ID {trustId}</span>
      </div>
    </>
  );
}

export function Notice({ children }) {
  return <div className="hv-notice">{children}</div>;
}

export function Card({ className = "", children }) {
  return <div className={`hv-card ${className}`}>{children}</div>;
}

export function CardLabel({ children }) {
  return <p className="hv-card-label">{children}</p>;
}

export function TraitChips({ items }) {
  return (
    <div className="hv-trait-chips">
      {items.map((item) => (
        <span key={item} className="hv-trait-chip">
          {item}
        </span>
      ))}
    </div>
  );
}

export function HobbyChips({ items }) {
  if (!items.length) return <p className="hv-muted-text">No hobbies to show for this profile.</p>;
  return (
    <div className="hv-hobby-chips">
      {items.map((item) => (
        <span key={item} className="hv-hobby-chip" style={{ background: hobbyColor(item) }}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function TodoBox({ text }) {
  return (
    <div className="hv-todo-box">
      <p className="hv-todo-label">What to Do:</p>
      <p className="hv-todo-text">{text}</p>
    </div>
  );
}

export function RiskPill({ risk, sectionKey, children }) {
  return (
    <span
      className="hv-risk-pill"
      style={{ background: riskBackground(risk, sectionKey), color: riskColor(risk, sectionKey) }}
    >
      {children}
    </span>
  );
}

export function ActionCard({ section }) {
  const color = riskColor(section.risk, section.key);
  return (
    <Card className="hv-action-card">
      <div className="hv-action-label">
        <span className="hv-dot" style={{ background: CATEGORY_COLORS[section.key] }} />
        {section.title}
      </div>
      <h3 className="hv-verdict" style={{ color }}>
        {section.verdict}
      </h3>
      {section.pill && (
        <RiskPill risk={section.risk} sectionKey={section.key}>
          {section.pill}
        </RiskPill>
      )}
      {section.chips && (
        <>
          <p className="hv-action-subheading">Possible changes</p>
          <div className="hv-change-chips">
            {section.chips.map((chip) => (
              <span key={chip} className="hv-change-chip">
                {chip}
              </span>
            ))}
          </div>
        </>
      )}
      {section.description && <p className="hv-action-description">{section.description}</p>}
      {section.subletting && (
        <>
          <hr className="hv-rule" />
          <p className="hv-sublet-label">Possible Subletting</p>
          <p className="hv-sublet-value">{section.subletting.label}</p>
          <div
            className="hv-tag-full"
            style={{ background: riskBackground(section.risk, section.key), color }}
          >
            {section.subletting.tag}
          </div>
        </>
      )}
      {section.tag && (
        <div
          className="hv-tag-full"
          style={{ background: riskBackground(section.risk, section.key), color }}
        >
          {section.tag}
        </div>
      )}
      {section.todo && <TodoBox text={section.todo} />}
    </Card>
  );
}
