import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import CompatibilityCard from "../../components/lookup/CompatibilityCard.jsx";
import { BoneIcon, DrinkIcon, MoonIcon, PuzzleIcon } from "../../components/LookupIcons.jsx";
import { ActionCard, BackButton, CardLabel, Disclaimer, InsightsNotice, ProfileHeader } from "../../components/ProfileParts.jsx";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useProfile from "../../hooks/useProfile.js";
import { useMode } from "../../layout/ModeContext.jsx";
import { hobbyColor } from "../../utils/risk.js";

function AboutCard({ about }) {
  const rows = [
    { Icon: PuzzleIcon, label: "Lifestyle", value: about.lifestyle },
    { Icon: DrinkIcon, label: "Alcohol Intake", value: about.alcohol_intake },
    { Icon: MoonIcon, label: "Late night hours", value: about.late_night_hours },
    { Icon: BoneIcon, label: "Pets", value: about.pets },
  ];
  return (
    <div className="profile-card">
      <CardLabel>About Roommate</CardLabel>
      <div className="roommate-about-list">
        {rows.map(({ Icon, label, value }) => (
          <div key={label} className="roommate-about-row">
            <span className="roommate-about-label">
              <Icon />
              {label}
            </span>
            <span className="roommate-about-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
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

  if (missing) return <Navigate to={`${mode.base}/search`} replace />;
  if (state.status === "loading") return <div className="tenant-id-page" aria-busy="true" />;

  const { profile } = state;
  return (
    <div className="tenant-id-page">
      <div className="tenant-id-content">
        <BackButton onClick={() => navigate(`${mode.base}/search`)} />
        <ProfileHeader name={profile.full_name} badge="ROOMMATE" email={profile.email} />
        <Disclaimer />

        <div className="tenant-id-summary-row">
          <CompatibilityCard roommateId={profile.id} />
          <AboutCard about={profile.about} />
        </div>

        <hr className="tenant-id-divider" />

        <CardLabel>Hobbies &amp; Interests</CardLabel>
        <div className="roommate-hobby-chips">
          {profile.hobbies.map((hobby) => (
            <span key={hobby} className="roommate-hobby-chip" style={{ background: hobbyColor(hobby) }}>
              {hobby}
            </span>
          ))}
        </div>

        <hr className="tenant-id-divider" style={{ marginTop: 24 }} />

        <h2 className="tenant-id-actions-heading">Other Roommate Info</h2>

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
