import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

const navItems = [
  { href: "/dashboard",            label: "Overview",   icon: "◈" },
  { href: "/dashboard/analytics",  label: "Analytics",  icon: "↗" },
  { href: "/dashboard/scheduling", label: "Scheduling", icon: "◷" },
  { href: "/dashboard/inventory",  label: "Inventory",  icon: "▦" },
  { href: "/dashboard/efficiency", label: "Efficiency", icon: "◎" },
  { href: "/dashboard/sales",      label: "Sales",      icon: "+" },
  { href: "/dashboard/employees",  label: "Team",       icon: "◯" },
];

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
    select: { id: true, name: true, subscriptionStatus: true },
  });

  const isSubscribed = isSuperuser || store?.subscriptionStatus === "active";

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(11,12,15,0.92)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}>
        {/* Amber accent bar */}
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
                StorePilot
              </p>
              <p style={{ fontSize: "0.65rem", color: "var(--text-3)", letterSpacing: "0.06em" }}>
                {store?.name ?? session.user.email}
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-0.5 overflow-x-auto pb-0">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {isSubscribed ? (
              <span className="badge-active hidden sm:inline-flex">
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#14b8a6", display: "inline-block" }} />
                {isSuperuser ? "Admin" : "Pro"}
              </span>
            ) : (
              <Link
                href="/pricing"
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
                Upgrade $5/mo
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

      {/* Paywall gate */}
      {!isSubscribed ? (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, transparent 60%)",
            borderBottom: "1px solid rgba(245,158,11,0.15)",
            padding: "0.75rem 1.5rem",
            textAlign: "center",
          }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>
            You&apos;re on the free plan.{" "}
            <Link
              href="/pricing"
              style={{ color: "var(--amber)", fontWeight: 600, textDecoration: "underline" }}>
              Subscribe for $5/month
            </Link>{" "}
            to unlock full access to all modules.
          </p>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
        {children}
      </main>
    </div>
  );
}
