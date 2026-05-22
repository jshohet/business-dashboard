import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPlanLabel } from "@/lib/plan-features";

const navItems = [
  { href: "/dashboard",           label: "Dashboard" },
  { href: "/dashboard/locations", label: "Locations" },
  { href: "/dashboard/kpi",       label: "KPI Entry" },
  { href: "/dashboard/reports",   label: "AI Reports" },
  { href: "/dashboard/ordering",  label: "Ordering" },
  { href: "/dashboard/settings",  label: "Settings" },
];

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const superuserEmails = (process.env.SUPERUSER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isSuperuser = superuserEmails.includes(
    (session.user.email ?? "").toLowerCase(),
  );

  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId as string },
    select: { id: true, name: true, plan: true, subscriptionStatus: true, subscriptionPeriodEnd: true },
  });

  const isActive = isSuperuser || ACTIVE_STATUSES.has(store?.subscriptionStatus ?? "");
  const isTrialing = store?.subscriptionStatus === "trialing";
  const planLabel = isSuperuser ? "Admin" : getPlanLabel(store?.plan ?? "starter");

  // Days remaining in trial
  let trialDaysLeft: number | null = null;
  if (isTrialing && store?.subscriptionPeriodEnd) {
    const diff = store.subscriptionPeriodEnd.getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)" }}>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(11,12,15,0.92)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}>
        <div className="amber-bar" />

        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "var(--amber)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <span style={{ color: "#000", fontWeight: 800, fontSize: "0.85rem" }}>S</span>
            </div>
            <div>
              <p
                className="font-serif"
                style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-1)", lineHeight: 1.1 }}>
                StoreOps
              </p>
              <p style={{ fontSize: "0.65rem", color: "var(--text-3)", letterSpacing: "0.06em" }}>
                {store?.name ?? session.user.email}
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav aria-label="Dashboard navigation" className="flex items-center gap-0.5 overflow-x-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
            {isSuperuser && (
              <Link href="/dashboard/admin/waitlist" className="nav-link" style={{ color: "var(--amber)" }}>
                Waitlist
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {isActive ? (
              isSuperuser ? (
                <Link href="/dashboard/admin/waitlist" className="badge-active hidden sm:inline-flex" style={{ textDecoration: "none" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#14b8a6", display: "inline-block" }} />
                  {planLabel}
                </Link>
              ) : (
              <span className="badge-active hidden sm:inline-flex">
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#14b8a6", display: "inline-block" }} />
                {planLabel}
              </span>
              )
            ) : (
              <Link
                href="/dashboard/settings/billing"
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  padding: "0.25rem 0.75rem",
                  borderRadius: 6,
                  background: "var(--amber-glow)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  color: "var(--amber)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}>
                Upgrade →
              </Link>
            )}
            <form action={signOutAction}>
              <button className="btn-ghost" style={{ fontSize: "0.78rem", padding: "0.4rem 0.9rem" }}>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Trial countdown banner */}
      {isTrialing && trialDaysLeft !== null && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, transparent 60%)",
            borderBottom: "1px solid rgba(245,158,11,0.15)",
            padding: "0.6rem 1.5rem",
            textAlign: "center",
          }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>
            {trialDaysLeft > 0
              ? <>Trial ends in <strong style={{ color: "var(--amber)" }}>{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}</strong>. {" "}</>
              : <>Your trial ends today. {" "}</>}
            <Link href="/dashboard/settings/billing" style={{ color: "var(--amber)", fontWeight: 600, textDecoration: "underline" }}>
              Add a payment method
            </Link>
          </p>
        </div>
      )}

      {/* No subscription banner */}
      {!isActive && !isTrialing && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, transparent 60%)",
            borderBottom: "1px solid rgba(245,158,11,0.15)",
            padding: "0.75rem 1.5rem",
            textAlign: "center",
          }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>
            <Link
              href="/dashboard/settings/billing"
              style={{ color: "var(--amber)", fontWeight: 600, textDecoration: "underline" }}>
              Choose a plan
            </Link>
            {" "}to unlock KPI tracking, AI drift analysis, and ordering recommendations.
          </p>
        </div>
      )}

      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
        {children}
      </main>
    </div>
  );
}
