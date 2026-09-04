import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import API_BASE_URL from "./api";
const DATA_PTS_PER_USER = 67;

const TRAIT_COLORS = { O: "#FF3D7F", C: "#3B82F6", E: "#F59E0B", A: "#22C55E", N: "#A855F7" };
const TRAIT_NAMES = { O: "Openness", C: "Conscientiousness", E: "Extraversion", A: "Agreeableness", N: "Neuroticism" };

const ARCH_CONFIG = {
  Sage: "#7C6FF7",
  Artificer: "#2BBFBF",
  Titan: "#EF4444",
  Oculus: "#84CC16",
  Marshal: "#A855F7",
  Vigor: "#CA8A04",
  Catalyst: "#FB923C",
  Monolith: "#0D9488",
};
const ARCH_KEYS = Object.keys(ARCH_CONFIG);

const FACETS = [
  "Imagination", "Curiosity", "Actions", "Adventurous", "Aesthetics",
  "Discipline", "Orderliness", "Dutifulness", "Deliberation", "Reliability",
  "Social", "Activity", "Assertiveness", "Excitement-Seeking", "Friendliness",
  "Compliance", "Empathy", "Altruism", "Conflict Expression", "Tender-Mindedness",
  "Anxiety", "Anger", "Sensitivity", "Impulsiveness", "Self-Consciousness"
];
const FACET_TRAIT = {
  Imagination: "O", Curiosity: "O", Actions: "O", Adventurous: "O", Aesthetics: "O",
  Discipline: "C", Orderliness: "C", Dutifulness: "C", Deliberation: "C", Reliability: "C",
  Social: "E", Activity: "E", Assertiveness: "E", "Excitement-Seeking": "E", Friendliness: "E",
  Compliance: "A", Empathy: "A", Altruism: "A", "Conflict Expression": "A", "Tender-Mindedness": "A",
  Anxiety: "N", Anger: "N", Sensitivity: "N", Impulsiveness: "N", "Self-Consciousness": "N"
};

function formatCompact(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

function getSession() {
  const session = localStorage.getItem("dashboard_session");
  return session ? JSON.parse(session) : null;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [respondents, setRespondents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [globalSearch, setGlobalSearch] = useState("");
  const [archFilter, setArchFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState(-1);

  const [selectedIds, setSelectedIds] = useState([]);

  const [pricePerUser, setPricePerUser] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState("₦");

  const [modalRespondent, setModalRespondent] = useState(null);
  const [exportSearch, setExportSearch] = useState("");

  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  const fetchRespondents = useCallback(async () => {
    setLoading(true);
    try {
      const session = getSession();
      const response = await fetch(`${API_BASE_URL}/respondents`, {
        headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const mapped = data.map((r) => ({
        id: r.id,
        firstName: r.first_name,
        surname: r.last_name,
        email: r.email,
        archetype: r.archetype,
        scores: r.scores,
        facetScores: r.facet_scores,
        answers: r.answers,
        date: r.date,
      }));
      setRespondents(mapped);
      showToast(`Loaded ${mapped.length} respondent${mapped.length !== 1 ? "s" : ""}`);
    } catch (err) {
      showToast("Error loading data from server");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    fetchRespondents();
  }, [navigate, fetchRespondents]);

  function logoutDashboard() {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("dashboard_session");
      navigate("/login");
    }
  }

  function toggleSidebar() {
    setSidebarOpen((s) => !s);
  }

  function goToPage(id) {
    setActivePage(id);
    setSidebarOpen(false);
    if (id === "respondents") {
      setCurrentPage(1);
    }
  }

  const filteredData = useMemo(() => {
    const q = globalSearch.toLowerCase();
    let data = respondents.filter((r) => {
      const matchQ = !q || `${r.firstName} ${r.surname} ${r.email} ${r.id} ${r.archetype}`.toLowerCase().includes(q);
      const matchA = !archFilter || r.archetype === archFilter;
      return matchQ && matchA;
    });

    const map = {
      name: (r) => r.firstName,
      id: (r) => r.id,
      email: (r) => r.email,
      arch: (r) => r.archetype,
      date: (r) => r.date,
    };
    const fn = map[sortKey];
    if (fn) {
      data = [...data].sort((a, b) => {
        const av = fn(a);
        const bv = fn(b);
        return av < bv ? sortDir : av > bv ? -sortDir : 0;
      });
    }
    return data;
  }, [respondents, globalSearch, archFilter, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => d * -1);
    } else {
      setSortKey(key);
      setSortDir(-1);
    }
  }

  function clearFilters() {
    setGlobalSearch("");
    setArchFilter("");
    setMonthFilter("");
    setCurrentPage(1);
  }

  function toggleSelectAll(checked) {
    const start = (currentPage - 1) * rowsPerPage;
    const pageIds = filteredData.slice(start, start + rowsPerPage).map((r) => r.id);
    setSelectedIds(checked ? pageIds : []);
  }

  function toggleRowSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  function bulkDelete() {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected respondent${selectedIds.length > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setRespondents((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
    showToast(`${selectedIds.length} respondent${selectedIds.length > 1 ? "s" : ""} deleted`);
    setSelectedIds([]);
  }

  function deleteRespondent(id) {
    if (!window.confirm("Delete this respondent?")) return;
    setRespondents((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    showToast("Respondent deleted");
  }

  function clearAllData() {
    if (!window.confirm("Delete all records? This cannot be undone.")) return;
    setRespondents([]);
    setSelectedIds([]);
    showToast("All data cleared");
  }

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageData = filteredData.slice(pageStart, pageStart + rowsPerPage);

  const recentUsers = useMemo(() => {
    return [...respondents].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [respondents]);

  const archCount = useMemo(() => {
    const count = {};
    respondents.forEach((r) => (count[r.archetype] = (count[r.archetype] || 0) + 1));
    return count;
  }, [respondents]);

  const traitAverages = useMemo(() => {
    const total = respondents.length;
    const result = {};
    ["O", "C", "E", "A", "N"].forEach((t) => {
      result[t] = total ? (respondents.reduce((s, r) => s + r.scores[t], 0) / total).toFixed(1) : null;
    });
    return result;
  }, [respondents]);

  const facetAverages = useMemo(() => {
    const result = {};
    FACETS.forEach((f) => {
      const vals = respondents.map((r) => r.facetScores?.[f]).filter((v) => v !== undefined && v !== null);
      result[f] = vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : null;
    });
    return result;
  }, [respondents]);

  const sortedFacets = useMemo(() => {
    return FACETS.filter((f) => facetAverages[f]).sort((a, b) => parseFloat(facetAverages[b]) - parseFloat(facetAverages[a]));
  }, [facetAverages]);

  function exportCSV(rows) {
    const data = rows || respondents;
    if (!data.length) {
      showToast("No data to export");
      return;
    }
    const headers = ["TrustID", "FirstName", "Surname", "Email", "Archetype", "O", "C", "E", "A", "N", "Date", ...Array.from({ length: 25 }, (_, i) => `Q${i + 1}`), ...FACETS];
    const csv = [
      headers.join(","),
      ...data.map((r) =>
        [
          r.id, r.firstName, r.surname, r.email, r.archetype,
          r.scores.O, r.scores.C, r.scores.E, r.scores.A, r.scores.N,
          r.date, ...r.answers, ...FACETS.map((f) => r.facetScores?.[f] || 0),
        ].join(",")
      ),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `ocean_data_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast("CSV downloaded");
  }

  const exportMatches = useMemo(() => {
    const q = exportSearch.toLowerCase();
    if (!q) return [];
    return respondents.filter((r) => `${r.firstName} ${r.surname} ${r.id}`.toLowerCase().includes(q)).slice(0, 6);
  }, [exportSearch, respondents]);

  function copyToClipboard(text, msg) {
    navigator.clipboard.writeText(text).then(() => showToast(msg));
  }

  const semiDonutPaths = useMemo(() => {
    const total = respondents.length;
    if (!total) return null;
    const cx = 150, cy = 150, r = 120;
    const entries = Object.entries(archCount).sort((a, b) => b[1] - a[1]);
    const totalArc = Math.PI;
    let startAngle = Math.PI;
    const paths = [];
    entries.forEach(([arch, count]) => {
      const sweep = (count / total) * totalArc;
      const endAngle = startAngle + sweep;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = sweep > Math.PI ? 1 : 0;
      const color = ARCH_CONFIG[arch] || "#999";
      paths.push(`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`);
      startAngle = endAngle;
    });
    return { entries, paths };
  }, [respondents, archCount]);

  const totalDataPoints = respondents.length * DATA_PTS_PER_USER;
  const totalRevenue = respondents.length * pricePerUser;

  const maxArchCount = Math.max(...Object.values(archCount), 1);

  return (
    <div className="dash-root">
      <aside className={"sidebar" + (sidebarOpen ? " open" : "")} id="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-title">HYEVE</div>
          <div className="sidebar-logo-sub">Admin Dashboard</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          <button className={"nav-item" + (activePage === "overview" ? " active" : "")} onClick={() => goToPage("overview")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round">
              <path d="M13.6903 19.4567C13.5 18.9973 13.5 18.4149 13.5 17.25C13.5 16.0851 13.5 15.5027 13.6903 15.0433C13.944 14.4307 14.4307 13.944 15.0433 13.6903C15.5027 13.5 16.0851 13.5 17.25 13.5C18.4149 13.5 18.9973 13.5 19.4567 13.6903C20.0693 13.944 20.556 14.4307 20.8097 15.0433C21 15.5027 21 16.0851 21 17.25C21 18.4149 21 18.9973 20.8097 19.4567C20.556 20.0693 20.0693 20.556 19.4567 20.8097C18.9973 21 18.4149 21 17.25 21C16.0851 21 15.5027 21 15.0433 20.8097C14.4307 20.556 13.944 20.0693 13.6903 19.4567Z"></path>
              <path d="M13.6903 8.95671C13.5 8.49728 13.5 7.91485 13.5 6.75C13.5 5.58515 13.5 5.00272 13.6903 4.54329C13.944 3.93072 14.4307 3.44404 15.0433 3.1903C15.5027 3 16.0851 3 17.25 3C18.4149 3 18.9973 3 19.4567 3.1903C20.0693 3.44404 20.556 3.93072 20.8097 4.54329C21 5.00272 21 5.58515 21 6.75C21 7.91485 21 8.49728 20.8097 8.95671C20.556 9.56928 20.0693 10.056 19.4567 10.3097C18.9973 10.5 18.4149 10.5 17.25 10.5C16.0851 10.5 15.5027 10.5 15.0433 10.3097C14.4307 10.056 13.944 9.56928 13.6903 8.95671Z"></path>
              <path d="M3.1903 19.4567C3 18.9973 3 18.4149 3 17.25C3 16.0851 3 15.5027 3.1903 15.0433C3.44404 14.4307 3.93072 13.944 4.54329 13.6903C5.00272 13.5 5.58515 13.5 6.75 13.5C7.91485 13.5 8.49728 13.5 8.95671 13.6903C9.56928 13.944 10.056 14.4307 10.3097 15.0433C10.5 15.5027 10.5 16.0851 10.5 17.25C10.5 18.4149 10.5 18.9973 10.3097 19.4567C10.056 20.0693 9.56928 20.556 8.95671 20.8097C8.49728 21 7.91485 21 6.75 21C5.58515 21 5.00272 21 4.54329 20.8097C3.93072 20.556 3.44404 20.0693 3.1903 19.4567Z"></path>
              <path d="M3.1903 8.95671C3 8.49728 3 7.91485 3 6.75C3 5.58515 3 5.00272 3.1903 4.54329C3.44404 3.93072 3.93072 3.44404 4.54329 3.1903C5.00272 3 5.58515 3 6.75 3C7.91485 3 8.49728 3 8.95671 3.1903C9.56928 3.44404 10.056 3.93072 10.3097 4.54329C10.5 5.00272 10.5 5.58515 10.5 6.75C10.5 7.91485 10.5 8.49728 10.3097 8.95671C10.056 9.56928 9.56928 10.056 8.95671 10.3097C8.49728 10.5 7.91485 10.5 6.75 10.5C5.58515 10.5 5.00272 10.5 4.54329 10.3097C3.93072 10.056 3.44404 9.56928 3.1903 8.95671Z"></path>
            </svg>
            Overview
          </button>
          <button className={"nav-item" + (activePage === "respondents" ? " active" : "")} onClick={() => goToPage("respondents")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            User Management
          </button>
          <button className={"nav-item" + (activePage === "analytics" ? " active" : "")} onClick={() => goToPage("analytics")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6.5 17.5L6.5 14.5M11.5 17.5L11.5 8.5M16.5 17.5V13.5" strokeLinecap="round"></path>
              <path d="M21.5 5.5C21.5 7.15685 20.1569 8.5 18.5 8.5C16.8431 8.5 15.5 7.15685 15.5 5.5C15.5 3.84315 16.8431 2.5 18.5 2.5C20.1569 2.5 21.5 3.84315 21.5 5.5Z"></path>
              <path d="M21.4955 11C21.4955 11 21.5 11.3395 21.5 12C21.5 16.4784 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4784 2.5 12C2.5 7.52169 2.5 5.28252 3.89124 3.89127C5.28249 2.50003 7.52166 2.50003 12 2.50003L13 2.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            Analytics
          </button>
          <div className="nav-section-label" style={{ marginTop: "0.75rem" }}>Others</div>
          <button className={"nav-item" + (activePage === "export" ? " active" : "")} onClick={() => goToPage("export")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.99969 17.0002C2.99969 17.9302 2.99969 18.3952 3.10192 18.7767C3.37932 19.8119 4.18796 20.6206 5.22324 20.898C5.60474 21.0002 6.06972 21.0002 6.99969 21.0002L16.9997 21.0002C17.9297 21.0002 18.3947 21.0002 18.7762 20.898C19.8114 20.6206 20.6201 19.8119 20.8975 18.7767C20.9997 18.3952 20.9997 17.9302 20.9997 17.0002"></path>
              <path d="M16.4998 11.5002C16.4998 11.5002 13.1856 16.0002 11.9997 16.0002C10.8139 16.0002 7.49976 11.5002 7.49976 11.5002M11.9997 15.0002V3.00016"></path>
            </svg>
            Export Data
          </button>
          <button className={"nav-item" + (activePage === "settings" ? " active" : "")} onClick={() => goToPage("settings")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21.3175 7.14139L20.8239 6.28479C20.4506 5.63696 20.264 5.31305 19.9464 5.18388C19.6288 5.05472 19.2696 5.15664 18.5513 5.36048L17.3311 5.70418C16.8725 5.80994 16.3913 5.74994 15.9726 5.53479L15.6357 5.34042C15.2766 5.11043 15.0004 4.77133 14.8475 4.37274L14.5136 3.37536C14.294 2.71534 14.1842 2.38533 13.9228 2.19657C13.6615 2.00781 13.3143 2.00781 12.6199 2.00781H11.5051C10.8108 2.00781 10.4636 2.00781 10.2022 2.19657C9.94085 2.38533 9.83106 2.71534 9.61149 3.37536L9.27753 4.37274C9.12465 4.77133 8.84845 5.11043 8.48937 5.34042L8.15249 5.53479C7.73374 5.74994 7.25259 5.80994 6.79398 5.70418L5.57375 5.36048C4.85541 5.15664 4.49625 5.05472 4.17867 5.18388C3.86109 5.31305 3.67445 5.63696 3.30115 6.28479L2.80757 7.14139C2.45766 7.74864 2.2827 8.05227 2.31666 8.37549C2.35061 8.69871 2.58483 8.95918 3.05326 9.48012L4.0843 10.6328C4.3363 10.9518 4.51521 11.5078 4.51521 12.0077C4.51521 12.5078 4.33636 13.0636 4.08433 13.3827L3.05326 14.5354C2.58483 15.0564 2.35062 15.3168 2.31666 15.6401C2.2827 15.9633 2.45766 16.2669 2.80757 16.8741L3.30114 17.7307C3.67443 18.3785 3.86109 18.7025 4.17867 18.8316C4.49625 18.9608 4.85542 18.8589 5.57377 18.655L6.79394 18.3113C7.25263 18.2055 7.73387 18.2656 8.15267 18.4808L8.4895 18.6752C8.84851 18.9052 9.12464 19.2442 9.2775 19.6428L9.61149 20.6403C9.83106 21.3003 9.94085 21.6303 10.2022 21.8191C10.4636 22.0078 10.8108 22.0078 11.5051 22.0078H12.6199C13.3143 22.0078 13.6615 22.0078 13.9228 21.8191C14.1842 21.6303 14.294 21.3003 14.5136 20.6403L14.8476 19.6428C15.0004 19.2442 15.2765 18.9052 15.6356 18.6752L15.9724 18.4808C16.3912 18.2656 16.8724 18.2055 17.3311 18.3113L18.5513 18.655C19.2696 18.8589 19.6288 18.9608 19.9464 18.8316C20.264 18.7025 20.4506 18.3785 20.8239 17.7307L21.3175 16.8741C21.6674 16.2669 21.8423 15.9633 21.8084 15.6401C21.7744 15.3168 21.5402 15.0564 21.0718 14.5354L20.0407 13.3827C19.7887 13.0636 19.6098 12.5078 19.6098 12.0077C19.6098 11.5078 19.7888 10.9518 20.0407 10.6328L21.0718 9.48012C21.5402 8.95918 21.7744 8.69871 21.8084 8.37549C21.8423 8.05227 21.6674 7.74864 21.3175 7.14139Z" strokeLinecap="round"></path>
              <path d="M15.5195 12C15.5195 13.933 13.9525 15.5 12.0195 15.5C10.0865 15.5 8.51953 13.933 8.51953 12C8.51953 10.067 10.0865 8.5 12.0195 8.5C13.9525 8.5 15.5195 10.067 15.5195 12Z"></path>
            </svg>
            Settings
          </button>
        </nav>
        <div className="sidebar-footer">v1.0 · OCEAN Quiz</div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search by name, email, ID…" value={globalSearch} onChange={(e) => { setGlobalSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <button className="topbar-btn" onClick={() => exportCSV()}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.99969 17.0002C2.99969 17.9302 2.99969 18.3952 3.10192 18.7767C3.37932 19.8119 4.18796 20.6206 5.22324 20.898C5.60474 21.0002 6.06972 21.0002 6.99969 21.0002L16.9997 21.0002C17.9297 21.0002 18.3947 21.0002 18.7762 20.898C19.8114 20.6206 20.6201 19.8119 20.8975 18.7767C20.9997 18.3952 20.9997 17.9302 20.9997 17.0002"></path>
              <path d="M16.4998 11.5002C16.4998 11.5002 13.1856 16.0002 11.9997 16.0002C10.8139 16.0002 7.49976 11.5002 7.49976 11.5002M11.9997 15.0002V3.00016"></path>
            </svg>
            Export CSV
          </button>
          <button className="topbar-btn" style={{ background: "#6B7280", boxShadow: "0 2px 8px rgba(107,114,128,0.25)" }} onClick={logoutDashboard}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 3l.001.001M16 8l3-3m0 0l3 3m-3-3v7a4 4 0 0 1-4 4H5"/>
            </svg>
            Logout
          </button>
        </header>

        {activePage === "overview" && (
          <div className="page active" id="page-overview">
            <h1 className="page-heading">Overview</h1>

            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                    <path d="M19 21.25C19.4142 21.25 19.75 20.9142 19.75 20.5C19.75 17.3026 17.8128 14.5593 15.0488 13.375C16.6709 12.3584 17.75 10.5555 17.75 8.5C17.75 5.32436 15.1756 2.75 12 2.75C8.82436 2.75 6.25 5.32436 6.25 8.5C6.25 10.5552 7.32849 12.3583 8.9502 13.375C6.18662 14.5595 4.25 17.3029 4.25 20.5C4.25 20.9142 4.58579 21.25 5 21.25C5.41421 21.25 5.75 20.9142 5.75 20.5C5.75 17.0482 8.54822 14.25 12 14.25C15.4518 14.25 18.25 17.0482 18.25 20.5C18.25 20.9142 18.5858 21.25 19 21.25ZM12 12.75C9.65279 12.75 7.75 10.8472 7.75 8.5C7.75 6.15279 9.65279 4.25 12 4.25C14.3472 4.25 16.25 6.15279 16.25 8.5C16.25 10.8472 14.3472 12.75 12 12.75Z" fill="currentColor"></path>
                  </svg>
                </div>
                <div className="stat-value">{formatCompact(respondents.length)}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                    <path fill="currentColor" d="M3.25,19 L3.25,5 C3.25,4.294 3.634,3.712 4.131,3.271 C4.629,2.83 5.307,2.466 6.08,2.176 C7.631,1.595 9.725,1.25 12,1.25 C14.275,1.25 16.368,1.595 17.92,2.176 C18.693,2.466 19.371,2.83 19.869,3.271 C20.366,3.712 20.75,4.294 20.75,5 L20.75,19 C20.75,19.706 20.366,20.288 19.869,20.729 C19.371,21.17 18.693,21.534 17.92,21.824 C16.368,22.405 14.275,22.75 12,22.75 C9.725,22.75 7.631,22.405 6.08,21.824 C5.307,21.534 4.629,21.17 4.131,20.729 C3.634,20.288 3.25,19.706 3.25,19 Z M19.25,14.185 C18.859,14.428 18.409,14.64 17.92,14.824 C16.368,15.405 14.275,15.75 12,15.75 C9.725,15.75 7.631,15.405 6.08,14.824 C5.591,14.64 5.141,14.428 4.75,14.185 L4.75,19 C4.75,19.123 4.814,19.329 5.126,19.607 C5.438,19.883 5.932,20.166 6.606,20.419 C7.95,20.923 9.857,21.25 12,21.25 C14.143,21.25 16.05,20.923 17.393,20.419 C18.068,20.166 18.562,19.883 18.874,19.607 C19.186,19.329 19.25,19.123 19.25,19 Z M19.25,7.185 C18.859,7.428 18.409,7.64 17.92,7.824 C16.368,8.405 14.275,8.75 12,8.75 C9.725,8.75 7.631,8.405 6.08,7.824 C5.591,7.64 5.141,7.428 4.75,7.185 L4.75,12 C4.75,12.123 4.814,12.329 5.126,12.606 C5.438,12.883 5.932,13.166 6.606,13.419 C7.95,13.923 9.857,14.25 12,14.25 C14.143,14.25 16.05,13.923 17.393,13.419 C18.068,13.166 18.562,12.883 18.874,12.606 C19.186,12.329 19.25,12.123 19.25,12 Z M5.126,4.393 C4.814,4.671 4.75,4.877 4.75,5 C4.75,5.123 4.814,5.329 5.126,5.607 C5.438,5.883 5.932,6.166 6.606,6.419 C7.95,6.923 9.857,7.25 12,7.25 C14.143,7.25 16.05,6.923 17.393,6.419 C18.068,6.166 18.562,5.883 18.874,5.607 C19.186,5.329 19.25,5.123 19.25,5 C19.25,4.877 19.186,4.671 18.874,4.393 C18.562,4.117 18.068,3.834 17.393,3.581 C16.05,3.077 14.143,2.75 12,2.75 C9.857,2.75 7.95,3.077 6.606,3.581 C5.932,3.834 5.438,4.117 5.126,4.393 Z M6.282,10.628 C6.401,10.231 6.819,10.007 7.216,10.126 C7.78,10.295 8.417,10.437 9.113,10.542 C9.522,10.604 9.804,10.987 9.742,11.396 C9.68,11.806 9.297,12.087 8.888,12.025 C8.132,11.911 7.424,11.755 6.784,11.562 C6.388,11.443 6.163,11.025 6.282,10.628 Z M6.282,17.628 C6.401,17.231 6.819,17.007 7.216,17.126 C7.78,17.295 8.417,17.437 9.113,17.542 C9.522,17.604 9.804,17.987 9.742,18.396 C9.68,18.806 9.297,19.087 8.888,19.025 C8.132,18.911 7.424,18.754 6.784,18.562 C6.388,18.443 6.163,18.025 6.282,17.628 Z"></path>
                  </svg>
                </div>
                <div className="stat-value">{formatCompact(totalDataPoints)}</div>
                <div className="stat-label">Total Data Points</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M2.25146 11C2.25146 15.82 6.18146 19.75 11.0015 19.75C13.1411 19.75 15.1053 18.9756 16.6283 17.6927L20.4709 21.5354C20.6209 21.6854 20.8109 21.7553 21.0009 21.7553C21.1909 21.7553 21.381 21.6854 21.531 21.5354C21.821 21.2454 21.821 20.7653 21.531 20.4753L17.6888 16.6331C18.9749 15.1093 19.7515 13.1426 19.7515 11C19.7515 6.18 15.8215 2.25 11.0015 2.25C6.18146 2.25 2.25146 6.18 2.25146 11ZM3.75146 11C3.75146 7 7.00146 3.75 11.0015 3.75C15.0015 3.75 18.2515 7 18.2515 11C18.2515 15 15.0015 18.25 11.0015 18.25C7.00146 18.25 3.75146 15 3.75146 11Z" fill="currentColor"></path>
                  </svg>
                </div>
                <div className="stat-value">{formatCompact(respondents.length)}</div>
                <div className="stat-label">Total Requests</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                    <path fill="currentColor" d="M12.5,1.25 C18.437,1.25 23.25,6.063 23.25,12 C23.25,17.937 18.437,22.75 12.5,22.75 C6.563,22.75 1.75,17.937 1.75,12 C1.75,6.063 6.563,1.25 12.5,1.25 Z M3.25,12 C3.25,17.109 7.391,21.25 12.5,21.25 C17.609,21.25 21.75,17.109 21.75,12 C21.75,6.891 17.609,2.75 12.5,2.75 C7.391,2.75 3.25,6.891 3.25,12 Z M13.223,7 L13.223,7.361 C14.874,7.619 15.826,8.984 15.954,9.966 C16.007,10.377 15.718,10.753 15.307,10.807 C14.896,10.86 14.52,10.57 14.467,10.16 C14.41,9.724 13.813,8.818 12.661,8.818 C12.609,8.818 12.559,8.819 12.509,8.821 L12.497,8.821 C11.11,8.878 10.675,9.638 10.622,9.809 L10.617,9.826 L10.611,9.842 C10.537,10.047 10.526,10.327 10.641,10.534 C10.729,10.694 10.998,10.998 11.908,11.063 C13.216,11.156 14.319,11.283 15.069,11.676 C15.478,11.891 15.816,12.2 16.021,12.639 C16.219,13.062 16.261,13.534 16.22,14.02 C16.129,15.108 15.562,15.825 14.813,16.227 C14.309,16.497 13.744,16.616 13.223,16.653 L13.223,17 C13.223,17.414 12.888,17.75 12.473,17.75 C12.059,17.75 11.723,17.414 11.723,17 L11.723,16.561 C11.256,16.473 10.762,16.324 10.314,16.098 C9.556,15.715 8.781,15.026 8.724,13.914 C8.702,13.5 9.021,13.148 9.434,13.126 C9.848,13.105 10.2,13.423 10.222,13.837 C10.24,14.184 10.468,14.495 10.99,14.758 C11.509,15.02 12.175,15.149 12.685,15.165 L12.685,15.165 C13.21,15.182 13.729,15.106 14.104,14.905 C14.431,14.729 14.679,14.448 14.725,13.896 C14.753,13.561 14.711,13.378 14.663,13.275 C14.622,13.187 14.549,13.097 14.372,13.005 C13.948,12.782 13.174,12.656 11.802,12.559 C10.567,12.472 9.739,12.003 9.328,11.259 C8.947,10.57 9.028,9.823 9.194,9.35 C9.418,8.648 10.212,7.69 11.723,7.403 L11.723,7 C11.723,6.586 12.059,6.25 12.473,6.25 C12.888,6.25 13.223,6.586 13.223,7 Z"></path>
                  </svg>
                </div>
                <div className="stat-value">{currencySymbol}{formatCompact(totalRevenue)}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>

            <div className="chart-row">
              <div className="chart-card">
                <div className="chart-card-title">Archetype Distribution</div>
                <div className="semi-donut-wrap">
                  <svg className="semi-donut-svg" viewBox="0 0 300 160">
                    <path d="M 30 150 A 120 120 0 0 1 270 150" fill="none" stroke="#E8E8E8" strokeWidth="28" />
                    {semiDonutPaths && semiDonutPaths.entries.map(([arch], i) => (
                      <path key={arch} d={semiDonutPaths.paths[i]} fill="none" stroke={ARCH_CONFIG[arch] || "#999"} strokeWidth="28" strokeLinecap="butt" />
                    ))}
                    {!semiDonutPaths && (
                      <path d="M 30 150 A 120 120 0 0 1 270 150" fill="none" stroke="#E0E0E0" strokeWidth="28" strokeLinecap="round" />
                    )}
                  </svg>
                  <div className="donut-legend-grid">
                    {semiDonutPaths ? semiDonutPaths.entries.map(([arch, count]) => (
                      <div className="legend-row" key={arch}>
                        <div className="legend-dot" style={{ background: ARCH_CONFIG[arch] || "#999" }}></div>
                        <span className="legend-name">{arch}</span>
                        <span className="legend-count">{count}</span>
                      </div>
                    )) : (
                      <div style={{ fontSize: "12px", color: "var(--txt-faint)", gridColumn: "1/-1" }}>No data yet</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-card-title">Average Trait Scores</div>
                <div className="trait-bar-list">
                  {["O", "C", "E", "A", "N"].map((t) => (
                    <div className="trait-bar-item" key={t}>
                      <div className="trait-bar-header">
                        <span className="trait-bar-name">{TRAIT_NAMES[t]}</span>
                        <span className="trait-bar-score">{traitAverages[t] || "—"}</span>
                      </div>
                      <div className="trait-track">
                        <div className="trait-fill" style={{ width: (traitAverages[t] ? Math.round((traitAverages[t] / 10) * 100) : 0) + "%", background: TRAIT_COLORS[t] }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="section-header">
              <div className="section-title">Recent Users</div>
              <button className="view-all-btn" onClick={() => goToPage("respondents")}>
                View all
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Archetype</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {recentUsers.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: "center", padding: "2.5rem", color: "var(--txt-faint)" }}>No respondents yet — user data will appear here</td></tr>
                  ) : recentUsers.map((r) => (
                    <tr key={r.id}>
                      <td className="td-name">{r.firstName} {r.surname}</td>
                      <td><span className={"arch-pill arch-" + r.archetype}>{r.archetype}</span></td>
                      <td className="td-date">{r.date}</td>
                      <td>
                        <button className="act-view" onClick={() => setModalRespondent(r)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          view
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activePage === "respondents" && (
          <div className="page active" id="page-respondents">
            <h1 className="page-heading">User Management</h1>
            <div className={"bulk-bar" + (selectedIds.length ? " visible" : "")}>
              <span><span className="bulk-count">{selectedIds.length}</span> selected</span>
              <button className="bulk-btn bulk-delete" onClick={bulkDelete}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                Delete Selected
              </button>
              <button className="bulk-btn bulk-clear" onClick={clearSelection}>Clear selection</button>
            </div>
            <div className="filter-bar">
              <select className="filter-select" value={archFilter} onChange={(e) => { setArchFilter(e.target.value); setCurrentPage(1); }}>
                <option value="">All Archetypes</option>
                {ARCH_KEYS.map((a) => <option key={a}>{a}</option>)}
              </select>
              <select className="filter-select" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                <option value="">All Time</option>
                <option>This Month</option>
                <option>Last Month</option>
              </select>
              <button className="filter-btn" onClick={clearFilters}>Clear filters</button>
              <span style={{ fontSize: "12px", color: "var(--txt-faint)", marginLeft: "auto" }}>
                {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "36px" }}>
                      <input
                        type="checkbox"
                        className="select-all-cb"
                        checked={pageData.length > 0 && pageData.every((r) => selectedIds.includes(r.id))}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th onClick={() => handleSort("id")}>Trust ID ↕</th>
                    <th onClick={() => handleSort("name")}>Name ↕</th>
                    <th onClick={() => handleSort("email")}>Email</th>
                    <th onClick={() => handleSort("arch")}>Archetype ↕</th>
                    <th>O</th><th>C</th><th>E</th><th>A</th><th>N</th>
                    <th onClick={() => handleSort("date")}>Date ↕</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {respondents.length === 0 ? (
                    <tr><td colSpan="11" style={{ textAlign: "center", padding: "3rem", color: "var(--txt-faint)" }}>No data — user data will appear here</td></tr>
                  ) : pageData.map((r) => (
                    <tr key={r.id}>
                      <td className="cb-wrap">
                        <input type="checkbox" className="row-cb" checked={selectedIds.includes(r.id)} onChange={() => toggleRowSelect(r.id)} />
                      </td>
                      <td className="td-id" title={r.id}>{r.id.slice(0, 10)}…</td>
                      <td className="td-name">{r.firstName} {r.surname}</td>
                      <td className="td-email">{r.email}</td>
                      <td><span className={"arch-pill arch-" + r.archetype}>{r.archetype}</span></td>
                      {["O", "C", "E", "A", "N"].map((t) => {
                        const s = r.scores[t];
                        const band = s <= 4.0 ? "Low" : s <= 6.0 ? "Mid" : "High";
                        const cls = s <= 4.0 ? "score-low" : s <= 6.0 ? "score-mid" : "score-high";
                        return <td key={t}><span className={"score-pill " + cls}>{band}</span></td>;
                      })}
                      <td className="td-date">{r.date}</td>
                      <td>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button className="act-view" onClick={() => setModalRespondent(r)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>view
                          </button>
                          <button className="act-danger" onClick={() => deleteRespondent(r.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <span>
                  {filteredData.length === 0 ? "" : `Showing ${pageStart + 1}–${Math.min(pageStart + rowsPerPage, filteredData.length)} of ${filteredData.length}`}
                </span>
                <div className="page-btns">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} className={"page-btn" + (i + 1 === currentPage ? " active" : "")} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activePage === "analytics" && (
          <div className="page active" id="page-analytics">
            <h1 className="page-heading">Analytics</h1>
            <div className="analytics-grid">
              <div className="chart-card">
                <div className="chart-card-title">Archetype Frequency</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {Object.entries(archCount).length === 0 ? (
                    <div style={{ color: "var(--txt-faint)", fontSize: "13px" }}>No data yet</div>
                  ) : Object.entries(archCount).sort((a, b) => b[1] - a[1]).map(([arch, count]) => (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }} key={arch}>
                      <span style={{ fontSize: "11.5px", color: "var(--txt-secondary)", width: "75px", textAlign: "right", flexShrink: 0 }}>{arch}</span>
                      <div style={{ flex: 1, height: "10px", background: "rgba(0,0,0,0.07)", borderRadius: "99px", overflow: "hidden" }}>
                        <div style={{ width: Math.round((count / maxArchCount) * 100) + "%", height: "10px", borderRadius: "99px", background: ARCH_CONFIG[arch] || "#999" }}></div>
                      </div>
                      <span style={{ fontSize: "11.5px", color: "var(--txt-secondary)", width: "24px" }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-card-title">Trait Score Distribution</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {["O", "C", "E", "A", "N"].map((t) => (
                    <div className="trait-bar-item" key={t}>
                      <div className="trait-bar-header">
                        <span className="trait-bar-name">{TRAIT_NAMES[t]}</span>
                        <span className="trait-bar-score">{traitAverages[t] || "—"}</span>
                      </div>
                      <div className="trait-track">
                        <div className="trait-fill" style={{ width: (traitAverages[t] ? Math.round((traitAverages[t] / 10) * 100) : 0) + "%", background: TRAIT_COLORS[t] }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-card-title">Facet Rankings — Average Score</div>
              <table className="facet-tbl">
                <thead><tr><th>#</th><th>Facet</th><th>Trait</th><th>Avg Score</th><th>Band</th></tr></thead>
                <tbody>
                  {sortedFacets.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: "center", color: "var(--txt-faint)", padding: "1.5rem" }}>No data yet</td></tr>
                  ) : sortedFacets.map((f, i) => {
                    const s = parseFloat(facetAverages[f]);
                    const band = s >= 7 ? "High" : s >= 5 ? "Mid" : "Low";
                    const bandColor = s >= 7 ? "#22C55E" : s >= 5 ? "#F59E0B" : "#EF4444";
                    return (
                      <tr key={f}>
                        <td style={{ fontWeight: 700, color: "var(--txt-primary)" }}>{i + 1}</td>
                        <td>{f}</td>
                        <td style={{ color: TRAIT_COLORS[FACET_TRAIT[f]] || "#999", fontWeight: 500 }}>{TRAIT_NAMES[FACET_TRAIT[f]] || "—"}</td>
                        <td style={{ fontWeight: 700, color: "var(--txt-primary)" }}>{facetAverages[f]}</td>
                        <td style={{ color: bandColor, fontWeight: 600 }}>{band}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activePage === "export" && (
          <div className="page active" id="page-export">
            <h1 className="page-heading">Export Data</h1>
            <div className="settings-card">
              <h3>Download</h3>
              <div className="setting-row">
                <div><div className="setting-label">Full respondent table (CSV)</div><div className="setting-sub">All data points per respondent</div></div>
                <button className="topbar-btn" onClick={() => exportCSV()}>Download CSV</button>
              </div>
              <div className="setting-row">
                <div><div className="setting-label">Filtered results only</div><div className="setting-sub">Exports currently filtered rows</div></div>
                <button className="topbar-btn" onClick={() => exportCSV(filteredData)}>Export Filtered</button>
              </div>
            </div>
            <div className="settings-card">
              <h3>Find &amp; Copy Trust ID</h3>
              <input
                className="setting-input"
                placeholder="Search by name or ID…"
                style={{ width: "100%", marginBottom: "0.75rem" }}
                value={exportSearch}
                onChange={(e) => setExportSearch(e.target.value)}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "220px", overflowY: "auto" }}>
                {exportSearch && exportMatches.length === 0 && (
                  <div style={{ fontSize: "12.5px", color: "var(--txt-faint)" }}>No matches found</div>
                )}
                {exportMatches.map((r) => (
                  <div className="export-search-result" key={r.id}>
                    <span>{r.firstName} {r.surname} · <span style={{ fontFamily: "monospace", color: "var(--txt-faint)" }}>{r.id.slice(0, 14)}…</span></span>
                    <button className="act-view" onClick={() => copyToClipboard(r.id, "ID copied")}>Copy ID</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activePage === "settings" && (
          <div className="page active" id="page-settings">
            <h1 className="page-heading">Settings</h1>
            <div className="settings-card">
              <h3>Revenue &amp; Pricing</h3>
              <div className="setting-row">
                <div><div className="setting-label">Price per respondent</div><div className="setting-sub">Used to calculate Total Revenue</div></div>
                <input type="number" className="setting-input" style={{ width: "110px" }} value={pricePerUser} onChange={(e) => setPricePerUser(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="setting-row">
                <div><div className="setting-label">Currency symbol</div></div>
                <input type="text" className="setting-input" style={{ width: "55px" }} value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} />
              </div>
            </div>
            <div className="settings-card">
              <h3>Table Display</h3>
              <div className="setting-row">
                <div><div className="setting-label">Rows per page</div></div>
                <select className="setting-input" value={rowsPerPage} onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
            <div className="settings-card">
              <h3>Data Management</h3>
              <div className="setting-row">
                <div><div className="setting-label">Reload from server</div><div className="setting-sub">Fetches the latest respondent data from the API</div></div>
                <button className="topbar-btn" onClick={fetchRespondents}>Reload</button>
              </div>
              <div className="setting-row">
                <div><div className="setting-label">Clear all data</div><div className="setting-sub">Removes all respondent records from this view</div></div>
                <button className="danger-btn" onClick={clearAllData}>Clear All</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {modalRespondent && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setModalRespondent(null); }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModalRespondent(null)}>×</button>
            <div className="modal-name">{modalRespondent.firstName} {modalRespondent.surname}</div>
            <div className="modal-meta">{modalRespondent.email} · {modalRespondent.date}</div>
            <div className="modal-section">
              <div className="modal-sec-label">Trust ID</div>
              <div className="modal-id-box">
                <span>{modalRespondent.id}</span>
                <button className="copy-icon-btn" onClick={() => copyToClipboard(modalRespondent.id, "Trust ID copied")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
            </div>
            <div className="modal-section">
              <div className="modal-sec-label">Archetype</div>
              <span className={"arch-pill arch-" + modalRespondent.archetype}>{modalRespondent.archetype}</span>
            </div>
            <div className="modal-section">
              <div className="modal-sec-label">Trait Scores</div>
              <div>
                {["O", "C", "E", "A", "N"].map((t) => (
                  <div className="modal-trait-row" key={t}>
                    <div className="modal-trait-header">
                      <span className="modal-trait-name">{TRAIT_NAMES[t]}</span>
                      <span className="modal-trait-score">{modalRespondent.scores[t]}/10</span>
                    </div>
                    <div className="modal-bar-track">
                      <div className="modal-bar-fill" style={{ width: Math.round((modalRespondent.scores[t] / 10) * 100) + "%", background: TRAIT_COLORS[t] }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-section">
              <div className="modal-sec-label">Quiz Answers (Q1–Q25)</div>
              <div className="modal-answers">
                {modalRespondent.answers.map((a, i) => (
                  <div className="modal-ans-row" key={i}><span className="modal-q-num">Q{i + 1}</span><span>Option {a}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={"toast" + (toastVisible ? " show" : "")}>{toast}</div>
    </div>
  );
}
