export default function Spinner({ dark = false }) {
  return <span className={`hv-spinner${dark ? " is-dark" : ""}`} aria-hidden="true" />;
}
