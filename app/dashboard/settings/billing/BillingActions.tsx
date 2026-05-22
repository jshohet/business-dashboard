"use client";

import { useState } from "react";

const PLANS = [
  {
    key: "starter" as const,
    label: "Starter",
    price: "$49/mo",
    locations: "1 location",
    features: ["KPI dashboard", "Ordering cadence", "Weekly email alerts"],
  },
  {
    key: "operator" as const,
    label: "Operator",
    price: "$99/mo",
    locations: "Up to 5 locations",
    features: ["Everything in Starter", "AI drift analysis", "AI ordering", "Multi-location view"],
  },
  {
    key: "enterprise" as const,
    label: "Enterprise",
    price: "$299/mo",
    locations: "6–50 locations",
    features: ["Everything in Operator", "AI weekly ops report", "AI coaching scripts", "API/CSV integrations"],
  },
];

interface BillingActionsProps {
  currentPlan: string;
  subscriptionStatus: string;
  hasStripeCustomer: boolean;
}

export function BillingActions({ currentPlan, subscriptionStatus, hasStripeCustomer }: BillingActionsProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActive = ["active", "trialing", "past_due"].includes(subscriptionStatus);

  async function handleUpgrade(plan: string) {
    setError(null);
    setLoadingPlan(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    setLoadingPlan(null);
    if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
    window.location.href = data.url;
  }

  async function handleManageBilling() {
    setError(null);
    setLoadingPortal(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    setLoadingPortal(false);
    if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
    window.location.href = data.url;
  }

  return (
    <div>
      {error && (
        <p className="alert-error" style={{ marginBottom: "1.5rem" }}>{error}</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key && isActive;
          return (
            <div
              key={plan.key}
              className="card-static"
              style={{
                padding: "1.5rem",
                border: isCurrent ? "1px solid var(--amber)" : "1px solid var(--border)",
                position: "relative",
              }}>
              {isCurrent && (
                <span style={{
                  position: "absolute",
                  top: "-1px",
                  right: "1rem",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--amber)",
                  background: "var(--amber-glow)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "0 0 4px 4px",
                }}>
                  Current plan
                </span>
              )}
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-1)", marginBottom: "0.25rem" }}>{plan.label}</p>
              <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-1)", marginBottom: "0.2rem" }}>{plan.price}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "1rem" }}>{plan.locations}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.25rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>+ {f}</li>
                ))}
              </ul>
              {isCurrent ? (
                <button className="btn-ghost" style={{ width: "100%", opacity: 0.5 }} disabled>
                  Active
                </button>
              ) : (
                <button
                  className="btn-primary"
                  style={{ width: "100%" }}
                  disabled={loadingPlan !== null}
                  onClick={() => handleUpgrade(plan.key)}>
                  {loadingPlan === plan.key ? "Redirecting…" : "Select plan"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {hasStripeCustomer && (
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginBottom: "0.75rem" }}>
            Manage your payment method, download invoices, or cancel your subscription via the Stripe customer portal.
          </p>
          <button className="btn-ghost" onClick={handleManageBilling} disabled={loadingPortal}>
            {loadingPortal ? "Redirecting…" : "Manage billing →"}
          </button>
        </div>
      )}
    </div>
  );
}
