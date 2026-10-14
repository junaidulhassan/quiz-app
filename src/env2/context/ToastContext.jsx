import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToastContext, ToastStateContext } from "./toastContext.js";

const IDLE = { message: "", icon: null, action: null, visible: false };

export function ToastProvider({ children }) {
  const [state, setState] = useState(IDLE);
  const timer = useRef(null);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setState((current) => ({ ...current, visible: false }));
  }, []);

  const show = useCallback((message, { duration = 5000, icon = null, action = null } = {}) => {
    clearTimeout(timer.current);
    setState({ message, icon, action, visible: true });
    timer.current = setTimeout(() => setState((current) => ({ ...current, visible: false })), duration);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const api = useMemo(() => ({ show, hide }), [show, hide]);
  const view = useMemo(() => ({ ...state, hide }), [state, hide]);

  return (
    <ToastContext.Provider value={api}>
      <ToastStateContext.Provider value={view}>{children}</ToastStateContext.Provider>
    </ToastContext.Provider>
  );
}
