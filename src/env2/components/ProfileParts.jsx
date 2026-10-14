import { ArrowLeftIcon } from "./LookupIcons.jsx";
import { categoryColor, riskBackground, riskColor } from "../utils/risk.js";

export function BackButton({ onClick }) {
  return (
    <button type="button" className="tenant-id-back" onClick={onClick}>
      <ArrowLeftIcon />
      Go Back
    </button>
  );
}

export function ProfileHeader({ name, badge, email }) {
  return (
    <>
      <h1 className="tenant-id-name">{name}</h1>
      <div className="tenant-id-meta">
        <span className="tenant-id-role-badge">{badge}</span>
        <span className="tenant-id-meta-dot" />
        <span>{email}</span>
      </div>
    </>
  );
}

export function Disclaimer() {
  return (
    <div className="tenant-id-notice">
      <strong>Disclaimer:</strong> For personal use only! Verify all information independently, as errors may occur. We assume no
      liability for data leaks caused by data sharing, misuse, or user error.
    </div>
  );
}

export function InsightsNotice() {
  return (
    <div className="tenant-id-notice">
      Insights may contain errors and must not be used to exclude applicants based on disability, health, age, family status,
      ethnicity, or financial situation.
    </div>
  );
}

export function CardLabel({ children }) {
  return <p className="tenant-id-card-label">{children}</p>;
}

function Tag({ section, children }) {
  return (
    <div className="tenant-id-tag-full" style={{ background: riskBackground(section.risk, section.key), color: riskColor(section.risk, section.key) }}>
      {children}
    </div>
  );
}

function CardHead({ section }) {
  return (
    <>
      <div className="tenant-id-action-label-row">
        <span className="tenant-id-action-dot" style={{ background: categoryColor(section.key) }} />
        {section.title}
      </div>
      <h3 className="tenant-id-verdict" style={{ color: riskColor(section.risk, section.key) }}>
        {section.verdict}
      </h3>
    </>
  );
}

export function ActionCard({ section }) {
  const color = riskColor(section.risk, section.key);
  return (
    <div className="profile-card tenant-id-action-card">
      <CardHead section={section} />
      {section.chips && (
        <>
          <p className="tenant-id-action-subheading">Possible Changes by Tenant:</p>
          <div className="tenant-id-change-chips">
            {section.chips.map((chip) => (
              <span key={chip} className="tenant-id-change-chip">
                {chip}
              </span>
            ))}
          </div>
          <Tag section={section}>{section.tag}</Tag>
        </>
      )}
      {section.pill && (
        <span className="tenant-id-risk-pill" style={{ background: riskBackground(section.risk, section.key), color }}>
          {section.pill}
        </span>
      )}
      {section.description && <p className="tenant-id-action-description">{section.description}</p>}
      {section.todo && (
        <div className="tenant-id-todo-box">
          <p className="tenant-id-todo-label">What to Do:</p>
          <p className="tenant-id-todo-text">{section.todo}</p>
        </div>
      )}
      {section.subletting && (
        <>
          <hr className="tenant-id-sublet-divider" />
          <p className="tenant-id-sublet-label">Possible Subletting</p>
          <p className="tenant-id-sublet-value">{section.subletting.label}</p>
          <Tag section={section}>{section.subletting.tag}</Tag>
        </>
      )}
    </div>
  );
}
