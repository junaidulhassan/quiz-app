import { Navigate } from "react-router-dom";

function getSession() {
  const session = localStorage.getItem("dashboard_session");
  return session ? JSON.parse(session) : null;
}

export default function ProtectedRoute({ children }) {
  const session = getSession();
  if (!session || !session.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}