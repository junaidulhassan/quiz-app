import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import Spinner from "../components/Spinner.jsx";

function FullScreenLoader() {
  return (
    <div className="hv-fullscreen-loader">
      <Spinner dark />
    </div>
  );
}

export function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === "loading") return <FullScreenLoader />;
  if (status === "anonymous") return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function GuestOnly({ children }) {
  const { status, destination } = useAuth();
  if (status === "loading") return <FullScreenLoader />;
  if (status === "authenticated") return <Navigate to={destination} replace />;
  return children;
}

export function RequireOnboarded({ children }) {
  const { account, destination } = useAuth();
  if (!account.role || (account.role === "property_manager" && !account.onboarding_complete)) {
    return <Navigate to={destination} replace />;
  }
  return children;
}
