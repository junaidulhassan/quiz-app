export default function ToastView({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`adm-toast is-${toast.tone}`} role="status" aria-live="polite">
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
}
