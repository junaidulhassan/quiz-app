import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ActionCard, BackButton, CardLabel, Disclaimer, InsightsNotice, ProfileHeader } from "../../components/ProfileParts.jsx";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useProfile from "../../hooks/useProfile.js";
import { useMode } from "../../layout/ModeContext.jsx";
import { categoryColor, riskColor } from "../../utils/risk.js";

function ScoreCard({ profile }) {
  return (
    <div className="profile-card">
      <CardLabel>Overall Trust Score</CardLabel>
      <div className="tenant-id-score-row">
        <p className="tenant-id-score-description">{profile.score_description}</p>
        <div className="tenant-id-score-value">
          <span className="tenant-id-score-number">{profile.overall_score}</span>
          <span className="tenant-id-score-max">/100</span>
        </div>
      </div>
      <ul className="tenant-id-score-list">
        {profile.breakdown.map((row) => (
          <li key={row.key}>
            <span className="tenant-id-score-dot" style={{ background: categoryColor(row.key) }} />
            <span className="tenant-id-score-list-label">{row.title}</span>
            <span className="tenant-id-score-list-value" style={{ color: riskColor(row.risk, row.key) }}>
              {row.value}
            </span>
          </li>
        ))}
      </ul>
      <div className="tenant-id-scroll-hint">↓ Scroll down to see full insights</div>
    </div>
  );
}

function BehavioursCard({ behaviours }) {
  return (
    <div className="profile-card">
      <CardLabel>Tenant Behaviours</CardLabel>
      <h2 className="tenant-id-behaviours-heading">Tenant is thought to be:</h2>
      <div className="tenant-id-trait-chips">
        {behaviours.map((trait) => (
          <span key={trait} className="tenant-id-trait-chip">
            {trait}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TenantProfile() {
  const mode = useMode();
  const navigate = useNavigate();
  const toast = useToast();
  const state = useProfile("tenant");
  useDocumentTitle(state.profile ? `${state.profile.full_name} — Hyeve` : "Tenant — Hyeve");

  const missing = state.status === "missing";

  useEffect(() => {
    if (missing) toast.show("That tenant profile couldn't be found.");
  }, [missing, toast]);

  if (missing) return <Navigate to={`${mode.base}/search`} replace />;
  if (state.status === "loading") return <div className="tenant-id-page" aria-busy="true" />;

  const { profile } = state;
  return (
    <div className="tenant-id-page">
      <div className="tenant-id-content">
        <BackButton onClick={() => navigate(`${mode.base}/search`)} />
        <ProfileHeader name={profile.full_name} badge="TENANT" email={profile.email} />
        <Disclaimer />

        <div className="tenant-id-summary-row">
          <ScoreCard profile={profile} />
          <BehavioursCard behaviours={profile.behaviours} />
        </div>

        <hr className="tenant-id-divider" />

        <h2 className="tenant-id-actions-heading">Tenant Common Actions</h2>

        <InsightsNotice />

        <div className="tenant-id-actions-grid">
          {profile.sections.map((section) => (
            <ActionCard key={section.key} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
