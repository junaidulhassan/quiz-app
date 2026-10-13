import { useState } from "react";
import { Outlet } from "react-router-dom";
import { LoadingBlock, ErrorBlock } from "../components/StateBlock.jsx";
import ToastView from "../components/ToastView.jsx";
import useAdmin from "../hooks/useAdmin.js";
import useIdleLogout from "../hooks/useIdleLogout.js";
import useToast from "../hooks/useToast.js";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AdminShell() {
  const { status, error, signOut } = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const { toast, show, hide } = useToast();

  useIdleLogout(status === "ready", signOut);

  if (status === "loading") {
    return (
      <div className="adm-fullscreen">
        <LoadingBlock label="Loading dashboard…" />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="adm-fullscreen">
        <ErrorBlock message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="adm-shell">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && <div className="adm-scrim" onClick={() => setMenuOpen(false)} />}
      <div className="adm-main">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="adm-view">
          <Outlet context={{ toast: { show } }} />
        </main>
      </div>
      <ToastView toast={toast} onClose={hide} />
    </div>
  );
}
