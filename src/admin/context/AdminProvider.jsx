import { useCallback, useEffect, useMemo, useState } from "react";
import { clearSession, SessionExpiredError } from "../../session.js";
import { adminLogout, fetchMe } from "../api/adminApi.js";
import { AdminContext } from "./adminContext.js";

export default function AdminProvider({ children, onSignedOut }) {
  const [state, setState] = useState({ status: "loading", me: null, error: "" });

  useEffect(() => {
    let active = true;
    fetchMe()
      .then((me) => active && setState({ status: "ready", me, error: "" }))
      .catch((error) => {
        if (!active) return;
        if (error instanceof SessionExpiredError) {
          onSignedOut();
          return;
        }
        setState({ status: "error", me: null, error: error.message });
      });
    return () => {
      active = false;
    };
  }, [onSignedOut]);

  const signOut = useCallback(async () => {
    await adminLogout();
    clearSession();
    onSignedOut();
  }, [onSignedOut]);

  const value = useMemo(() => ({ ...state, signOut }), [state, signOut]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
