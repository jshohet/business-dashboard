import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPlanLabel } from "@/lib/plan-features";
import { BillingActions } from "./BillingActions";
import { differenceInDays } from "date-fns";

const STATUS_LABELS: Record<string, string> = {
  active:    "Active",
  trialing:  "Trial",
  past_due:  "Past due",
  canceled:  "Canceled",
  unpaid:    "Unpaid",
  inactive:  "Inactive",
};

const STATUS_COLORS: Record<string, string> = {
  active:   "var(--green, #22c55e)",
  trialing: "var(--amber)",
  past_due: "var(--red, #ef4444)",
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId as string },
    select: {
      plan: true,
      subscriptionStatus: true,
      subscriptionPeriodEnd: true,
      stripeCustomerId: true,
    },
  });

  if (!store) redirect("/login");

  const status = store.subscriptionStatus ?? "inactive";
  const isTrialing = status === "trialing";
  const trialDaysLeft = isTrialing && store.subscriptionPeriodEnd
    ? Math.max(0, differenceInDays(new Date(store.subscriptionPeriodEnd), new Date()))
    : null;

  const statusColor = STATUS_COLORS[status] ?? "var(--text-3)";
  const statusLabel = STATUS_LABELS[status] ?? status;

  return (
    <div className="anim-fade-up" style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.4rem" }}>
          Settings
        </p>
        <h1 className="font-serif" style={{ fontSize: "1.9rem", color: "var(--text-1)" }}>
          Billing
        </h1>
      </div>

      {/* Current plan summary */}
      <div className="card-static" style={{ padding: "1.5rem", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.3rem" }}>
            Current plan
          </p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-1)" }}>
            {getPlanLabel(store.plan)}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: statusColor }}>
            {statusLabel}
          </span>
          {trialDaysLeft !== null && (
            <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "0.15rem" }}>
              {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left in trial
            </p>
          )}
          {store.subscriptionPeriodEnd && !isTrialing && (
            <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "0.15rem" }}>
              Renews {new Date(store.subscriptionPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "1rem" }}>
        Choose a plan
      </p>
      <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginBottom: "1.5rem" }}>
        All plans include a 14-day free trial. Cancel anytime.
      </p>

      <BillingActions
        currentPlan={store.plan}
        subscriptionStatus={status}
        hasStripeCustomer={!!store.stripeCustomerId}
      />
    </div>
  );
}
