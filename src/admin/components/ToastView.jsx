export default function ToastView({ toast }) {
  return (
    <div id="toasts" role="status" aria-live="polite">
      {toast && (
        <div key={toast.id} className={`toast${toast.tone === "error" ? " e" : ""}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
