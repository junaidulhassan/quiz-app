import { useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ActionCard, BackButton, Card, CardLabel, HobbyChips, Notice, ProfileHeader, TraitChips } from "../../components/ProfileParts.jsx";
import Spinner from "../../components/Spinner.jsx";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useProfile from "../../hooks/useProfile.js";
import { useMode } from "../../layout/ModeContext.jsx";

function AboutCard({ about }) {
  const rows = [
    ["Lifestyle", about.lifestyle],
    ["Alcohol Intake", about.alcohol_intake],
    ["Late night hours", about.late_night_hours],
    ["Pets", about.pets],
  ];
  return (
    <Card className="hv-summary-card">
      <CardLabel>About Roommate</CardLabel>
      <dl className="hv-about-list">
        {rows.map(([label, value]) => (
          <div key={label} className="hv-about-row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function CompatibilityCard({ compatibility }) {
  if (!compatibility.found) {
    const needsQuiz = compatibility.reason === "no_assessment";
    return (
      <Card className="hv-summary-card">
        <CardLabel>Compatibility Score</CardLabel>
        <p className="hv-compat-empty">
          {needsQuiz
            ? "Complete the Hyeve assessment with your account email to see how compatible you are with this roommate."
            : "A compatibility score isn't available for this pairing."}
        </p>
        {needsQuiz && (
          <Link to="/take-assessment" className="hv-btn hv-btn-secondary">
            Take the assessment
          </Link>
        )}
      </Card>
    );
  }
  return (
    <Card className="hv-summary-card">
      <CardLabel>Compatibility Score</CardLabel>
      <div className="hv-compat-score">
        <span className="hv-score-number">{compatibility.score}</span>
        <span className="hv-score-max">%</span>
      </div>
      <p className="hv-action-subheading">Shared behaviours</p>
      {compatibility.shared_traits.length ? (
        <TraitChips items={compatibility.shared_traits} />
      ) : (
        <p className="hv-muted-text">{compatibility.message}</p>
      )}
    </Card>
  );
}

export default function RoommateProfile() {
  const mode = useMode();
  const navigate = useNavigate();
  const toast = useToast();
  const state = useProfile("roommate");
  useDocumentTitle(state.profile ? `${state.profile.full_name} — Hyeve` : "Roommate — Hyeve");

  const missing = state.status === "missing";

  useEffect(() => {
    if (missing) toast.show("That roommate profile couldn't be found.");
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
      <ProfileHeader name={profile.full_name} badge="ROOMMATE" email={profile.email} trustId={profile.trust_id} />
      <Notice>
        <strong>Disclaimer:</strong> For personal use only! Verify all information independently, as errors may occur.
        We assume no liability for data leaks caused by data sharing, misuse, or user error.
      </Notice>
      <div className="hv-summary-row">
        <AboutCard about={profile.about} />
        <CompatibilityCard compatibility={profile.compatibility} />
      </div>
      <Card className="hv-hobbies-card">
        <CardLabel>Hobbies &amp; Interests</CardLabel>
        <HobbyChips items={profile.hobbies} />
      </Card>
      <hr className="hv-rule" />
      <h2 className="hv-actions-heading">Other Roommate Info</h2>
      <div className="hv-actions-grid">
        {profile.sections.map((section) => (
          <ActionCard key={section.key} section={section} />
        ))}
      </div>
    </div>
  );
}
