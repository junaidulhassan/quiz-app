import { Link, useNavigate } from "react-router-dom";
import { getSession, SIGNUP_PREFILL_KEY } from "./env2/api/client.js";

const BENEFITS = [
  "Look up any tenant or roommate by email or Trust ID",
  "See how well you match a potential roommate",
  "Property managers: screen tenants and manage your properties",
];

function storePrefill(email, name) {
  try {
    sessionStorage.setItem(SIGNUP_PREFILL_KEY, JSON.stringify({ email: email || "", name: name || "" }));
  } catch {
    return;
  }
}

export default function AccessCallout({ email, name }) {
  const navigate = useNavigate();
  const signedIn = Boolean(getSession());

  function createAccount() {
    storePrefill(email, name);
    navigate("/create-account");
  }

  return (
    <section className="res-access" aria-labelledby="res-access-title">
      <p className="res-access-eyebrow">With Hyeve</p>
      <h2 className="res-access-title" id="res-access-title">Your result is just the start</h2>
      <p className="res-access-text">
        Create a free Hyeve account and put your Trust ID to work, whether you rent, share a home or manage properties.
      </p>
      <ul className="res-access-list">
        {BENEFITS.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>
      <div className="res-access-actions">
        {signedIn ? (
          <Link className="res-access-primary" to="/login">Open Hyeve</Link>
        ) : (
          <>
            <button type="button" className="res-access-primary" onClick={createAccount}>Create your account</button>
            <Link className="res-access-secondary" to="/login">Log in</Link>
          </>
        )}
      </div>
      {!signedIn && email && (
        <p className="res-access-note">Sign up with <strong>{email}</strong> so your roommate matches use this result.</p>
      )}
    </section>
  );
}
