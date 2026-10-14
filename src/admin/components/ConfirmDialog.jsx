import { useState } from "react";
import Modal from "./Modal.jsx";

export default function ConfirmDialog({ title, body, confirmLabel, danger = true, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <p>{body}</p>
      <div className="ft">
        <button type="button" className="btn" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button type="button" className={`btn ${danger ? "dg" : "pr"}`} onClick={run} disabled={busy}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
