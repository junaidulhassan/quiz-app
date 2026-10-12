export default function ToastView({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`ad-toast is-${toast.tone}`} role="status" aria-live="polite">
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
}
