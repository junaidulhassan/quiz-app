import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HistoryIcon, TrashIcon } from "../../components/LookupIcons.jsx";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { MODES, useMode } from "../../layout/ModeContext.jsx";
import { deleteHistoryEntry, fetchHistory } from "../../api/lookup.js";

const TENANT_TAGS = [
  { label: "Property Damage", color: "#ec4899" },
  { label: "Delay Payments", color: "#3b82f6" },
  { label: "Maintenance", color: "#8b5cf6" },
  { label: "Lifestyle", color: "#f59e0b" },
  { label: "Arguments", color: "#10b981" },
];

function TenantCard({ entry, onDelete, onOpen }) {
  const { overall_score: score, score_description: description } = entry.summary;
  return (
    <div className="history-record-card">
      <div className="history-record-header">
        <div>
          <h2 className="history-record-name">{entry.full_name}</h2>
          <span className="tenant-id-role-badge">TENANT</span>
        </div>
        <button type="button" className="history-record-delete" onClick={onDelete} aria-label={`Remove ${entry.full_name} from history`}>
          <TrashIcon />
        </button>
      </div>
      <div className="history-record-summary-row">
        <p className="history-record-summary">{description}</p>
        <div className="history-record-score">
          <span className="history-record-score-number">{score}</span>
          <span className="history-record-score-max">/100</span>
        </div>
      </div>
      <div className="history-record-tags">
        {TENANT_TAGS.map((tag) => (
          <span key={tag.label} className="history-record-tag">
            <span className="history-record-tag-dot" style={{ background: tag.color }} />
            {tag.label}
          </span>
        ))}
      </div>
      <button type="button" className="history-record-see-more" onClick={onOpen}>
        See more
      </button>
    </div>
  );
}

function RoommateCard({ entry, onDelete, onOpen }) {
  const about = entry.summary;
  const rows = [
    { label: "Lifestyle", value: about.about?.lifestyle },
    { label: "Alcohol Intake", value: about.about?.alcohol_intake },
    { label: "Late night hours", value: about.about?.late_night_hours },
    { label: "Pets", value: about.about?.pets },
  ];
  return (
    <div className="history-record-card">
      <div className="history-record-header">
        <div>
          <h2 className="history-record-name">{entry.full_name}</h2>
          <span className="tenant-id-role-badge">ROOMMATE</span>
        </div>
        <button type="button" className="history-record-delete" onClick={onDelete} aria-label={`Remove ${entry.full_name} from history`}>
          <TrashIcon />
        </button>
      </div>
      <div className="history-record-about">
        {rows.map((row) => (
          <div key={row.label} className="history-record-about-row">
            <span className="history-record-about-label">{row.label}</span>
            <span className="history-record-about-value">{row.value}</span>
          </div>
        ))}
      </div>
      <button type="button" className="history-record-see-more" onClick={onOpen}>
        See more
      </button>
    </div>
  );
}

export default function History() {
  useDocumentTitle("History — Hyeve");
  const mode = useMode();
  const navigate = useNavigate();
  const toast = useToast();
  const [state, setState] = useState({ status: "loading", items: [] });

  useEffect(() => {
    let active = true;
    fetchHistory()
      .then(({ items }) => active && setState({ status: "ready", items }))
      .catch((error) => {
        if (!active) return;
        toast.show(error.message);
        setState({ status: "ready", items: [] });
      });
    return () => {
      active = false;
    };
  }, [toast]);

  const remove = async (entry) => {
    try {
      await deleteHistoryEntry(entry.id);
      setState((current) => ({ ...current, items: current.items.filter((item) => item.id !== entry.id) }));
    } catch (error) {
      toast.show(error.message);
    }
  };

  const open = (entry) => {
    const target = MODES[entry.type];
    navigate(`${target.base}/${target.profilePath}/${entry.respondent_id}`);
  };

  const items = state.items.filter((entry) => entry.summary && Object.keys(entry.summary).length > 0);

  if (state.status === "loading") return <div className="history-page" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <div className="history-page">
        <div className="history-content">
          <h1 className="history-heading">History</h1>
          <p className="history-subtext">Profiles you've recently looked up.</p>

          <div className="history-card">
            <div className="history-icon">
              <HistoryIcon />
            </div>
            <h2 className="history-card-heading">No search history yet</h2>
            <p className="history-card-description">
              Profiles you searched will show up here so you can quickly revisit their rental behaviours.
            </p>
            <button type="button" className="history-card-button" id="history-search-btn" onClick={() => navigate(`${mode.base}/search`)}>
              Search a Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-populated-content">
        <h1 className="history-heading">History</h1>
        <p className="history-subtext">Profiles you've recently looked up.</p>

        <div className="history-record-grid" id="history-record-grid">
          {items.map((entry) =>
            entry.type === "tenant" ? (
              <TenantCard key={entry.id} entry={entry} onDelete={() => remove(entry)} onOpen={() => open(entry)} />
            ) : (
              <RoommateCard key={entry.id} entry={entry} onDelete={() => remove(entry)} onOpen={() => open(entry)} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
