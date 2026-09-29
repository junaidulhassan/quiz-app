import { Navigate } from "react-router-dom";
import { getSession } from "./session";

export default function ProtectedRoute({ children }) {
  if (!getSession()) {
    return <Navigate to="/lsysadmin/login" replace />;
  }
  return children;
}
