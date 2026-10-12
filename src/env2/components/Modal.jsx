import { useEffect, useId } from "react";

export default function Modal({ open, title, children, onClose }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="hv-modal-overlay" onMouseDown={onClose}>
      <div
        className="hv-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="hv-modal-heading">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
