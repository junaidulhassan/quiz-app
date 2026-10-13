import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../../components/AuthShell.jsx";
import Spinner from "../../components/Spinner.jsx";
import { SelectField, TextField } from "../../components/TextField.jsx";
import useAuth from "../../hooks/useAuth.js";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { fetchPropertySetup, savePropertySetup } from "../../api/auth.js";
import locations from "../../data/nigeriaLocations.json";
import { digitsOnly, formatPhone, formatPrice } from "../../utils/format.js";

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

const EMPTY_FORM = {
  phone: "",
  propertyName: "",
  state: "",
  lga: "",
  price: "",
  frequency: "yearly",
  rooms: "",
};

function validate(form) {
  const errors = {};
  const phone = digitsOnly(form.phone);
  if (phone.length < 10 || phone.length > 13) errors.phone = "Enter a valid phone number.";
  if (!form.state) errors.state = "Select the property's state.";
  if (!form.lga) errors.lga = "Select the property's LGA.";
  if (Number(digitsOnly(form.price)) < 10000) errors.price = "Enter an amount of at least ₦10,000.";
  if (!form.rooms) errors.rooms = "Select the total number of rooms.";
  return errors;
}

export default function PropertyManagerSetup() {
  useDocumentTitle("Property info — Hyeve");
  const { account, applyPayload } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
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

  if (account.role !== "property_manager") return <Navigate to="/select-role" replace />;
  if (account.onboarding_complete) return <Navigate to="/landlord/search" replace />;

  const set = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

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
      toast.show(error.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell progress={{ step: 2, total: 2 }}>
      <h1 className="hv-heading">Enter Property Info</h1>
      <p className="hv-subtext">Tell us a little about the property you manage.</p>
      <form onSubmit={submit} noValidate>
        <TextField
          label="Phone Number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="0000 000 0000"
          maxLength={13}
          value={form.phone}
          onChange={(event) => set("phone", formatPhone(event.target.value))}
          error={errors.phone}
          required
        />
        <TextField
          label="Property Name"
          optional
          placeholder="e.g Sunrise Court Apartments"
          autoComplete="off"
          maxLength={120}
          value={form.propertyName}
          onChange={(event) => set("propertyName", event.target.value)}
        />
        <SelectField
          label="Property Location"
          value={form.state}
          onChange={(event) => {
            set("state", event.target.value);
            set("lga", "");
          }}
          error={errors.state}
          required
        >
          <option value="">Select State</option>
          {locations.states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Property LGA"
          value={form.lga}
          onChange={(event) => set("lga", event.target.value)}
          disabled={!form.state}
          error={errors.lga}
          required
        >
          <option value="">{form.state ? "Select LGA" : "Select a state first"}</option>
          {lgas.map((lga) => (
            <option key={lga} value={lga}>
              {lga}
            </option>
          ))}
        </SelectField>
        <div className={`hv-field${errors.price ? " is-invalid" : ""}`}>
          <label htmlFor="hv-price">
            Rental Price per room (₦)<span className="hv-req">*</span>
          </label>
          <div className="hv-price-row">
            <input
              id="hv-price"
              inputMode="numeric"
              placeholder="e.g 500,000"
              autoComplete="off"
              value={form.price}
              onChange={(event) => set("price", formatPrice(event.target.value))}
            />
            <div className="hv-segmented" role="radiogroup" aria-label="Rental frequency">
              {FREQUENCIES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={form.frequency === item.value}
                  className={form.frequency === item.value ? "is-selected" : ""}
                  onClick={() => set("frequency", item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {errors.price && <p className="hv-error">{errors.price}</p>}
        </div>
        <SelectField
          label="Total no. of rooms"
          value={form.rooms}
          onChange={(event) => set("rooms", event.target.value)}
          error={errors.rooms}
          required
        >
          <option value="">Select rooms</option>
          {ROOM_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </SelectField>
        <p className="hv-hint">
          By finishing setup you agree to the <Link to="/landlord-terms">Landlord Terms and Acknowledgment</Link>.
        </p>
        <button type="submit" className="hv-btn hv-btn-primary hv-btn-block" disabled={submitting}>
          {submitting && <Spinner />}
          {submitting ? "Finishing setup…" : "Finish Setup"}
        </button>
      </form>
    </AuthShell>
  );
}
