import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HistoryIcon, TrashIcon } from "../../components/Icons.jsx";
import Spinner from "../../components/Spinner.jsx";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { MODES, useMode } from "../../layout/ModeContext.jsx";
import { deleteHistoryEntry, fetchHistory } from "../../api/lookup.js";
import { formatDate, initials } from "../../utils/format.js";

export default function History() {
  useDocumentTitle("History — Hyeve");
  const mode = useMode();
  const navigate = useNavigate();
  const toast = useToast();
  const [state, setState] = useState({ status: "loading", items: [] });

  useEffect(() => {
    let active = true;
    fetchHistory(mode.key)
      .then(({ items }) => active && setState({ status: "ready", items }))
      .catch((error) => {
        if (!active) return;
        toast.show(error.message);
        setState({ status: "ready", items: [] });
      });
    return () => {
      active = false;
    };
  }, [mode.key, toast]);

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

  return (
    <div className="hv-simple-page">
      <h1 className="hv-page-heading">History</h1>
      <p className="hv-page-subtext">Profiles you looked up recently are kept here for 14 days.</p>
      {state.status === "loading" && (
        <div className="hv-page-loader">
          <Spinner dark />
        </div>
      )}
      {state.status === "ready" && state.items.length === 0 && (
        <div className="hv-card hv-empty-card">
          <div className="hv-icon-badge">
            <HistoryIcon width={26} height={26} />
          </div>
          <h2 className="hv-card-heading">No search history yet</h2>
          <p className="hv-muted-text">Look up a {mode.noun} and the profile will show up here.</p>
          <Link to={`${mode.base}/search`} className="hv-btn hv-btn-primary">
            Search a {mode.noun}
          </Link>
        </div>
      )}
      <ul className="hv-history-list">
        {state.items.map((entry) => (
          <li key={entry.id} className="hv-card hv-history-item">
            <button type="button" className="hv-history-open" onClick={() => open(entry)}>
              <span className="hv-history-avatar">{initials(entry.full_name)}</span>
              <span className="hv-history-text">
                <span className="hv-history-name">{entry.full_name}</span>
                <span className="hv-history-meta">
                  {entry.email} · Viewed {formatDate(entry.viewed_at)}
                </span>
              </span>
              <span className="hv-role-badge">{entry.type.toUpperCase()}</span>
            </button>
            <button
              type="button"
              className="hv-icon-button"
              onClick={() => remove(entry)}
              aria-label={`Remove ${entry.full_name} from history`}
            >
              <TrashIcon width={18} height={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
