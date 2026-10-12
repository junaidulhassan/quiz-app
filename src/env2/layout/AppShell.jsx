import { useCallback, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import useToast from "../hooks/useToast.js";
import Modal from "../components/Modal.jsx";
import { CloseIcon, MenuIcon } from "../components/Icons.jsx";
import useIdleLogout from "../hooks/useIdleLogout.js";
import { RequireOnboarded } from "../routes/guards.jsx";
import { ModeProvider, MODES } from "./ModeContext.jsx";
import Sidebar, { Brand, ModeSelector, NavList, SidebarFooter } from "./Sidebar.jsx";

function Shell({ mode }) {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogout = useCallback(async () => {
    setConfirmingLogout(false);
    setDrawerOpen(false);
    await logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const handleIdle = useCallback(async () => {
    await logout();
    toast.show("You were logged out after an hour of inactivity.");
    navigate("/login", { replace: true });
  }, [logout, navigate, toast]);

  useIdleLogout(true, handleIdle);

  const selectMode = (next) => {
    if (next.key === mode.key) return;
    const section = location.pathname.split("/")[2];
    const stays = ["search", "history", "qr-scan", "billing", "profile"].includes(section);
    navigate(`${next.base}/${stays ? section : "search"}`);
    setDrawerOpen(false);
  };

  return (
    <ModeProvider value={mode}>
      <div className="hv-app-shell">
        <Sidebar onSelectMode={selectMode} onLogout={() => setConfirmingLogout(true)} />
        <div className="hv-content-area">
          <header className="hv-responsive-header">
            <div className="hv-header-logo">
              <img src="/logo/hyeve.png" alt="Hyeve" />
            </div>
            <ModeSelector onSelect={selectMode} />
            <button
              type="button"
              className="hv-header-hamburger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
            >
              <MenuIcon width={18} height={18} />
            </button>
          </header>
          <main className="hv-main-content">
            <Outlet />
          </main>
        </div>
        <div
          className={`hv-drawer-overlay${drawerOpen ? " is-open" : ""}`}
          onMouseDown={() => setDrawerOpen(false)}
        >
          <div className="hv-drawer" onMouseDown={(event) => event.stopPropagation()}>
            <div className="hv-drawer-head">
              <Brand />
              <button
                type="button"
                className="hv-drawer-close"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
              >
                <CloseIcon width={16} height={16} />
              </button>
            </div>
            <NavList onNavigate={() => setDrawerOpen(false)} />
            <SidebarFooter onLogout={() => setConfirmingLogout(true)} />
          </div>
        </div>
      </div>
      <Modal open={confirmingLogout} title="Leaving Hyeve already?" onClose={() => setConfirmingLogout(false)}>
        <p className="hv-modal-text">You will need to log in again to look up profiles.</p>
        <div className="hv-modal-actions">
          <button type="button" className="hv-btn hv-btn-secondary" onClick={() => setConfirmingLogout(false)}>
            Stay
          </button>
          <button type="button" className="hv-btn hv-btn-danger" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </Modal>
    </ModeProvider>
  );
}

export default function AppShell({ modeKey }) {
  return (
    <RequireOnboarded>
      <Shell mode={MODES[modeKey]} />
    </RequireOnboarded>
  );
}
