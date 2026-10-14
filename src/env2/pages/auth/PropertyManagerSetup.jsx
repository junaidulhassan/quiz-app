import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SearchableCombobox, SimpleDropdown } from "../../components/Combobox.jsx";
import Toast from "../../components/Toast.jsx";
import useAuth from "../../hooks/useAuth.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useToast from "../../hooks/useToast.js";
import { fetchPropertySetup, savePropertySetup } from "../../api/auth.js";
import locations from "../../data/nigeriaLocations.json";
import { digitsOnly, formatPrice } from "../../utils/format.js";
import "../../styles/pages/pm-setup.css";

const MIN_RENTAL_PRICE = 10000;
const PRICE_MESSAGE = "Enter an amount of at least ₦10,000.";

const ROOM_OPTIONS = [
  { value: "1", label: "1" },
  { value: "2-10", label: "2 to 10" },
  { value: "11-25", label: "11 to 25" },
  { value: "26-50", label: "26 to 50" },
  { value: "51-99", label: "51 to 99" },
  { value: "100+", label: "100+" },
];

const FREQUENCIES = [
  { value: "yearly", label: "Yearly" },
  { value: "daily", label: "Daily" },
];

const EMPTY_FORM = { phone: "", propertyName: "", state: "", lga: "", price: "", frequency: "yearly", rooms: "" };

function formatPhone(value) {
  const digits = digitsOnly(value).slice(0, 11);
  return [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 11)].filter(Boolean).join(" ");
}

const checks = {
  phone: (form) => digitsOnly(form.phone).length === 11,
  state: (form) => Boolean(form.state),
  lga: (form) => Boolean(form.lga),
  price: (form) => Number(digitsOnly(form.price)) >= MIN_RENTAL_PRICE,
  rooms: (form) => Boolean(form.rooms),
};

export default function PropertyManagerSetup() {
  useDocumentTitle("Property info — Hyeve");
  const { account, applyPayload } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [invalid, setInvalid] = useState({});
  const [priceMessage, setPriceMessage] = useState(PRICE_MESSAGE);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchPropertySetup()
      .then((saved) => {
        if (!active || !saved) return;
        setForm((current) => ({
          ...current,
          propertyName: saved.property_name || "",
          state: saved.state,
          lga: saved.lga,
          price: formatPrice(String(saved.rental_price)),
          frequency: saved.rental_frequency,
          rooms: saved.room_range,
        }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const lgas = useMemo(() => locations.lgas[form.state] || [], [form.state]);
  const valid = Object.values(checks).every((check) => check(form));

  if (account.role !== "property_manager") return <Navigate to="/select-role" replace />;
  if (account.onboarding_complete) return <Navigate to="/landlord/search" replace />;

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const flag = (field, state) => setInvalid((current) => ({ ...current, [field]: state }));

  const submit = async (event) => {
    event.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      const payload = await savePropertySetup({
        phone: digitsOnly(form.phone),
        property_name: form.propertyName.trim() || null,
        state: form.state,
        lga: form.lga,
        rental_price: Number(digitsOnly(form.price)),
        rental_frequency: form.frequency,
        room_range: form.rooms,
      });
      applyPayload(payload);
      sessionStorage.setItem("hyeve_show_welcome_toast", "1");
      navigate(payload.destination, { replace: true });
    } catch (error) {
      toast.show(error.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="pg-pm-setup">
      <main className="auth-page">
        <div className="logo-mark" aria-hidden="true">
          <img src="/logo/hyeve-new-logo.png" alt="" width="58" height="58" />
        </div>
        <div className="auth-wrap">
          <div className="auth-card">
            <div className="progress-track" role="img" aria-label="Onboarding step 2 of 2">
              <span className="progress-segment" />
              <span className="progress-segment is-active" />
            </div>

            <span className="role-badge">Property Manager</span>
            <h1 className="heading">Enter Property Info</h1>
            <p className="subtext">Information will be used to increase property visibility</p>

            <hr className="divider" />

            <form onSubmit={submit} noValidate>
              <div className={`field${invalid.phone ? " invalid" : ""}`}>
                <label htmlFor="phone">
                  Phone Number <span className="req">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="0000 000 0000"
                  maxLength={13}
                  value={form.phone}
                  disabled={submitting}
                  onChange={(event) => {
                    const phone = formatPhone(event.target.value);
                    set("phone", phone);
                    if (digitsOnly(phone).length === 11) flag("phone", false);
                  }}
                  onKeyPress={(event) => {
                    if (event.key.length === 1 && !/[0-9]/.test(event.key)) event.preventDefault();
                  }}
                  onBlur={() => flag("phone", !checks.phone(form))}
                  required
                />
                <span className="error-msg">Phone number must be exactly 11 digits.</span>
              </div>

              <div className="field">
                <label htmlFor="property-name">
                  Property Name <span className="optional">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="property-name"
                  name="propertyName"
                  placeholder="e.g Sunrise Court Apartments"
                  autoComplete="off"
                  maxLength={120}
                  value={form.propertyName}
                  disabled={submitting}
                  onChange={(event) => set("propertyName", event.target.value)}
                />
              </div>

              <div className="field-row">
                <div className={`field${invalid.state ? " invalid" : ""}`}>
                  <label htmlFor="state-input">
                    Property Location <span className="req">*</span>
                  </label>
                  <SearchableCombobox
                    id="state-input"
                    ariaLabel="Nigerian states"
                    options={locations.states}
                    value={form.state}
                    placeholder="Select State"
                    emptyLabel="No matching state"
                    disabled={submitting}
                    onSelect={(state) => {
                      setForm((current) => ({ ...current, state, lga: "" }));
                      if (state) flag("state", false);
                    }}
                  />
                  <span className="error-msg">Select a property location.</span>
                </div>
                <div className={`field${invalid.lga ? " invalid" : ""}`}>
                  <label htmlFor="lga-input">
                    Property LGA <span className="req">*</span>
                  </label>
                  <SearchableCombobox
                    id="lga-input"
                    ariaLabel="Local government areas"
                    options={lgas}
                    value={form.lga}
                    placeholder={form.state ? "Select LGA" : "Select a state first"}
                    emptyLabel="No matching LGA"
                    disabled={submitting || !form.state}
                    onSelect={(lga) => {
                      set("lga", lga);
                      if (lga) flag("lga", false);
                    }}
                  />
                  <span className="error-msg">Select a property LGA.</span>
                </div>
              </div>

              <div className={`field${invalid.price ? " invalid" : ""}`}>
                <label htmlFor="price">
                  Rental Price per room (&#8358;) <span className="req">*</span>
                </label>
                <div className="price-wrap">
                  <input
                    type="text"
                    id="price"
                    name="price"
                    inputMode="numeric"
                    placeholder="e.g 500,000"
                    autoComplete="off"
                    value={form.price}
                    disabled={submitting}
                    onChange={(event) => {
                      const digits = digitsOnly(event.target.value);
                      set("price", formatPrice(digits));
                      if (digits && Number(digits) >= MIN_RENTAL_PRICE) flag("price", false);
                    }}
                    onKeyPress={(event) => {
                      if (event.key.length === 1 && !/[0-9]/.test(event.key)) event.preventDefault();
                    }}
                    onBlur={() => {
                      setPriceMessage(PRICE_MESSAGE);
                      flag("price", !checks.price(form));
                    }}
                  />
                  <div className="frequency-toggle" role="radiogroup" aria-label="Rental price frequency">
                    {FREQUENCIES.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        className={`frequency-option${form.frequency === item.value ? " is-selected" : ""}`}
                        role="radio"
                        aria-checked={form.frequency === item.value}
                        disabled={submitting}
                        onClick={() => set("frequency", item.value)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="error-msg">{priceMessage}</span>
              </div>

              <div className={`field${invalid.rooms ? " invalid" : ""}`}>
                <label htmlFor="rooms-trigger">
                  Total no. of rooms <span className="req">*</span>
                </label>
                <SimpleDropdown
                  id="rooms-trigger"
                  ariaLabel="Total number of rooms"
                  options={ROOM_OPTIONS}
                  value={form.rooms}
                  placeholder="Select rooms"
                  disabled={submitting}
                  onSelect={(rooms) => {
                    set("rooms", rooms);
                    flag("rooms", false);
                  }}
                />
                <span className="error-msg">Select the total number of rooms.</span>
              </div>

              <button type="submit" className="btn-primary" id="submit-btn" disabled={!valid || submitting}>
                {submitting && <span className="spinner" aria-hidden="true" />}
                <span>{submitting ? "Finishing setup…" : "Finish Setup"}</span>
              </button>
              <p className="sr-only" role="status" aria-live="polite">
                {submitting ? "Finishing setup…" : ""}
              </p>
            </form>
          </div>
        </div>
      </main>
      <Toast />
    </div>
  );
}
