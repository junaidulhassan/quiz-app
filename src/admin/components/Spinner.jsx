export default function Spinner({ light = false }) {
  return <span className={`adm-spinner${light ? " is-light" : ""}`} aria-hidden="true" />;
}
