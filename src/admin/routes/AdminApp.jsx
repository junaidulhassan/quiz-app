import { useCallback, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../../session.js";
import { EmptyBlock } from "../components/StateBlock.jsx";
import { SECTIONS } from "../config/sections.js";
import AdminProvider from "../context/AdminProvider.jsx";
import useAdmin from "../hooks/useAdmin.js";
import AdminShell from "../layout/AdminShell.jsx";
import Admins from "../pages/Admins.jsx";
import DataManagement from "../pages/DataManagement.jsx";
import AdminLogin from "../pages/Login.jsx";
import Overview from "../pages/Overview.jsx";
import RecordsPage from "../pages/records/RecordsPage.jsx";
import Reports from "../pages/Reports.jsx";
import Settings from "../pages/Settings.jsx";
import "../styles/index.css";

const CUSTOM_PAGES = {
  overview: Overview,
  reports: Reports,
  data: DataManagement,
  admins: Admins,
  settings: Settings,
};

function Allowed({ section, children }) {
  const { me } = useAdmin();
  if (!me.permissions.view.includes(section.key)) {
    return (
      <EmptyBlock
        title="Access restricted"
        text={`Your role (${me.role}) cannot open ${section.label}. Ask a Super Admin if you need access.`}
      />
    );
  }
  return children;
}

function SessionGate({ children }) {
  const location = useLocation();
  if (!getSession()) return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

function SignedInShell() {
  const navigate = useNavigate();
  const signedOut = useCallback(() => {
    clearSession();
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    window.addEventListener("hyeve-admin:signed-out", signedOut);
    return () => window.removeEventListener("hyeve-admin:signed-out", signedOut);
  }, [signedOut]);

  return (
    <AdminProvider onSignedOut={signedOut}>
      <AdminShell />
    </AdminProvider>
  );
}

export default function AdminApp() {
  useEffect(() => {
    document.body.classList.add("adm-env");
    return () => document.body.classList.remove("adm-env");
  }, []);

  return (
    <div className="adm-root">
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route
          element={
            <SessionGate>
              <SignedInShell />
            </SessionGate>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          {SECTIONS.map((section) => {
            const Page = CUSTOM_PAGES[section.key];
            return (
              <Route
                key={section.key}
                path={section.path}
                element={<Allowed section={section}>{Page ? <Page /> : <RecordsPage section={section} />}</Allowed>}
              />
            );
          })}
          <Route path="*" element={<EmptyBlock title="Page not found" text="That admin page doesn't exist." />} />
        </Route>
      </Routes>
    </div>
  );
}
