import { useEffect, useRef, useState } from "react";
import { BillingIcon } from "../../components/LookupIcons.jsx";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { useMode } from "../../layout/ModeContext.jsx";
import { fetchBilling } from "../../api/account.js";

function PlanCard({ label, price, unit, badge, onGet }) {
  return (
    <div className="profile-card">
      <div className="profile-delete-row">
        <div className="profile-delete-text">
          <p className="billing-plan-label">
            {badge ? (
              <>
                <span className="billing-plan-label-text">{label}</span> <span className="billing-discount-badge">{badge}</span>
              </>
            ) : (
              label
            )}
          </p>
          <p className="billing-plan-price">
            <span className="billing-price-amount">{price}</span>
            <span className="billing-price-unit">{unit}</span>
          </p>
        </div>
        <button type="button" className="profile-save-button" onClick={onGet}>
          Get Plan
        </button>
      </div>
    </div>
  );
}

export default function Billing() {
  useDocumentTitle("Billing — Hyeve");
  const mode = useMode();
  const toast = useToast();
  const [billing, setBilling] = useState(null);
  const plans = useRef(null);

  useEffect(() => {
    let active = true;
    fetchBilling()
      .then((data) => active && setBilling(data))
      .catch((error) => active && toast.show(error.message));
    return () => {
      active = false;
    };
  }, [toast]);

  const unavailable = () => toast.show("Plans aren't available yet. We'll let you know when they are.");
  const used = billing ? billing.lookups_this_month : 0;
  const limit = billing ? billing.lookup_limit : 100;
  const percent = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="billing-page">
      <div className="billing-content">
        <h1 className="profile-heading">Billing</h1>
        <p className="profile-subtext">Manage your plan, payment method, and invoice history.</p>

        <div className="billing-plans-row" id="billing-plans" ref={plans}>
          <PlanCard label="Basic Plan" price="₦2,000" unit="/ Profile" onGet={unavailable} />
          <PlanCard label="Growth Plan" price="₦20,000" unit="/ month" badge="25% OFF RENEWAL" onGet={unavailable} />
        </div>

        <div className="profile-card">
          <div className="billing-lookups-row">
            <span className="billing-lookups-label">Profile lookups this month</span>
            <span className="billing-lookups-count">
              {used} / {limit}
            </span>
          </div>
          <div className="billing-progress-track">
            <div className="billing-progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="profile-card">
          <h2 className="profile-card-heading" style={{ marginBottom: 20 }}>
            Payment History
          </h2>
          <div className="billing-payment-empty">
            <div className="billing-payment-empty-icon">
              <BillingIcon />
            </div>
            <h3 className="billing-payment-empty-heading">No payment history yet</h3>
            <p className="billing-payment-empty-description">{mode.paymentEmpty}</p>
            <button
              type="button"
              className="billing-payment-empty-button"
              id="billing-payment-get-plan"
              onClick={() => plans.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              Get Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
