import Link from "next/link";
import { getPlanLabel, type Plan } from "@/lib/plan-features";

interface UpgradePromptProps {
  requiredPlan: Plan;
  featureName: string;
  featureDescription?: string;
}

export function UpgradePrompt({ requiredPlan, featureName, featureDescription }: UpgradePromptProps) {
  const planLabel = getPlanLabel(requiredPlan);

  return (
    <div
      style={{
        background: "var(--bg-raised)",
        border: "1px solid rgba(245,158,11,0.25)",
        borderRadius: "var(--radius-card)",
        padding: "2rem",
        textAlign: "center",
        maxWidth: 480,
        margin: "0 auto",
      }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "var(--amber-glow)",
          border: "1px solid rgba(245,158,11,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.25rem",
          fontSize: "1.1rem",
        }}>
        ◈
      </div>
      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--amber)",
          marginBottom: "0.5rem",
        }}>
        {planLabel} feature
      </p>
      <h3
        className="font-serif"
        style={{ fontSize: "1.3rem", color: "var(--text-1)", marginBottom: "0.5rem" }}>
        {featureName}
      </h3>
      {featureDescription && (
        <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          {featureDescription}
        </p>
      )}
      {!featureDescription && <div style={{ marginBottom: "1.5rem" }} />}
      <Link
        href="/dashboard/settings/billing"
        className="btn-primary"
        style={{ display: "inline-flex", textDecoration: "none" }}>
        Upgrade to {planLabel} →
      </Link>
      <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-3)" }}>
        14-day free trial · cancel any time
      </p>
    </div>
  );
}
