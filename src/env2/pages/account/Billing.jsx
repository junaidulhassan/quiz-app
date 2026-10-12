import { useEffect, useState } from "react";
import { BillingIcon } from "../../components/Icons.jsx";
import Spinner from "../../components/Spinner.jsx";
import useToast from "../../hooks/useToast.js";
import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import { fetchBilling } from "../../api/account.js";
import { formatNaira } from "../../utils/format.js";

function UsageMeter({ used, limit }) {
  const percent = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div className="hv-usage">
      <div className="hv-usage-head">
        <span>Profile lookups this month</span>
        <strong>
          {used} / {limit}
        </strong>
      </div>
      <div className="hv-usage-track" role="progressbar" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={used}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function Billing() {
  useDocumentTitle("Billing — Hyeve");
  const toast = useToast();
  const [billing, setBilling] = useState(null);

  useEffect(() => {
    let active = true;
    fetchBilling()
      .then((data) => active && setBilling(data))
      .catch((error) => active && toast.show(error.message));
    return () => {
      active = false;
    };
  }, [toast]);

  if (!billing) {
    return (
      <div className="hv-page-loader">
        <Spinner dark />
      </div>
    );
  }

  return (
    <div className="hv-simple-page">
      <h1 className="hv-page-heading">Billing</h1>
      <p className="hv-page-subtext">Track your lookups and see the plans that are coming to Hyeve.</p>
      <div className="hv-card">
        <h2 className="hv-card-heading">Current plan</h2>
        <p className="hv-muted-text">
          {billing.subscription ? billing.subscription.label : "No plan yet. Lookups are free while billing is being set up."}
        </p>
        <UsageMeter used={billing.lookups_this_month} limit={billing.lookup_limit} />
      </div>
      <div className="hv-plan-grid">
        {billing.plans.map((plan) => (
          <div key={plan.key} className="hv-card hv-plan-card">
            <h3 className="hv-card-heading">{plan.label}</h3>
            <p className="hv-plan-price">
              {formatNaira(plan.price)} <span>/ {plan.unit.replace("per ", "")}</span>
            </p>
            <button type="button" className="hv-btn hv-btn-secondary hv-btn-block" disabled>
              Coming soon
            </button>
          </div>
        ))}
      </div>
      <div className="hv-card">
        <h2 className="hv-card-heading">Payment History</h2>
        {billing.payments.length === 0 && (
          <div className="hv-empty-inline">
            <div className="hv-icon-badge">
              <BillingIcon width={24} height={24} />
            </div>
            <h3 className="hv-step-title">No payment history yet</h3>
            <p className="hv-muted-text">Your payments will appear here once plans are available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
