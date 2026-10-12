import { useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ActionCard, BackButton, Card, CardLabel, Notice, ProfileHeader, TraitChips } from "../../components/ProfileParts.jsx";
import Spinner from "../../components/Spinner.jsx";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useProfile from "../../hooks/useProfile.js";
import { useMode } from "../../layout/ModeContext.jsx";
import { CATEGORY_COLORS, riskColor } from "../../utils/risk.js";

function ScoreCard({ profile }) {
  return (
    <Card className="hv-summary-card">
      <CardLabel>Overall Trust Score</CardLabel>
      <div className="hv-score-row">
        <p className="hv-score-description">{profile.score_description}</p>
        <div className="hv-score-value">
          <span className="hv-score-number">{profile.overall_score}</span>
          <span className="hv-score-max">/100</span>
        </div>
      </div>
      <ul className="hv-score-list">
        {profile.breakdown.map((row) => (
          <li key={row.key}>
            <span className="hv-dot" style={{ background: CATEGORY_COLORS[row.key] }} />
            <span className="hv-score-list-label">{row.title}</span>
            <span className="hv-score-list-value" style={{ color: riskColor(row.risk, row.key) }}>
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </Card>
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

  if (missing) {
    return <Navigate to={`${mode.base}/search`} replace />;
  }
  if (state.status === "loading") {
    return (
      <div className="hv-page-loader">
        <Spinner dark />
      </div>
    );
  }

  const { profile } = state;
  return (
    <div className="hv-profile-page">
      <BackButton onClick={() => navigate(-1)} />
      <ProfileHeader name={profile.full_name} badge="TENANT" email={profile.email} trustId={profile.trust_id} />
      <Notice>
        <strong>Disclaimer:</strong> For personal use only! Verify all information independently, as errors may occur.
        We assume no liability for data leaks caused by data sharing, misuse, or user error.
      </Notice>
      <div className="hv-summary-row">
        <ScoreCard profile={profile} />
        <Card className="hv-summary-card">
          <CardLabel>Archetype · {profile.archetype.name}</CardLabel>
          <h2 className="hv-behaviours-heading">Tenant is thought to be:</h2>
          <TraitChips items={profile.behaviours} />
        </Card>
      </div>
      <hr className="hv-rule" />
      <h2 className="hv-actions-heading">Tenant Common Actions</h2>
      <Notice>
        Insights may contain errors and must not be used to exclude applicants based on disability, health, age, family
        status, ethnicity, or financial situation.
      </Notice>
      <div className="hv-actions-grid">
        {profile.sections.map((section) => (
          <ActionCard key={section.key} section={section} />
        ))}
      </div>
      <p className="hv-footnote">
        Want to see your own result? <Link to="/take-assessment">Take the assessment</Link>
      </p>
    </div>
  );
}
