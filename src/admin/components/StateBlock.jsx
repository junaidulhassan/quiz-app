import Spinner from "./Spinner.jsx";

export function LoadingBlock({ label = "Loading…" }) {
  return (
    <div className="ad-state" role="status">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

export function EmptyBlock({ title, text, action }) {
  return (
    <div className="ad-state">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }) {
  return (
    <div className="ad-state is-error" role="alert">
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="ad-btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
