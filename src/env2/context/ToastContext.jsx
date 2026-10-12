import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToastContext } from "./toastContext.js";

export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setVisible(false);
  }, []);

  const show = useCallback((text) => {
    clearTimeout(timer.current);
    setMessage(text);
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), 5000);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={`hv-toast${visible ? " is-visible" : ""}`} role="status" aria-live="polite">
        <p className="hv-toast-message">{message}</p>
        <button type="button" className="hv-toast-close" onClick={hide} aria-label="Dismiss notification">
          &times;
        </button>
      </div>
    </ToastContext.Provider>
  );
}
