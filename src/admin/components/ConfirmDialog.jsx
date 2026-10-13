import { useState } from "react";
import Modal from "./Modal.jsx";
import Spinner from "./Spinner.jsx";

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
      <p className="adm-modal-text">{body}</p>
      <div className="adm-modal-actions">
        <button type="button" className="adm-btn" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button type="button" className={`adm-btn ${danger ? "is-danger" : "is-primary"}`} onClick={run} disabled={busy}>
          {busy && <Spinner light={!danger} />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
