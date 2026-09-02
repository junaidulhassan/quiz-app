import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import App from "./App.jsx";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import ProtectedRoute from "./Protectedroute.jsx";

function HomeButton() {
  const navigate = useNavigate();

  function handleHomeClick() {
    localStorage.removeItem("quiz_app_state_v1");
    navigate("/", { replace: true });
    window.location.reload();
  }

  return (
    <button
      type="button"
      className="home-fab"
      onClick={handleHomeClick}
      aria-label="Go back to start page"
      title="Go back to start page"
    >
      <img src="/logo/hyeve.png" alt="Hyeve logo" className="home-fab-logo" />
    </button>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <HomeButton />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);