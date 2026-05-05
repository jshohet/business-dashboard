import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function SubscribeSuccessPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}>

      {/* Background glow */}
      <div aria-hidden style={{
        position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 400, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(20,184,166,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div
        className="anim-fade-up"
        style={{
          textAlign: "center",
          maxWidth: 400,
          position: "relative",
        }}>

        {/* Check circle */}
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(20,184,166,0.12)",
          border: "2px solid rgba(20,184,166,0.3)",
          marginBottom: "1.75rem",
          fontSize: "1.8rem",
        }}>
          ✓
        </div>

        <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.5rem" }}>
          You&apos;re in
        </p>
        <h1 className="font-serif" style={{ fontSize: "2.4rem", fontWeight: 600, color: "var(--text-1)", lineHeight: 1.1 }}>
          Subscription<br />
          <span style={{ color: "#14b8a6" }}>activated!</span>
        </h1>
        <p style={{ marginTop: "1rem", color: "var(--text-2)", fontSize: "0.88rem", lineHeight: 1.65 }}>
          Your StoreOps Pro subscription is now active. All modules are unlocked.
        </p>

        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            href="/dashboard"
            className="btn-primary"
            style={{ display: "flex", justifyContent: "center", textDecoration: "none", padding: "0.875rem" }}>
            Go to Dashboard →
          </Link>
          <p style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
            It may take a few seconds for your status to update.
          </p>
        </div>
      </div>
    </main>
  );
}
