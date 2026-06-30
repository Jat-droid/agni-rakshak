import { useEffect, useState } from "react";
import { getSubscriptionPlans } from "../api/client";

export default function Subscription() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    getSubscriptionPlans().then(setPlans).catch(console.error);
  }, []);

  return (
    <div className="card">
      <h3>
        💳 Coverage Plans <span className="tag">FARM MONETIZATION</span>
      </h3>
      <div className="pricing-grid">
        {plans.map((plan) => (
          <div key={plan.tier} className={`price-card${plan.featured ? " featured" : ""}`}>
            {plan.featured && <span className="badge-pop">MOST POPULAR</span>}
            <div className="price-tier">{plan.tier}</div>
            <div className="price-amount">
              {plan.price} <span>{plan.priceSuffix}</span>
            </div>
            <ul className="price-feats">
              {plan.features.map((feat) => (
                <li key={feat}>{feat}</li>
              ))}
            </ul>
            <button className="btn-plan" type="button">
              {plan.tier === "Enterprise" ? "Contact Sales" : `Choose ${plan.tier}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
