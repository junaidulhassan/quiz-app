export function LoadingBlock() {
  return (
    <div role="status" aria-label="Loading">
      <div className="sk" />
      <div className="sk" style={{ width: "60%" }} />
      <div className="sk" />
    </div>
  );
}

export function EmptyBlock({ title, text, action }) {
  return (
    <div className="state card">
      <h3>{title}</h3>
      {text}
      {action && (
        <>
          <br />
          <br />
          {action}
        </>
      )}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }) {
  return (
    <div className="state card" role="alert">
      <h3>Something went wrong</h3>
      {message}
      {onRetry && (
        <>
          <br />
          <br />
          <button type="button" className="btn" onClick={onRetry}>
            Try again
          </button>
        </>
      )}
    </div>
  );
}
