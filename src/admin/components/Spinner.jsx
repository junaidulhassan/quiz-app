export default function Spinner({ light = false }) {
  return <span className={`ad-spinner${light ? " is-light" : ""}`} aria-hidden="true" />;
}
