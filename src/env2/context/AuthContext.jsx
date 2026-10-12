import { useCallback, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth.js";
import { clearSession, getSession, saveSession } from "../api/client.js";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => ({
    status: getSession() ? "loading" : "anonymous",
    account: null,
    propertySetup: null,
    destination: "/login",
  }));

  const applyPayload = useCallback((payload) => {
    setState({
      status: "authenticated",
      account: payload.account,
      propertySetup: payload.property_setup || null,
      destination: payload.destination,
    });
  }, []);

  const reset = useCallback(() => {
    clearSession();
    setState({ status: "anonymous", account: null, propertySetup: null, destination: "/login" });
  }, []);

  const refresh = useCallback(async () => {
    const payload = await authApi.fetchMe();
    applyPayload(payload);
    return payload;
  }, [applyPayload]);

  useEffect(() => {
    if (!getSession()) return undefined;
    let active = true;
    authApi
      .fetchMe()
      .then((payload) => {
        if (active) applyPayload(payload);
      })
      .catch(() => {
        if (active) reset();
      });
    return () => {
      active = false;
    };
  }, [applyPayload, reset]);

  useEffect(() => {
    window.addEventListener("hyeve:session-expired", reset);
    return () => window.removeEventListener("hyeve:session-expired", reset);
  }, [reset]);

  const startSession = useCallback(
    (payload) => {
      saveSession(payload.token, payload.expires_in);
      applyPayload(payload);
      return payload;
    },
    [applyPayload]
  );

  const login = useCallback(
    async (credentials) => startSession(await authApi.login(credentials)),
    [startSession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      reset();
    }
  }, [reset]);

  const value = useMemo(
    () => ({ ...state, applyPayload, startSession, login, logout, refresh, reset }),
    [state, applyPayload, startSession, login, logout, refresh, reset]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
