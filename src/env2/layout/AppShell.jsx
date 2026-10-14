import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import useToast from "../hooks/useToast.js";
import ConfirmModal from "../components/lookup/ConfirmModal.jsx";
import LogoMark from "../components/lookup/LogoMark.jsx";
import { CloseIcon, HamburgerIcon } from "../components/LookupIcons.jsx";
import Toast from "../components/Toast.jsx";
import useIdleLogout from "../hooks/useIdleLogout.js";
import { RequireOnboarded } from "../routes/guards.jsx";
import { ModeProvider, MODES } from "./ModeContext.jsx";
import { ScopeContext } from "./ScopeContext.js";
import Sidebar, { ModeSelector, NavList, SidebarFooter } from "./Sidebar.jsx";
import "../styles/pages/landlord.css";
import "../styles/pages/roommate.css";

const WELCOME_KEY = "hyeve_show_welcome_toast";
const SECTIONS_KEPT_ON_SWITCH = ["search", "history", "qr-scan", "billing", "profile"];

function Shell({ mode }) {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [scope, setScope] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(WELCOME_KEY) !== "1") return;
      sessionStorage.removeItem(WELCOME_KEY);
      toast.show("Welcome to Hyeve! Your account is ready.", { icon: "success", duration: 5000 });
    } catch {
      return;
    }
  }, [toast]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

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
    navigate(`${next.base}/${SECTIONS_KEPT_ON_SWITCH.includes(section) ? section : "search"}`);
    setDrawerOpen(false);
  };

  const openLogout = () => {
    setDrawerOpen(false);
    setConfirmingLogout(true);
  };

  return (
    <ModeProvider value={mode}>
      <div className={mode.scope} ref={setScope}>
        <ScopeContext.Provider value={scope}>
          <div className="app-shell">
            <Sidebar onSelectMode={selectMode} onLogout={openLogout} />
            <div className="content-area">
              <header className="responsive-header">
                <div className="header-logo">
                  <LogoMark />
                </div>
                <ModeSelector onSelect={selectMode} />
                <button type="button" className="header-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
                  <HamburgerIcon />
                </button>
              </header>
              <main className="main-content">
                <div className="route-outlet" id="route-outlet">
                  <Outlet />
                </div>
              </main>
            </div>
          </div>

          <div
            className={`nav-drawer-overlay${drawerOpen ? " is-open" : ""}`}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setDrawerOpen(false);
            }}
          >
            <div className="nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation">
              <div className="nav-drawer-head">
                <div className="header-logo">
                  <LogoMark />
                </div>
                <button type="button" className="nav-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close navigation">
                  <CloseIcon />
                </button>
              </div>
              <NavList onNavigate={() => setDrawerOpen(false)} />
              <SidebarFooter onLogout={openLogout} />
            </div>
          </div>

          <ConfirmModal
            prefix="logout-modal"
            open={confirmingLogout}
            heading="Leaving Hyeve already?"
            subtext="You'll be signed out and can log back in anytime."
            dismissLabel="Cancel"
            confirmLabel="Log out"
            onDismiss={() => setConfirmingLogout(false)}
            onConfirm={handleLogout}
          />
          <Toast />
        </ScopeContext.Provider>
      </div>
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
