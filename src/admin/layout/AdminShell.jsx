import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import ToastView from "../components/ToastView.jsx";
import useAdmin from "../hooks/useAdmin.js";
import useIdleLogout from "../hooks/useIdleLogout.js";
import useToast from "../hooks/useToast.js";
import Sidebar from "./Sidebar.jsx";

export default function AdminShell() {
  const { me, status, error, signOut } = useAdmin();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { toast, show } = useToast();

  useIdleLogout(status === "ready", signOut);

  if (status === "loading") {
    return (
      <div className="pg-admin">
        <main style={{ marginLeft: 0 }}>
          <div id="view">
            <LoadingBlock />
          </div>
        </main>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="pg-admin">
        <main style={{ marginLeft: 0 }}>
          <div id="view">
            <ErrorBlock message={error} onRetry={() => window.location.reload()} />
          </div>
        </main>
      </div>
    );
  }

  const search = (event) => {
    if (event.key !== "Enter" || !me.permissions.view.includes("users")) return;
    const value = event.target.value.trim();
    if (!value) return;
    navigate(`/admin/users?q=${encodeURIComponent(value)}`);
    show("Showing matches in Users");
    event.target.value = "";
  };

  return (
    <div className="pg-admin">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} onLogout={() => setConfirming(true)} />
      <div id="scrim" className={menuOpen ? "on" : ""} onClick={() => setMenuOpen(false)} />
      <main>
        <header>
          <button type="button" className="btn" id="ham" aria-label="Menu" onClick={() => setMenuOpen(true)}>
            ☰
          </button>
          <input className="in gs" id="gs" placeholder="Search users, Trust IDs, tickets…" onKeyDown={search} aria-label="Search users" />
          <span className="tag pu" id="rt">
            {me.role}
          </span>
        </header>
        <div id="view">
          <Outlet context={{ toast: { show } }} />
        </div>
      </main>
      {confirming && (
        <ConfirmDialog
          title="Log out?"
          body="You will be signed out of the admin dashboard."
          confirmLabel="Log out"
          danger={false}
          onClose={() => setConfirming(false)}
          onConfirm={signOut}
        />
      )}
      <ToastView toast={toast} />
    </div>
  );
}
