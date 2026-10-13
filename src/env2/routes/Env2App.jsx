import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import { ToastProvider } from "../context/ToastContext.jsx";
import AppShell from "../layout/AppShell.jsx";
import Billing from "../pages/account/Billing.jsx";
import AccountProfile from "../pages/account/Profile.jsx";
import CheckEmail from "../pages/auth/CheckEmail.jsx";
import CreateAccount from "../pages/auth/CreateAccount.jsx";
import CreateNewPassword from "../pages/auth/CreateNewPassword.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import Login from "../pages/auth/Login.jsx";
import NotFound from "../pages/auth/NotFound.jsx";
import PropertyManagerSetup from "../pages/auth/PropertyManagerSetup.jsx";
import SelectRole from "../pages/auth/SelectRole.jsx";
import VerifyEmail from "../pages/auth/VerifyEmail.jsx";
import DataPolicy from "../pages/policies/DataPolicy.jsx";
import ServiceTerms from "../pages/policies/ServiceTerms.jsx";
import History from "../pages/lookup/History.jsx";
import QrScan from "../pages/lookup/QrScan.jsx";
import RoommateProfile from "../pages/lookup/RoommateProfile.jsx";
import Search from "../pages/lookup/Search.jsx";
import TenantProfile from "../pages/lookup/TenantProfile.jsx";
import { GuestOnly, RequireAuth } from "./guards.jsx";
import "../styles/index.css";

function lookupRoutes(profilePath, ProfilePage) {
  return (
    <>
      <Route index element={<Navigate to="search" replace />} />
      <Route path="search" element={<Search />} />
      <Route path={`${profilePath}/:id`} element={<ProfilePage />} />
      <Route path="history" element={<History />} />
      <Route path="qr-scan" element={<QrScan />} />
      <Route path="billing" element={<Billing />} />
      <Route path="profile" element={<AccountProfile />} />
    </>
  );
}

export default function Env2App() {
  useEffect(() => {
    document.body.classList.add("hv-env2");
    return () => document.body.classList.remove("hv-env2");
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <div className="hv-root">
          <Routes>
            <Route path="login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="create-account" element={<GuestOnly><CreateAccount /></GuestOnly>} />
            <Route path="forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
            <Route path="privacy" element={<DataPolicy />} />
            <Route path="terms" element={<ServiceTerms />} />
            <Route path="check-email" element={<CheckEmail />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="create-new-password" element={<CreateNewPassword />} />
            <Route path="select-role" element={<RequireAuth><SelectRole /></RequireAuth>} />
            <Route path="property-manager-setup" element={<RequireAuth><PropertyManagerSetup /></RequireAuth>} />
            <Route path="landlord" element={<RequireAuth><AppShell key="tenant" modeKey="tenant" /></RequireAuth>}>
              {lookupRoutes("tenants", TenantProfile)}
            </Route>
            <Route path="roommate" element={<RequireAuth><AppShell key="roommate" modeKey="roommate" /></RequireAuth>}>
              {lookupRoutes("roommates", RoommateProfile)}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
