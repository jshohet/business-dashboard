import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CheckoutButton from "./checkout-button";

export default async function PricingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const superuserEmails = (process.env.SUPERUSER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (superuserEmails.includes((session.user.email ?? "").toLowerCase())) {
    redirect("/dashboard");
  }

  const store = await prisma.store.findUnique({
    where: { id: (session.user as { storeId?: string }).storeId ?? "" },
    select: { id: true, subscriptionStatus: true },
  });

  if (store?.subscriptionStatus === "active") {
    redirect("/dashboard");
  }

  return (
    <main
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}>

      {/* Background glow */}
      <div aria-hidden style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 400, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", textAlign: "center", maxWidth: 480, width: "100%" }}>

        {/* Header */}
        <div className="anim-fade-up" style={{ marginBottom: "3rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 52, height: 52, borderRadius: 14, background: "var(--amber)",
            marginBottom: "1.5rem",
          }}>
            <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "#000" }}>S</span>
          </div>
          <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.5rem" }}>
            StoreOps
          </p>
          <h1 className="font-serif" style={{ fontSize: "2.8rem", fontWeight: 600, color: "var(--text-1)", lineHeight: 1.1 }}>
            Unlock your<br />
            <span style={{ color: "var(--amber)" }}>full dashboard</span>
          </h1>
          <p style={{ marginTop: "1rem", color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            One flat price. All modules. Cancel any time.
          </p>
        </div>

        {/* Pricing card */}
        <div
          className="anim-fade-up anim-delay-1"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "2.25rem",
            position: "relative",
            overflow: "hidden",
          }}>

          {/* Amber top accent */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, var(--amber) 0%, transparent 70%)",
          }} />

          {/* Price */}
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: "0.25rem" }}>
              <span style={{ fontSize: "1.1rem", color: "var(--text-2)", fontWeight: 500, marginTop: "0.4rem" }}>$</span>
              <span className="font-mono" style={{ fontSize: "4rem", fontWeight: 600, color: "var(--text-1)", lineHeight: 1 }}>5</span>
              <span style={{ fontSize: "0.9rem", color: "var(--text-3)", alignSelf: "flex-end", marginBottom: "0.4rem" }}>/month</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "0.5rem" }}>
              Billed monthly · cancel anytime
            </p>
          </div>

          {/* Feature list */}
          <ul style={{ textAlign: "left", marginBottom: "1.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[
              "Sales analytics with trend detection",
              "AI-powered weekly scheduling",
              "Inventory demand forecasting",
              "Waste & labor efficiency tracking",
              "Multi-tenant store isolation",
              "Unlimited data entries",
            ].map((feat) => (
              <li key={feat} style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.85rem", color: "var(--text-2)" }}>
                <span style={{ color: "#14b8a6", fontSize: "0.75rem" }}>✓</span>
                {feat}
              </li>
            ))}
          </ul>

          <CheckoutButton storeId={store?.id ?? ""} />
        </div>

        {/* Back link */}
        <p className="anim-fade-up anim-delay-2" style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--text-3)" }}>
          <Link href="/dashboard" style={{ color: "var(--text-2)", textDecoration: "none" }}>
            ← Continue with limited access
          </Link>
        </p>
      </div>
    </main>
  );
}
