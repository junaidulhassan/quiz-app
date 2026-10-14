import { useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { ScopeContext } from "../../layout/ScopeContext.js";

export default function ConfirmModal({ prefix, open, heading, subtext, dismissLabel, confirmLabel, dismissKind = "cancel", onDismiss, onConfirm }) {
  const scope = useContext(ScopeContext);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  const modal = (
    <div
      className={`${prefix}-overlay${open ? " is-open" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      <div
        className={prefix}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${prefix}-heading`}
        aria-describedby={`${prefix}-subtext`}
      >
        <h2 className={`${prefix}-heading`} id={`${prefix}-heading`}>
          {heading}
        </h2>
        <p className={`${prefix}-subtext`} id={`${prefix}-subtext`}>
          {subtext}
        </p>
        <div className={`${prefix}-actions`}>
          <button type="button" className={`${prefix}-${dismissKind}`} onClick={onDismiss}>
            {dismissLabel}
          </button>
          <button type="button" className={`${prefix}-confirm`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return scope ? createPortal(modal, scope) : modal;
}
